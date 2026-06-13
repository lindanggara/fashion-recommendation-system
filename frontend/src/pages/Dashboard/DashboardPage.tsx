import { useState, useEffect } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts'
import {
  LayoutDashboard, Cpu, Package, BarChart3,
  Users, TrendingUp, Search, Bell,
  ChevronRight, ArrowUpRight, ArrowRight, Activity, RefreshCw,
  AlertCircle, Star, ShoppingBag, Layers, Sparkles,
  Menu, X, Download, Calendar, TrendingDown, Filter, Gem
} from 'lucide-react'
import axios from 'axios'
import { API_BASE_URL } from '../../config/api'

const API = API_BASE_URL  // ✅ ini yang benar

const PURPLE = {
  primary:      '#7c3aed',
  primaryDark:  '#6d28d9',
  primaryLight: '#a78bfa',
  bgLight:      '#f5f3ff',
}

const CHART_COLORS = [
  '#7c3aed','#ec4899','#10b981','#f59e0b',
  '#06b6d4','#ef4444','#fbbf24','#8b5cf6','#14b8a6','#f97316',
]

// ─── Fallback data ────────────────────────────────────────────
const FALLBACK_OVERVIEW = {
  total_articles: 105542, total_customers: 1371980,
  unique_customers: 317897, unique_articles: 61029,
  total_ratings: 498294, svd_rmse: 0.0794, svd_mae: 0.0265, model_status: 'loaded',
}
const FALLBACK_MONTHLY = [
  {name:'2018-09',count:8200},{name:'2018-10',count:9100},{name:'2018-11',count:10500},
  {name:'2018-12',count:11200},{name:'2019-01',count:7800},{name:'2019-02',count:8400},
  {name:'2019-03',count:9600},{name:'2019-04',count:10100},{name:'2019-05',count:14200},
  {name:'2019-06',count:15800},{name:'2019-07',count:16100},{name:'2019-08',count:17200},
  {name:'2019-09',count:17600},{name:'2019-10',count:16400},{name:'2019-11',count:15100},
  {name:'2019-12',count:13800},{name:'2020-01',count:11200},{name:'2020-02',count:12400},
  {name:'2020-03',count:9800},{name:'2020-04',count:8600},{name:'2020-05',count:10200},
  {name:'2020-06',count:11900},{name:'2020-07',count:13100},{name:'2020-08',count:14200},
  {name:'2020-09',count:13800},
]
const FALLBACK_CATEGORIES = [
  {category:'Garment Upper body',count:28000},{category:'Garment Lower body',count:19000},
  {category:'Garment Full body',count:12000},{category:'Accessories',count:10000},
  {category:'Swimwear',count:6500},{category:'Shoes',count:5800},
]
const FALLBACK_COLOURS = [
  {colour:'Black',count:18000},{colour:'White',count:14000},
  {colour:'Dark Blue',count:11000},{colour:'Grey',count:9000},
  {colour:'Pink',count:7000},{colour:'Red',count:5500},
]
const FALLBACK_PRODUCTS = [
  {article_id:'0706016001',product_name:'Ladies Classic Tee',   category:'Upper body',colour:'Black',   purchase_count:3241,trend:'+12%'},
  {article_id:'0448509014',product_name:'Slim Fit Denim Jeans', category:'Lower body',colour:'Dark Blue',purchase_count:2987,trend:'+8%'},
  {article_id:'0372860001',product_name:'Basic Hoodie',         category:'Upper body',colour:'Grey',    purchase_count:2754,trend:'+15%'},
  {article_id:'0610776002',product_name:'Ribbed Jersey Top',    category:'Upper body',colour:'White',   purchase_count:2612,trend:'+5%'},
  {article_id:'0156231001',product_name:'Floral Wrap Dress',    category:'Full body', colour:'Pink',    purchase_count:2488,trend:'+22%'},
]
const FALLBACK_METRICS = [
  {model:'SVD (Collaborative Filtering)',params:'factors=50, epochs=20',      rmse:0.0794,mae:0.0265,status:'Production'},
  {model:'TF-IDF (Content-Based)',       params:'max_features=5000',          rmse:null,  mae:null,  status:'Active'},
  {model:'Hybrid (CF + CBF)',            params:'w_cf=0.60, w_cbf=0.40',      rmse:null,  mae:null,  status:'Best'},
]

const SIDE_ITEMS = [
  {icon:LayoutDashboard, label:'Dashboard'},
  {icon:BarChart3,       label:'Analytics'},
  {icon:Cpu,            label:'Models'},
  {icon:Package,        label:'Products'},
]

const DATE_FILTERS = [
  {label:'Last 7 days',    value:'7d',  slice:1},
  {label:'Last 30 days',   value:'30d', slice:1},
  {label:'Last 12 months', value:'12m', slice:12},
  {label:'All time',       value:'all', slice:99},
]

function fmt(n: number) {
  if (n >= 1_000_000) return (n/1_000_000).toFixed(1)+'M'
  if (n >= 1_000)     return (n/1_000).toFixed(0)+'K'
  return n.toString()
}

// ─── Skeleton loaders ─────────────────────────────────────────
function SkeletonKPI() {
  return (
    <div style={{ background: '#e9d5ff40', borderRadius: 24, padding: '24px 28px', height: 160, animation: 'pulse 1.5s ease-in-out infinite' }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
    </div>
  )
}
function SkeletonCard() {
  return (
    <div style={{ background: '#e9d5ff40', borderRadius: 24, padding: '24px', height: 220, animation: 'pulse 1.5s ease-in-out infinite' }} />
  )
}

// ─── Tooltip ─────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'white', border:`1px solid ${PURPLE.primary}20`, borderRadius:16, padding:'12px 18px', fontSize:12, boxShadow:`0 8px 25px ${PURPLE.primary}25` }}>
      <p style={{ fontWeight:700, marginBottom:6, color:'#1f2937' }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={p.name} style={{ color:p.color||CHART_COLORS[i%CHART_COLORS.length], margin:'4px 0', fontWeight:500 }}>
          {p.name}: <strong>{Number(p.value).toLocaleString()}</strong>
        </p>
      ))}
    </div>
  )
}

// ─── Section header ───────────────────────────────────────────
function SectionHeader({ title, action, sub }: { title:string; action?:string; sub?:string }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
      <div>
        <h3 style={{ fontSize:16, fontWeight:700, color:'#1f2937', margin:0, display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:4, height:20, background:PURPLE.primary, borderRadius:4 }} />
          {title}
        </h3>
        {sub && <p style={{ fontSize:12, color:'#6b7280', margin:'6px 0 0' }}>{sub}</p>}
      </div>
      {action && (
        <button style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, fontWeight:600, color:PURPLE.primary, background:`${PURPLE.primary}10`, border:'none', borderRadius:20, padding:'6px 14px', cursor:'pointer' }}>
          {action} <ArrowRight size={14} />
        </button>
      )}
    </div>
  )
}

