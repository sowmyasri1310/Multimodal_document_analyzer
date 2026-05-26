import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, AlertCircle, FilePlus } from 'lucide-react';

export default function Uploader({ onUploadSuccess }) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState(''); // default to Auto-Detect
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    setError(null);
    const validExtensions = ['pdf', 'png', 'jpg', 'jpeg', 'docx'];
    const fileExt = selectedFile.name.split('.').pop().toLowerCase();

    if (!validExtensions.includes(fileExt)) {
      setError('Unsupported file type. Please upload PDF, DOCX, PNG, JPG or JPEG.');
      return;
    }

    if (selectedFile.size > 15 * 1024 * 1024) { // 15MB
      setError('File size too large. Maximum size is 15MB.');
      return;
    }

    setFile(selectedFile);
  };

  const handleUploadSubmit = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setLoadingStep('Uploading document to secure memory...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (category) {
        formData.append('category', category);
      }

      // Quick step timer simulation for smooth micro-animations
      const stepTimer1 = setTimeout(() => setLoadingStep('Running Multimodal OCR & Text Extraction...'), 1200);
      const stepTimer2 = setTimeout(() => setLoadingStep('Deploying AI Model to map fields and anomalies...'), 3000);
      const stepTimer3 = setTimeout(() => setLoadingStep('Saving structured results into MongoDB history...'), 5000);

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Server rejected the file.');
      }

      const analyzedDoc = await response.json();
      onUploadSuccess(analyzedDoc);
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred during file parsing. Please try again.');
      setLoading(false);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div style={styles.container} className="glass-panel animate-fade-in">
      <div style={styles.header}>
        <h2 style={styles.title} className="text-gradient">AuraDoc Multimodal Document Portal</h2>
        <p style={styles.subtitle}>Upload your Invoice, Resume, Medical Report, or Paper for deep cognitive analysis.</p>
      </div>

      {loading ? (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner} className="pulse-border">
            <UploadCloud size={32} style={styles.pulseIcon} />
          </div>
          <h3 style={styles.loadingTitle}>Processing Document</h3>
          <p style={styles.loadingStep}>{loadingStep}</p>
          <div style={styles.progressBarBg}>
            <div style={styles.progressBarFill} />
          </div>
        </div>
      ) : (
        <div style={styles.uploadBody}>
          {/* File Drag Area */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={onButtonClick}
            style={{
              ...styles.dragArea,
              backgroundColor: dragActive ? 'rgba(139, 92, 246, 0.08)' : 'rgba(255, 255, 255, 0.01)',
              borderColor: dragActive ? 'var(--primary)' : 'var(--glass-border)'
            }}
            className="drag-drop-zone"
          >
            <input
              ref={fileInputRef}
              type="file"
              style={styles.fileInput}
              onChange={handleChange}
              accept=".pdf,.docx,.png,.jpg,.jpeg"
            />

            {file ? (
              <div style={styles.selectedFileWrapper}>
                <FilePlus size={44} style={{ color: 'var(--primary)' }} />
                <h4 style={styles.fileName}>{file.name}</h4>
                <p style={styles.fileSize}>({(file.size / 1024 / 1024).toFixed(2)} MB)</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  style={styles.changeBtn}
                >
                  Change File
                </button>
              </div>
            ) : (
              <div style={styles.uploadPrompt}>
                <UploadCloud size={48} style={styles.uploadIcon} />
                <h3>Drag & Drop file here</h3>
                <p style={styles.dragSubtext}>or click to browse from folder</p>
                <span style={styles.supportedTypes}>Supports PDF, PNG, JPG, JPEG, DOCX (Max 15MB)</span>
              </div>
            )}
          </div>

          {/* Controls Bar */}
          <div style={styles.controlsBar}>
            <div style={styles.selectGroup}>
              <label style={styles.label}>Force Category Override (Optional)</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={styles.select}
                className="glass-input glass-select"
              >
                <option value="">AI Auto-Detect (Recommended)</option>
                <option value="resume">Resume / CV</option>
                <option value="invoice">Invoice / Receipt</option>
                <option value="medical">Medical Health Report</option>
                <option value="paper">Academic Research Paper</option>
                <option value="contract">Legal Agreement / Contract</option>
              </select>
            </div>

            <button
              disabled={!file}
              onClick={handleUploadSubmit}
              style={{
                ...styles.analyzeBtn,
                opacity: file ? 1 : 0.5,
                cursor: file ? 'pointer' : 'not-allowed'
              }}
              className="glow-button"
            >
              Analyze Document
            </button>
          </div>

          {error && (
            <div style={styles.errorBanner}>
              <AlertCircle size={16} style={{ color: 'var(--accent-pink)' }} />
              <span>{error}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    margin: '2rem auto',
    maxWidth: '800px',
    width: '100%',
    padding: '2.5rem',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '800',
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
  },
  uploadBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  dragArea: {
    border: '2px dashed var(--glass-border)',
    borderRadius: '16px',
    padding: '3rem 2rem',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'var(--transition-smooth)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileInput: {
    display: 'none',
  },
  uploadPrompt: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
  },
  uploadIcon: {
    color: 'var(--text-secondary)',
    opacity: 0.7,
    marginBottom: '0.5rem',
  },
  dragSubtext: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
  },
  supportedTypes: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    marginTop: '0.5rem',
    background: 'rgba(255,255,255,0.02)',
    padding: '0.2rem 0.6rem',
    borderRadius: '20px',
    border: '1px solid var(--glass-border)',
  },
  selectedFileWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.4rem',
  },
  fileName: {
    fontSize: '1rem',
    fontWeight: '600',
    marginTop: '0.5rem',
  },
  fileSize: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    marginBottom: '1rem',
  },
  changeBtn: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid var(--glass-border)',
    color: 'var(--text-primary)',
    padding: '0.4rem 1rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    transition: 'var(--transition-fast)',
  },
  controlsBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: '1.5rem',
    flexWrap: 'wrap',
    marginTop: '0.5rem',
  },
  selectGroup: {
    flex: '1',
    minWidth: '240px',
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
  analyzeBtn: {
    height: '42px',
    justifyContent: 'center',
    padding: '0 2rem',
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(236, 72, 153, 0.1)',
    border: '1px solid rgba(236, 72, 153, 0.2)',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    fontSize: '0.85rem',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 2rem',
    textAlign: 'center',
  },
  spinner: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    border: '2px solid rgba(139, 92, 246, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1.5rem',
  },
  pulseIcon: {
    color: 'var(--primary)',
    animation: 'pulse 1.5s infinite ease-in-out',
  },
  loadingTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    marginBottom: '0.35rem',
  },
  loadingStep: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    marginBottom: '1.5rem',
  },
  progressBarBg: {
    width: '240px',
    height: '6px',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  progressBarFill: {
    width: '45%',
    height: '100%',
    background: 'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)',
    borderRadius: '3px',
    animation: 'shimmerProgress 2.5s infinite ease-in-out',
  }
};
