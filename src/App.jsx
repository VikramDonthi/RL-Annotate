import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StatCards from './components/StatCards';
import IngestionForm from './components/IngestionForm';
import ReviewTable from './components/ReviewTable';
import PromptTuner from './components/PromptTuner';
import Login from './components/Login';
import { API_BASE_URL } from './config';

// Configure initial Axios auth token if it exists in local storage
const token = localStorage.getItem('rl_annotate_token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);
  const [annotations, setAnnotations] = useState([]);
  const [stats, setStats] = useState({ total_processed: 0, pending_reviews: 0, ai_accuracy: '0%' });

  const fetchData = async () => {
    try {
      const annRes = await axios.get(`${API_BASE_URL}/api/annotations`);
      setAnnotations(annRes.data);
    } catch (error) {
      console.error("Error fetching annotations:", error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    }

    try {
      const statsRes = await axios.get(`${API_BASE_URL}/api/annotations/stats`);
      setStats(statsRes.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const handleNewAnnotation = (newAnn) => {
    setAnnotations([newAnn, ...annotations]);
    fetchData(); // Refresh stats
  };

  const handleVerify = (updatedAnn) => {
    setAnnotations(annotations.map(a => a._id === updatedAnn._id ? updatedAnn : a));
    fetchData(); // Refresh stats
  };

  const handleLogout = () => {
    localStorage.removeItem('rl_annotate_token');
    delete axios.defaults.headers.common['Authorization'];
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="app-container">
      <div className="header-actions">
        <header className="header">
          <h1>RL-Annotate Dashboard</h1>
          <p className="header-subtitle">AI-Driven Data Reinforcement & Verification Pipeline</p>
        </header>
        <button className="btn btn-outline" onClick={handleLogout}>Log Out</button>
      </div>

      <main className="grid">
        <StatCards stats={stats} />
        
        <div className="grid grid-cols-2" style={{ marginTop: '1rem', gridTemplateColumns: '1fr', gap: '2rem' }}>
          <IngestionForm onNewAnnotation={handleNewAnnotation} />
        </div>

        <PromptTuner />

        <ReviewTable annotations={annotations} onVerify={handleVerify} />
      </main>
    </div>
  );
}

export default App;
