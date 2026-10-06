import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import 'katex/dist/katex.min.css';
import './index.css';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Crash intercepted by ErrorBoundary:', error, errorInfo);
  }

  handleAutoRepair = () => {
    try {
      const keysToCheck = [
        'bpsc_custom_questions',
        'bpsc_custom_mock_tests',
        'bpsc_deleted_question_ids',
        'bpsc_deleted_test_ids',
        'bpsc_bookmarked_ids'
      ];
      for (const k of keysToCheck) {
        const val = localStorage.getItem(k);
        if (val) {
          try {
            JSON.parse(val);
          } catch {
            localStorage.removeItem(k);
          }
        }
      }
    } catch {}
    window.location.reload();
  };

  handleReset = () => {
    try {
      localStorage.clear();
    } catch {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#0A0F1D',
          color: '#F8FAFC',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '540px',
            width: '100%',
            backgroundColor: '#0F172A',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            padding: '32px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            textAlign: 'left'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              backgroundColor: 'rgba(245, 165, 36, 0.15)',
              color: '#F5A524',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px', color: '#FFFFFF', textAlign: 'center' }}>
              Portal Recovery & Diagnostics
            </h2>
            <p style={{ fontSize: '13px', color: '#94A3B8', lineHeight: '1.6', marginBottom: '18px', textAlign: 'center' }}>
              An interruption occurred while loading. Safety systems have protected your saved exams and progress.
            </p>

            {this.state.error && (
              <div style={{
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: '14px',
                padding: '12px 14px',
                marginBottom: '20px'
              }}>
                <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#F87171', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Error Details:
                </div>
                <div style={{ fontSize: '12px', fontFamily: 'monospace', color: '#FECACA', marginTop: '4px', wordBreak: 'break-word' }}>
                  {this.state.error.message || String(this.state.error)}
                </div>
                {this.state.error.stack && (
                  <details style={{ marginTop: '8px', fontSize: '11px', color: '#94A3B8' }}>
                    <summary style={{ cursor: 'pointer', outline: 'none' }}>View Technical Stack Trace</summary>
                    <pre style={{
                      marginTop: '6px',
                      padding: '8px',
                      backgroundColor: '#020617',
                      borderRadius: '8px',
                      overflowX: 'auto',
                      fontSize: '10px',
                      color: '#64748B',
                      maxHeight: '120px'
                    }}>
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  width: '100%',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  backgroundColor: '#F5A524',
                  color: '#0A0F1D',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Reload Portal
              </button>
              <button
                onClick={this.handleAutoRepair}
                style={{
                  width: '100%',
                  padding: '10px 20px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(59, 130, 246, 0.15)',
                  color: '#60A5FA',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  cursor: 'pointer'
                }}
              >
                Auto-Repair Storage & Restart
              </button>
              <button
                onClick={this.handleReset}
                style={{
                  width: '100%',
                  padding: '9px 20px',
                  borderRadius: '12px',
                  backgroundColor: 'transparent',
                  color: '#EF4444',
                  fontWeight: '600',
                  fontSize: '12px',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  cursor: 'pointer'
                }}
              >
                Reset Storage & Clean Start
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
