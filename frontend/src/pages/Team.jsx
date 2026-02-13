import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Team = () => {
  const { user, logout } = useContext(AuthContext);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [newUser, setNewUser] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'user'
  });

  // --- FETCH MEMBERS FUNCTION ---
  const fetchMembers = async (isInitialLoad = false) => {
    if (isInitialLoad) setLoading(true); // Only show big loader on first visit
    try {
      const tId = user.tenantId || user.tenant_id;
      const response = await api.get(`/tenants/${tId}/users`);
      setMembers(response.data.data.users);
    } catch (error) {
      toast.error('Failed to load team members');
    } finally {
      if (isInitialLoad) setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.tenantId || user?.tenant_id) {
      fetchMembers(true);
    }
  }, [user]);

  // --- ADD MEMBER FUNCTION ---
  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      const tId = user.tenantId || user.tenant_id;
      await api.post(`/tenants/${tId}/users`, newUser);
      toast.success('Team member added successfully!');
      setNewUser({ fullName: '', email: '', password: '', role: 'user' });
      fetchMembers(); // <--- No argument = No loading spinner!
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add user');
    }
  };

  // --- DELETE FUNCTION ---
  const handleDeleteMember = async (memberId) => {
    if(!window.confirm("Are you sure you want to remove this user?")) return;
    
    try {
      await api.delete(`/users/${memberId}`);
      toast.success("User removed");
      fetchMembers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove user");
    }
  };

  return (
    <div className="app-layout">
      {/* SIDEBAR */}
      <div className="sidebar">
        <div style={{fontSize: '1.5rem', fontWeight: '700', marginBottom: '40px'}}>SaaS Platform</div>
        <nav style={{ flex: 1 }}>
          <Link to="/dashboard" className="sidebar-link">Dashboard</Link>
          <Link to="/team" className="sidebar-link active">Team Members</Link>
          <Link to="/settings" className="sidebar-link">Settings</Link>
        </nav>
        <div style={{borderTop: '1px solid #374151', paddingTop: '20px'}}>
           <div style={{fontWeight: '600'}}>{user?.fullName}</div>
           <button onClick={logout}  className="btn" style={{background: '#374151'}}>Logout</button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="main-content">
        <div className="page-header">
          <div>
            <h1 style={{margin: 0}}>Team Members</h1>
            <p style={{color: '#6b7280', marginTop: '5px'}}>Manage who has access to your workspace</p>
          </div>
          <div style={{background: '#e0e7ff', color: '#4338ca', padding: '8px 16px', borderRadius: '8px', fontWeight: '600', fontSize: '0.9rem'}}>
            {members.length} Active Users
          </div>
        </div>

        <div className="split-view">
          
          {/* LEFT: Members List */}
          <div className="task-list-container">
            <h3 style={{marginTop: 0}}>Current Team</h3>
            {loading ? <p>Loading...</p> : members.length === 0 ? (
               <p>No members found.</p>
            ) : (
              members.map((member) => (
                <div key={member.id} className="task-card">
                  <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '50%', 
                      background: member.role === 'tenant_admin' ? '#4f46e5' : '#e5e7eb', 
                      color: member.role === 'tenant_admin' ? 'white' : '#374151',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                    }}>
                      {member.full_name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <h4 style={{margin: '0 0 2px 0'}}>{member.full_name}</h4>
                      <div style={{fontSize: '0.85rem', color: '#6b7280'}}>{member.email}</div>
                    </div>
                  </div>
                  
                  <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                    <span className={`badge ${member.role === 'tenant_admin' ? 'badge-in_progress' : 'badge-todo'}`}>
                      {member.role === 'tenant_admin' ? 'Admin' : 'User'}
                    </span>

                    {/* ONLY SHOW DELETE BUTTON FOR ADMINS (AND NOT SELF) */}
                    {user?.role === 'tenant_admin' && user?.id !== member.id && (
                      <button 
                        onClick={() => handleDeleteMember(member.id)}
                        style={{background:'#fee2e2', color:'#b91c1c', border:'none', padding:'6px 10px', borderRadius:'6px', cursor:'pointer', fontSize:'0.8rem', fontWeight:'600'}}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* RIGHT: Add Member Form (Only visible to Admins) */}
          {user?.role === 'tenant_admin' ? (
            <div className="add-task-sidebar">
              <h3 style={{marginTop: 0, marginBottom: '20px'}}>Add New Member</h3>
              <form onSubmit={handleAddMember}>
                <div className="input-group">
                  <label>Full Name</label>
                  <input type="text" value={newUser.fullName} onChange={(e) => setNewUser({...newUser, fullName: e.target.value})} required />
                </div>
                <div className="input-group">
                  <label>Email Address</label>
                  <input type="email" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} required />
                </div>
                <div className="input-group">
                  <label>Temporary Password</label>
                  <input type="password" value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} required />
                </div>
                <div className="input-group">
                  <label>Role</label>
                  <select value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value})}>
                    <option value="user">Regular User</option>
                    <option value="tenant_admin">Admin</option>
                  </select>
                </div>
                <button type="submit" className="btn">Add Member</button>
              </form>
            </div>
          ) : (
            <div className="add-task-sidebar" style={{textAlign:'center', color:'#6b7280'}}>
              <p>Only Admins can add new users.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Team;