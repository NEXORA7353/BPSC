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
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '480px',
            width: '100%',
            backgroundColor: '#0F172A',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            padding: '32px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
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
              margin: '0 auto 16px auto',
              fontSize: '24px',
              fontWeight: 'bold'
            }}>
              !
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px', color: '#FFFFFF' }}>
              पोर्टल रीलोड हो रहा है (Recovering)
            </h2>
            <p style={{ fontSize: '13px', color: '#94A3B8', lineHeight: '1.6', marginBottom: '20px' }}>
              पेज लोड करते समय कोई रुकावट आई थी। नीचे दिए गए बटन से फ्रेश रीलोड करें।
            </p>
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
                cursor: 'pointer',
                marginBottom: '10px'
              }}
            >
              🔄 पुनः लोड करें (Reload Portal)
            </button>
            <button
              onClick={this.handleReset}
              style={{
                width: '100%',
                padding: '10px 20px',
                borderRadius: '12px',
                backgroundColor: 'transparent',
                color: '#EF4444',
                fontWeight: 'bold',
                fontSize: '12px',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                cursor: 'pointer'
              }}
            >
              🧹 डेटा रीसेट एवं फ्रेश स्टार्ट (Reset Cache)
            </button>
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
