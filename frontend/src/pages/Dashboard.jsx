import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [loading, setLoading] = useState(true);

  // Initial Load Only
  useEffect(() => { 
    fetchProjects(true); 
  }, []);

  const fetchProjects = async (isInitialLoad = false) => {
    if (isInitialLoad) setLoading(true);
    try {
      const response = await api.get('/projects');
      setProjects(response.data.data.projects);
    } catch (error) { 
      toast.error('Failed to load projects'); 
    } finally { 
      if (isInitialLoad) setLoading(false); 
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    
    try {
      await api.post('/projects', { name: newProjectName });
      toast.success('Project created!');
      setNewProjectName('');
      fetchProjects(); // Update list without full page reload
    } catch (error) { 
      toast.error(error.response?.data?.message || 'Failed to create project'); 
    }
  };

  // DELETE FUNCTION
  const handleDeleteProject = async (e, id) => {
    e.preventDefault(); 
    e.stopPropagation(); 
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await api.delete(`/projects/${id}`);
        toast.success('Project deleted');
        fetchProjects(); // Update list without full page reload
      } catch (error) {
        toast.error('Failed to delete project');
      }
    }
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <div className="sidebar">
        <div style={{fontSize: '1.5rem', fontWeight: '700', marginBottom: '40px'}}>SaaS Platform</div>
        <nav style={{ flex: 1 }}>
          <Link to="/dashboard" className="sidebar-link active">Dashboard</Link>
          <Link to="/team" className="sidebar-link">Team Members</Link>
          <Link to="/settings" className="sidebar-link">Settings</Link>
        </nav>
        <div style={{borderTop: '1px solid #374151', paddingTop: '20px'}}>
          <div style={{fontWeight: '600'}}>{user?.fullName}</div>
          <div style={{fontSize: '0.8rem', color: '#9ca3af', marginBottom: '10px'}}>{user?.tenant?.name}</div>
          <button onClick={logout} className="btn" style={{background: '#374151'}}>Logout</button>
        </div>
      </div>

      <div className="main-content">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 style={{margin: '0', fontSize: '1.5rem'}}>Projects</h1>
            <p style={{margin: '5px 0 0', color: '#6b7280'}}>Manage your ongoing work</p>
          </div>
          
          <form onSubmit={handleCreateProject} className="create-form">
            <input 
              type="text" 
              placeholder="New Project Name..." 
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              style={{width: '250px'}}
            />
            <button type="submit" className="btn" style={{width: 'auto', whiteSpace: 'nowrap'}}>+ Create</button>
          </form>
        </div>

        {/* Projects Grid */}
        {loading ? <p>Loading...</p> : (
          <div className="grid-container">
            {projects.map((project) => (
              <Link to={`/projects/${project.id}`} key={project.id} className="project-card">
                
                {/* Card Header: Icon, Status, and Delete Button */}
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '15px'}}>
                   <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                      <div style={{width:'40px', height:'40px', borderRadius:'10px', background:'#e0e7ff', color:'#4f46e5', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold', fontSize:'1.1rem'}}>
                        {project.name.charAt(0).toUpperCase()}
                      </div>
                      <span className={`badge badge-${project.status}`}>{project.status}</span>
                   </div>
                   
                   {/* Delete Button */}
                   <button 
                     onClick={(e) => handleDeleteProject(e, project.id)}
                     style={{background:'none', border:'none', color:'#ef4444', cursor:'pointer', fontSize:'1.5rem', lineHeight: '1', padding:'0 5px'}}
                     title="Delete Project"
                   >
                     &times;
                   </button>
                </div>

                {/* PROJECT NAME */}
                <h3 style={{margin: '0 0 10px 0', fontSize: '1.2rem', color: '#1f2937'}}>{project.name}</h3>
                
                {/* Description */}
                <p style={{color: '#6b7280', fontSize: '0.9rem', minHeight: '40px', margin: '0 0 15px 0'}}>
                  {project.description || 'No description provided.'}
                </p>
                
                {/* Footer: Task Count */}
                <div style={{borderTop: '1px solid #f3f4f6', paddingTop: '15px', fontSize: '0.85rem', color: '#6b7280', fontWeight: '600'}}>
                  {project.task_count || 0} Tasks
                </div>
              </Link>
            ))}
            
            {projects.length === 0 && (
               <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px', border: '2px dashed #e5e7eb'}}>
                 <h3>No projects found</h3>
               </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default Dashboard;