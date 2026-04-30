import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StatCards from './components/StatCards';
import IngestionForm from './components/IngestionForm';
import ReviewTable from './components/ReviewTable';
import PromptTuner from './components/PromptTuner';

function App() {
  const [annotations, setAnnotations] = useState([]);
  const [stats, setStats] = useState({ total_processed: 0, pending_reviews: 0, ai_accuracy: '0%' });

  const fetchData = async () => {
    try {
      const annRes = await axios.get('http://localhost:5000/api/annotations');
      setAnnotations(annRes.data);
    } catch (error) {
      console.error("Error fetching annotations:", error);
    }

    try {
      const statsRes = await axios.get('http://localhost:5000/api/annotations/stats');
      setStats(statsRes.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchData();
    // In a real app, we might use WebSockets for real-time updates. Polling is okay for demo.
  }, []);

  const handleNewAnnotation = (newAnn) => {
    setAnnotations([newAnn, ...annotations]);
    fetchData(); // Refresh stats
  };

  const handleVerify = (updatedAnn) => {
    setAnnotations(annotations.map(a => a._id === updatedAnn._id ? updatedAnn : a));
    fetchData(); // Refresh stats
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>RL-Annotate Dashboard</h1>
        <p className="header-subtitle">AI-Driven Data Reinforcement & Verification Pipeline</p>
      </header>

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
