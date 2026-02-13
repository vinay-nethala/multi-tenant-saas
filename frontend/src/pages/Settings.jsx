import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';

const Settings = () => {
  const { user, logout } = useContext(AuthContext);
  const [fullData, setFullData] = useState(null);

  // Fetch fresh data to get Plan Limits
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get('/auth/me');
        setFullData(data.data);
      } catch (err) {
        console.error("Failed to load settings data");
      }
    };
    fetchData();
  }, []);

  // Calculate usage percentages (mock logic if data missing, or real if available)
  const tenant = fullData?.tenant || {};
  const plan = tenant.subscription_plan || 'Free';
  const userLimit = tenant.max_users || 5;
  const projectLimit = tenant.max_projects || 3;

  return (
    <div className="app-layout">
      {/* SIDEBAR */}
      <div className="sidebar">
        <div style={{fontSize: '1.5rem', fontWeight: '700', marginBottom: '40px'}}>SaaS Platform</div>
        <nav style={{ flex: 1 }}>
          <Link to="/dashboard" className="sidebar-link">Dashboard</Link>
          <Link to="/team" className="sidebar-link">Team Members</Link>
          <Link to="/settings" className="sidebar-link active">Settings</Link>
        </nav>
        <div style={{borderTop: '1px solid #374151', paddingTop: '20px'}}>
           <div style={{fontWeight: '600'}}>{user?.fullName}</div>
           <button onClick={logout} className="btn" style={{background: '#374151'}}>Logout</button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="main-content">
        <div className="page-header">
          <div>
            <h1 style={{margin: 0}}>Settings</h1>
            <p style={{color: '#6b7280', marginTop: '5px'}}>Manage your profile and workspace preferences</p>
          </div>
        </div>

        <div className="grid-container" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))'}}>
          
          {/* CARD 1: PERSONAL PROFILE */}
          <div className="project-card" style={{cursor: 'default', transform: 'none'}}>
            <div style={{borderBottom: '1px solid #f3f4f6', paddingBottom: '15px', marginBottom: '20px'}}>
              <h3 style={{margin: 0}}>My Profile</h3>
              <p style={{margin: '5px 0 0', color: '#6b7280', fontSize: '0.9rem'}}>Your personal account details</p>
            </div>
            
            <div style={{display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '25px'}}>
              <div style={{
                width: '70px', height: '70px', borderRadius: '50%', background: '#4f46e5', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 'bold'
              }}>
                {user?.fullName?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 style={{margin: 0}}>{user?.fullName}</h3>
                <div style={{color: '#6b7280'}}>{user?.email}</div>
                <div className={`badge badge-active`} style={{display: 'inline-block', marginTop: '8px'}}>
                  {user?.role === 'tenant_admin' ? 'Organization Admin' : 'Team Member'}
                </div>
              </div>
            </div>

            <form>
               <div className="input-group">
                 <label>Full Name</label>
                 <input type="text" defaultValue={user?.fullName} className="form-input" disabled />
                 <small style={{color: '#9ca3af'}}>Contact admin to change details</small>
               </div>
               <div className="input-group">
                 <label>Email</label>
                 <input type="email" defaultValue={user?.email} className="form-input" disabled />
               </div>
            </form>
          </div>

          {/* CARD 2: ORGANIZATION & PLAN */}
          <div className="project-card" style={{cursor: 'default', transform: 'none'}}>
            <div style={{borderBottom: '1px solid #f3f4f6', paddingBottom: '15px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between'}}>
              <div>
                <h3 style={{margin: 0}}>Organization</h3>
                <p style={{margin: '5px 0 0', color: '#6b7280', fontSize: '0.9rem'}}>Workspace and subscription</p>
              </div>
              <span className="badge badge-in_progress" style={{height: 'fit-content', fontSize: '0.8rem'}}>
                {plan.toUpperCase()} PLAN
              </span>
            </div>

            <div className="input-group">
              <label>Workspace Name</label>
              <input type="text" defaultValue={tenant.name} className="form-input" disabled />
            </div>

            <div className="input-group">
              <label>Subdomain</label>
              <div style={{display: 'flex', alignItems: 'center'}}>
                 <input type="text" defaultValue={tenant.subdomain} className="form-input" disabled style={{borderTopRightRadius: 0, borderBottomRightRadius: 0}} />
                 <div style={{background: '#f3f4f6', border: '1px solid #e5e7eb', borderLeft: 'none', padding: '10px 15px', borderTopRightRadius: '8px', borderBottomRightRadius: '8px', color: '#6b7280'}}>
                   .saas.com
                 </div>
              </div>
            </div>

            {/* USAGE LIMITS SECTION */}
            <div style={{marginTop: '30px', background: '#f9fafb', padding: '15px', borderRadius: '8px', border: '1px solid #e5e7eb'}}>
              <h4 style={{margin: '0 0 15px 0', fontSize: '0.9rem', color: '#374151'}}>Plan Usage</h4>
              
              {/* Projects Limit */}
              <div style={{marginBottom: '15px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '5px'}}>
                  <span>Projects</span>
                  <span style={{fontWeight: 'bold'}}>Limit: {projectLimit}</span>
                </div>
                <div style={{width: '100%', height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden'}}>
                  <div style={{width: '40%', height: '100%', background: '#4f46e5'}}></div>
                </div>
              </div>

              {/* Users Limit */}
              <div>
                <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '5px'}}>
                  <span>Team Members</span>
                  <span style={{fontWeight: 'bold'}}>Limit: {userLimit}</span>
                </div>
                <div style={{width: '100%', height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden'}}>
                  <div style={{width: '20%', height: '100%', background: '#10b981'}}></div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;