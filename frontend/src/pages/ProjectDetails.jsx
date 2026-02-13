import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

const ProjectDetails = () => {
  const { id } = useParams();
  const { user, logout } = useContext(AuthContext);
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState({ title: '', priority: 'medium' });

  // Use the flag approach
  const fetchData = async (isInitialLoad = false) => {
    if (isInitialLoad) setLoading(true);
    try {
      const [projectRes, tasksRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/projects/${id}/tasks`)
      ]);
      setProject(projectRes.data.data);
      setTasks(tasksRes.data.data.tasks);
    } catch (error) {
      console.error(error);
    } finally {
      if (isInitialLoad) setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchData(true);
  }, [id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/projects/${id}/tasks`, newTask);
      toast.success('Task added');
      setNewTask({ title: '', priority: 'medium' });
      fetchData(); // Refresh list without loading spinner
    } catch (error) { 
      toast.error('Failed to add task'); 
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      fetchData(); // Refresh list without loading spinner
    } catch (error) { toast.error('Update failed'); }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Delete this task?')) {
      try {
        await api.delete(`/tasks/${taskId}`);
        toast.success('Task deleted');
        fetchData(); 
      } catch (error) {
        toast.error('Failed to delete task');
      }
    }
  };

  if (loading || !project) return <div style={{padding: '50px'}}>Loading...</div>;

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <div className="sidebar">
        <div style={{fontSize: '1.5rem', fontWeight: '700', marginBottom: '40px'}}>SaaS Platform</div>
        <nav style={{ flex: 1 }}>
          <Link to="/dashboard" className="sidebar-link">← Back</Link>
          <div className="sidebar-link active" style={{marginTop: '10px'}}>Current Project</div>
        </nav>
        <div style={{borderTop: '1px solid #374151', paddingTop: '20px'}}>
           <div style={{fontWeight: '600'}}>{user?.fullName}</div>
           <button onClick={logout} className="btn" style={{background: '#374151'}}>Logout</button>
        </div>
      </div>

      <div className="main-content">
        {/* Header */}
        <div className="page-header" style={{flexDirection: 'column', alignItems: 'flex-start'}}>
          <div style={{display:'flex', justifyContent:'space-between', width:'100%', alignItems:'center'}}>
            <h1 style={{margin: 0, fontSize: '1.5rem'}}>{project.name}</h1>
            <span className={`badge badge-${project.status}`}>{project.status}</span>
          </div>
          <p style={{color: '#6b7280', marginTop: '5px'}}>{project.description || 'No description provided.'}</p>
        </div>
        
        {/* Split View */}
        <div className="split-view">
          
          {/* Left: Task List */}
          <div className="task-list-container">
            <h3 style={{marginTop: 0}}>Tasks ({tasks.length})</h3>
            {tasks.length === 0 ? (
              <div style={{textAlign:'center', padding:'40px', background:'white', borderRadius:'10px', border:'1px dashed #e5e7eb', color:'#9ca3af'}}>
                No tasks yet.
              </div>
            ) : (
              tasks.map(task => (
                <div key={task.id} className="task-card">
                    <div>
                        <h4 style={{margin: '0 0 5px 0'}}>{task.title}</h4>
                        <div style={{fontSize: '0.85rem', color: '#6b7280'}}>
                        {task.assignee_name ? `👤 ${task.assignee_name}` : 'Unassigned'}
                        </div>
                    </div>
                    <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                        <span className={`badge badge-${task.priority}`} style={{fontSize:'0.7rem'}}>
                        {task.priority}
                        </span>
                        <select 
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        style={{width: 'auto', padding: '6px', fontSize: '0.85rem'}}
                        >
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Done</option>
                        </select>
                        
                        <button 
                        onClick={() => handleDeleteTask(task.id)}
                        style={{background:'#fee2e2', color:'#b91c1c', border:'none', borderRadius:'6px', width:'28px', height:'28px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', paddingBottom:'4px'}}
                        title="Delete Task"
                        >
                        &times;
                        </button>
                    </div>
                </div>
              ))
            )}
          </div>

          {/* Right: Add Task Form */}
          <div className="add-task-sidebar">
            <h3 style={{marginTop: 0, marginBottom: '20px'}}>Add New Task</h3>
            <form onSubmit={handleCreateTask}>
              <div className="input-group">
                <label>Task Title</label>
                <input 
                  type="text" 
                  value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  placeholder="e.g. Fix Homepage" required
                />
              </div>
              <div className="input-group">
                <label>Priority</label>
                <select 
                  value={newTask.priority} onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <button type="submit" className="btn">Add Task</button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};
export default ProjectDetails;