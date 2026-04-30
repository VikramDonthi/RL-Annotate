import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Edit2 } from 'lucide-react';
import axios from 'axios';

const getBadgeClass = (label) => {
  const normalized = label?.toLowerCase();
  if (normalized === 'bug') return 'badge-bug';
  if (normalized === 'feature') return 'badge-feature';
  if (normalized === 'urgent') return 'badge-urgent';
  if (normalized === 'question') return 'badge-question';
  if (normalized === 'feedback') return 'badge-feedback';
  return 'badge-default';
};

const ReviewTable = ({ annotations, onVerify }) => {
  const [editingId, setEditingId] = useState(null);
  const [editLabel, setEditLabel] = useState('');

  const handleVerify = async (id, finalLabel) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/annotations/${id}/verify`, {
        label: finalLabel
      });
      onVerify(response.data);
      setEditingId(null);
    } catch (error) {
      console.error("Error verifying annotation:", error);
    }
  };

  return (
    <div className="glass-card" style={{ marginTop: '2rem' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>HITL Review & Verification</h2>
        <span className="badge badge-default">RLHF Workflow</span>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '30%' }}>Input Text</th>
              <th style={{ width: '15%' }}>AI Label</th>
              <th style={{ width: '25%' }}>AI Reasoning</th>
              <th style={{ width: '15%' }}>Status</th>
              <th style={{ width: '15%' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {annotations.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                  No data processed yet. Ingest some text above.
                </td>
              </tr>
            ) : (
              annotations.map((item) => (
                <tr key={item._id}>
                  <td>
                    <div style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.text_input}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${getBadgeClass(item.ai_prediction.label)}`}>
                      {item.ai_prediction.label}
                    </span>
                  </td>
                  <td>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {item.ai_prediction.reasoning}
                    </p>
                  </td>
                  <td>
                    {item.human_correction.verified ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--success)' }}>
                        <CheckCircle size={16} />
                        <span style={{ fontSize: '0.85rem' }}>
                          Verified ({item.accuracy_score === 1 ? 'Match' : 'Corrected'})
                        </span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--warning)' }}>
                        <AlertCircle size={16} />
                        <span style={{ fontSize: '0.85rem' }}>Awaiting Verification</span>
                      </div>
                    )}
                  </td>
                  <td>
                    {!item.human_correction.verified && editingId !== item._id ? (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          className="btn btn-sm btn-outline" 
                          style={{ borderColor: 'var(--success)', color: 'var(--success)' }}
                          onClick={() => handleVerify(item._id, item.ai_prediction.label)}
                          title="Confirm AI Prediction"
                        >
                          <CheckCircle size={14} />
                        </button>
                        <button 
                          className="btn btn-sm btn-outline"
                          onClick={() => {
                            setEditingId(item._id);
                            setEditLabel(item.ai_prediction.label);
                          }}
                          title="Override Label"
                        >
                          <Edit2 size={14} />
                        </button>
                      </div>
                    ) : editingId === item._id ? (
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <select 
                          className="form-select"
                          value={editLabel} 
                          onChange={(e) => setEditLabel(e.target.value)}
                        >
                          <option value="Bug">Bug</option>
                          <option value="Feature">Feature</option>
                          <option value="Urgent">Urgent</option>
                          <option value="Question">Question</option>
                          <option value="Feedback">Feedback</option>
                          <option value="General">General</option>
                        </select>
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => handleVerify(item._id, editLabel)}
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <span className={`badge ${getBadgeClass(item.human_correction.label)}`}>
                        {item.human_correction.label}
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReviewTable;
