import { Link } from 'react-router-dom'
import { Home, Search, ArrowLeft } from 'lucide-react'

export default function NotFoundPage({ theme }: { theme: string }) {
  const isDark = theme === 'dark'
  return (
    <div style={{ minHeight: 'calc(100vh - 120px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isDark ? '#0f0f1a' : '#f5f3ff', padding: '40px 20px' }}>
      <div style={{ textAlign: 'center', maxWidth: 500 }}>
        <div style={{ fontSize: 120, fontWeight: 800, background: 'linear-gradient(135deg, #7c3aed, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 24, lineHeight: 1 }}>404</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: isDark ? '#f3f4f6' : '#1f2937', marginBottom: 12 }}>Halaman Tidak Ditemukan</h1>
        <p style={{ fontSize: 16, color: isDark ? '#9ca3af' : '#6b7280', marginBottom: 32, lineHeight: 1.6 }}>Maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan.</p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/"><button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none', borderRadius: 40, color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}><Home size={18} /> Kembali ke Beranda</button></Link>
          <button onClick={() => window.history.back()} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: 'transparent', border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`, borderRadius: 40, color: isDark ? '#f3f4f6' : '#374151', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}><ArrowLeft size={18} /> Halaman Sebelumnya</button>
        </div>
        <div style={{ marginTop: 48, paddingTop: 32, borderTop: `1px solid ${isDark ? '#1f2937' : '#e5e7eb'}` }}>
          <p style={{ fontSize: 14, color: isDark ? '#9ca3af' : '#6b7280', marginBottom: 16 }}>Atau coba halaman berikut:</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/recommender"><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 16px', background: isDark ? '#1f2937' : '#f3f4f6', borderRadius: 30, fontSize: 13, color: isDark ? '#d1d5db' : '#4b5563' }}><Search size={14} /> Recommender</span></Link>
            <Link to="/dashboard"><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 16px', background: isDark ? '#1f2937' : '#f3f4f6', borderRadius: 30, fontSize: 13, color: isDark ? '#d1d5db' : '#4b5563' }}>Dashboard</span></Link>
            <Link to="/about"><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 16px', background: isDark ? '#1f2937' : '#f3f4f6', borderRadius: 30, fontSize: 13, color: isDark ? '#d1d5db' : '#4b5563' }}>About</span></Link>
          </div>
        </div>
      </div>
    </div>
  )
}
