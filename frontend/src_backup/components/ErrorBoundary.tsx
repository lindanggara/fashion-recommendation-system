import { Component, ReactNode } from 'react'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: any
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error: error, errorInfo: null }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({ error: error, errorInfo: errorInfo })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    window.location.href = '/'
  }

  handleRefresh = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: 32, padding: '48px 40px', maxWidth: 500, textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ width: 80, height: 80, borderRadius: 40, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <AlertCircle size={40} color="#ef4444" />
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1f2937', marginBottom: 12 }}>Terjadi Kesalahan</h1>
            <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>Maaf, terjadi kesalahan tak terduga. Tim kami telah diberitahu.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={this.handleRefresh} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#f3f4f6', border: 'none', borderRadius: 40, cursor: 'pointer', fontSize: 14, fontWeight: 500, color: '#374151' }}>
                <RefreshCw size={16} /> Refresh
              </button>
              <button onClick={this.handleReset} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none', borderRadius: 40, cursor: 'pointer', fontSize: 14, fontWeight: 600, color: 'white' }}>
                <Home size={16} /> Kembali ke Beranda
              </button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
