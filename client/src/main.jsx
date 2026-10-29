import React, { Component, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './print.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8fafc',
          padding: '2rem',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <div style={{
            maxWidth: '540px',
            width: '100%',
            background: '#ffffff',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0',
            textAlign: 'center'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#fee2e2',
              color: '#dc2626',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              marginBottom: '1rem'
            }}>
              ⚠️
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
              Terjadi Kendala Memuat Aplikasi
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              Sistem mendeteksi galat saat memuat komponen antarmuka. Silakan lakukan pembersihan cache peramban atau tekan tombol di bawah ini.
            </p>
            <div style={{
              background: '#f1f5f9',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.75rem',
              color: '#334155',
              fontFamily: 'monospace',
              textAlign: 'left',
              marginBottom: '1.5rem',
              maxHeight: '120px',
              overflowY: 'auto'
            }}>
              {String(this.state.error?.message || this.state.error)}
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={() => { localStorage.clear(); window.location.href = '/'; }}
                style={{
                  background: '#16a34a',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                Reset Cache & Muat Ulang
              </button>
            </div>
          </div>
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
