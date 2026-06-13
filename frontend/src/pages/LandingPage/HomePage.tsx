import { useState } from 'react'
import {
  ShoppingBag, Sparkles, Package, Users,
  CreditCard, TrendingUp, Zap, Link2, BarChart3, Settings2, ArrowRight, ChevronDown
} from 'lucide-react'

// ─── Palette ─────────────────────────────────────────────────
const P = {
  indigo: '#5b5ef4',
  indigoD: '#4547d6',
  indigoL: '#eeeeff',
  violet: '#7c5af3',
  gray: '#6b7280',
  grayL: '#f3f4f6',
  border: '#e5e7eb',
  text: '#111827',
  sub: '#6b7280',
  white: '#ffffff',
}

const statCards = [
  { label: 'Spent this month', value: 'Rp 34.6M', icon: BarChart3, color: P.indigo },
  { label: 'Transactions', value: '31.7M', icon: CreditCard, color: P.violet },
  { label: 'New Customers', value: '694', icon: Users, color: '#22c55e' },
  { label: 'MAP@12', value: '0.00675', icon: TrendingUp, color: '#f59e0b' },
]

const features = [
  {
    title: 'Fast & Scalable',
    desc: 'ALS Matrix Factorization handles millions of user-item interactions with lightning-fast inference.',
    detail: 'Model ALS (Alternating Least Squares) dilatih pada matriks interaksi customer-produk berskala besar. Proses inference dioptimalkan agar rekomendasi dapat dihasilkan secara real-time, bahkan untuk basis data dengan jutaan baris transaksi.',
    icon: Zap,
    accent: P.indigo,
    visual: 'gauge',
  },
  {
    title: 'Custom Integrations',
    desc: 'Plug into your existing stack — from product catalog APIs to marketing platforms.',
    detail: 'Sistem rekomendasi diekspos melalui REST API sehingga mudah diintegrasikan dengan katalog produk, sistem e-commerce, maupun platform marketing yang sudah ada tanpa perlu migrasi data besar-besaran.',
    icon: Link2,
    accent: '#a78bfa',
    visual: 'orbit',
  },
  {
    title: 'Smart Insights',
    desc: 'Turn transaction data into decisions with real-time analytics and performance tracking.',
    detail: 'Dashboard menampilkan metrik performa model (MAP@12, precision), tren transaksi, serta insight pelanggan secara visual agar tim merchandising dapat mengambil keputusan berbasis data.',
    icon: BarChart3,
    accent: '#22d3ee',
    visual: 'bars',
  },
  {
    title: 'Intelligent Automation',
    desc: 'Let AI handle repetitive workflows so your team can focus on innovation and strategy.',
    detail: 'Proses scoring, ranking, dan pembaruan rekomendasi berjalan otomatis di backend, sehingga tim tidak perlu melakukan kurasi manual setiap kali ada data transaksi baru.',
    icon: Settings2,
    accent: '#f472b6',
    visual: 'search',
  },
  {
    title: 'Seamless Workflow',
    desc: 'Automate repetitive tasks. Connect effortlessly with tools you already use.',
    detail: 'Hasil rekomendasi dapat langsung dikonsumsi oleh frontend, email marketing, atau sistem notifikasi lain melalui endpoint yang sama, mempersingkat workflow dari data ke aksi.',
    icon: Package,
    accent: P.violet,
    visual: 'line',
  },
]

// ─── Mini Visuals ─────────────────────────────────────────────
function GaugeVisual({ color }: { color: string }) {
  const r = 52, cx = 70, cy = 72, angle = 200
  const rad = (a: number) => (a * Math.PI) / 180
  const arcPath = (start: number, end: number) => {
    const s = { x: cx + r * Math.cos(rad(start)), y: cy + r * Math.sin(rad(start)) }
    const e = { x: cx + r * Math.cos(rad(end)), y: cy + r * Math.sin(rad(end)) }
    return `M ${s.x} ${s.y} A ${r} ${r} 0 0 1 ${e.x} ${e.y}`
  }
  return (
    <svg width="140" height="90" viewBox="0 0 140 90">
      <path d={arcPath(180, 360)} fill="none" stroke="#e5e7eb" strokeWidth="10" strokeLinecap="round" />
      <path d={arcPath(180, 180 + angle * 0.78)} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" />
      <text x="70" y="78" textAnchor="middle" fontSize="13" fontWeight="700" fill={color}>9,621</text>
      <text x="70" y="90" textAnchor="middle" fontSize="9" fill="#9ca3af">Your Grade</text>
    </svg>
  )
}

