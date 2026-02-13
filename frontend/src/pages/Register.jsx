import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';

const Register = () => {
  const [formData, setFormData] = useState({ tenantName: '', subdomain: '', adminFullName: '', adminEmail: '', adminPassword: '' });
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register-tenant', formData);
      toast.success('Registration successful!');
      navigate('/login');
    } catch (error) { toast.error(error.response?.data?.message); }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '500px' }}>
        <div className="auth-header">
          <h1>Get Started</h1>
          <p>Create your new organization</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
            <div className="input-group">
              <label>Company Name</label>
              <input type="text" name="tenantName" required onChange={handleChange} />
            </div>
            <div className="input-group">
              <label>Subdomain</label>
              <input type="text" name="subdomain" required onChange={handleChange} />
            </div>
          </div>
          <div className="input-group">
            <label>Admin Name</label>
            <input type="text" name="adminFullName" required onChange={handleChange} />
          </div>
          <div className="input-group">
            <label>Admin Email</label>
            <input type="email" name="adminEmail" required onChange={handleChange} />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input type="password" name="adminPassword" required onChange={handleChange} />
          </div>
          <button type="submit" className="btn">Register</button>
        </form>
        <p style={{textAlign: 'center', marginTop: '20px', fontSize: '0.9rem', color: '#666'}}>
          Already registered? <Link to="/login" style={{color: '#4f46e5', fontWeight: 'bold'}}>Login</Link>
        </p>
      </div>
    </div>
  );
};
export default Register;    