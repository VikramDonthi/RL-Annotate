import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import axios from 'axios';

const IngestionForm = ({ onNewAnnotation }) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/annotations', {
        text_input: text
      });
      onNewAnnotation(response.data);
      setText('');
    } catch (error) {
      console.error("Error submitting text:", error);
      alert("Failed to process text. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card">
      <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        Data Ingestion
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Raw Unstructured Text</label>
          <textarea
            className="form-textarea"
            placeholder="Paste customer feedback, bug reports, or queries here to be auto-categorized by the AI Agent..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={loading}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary" disabled={loading || !text.trim()}>
            {loading ? <Loader2 size={18} className="animate-pulse" /> : <Send size={18} />}
            {loading ? 'Processing via AI...' : 'Auto-Label'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default IngestionForm;