function OrbitVisual({ color }: { color: string }) {
  return (
    <svg width="140" height="90" viewBox="0 0 140 90">
      <circle cx="70" cy="45" r="20" fill={color + '22'} stroke={color} strokeWidth="1.5" />
      <circle cx="70" cy="45" r="8" fill={color} />
      {[[110, 20], [130, 55], [90, 80], [30, 70], [10, 35], [50, 10]].map(([x, y], i) => (
        <g key={i}>
          <line x1="70" y1="45" x2={x} y2={y} stroke={color + '44'} strokeWidth="1" strokeDasharray="3 3" />
          <circle cx={x} cy={y} r="5" fill={color + '33'} stroke={color} strokeWidth="1" />
        </g>
      ))}
      <circle cx="110" cy="55" r="10" fill="#6366f122" stroke="#6366f1" strokeWidth="1.5" />
      <text x="110" y="59" textAnchor="middle" fontSize="8" fill="#6366f1">API</text>
    </svg>
  )
}

function BarsVisual({ color }: { color: string }) {
  const bars = [0.4, 0.65, 0.5, 0.85, 0.7, 0.9, 0.6, 0.75]
  const W = 140, H = 80, pad = 10, bw = 12, gap = 4
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      {bars.map((h, i) => {
        const bh = (H - pad * 2) * h
        return (
          <rect key={i} rx="3" x={pad + i * (bw + gap)} y={H - pad - bh} width={bw} height={bh} fill={i === 5 ? color : color + '44'} />
        )
      })}
      <text x="95" y="18" fontSize="11" fontWeight="700" fill={color}>$ 154.78</text>
      <text x="95" y="29" fontSize="8" fill="#9ca3af">Total Income</text>
    </svg>
  )
}

function SearchVisual({ color }: { color: string }) {
  return (
    <svg width="140" height="90" viewBox="0 0 140 90">
      <rect x="10" y="10" width="80" height="10" rx="3" fill="#e5e7eb" />
      <rect x="10" y="26" width="60" height="8" rx="3" fill="#e5e7eb" />
      <rect x="10" y="40" width="70" height="8" rx="3" fill="#e5e7eb" />
      <rect x="10" y="54" width="50" height="8" rx="3" fill="#e5e7eb" />
      <rect x="10" y="68" width="65" height="8" rx="3" fill="#e5e7eb" />
      <circle cx="105" cy="58" r="20" fill={color + '15'} stroke={color} strokeWidth="2" />
      <circle cx="102" cy="55" r="10" fill="none" stroke={color} strokeWidth="2" />
      <line x1="109" y1="62" x2="117" y2="70" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <rect x="48" y="75" width="44" height="14" rx="7" fill={color} />
      <text x="70" y="85" textAnchor="middle" fontSize="8" fill="white">AI Search</text>
    </svg>
  )
}

function LineVisual({ color }: { color: string }) {
  const pts = [10, 60, 30, 45, 50, 52, 70, 30, 90, 40, 110, 22, 130, 35]
  const d = pts.reduce((acc, v, i) => i % 2 === 0 ? acc + (i === 0 ? 'M' : 'L') + v : acc + ',' + v + ' ', '')
  const fill = pts.reduce((acc, v, i) => i % 2 === 0 ? acc + (i === 0 ? 'M' : 'L') + v : acc + ',' + v + ' ', '') + 'L130,80 L10,80 Z'
  return (
    <svg width="140" height="90" viewBox="0 0 140 90">
      <defs>
        <linearGradient id="lg2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={color} stopOpacity={0.02} />
        </linearGradient>
      </defs>
      <path d={fill} fill="url(#lg2)" />
      <path d={d} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="110" cy="22" r="4" fill={color} />
      <rect x="88" y="6" width="50" height="13" rx="4" fill={color} />
      <text x="113" y="16" textAnchor="middle" fontSize="8" fill="white">Conv. rate</text>
    </svg>
  )
}

function FeatureVisual({ type, color }: { type: string; color: string }) {
  if (type === 'gauge') return <GaugeVisual color={color} />
  if (type === 'orbit') return <OrbitVisual color={color} />
  if (type === 'bars') return <BarsVisual color={color} />
  if (type === 'search') return <SearchVisual color={color} />
  return <LineVisual color={color} />
}

