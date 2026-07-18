import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, { username, password });
      const { token } = res.data;
      
      // Save token in localStorage and configure Axios
      localStorage.setItem('rl_annotate_token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      onLoginSuccess();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h2 className="login-title">Admin Access Gateway</h2>
        <p className="login-subtitle">Please sign in to manage the RLHF pipeline</p>
        
        {error && <div className="login-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input 
              type="text" 
              id="username" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              placeholder="Enter administrator username"
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Enter access password"
              required 
            />
          </div>
          
          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Authenticating...' : 'Unlock Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
