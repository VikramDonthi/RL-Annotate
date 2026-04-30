import React, { useState } from 'react';
import { Sparkles, Check, X, Loader2 } from 'lucide-react';
import axios from 'axios';

const PromptTuner = () => {
  const [loading, setLoading] = useState(false);
  const [suggestedPrompt, setSuggestedPrompt] = useState(null);
  const [statusMsg, setStatusMsg] = useState('');

  const handleRefine = async () => {
    setLoading(true);
    setStatusMsg('');
    setSuggestedPrompt(null);
    try {
      const res = await axios.get('http://localhost:5000/api/annotations/optimize-prompt');
      if (res.data.suggested_prompt.includes('No mistakes found')) {
        setStatusMsg(res.data.suggested_prompt);
      } else {
        setSuggestedPrompt(res.data.suggested_prompt);
      }
    } catch (err) {
      console.error(err);
      setStatusMsg('Failed to optimize prompt. Are there any corrected mistakes in the database?');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    try {
      await axios.post('http://localhost:5000/api/annotations/update-prompt', { new_prompt: suggestedPrompt });
      setStatusMsg('Success! New AI System Prompt is now active.');
      setSuggestedPrompt(null);
    } catch (err) {
      console.error(err);
      setStatusMsg('Failed to save the new prompt.');
    }
  };

  const handleReject = () => {
    setSuggestedPrompt(null);
    setStatusMsg('Suggested prompt rejected. The AI will continue using the old prompt.');
  };

  return (
    <div className="glass-card" style={{ marginTop: '2rem', border: '1px solid var(--accent-glow)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)' }}>
            <Sparkles size={20} />
            RLHF Auto-Refine System Prompt
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Completes the feedback loop by having the AI analyze its past mistakes and rewrite its own instructions.
          </p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={handleRefine} 
          disabled={loading || suggestedPrompt !== null}
        >
          {loading ? <Loader2 size={16} className="animate-pulse" /> : <Sparkles size={16} />}
          {loading ? 'Analyzing mistakes...' : 'Generate Better Prompt'}
        </button>
      </div>

      {statusMsg && (
        <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)', borderRadius: '0.5rem', fontSize: '0.9rem' }}>
          {statusMsg}
        </div>
      )}

      {suggestedPrompt && (
        <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'var(--surface-hover)', borderRadius: '0.5rem', border: '1px dashed var(--surface-border)' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>AI Suggested Master Prompt:</h3>
          <p style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem', fontFamily: 'monospace', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
            {suggestedPrompt}
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-primary" style={{ background: 'var(--success)' }} onClick={handleAccept}>
              <Check size={16} /> Accept & Deploy
            </button>
            <button className="btn btn-outline" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={handleReject}>
              <X size={16} /> Reject
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptTuner;
