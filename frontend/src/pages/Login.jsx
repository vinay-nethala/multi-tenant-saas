import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '', tenantSubdomain: '' });
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', formData);
      login(response.data.data.token, response.data.data.user);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) { toast.error(error.response?.data?.message || 'Login failed'); }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Login</h1>
          <p>Access your workspace</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email Address</label>
            <input type="email" name="email" required onChange={handleChange} placeholder="name@company.com" />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input type="password" name="password" required onChange={handleChange} placeholder="••••••••" />
          </div>
          <div className="input-group">
            <label>Organization ID (Subdomain)</label>
            <input type="text" name="tenantSubdomain" required onChange={handleChange} placeholder="e.g. demo" />
          </div>
          <button type="submit" className="btn">Sign In</button>
        </form>
        <p style={{textAlign: 'center', marginTop: '20px', fontSize: '0.9rem', color: '#666'}}>
          No account? <Link to="/register" style={{color: '#4f46e5', fontWeight: 'bold'}}>Create Organization</Link>
        </p>
      </div>
    </div>
  );
};
export default Login;