// ─── Hover card wrapper ───────────────────────────────────────
function HoverCard({ children, cardKey, onClick, isActive, style = {} }: any) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onClick={() => onClick(cardKey === isActive ? null : cardKey)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: 'white',
        border: isActive ? `2px solid ${PURPLE.primary}` : '1px solid #e9d5ff',
        borderRadius: 24,
        padding: '24px 28px',
        transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
        cursor: 'pointer',
        transform: hov || isActive ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: hov || isActive ? `0 25px 40px -12px ${PURPLE.primary}60` : `0 4px 15px ${PURPLE.primary}10`,
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      {(hov || isActive) && (
        <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:`linear-gradient(90deg, ${PURPLE.primary}, ${PURPLE.primaryLight}, transparent)` }} />
      )}
      {children}
    </div>
  )
}

// ─── MAIN ─────────────────────────────────────────────────────
export default function DashboardPage({ theme, showToast }: { theme: string; showToast?: (msg: string, type: 'success'|'error'|'info') => void }) {
  const isDark    = theme === 'dark'
  const bg        = isDark ? '#0a0a0f'   : PURPLE.bgLight
  const cardBg    = isDark ? '#1a1a2e'   : '#ffffff'
  const border    = isDark ? '#2d2d44'   : '#e9d5ff'
  const textPri   = isDark ? '#f3f4f6'   : '#1f2937'
  const textSub   = isDark ? '#9ca3af'   : '#6b7280'
  const sidebarBg = isDark ? '#0a0a0f'   : '#ffffff'
  const tableBg   = isDark ? '#1a1a2e'   : '#faf5ff'

  const [isMobile,           setIsMobile]           = useState(window.innerWidth < 768)
  const [activeNav,          setActiveNav]          = useState('Dashboard')
  const [activeTab,          setActiveTab]          = useState<'MONTHLY'|'YEARLY'>('MONTHLY')
  const [loading,            setLoading]            = useState(true)
  const [backendOk,          setBackendOk]          = useState(false)
  const [overview,           setOverview]           = useState(FALLBACK_OVERVIEW)
  const [monthly,            setMonthly]            = useState(FALLBACK_MONTHLY)
  const [categories,         setCategories]         = useState(FALLBACK_CATEGORIES)
  const [colours,            setColours]            = useState(FALLBACK_COLOURS)
  const [topProducts,        setTopProducts]        = useState(FALLBACK_PRODUCTS)
  const [allProducts,        setAllProducts]        = useState<any[]>(FALLBACK_PRODUCTS)
  const [productsLoading,    setProductsLoading]    = useState(false)
  const [modelMetrics,       setModelMetrics]       = useState(FALLBACK_METRICS)
  const [history,            setHistory]            = useState<any[]>([])
  const [customerId,         setCustomerId]         = useState('')
  const [loadingHist,        setLoadingHist]        = useState(false)
  const [localSearch,        setLocalSearch]        = useState('')
  const [debSearch,          setDebSearch]          = useState('')
  // PERBAIKAN: sidebar mulai terbuka (true) untuk semua device
  const [sidebarOpen,        setSidebarOpen]        = useState(true)
  const [selectedColour,     setSelectedColour]     = useState<any>(null)
  const [dateFilter,         setDateFilter]         = useState('all')
  const [lastUpdate,         setLastUpdate]         = useState(new Date())
  const [clickedCard,        setClickedCard]        = useState<string|null>(null)

  // Handle resize untuk mobile/desktop
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      // Saat resize ke mobile, tutup sidebar
      if (mobile) {
        setSidebarOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebSearch(localSearch), 300)
    return () => clearTimeout(t)
  }, [localSearch])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setSelectedColour(null); setClickedCard(null) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const getFilteredMonthly = () => {
    const f = DATE_FILTERS.find(d => d.value === dateFilter)
    return f ? monthly.slice(-f.slice) : monthly
  }
  const filteredMonthly = getFilteredMonthly()
  const chartData = activeTab === 'MONTHLY' ? filteredMonthly : (() => {
    return monthly.reduce((acc: {name:string;count:number}[], cur) => {
      const yr = cur.name.substring(0,4)
      const ex = acc.find(a => a.name === yr)
      if (ex) ex.count += cur.count
      else acc.push({name:yr, count:cur.count})
      return acc
    }, [])
  })()

  const currentTotal  = filteredMonthly.reduce((s,d) => s+d.count, 0)
  const previousTotal = monthly.slice(0, -filteredMonthly.length).reduce((s,d) => s+d.count, 0) || currentTotal * 0.9
  const pct = ((currentTotal - previousTotal) / previousTotal * 100)
  const trendTotal = { value: `${pct>=0?'+':''}${pct.toFixed(1)}%`, isUp: pct>=0 }

  const exportCSV = () => {
    const csv = ['Month,Transactions', ...filteredMonthly.map(d => `${d.name},${d.count}`)].join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], {type:'text/csv'}))
    a.download = `dashboard_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    showToast?.('Exported! ✨', 'success')
  }

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [ov,mo,cat,col,tp,mm] = await Promise.all([
        axios.get(`${API}/analytics/overview`).catch(()=>null),
        axios.get(`${API}/analytics/monthly-transactions`).catch(()=>null),
        axios.get(`${API}/analytics/top-categories`).catch(()=>null),
        axios.get(`${API}/analytics/top-colours`).catch(()=>null),
        axios.get(`${API}/analytics/top-products?limit=8`).catch(()=>null),
        axios.get(`${API}/analytics/model-metrics`).catch(()=>null),
      ])
      let ok = false
      if (ov?.data)                  { setOverview(ov.data); ok=true }
      if (mo?.data?.data?.length)    { setMonthly(mo.data.data.map((d:any)=>({name:d.month.substring(0,7),count:d.count}))); ok=true }
      if (cat?.data?.data?.length)   { setCategories(cat.data.data); ok=true }
      if (col?.data?.data?.length)   { setColours(col.data.data); ok=true }
      if (tp?.data?.data?.length)    { setTopProducts(tp.data.data); ok=true }
      if (mm?.data?.metrics?.length) { setModelMetrics(mm.data.metrics); ok=true }
      setBackendOk(ok)
      setLastUpdate(new Date())
      showToast?.('Refreshed! 🎉', 'success')
    } catch { setBackendOk(false); showToast?.('Failed to fetch', 'error') }
    finally  { setLoading(false) }
  }

  const fetchProducts = async () => {
    setProductsLoading(true)
    try {
      const r = await axios.get(`${API}/analytics/top-products?limit=100`)
      setAllProducts(r.data?.data?.length ? r.data.data : FALLBACK_PRODUCTS)
    } catch { setAllProducts(FALLBACK_PRODUCTS) }
    finally  { setProductsLoading(false) }
  }

  useEffect(() => { fetchAll(); fetchProducts() }, [])

  const handleSearch = async () => {
    if (!customerId.trim()) return
    setLoadingHist(true)
    try {
      const r = await axios.get(`${API}/customer/${customerId}/history`)
      setHistory(r.data.purchases || [])
      showToast?.('History loaded! 🎯', 'success')
    } catch { showToast?.('Failed to load history', 'error') }
    finally  { setLoadingHist(false) }
  }

  // ── Sidebar shared content (dengan tombol close) ──────────────────────────────────
  function SidebarContent({ onClose }: { onClose?: () => void }) {
    return (
      <>
        <div style={{ padding:'0 20px 24px', borderBottom:`1px solid ${border}`, marginBottom:16, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ background:`linear-gradient(135deg,${PURPLE.primary},${PURPLE.primaryDark})`, borderRadius:16, padding:'10px 12px', display:'flex', boxShadow:`0 4px 12px ${PURPLE.primary}40` }}>
              <Gem size={22} color="white" />
            </div>
            <div>
              <div style={{ fontWeight:800, fontSize:18, color:textPri, letterSpacing:'-0.5px' }}>FashionRec</div>
              <div style={{ fontSize:11, color:textSub }}>H&M Analytics</div>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} style={{ background:'transparent', border:'none', cursor:'pointer', padding:4, borderRadius:8 }}>
              <X size={18} color={textSub} />
            </button>
          )}
        </div>

        <div style={{ padding:'0 16px', flex:1 }}>
          {SIDE_ITEMS.map(item => {
            const Icon = item.icon
            const isAct = item.label === activeNav
            return (
              <button key={item.label} onClick={() => { setActiveNav(item.label); onClose?.() }} style={{
                display:'flex', alignItems:'center', gap:14, padding:'14px 20px', marginBottom:8,
                borderRadius:16, border:'none', cursor:'pointer',
                background: isAct ? `linear-gradient(135deg,${PURPLE.primary},${PURPLE.primaryDark})` : 'transparent',
                color: isAct ? 'white' : textSub,
                fontWeight: isAct ? 700 : 500, fontSize:15,
                width:'100%', transition:'all 0.2s', textAlign:'left',
                boxShadow: isAct ? `0 4px 12px ${PURPLE.primary}40` : 'none'
              }}>
                <Icon size={20} />
                {item.label}
                {isAct && <ChevronRight size={18} style={{ marginLeft:'auto' }} />}
              </button>
            )
          })}
        </div>

        <div style={{ padding:'20px 24px', borderTop:`1px solid ${border}`, marginTop:'auto' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, fontSize:13 }}>
            <div style={{ width:10, height:10, borderRadius:'50%', background:backendOk?'#10b981':'#f59e0b', boxShadow:`0 0 6px ${backendOk?'#10b981':'#f59e0b'}`, flexShrink:0 }} />
            <span style={{ color:textSub, fontWeight:500 }}>{backendOk ? 'Backend connected' : 'Fallback data'}</span>
          </div>
        </div>
      </>
    )
  }

  // ── Bottom nav (mobile) ────────────────────────────────────
  function BottomNav() {
    return (
      <div style={{ position:'fixed', bottom:0, left:0, right:0, background:cardBg, borderTop:`1px solid ${border}`, padding:'8px 16px', display:'flex', justifyContent:'space-around', zIndex:100, boxShadow:'0 -4px 12px rgba(0,0,0,0.05)' }}>
        {SIDE_ITEMS.map(item => {
          const Icon = item.icon
          const isAct = item.label === activeNav
          return (
            <button key={item.label} onClick={() => setActiveNav(item.label)} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3, background:'transparent', border:'none', cursor:'pointer', color:isAct?PURPLE.primary:textSub, padding:'8px 12px', borderRadius:30, flex:1 }}>
              <Icon size={isAct?22:20} />
              <span style={{ fontSize:10, fontWeight:isAct?600:400 }}>{item.label}</span>
            </button>
          )
        })}
      </div>
    )
  }

  // ════════════════════════════════════════════════
  //  PAGE: DASHBOARD
  // ════════════════════════════════════════════════
  function PageDashboard() {
    const maxCount = Math.max(...chartData.map(d => d.count))
    const minCount = Math.min(...chartData.map(d => d.count))
    const avgCount = Math.round(chartData.reduce((s,d) => s+d.count, 0) / chartData.length)
    const maxMonth = chartData.find(d => d.count === maxCount)?.name || ''
    const minMonth = chartData.find(d => d.count === minCount)?.name || ''

    const kpis = [
      { title:'TOTAL ARTICLES',   value:fmt(overview.total_articles),   icon:Package,    sub1:{label:'Active', value:fmt(overview.unique_articles)}, sub2:{label:'Total',  value:'105K+'}, cardKey:'articles', trend:{value:'+5.2%', isUp:true} },
      { title:'TOTAL CUSTOMERS',  value:fmt(overview.total_customers),  icon:Users,      sub1:{label:'Active', value:fmt(overview.unique_customers)}, sub2:{label:'New',    value:'12K+'}, cardKey:'customers', trend:{value:'+8.1%', isUp:true} },
      { title:'RATINGS',          value:fmt(overview.total_ratings),    icon:Star,       sub1:{label:'Avg',    value:'3.2'}, sub2:{label:'Max',    value:'5'}, cardKey:'ratings', trend:{value:'+2.3%', isUp:true} },
      { title:'SVD RMSE',         value:overview.svd_rmse.toFixed(4),  icon:TrendingUp, sub1:{label:'MAE',    value:overview.svd_mae.toFixed(4)}, sub2:{label:'Status', value:'✓ Active'}, cardKey:'rmse', trend:{value:'-0.8%', isUp:false} },
    ]

    return (
      <main style={{ flex:1, padding:isMobile?'20px 16px 80px':'28px 32px 48px', overflowY:'auto', minWidth:0, background:bg }}>

        {/* Header */}
        <div style={{ background:`linear-gradient(135deg,${PURPLE.primary}05,${PURPLE.primary}02)`, borderRadius:32, padding:isMobile?'20px 24px':'24px 32px', marginBottom:28, border:`1px solid ${PURPLE.primary}15` }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16 }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
                <div style={{ background:`linear-gradient(135deg,${PURPLE.primary},${PURPLE.primaryDark})`, borderRadius:16, padding:'8px 12px', boxShadow:`0 4px 12px ${PURPLE.primary}40` }}>
                  <Sparkles size={22} color="white" />
                </div>
                <h1 style={{ fontSize:isMobile?22:28, fontWeight:800, color:textPri, margin:0 }}>Dashboard</h1>
              </div>
              <p style={{ fontSize:14, color:textSub, margin:'4px 0 0' }}>Selamat datang — H&M Fashion Recommendation System</p>
            </div>
            <div style={{ width:44, height:44, borderRadius:16, background:`${PURPLE.primary}10`, border:`1px solid ${PURPLE.primary}20`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
              <Bell size={20} color={textSub} />
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div style={{ background:cardBg, borderRadius:28, padding:isMobile?'16px 20px':'20px 28px', marginBottom:28, border:`1px solid ${border}`, boxShadow:`0 8px 25px ${PURPLE.primary}10` }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:10, height:10, borderRadius:'50%', background:backendOk?'#10b981':'#f59e0b', boxShadow:`0 0 8px ${backendOk?'#10b981':'#f59e0b'}` }} />
                <span style={{ fontSize:13, fontWeight:600, color:backendOk?'#10b981':'#f59e0b' }}>
                  {backendOk ? '● LIVE DATA' : '⚠ FALLBACK MODE'}
                </span>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <Calendar size={13} color={PURPLE.primary} />
                <span style={{ fontSize:12, color:textSub }}>Updated: {lastUpdate.toLocaleTimeString()}</span>
              </div>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={exportCSV} style={{ background:'transparent', border:`1px solid ${border}`, borderRadius:14, padding:'8px 18px', cursor:'pointer', color:textSub, display:'flex', alignItems:'center', gap:8, fontSize:13 }}>
                <Download size={14} /> {!isMobile && 'Export'}
              </button>
              <button onClick={fetchAll} disabled={loading} style={{ background:`linear-gradient(135deg,${PURPLE.primary},${PURPLE.primaryDark})`, border:'none', borderRadius:14, padding:'8px 22px', cursor:loading?'not-allowed':'pointer', color:'white', display:'flex', alignItems:'center', gap:8, fontSize:13, fontWeight:600, opacity:loading?0.7:1, boxShadow:`0 4px 12px ${PURPLE.primary}40` }}>
                <RefreshCw size={14} /> {!isMobile && 'Refresh'}
              </button>
            </div>
          </div>
          <div style={{ display:'flex', gap:8, marginTop:16, paddingTop:14, borderTop:`1px solid ${border}`, flexWrap:'wrap', alignItems:'center' }}>
            <Filter size={13} color={PURPLE.primary} />
            {DATE_FILTERS.map(f => (
              <button key={f.value} onClick={() => setDateFilter(f.value)} style={{ background:dateFilter===f.value?PURPLE.primary:'transparent', color:dateFilter===f.value?'white':textSub, border:dateFilter===f.value?'none':`1px solid ${border}`, padding:'5px 14px', borderRadius:40, fontSize:isMobile?10:12, fontWeight:dateFilter===f.value?600:500, cursor:'pointer', boxShadow:dateFilter===f.value?`0 2px 8px ${PURPLE.primary}50`:'none' }}>
                {isMobile ? f.label.replace('Last ','').replace(' days','d').replace(' months','m') : f.label}
              </button>
            ))}
          </div>
        </div>

        {/* KPI cards */}
        {loading ? (
          <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'repeat(4,1fr)', gap:24, marginBottom:32 }}>
            {[1,2,3,4].map(i => <SkeletonKPI key={i} />)}
          </div>
        ) : (<>

          <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'repeat(4,1fr)', gap:24, marginBottom:32 }}>
            {kpis.map((k, idx) => {
              const Icon = k.icon
              const isActive = clickedCard === k.cardKey
              return (
                <HoverCard key={idx} cardKey={k.cardKey} onClick={setClickedCard} isActive={isActive}>
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:20 }}>
                    <div style={{ background:`${PURPLE.primary}15`, borderRadius:18, padding:14, display:'flex' }}>
                      <Icon size={26} color={PURPLE.primary} strokeWidth={1.8} />
                    </div>
                    {k.trend && (
                      <div style={{ display:'flex', alignItems:'center', gap:5, background:k.trend.isUp?'#10b98115':'#ef444415', padding:'5px 12px', borderRadius:30 }}>
                        {k.trend.isUp ? <TrendingUp size={12} color="#10b981" /> : <TrendingDown size={12} color="#ef4444" />}
                        <span style={{ fontSize:12, fontWeight:700, color:k.trend.isUp?'#10b981':'#ef4444' }}>{k.trend.value}</span>
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize:13, fontWeight:500, color:textSub, marginBottom:8 }}>{k.title}</div>
                  <div style={{ fontSize:40, fontWeight:800, color:isActive?PURPLE.primary:textPri, marginBottom:20, letterSpacing:'-1px' }}>{k.value}</div>
                  <div style={{ display:'flex', gap:20, paddingTop:14, borderTop:`1px solid ${border}` }}>
                    <div style={{ fontSize:12 }}>
                      <span style={{ color:'#10b981', fontWeight:600 }}>{k.sub1.label}: </span>
                      <span style={{ color:textSub }}>{k.sub1.value}</span>
                    </div>
                    <div style={{ fontSize:12 }}>
                      <span style={{ color:PURPLE.primary, fontWeight:600 }}>{k.sub2.label}: </span>
                      <span style={{ color:textSub }}>{k.sub2.value}</span>
                    </div>
                  </div>
                </HoverCard>
              )
            })}
          </div>

          {/* Area chart + product list */}
          <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1.4fr 1fr', gap:24, marginBottom:32 }}>
            <HoverCard cardKey="area-chart" onClick={setClickedCard} isActive={clickedCard==='area-chart'} style={{ padding:'24px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:12 }}>
                <div>
                  <div style={{ fontSize:13, color:textSub, marginBottom:4 }}>Total Transaksi</div>
                  <div style={{ fontSize:34, fontWeight:800, color:textPri, letterSpacing:'-1px' }}>
                    {fmt(currentTotal)}
                    <span style={{ fontSize:14, color:trendTotal.isUp?'#10b981':'#ef4444', fontWeight:600, marginLeft:10 }}>
                      {trendTotal.isUp?'↑':'↓'} {trendTotal.value}
                    </span>
                  </div>
                </div>
                <div style={{ display:'flex', gap:4, background:`${PURPLE.primary}08`, padding:4, borderRadius:40 }}>
                  {(['MONTHLY','YEARLY'] as const).map(t => (
                    <button key={t} onClick={() => setActiveTab(t)} style={{ background:activeTab===t?`linear-gradient(135deg,${PURPLE.primary},${PURPLE.primaryDark})`:'transparent', color:activeTab===t?'white':textSub, border:'none', borderRadius:30, padding:'5px 18px', fontSize:11, fontWeight:600, cursor:'pointer' }}>{t}</button>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData} margin={{ top:0, right:0, left:-20, bottom:0 }}>
                  <defs>
                    <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor={CHART_COLORS[0]} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={CHART_COLORS[0]} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={border} />
                  <XAxis dataKey="name" tick={{ fontSize:10, fill:textSub }} axisLine={false} tickLine={false} interval={activeTab==='MONTHLY'?6:0} />
                  <YAxis tick={{ fontSize:10, fill:textSub }} axisLine={false} tickLine={false} tickFormatter={v => fmt(v)} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="count" stroke={CHART_COLORS[0]} strokeWidth={3} fill="url(#gA)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
              <div style={{ marginTop:16, paddingTop:14, borderTop:`1px solid ${border}`, display:'flex', gap:24, flexWrap:'wrap', justifyContent:'center' }}>
                {[
                  { label:'Tertinggi', val:maxMonth, color:'#10b981' },
                  { label:'Terendah',  val:minMonth, color:'#f59e0b' },
                  { label:'Rata-rata', val:fmt(avgCount), color:PURPLE.primary },
                ].map(s => (
                  <div key={s.label} style={{ display:'flex', alignItems:'center', gap:7 }}>
                    <div style={{ width:9, height:9, borderRadius:'50%', background:s.color, boxShadow:`0 0 4px ${s.color}` }} />
                    <span style={{ fontSize:12, color:textSub }}>{s.label}: <strong style={{ color:s.color }}>{s.val}</strong></span>
                  </div>
                ))}
              </div>
            </HoverCard>

            <HoverCard cardKey="top-products" onClick={setClickedCard} isActive={clickedCard==='top-products'} style={{ padding:'24px' }}>
              <SectionHeader title="🔥 Top Products" action="See All" sub="Berdasarkan frekuensi pembelian" />
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {topProducts.slice(0, isMobile?3:5).map((p:any, i:number) => (
                  <div key={p.article_id} style={{ display:'flex', alignItems:'center', gap:12, paddingBottom:10, borderBottom:i<topProducts.length-1?`1px solid ${border}`:'none' }}>
                    <div style={{ width:48, height:48, borderRadius:14, background:`${CHART_COLORS[i%CHART_COLORS.length]}15`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <ShoppingBag size={20} color={CHART_COLORS[i%CHART_COLORS.length]} />
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:textPri, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p.product_name}</div>
                      <div style={{ fontSize:11, color:textSub }}>{p.category}</div>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <div style={{ fontSize:14, fontWeight:700, color:textPri }}>{p.purchase_count.toLocaleString()}</div>
                      <div style={{ fontSize:11, color:'#10b981', fontWeight:600 }}>{p.trend||'+8%'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </HoverCard>
          </div>

          {/* Category bar + Colour donut */}
          <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 1fr', gap:24, marginBottom:32 }}>
            <HoverCard cardKey="category-bar" onClick={setClickedCard} isActive={clickedCard==='category-bar'} style={{ padding:'24px' }}>
              <SectionHeader title="📊 Category Distribution" sub="Distribusi produk per kategori" />
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={categories} margin={{ left:-16, right:8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={border} horizontal={true} vertical={false} />
                  <XAxis dataKey="category" tick={{ fontSize:10, fill:textSub }} axisLine={false} tickLine={false} tickFormatter={v => v.split(' ')[1]||v.split(' ')[0]} />
                  <YAxis tick={{ fontSize:10, fill:textSub }} axisLine={false} tickLine={false} tickFormatter={v => fmt(v)} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="count" name="Articles" fill={CHART_COLORS[2]} radius={[8,8,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </HoverCard>

            <HoverCard cardKey="colour-donut" onClick={setClickedCard} isActive={clickedCard==='colour-donut'} style={{ padding:'24px' }}>
              <SectionHeader title="🎨 Top Warna Produk" sub="Distribusi warna katalog H&M" />
              <div style={{ display:'flex', gap:20, alignItems:'center', flexWrap:'wrap' }}>
                <div style={{ flexShrink:0 }}>
                  <ResponsiveContainer width={180} height={180}>
                    <PieChart>
                      <Pie data={colours} cx="50%" cy="50%" innerRadius={50} outerRadius={76} dataKey="count" startAngle={90} endAngle={-270} onClick={(_:any,i:number) => setSelectedColour(colours[i])} cursor="pointer">
                        {colours.map((_:any, i:number) => <Cell key={i} fill={CHART_COLORS[i%CHART_COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v:any, _:any, props:any) => { const t=colours.reduce((s,d)=>s+d.count,0); return [`${fmt(v)} (${(v/t*100).toFixed(1)}%)`, props.payload.colour] }} contentStyle={{ borderRadius:12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ flex:1, display:'flex', flexDirection:'column', gap:8 }}>
                  {colours.slice(0, isMobile?3:6).map((d:any, i:number) => {
                    const total = colours.reduce((s,v)=>s+v.count,0)
                    const pct   = (d.count/total*100).toFixed(1)
                    return (
                      <div key={d.colour} onClick={() => setSelectedColour(d)} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer', padding:'6px 10px', borderRadius:12, transition:'all 0.2s' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background=`${CHART_COLORS[i%CHART_COLORS.length]}12`; (e.currentTarget as HTMLElement).style.transform='translateX(4px)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background='transparent'; (e.currentTarget as HTMLElement).style.transform='translateX(0)' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <div style={{ width:12, height:12, borderRadius:'50%', background:CHART_COLORS[i%CHART_COLORS.length], boxShadow:`0 2px 4px ${CHART_COLORS[i%CHART_COLORS.length]}50` }} />
                          <span style={{ fontSize:12, color:textSub, fontWeight:500 }}>{d.colour}</span>
                        </div>
                        <div style={{ display:'flex', gap:8 }}>
                          <span style={{ fontSize:12, fontWeight:700, color:textPri }}>{fmt(d.count)}</span>
                          <span style={{ fontSize:11, color:'#10b981', fontWeight:600 }}>({pct}%)</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </HoverCard>
          </div>

          {/* Colour modal */}
          {selectedColour && (
            <div onClick={() => setSelectedColour(null)} style={{ position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
              <div onClick={e => e.stopPropagation()} style={{ background:cardBg, borderRadius:32, padding:'36px 44px', maxWidth:360, textAlign:'center', border:`1px solid ${border}`, boxShadow:'0 30px 50px rgba(0,0,0,0.3)' }}>
                <div style={{ width:80, height:80, borderRadius:'50%', background:CHART_COLORS[colours.findIndex(c=>c.colour===selectedColour.colour)%CHART_COLORS.length], margin:'0 auto 20px', boxShadow:`0 8px 25px ${CHART_COLORS[colours.findIndex(c=>c.colour===selectedColour.colour)%CHART_COLORS.length]}80` }} />
                <h3 style={{ fontSize:26, fontWeight:800, color:textPri, marginBottom:10 }}>{selectedColour.colour}</h3>
                <p style={{ fontSize:16, color:textSub, marginBottom:12 }}>Jumlah produk: <strong style={{ color:PURPLE.primary, fontSize:26 }}>{fmt(selectedColour.count)}</strong></p>
                <p style={{ fontSize:13, color:textSub, marginBottom:24 }}>Persentase: <strong>{(selectedColour.count/colours.reduce((s:number,d:any)=>s+d.count,0)*100).toFixed(1)}%</strong> dari total</p>
                <button onClick={() => setSelectedColour(null)} style={{ background:`linear-gradient(135deg,${PURPLE.primary},${PURPLE.primaryDark})`, color:'white', border:'none', padding:'11px 32px', borderRadius:50, cursor:'pointer', fontSize:14, fontWeight:600 }}>Tutup</button>
              </div>
            </div>
          )}

          {/* Customer history */}
          <div style={{ background:cardBg, borderRadius:24, border:`1px solid ${border}`, padding:'24px', marginBottom:isMobile?80:32 }}>
            <SectionHeader title="👥 Customer Purchase History" sub="Cari riwayat pembelian pelanggan" />
            <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap' }}>
              <div style={{ flex:1, minWidth:200, position:'relative' }}>
                <Search size={17} style={{ position:'absolute', left:15, top:'50%', transform:'translateY(-50%)', color:PURPLE.primary }} />
                <input className="customer-search-input" value={customerId} onChange={e => setCustomerId(e.target.value)} onKeyDown={e => e.key==='Enter'&&handleSearch()} placeholder="Masukkan Customer ID..." style={{ width:'100%', paddingLeft:46, paddingRight:16, height:46, border:`2px solid ${border}`, borderRadius:16, background:bg, color:textPri, fontSize:13, outline:'none', boxSizing:'border-box' }} />
              </div>
              <button onClick={handleSearch} disabled={loadingHist} style={{ background:`linear-gradient(135deg,${PURPLE.primary},${PURPLE.primaryDark})`, color:'white', border:'none', borderRadius:16, padding:'0 32px', fontSize:14, fontWeight:600, cursor:loadingHist?'not-allowed':'pointer', opacity:loadingHist?0.7:1, height:46, whiteSpace:'nowrap', boxShadow:`0 4px 12px ${PURPLE.primary}40` }}>
                {loadingHist ? 'Loading...' : 'Search'}
              </button>
            </div>

            {loadingHist && (
              <div style={{ display:'flex', justifyContent:'center', padding:40 }}>
                <div style={{ width:36, height:36, border:`3px solid ${PURPLE.primary}20`, borderTop:`3px solid ${PURPLE.primary}`, borderRadius:'50%', animation:'spin .8s linear infinite' }} />
              </div>
            )}

            {!loadingHist && history.length > 0 && (
              <div style={{ overflowX:'auto', maxHeight:380, overflowY:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                  <thead style={{ position:'sticky', top:0, background:tableBg, zIndex:10 }}>
                    <tr>
                      {['Product','Category','Rating'].map(h => (
                        <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontWeight:700, color:textSub, fontSize:12, borderBottom:`2px solid ${border}` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item:any, i:number) => (
                      <tr key={i} style={{ borderBottom:`1px solid ${border}` }}>
                        <td style={{ padding:'12px 16px' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                            <div style={{ width:34, height:34, borderRadius:12, background:`${PURPLE.primary}15`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>👕</div>
                            <span style={{ color:textPri, fontWeight:500 }}>{item.product_name?.substring(0,44)}</span>
                          </div>
                        </td>
                        <td style={{ padding:'12px 16px', color:textSub }}>{item.category}</td>
                        <td style={{ padding:'12px 16px' }}>
                          <div style={{ display:'flex', gap:3 }}>
                            {[...Array(item.rating||4)].map((_:any,j:number) => <Star key={j} size={14} fill="#fbbf24" color="#fbbf24" />)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!loadingHist && customerId && history.length===0 && (
              <div style={{ textAlign:'center', padding:'48px', color:textSub }}>
                <Users size={48} style={{ marginBottom:12, opacity:0.4 }} />
                <p style={{ fontSize:14, margin:0 }}>Tidak ada history untuk customer ini.</p>
              </div>
            )}
          </div>
        </>)}

        <style>{`
          @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
          @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
        `}</style>
      </main>
    )
  }

  // ════════════════════════════════════════════════
  //  PAGE: ANALYTICS
  // ════════════════════════════════════════════════
  function PageAnalytics() {
    return (
      <main style={{ flex:1, padding:isMobile?'20px 16px 80px':'28px 32px 48px', overflowY:'auto', background:bg }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
          <div style={{ background:`linear-gradient(135deg,${PURPLE.primary},${PURPLE.primaryDark})`, borderRadius:14, padding:8 }}><BarChart3 size={22} color="white" /></div>
          <h1 style={{ fontSize:28, fontWeight:800, color:textPri, margin:0 }}>Analytics</h1>
        </div>
        <p style={{ fontSize:14, color:textSub, margin:'0 0 28px' }}>Insight dan tren data H&M dataset</p>

        <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'repeat(4,1fr)', gap:20, marginBottom:28 }}>
          {[
            {label:'Avg Monthly',      value:fmt(Math.round(monthly.reduce((s,d)=>s+d.count,0)/monthly.length)), icon:BarChart3, key:'avg'},
            {label:'Peak Month',       value:'Sep 2019', icon:TrendingUp, key:'peak'},
            {label:'Total Categories', value:categories.length.toString(), icon:Layers, key:'cats'},
            {label:'Unique Colours',   value:colours.length.toString(), icon:Sparkles, key:'cols'},
          ].map(s => {
            const Icon = s.icon
            const isA  = clickedCard === s.key
            return (
              <HoverCard key={s.key} cardKey={s.key} onClick={setClickedCard} isActive={isA}>
                <div style={{ background:`${PURPLE.primary}15`, borderRadius:14, padding:10, display:'inline-flex', marginBottom:12 }}><Icon size={20} color={PURPLE.primary} /></div>
                <div style={{ fontSize:30, fontWeight:800, color:isA?PURPLE.primary:textPri }}>{s.value}</div>
                <div style={{ fontSize:13, color:textSub, marginTop:4 }}>{s.label}</div>
              </HoverCard>
            )
          })}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 1fr', gap:24, marginBottom:24 }}>
          <HoverCard cardKey="an-area" onClick={setClickedCard} isActive={clickedCard==='an-area'} style={{ padding:'24px' }}>
            <SectionHeader title="📈 Tren Transaksi Bulanan" />
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={monthly.slice(-12)} margin={{ left:-16, right:8 }}>
                <defs>
                  <linearGradient id="gB" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={CHART_COLORS[0]} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={CHART_COLORS[0]} stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={border} />
                <XAxis dataKey="name" tick={{ fontSize:11, fill:textSub }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:11, fill:textSub }} axisLine={false} tickLine={false} tickFormatter={v => fmt(v)} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="count" stroke={CHART_COLORS[0]} strokeWidth={2.5} fill="url(#gB)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </HoverCard>

          <HoverCard cardKey="an-pie" onClick={setClickedCard} isActive={clickedCard==='an-pie'} style={{ padding:'24px' }}>
            <SectionHeader title="🥧 Distribusi Kategori" />
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={categories} cx="50%" cy="50%" outerRadius={100} dataKey="count" nameKey="category" label={(e:any) => e.category.split(' ').slice(-1)[0]} labelLine={false}>
                  {categories.map((_:any, i:number) => <Cell key={i} fill={CHART_COLORS[i%CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius:12 }} />
              </PieChart>
            </ResponsiveContainer>
          </HoverCard>
        </div>

        <HoverCard cardKey="an-bar" onClick={setClickedCard} isActive={clickedCard==='an-bar'} style={{ padding:'24px' }}>
          <SectionHeader title="🏆 Top Kategori Produk" />
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={categories} layout="vertical" margin={{ left:8, right:32 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={border} horizontal={false} />
              <XAxis type="number" tick={{ fontSize:11, fill:textSub }} axisLine={false} tickLine={false} tickFormatter={v => fmt(v)} />
              <YAxis type="category" dataKey="category" tick={{ fontSize:12, fill:textSub }} axisLine={false} tickLine={false} width={150} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="count" name="Articles" fill={CHART_COLORS[3]} radius={[0,12,12,0]} />
            </BarChart>
          </ResponsiveContainer>
        </HoverCard>
      </main>
    )
  }

  // ════════════════════════════════════════════════
  //  PAGE: MODELS
  // ════════════════════════════════════════════════
  function PageModels() {
    return (
      <main style={{ flex:1, padding:isMobile?'20px 16px 80px':'28px 32px 48px', overflowY:'auto', background:bg }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
          <div style={{ background:`linear-gradient(135deg,${PURPLE.primary},${PURPLE.primaryDark})`, borderRadius:14, padding:8 }}><Cpu size={22} color="white" /></div>
          <h1 style={{ fontSize:28, fontWeight:800, color:textPri, margin:0 }}>Models</h1>
        </div>
        <p style={{ fontSize:14, color:textSub, margin:'0 0 28px' }}>Evaluasi performa model rekomendasi</p>

        <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'repeat(3,1fr)', gap:24, marginBottom:24 }}>
          {modelMetrics.map((m:any, i:number) => {
            const isA = clickedCard === `model-${i}`
            return (
              <HoverCard key={i} cardKey={`model-${i}`} onClick={setClickedCard} isActive={isA}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
                  <div style={{ background:`${PURPLE.primary}15`, borderRadius:16, padding:12 }}><Cpu size={22} color={PURPLE.primary} /></div>
                  <span style={{ background:m.status==='Best'?'#10b98120':m.status==='Production'?`${PURPLE.primary}20`:'#f59e0b20', color:m.status==='Best'?'#10b981':m.status==='Production'?PURPLE.primary:'#f59e0b', padding:'5px 14px', borderRadius:24, fontSize:11, fontWeight:700 }}>{m.status}</span>
                </div>
                <h3 style={{ fontSize:17, fontWeight:700, color:isA?PURPLE.primary:textPri, marginBottom:8 }}>{m.model}</h3>
                <p style={{ fontSize:13, color:textSub, marginBottom:18 }}>{m.params}</p>
                <div style={{ display:'flex', gap:22, borderTop:`1px solid ${border}`, paddingTop:14 }}>
                  {m.rmse && <div><div style={{ fontSize:11, color:textSub }}>RMSE</div><div style={{ fontSize:26, fontWeight:800, color:PURPLE.primary }}>{m.rmse.toFixed(4)}</div></div>}
                  {m.mae  && <div><div style={{ fontSize:11, color:textSub }}>MAE</div><div style={{ fontSize:26, fontWeight:800, color:PURPLE.primary }}>{m.mae.toFixed(4)}</div></div>}
                  {!m.rmse && <div style={{ fontSize:12, color:textSub, paddingTop:6 }}>Tidak ada metrik numerik</div>}
                </div>
              </HoverCard>
            )
          })}
        </div>

        <HoverCard cardKey="dataset" onClick={setClickedCard} isActive={clickedCard==='dataset'} style={{ padding:'28px 32px' }}>
          <SectionHeader title="📊 Dataset Summary" />
          <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'repeat(3,1fr)', gap:14 }}>
            {[
              {label:'Total Articles',   val:fmt(overview.total_articles)},
              {label:'Total Customers',  val:fmt(overview.total_customers)},
              {label:'Unique Customers', val:fmt(overview.unique_customers)},
              {label:'Unique Articles',  val:fmt(overview.unique_articles)},
              {label:'Total Ratings',    val:fmt(overview.total_ratings)},
              {label:'Model Status',     val:overview.model_status==='loaded'?'✅ Active':'❌ Off'},
            ].map(s => (
              <div key={s.label} style={{ background:tableBg, borderRadius:16, padding:'14px 18px' }}>
                <div style={{ fontSize:11, color:textSub, marginBottom:5 }}>{s.label}</div>
                <div style={{ fontSize:22, fontWeight:800, color:textPri }}>{s.val}</div>
              </div>
            ))}
          </div>
        </HoverCard>
      </main>
    )
  }

  // ════════════════════════════════════════════════
  //  PAGE: PRODUCTS
  // ════════════════════════════════════════════════
  function PageProducts() {
    const filtered = allProducts.filter((p:any) =>
      p.product_name?.toLowerCase().includes(debSearch.toLowerCase()) ||
      p.category?.toLowerCase().includes(debSearch.toLowerCase()) ||
      p.article_id?.toLowerCase().includes(debSearch.toLowerCase())
    )
    if (productsLoading) {
      return (
        <main style={{ flex:1, padding:isMobile?'20px 16px 80px':'28px 32px 48px', background:bg }}>
          <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'repeat(auto-fill,minmax(300px,1fr))', gap:24 }}>
            {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
          </div>
        </main>
      )
    }
    return (
      <main style={{ flex:1, padding:isMobile?'20px 16px 80px':'28px 32px 48px', overflowY:'auto', background:bg }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28, flexWrap:'wrap', gap:16 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:6 }}>
              <div style={{ background:`linear-gradient(135deg,${PURPLE.primary},${PURPLE.primaryDark})`, borderRadius:14, padding:8 }}><Package size={22} color="white" /></div>
              <h1 style={{ fontSize:28, fontWeight:800, color:textPri, margin:0 }}>Products</h1>
            </div>
            <p style={{ fontSize:13, color:textSub, margin:0 }}>
              {debSearch ? `🎯 ${filtered.length} dari ${allProducts.length} produk` : `📦 ${allProducts.length} produk`}
            </p>
          </div>
          <div style={{ position:'relative' }}>
            <Search size={17} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:PURPLE.primary }} />
            <input placeholder="Cari produk, kategori, ID..." value={localSearch} onChange={e => setLocalSearch(e.target.value)} style={{ paddingLeft:44, paddingRight:18, height:46, width:isMobile?'100%':280, border:`2px solid ${border}`, borderRadius:20, background:cardBg, color:textPri, fontSize:13, outline:'none' }} />
            {localSearch !== debSearch && localSearch && (
              <div style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', width:16, height:16, border:`2px solid ${PURPLE.primary}20`, borderTop:`2px solid ${PURPLE.primary}`, borderRadius:'50%', animation:'spin .6s linear infinite' }} />
            )}
          </div>
        </div>

        {filtered.length === 0 && debSearch ? (
          <HoverCard cardKey="no-res" onClick={setClickedCard} isActive={false} style={{ padding:'60px', textAlign:'center' }}>
            <Search size={52} style={{ opacity:0.3, marginBottom:16 }} />
            <h3 style={{ fontSize:18, color:textPri, marginBottom:10 }}>Tidak ditemukan</h3>
            <p style={{ color:textSub }}>Tidak ada produk yang cocok dengan "<strong>{debSearch}</strong>"</p>
          </HoverCard>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'repeat(auto-fill,minmax(300px,1fr))', gap:24 }}>
            {filtered.map((p:any, idx:number) => {
              const ck = `product-${p.article_id}`
              return (
                <HoverCard key={p.article_id} cardKey={ck} onClick={setClickedCard} isActive={clickedCard===ck}>
                  <div style={{ background:`${CHART_COLORS[idx%CHART_COLORS.length]}10`, borderRadius:18, padding:'28px', textAlign:'center', marginBottom:18 }}>
                    <ShoppingBag size={48} color={CHART_COLORS[idx%CHART_COLORS.length]} />
                  </div>
                  <h3 style={{ fontSize:16, fontWeight:700, color:clickedCard===ck?PURPLE.primary:textPri, marginBottom:6 }}>{p.product_name||`Product ${p.article_id}`}</h3>
                  <p style={{ fontSize:12, color:textSub, marginBottom:14 }}>{p.category||'Uncategorized'} · {p.colour||'Various'}</p>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:12, borderTop:`1px solid ${border}` }}>
                    <span style={{ fontSize:16, fontWeight:800, color:CHART_COLORS[idx%CHART_COLORS.length] }}>{p.purchase_count?.toLocaleString()||0} terjual</span>
                    <span style={{ fontSize:12, color:'#10b981', fontWeight:700 }}>{p.trend||'+0%'}</span>
                  </div>
                  <div style={{ fontSize:10, color:textSub, marginTop:8, textAlign:'center' }}>ID: {p.article_id}</div>
                </HoverCard>
              )
            })}
          </div>
        )}
      </main>
    )
  }

  const renderContent = () => {
    switch (activeNav) {
      case 'Dashboard': return <PageDashboard />
      case 'Analytics': return <PageAnalytics />
      case 'Models':    return <PageModels />
      case 'Products':  return <PageProducts />
      default:          return <PageDashboard />
    }
  }

  return (
    <div style={{ display:'flex', minHeight:'calc(100vh - 120px)', background:bg, fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", paddingBottom:isMobile?70:0 }}>

      {/* Mobile overlay - tampil saat sidebar terbuka di mobile */}
      {sidebarOpen && isMobile && (
        <div onClick={() => setSidebarOpen(false)} style={{ position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.4)', backdropFilter:'blur(4px)', zIndex:90 }} />
      )}

      {/* DESKTOP: Sidebar (bisa dibuka/tutup) */}
      {!isMobile && sidebarOpen && (
        <div style={{ width:270, flexShrink:0, boxShadow:'4px 0 20px -4px rgba(0,0,0,0.08)', transition: 'width 0.3s ease' }}>
          <aside style={{ width:270, background:sidebarBg, borderRight:`1px solid ${border}`, padding:'28px 0', display:'flex', flexDirection:'column', position:'sticky', top:0, height:'calc(100vh - 120px)', overflowY:'auto' }}>
            <SidebarContent onClose={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* DESKTOP: Tombol toggle sidebar saat tertutup */}
      {!isMobile && !sidebarOpen && (
        <button onClick={() => setSidebarOpen(true)} style={{ position:'fixed', left:16, top:'50%', transform:'translateY(-50%)', background:`linear-gradient(135deg,${PURPLE.primary},${PURPLE.primaryDark})`, border:'none', borderRadius:30, width:44, height:44, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', boxShadow:`0 8px 20px ${PURPLE.primary}60`, zIndex:100 }}>
          <Menu size={20} color="white" />
        </button>
      )}

      {/* MOBILE: Sidebar sebagai overlay */}
      {isMobile && sidebarOpen && (
        <div style={{ width:270, position:'fixed', left:0, top:0, bottom:0, zIndex:100, boxShadow:'4px 0 20px -4px rgba(0,0,0,0.2)' }}>
          <aside style={{ width:270, background:sidebarBg, borderRight:`1px solid ${border}`, padding:'28px 0', display:'flex', flexDirection:'column', height:'100%', overflowY:'auto' }}>
            <SidebarContent onClose={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* MOBILE: Tombol hamburger */}
      {isMobile && !sidebarOpen && (
        <button onClick={() => setSidebarOpen(true)} style={{ position:'fixed', left:16, top:'50%', transform:'translateY(-50%)', background:`linear-gradient(135deg,${PURPLE.primary},${PURPLE.primaryDark})`, border:'none', borderRadius:30, width:44, height:44, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', boxShadow:`0 8px 20px ${PURPLE.primary}60`, zIndex:100 }}>
          <Menu size={20} color="white" />
        </button>
      )}

      {renderContent()}
      {isMobile && <BottomNav />}

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}