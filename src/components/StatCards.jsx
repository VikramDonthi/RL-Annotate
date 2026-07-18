import React from 'react';
import { Database, Activity, Target } from 'lucide-react';

const StatCards = ({ stats }) => {
  return (
    <div className="grid grid-cols-3">
      <div className="glass-card stat-card">
        <div className="stat-icon">
          <Database size={24} />
        </div>
        <div className="stat-content">
          <h3>Total Processed</h3>
          <p>{stats.total_processed || 0}</p>
        </div>
      </div>
      
      <div className="glass-card stat-card">
        <div className="stat-icon" style={{ color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)' }}>
          <Activity size={24} />
        </div>
        <div className="stat-content">
          <h3>Pending Review</h3>
          <p>{stats.pending_reviews || 0}</p>
        </div>
      </div>

      <div className="glass-card stat-card">
        <div className="stat-icon" style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)' }}>
          <Target size={24} />
        </div>
        <div className="stat-content">
          <h3>AI Accuracy</h3>
          <p>{stats.ai_accuracy || '0%'}</p>
        </div>
      </div>
    </div>
  );
};

export default StatCards;
