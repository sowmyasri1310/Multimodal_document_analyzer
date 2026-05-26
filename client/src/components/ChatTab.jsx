import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, MicOff, Volume2, VolumeX, Sparkles, User, Cpu } from 'lucide-react';

export default function ChatTab({ doc }) {
  if (!doc) return null;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const messagesEndRef = useRef(null);

  // Web Speech API interfaces
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognitionRef = useRef(null);

  // Load chat memory on mount or doc change
  useEffect(() => {
    fetchHistory();
    initializeSpeechRecognition();
    
    // Cleanup synthesis when shifting docs
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [doc._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const fetchHistory = async () => {
    try {
      const response = await fetch(`/api/documents/${doc._id}/chat`);
      if (response.ok) {
        const chatData = await response.json();
        setMessages(chatData.messages || []);
      }
    } catch (err) {
      console.error('Error fetching chat history:', err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Initialize Speech-to-Text Recognition
  const initializeSpeechRecognition = () => {
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => (prev ? prev + ' ' + transcript : transcript));
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech-to-text recognition is not supported in this browser. Try Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      window.speechSynthesis.cancel(); // Stop reading if speaking
      recognitionRef.current.start();
    }
  };

  // Text-to-Speech Speak handler
  const speakText = (text) => {
    if (!speechEnabled) return;
    
    // Cancel active synthesis first
    window.speechSynthesis.cancel();

    // Clean markdown characters like asterisks for cleaner reading
    const cleanText = text.replace(/[*_#`\-]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // Optional: try getting a premium female voice if available
    const voices = window.speechSynthesis.getVoices();
    const targetVoice = voices.find(voice => voice.name.includes('Google') || voice.name.includes('Natural'));
    if (targetVoice) utterance.voice = targetVoice;

    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (textToSend = input) => {
    const trimmedText = textToSend.trim();
    if (!trimmedText || loading) return;

    // Append user message immediately locally
    const userMsg = { role: 'user', content: trimmedText, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`/api/documents/${doc._id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: trimmedText })
      });

      if (!response.ok) throw new Error('Failed to get answer');

      const data = await response.json();
      
      const aiReply = { role: 'model', content: data.answer, timestamp: new Date() };
      setMessages(prev => [...prev, aiReply]);
      
      // Trigger voice output
      speakText(data.answer);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', content: 'Apologies, I encountered an issue processing that query. Please verify the backend logs.', timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  const getQuickPrompts = () => {
    switch (doc.category) {
      case 'resume':
        return ['List missing skills', 'Summarize experience', 'Review ATS score details'];
      case 'invoice':
        return ['What is total amount?', 'Is arithmetic total correct?', 'Extract company and date'];
      case 'medical':
        return ['Summarize clinical findings', 'Highlight abnormal reports', 'What are recommendations?'];
      case 'paper':
        return ['Explain core methodology', 'What are the main findings?', 'Summarize abstract'];
      case 'contract':
      default:
        return ['Summarize core clauses', 'Highlight risk factors', 'List key deadlines'];
    }
  };

  return (
    <div style={styles.container} className="animate-fade-in">
      {/* Header Controls */}
      <div style={styles.chatHeader}>
        <div>
          <h3>Chat Context Board</h3>
          <span style={styles.subText}>AI holds document context and conversation history.</span>
        </div>
        
        <button 
          onClick={() => {
            const nextVal = !speechEnabled;
            setSpeechEnabled(nextVal);
            if (!nextVal) window.speechSynthesis.cancel();
          }}
          style={{
            ...styles.voiceToggleBtn,
            borderColor: speechEnabled ? 'var(--primary)' : 'var(--glass-border)',
            background: speechEnabled ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
            color: speechEnabled ? 'var(--primary)' : 'var(--text-secondary)'
          }}
          title={speechEnabled ? 'Disable Voice Read-Aloud' : 'Enable Voice Read-Aloud'}
          className="tab-btn"
        >
          {speechEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          <span>{speechEnabled ? 'Voice Aloud: ON' : 'Voice Aloud: OFF'}</span>
        </button>
      </div>

      {/* Message History Scroller */}
      <div style={styles.chatScroller} className="glass-card">
        {messages.length === 0 && !loading ? (
          <div style={styles.chatGreeting}>
            <Sparkles size={36} style={{ color: 'var(--primary)', opacity: 0.7, marginBottom: '0.75rem' }} />
            <h4>Document Context Active!</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: '360px', margin: '0.25rem 0 1rem 0' }}>
              Ask anything about "{doc.fileName}". Click quick prompts below to get started.
            </p>
            <div style={styles.quickPromptsGrid}>
              {getQuickPrompts().map((p, idx) => (
                <button 
                  key={idx} 
                  onClick={() => handleSend(p)}
                  style={styles.quickChip}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={styles.msgList}>
            {messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              return (
                <div 
                  key={idx} 
                  style={{
                    ...styles.msgRow,
                    justifyContent: isUser ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div 
                    style={{
                      ...styles.msgCard,
                      backgroundColor: isUser ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                      borderColor: isUser ? 'rgba(139, 92, 246, 0.3)' : 'var(--glass-border)',
                      borderTopRightRadius: isUser ? '0' : '12px',
                      borderTopLeftRadius: isUser ? '12px' : '0'
                    }}
                  >
                    <div style={styles.cardHeader}>
                      <div style={styles.roleTag}>
                        {isUser ? <User size={12} /> : <Cpu size={12} style={{ color: 'var(--secondary)' }} />}
                        <span style={{ color: isUser ? '#fff' : 'var(--text-secondary)' }}>
                          {isUser ? 'You' : 'AuraDoc AI'}
                        </span>
                      </div>
                      <span style={styles.timestamp}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p style={styles.msgBody}>{msg.content}</p>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div style={styles.msgRow} className="animate-fade-in">
                <div style={styles.msgCard} className="glass-card">
                  <div style={styles.loadingBubble}>
                    <div style={{ ...styles.dot, animationDelay: '0s' }} />
                    <div style={{ ...styles.dot, animationDelay: '0.2s' }} />
                    <div style={{ ...styles.dot, animationDelay: '0.4s' }} />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Control Input Bar */}
      <div style={styles.inputContainer}>
        {/* Speak Input Button */}
        <button 
          onClick={toggleListening}
          style={{
            ...styles.voiceBtn,
            borderColor: isListening ? 'var(--accent-pink)' : 'var(--glass-border)',
            background: isListening ? 'rgba(236, 72, 153, 0.15)' : 'rgba(255,255,255,0.02)',
            color: isListening ? 'var(--accent-pink)' : 'var(--text-secondary)'
          }}
          title={isListening ? 'Stop Listening' : 'Speak Message'}
          className="tab-btn"
        >
          {isListening ? <MicOff size={18} /> : <Mic size={18} />}
        </button>

        <input 
          type="text" 
          placeholder={isListening ? 'Listening...' : 'Ask about key findings, deadlines, sums...'} 
          value={input} 
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
          style={styles.chatInput}
          className="glass-input"
          disabled={loading}
        />

        <button 
          onClick={() => handleSend()}
          style={styles.sendBtn}
          className="glow-button animate-fade-in"
          disabled={loading || !input.trim()}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '580px',
    marginTop: '1rem',
    gap: '1rem',
  },
  chatHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subText: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
  },
  voiceToggleBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    border: '1px solid',
    padding: '0.4rem 0.8rem',
    fontSize: '0.8rem',
  },
  chatScroller: {
    flex: '1',
    overflowY: 'auto',
    padding: '1.5rem',
    background: 'rgba(7, 9, 19, 0.4)',
  },
  chatGreeting: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    textAlign: 'center',
  },
  quickPromptsGrid: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: '520px',
  },
  quickChip: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid var(--glass-border)',
    color: 'var(--text-secondary)',
    padding: '0.4rem 0.8rem',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '0.78rem',
    transition: 'var(--transition-fast)',
  },
  quickChip: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid var(--glass-border)',
    color: 'var(--text-secondary)',
    padding: '0.4rem 0.8rem',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '0.78rem',
    transition: 'var(--transition-fast)',
    margin: '0.2rem',
  },
  msgList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  msgRow: {
    display: 'flex',
    width: '100%',
  },
  msgCard: {
    maxWidth: '80%',
    padding: '1rem 1.25rem',
    borderRadius: '12px',
    border: '1px solid',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
    gap: '2rem',
  },
  roleTag: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    fontWeight: '700',
  },
  timestamp: {
    fontWeight: '500',
  },
  msgBody: {
    fontSize: '0.88rem',
    lineHeight: '1.5',
    color: 'var(--text-primary)',
    whiteSpace: 'pre-wrap',
  },
  loadingBubble: {
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
    padding: '0.2rem 0.5rem',
  },
  dot: {
    width: '6px',
    height: '6px',
    background: 'var(--primary)',
    borderRadius: '50%',
    animation: 'shimmerDot 1.4s infinite ease-in-out',
  },
  inputContainer: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
  },
  voiceBtn: {
    height: '42px',
    width: '42px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid',
    borderRadius: '8px',
    padding: '0',
  },
  chatInput: {
    flex: '1',
    height: '42px',
  },
  sendBtn: {
    height: '42px',
    width: '42px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0',
  }
};
