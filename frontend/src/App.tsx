import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ShoppingBag, Sparkles, LayoutDashboard, Menu, X, Sun, Moon, Home, User, Users, Globe, Info, Mail, MapPin, GraduationCap, Hash } from 'lucide-react'
import DashboardPage from './pages/Dashboard/DashboardPage'
import HomePage from './pages/LandingPage/HomePage'
import AboutPage from './pages/About/AboutPage'
import CustomerHistoryPage from './pages/CustomerHistory/CustomerHistoryPage'
import RecommenderPage from './pages/Recommender/RecommenderPage'
import { Toast } from './components/Toast'
import { useToast } from './hooks/useToast'

// ============================================================
// NAVBAR - ELEGANT & MODERN (Menu ke Kanan dengan tambahan menu)
// ============================================================
function Navbar({ theme, toggleTheme }: { theme: string; toggleTheme: () => void }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = window.location.pathname

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/recommender', label: 'Recommender', icon: Sparkles },
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/customer-history', label: 'History', icon: User },
    { path: '/about', label: 'About', icon: Users },
  ]

  const handleNavigate = (path: string) => {
    window.location.href = path
  }

  const isActive = (path: string) => location === path

  return (
    <nav style={{ 
      background: theme === 'dark' ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
      position: 'sticky',
      top: 0,
      zIndex: 1000,
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0.5rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          {/* Logo - Kiri */}
          <div 
            onClick={() => handleNavigate('/')} 
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}
          >
            <div style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              width: '38px', height: '38px', borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
            }}>
              <ShoppingBag size={18} color="white" strokeWidth={1.8} />
            </div>
            <div>
              <span style={{ 
                fontSize: '1.15rem', fontWeight: 700,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.3px'
              }}>FashionRec</span>
              <span style={{ fontSize: '0.6rem', display: 'block', color: '#667eea', marginTop: '-4px', fontWeight: 500, opacity: 0.8 }}>AI Fashion</span>
            </div>
          </div>

          {/* Navigation - Posisi Kanan */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)
              return (
                <button key={item.path} onClick={() => handleNavigate(item.path)} style={{
                  background: active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
                  border: 'none',
                  color: active ? 'white' : (theme === 'dark' ? '#94a3b8' : '#475569'),
                  fontWeight: active ? '600' : '500',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: active ? '8px 20px' : '8px 16px',
                  borderRadius: '40px', cursor: 'pointer', fontSize: '0.85rem',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: active ? '0 4px 12px rgba(102, 126, 234, 0.3)' : 'none',
                }}>
                  <Icon size={15} strokeWidth={active ? 2 : 1.5} />
                  {item.label}
                </button>
              )
            })}
            
            <button onClick={toggleTheme} style={{
              background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
              border: 'none', borderRadius: '40px', width: '38px', height: '38px',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginLeft: '8px', transition: 'all 0.2s',
            }}>
              {theme === 'dark' ? <Sun size={16} color="#fbbf24" /> : <Moon size={16} color="#667eea" />}
            </button>

            <button onClick={() => setIsMenuOpen(!isMenuOpen)} style={{
              background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
              border: 'none', borderRadius: '40px', width: '38px', height: '38px',
              cursor: 'pointer', display: 'none', alignItems: 'center', justifyContent: 'center',
            }} className="mobile-menu-btn">
              {isMenuOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem', paddingTop: '1rem', borderTop: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` }}>
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)
              return (
                <button key={item.path} onClick={() => { handleNavigate(item.path); setIsMenuOpen(false) }} style={{
                  background: active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
                  border: 'none', color: active ? 'white' : (theme === 'dark' ? '#94a3b8' : '#475569'),
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px',
                  borderRadius: '12px', cursor: 'pointer', width: '100%', fontSize: '0.85rem',
                }}>
                  <Icon size={16} />
                  {item.label}
                </button>
              )
            })}
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        @media (max-width: 768px) { .mobile-menu-btn { display: flex !important; } }
      `}</style>
    </nav>
  )
}

// ============================================================
// FOOTER - FULL WIDTH (DENGAN ICON LUCIDE UNTUK NRP)
// ============================================================
function Footer({ theme }: { theme: string }) {
  const isDark = theme === 'dark'
  const [year] = useState(new Date().getFullYear())
  const primary = '#7c5af3'

  return (
    <footer style={{ 
      background: isDark ? '#0a0a0f' : '#ffffff',
      borderTop: `1px solid ${isDark ? '#1a1a2e' : '#eef2ff'}`,
      marginTop: 'auto',
      padding: '48px 2rem 32px',
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        
        {/* 4 Kolom */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1.2fr 1fr 1fr 1fr', 
          gap: 32,
          marginBottom: 40,
        }}>
          
          {/* Kolom 1: Brand & Deskripsi */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ 
                width: 44, height: 44, 
                borderRadius: 12, 
                background: `linear-gradient(135deg, ${primary}, #5b4bd6)`,
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: `0 4px 12px ${primary}30`,
              }}>
                <ShoppingBag size={22} color="white" />
              </div>
              <div>
                <span style={{ 
                  fontWeight: 800, 
                  fontSize: 18, 
                  background: `linear-gradient(135deg, ${primary}, #5b4bd6)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  FashionRec
                </span>
                <span style={{ 
                  fontSize: 10, 
                  display: 'block', 
                  color: isDark ? '#64748b' : '#94a3b8',
                  marginTop: 2,
                }}>
                  AI Fashion Recommendation
                </span>
              </div>
            </div>
            <p style={{ 
              fontSize: 13, 
              color: isDark ? '#94a3b8' : '#64748b', 
              lineHeight: 1.6,
              marginBottom: 20,
            }}>
              Sistem rekomendasi fashion berbasis AI menggunakan ALS, TF-IDF, dan Association Rules untuk personalisasi pengalaman belanja.
            </p>
            
            {/* SDGs Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: isDark ? '#1e293b' : '#f1f5f9',
              padding: '6px 14px',
              borderRadius: 30,
              border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
            }}>
              <Globe size={13} color={primary} />
              <span style={{ fontSize: 11, fontWeight: 500, color: isDark ? '#cbd5e1' : '#475569' }}>
                SDGs 9: Industry, Innovation & Infrastructure
              </span>
            </div>
          </div>

          {/* Kolom 2: Explore */}
          <div>
            <h4 style={{ 
              fontSize: 15, 
              fontWeight: 700, 
              color: isDark ? '#e2e8f0' : '#1e293b', 
              marginBottom: 18,
              position: 'relative',
              display: 'inline-block',
            }}>
              Explore
              <div style={{
                position: 'absolute',
                bottom: -5,
                left: 0,
                width: 30,
                height: 2,
                background: primary,
                borderRadius: 2,
              }} />
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: 12 }}>
                <a href="/" style={{ fontSize: 13, color: isDark ? '#94a3b8' : '#64748b', textDecoration: 'none', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Home size={14} /> Home
                </a>
              </li>
              <li style={{ marginBottom: 12 }}>
                <a href="/recommender" style={{ fontSize: 13, color: isDark ? '#94a3b8' : '#64748b', textDecoration: 'none', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Sparkles size={14} /> Recommender
                </a>
              </li>
              <li style={{ marginBottom: 12 }}>
                <a href="/dashboard" style={{ fontSize: 13, color: isDark ? '#94a3b8' : '#64748b', textDecoration: 'none', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <LayoutDashboard size={14} /> Dashboard
                </a>
              </li>
              <li style={{ marginBottom: 12 }}>
                <a href="/about" style={{ fontSize: 13, color: isDark ? '#94a3b8' : '#64748b', textDecoration: 'none', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Info size={14} /> About
                </a>
              </li>
              <li style={{ marginBottom: 12 }}>
                <a href="/customer-history" style={{ fontSize: 13, color: isDark ? '#94a3b8' : '#64748b', textDecoration: 'none', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <User size={14} /> Customer History
                </a>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Technology */}
          <div>
            <h4 style={{ 
              fontSize: 15, 
              fontWeight: 700, 
              color: isDark ? '#e2e8f0' : '#1e293b', 
              marginBottom: 18,
              position: 'relative',
              display: 'inline-block',
            }}>
              Technology
              <div style={{
                position: 'absolute',
                bottom: -5,
                left: 0,
                width: 30,
                height: 2,
                background: primary,
                borderRadius: 2,
              }} />
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: 12, fontSize: 13, color: isDark ? '#94a3b8' : '#64748b', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: primary }} /> FastAPI (Backend)
              </li>
              <li style={{ marginBottom: 12, fontSize: 13, color: isDark ? '#94a3b8' : '#64748b', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: primary }} /> React + TypeScript
              </li>
              <li style={{ marginBottom: 12, fontSize: 13, color: isDark ? '#94a3b8' : '#64748b', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: primary }} /> ALS / SVD (CF)
              </li>
              <li style={{ marginBottom: 12, fontSize: 13, color: isDark ? '#94a3b8' : '#64748b', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: primary }} /> TF-IDF (CBF)
              </li>
              <li style={{ marginBottom: 12, fontSize: 13, color: isDark ? '#94a3b8' : '#64748b', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: primary }} /> Association Rules
              </li>
            </ul>
          </div>

          {/* Kolom 4: Information - NRP pakai icon Hash */}
          <div>
            <h4 style={{ 
              fontSize: 15, 
              fontWeight: 700, 
              color: isDark ? '#e2e8f0' : '#1e293b', 
              marginBottom: 18,
              position: 'relative',
              display: 'inline-block',
            }}>
              Information
              <div style={{
                position: 'absolute',
                bottom: -5,
                left: 0,
                width: 30,
                height: 2,
                background: primary,
                borderRadius: 2,
              }} />
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: 12, fontSize: 13, color: isDark ? '#94a3b8' : '#64748b', display: 'flex', alignItems: 'center', gap: 8 }}>
                <User size={14} /> Linda Anggara Wati
              </li>
              <li style={{ marginBottom: 12, fontSize: 13, color: isDark ? '#94a3b8' : '#64748b', display: 'flex', alignItems: 'center', gap: 8 }}>
                <GraduationCap size={14} /> Sains Data Terapan
              </li>
              <li style={{ marginBottom: 12, fontSize: 13, color: isDark ? '#94a3b8' : '#64748b', display: 'flex', alignItems: 'center', gap: 8 }}>
                <MapPin size={14} /> PENS Surabaya
              </li>
              <li style={{ marginBottom: 12, fontSize: 13, color: isDark ? '#94a3b8' : '#64748b', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Mail size={14} /> lindaanggaraw@gmail.com
              </li>
              <li style={{ marginBottom: 12, fontSize: 13, color: isDark ? '#94a3b8' : '#64748b', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Hash size={14} /> NRP: 3324600008
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{ 
          borderTop: `1px solid ${isDark ? '#1a1a2e' : '#eef2ff'}`,
          paddingTop: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}>
          <p style={{ fontSize: 11, color: isDark ? '#94a3b8' : '#64748b', margin: 0 }}>
            © {year} FashionRec | Linda Anggara Wati - 3324600008
          </p>
          <div style={{ fontSize: 10, color: isDark ? '#94a3b8' : '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
            Built with ❤️ for SDGs 9
          </div>
        </div>
      </div>
    </footer>
  )
}

// ============================================================
// MAIN APP - DENGAN TOAST INTEGRATION
// ============================================================
function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const { toast, showToast, hideToast } = useToast()

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark'
    if (savedTheme) setTheme(savedTheme)
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    showToast(`Theme changed to ${newTheme} mode`, 'info')
  }

  const DashboardPageComponent = DashboardPage as any

  // Provide toast functions to child components via context
  // Untuk sementara, kita pass melalui props atau bisa menggunakan Context API

  return (
    <div style={{ 
      background: theme === 'dark' ? '#0f0f1a' : '#f8fafc', 
      minHeight: '100vh', 
      transition: 'all 0.3s ease', 
      display: 'flex', 
      flexDirection: 'column' 
    }}>
      <Router>
        <Navbar theme={theme} toggleTheme={toggleTheme} />
        <Routes>
          <Route path="/" element={<HomePage theme={theme} />} />
          <Route path="/recommender" element={<RecommenderPage theme={theme} />} />
          <Route path="/dashboard" element={<DashboardPageComponent theme={theme} />} />
          <Route path="/about" element={<AboutPage theme={theme} />} />
          <Route path="/customer-history" element={<CustomerHistoryPage theme={theme} />} />
        </Routes>
        <Footer theme={theme} />
      </Router>
      
      {/* Global Toast Component */}
      <Toast 
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={hideToast}
      />
    </div>
  )
}

export default App