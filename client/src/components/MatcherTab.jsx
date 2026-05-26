import React, { useState } from 'react';
import { Briefcase, CheckCircle, AlertTriangle, TrendingUp, HelpCircle } from 'lucide-react';

export default function MatcherTab({ doc }) {
  if (!doc) return null;

  const [jd, setJd] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleMatchSubmit = async () => {
    if (!jd.trim()) return;

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch(`/api/documents/${doc._id}/match-jd`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription: jd })
      });

      if (!response.ok) {
        throw new Error('Failed to run job matching comparison.');
      }

      const matchData = await response.json();
      setResults(matchData);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error occurred during comparison analysis.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container} className="animate-fade-in">
      <div style={styles.inputCard} className="glass-card">
        <h3 style={styles.headerTitle}>
          <Briefcase size={18} style={{ color: 'var(--primary)', marginRight: '0.5rem' }} /> Resume vs Job Description Matcher
        </h3>
        <p style={styles.subText}>Paste the target Job Description below. Our cognitive AI will audit candidate alignment, map keyword deficits, and provide layout optimization instructions.</p>
        
        <textarea 
          placeholder="Paste full Job Description text here..." 
          value={jd} 
          onChange={(e) => setJd(e.target.value)}
          style={styles.textarea}
          className="glass-input"
          rows={6}
          disabled={loading}
        />

        <button 
          onClick={handleMatchSubmit}
          disabled={loading || !jd.trim()}
          style={styles.compareBtn}
          className="glow-button"
        >
          {loading ? 'Comparing Credentials...' : 'Run Alignment Audit'}
        </button>

        {error && <p style={styles.errorText}>{error}</p>}
      </div>

      {loading && (
        <div style={styles.loadingWrapper} className="glass-card">
          <div style={styles.spinner} className="pulse-border" />
          <h4 style={{ marginTop: '1rem' }}>Parsing resume keywords against criteria...</h4>
        </div>
      )}

      {results && (
        <div style={styles.resultsGrid} className="animate-fade-in responsive-grid">
          {/* Match Score Radial */}
          <div style={{ ...styles.card, gridColumn: 'span 4' }} className="glass-card">
            <h3 style={styles.cardTitle}>Compatibility Score</h3>
            <div style={styles.scoreContainer}>
              <div style={styles.radialWrapper}>
                <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="60" cy="60" r="50" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="8" />
                  <circle 
                    cx="60" cy="60" r="50" 
                    fill="transparent" 
                    stroke="var(--secondary)" 
                    strokeWidth="8" 
                    strokeDasharray={2 * Math.PI * 50}
                    strokeDashoffset={2 * Math.PI * 50 * (1 - (results.matchPercentage || 0) / 100)}
                    strokeLinecap="round"
                    style={{ filter: 'drop-shadow(0 0 4px var(--secondary-glow))', transition: 'stroke-dashoffset 1s ease' }}
                  />
                </svg>
                <div style={styles.radialText}>
                  <span style={styles.radialNum}>{results.matchPercentage}%</span>
                </div>
              </div>
              <span style={{ 
                ...styles.ratingLabel, 
                color: results.matchPercentage > 75 ? 'var(--accent-green)' : results.matchPercentage > 50 ? 'var(--accent-orange)' : 'var(--accent-pink)'
              }}>
                {results.matchPercentage > 75 ? 'Excellent Fit' : results.matchPercentage > 50 ? 'Moderate Alignment' : 'Deficit Profile'}
              </span>
            </div>
          </div>

          {/* Skill Matching lists */}
          <div style={{ ...styles.card, gridColumn: 'span 8' }} className="glass-card">
            <h3 style={styles.cardTitle}>
              <CheckCircle size={16} style={{ color: 'var(--accent-green)', marginRight: '0.4rem' }} /> Profile Alignment
            </h3>
            <div style={styles.skillsComparison}>
              <div>
                <span style={styles.listHeader}>Matching Credentials ({results.matchingSkills?.length || 0})</span>
                <div style={styles.chipContainer}>
                  {results.matchingSkills?.length === 0 ? (
                    <span style={styles.emptyChip}>None found</span>
                  ) : (
                    results.matchingSkills?.map((skill, idx) => (
                      <span key={idx} style={styles.matchChip}>{skill}</span>
                    ))
                  )}
                </div>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <span style={styles.listHeader}>Deficit Competencies ({results.missingSkills?.length || 0})</span>
                <div style={styles.chipContainer}>
                  {results.missingSkills?.length === 0 ? (
                    <span style={styles.emptyChip}>None found! Perfect match</span>
                  ) : (
                    results.missingSkills?.map((skill, idx) => (
                      <span key={idx} style={styles.missingChip}>{skill}</span>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations checklist */}
          <div style={{ ...styles.card, gridColumn: 'span 12' }} className="glass-card">
            <h3 style={styles.cardTitle}>
              <TrendingUp size={16} style={{ color: 'var(--primary)', marginRight: '0.4rem' }} /> Optimizations & Editing Checklist
            </h3>
            <ul style={styles.checklist}>
              {results.suggestions?.map((sug, idx) => (
                <li key={idx} style={styles.checkItem}>
                  <span>💡</span>
                  <p style={{ margin: 0 }}>{sug}</p>
                </li>
              ))}
            </ul>
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
  inputCard: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  headerTitle: {
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
  textarea: {
    width: '100%',
    fontFamily: 'var(--font-body)',
    fontSize: '0.9rem',
    resize: 'vertical',
  },
  compareBtn: {
    alignSelf: 'flex-start',
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
    border: '2px solid rgba(6, 182, 212, 0.1)',
    borderTopColor: 'var(--secondary)',
  },
  resultsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(12, 1fr)',
    gap: '1.25rem',
  },
  card: {
    padding: '1.5rem',
  },
  cardTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
  },
  scoreContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.75rem',
    justifyContent: 'center',
    height: '80%',
  },
  radialWrapper: {
    position: 'relative',
    width: '120px',
    height: '120px',
  },
  radialText: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
  },
  radialNum: {
    fontSize: '1.75rem',
    fontWeight: '800',
    color: '#fff',
  },
  ratingLabel: {
    fontSize: '0.85rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  skillsComparison: {
    display: 'flex',
    flexDirection: 'column',
  },
  listHeader: {
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    letterSpacing: '0.05em',
    fontWeight: '700',
    marginBottom: '0.5rem',
    display: 'block',
  },
  chipContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  matchChip: {
    background: 'rgba(16, 185, 129, 0.1)',
    color: '#a7f3d0',
    border: '1px solid rgba(16, 185, 129, 0.25)',
    padding: '0.3rem 0.65rem',
    borderRadius: '20px',
    fontSize: '0.78rem',
    fontWeight: '600',
  },
  missingChip: {
    background: 'rgba(245, 158, 11, 0.1)',
    color: '#fef08a',
    border: '1px solid rgba(245, 158, 11, 0.25)',
    padding: '0.3rem 0.65rem',
    borderRadius: '20px',
    fontSize: '0.78rem',
    fontWeight: '600',
  },
  emptyChip: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    fontStyle: 'italic',
  },
  checklist: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  checkItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.5rem',
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
  }
};
