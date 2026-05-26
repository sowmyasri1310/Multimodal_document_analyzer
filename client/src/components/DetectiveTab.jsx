import React from 'react';
import { ShieldCheck, ShieldAlert, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';

export default function DetectiveTab({ doc }) {
  if (!doc) return null;

  const { detectiveReport } = doc;
  const status = detectiveReport?.status || 'innocent';
  const score = detectiveReport?.score || 0;
  const findings = detectiveReport?.findings || [];

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'var(--accent-pink)';
      case 'medium': return 'var(--accent-orange)';
      case 'low':
      default:
        return 'var(--secondary)';
    }
  };

  return (
    <div style={styles.container} className="animate-fade-in">
      {/* Forensic Diagnostic Header */}
      <div style={styles.forensicCard} className="glass-card">
        {/* Animated Forensic Shield */}
        <div style={styles.shieldSection}>
          <div 
            style={{
              ...styles.radarRing,
              borderColor: status === 'suspicious' ? 'rgba(236,72,153,0.3)' : 'rgba(16,185,129,0.3)',
              boxShadow: status === 'suspicious' ? '0 0 30px 2px rgba(236,72,153,0.15)' : '0 0 30px 2px rgba(16,185,129,0.15)'
            }}
            className="pulse-border"
          >
            {status === 'suspicious' ? (
              <ShieldAlert size={56} style={{ color: 'var(--accent-pink)' }} />
            ) : (
              <ShieldCheck size={56} style={{ color: 'var(--accent-green)' }} />
            )}
          </div>
          
          <div style={styles.statusInfo}>
            <span style={styles.auditTag}>Forensic Audit Analysis</span>
            <h2 style={{ 
              fontSize: '1.75rem', 
              fontWeight: '800', 
              color: status === 'suspicious' ? 'var(--accent-pink)' : 'var(--accent-green)',
              margin: '0.2rem 0'
            }}>
              {status === 'suspicious' ? 'Suspicious Indicators' : 'Verification Clear'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              {status === 'suspicious' 
                ? 'WARNING: Discrepancies detected. Review details below.' 
                : 'The document passed core structural and mathematical consistency tests.'}
            </p>
          </div>
        </div>

        {/* Suspicion Score Gauge */}
        <div style={styles.scoreGauge}>
          <div style={styles.gaugeHeader}>
            <span>Suspicion Rating</span>
            <span style={{ 
              color: status === 'suspicious' ? 'var(--accent-pink)' : 'var(--accent-green)',
              fontWeight: '800',
              fontSize: '1.25rem'
            }}>
              {score}%
            </span>
          </div>
          <div style={styles.gaugeBarBg}>
            <div style={{ 
              ...styles.gaugeBarFill, 
              width: `${score}%`,
              background: status === 'suspicious' 
                ? 'linear-gradient(90deg, var(--accent-orange) 0%, var(--accent-pink) 100%)'
                : 'linear-gradient(90deg, var(--secondary) 0%, var(--accent-green) 100%)'
            }} />
          </div>
          <span style={styles.gaugeLabel}>
            {score < 30 ? '🟢 Safe - Minimal risks noted' : score < 60 ? '🟡 Moderate - Inspect credentials' : '🔴 High Risk - Suspected manual alterations'}
          </span>
        </div>
      </div>

      {/* Forensic Log Checklist */}
      <div style={styles.logCard} className="glass-card">
        <h3 style={styles.logHeader}>
          <Sparkles size={18} style={{ color: 'var(--secondary)', marginRight: '0.5rem' }} /> Audit Forensic Findings ({findings.length})
        </h3>

        {findings.length === 0 ? (
          <div style={styles.emptyFindings}>
            <CheckCircle size={32} style={{ color: 'var(--accent-green)', opacity: 0.7, marginBottom: '0.5rem' }} />
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>No suspicious activities detected.</p>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Verified: Arithmetic checks balanced, standard template validation clear.</span>
          </div>
        ) : (
          <div style={styles.findingsList}>
            {findings.map((f, idx) => (
              <div key={idx} style={styles.findingItem} className="glass-card">
                <div style={styles.findingMeta}>
                  <AlertCircle size={16} style={{ color: getSeverityColor(f.severity), marginTop: '0.1rem' }} />
                  <div>
                    <h4 style={styles.findingTitle}>{f.indicator}</h4>
                    <p style={styles.findingDetails}>{f.details}</p>
                  </div>
                </div>
                <span 
                  style={{ 
                    ...styles.severityTag, 
                    color: getSeverityColor(f.severity),
                    borderColor: getSeverityColor(f.severity),
                    background: `${getSeverityColor(f.severity)}10`
                  }}
                >
                  {f.severity}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
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
  forensicCard: {
    padding: '2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '2rem',
    flexWrap: 'wrap',
  },
  shieldSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    flex: '1.5',
    minWidth: '300px',
  },
  radarRing: {
    width: '96px',
    height: '96px',
    borderRadius: '50%',
    border: '2px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.01)',
  },
  statusInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  auditTag: {
    fontSize: '0.7rem',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    letterSpacing: '0.05em',
    fontWeight: '700',
  },
  scoreGauge: {
    flex: '1',
    minWidth: '240px',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  gaugeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
  },
  gaugeBarBg: {
    width: '100%',
    height: '8px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  gaugeBarFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 1s ease',
  },
  gaugeLabel: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
  },
  logCard: {
    padding: '1.5rem',
  },
  logHeader: {
    fontSize: '1.1rem',
    fontWeight: '700',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
  },
  emptyFindings: {
    padding: '3rem 1.5rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  findingsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  findingItem: {
    padding: '1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '1.5rem',
    backgroundColor: 'rgba(255,255,255,0.01)',
  },
  findingMeta: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'flex-start',
  },
  findingTitle: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '0.2rem',
  },
  findingDetails: {
    fontSize: '0.82rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
  },
  severityTag: {
    fontSize: '0.7rem',
    textTransform: 'uppercase',
    fontWeight: '700',
    border: '1px solid',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
    letterSpacing: '0.05em',
  }
};
