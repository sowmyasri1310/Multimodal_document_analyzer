import React from 'react';
import { 
  GraduationCap, 
  Receipt, 
  HeartPulse, 
  BookOpen, 
  FileText, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  DollarSign,
  Activity,
  CheckCircle,
  Stethoscope
} from 'lucide-react';

export default function InsightsTab({ doc }) {
  if (!doc) return null;

  const { category, analysis } = doc;

  // Render Resume Insights
  const renderResumeInsights = () => {
    const atsScore = analysis?.atsScore || 0;
    const strengths = analysis?.strengths || [];
    const missingSkills = analysis?.missingSkills || [];

    return (
      <div style={styles.grid} className="responsive-grid">
        {/* ATS Score Radial */}
        <div style={{ ...styles.card, gridColumn: 'span 12' }} className="glass-card">
          <div style={styles.atsContainer}>
            <div style={styles.radialWrapper}>
              <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
                <circle 
                  cx="60" cy="60" r="50" 
                  fill="transparent" 
                  stroke="rgba(255,255,255,0.03)" 
                  strokeWidth="8" 
                />
                <circle 
                  cx="60" cy="60" r="50" 
                  fill="transparent" 
                  stroke="var(--primary)" 
                  strokeWidth="8" 
                  strokeDasharray={2 * Math.PI * 50}
                  strokeDashoffset={2 * Math.PI * 50 * (1 - atsScore / 100)}
                  strokeLinecap="round"
                  style={{ filter: 'drop-shadow(0 0 4px var(--primary-glow))', transition: 'stroke-dashoffset 1s ease' }}
                />
              </svg>
              <div style={styles.radialText}>
                <span style={styles.radialNum}>{atsScore}</span>
                <span style={styles.radialLabel}>ATS</span>
              </div>
            </div>
            <div style={styles.atsMeta}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Resume Strength Audit</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Your resume scored {atsScore}/100. This indicates {atsScore > 80 ? 'excellent matching metrics and standard layout patterns.' : 'some areas need formatting optimizations and missing keywords.'}
              </p>
            </div>
          </div>
        </div>

        {/* Strengths & Missing Skills */}
        <div style={{ ...styles.card, gridColumn: 'span 6' }} className="glass-card">
          <h3 style={styles.cardTitle} className="text-gradient">
            <CheckCircle size={18} style={{ color: 'var(--accent-green)', marginRight: '0.5rem' }} /> Key Candidate Strengths
          </h3>
          {strengths.length === 0 ? (
            <p style={styles.emptyText}>No specific strengths listed.</p>
          ) : (
            <ul style={styles.list}>
              {strengths.map((str, idx) => (
                <li key={idx} style={styles.listItem}>✨ {str}</li>
              ))}
            </ul>
          )}
        </div>

        <div style={{ ...styles.card, gridColumn: 'span 6' }} className="glass-card">
          <h3 style={styles.cardTitle} className="text-gradient-detective">
            <AlertTriangle size={18} style={{ color: 'var(--accent-orange)', marginRight: '0.5rem' }} /> Missing Skills & Keywords
          </h3>
          {missingSkills.length === 0 ? (
            <p style={styles.emptyText}>No missing skills found. Great job!</p>
          ) : (
            <div style={styles.chipContainer}>
              {missingSkills.map((skill, idx) => (
                <span key={idx} style={styles.missingChip}>{skill}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render Invoice Insights
  const renderInvoiceInsights = () => {
    const { amount, currency, date, company, gst, lineItems } = analysis || {};

    return (
      <div style={styles.grid} className="responsive-grid">
        {/* Info Cards Grid */}
        <div style={{ ...styles.infoGrid, gridColumn: 'span 12' }}>
          <div className="glass-card" style={styles.miniCard}>
            <span style={styles.miniLabel}>Total Amount</span>
            <h3 style={{ ...styles.miniValue, color: 'var(--accent-green)' }}>
              {currency || 'INR'} {amount ? amount.toLocaleString() : '0.00'}
            </h3>
          </div>
          <div className="glass-card" style={styles.miniCard}>
            <span style={styles.miniLabel}>Company Name</span>
            <h3 style={styles.miniValue}>{company || 'Not detected'}</h3>
          </div>
          <div className="glass-card" style={styles.miniCard}>
            <span style={styles.miniLabel}>Invoice Date</span>
            <h3 style={styles.miniValue}>{date || 'Not specified'}</h3>
          </div>
          <div className="glass-card" style={styles.miniCard}>
            <span style={styles.miniLabel}>GSTIN / Tax ID</span>
            <h3 style={{ ...styles.miniValue, color: 'var(--secondary)' }}>{gst || 'Not found'}</h3>
          </div>
        </div>

        {/* Line Items Table */}
        <div style={{ ...styles.card, gridColumn: 'span 12' }} className="glass-card">
          <h3 style={styles.cardTitle}>
            <Receipt size={18} style={{ color: 'var(--secondary)', marginRight: '0.5rem' }} /> Invoice Items
          </h3>
          {(!lineItems || lineItems.length === 0) ? (
            <p style={styles.emptyText}>No line items detected.</p>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.trHead}>
                    <th style={styles.th}>#</th>
                    <th style={styles.th}>Item Description</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item, idx) => (
                    <tr key={idx} style={styles.trBody}>
                      <td style={styles.td}>{idx + 1}</td>
                      <td style={styles.td}>{item.description}</td>
                      <td style={{ ...styles.td, textAlign: 'right', fontWeight: '600' }}>
                        {currency || 'INR'} {item.amount ? item.amount.toFixed(2) : '0.00'}
                      </td>
                    </tr>
                  ))}
                  <tr style={styles.trTotal}>
                    <td style={styles.td} colSpan="2">Calculated Total</td>
                    <td style={{ ...styles.td, textAlign: 'right', fontWeight: '800', color: 'var(--accent-green)' }}>
                      {currency || 'INR'} {lineItems.reduce((acc, curr) => acc + (curr.amount || 0), 0).toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render Medical Insights
  const renderMedicalInsights = () => {
    const { findings, vitalSigns, recommendations, abnormalities } = analysis || {};
    const vitalsArray = vitalSigns ? Object.entries(vitalSigns) : [];

    return (
      <div style={styles.grid} className="responsive-grid">
        {/* Abnormalities Banner */}
        {abnormalities && abnormalities.length > 0 && (
          <div style={{ ...styles.abnormalityBanner, gridColumn: 'span 12' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Stethoscope size={18} style={{ color: 'var(--accent-pink)' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>Abnormal Readings Identified</h3>
            </div>
            <div style={styles.chipContainer}>
              {abnormalities.map((item, idx) => (
                <span key={idx} style={styles.abnormalChip}>{item}</span>
              ))}
            </div>
          </div>
        )}

        {/* Vital Signs */}
        <div style={{ ...styles.card, gridColumn: 'span 5' }} className="glass-card">
          <h3 style={styles.cardTitle}>
            <Activity size={18} style={{ color: 'var(--accent-pink)', marginRight: '0.5rem' }} /> Recorded Vitals
          </h3>
          {vitalsArray.length === 0 ? (
            <p style={styles.emptyText}>No vital signs found.</p>
          ) : (
            <div style={styles.vitalsContainer}>
              {vitalsArray.map(([key, val], idx) => (
                <div key={idx} style={styles.vitalRow}>
                  <span style={styles.vitalName}>{key}</span>
                  <span style={styles.vitalVal}>{val}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Core Findings & Recommendations */}
        <div style={{ ...styles.card, gridColumn: 'span 7' }} className="glass-card">
          <h3 style={styles.cardTitle}>
            <HeartPulse size={18} style={{ color: 'var(--accent-green)', marginRight: '0.5rem' }} /> Diagnostic Findings
          </h3>
          {!findings || findings.length === 0 ? (
            <p style={styles.emptyText}>No diagnostic findings summarized.</p>
          ) : (
            <ul style={styles.list}>
              {findings.map((finding, idx) => (
                <li key={idx} style={styles.listItem}>🧪 {finding}</li>
              ))}
            </ul>
          )}
        </div>

        {recommendations && recommendations.length > 0 && (
          <div style={{ ...styles.card, gridColumn: 'span 12' }} className="glass-card">
            <h3 style={styles.cardTitle} className="text-gradient">
              Clinical Recommendations
            </h3>
            <ul style={styles.list}>
              {recommendations.map((rec, idx) => (
                <li key={idx} style={{ ...styles.listItem, color: '#f1f5f9' }}>👨‍⚕️ {rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  // Render Research Paper Insights
  const renderPaperInsights = () => {
    const { abstract, methodology, keyFindings, conclusions } = analysis || {};

    return (
      <div style={styles.grid} className="responsive-grid">
        <div style={{ ...styles.card, gridColumn: 'span 12' }} className="glass-card">
          <h3 style={styles.cardTitle}>
            <BookOpen size={18} style={{ color: 'var(--primary)', marginRight: '0.5rem' }} /> Abstract Summary
          </h3>
          <p style={styles.pText}>{abstract || 'Abstract not summarized.'}</p>
        </div>

        <div style={{ ...styles.card, gridColumn: 'span 6' }} className="glass-card">
          <h3 style={styles.cardTitle}>Methodology & Architecture</h3>
          <p style={styles.pText}>{methodology || 'No specific methodology extracted.'}</p>
        </div>

        <div style={{ ...styles.card, gridColumn: 'span 6' }} className="glass-card">
          <h3 style={styles.cardTitle}>Key Scientific Findings</h3>
          {!keyFindings || keyFindings.length === 0 ? (
            <p style={styles.emptyText}>No key findings listed.</p>
          ) : (
            <ul style={styles.list}>
              {keyFindings.map((finding, idx) => (
                <li key={idx} style={styles.listItem}>🔬 {finding}</li>
              ))}
            </ul>
          )}
        </div>

        <div style={{ ...styles.card, gridColumn: 'span 12' }} className="glass-card">
          <h3 style={styles.cardTitle} className="text-gradient">Conclusions & Future Avenues</h3>
          <p style={styles.pText}>{conclusions || 'No conclusions parsed.'}</p>
        </div>
      </div>
    );
  };

  // Render Default or Contract Insights
  const renderDefaultInsights = () => {
    return (
      <div style={{ ...styles.card, gridColumn: 'span 12' }} className="glass-card animate-fade-in">
        <h3 style={styles.cardTitle}>
          <FileText size={18} style={{ color: 'var(--text-secondary)', marginRight: '0.5rem' }} /> Document Insights
        </h3>
        <p style={{ ...styles.pText, fontSize: '1rem', lineHeight: '1.6' }}>
          {analysis?.summary || 'We analyzed the document but did not match a specific template. Review the highlights or ask the AI questions directly.'}
        </p>
      </div>
    );
  };

  const getCategorizedView = () => {
    switch (category) {
      case 'resume':
        return renderResumeInsights();
      case 'invoice':
        return renderInvoiceInsights();
      case 'medical':
        return renderMedicalInsights();
      case 'paper':
        return renderPaperInsights();
      case 'contract':
      default:
        return renderDefaultInsights();
    }
  };

  return (
    <div style={styles.tabContainer} className="animate-fade-in">
      {/* Overall Summary Card */}
      {category !== 'contract' && (
        <div style={styles.summaryCard} className="glass-card">
          <h3 style={styles.summaryHeader}>AI Executive Summary</h3>
          <p style={styles.summaryBody}>{analysis?.summary || 'No summary compiled.'}</p>
        </div>
      )}

      {getCategorizedView()}
    </div>
  );
}

const styles = {
  tabContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    marginTop: '1rem',
  },
  summaryCard: {
    padding: '1.5rem',
    borderLeft: '4px solid var(--primary)',
  },
  summaryHeader: {
    fontSize: '0.9rem',
    textTransform: 'uppercase',
    color: 'var(--primary)',
    letterSpacing: '0.05em',
    marginBottom: '0.5rem',
    fontWeight: '700',
  },
  summaryBody: {
    fontSize: '0.95rem',
    lineHeight: '1.6',
    color: 'var(--text-primary)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(12, 1fr)',
    gap: '1.25rem',
  },
  card: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
  },
  cardTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
  },
  pText: {
    fontSize: '0.9rem',
    lineHeight: '1.6',
    color: 'var(--text-secondary)',
  },
  emptyText: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    fontStyle: 'italic',
  },
  list: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  listItem: {
    fontSize: '0.88rem',
    lineHeight: '1.4',
    color: 'var(--text-secondary)',
  },
  atsContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
    flexWrap: 'wrap',
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
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  radialNum: {
    fontSize: '1.75rem',
    fontWeight: '800',
    color: '#fff',
    lineHeight: '1',
  },
  radialLabel: {
    fontSize: '0.65rem',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: '0.05em',
  },
  atsMeta: {
    flex: '1',
    minWidth: '240px',
  },
  chipContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  missingChip: {
    background: 'rgba(245, 158, 11, 0.1)',
    color: '#fef08a',
    border: '1px solid rgba(245, 158, 11, 0.25)',
    padding: '0.35rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: '600',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1rem',
    width: '100%',
  },
  miniCard: {
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  miniLabel: {
    fontSize: '0.7rem',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    letterSpacing: '0.05em',
    fontWeight: '600',
  },
  miniValue: {
    fontSize: '1.15rem',
    fontWeight: '700',
    color: '#fff',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  tableWrapper: {
    overflowX: 'auto',
    marginTop: '0.5rem',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.88rem',
  },
  trHead: {
    borderBottom: '1px solid var(--glass-border)',
  },
  th: {
    color: 'var(--text-muted)',
    textAlign: 'left',
    padding: '0.75rem 1rem',
    fontWeight: '600',
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  trBody: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
    transition: 'var(--transition-fast)',
  },
  td: {
    padding: '0.9rem 1rem',
    color: 'var(--text-secondary)',
  },
  trTotal: {
    borderTop: '2px solid var(--glass-border)',
    background: 'rgba(255, 255, 255, 0.01)',
  },
  abnormalityBanner: {
    background: 'rgba(236, 72, 153, 0.1)',
    border: '1px solid rgba(236, 72, 153, 0.25)',
    padding: '1.25rem',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
  },
  abnormalChip: {
    background: 'rgba(236, 72, 153, 0.15)',
    color: '#fbcfe8',
    border: '1px solid rgba(236, 72, 153, 0.3)',
    padding: '0.35rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: '600',
  },
  vitalsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  vitalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.5rem 0.75rem',
    background: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '8px',
    border: '1px solid var(--glass-border)',
  },
  vitalName: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
  },
  vitalVal: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--accent-pink)',
  }
};
