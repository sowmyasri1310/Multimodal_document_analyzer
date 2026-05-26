import React, { useState } from 'react';
import { 
  FileText, 
  Receipt, 
  HeartPulse, 
  GraduationCap, 
  FileCode, 
  Search, 
  Trash2, 
  Plus, 
  Sparkles,
  HelpCircle,
  X
} from 'lucide-react';

export default function Sidebar({ 
  documents, 
  selectedDocId, 
  onSelectDoc, 
  onDeleteDoc, 
  onUploadNew,
  isOpen,
  onClose
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const getIcon = (category) => {
    switch (category) {
      case 'resume':
        return <GraduationCap className="side-icon text-violet-400" size={18} style={{ color: '#a78bfa' }} />;
      case 'invoice':
        return <Receipt className="side-icon text-cyan-400" size={18} style={{ color: '#22d3ee' }} />;
      case 'medical':
        return <HeartPulse className="side-icon text-emerald-400" size={18} style={{ color: '#34d399' }} />;
      case 'paper':
        return <FileCode className="side-icon text-amber-400" size={18} style={{ color: '#fbbf24' }} />;
      case 'contract':
      default:
        return <FileText className="side-icon text-slate-400" size={18} style={{ color: '#94a3b8' }} />;
    }
  };

  const getCategoryLabel = (category) => {
    if (!category) return 'Other';
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const filteredDocs = documents.filter(doc => 
    doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (doc.category && doc.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <aside className={`sidebar-container ${isOpen ? 'open' : ''}`} style={styles.sidebar}>
      {/* Brand Header */}
      <div style={styles.brand}>
        <div style={styles.logoContainer}>
          <Sparkles size={22} style={styles.logoIcon} />
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={styles.brandTitle}>AuraDoc AI</h1>
          <p style={styles.brandSubtitle}>Multimodal Analyzer</p>
        </div>
        {/* Mobile Sidebar Close X Button */}
        <button className="sidebar-close-btn" onClick={onClose} title="Close Menu">
          <X size={18} />
        </button>
      </div>

      {/* New Upload Button */}
      <button 
        className="glow-button" 
        onClick={onUploadNew}
        style={styles.newBtn}
      >
        <Plus size={18} />
        New Document
      </button>

      {/* Search Memory */}
      <div style={styles.searchContainer}>
        <Search size={16} style={styles.searchIcon} />
        <input 
          type="text" 
          placeholder="Search document memory..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {/* History List */}
      <div style={styles.historySection}>
        <h3 style={styles.sectionHeader}>Document Memory ({filteredDocs.length})</h3>
        
        {filteredDocs.length === 0 ? (
          <div style={styles.emptyState}>
            <HelpCircle size={24} style={{ opacity: 0.4, marginBottom: '0.5rem' }} />
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No documents found</p>
          </div>
        ) : (
          <div style={styles.docList}>
            {filteredDocs.map((doc) => {
              const isActive = doc._id === selectedDocId;
              return (
                <div 
                  key={doc._id}
                  onClick={() => onSelectDoc(doc._id)}
                  style={{
                    ...styles.docCard,
                    backgroundColor: isActive ? 'rgba(139, 92, 246, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                    borderColor: isActive ? 'var(--primary)' : 'var(--glass-border)'
                  }}
                  className="doc-item"
                >
                  <div style={styles.docInfo}>
                    <div style={styles.iconWrapper}>
                      {getIcon(doc.category)}
                    </div>
                    <div style={styles.docMeta}>
                      <h4 
                        style={{
                          ...styles.docName,
                          color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)'
                        }}
                        title={doc.fileName}
                      >
                        {doc.fileName}
                      </h4>
                      <span style={styles.docType}>
                        {getCategoryLabel(doc.category)}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteDoc(doc._id);
                    }}
                    style={styles.deleteBtn}
                    title="Delete document memory"
                    className="delete-icon"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div style={styles.footer}>
        <div style={styles.versionChip}>v1.2 Premium</div>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    background: 'rgba(12, 13, 16, 0.96)',
    borderRight: '1px solid var(--glass-border)',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    padding: '1.5rem',
    overflowY: 'auto',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '2rem',
  },
  logoContainer: {
    background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
    borderRadius: '10px',
    padding: '0.4rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 10px rgba(139, 92, 246, 0.3)',
  },
  logoIcon: {
    color: '#fff',
  },
  brandTitle: {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: '#fff',
    letterSpacing: '-0.02em',
  },
  brandSubtitle: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    fontWeight: '500',
  },
  newBtn: {
    width: '100%',
    marginBottom: '1.5rem',
    justifyContent: 'center',
  },
  searchContainer: {
    position: 'relative',
    marginBottom: '1.5rem',
  },
  searchIcon: {
    position: 'absolute',
    left: '0.75rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text-muted)',
  },
  searchInput: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid var(--glass-border)',
    borderRadius: '10px',
    color: '#fff',
    padding: '0.6rem 0.75rem 0.6rem 2.25rem',
    fontSize: '0.85rem',
    width: '100%',
    outline: 'none',
    transition: 'var(--transition-fast)',
  },
  historySection: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    marginBottom: '1rem',
  },
  sectionHeader: {
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    letterSpacing: '0.05em',
    fontWeight: '600',
    marginBottom: '0.75rem',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '1',
    padding: '1.5rem',
    textAlign: 'center',
  },
  docList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    overflowY: 'auto',
  },
  docCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.65rem 0.75rem',
    borderRadius: '10px',
    border: '1px solid transparent',
    cursor: 'pointer',
    transition: 'var(--transition-fast)',
  },
  docInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    width: '80%',
  },
  iconWrapper: {
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '8px',
    padding: '0.35rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docMeta: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  docName: {
    fontSize: '0.85rem',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  docType: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
  },
  deleteBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '0.2rem',
    borderRadius: '4px',
    transition: 'var(--transition-fast)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    borderTop: '1px solid var(--glass-border)',
    paddingTop: '0.75rem',
    display: 'flex',
    justifyContent: 'center',
  },
  versionChip: {
    background: 'rgba(139, 92, 246, 0.1)',
    color: 'var(--primary)',
    border: '1px solid rgba(139, 92, 246, 0.2)',
    padding: '0.2rem 0.6rem',
    borderRadius: '20px',
    fontSize: '0.7rem',
    fontWeight: '600',
  }
};
