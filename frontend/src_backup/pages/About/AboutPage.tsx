import { ShoppingBag, Users, Package, TrendingUp, Award, Zap, Heart, Globe, Clock, Brain, Table2, Code2 } from 'lucide-react'
import { useState } from 'react'

export default function AboutPage({ theme }: { theme: string }) {
  const isDark   = theme === 'dark'
  const bg       = isDark ? '#0f0f1a'  : '#f4f3ff'
  const card     = isDark ? '#1e1e32'  : '#ffffff'
  const cardSub  = isDark ? '#16162a'  : '#f5f3ff'
  const text     = isDark ? '#e2e8f0'  : '#111827'
  const sub      = isDark ? '#94a3b8'  : '#6b7280'
  const border   = isDark ? '#2a2a4a'  : '#ede9fe'
  const accent   = '#7c5af3'
  const accentDk = '#5b4bd6'
  const heroBg   = isDark ? '#1a1540' : '#ede9fe'
  const heroText = isDark ? '#c4b5fd' : '#4c3db5'
  const heroSub  = isDark ? '#a78bfa' : '#6d5de0'

  const [clickedCard, setClickedCard] = useState<string | null>(null)

  const R = {
    card: {
      background: card,
      border: `1px solid ${border}`,
      borderRadius: 24,
      padding: '24px 28px',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
    } as React.CSSProperties,
    // KARTU BESAR untuk Misi, Visi, dan Developer
    largeCard: {
      background: card,
      border: `1px solid ${border}`,
      borderRadius: 28,
      padding: '32px 36px',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
    } as React.CSSProperties,
    iconBox: (bg: string) => ({
      width: 56, height: 56,
      borderRadius: 16,
      background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
      transition: 'all 0.3s ease',
    } as React.CSSProperties),
    tag: {
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: cardSub,
      border: `1px solid ${border}`,
      borderRadius: 100,
      padding: '5px 16px',
      fontSize: 13, color: sub,
      transition: 'all 0.2s ease',
    } as React.CSSProperties,
    tagAccent: {
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: isDark ? '#2a2040' : '#ede9fe',
      border: `1px solid ${isDark ? '#4c3db5' : '#c4b5fd'}`,
      borderRadius: 100,
      padding: '5px 16px',
      fontSize: 13, color: isDark ? '#c4b5fd' : '#4c3db5',
      fontWeight: 600,
      transition: 'all 0.2s ease',
    } as React.CSSProperties,
    dot: (c: string) => ({
      width: 10, height: 10,
      borderRadius: '50%',
      background: c,
      flexShrink: 0,
      marginTop: 8,
    } as React.CSSProperties),
    sectionLabel: {
      fontSize: 14, fontWeight: 700,
      letterSpacing: '0.08em',
      color: sub,
      textTransform: 'uppercase' as const,
      margin: '0 0 16px',
    },
    divider: {
      border: 'none',
      borderTop: `1px solid ${border}`,
      margin: '36px 0',
    } as React.CSSProperties,
  }

  const metrics = [
    { id: 'produk', val: '105K+',  label: 'Produk',      icon: Package,    color: accentDk, bg: isDark ? '#2a2040' : '#ede9fe', strongColor: '#7c5af3' },
    { id: 'pelanggan', val: '1.37M+', label: 'Pelanggan',   icon: Users,      color: '#0f766e', bg: isDark ? '#0d2926' : '#ccfbf1', strongColor: '#14b8a6' },
    { id: 'transaksi', val: '31.7M+', label: 'Transaksi',   icon: TrendingUp, color: '#b45309', bg: isDark ? '#2e1f00' : '#fef3c7', strongColor: '#f97316' },
    { id: 'rmse', val: '0.0794', label: 'SVD RMSE',    icon: Award,      color: '#be185d', bg: isDark ? '#2e0d1c' : '#fce7f3', strongColor: '#ec4899' },
  ]

  const techs = [
    { id: 'fastapi', name: 'FastAPI',   desc: 'Backend API',     icon: Zap,    color: '#0f766e', bg: isDark ? '#0d2926' : '#ccfbf1', strongColor: '#14b8a6' },
    { id: 'react', name: 'React + TS',desc: 'Frontend',        icon: Code2,  color: '#1d4ed8', bg: isDark ? '#0d1e3e' : '#dbeafe', strongColor: '#3b82f6' },
    { id: 'als', name: 'ALS / SVD', desc: 'Rec. model',      icon: Brain,  color: accentDk, bg: isDark ? '#2a2040' : '#ede9fe', strongColor: '#7c5af3' },
    { id: 'pandas', name: 'Pandas',    desc: 'Data processing', icon: Table2, color: '#b45309', bg: isDark ? '#2e1f00' : '#fef3c7', strongColor: '#f97316' },
  ]

  const methods = [
    {
      id: 'cf',
      title: 'Collaborative Filtering (SVD / ALS)',
      tag: 'w_cf = 0.60', accent: true,
      desc: 'Matrix factorization berdasarkan pola pembelian pelanggan serupa. RMSE: 0.0794 · MAE: 0.0265',
      dot: accent,
      strongColor: '#7c5af3',
    },
    {
      id: 'cbf',
      title: 'Content-Based Filtering (TF-IDF)',
      tag: 'w_cbf = 0.40', accent: false,
      desc: 'Cosine similarity berdasarkan 7 fitur produk: nama, tipe, grup, warna, tampilan, seksi, dan garment.',
      dot: '#0f766e',
      strongColor: '#14b8a6',
    },
    {
      id: 'hybrid',
      title: 'Hybrid Recommendation',
      tag: 'Production ✓', accent: true,
      desc: 'Kombinasi CF + CBF untuk rekomendasi yang lebih akurat dan personal di seluruh katalog H&M.',
      dot: '#be185d',
      strongColor: '#ec4899',
    },
  ]

  // Component untuk kartu biasa
  function ClickableCard({ id, children, color, strongColor, onClick, isActive, style = {} }: any) {
    const activeColor = strongColor || color || accent
    return (
      <div 
        onClick={() => onClick(id === isActive ? null : id)}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.transform = 'translateY(-4px)'
            e.currentTarget.style.boxShadow = `0 16px 32px -12px ${activeColor}80`
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
          }
        }}
        style={{
          background: isActive ? `${activeColor}25` : card,
          border: isActive ? `2px solid ${activeColor}` : `1px solid ${border}`,
          borderRadius: 24,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
          boxShadow: isActive ? `0 16px 32px -12px ${activeColor}99` : 'none',
          ...style,
        }}
      >
        {children}
      </div>
    )
  }

  // Component untuk KARTU BESAR (Misi, Visi, Developer)
  function LargeClickableCard({ id, children, color, strongColor, onClick, isActive, style = {} }: any) {
    const activeColor = strongColor || color || accent
    return (
      <div 
        onClick={() => onClick(id === isActive ? null : id)}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.transform = 'translateY(-6px)'
            e.currentTarget.style.boxShadow = `0 20px 40px -12px ${activeColor}80`
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
          }
        }}
        style={{
          background: isActive ? `${activeColor}25` : card,
          border: isActive ? `2px solid ${activeColor}` : `1px solid ${border}`,
          borderRadius: 28,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          transform: isActive ? 'translateY(-3px)' : 'translateY(0)',
          boxShadow: isActive ? `0 20px 40px -12px ${activeColor}99` : 'none',
          padding: '32px 36px',
          ...style,
        }}
      >
        {children}
      </div>
    )
  }

  return (
    <div style={{ background: bg, minHeight: 'calc(100vh - 120px)', fontFamily: "'Inter',-apple-system,sans-serif" }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 2rem 64px' }}>

        {/* ── Hero ────────────────────────────────────── */}
        <div style={{ 
          background: heroBg, 
          borderRadius: 36, 
          padding: '3rem 2.5rem', 
          textAlign: 'center', 
          marginBottom: 32,
          transition: 'all 0.3s ease',
        }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: 8, 
            background: isDark ? '#2a2040' : '#ddd6fe', 
            borderRadius: 100, 
            padding: '6px 20px', 
            marginBottom: 24 
          }}>
            <ShoppingBag size={15} color={isDark ? '#c4b5fd' : accentDk} />
            <span style={{ fontSize: 14, fontWeight: 600, color: isDark ? '#c4b5fd' : accentDk }}>About FashionRec</span>
          </div>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.2rem)', fontWeight: 800, color: heroText, margin: '0 0 18px', lineHeight: 1.2 }}>
            Tentang <span style={{ color: accent }}>FashionRec</span>
          </h1>
          <p style={{ fontSize: 18, color: heroSub, maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
            Sistem rekomendasi fashion berbasis AI untuk retailer H&M — kombinasi Collaborative Filtering, Content-Based Filtering, dan Hybrid Recommendation.
          </p>
        </div>

        {/* ── Metrics ─────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
          {metrics.map(m => {
            const Icon = m.icon
            const isActive = clickedCard === m.id
            return (
              <ClickableCard 
                key={m.id} 
                id={m.id} 
                color={m.color}
                strongColor={m.strongColor}
                onClick={setClickedCard}
                isActive={isActive}
                style={{ textAlign: 'center', padding: '24px 16px' }}
              >
                <div style={{ ...R.iconBox(m.bg), margin: '0 auto 14px' }}>
                  <Icon size={22} color={m.color} />
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: isActive ? m.strongColor : m.color }}>{m.val}</div>
                <div style={{ fontSize: 14, color: sub, marginTop: 4 }}>{m.label}</div>
              </ClickableCard>
            )
          })}
        </div>

        {/* ── Misi & Visi (KARTU BESAR) ────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 40 }}>
          <LargeClickableCard 
            id="misi" 
            color="#be185d" 
            strongColor="#ec4899"
            onClick={setClickedCard} 
            isActive={clickedCard === 'misi'}
          >
            <div style={{ ...R.iconBox(isDark ? '#2e0d1c' : '#fce7f3'), marginBottom: 20 }}>
              <Heart size={24} color={clickedCard === 'misi' ? '#ec4899' : '#be185d'} />
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: clickedCard === 'misi' ? '#ec4899' : text, margin: '0 0 12px' }}>Misi kami</h3>
            <p style={{ fontSize: 16, color: sub, lineHeight: 1.8, margin: 0 }}>
              Memberdayakan retailer fashion dengan sistem rekomendasi cerdas yang meningkatkan pengalaman pelanggan dan mendorong pertumbuhan bisnis berbasis data.
            </p>
          </LargeClickableCard>

          <LargeClickableCard 
            id="visi" 
            color="#0f766e" 
            strongColor="#14b8a6"
            onClick={setClickedCard} 
            isActive={clickedCard === 'visi'}
          >
            <div style={{ ...R.iconBox(isDark ? '#0d2926' : '#ccfbf1'), marginBottom: 20 }}>
              <Globe size={24} color={clickedCard === 'visi' ? '#14b8a6' : '#0f766e'} />
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: clickedCard === 'visi' ? '#14b8a6' : text, margin: '0 0 12px' }}>Visi kami</h3>
            <p style={{ fontSize: 16, color: sub, lineHeight: 1.8, margin: 0 }}>
              Menjadi platform rekomendasi fashion terdepan di Indonesia yang mendukung SDGs 9 melalui inovasi AI yang berkelanjutan.
            </p>
          </LargeClickableCard>
        </div>

        <hr style={R.divider} />

        {/* ── Tech Stack ──────────────────────────────── */}
        <p style={R.sectionLabel}>Teknologi yang digunakan</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
          {techs.map(t => {
            const Icon = t.icon
            const isActive = clickedCard === t.id
            return (
              <ClickableCard 
                key={t.id} 
                id={t.id} 
                color={t.color}
                strongColor={t.strongColor}
                onClick={setClickedCard}
                isActive={isActive}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 20px' }}
              >
                <div style={R.iconBox(t.bg)}>
                  <Icon size={20} color={t.color} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: isActive ? t.strongColor : text }}>{t.name}</div>
                  <div style={{ fontSize: 13, color: sub }}>{t.desc}</div>
                </div>
              </ClickableCard>
            )
          })}
        </div>

        <hr style={R.divider} />

        {/* ── Methods ─────────────────────────────────── */}
        <p style={R.sectionLabel}>Metode rekomendasi</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32 }}>
          {methods.map(m => (
            <div key={m.id} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={R.dot(m.dot)} />
              <ClickableCard 
                id={m.id} 
                color={m.accent ? accent : '#0f766e'}
                strongColor={m.strongColor}
                onClick={setClickedCard}
                isActive={clickedCard === m.id}
                style={{ flex: 1, padding: '18px 24px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: clickedCard === m.id ? m.strongColor : text }}>{m.title}</span>
                  <span style={m.accent ? R.tagAccent : R.tag}>{m.tag}</span>
                </div>
                <p style={{ fontSize: 14, color: sub, margin: 0, lineHeight: 1.6 }}>{m.desc}</p>
              </ClickableCard>
            </div>
          ))}
        </div>

        <hr style={R.divider} />

        {/* ── Developer (KARTU BESAR) ──────────────────── */}
        <p style={R.sectionLabel}>Tim pengembang</p>
        <LargeClickableCard 
          id="developer" 
          color={accent}
          strongColor={accent}
          onClick={setClickedCard}
          isActive={clickedCard === 'developer'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' }}>
            <div style={{ 
              width: 90, height: 90, 
              borderRadius: '50%', 
              background: isDark ? '#2a2040' : '#ede9fe', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              border: `3px solid ${clickedCard === 'developer' ? accent : (isDark ? '#4c3db5' : '#c4b5fd')}`, 
              flexShrink: 0 
            }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: clickedCard === 'developer' ? accent : (isDark ? '#c4b5fd' : accentDk) }}>LA</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: clickedCard === 'developer' ? accent : text, marginBottom: 8 }}>Linda Anggara Wati</div>
              <div style={{ fontSize: 16, color: sub, marginBottom: 6 }}>Project Lead · NRP 3324600008</div>
              <div style={{ fontSize: 15, color: sub }}>Sains Data Terapan — Politeknik Elektronika Negeri Surabaya</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end' }}>
              <span style={R.tagAccent}><Award size={14} /> SDGs 9</span>
              <span style={R.tag}><Clock size={14} /> 2026</span>
            </div>
          </div>
        </LargeClickableCard>

        {/* ── SDGs ────────────────────────────────────── */}
        <div style={{ 
          background: isDark ? '#1a1540' : '#ede9fe', 
          borderRadius: 32, 
          padding: '3rem 2.5rem', 
          textAlign: 'center',
          transition: 'all 0.3s ease',
          marginTop: 32,
        }}>
          <div style={{ 
            width: 70, height: 70, 
            borderRadius: 22, 
            background: isDark ? '#2a2040' : '#ddd6fe', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 20px' 
          }}>
            <Globe size={34} color={isDark ? '#c4b5fd' : accentDk} />
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: isDark ? '#c4b5fd' : '#26215C', margin: '0 0 14px' }}>
            SDGs 9: Industry, Innovation & Infrastructure
          </h3>
          <p style={{ fontSize: 16, color: isDark ? '#a78bfa' : '#534AB7', maxWidth: 560, margin: '0 auto', lineHeight: 1.8 }}>
            FashionRec berkontribusi pada pembangunan infrastruktur teknologi yang inovatif dan berkelanjutan di industri fashion ritel Indonesia.
          </p>
        </div>

        <div style={{ textAlign: 'center', marginTop: 40, paddingTop: 28, borderTop: `1px solid ${border}` }}>
          <p style={{ fontSize: 14, color: sub, margin: 0 }}>
            © 2026 FashionRec · Linda Anggara Wati · 3324600008
          </p>
        </div>

      </div>
    </div>
  )
}