import React, { useState } from 'react';
import { Languages, HelpCircle, Copy, Check } from 'lucide-react';

export default function TranslatorTab({ doc }) {
  if (!doc) return null;

  const { analysis } = doc;
  const [lang, setLang] = useState('Hindi');
  const [loading, setLoading] = useState(false);
  const [translation, setTranslation] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const handleTranslate = async () => {
    setLoading(true);
    setError(null);
    setTranslation(null);
    setCopied(false);

    try {
      const response = await fetch(`/api/documents/${doc._id}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetLanguage: lang })
      });

      if (!response.ok) {
        throw new Error('Server rejected translation execution.');
      }

      const data = await response.json();
      setTranslation(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error occurred while translating summary.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!translation) return;
    navigator.clipboard.writeText(translation.translatedText || translation.summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={styles.container} className="animate-fade-in">
      <div style={styles.controlCard} className="glass-card">
        <h3 style={styles.cardHeader}>
          <Languages size={18} style={{ color: 'var(--secondary)', marginRight: '0.5rem' }} /> Multi-Language Understanding Portal
        </h3>
        <p style={styles.subText}>Translate and summarize the document contents into your preferred regional language. Supports English, Hindi, and Telugu scripts natively.</p>
        
        <div style={styles.controlRow}>
          <div style={styles.selectGroup}>
            <label style={styles.label}>Select Target Language</label>
            <select 
              value={lang} 
              onChange={(e) => setLang(e.target.value)}
              style={styles.select}
              className="glass-input glass-select"
            >
              <option value="Hindi">🇮🇳 Hindi (हिन्दी)</option>
              <option value="Telugu">🇮🇳 Telugu (తెలుగు)</option>
              <option value="English">🇬🇧 English</option>
            </select>
          </div>

          <button 
            onClick={handleTranslate}
            disabled={loading}
            style={styles.translateBtn}
            className="glow-button"
          >
            {loading ? 'Translating Scripts...' : 'Translate & Summarize'}
          </button>
        </div>

        {error && <p style={styles.errorText}>{error}</p>}
      </div>

      {loading && (
        <div style={styles.loadingWrapper} className="glass-card">
          <div style={styles.spinner} className="pulse-border" />
          <h4 style={{ marginTop: '1rem' }}>Translating linguistic schemas...</h4>
        </div>
      )}

      {translation && (
        <div style={styles.displayGrid} className="animate-fade-in">
          {/* Original summary panel */}
          <div style={styles.dispCard} className="glass-card">
            <span style={styles.dispLabel}>Original Summary</span>
            <p style={styles.dispBody}>{analysis?.summary || 'No summary compiled.'}</p>
          </div>

          {/* Translated summary panel */}
          <div style={styles.dispCard} className="glass-card" style={{ ...styles.dispCard, borderColor: 'var(--primary)' }}>
            <div style={styles.dispCardHeader}>
              <span style={{ ...styles.dispLabel, color: 'var(--primary)' }}>Translated Summary ({lang})</span>
              <button 
                onClick={handleCopy}
                style={styles.copyBtn}
                title="Copy Translation"
                className="tab-btn"
              >
                {copied ? <Check size={14} style={{ color: 'var(--accent-green)' }} /> : <Copy size={14} />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            
            <p style={{ 
              ...styles.dispBody, 
              fontSize: '1rem',
              lineHeight: '1.7', 
              color: '#f8fafc',
              fontFamily: lang === 'Hindi' || lang === 'Telugu' ? 'sans-serif' : 'var(--font-body)'
            }}>
              {translation.summary || translation.translatedText}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    marginTop: '1rem',
  },
  controlCard: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  cardHeader: {
    fontSize: '1.15rem',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
  },
  subText: {
    fontSize: '0.82rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
  },
  controlRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '1.5rem',
    flexWrap: 'wrap',
    marginTop: '0.5rem',
  },
  selectGroup: {
    flex: '1',
    minWidth: '220px',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    fontWeight: '600',
    letterSpacing: '0.05em',
  },
  select: {
    width: '100%',
  },
  translateBtn: {
    height: '42px',
    justifyContent: 'center',
    padding: '0 2rem',
  },
  errorText: {
    color: 'var(--accent-pink)',
    fontSize: '0.85rem',
  },
  loadingWrapper: {
    padding: '3rem 1.5rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  spinner: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '2px solid rgba(139, 92, 246, 0.1)',
    borderTopColor: 'var(--primary)',
  },
  displayGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '1.25rem',
  },
  dispCard: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  dispCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  dispLabel: {
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    letterSpacing: '0.05em',
    fontWeight: '700',
  },
  dispBody: {
    fontSize: '0.9rem',
    lineHeight: '1.6',
    color: 'var(--text-secondary)',
    whiteSpace: 'pre-wrap',
  },
  copyBtn: {
    padding: '0.3rem 0.6rem',
    fontSize: '0.75rem',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
  }
};
