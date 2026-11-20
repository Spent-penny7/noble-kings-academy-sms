import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Portal Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#ffffff', padding: '24px', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>🏫</div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, margin: '0 0 8px', color: '#ffffff' }}>Noble Kings Academy Portal</h2>
          <p style={{ color: '#cbd5e1', fontSize: '0.95rem', maxWidth: '480px', marginBottom: '24px', lineHeight: 1.6 }}>
            The school portal session encountered a temporary display refresh. Click below to reload cleanly.
          </p>
          <button
            onClick={() => {
              localStorage.removeItem('sms_mock_session');
              window.location.href = '/login';
            }}
            style={{ background: '#16a34a', color: '#ffffff', padding: '12px 28px', borderRadius: '8px', border: 'none', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(22, 163, 74, 0.4)' }}
          >
            🔄 Reload School Portal
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
