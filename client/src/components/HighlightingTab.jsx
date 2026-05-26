import React, { useState } from 'react';
import { ShieldAlert, Calendar, DollarSign, FileText, ChevronRight, HelpCircle } from 'lucide-react';

export default function HighlightingTab({ doc }) {
  if (!doc) return null;

  const { highlights = [], extractedText = '' } = doc;
  const [selectedHighlightIdx, setSelectedHighlightIdx] = useState(null);

  const getHighlightIcon = (type) => {
    switch (type) {
      case 'risk':
        return <ShieldAlert size={16} style={{ color: 'var(--accent-pink)' }} />;
      case 'deadline':
        return <Calendar size={16} style={{ color: 'var(--accent-orange)' }} />;
      case 'amount':
        return <DollarSign size={16} style={{ color: 'var(--accent-green)' }} />;
      case 'clause':
      default:
        return <FileText size={16} style={{ color: 'var(--primary)' }} />;
    }
  };

  const getTypeName = (type) => {
    switch (type) {
      case 'risk': return 'Risk Liability';
      case 'deadline': return 'Critical Deadline';
      case 'amount': return 'Financial Amount';
      case 'clause': return 'Key Clause';
      default: return 'Core Snippet';
    }
  };

  const getBadgeStyle = (type) => {
    switch (type) {
      case 'risk':
        return { background: 'rgba(236, 72, 153, 0.15)', color: '#fbcfe8', borderColor: 'rgba(236, 72, 153, 0.3)' };
      case 'deadline':
        return { background: 'rgba(245, 158, 11, 0.15)', color: '#fef08a', borderColor: 'rgba(245, 158, 11, 0.3)' };
      case 'amount':
        return { background: 'rgba(16, 185, 129, 0.15)', color: '#a7f3d0', borderColor: 'rgba(16, 185, 129, 0.3)' };
      case 'clause':
      default:
        return { background: 'rgba(139, 92, 246, 0.15)', color: '#c4b5fd', borderColor: 'rgba(139, 92, 246, 0.3)' };
    }
  };

  return (
    <div style={styles.container} className="animate-fade-in">
      <div style={styles.leftPanel}>
        <div style={styles.panelHeader}>
          <h3>Interactive Document Reader</h3>
          <span style={styles.subText}>AI spotlight overlaying important extracted phrases.</span>
        </div>
        <div style={styles.textReader} className="glass-card">
          {extractedText ? (
            <pre style={styles.preText}>
              {extractedText}
            </pre>
          ) : (
            <div style={styles.emptyReader}>
              <HelpCircle size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
              <p>No document text extracted. Try re-uploading a standard text or scanned file.</p>
            </div>
          )}
        </div>
      </div>

      <div style={styles.rightPanel}>
        <div style={styles.panelHeader}>
          <h3>Smart Highlights ({highlights.length})</h3>
          <span style={styles.subText}>Critical markers extracted automatically.</span>
        </div>

        {highlights.length === 0 ? (
          <div className="glass-card" style={styles.emptyHighlights}>
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.9rem' }}>
              No critical clauses or specific figures tagged for highlighting.
            </p>
          </div>
        ) : (
          <div style={styles.highlightsList}>
            {highlights.map((hl, idx) => {
              const isSelected = selectedHighlightIdx === idx;
              const badgeStyle = getBadgeStyle(hl.type);

              return (
                <div 
                  key={idx}
                  onClick={() => setSelectedHighlightIdx(isSelected ? null : idx)}
                  style={{
                    ...styles.highlightCard,
                    borderColor: isSelected ? badgeStyle.color : 'var(--glass-border)',
                    backgroundColor: isSelected ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)'
                  }}
                  className="glass-card"
                >
                  <div style={styles.cardHeader}>
                    <div style={{ ...styles.typeBadge, ...badgeStyle }}>
                      {getHighlightIcon(hl.type)}
                      <span>{getTypeName(hl.type)}</span>
                    </div>
                    <ChevronRight 
                      size={16} 
                      style={{ 
                        color: 'var(--text-muted)', 
                        transform: isSelected ? 'rotate(90deg)' : 'none',
                        transition: 'var(--transition-fast)' 
                      }} 
                    />
                  </div>

                  <div style={styles.snippetWrapper}>
                    <p style={styles.snippetText}>
                      "{hl.text}"
                    </p>
                  </div>

                  {isSelected && (
                    <div style={styles.explanationBox} className="animate-fade-in">
                      <h5 style={styles.explanationTitle}>Cognitive Context</h5>
                      <p style={styles.explanationText}>{hl.explanation || 'Analyzed as a key clause for monitoring.'}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '1.5rem',
    height: '620px',
    marginTop: '1rem',
  },
  leftPanel: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
  },
  rightPanel: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflowY: 'auto',
  },
  panelHeader: {
    marginBottom: '0.75rem',
  },
  subText: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
  },
  textReader: {
    flex: '1',
    overflowY: 'auto',
    padding: '1.5rem',
    background: 'rgba(7, 9, 19, 0.6)',
  },
  preText: {
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    fontSize: '0.85rem',
    lineHeight: '1.6',
    color: '#cbd5e1',
    fontFamily: 'monospace',
  },
  emptyReader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: 'var(--text-muted)',
    textAlign: 'center',
  },
  highlightsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    overflowY: 'auto',
  },
  highlightCard: {
    padding: '1rem',
    cursor: 'pointer',
    transition: 'var(--transition-smooth)',
    borderWidth: '1px',
    borderStyle: 'solid',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  typeBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    border: '1px solid',
    fontSize: '0.75rem',
    fontWeight: '600',
  },
  snippetWrapper: {
    background: 'rgba(0,0,0,0.15)',
    padding: '0.65rem',
    borderRadius: '6px',
    borderLeft: '2px solid var(--text-muted)',
  },
  snippetText: {
    fontSize: '0.82rem',
    fontStyle: 'italic',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
  },
  explanationBox: {
    marginTop: '0.75rem',
    paddingTop: '0.75rem',
    borderTop: '1px dashed var(--glass-border)',
  },
  explanationTitle: {
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    color: '#fff',
    letterSpacing: '0.05em',
    marginBottom: '0.25rem',
  },
  explanationText: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
  },
  emptyHighlights: {
    padding: '2rem',
    textAlign: 'center',
  }
};
