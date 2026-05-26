import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Uploader from './components/Uploader';
import InsightsTab from './components/InsightsTab';
import HighlightingTab from './components/HighlightingTab';
import DetectiveTab from './components/DetectiveTab';
import ChatTab from './components/ChatTab';
import MatcherTab from './components/MatcherTab';
import TranslatorTab from './components/TranslatorTab';

import { 
  exportToMarkdown, 
  exportToDocx, 
  exportToPdf 
} from './utils/exportHelper';

import { 
  FileText, 
  Bookmark, 
  Shield, 
  MessageSquareCode, 
  Briefcase, 
  Languages, 
  Download, 
  ChevronDown,
  Sparkles,
  ArrowLeft,
  Menu,
  X
} from 'lucide-react';

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [activeTab, setActiveTab] = useState('insights');
  const [isUploading, setIsUploading] = useState(true);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/documents');
      if (response.ok) {
        const docs = await response.json();
        setDocuments(docs);
        if (docs.length > 0) {
          setSelectedDocId(docs[0]._id);
          setIsUploading(false);
        }
      }
    } catch (err) {
      console.error('Error fetching document history:', err);
    }
  };

  const handleSelectDoc = (id) => {
    setSelectedDocId(id);
    setIsUploading(false);
    // Reset active tab to standard insights
    setActiveTab('insights');
  };

  const handleDeleteDoc = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this document audit logs?')) return;

    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const updatedDocs = documents.filter(doc => doc._id !== id);
        setDocuments(updatedDocs);
        
        if (selectedDocId === id) {
          if (updatedDocs.length > 0) {
            setSelectedDocId(updatedDocs[0]._id);
          } else {
            setSelectedDocId(null);
            setIsUploading(true);
          }
        }
      }
    } catch (err) {
      console.error('Error deleting document:', err);
    }
  };

  const handleUploadSuccess = (newDoc) => {
    setDocuments(prev => [newDoc, ...prev]);
    setSelectedDocId(newDoc._id);
    setIsUploading(false);
    setActiveTab('insights');
  };

  const activeDoc = documents.find(doc => doc._id === selectedDocId);

  // Compile Dynamic tab options
  const tabs = [
    { id: 'insights', label: 'AI Insights', icon: <FileText size={16} /> },
    { id: 'highlighting', label: 'Smart Highlighting', icon: <Bookmark size={16} /> },
    { id: 'detective', label: 'Document Detective', icon: <Shield size={16} /> },
    { id: 'chat', label: 'Chat With PDF', icon: <MessageSquareCode size={16} /> },
    { id: 'translator', label: 'Multi-Language', icon: <Languages size={16} /> }
  ];

  // Resume JD Matcher is visible ONLY for Resume files
  if (activeDoc?.category === 'resume') {
    tabs.splice(4, 0, { id: 'matcher', label: 'JD Matcher', icon: <Briefcase size={16} /> });
  }

  return (
    <div className="app-container">
      {/* Sidebar Drawer Backdrop Overlay */}
      {isSidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar Past Memory Hub */}
      <Sidebar 
        documents={documents}
        selectedDocId={selectedDocId}
        onSelectDoc={(id) => {
          handleSelectDoc(id);
          setIsSidebarOpen(false);
        }}
        onDeleteDoc={handleDeleteDoc}
        onUploadNew={() => {
          setIsUploading(true);
          setIsSidebarOpen(false);
        }}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Panel */}
      <main className="main-content">
        {/* Mobile Header Bar */}
        <div className="mobile-header">
          <button className="menu-btn" onClick={() => setIsSidebarOpen(true)} title="Open Memory Menu">
            <Menu size={20} />
          </button>
          <h2 className="mobile-title">AuraDoc AI</h2>
          <div style={{ width: 28 }} /> {/* spacer to balance layout */}
        </div>

        {isUploading ? (
          <div style={{ flex: '1', display: 'flex', alignItems: 'center' }}>
            <Uploader onUploadSuccess={handleUploadSuccess} />
          </div>
        ) : activeDoc ? (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: '1' }}>
            
            {/* Main Header Row */}
            <div style={styles.headerRow}>
              <div style={styles.headerMeta}>
                <button 
                  onClick={() => setIsUploading(true)} 
                  style={styles.backBtn}
                  title="Upload another file"
                >
                  <ArrowLeft size={16} />
                  <span>Upload New</span>
                </button>
                <div style={styles.fileDetails}>
                  <h2 style={styles.fileName}>{activeDoc.fileName}</h2>
                  <span style={styles.catBadge}>
                    ✨ {activeDoc.category ? activeDoc.category.toUpperCase() : 'OTHER'}
                  </span>
                </div>
              </div>

              {/* Export Options Dropdown */}
              <div style={{ position: 'relative' }}>
                <button 
                  onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                  style={styles.exportBtn}
                  className="glow-button secondary-btn"
                >
                  <Download size={16} />
                  <span>Export Options</span>
                  <ChevronDown size={14} />
                </button>

                {exportDropdownOpen && (
                  <div style={styles.dropdown} className="glass-panel animate-fade-in">
                    <button 
                      onClick={() => { exportToMarkdown(activeDoc); setExportDropdownOpen(false); }}
                      className="dropdown-item"
                    >
                      Export as Markdown (.md)
                    </button>
                    <button 
                      onClick={() => { exportToDocx(activeDoc); setExportDropdownOpen(false); }}
                      className="dropdown-item"
                    >
                      Export as DOCX (.doc)
                    </button>
                    <button 
                      onClick={() => { exportToPdf(); setExportDropdownOpen(false); }}
                      className="dropdown-item"
                    >
                      Print / Save as PDF (.pdf)
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Tabs Selector Bar */}
            <div className="tab-navigation">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Active Tab Panel Body */}
            <div style={styles.tabContentPanel}>
              {activeTab === 'insights' && <InsightsTab doc={activeDoc} />}
              {activeTab === 'highlighting' && <HighlightingTab doc={activeDoc} />}
              {activeTab === 'detective' && <DetectiveTab doc={activeDoc} />}
              {activeTab === 'chat' && <ChatTab doc={activeDoc} />}
              {activeTab === 'matcher' && <MatcherTab doc={activeDoc} />}
              {activeTab === 'translator' && <TranslatorTab doc={activeDoc} />}
            </div>

          </div>
        ) : (
          <div style={styles.emptyPrompt}>
            <Sparkles size={48} style={{ color: 'var(--primary)', marginBottom: '1rem', opacity: 0.8 }} />
            <h2>Upload a file to begin</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Click "New Document" in the sidebar to run forensic analysis.</p>
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--glass-border)',
    paddingBottom: '1.25rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  headerMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
  },
  backBtn: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid var(--glass-border)',
    borderRadius: '10px',
    color: 'var(--text-secondary)',
    padding: '0.5rem 0.85rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.82rem',
    fontFamily: 'var(--font-display)',
    fontWeight: '600',
    transition: 'var(--transition-fast)',
  },
  fileDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
  },
  fileName: {
    fontSize: '1.35rem',
    fontWeight: '800',
    color: '#fff',
    maxWidth: '380px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  catBadge: {
    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)',
    color: 'var(--secondary)',
    border: '1px solid rgba(6, 182, 212, 0.25)',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.68rem',
    fontWeight: '700',
    letterSpacing: '0.05em',
    alignSelf: 'flex-start',
  },
  exportBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
  },
  dropdown: {
    position: 'absolute',
    right: '0',
    top: '105%',
    width: '230px',
    zIndex: '100',
    padding: '0.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    backgroundColor: '#111215e6',
  },
  tabContentPanel: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
  },
  emptyPrompt: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '1',
    textAlign: 'center',
  }
};