// ─── Product Mockup ───────────────────────────────────────────
function ProductMockup() {
  return (
    <div style={{
      background: P.white,
      borderRadius: 16,
      border: `1px solid ${P.border}`,
      overflow: 'hidden',
      boxShadow: '0 20px 60px rgba(91,94,244,0.12), 0 4px 16px rgba(0,0,0,0.06)',
      maxWidth: 760,
      margin: '0 auto',
    }}>
      <div style={{ background: '#f9fafb', borderBottom: `1px solid ${P.border}`, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex', gap: 5 }}>
          {['#f87171', '#fbbf24', '#4ade80'].map((c, i) => <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
        </div>
        <div style={{ flex: 1, background: P.white, borderRadius: 6, padding: '4px 12px', fontSize: 11, color: P.sub, border: `1px solid ${P.border}`, textAlign: 'center', maxWidth: 320, margin: '0 auto' }}>
          localhost:5173/dashboard
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 22, height: 22, borderRadius: '50%', background: P.indigo, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingBag size={11} color="white" />
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: P.text }}>FashionRec</span>
        </div>
      </div>

      <div style={{ padding: '16px 20px', background: '#f7f8fc' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 14 }}>
          {statCards.map((s) => {
            const Icon = s.icon
            return (
              <div key={s.label} style={{ background: P.white, borderRadius: 10, padding: '10px 12px', border: `1px solid ${P.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 9, color: P.sub }}>{s.label}</span>
                  <Icon size={12} color={s.color} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, color: P.text }}>{s.value}</div>
              </div>
            )
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={{ background: P.white, borderRadius: 10, padding: '12px 14px', border: `1px solid ${P.border}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: P.text, marginBottom: 6 }}>Recommendation Score</div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
              {[['ALS', '#5b5ef4'], ['Hybrid', '#a78bfa']].map(([l, c]) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: c }} />
                  <span style={{ fontSize: 9, color: P.sub }}>{l}</span>
                </div>
              ))}
            </div>
            <svg width="100%" height="80" viewBox="0 0 240 80" preserveAspectRatio="none">
              <defs>
                <linearGradient id="lg1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5b5ef4" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#5b5ef4" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <path d="M0,60 C30,52 50,30 80,35 C110,40 130,20 160,25 C190,30 210,15 240,18 L240,80 L0,80 Z" fill="url(#lg1)" />
              <path d="M0,60 C30,52 50,30 80,35 C110,40 130,20 160,25 C190,30 210,15 240,18" fill="none" stroke="#5b5ef4" strokeWidth="2" />
              <path d="M0,68 C30,60 50,50 80,52 C110,54 130,42 160,44 C190,46 210,35 240,38" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeDasharray="4 3" />
            </svg>
          </div>

          <div style={{ background: P.white, borderRadius: 10, padding: '12px 14px', border: `1px solid ${P.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: P.text }}>Model Performance</span>
              <span style={{ fontSize: 9, background: '#eeeeff', color: P.indigo, padding: '2px 7px', borderRadius: 10, fontWeight: 700 }}>Monthly</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 4 }}>
              <svg width="120" height="68" viewBox="0 0 120 68">
                <path d="M10,60 A52,52,0,0,1,110,60" fill="none" stroke="#e5e7eb" strokeWidth="10" strokeLinecap="round" />
                <path d="M10,60 A52,52,0,0,1,88,18" fill="none" stroke="#5b5ef4" strokeWidth="10" strokeLinecap="round" />
                <text x="60" y="55" textAnchor="middle" fontSize="12" fontWeight="800" fill="#5b5ef4">78%</text>
                <text x="60" y="66" textAnchor="middle" fontSize="8" fill="#9ca3af">Precision</text>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Feature Card (clickable, expandable) dengan EFEK WARNA KUAT ──────
function FeatureCard({
  f, cardBg, cardBorder, text, sub, isDark, isOpen, onToggle,
}: {
  f: typeof features[number]
  cardBg: string
  cardBorder: string
  text: string
  sub: string
  isDark: boolean
  isOpen: boolean
  onToggle: () => void
}) {
  const Icon = f.icon
  return (
    <div
      onClick={onToggle}
      onMouseEnter={(e) => {
        if (!isOpen) {
          e.currentTarget.style.transform = 'translateY(-6px)'
          e.currentTarget.style.boxShadow = `0 20px 35px -12px ${f.accent}60`
        }
      }}
      onMouseLeave={(e) => {
        if (!isOpen) {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'
        }
      }}
      style={{
        background: isOpen ? `${f.accent}30` : cardBg,
        border: isOpen ? `2.5px solid ${f.accent}` : `1px solid ${cardBorder}`,
        borderRadius: 24,
        padding: '24px 24px 20px',
        display: 'flex', flexDirection: 'column', gap: 16,
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: isOpen ? `0 20px 35px -12px ${f.accent}99` : '0 2px 8px rgba(0,0,0,0.04)',
        transform: isOpen ? 'translateY(-4px)' : 'translateY(0)',
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 12, background: isOpen ? `${f.accent}35` : `${f.accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={16} color={isOpen ? f.accent : f.accent} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 14, color: isOpen ? f.accent : text }}>{f.title}</span>
          </div>
          <ChevronDown
            size={16}
            color={isOpen ? f.accent : sub}
            style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', flexShrink: 0 }}
          />
        </div>
        <p style={{ fontSize: 12, color: isOpen ? f.accent : sub, lineHeight: 1.6, margin: 0, fontWeight: isOpen ? 500 : 400 }}>
          {f.desc}
        </p>
      </div>

      <div style={{
        background: isDark ? '#111129' : '#f8fafc',
        borderRadius: 14,
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        padding: '16px 0', minHeight: 100,
        pointerEvents: 'none',
        border: isOpen ? `1px solid ${f.accent}30` : 'none',
      }}>
        <FeatureVisual type={f.visual} color={f.accent} />
      </div>

      <div style={{
        maxHeight: isOpen ? 220 : 0,
        opacity: isOpen ? 1 : 0,
        overflow: 'hidden',
        transition: 'max-height 0.35s ease, opacity 0.25s ease',
      }}>
        <div style={{
          borderTop: `1px solid ${cardBorder}`,
          paddingTop: 14,
          fontSize: 12,
          lineHeight: 1.7,
          color: isOpen ? f.accent : sub,
        }}>
          {f.detail}
        </div>
      </div>
    </div>
  )
}

// ─── Stat Card dengan efek hover ──────────────────────────────
function StatCard({ value, label, icon: Icon, color }: any) {
  const [isHovered, setIsHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: '#ffffff',
        border: `1px solid ${isHovered ? color : '#e5e7eb'}`,
        borderRadius: 20,
        padding: '24px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border 0.2s ease',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered ? `0 12px 24px -8px ${color}40` : 'none',
        cursor: 'pointer',
      }}
    >
      <div style={{ width: 48, height: 48, borderRadius: 14, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={22} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#111827' }}>{value}</div>
        <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{label}</div>
      </div>
    </div>
  )
}

// ─── MAIN ─────────────────────────────────────────────────────
export default function HomePage({ theme }: { theme: string }) {
  const isDark = theme === 'dark'
  const [expanded, setExpanded] = useState<string | null>(null)

  const bg = isDark ? '#0f0f1a' : P.white
  const text = isDark ? '#e2e8f0' : P.text
  const sub = isDark ? '#94a3b8' : P.sub
  const cardBg = isDark ? '#1e1e32' : P.white
  const cardBorder = isDark ? '#2a2a4a' : P.border

  const toggle = (title: string) => setExpanded((cur) => (cur === title ? null : title))

  return (
    <div style={{ background: bg, fontFamily: "'Inter', -apple-system, sans-serif", overflowX: 'hidden' }}>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section style={{ position: 'relative', padding: '80px 2rem 0', textAlign: 'center', overflow: 'hidden', minHeight: 600 }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          <div style={{ position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)', width: 900, height: 500, background: 'radial-gradient(ellipse at 40% 50%, #bfbffe55 0%, #a78bfa33 35%, transparent 70%)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', top: 0, right: -100, width: 500, height: 400, background: 'radial-gradient(ellipse, #c4b5fd33 0%, transparent 70%)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', top: 0, left: -100, width: 500, height: 400, background: 'radial-gradient(ellipse, #818cf833 0%, transparent 70%)', borderRadius: '50%' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 780, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#eeeeff', border: `1px solid #c7d2fe`, borderRadius: 20, padding: '5px 14px', marginBottom: 28 }}>
            <span style={{ background: P.indigo, color: 'white', fontSize: 10, fontWeight: 800, padding: '1px 7px', borderRadius: 10 }}>✨</span>
            <span style={{ fontSize: 13, color: P.indigo, fontWeight: 600 }}>Hybrid Fashion Recommendation Engine</span>
          </div>

          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.4rem)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em', color: text, margin: '0 0 20px' }}>
            Fashion Recommendation<br />
            <span style={{ background: 'linear-gradient(135deg, #5b5ef4 0%, #a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              System
            </span>
          </h1>

          <p style={{ fontSize: 15, color: sub, lineHeight: 1.7, maxWidth: 520, margin: '0 auto 36px', padding: '0 1rem' }}>
            Personalize customer experience with hybrid recommendations using ALS, TF-IDF, and Association Rules.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 60 }}>
            <a href="/recommender" style={{
              background: P.indigo, color: 'white',
              padding: '12px 28px', borderRadius: 40,
              fontWeight: 700, fontSize: 14, textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: 8,
              boxShadow: '0 4px 20px rgba(91,94,244,0.35)',
              transition: 'all 0.2s'
            }}>
              <Sparkles size={15} /> Try Recommender
            </a>
            <a href="/dashboard" style={{
              background: 'transparent', color: text,
              padding: '12px 28px', borderRadius: 40,
              fontWeight: 700, fontSize: 14, textDecoration: 'none',
              border: `1.5px solid ${cardBorder}`,
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}>
              View Dashboard <ArrowRight size={14} />
            </a>
          </div>

          <ProductMockup />
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────── */}
      <section style={{ padding: '80px 2rem', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
          <StatCard value="< 1s" label="Inference Time" icon={Zap} color={P.indigo} />
          <StatCard value="3-in-1" label="Hybrid Engine" icon={Sparkles} color="#7c5af3" />
          <StatCard value="Top-12" label="Recommendations" icon={TrendingUp} color="#22c55e" />
          <StatCard value="Real-time" label="API Response" icon={CreditCard} color="#f59e0b" />
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────── */}
      <section style={{ padding: '0 2rem 80px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#eeeeff', border: `1px solid #c7d2fe`, borderRadius: 20, padding: '4px 14px', marginBottom: 16 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: P.indigo }} />
            <span style={{ fontSize: 11, color: P.indigo, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Features</span>
          </div>
          <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 900, color: text, letterSpacing: '-0.02em', margin: '0 0 12px' }}>
            We Offer a Wide Range<br />Of Services
          </h2>
          <p style={{ fontSize: 14, color: sub, maxWidth: 400, margin: '0 auto', lineHeight: 1.7 }}>
            An all-in-one solution designed to streamline product discovery, boost collaboration, and drive sales performance.
          </p>
          <p style={{ fontSize: 11, color: sub, marginTop: 12, fontStyle: 'italic' }}>
            ✨ Klik kartu untuk melihat detail ✨
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 20 }}>
          {features.slice(0, 3).map((f) => (
            <FeatureCard
              key={f.title}
              f={f}
              cardBg={cardBg}
              cardBorder={cardBorder}
              text={text}
              sub={sub}
              isDark={isDark}
              isOpen={expanded === f.title}
              onToggle={() => toggle(f.title)}
            />
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {features.slice(3).map((f) => (
            <FeatureCard
              key={f.title}
              f={f}
              cardBg={cardBg}
              cardBorder={cardBorder}
              text={text}
              sub={sub}
              isDark={isDark}
              isOpen={expanded === f.title}
              onToggle={() => toggle(f.title)}
            />
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section style={{ padding: '60px 2rem 80px', textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
        <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 900, color: text, letterSpacing: '-0.02em', margin: '0 0 12px' }}>
          Ready to Transform Your Fashion Retail?
        </h2>
        <p style={{ fontSize: 14, color: sub, marginBottom: 28 }}>
          Try the recommendation engine — get personalized product suggestions in seconds.
        </p>
        <a href="/recommender" style={{
          background: P.indigo, color: 'white',
          padding: '13px 32px', borderRadius: 40,
          fontWeight: 700, fontSize: 14, textDecoration: 'none',
          display: 'inline-flex', alignItems: 'center', gap: 8,
          boxShadow: '0 4px 20px rgba(91,94,244,0.35)',
        }}>
          Get Started <ArrowRight size={14} />
        </a>
      </section>

    </div>
  )
}