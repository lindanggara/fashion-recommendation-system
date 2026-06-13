// frontend/src/pages/Recommender/RecommenderPage.tsx
import { useState, useEffect, useRef } from 'react'
import { 
  Sparkles, Search, Star, ArrowRight, ShoppingBag, Zap, Heart, Crown, 
  Filter, ChevronDown, User, Clock, TrendingUp, Palette, Grid3x3, List,
  History, Trash2, X, ThumbsUp, ThumbsDown
} from 'lucide-react'
import axios from 'axios'
import { useRecConfig } from '../../hooks/useRecConfig'
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts'
import { SkeletonCard } from '../../components/Skeleton'

interface Recommendation {
  article_id: string
  product_name: string
  category: string
  colour: string
  cf_score: number
  cbf_score: number
  hybrid_score: number
}

interface CustomerInfo {
  customer_id: string
  name?: string
  purchase_count?: number
  last_purchase?: string
}

type SortBy = 'hybrid_score' | 'cf_score' | 'cbf_score' | 'category' | 'colour'
type SortOrder = 'desc' | 'asc'

// Warna UNGU untuk icon dan aksen
const PURPLE = {
  primary: '#7c3aed',
  primaryDark: '#6d28d9',
  primaryLight: '#a78bfa',
  bgLight: '#f5f3ff',
}

// Warna CERAH untuk konten (card, score badges, dll)
const COLORFUL = [
  '#10b981',  // hijau
  '#f59e0b',  // orange
  '#06b6d4',  // cyan
  '#ef4444',  // merah
  '#ec4899',  // pink
  '#fbbf24',  // kuning
  '#8b5cf6',  // ungu
  '#14b8a6',  // teal
]

export default function RecommenderPage({ theme, showToast }: { theme: string; showToast?: (message: string, type: 'success' | 'error' | 'info') => void }) {
  const isDark = theme === 'dark'
  const bg = isDark ? '#0f0f1a' : PURPLE.bgLight
  const cardBg = isDark ? '#1e1e32' : '#ffffff'
  const text = isDark ? '#e2e8f0' : '#111827'
  const textLight = isDark ? '#94a3b8' : '#6b7280'
  const border = isDark ? '#2a2a4a' : '#ede9fe'

  const { config } = useRecConfig()

  const [customerId, setCustomerId] = useState('')
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingInfo, setLoadingInfo] = useState(false)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [searched, setSearched] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  
  const [sortBy, setSortBy] = useState<SortBy>('hybrid_score')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(12)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [showViewMode, setShowViewMode] = useState<'grid' | 'list'>('grid')
  
  // State untuk feedback
  const [feedbacks, setFeedbacks] = useState<Record<string, 'like' | 'dislike' | null>>({})
  const [feedbackLoading, setFeedbackLoading] = useState<Record<string, boolean>>({})
  
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const sortMenuRef = useRef<HTMLDivElement>(null)
  const historyDropdownRef = useRef<HTMLDivElement>(null)

  // Keyboard Shortcuts
  useKeyboardShortcuts({
    onSearch: () => {
      document.querySelector<HTMLInputElement>('.search-input')?.focus()
    },
    onEscape: () => {
      setShowSortMenu(false)
      setShowHistory(false)
    },
    enabled: true
  })

  // Load search history dari localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('recommender_search_history')
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory))
    }
    
    // Load saved feedbacks dari localStorage
    const savedFeedbacks = localStorage.getItem('recommender_feedbacks')
    if (savedFeedbacks) {
      setFeedbacks(JSON.parse(savedFeedbacks))
    }
  }, [])

  // Save search history ke localStorage
  const saveToHistory = (id: string) => {
    const newHistory = [id, ...searchHistory.filter(h => h !== id)].slice(0, 10)
    setSearchHistory(newHistory)
    localStorage.setItem('recommender_search_history', JSON.stringify(newHistory))
  }

  // Clear history
  const clearHistory = () => {
    setSearchHistory([])
    localStorage.removeItem('recommender_search_history')
    setShowHistory(false)
    if (showToast) showToast('Riwayat pencarian dihapus', 'success')
  }

  // Fetch customer info
  const fetchCustomerInfo = async (id: string) => {
    setLoadingInfo(true)
    try {
      const response = await axios.get(`http://localhost:8000/customer/${id}/info`)
      setCustomerInfo(response.data)
    } catch (error) {
      console.error('Error fetching customer info:', error)
      setCustomerInfo(null)
    } finally {
      setLoadingInfo(false)
    }
  }

  const handleSearch = async () => {
    if (!customerId.trim()) {
      if (showToast) showToast('Masukkan Customer ID terlebih dahulu', 'error')
      return
    }
    
    setLoading(true)
    setSearched(true)
    setCurrentPage(1)
    setShowHistory(false)
    
    saveToHistory(customerId.trim())
    await fetchCustomerInfo(customerId.trim())
    
    try {
      const response = await axios.post('http://localhost:8000/recommend', {
        customer_id: customerId,
        top_n: config.top_n,
        w_cf: config.w_cf,
        w_cbf: config.w_cbf
      })
      const recs = response.data.recommendations || []
      setRecommendations(recs)
      if (showToast) {
        if (recs.length > 0) {
          showToast(`Ditemukan ${recs.length} rekomendasi untuk customer ini! 🎯`, 'success')
        } else {
          showToast('Tidak ada rekomendasi. Customer perlu minimal 3 riwayat pembelian', 'info')
        }
      }
    } catch (error) {
      console.error('Error:', error)
      if (showToast) showToast('Gagal mendapatkan rekomendasi. Pastikan backend berjalan di port 8000', 'error')
    } finally {
      setLoading(false)
    }
  }

  const selectHistoryItem = (id: string) => {
    setCustomerId(id)
    setShowHistory(false)
    setTimeout(() => {
      handleSearch()
    }, 100)
  }

  // ========== FEEDBACK FUNCTION ==========
  const sendFeedback = async (articleId: string, type: 'like' | 'dislike') => {
    // Jika sudah memberi feedback yang sama, toggle off
    if (feedbacks[articleId] === type) {
      setFeedbacks(prev => ({ ...prev, [articleId]: null }))
      localStorage.setItem('recommender_feedbacks', JSON.stringify({ ...feedbacks, [articleId]: null }))
      if (showToast) showToast(`Feedback ${type === 'like' ? '👍' : '👎'} dibatalkan`, 'info')
      return
    }
    
    setFeedbackLoading(prev => ({ ...prev, [articleId]: true }))
    
    try {
      // Simpan ke localStorage dulu (offline support)
      const newFeedbacks = { ...feedbacks, [articleId]: type }
      setFeedbacks(newFeedbacks)
      localStorage.setItem('recommender_feedbacks', JSON.stringify(newFeedbacks))
      
      // Kirim ke backend jika online
      try {
        await axios.post('http://localhost:8000/feedback', {
          article_id: articleId,
          customer_id: customerId,
          feedback: type,
          timestamp: new Date().toISOString()
        })
        if (showToast) showToast(`Terima kasih atas feedback ${type === 'like' ? '👍' : '👎'}!`, 'success')
      } catch (e) {
        console.log('Offline mode: feedback saved locally')
        if (showToast) showToast(`Feedback disimpan (offline mode)`, 'info')
      }
    } catch (error) {
      console.error('Feedback error:', error)
      if (showToast) showToast('Gagal mengirim feedback', 'error')
      // Revert feedback
      setFeedbacks(prev => ({ ...prev, [articleId]: null }))
    } finally {
      setFeedbackLoading(prev => ({ ...prev, [articleId]: false }))
    }
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (historyDropdownRef.current && !historyDropdownRef.current.contains(event.target as Node)) {
        const isHistoryButton = (event.target as HTMLElement).closest('.history-button')
        const isSearchInput = (event.target as HTMLElement).closest('.search-input')
        if (!isHistoryButton && !isSearchInput) {
          setShowHistory(false)
        }
      }
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
        setShowSortMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getSortedRecommendations = () => {
    let sorted = [...recommendations]
    if (sortBy === 'category') {
      sorted.sort((a, b) => sortOrder === 'desc' 
        ? b.category.localeCompare(a.category) 
        : a.category.localeCompare(b.category))
    } else if (sortBy === 'colour') {
      sorted.sort((a, b) => sortOrder === 'desc' 
        ? b.colour.localeCompare(a.colour) 
        : a.colour.localeCompare(b.colour))
    } else {
      sorted.sort((a, b) => sortOrder === 'desc' 
        ? b[sortBy] - a[sortBy] 
        : a[sortBy] - b[sortBy])
    }
    return sorted
  }

  const getPaginatedRecommendations = () => {
    const sorted = getSortedRecommendations()
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return sorted.slice(startIndex, endIndex)
  }

  const totalPages = Math.ceil(recommendations.length / itemsPerPage)

  const sortOptions: { value: SortBy; label: string; icon: React.ReactNode }[] = [
    { value: 'hybrid_score', label: 'Hybrid Score', icon: <Star size={14} /> },
    { value: 'cf_score', label: 'CF Score', icon: <Zap size={14} /> },
    { value: 'cbf_score', label: 'CBF Score', icon: <Heart size={14} /> },
    { value: 'category', label: 'Category', icon: <Grid3x3 size={14} /> },
    { value: 'colour', label: 'Colour', icon: <Palette size={14} /> },
  ]

  const getScoreColor = (score: number) => {
    if (score >= 0.7) return COLORFUL[0] // hijau
    if (score >= 0.5) return COLORFUL[1] // orange
    return COLORFUL[3] // merah
  }

  const getScoreBg = (score: number) => {
    if (score >= 0.7) return `${COLORFUL[0]}15`
    if (score >= 0.5) return `${COLORFUL[1]}15`
    return `${COLORFUL[3]}15`
  }

  const getScoreLabel = (score: number) => {
    if (score >= 0.7) return 'Best'
    if (score >= 0.5) return 'Good'
    return 'Fair'
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  // Loading Skeleton for recommendations
  const LoadingSkeleton = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
      {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
    </div>
  )

  return (
    <div style={{ background: bg, minHeight: 'calc(100vh - 120px)', fontFamily: "'Inter',-apple-system,sans-serif", overflowX: 'hidden' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 2rem 60px', boxSizing: 'border-box' }}>

        {/* Hero Section - ICON UNGU */}
        <div style={{ 
          background: `linear-gradient(135deg, ${PURPLE.bgLight}, ${isDark ? '#1a1540' : '#e0d9ff'})`, 
          borderRadius: 32, 
          padding: '2.5rem 2rem', 
          textAlign: 'center', 
          marginBottom: 36,
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: `linear-gradient(135deg, ${PURPLE.primary}, ${PURPLE.primaryDark})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', boxShadow: `0 8px 20px -6px ${PURPLE.primary}80`
          }}>
            <Sparkles size={28} color="white" />
          </div>

          <div style={{ 
            display: 'inline-flex', alignItems: 'center', gap: 6, 
            background: isDark ? '#2a2040' : '#ffffff', 
            borderRadius: 50, padding: '4px 20px', marginBottom: 16 
          }}>
            <Crown size={13} color={PURPLE.primary} />
            <span style={{ fontSize: 11, fontWeight: 600, color: PURPLE.primary }}>AI-POWERED</span>
          </div>

          <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', fontWeight: 800, color: isDark ? '#c4b5fd' : '#4c3db5', margin: '0 0 10px', lineHeight: 1.2 }}>
            Cari <span style={{ color: PURPLE.primary }}>Rekomendasi</span> Fashion
          </h1>
          <p style={{ fontSize: 15, color: isDark ? '#a78bfa' : '#6d5de0', maxWidth: 500, margin: '0 auto' }}>
            Masukkan Customer ID untuk rekomendasi personal
          </p>
          <p style={{ fontSize: 11, color: textLight, marginTop: 12 }}>
            💡 Tekan <kbd style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: 6, fontSize: 10 }}>Ctrl+K</kbd> untuk fokus ke search
          </p>
        </div>

        {/* Search Section - ICON UNGU */}
        <div ref={searchContainerRef} style={{ maxWidth: 800, margin: '0 auto', marginBottom: 40, position: 'relative' }}>
          <p style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: PURPLE.primary, marginBottom: 10, letterSpacing: 1 }}>
            CUSTOMER ID
          </p>
          <div style={{ 
            display: 'flex', gap: 10, background: cardBg, padding: '6px', borderRadius: 60, 
            border: `1px solid ${border}`, boxShadow: `0 4px 12px -4px ${PURPLE.primary}20`,
            position: 'relative',
            zIndex: 10
          }}>
            <div style={{ display: 'flex', alignItems: 'center', paddingLeft: 18, gap: 8 }}>
              <Search size={18} color={PURPLE.primary} />
              {searchHistory.length > 0 && (
                <button
                  className="history-button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowHistory(!showHistory)
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 4
                  }}
                >
                  <History size={16} color={showHistory ? PURPLE.primary : textLight} />
                </button>
              )}
            </div>
            <input
              className="search-input"
              type="text"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              placeholder="00007d2de826758b65a93dd24ce629ed66842531df6699338c5570910a014cc2"
              style={{
                flex: 1, padding: '14px 0', border: 'none', fontSize: 13,
                outline: 'none', background: 'transparent', color: text,
                fontFamily: 'monospace'
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              onFocus={() => {
                if (searchHistory.length > 0) {
                  setShowHistory(true)
                }
              }}
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              style={{
                background: `linear-gradient(135deg, ${PURPLE.primary}, ${PURPLE.primaryDark})`,
                color: 'white', border: 'none', padding: '12px 28px',
                borderRadius: 60, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: 13, opacity: loading ? 0.7 : 1,
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              {loading ? 'Memuat...' : 'Cari'}
              {!loading && <ArrowRight size={14} />}
            </button>
          </div>

          {/* Search History Dropdown */}
          {showHistory && searchHistory.length > 0 && (
            <div 
              ref={historyDropdownRef}
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: 8,
                background: cardBg,
                borderRadius: 16,
                border: `1px solid ${border}`,
                boxShadow: `0 8px 24px rgba(0,0,0,0.2)`,
                zIndex: 1000,
                overflow: 'hidden'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                borderBottom: `1px solid ${border}`
              }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: textLight }}>Riwayat Pencarian</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    clearHistory()
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#ef4444',
                    fontSize: 11,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  <Trash2 size={12} /> Hapus semua
                </button>
              </div>
              {searchHistory.map((id, idx) => (
                <div
                  key={idx}
                  onClick={() => selectHistoryItem(id)}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    borderBottom: idx < searchHistory.length - 1 ? `1px solid ${border}` : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = `${PURPLE.primary}10`}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <History size={14} color={PURPLE.primary} />
                  <span style={{ fontSize: 12, fontFamily: 'monospace', color: text }}>{id.substring(0, 40)}...</span>
                  <Clock size={12} color={textLight} style={{ marginLeft: 'auto' }} />
                </div>
              ))}
            </div>
          )}
          
          <p style={{ textAlign: 'center', fontSize: 11, color: textLight, marginTop: 10 }}>
            Bobot aktif — CF: {config.w_cf} · CBF: {config.w_cbf} · Top {config.top_n}
          </p>
        </div>

        {/* Customer Info - ICON UNGU */}
        {customerInfo && !loading && searched && (
          <div style={{
            background: `linear-gradient(135deg, ${PURPLE.primary}10, ${PURPLE.primary}05)`,
            borderRadius: 20,
            padding: '16px 24px',
            marginBottom: 24,
            border: `1px solid ${PURPLE.primary}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 24,
                background: `linear-gradient(135deg, ${PURPLE.primary}, ${PURPLE.primaryDark})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <User size={24} color="white" />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: text, margin: 0 }}>
                  {customerInfo.name || `Customer ${customerInfo.customer_id.substring(0, 10)}...`}
                </h3>
                <p style={{ fontSize: 12, color: textLight, margin: '4px 0 0' }}>
                  {customerInfo.purchase_count} kali pembelian • Terakhir: {formatDate(customerInfo.last_purchase)}
                </p>
              </div>
            </div>
            <div style={{
              background: `${PURPLE.primary}15`,
              padding: '6px 14px',
              borderRadius: 30,
              fontSize: 12,
              color: PURPLE.primary,
              fontWeight: 600
            }}>
              ID: {customerInfo.customer_id.substring(0, 16)}...
            </div>
          </div>
        )}

        {/* Loading State - Menggunakan Skeleton */}
        {loading && <LoadingSkeleton />}

        {/* Empty State */}
        {searched && !loading && recommendations.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, background: cardBg, borderRadius: 28, border: `1px solid ${border}` }}>
            <div style={{ width: 60, height: 60, borderRadius: 16, background: `${PURPLE.primary}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Search size={28} color={textLight} />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: text, marginBottom: 6 }}>Tidak Ada Rekomendasi</h3>
            <p style={{ fontSize: 13, color: textLight }}>Customer perlu minimal 3 riwayat pembelian</p>
          </div>
        )}

        {/* Results Section */}
        {recommendations.length > 0 && !loading && (
          <>
            {/* Header dengan Sort dan View Mode */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              marginBottom: 20, 
              flexWrap: 'wrap', 
              gap: 16 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ background: `${PURPLE.primary}15`, borderRadius: 12, padding: 8 }}>
                  <Sparkles size={16} color={PURPLE.primary} />
                </div>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: text, margin: 0 }}>Rekomendasi untukmu</h2>
                  <p style={{ fontSize: 11, color: textLight, marginTop: 2 }}>
                    {recommendations.length} produk ditemukan
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                {/* Sort Dropdown - ICON UNGU */}
                <div ref={sortMenuRef} style={{ position: 'relative' }}>
                  <button
                    onClick={() => setShowSortMenu(!showSortMenu)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      background: `${PURPLE.primary}10`,
                      border: `1px solid ${border}`,
                      borderRadius: 30,
                      padding: '8px 16px',
                      cursor: 'pointer',
                      fontSize: 12,
                      fontWeight: 500,
                      color: text
                    }}
                  >
                    <Filter size={14} color={PURPLE.primary} />
                    Sort by: {sortOptions.find(o => o.value === sortBy)?.label}
                    <ChevronDown size={14} />
                  </button>

                  {showSortMenu && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: 8,
                      background: cardBg,
                      borderRadius: 16,
                      border: `1px solid ${border}`,
                      boxShadow: `0 8px 24px rgba(0,0,0,0.15)`,
                      minWidth: 160,
                      zIndex: 100,
                      overflow: 'hidden'
                    }}>
                      {sortOptions.map(option => (
                        <div
                          key={option.value}
                          onClick={() => {
                            if (sortBy === option.value) {
                              setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
                            } else {
                              setSortBy(option.value)
                              setSortOrder('desc')
                            }
                            setShowSortMenu(false)
                          }}
                          style={{
                            padding: '10px 16px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            fontSize: 13,
                            color: sortBy === option.value ? PURPLE.primary : text,
                            background: sortBy === option.value ? `${PURPLE.primary}10` : 'transparent',
                            transition: 'background 0.2s'
                          }}
                        >
                          <span style={{ color: sortBy === option.value ? PURPLE.primary : textLight }}>
                            {option.icon}
                          </span>
                          {option.label}
                          {sortBy === option.value && (
                            <span style={{ marginLeft: 'auto', fontSize: 11 }}>
                              {sortOrder === 'desc' ? '↓' : '↑'}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* View Mode Toggle */}
                <div style={{
                  display: 'flex',
                  background: `${PURPLE.primary}10`,
                  borderRadius: 30,
                  padding: 4
                }}>
                  <button
                    onClick={() => setShowViewMode('grid')}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 26,
                      background: showViewMode === 'grid' ? PURPLE.primary : 'transparent',
                      color: showViewMode === 'grid' ? 'white' : textLight,
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 12
                    }}
                  >
                    <Grid3x3 size={14} /> Grid
                  </button>
                  <button
                    onClick={() => setShowViewMode('list')}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 26,
                      background: showViewMode === 'list' ? PURPLE.primary : 'transparent',
                      color: showViewMode === 'list' ? 'white' : textLight,
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 12
                    }}
                  >
                    <List size={14} /> List
                  </button>
                </div>
              </div>
            </div>

            {/* Info Sort */}
            <div style={{
              textAlign: 'right',
              fontSize: 11,
              color: textLight,
              marginBottom: 16
            }}>
              Diurutkan berdasarkan {sortOptions.find(o => o.value === sortBy)?.label} ({sortOrder === 'desc' ? 'tertinggi ke terendah' : 'terendah ke tertinggi'})
            </div>

            {/* GRID VIEW - DENGAN FEEDBACK BUTTON */}
            {showViewMode === 'grid' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                {getPaginatedRecommendations().map((rec, idx) => {
                  const colorIndex = idx % COLORFUL.length
                  const feedback = feedbacks[rec.article_id]
                  const isFeedbackLoading = feedbackLoading[rec.article_id]
                  
                  return (
                    <div 
                      key={rec.article_id} 
                      style={{ 
                        background: cardBg, 
                        borderRadius: 24,
                        border: hoveredIndex === idx ? `2px solid ${PURPLE.primary}` : `1px solid ${border}`,
                        transition: 'all 0.3s ease',
                        transform: hoveredIndex === idx ? 'translateY(-4px)' : 'translateY(0)',
                        boxShadow: hoveredIndex === idx ? `0 12px 24px -12px ${PURPLE.primary}50` : '0 2px 8px rgba(0,0,0,0.04)',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={() => setHoveredIndex(idx)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      <div style={{ 
                        padding: '14px 18px', 
                        borderBottom: `1px solid ${border}`, 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        background: isDark ? '#16162a' : '#faf5ff',
                        borderTopLeftRadius: 24,
                        borderTopRightRadius: 24,
                      }}>
                        <div style={{
                          background: `linear-gradient(135deg, ${COLORFUL[colorIndex]}, ${COLORFUL[colorIndex]}80)`,
                          width: 32, height: 32, borderRadius: 12,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, fontSize: 14, color: 'white'
                        }}>{(currentPage - 1) * itemsPerPage + idx + 1}</div>
                        <div style={{ 
                          background: getScoreBg(rec.hybrid_score), 
                          padding: '4px 14px', borderRadius: 30,
                          display: 'flex', alignItems: 'center', gap: 6 
                        }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: getScoreColor(rec.hybrid_score) }} />
                          <span style={{ fontSize: 11, fontWeight: 600, color: getScoreColor(rec.hybrid_score) }}>{getScoreLabel(rec.hybrid_score)}</span>
                        </div>
                      </div>

                      <div style={{ padding: '18px' }}>
                        <div style={{ 
                          background: `${COLORFUL[colorIndex]}10`, 
                          borderRadius: 20,
                          padding: '24px', 
                          textAlign: 'center', 
                          marginBottom: 14 
                        }}>
                          <ShoppingBag size={32} color={COLORFUL[colorIndex]} strokeWidth={1.5} />
                        </div>
                        <h3 style={{ 
                          fontSize: 14, 
                          fontWeight: 700, 
                          color: text, 
                          marginBottom: 8, 
                          lineHeight: 1.4
                        }}>
                          {rec.product_name?.substring(0, 50)}
                        </h3>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                          <span style={{ 
                            background: `${PURPLE.primary}10`, 
                            padding: '4px 12px', 
                            borderRadius: 20,
                            fontSize: 11, 
                            color: PURPLE.primary, 
                            fontWeight: 500 
                          }}>
                            {rec.category}
                          </span>
                          <span style={{ 
                            background: `${PURPLE.primary}10`, 
                            padding: '4px 12px', 
                            borderRadius: 20,
                            fontSize: 11, 
                            color: PURPLE.primary, 
                            fontWeight: 500 
                          }}>
                            {rec.colour}
                          </span>
                        </div>
                      </div>

                      <div style={{ 
                        padding: '12px 18px', 
                        borderTop: `1px solid ${border}`, 
                        background: isDark ? '#0f0f1a' : '#faf5ff',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 10,
                        borderBottomLeftRadius: 24,
                        borderBottomRightRadius: 24,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Zap size={12} color={PURPLE.primary} />
                          <span style={{ color: textLight, fontSize: 11 }}>CF: {rec.cf_score.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Heart size={12} color={PURPLE.primary} />
                          <span style={{ color: textLight, fontSize: 11 }}>CBF: {rec.cbf_score.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Star size={12} fill={COLORFUL[colorIndex]} color={COLORFUL[colorIndex]} />
                          <span style={{ color: COLORFUL[colorIndex], fontWeight: 600, fontSize: 11 }}>{rec.hybrid_score.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* ========== FEEDBACK BUTTON ========== */}
                      <div style={{ 
                        padding: '10px 18px 14px 18px', 
                        borderTop: `1px solid ${border}`,
                        display: 'flex',
                        justifyContent: 'center',
                        gap: 12,
                        background: isDark ? '#0f0f1a' : '#faf5ff',
                        borderBottomLeftRadius: 24,
                        borderBottomRightRadius: 24,
                      }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            sendFeedback(rec.article_id, 'like')
                          }}
                          disabled={isFeedbackLoading}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '6px 16px',
                            borderRadius: 30,
                            border: `1px solid ${feedback === 'like' ? '#10b981' : border}`,
                            background: feedback === 'like' ? '#10b98115' : 'transparent',
                            cursor: isFeedbackLoading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s',
                            fontSize: 12,
                            fontWeight: 500,
                            color: feedback === 'like' ? '#10b981' : textLight
                          }}
                        >
                          {isFeedbackLoading ? (
                            <div style={{ width: 14, height: 14, border: `2px solid ${PURPLE.primary}20`, borderTop: `2px solid ${PURPLE.primary}`, borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                          ) : (
                            <ThumbsUp size={14} />
                          )}
                          {feedback === 'like' ? 'Liked' : 'Like'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            sendFeedback(rec.article_id, 'dislike')
                          }}
                          disabled={isFeedbackLoading}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '6px 16px',
                            borderRadius: 30,
                            border: `1px solid ${feedback === 'dislike' ? '#ef4444' : border}`,
                            background: feedback === 'dislike' ? '#ef444415' : 'transparent',
                            cursor: isFeedbackLoading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s',
                            fontSize: 12,
                            fontWeight: 500,
                            color: feedback === 'dislike' ? '#ef4444' : textLight
                          }}
                        >
                          {isFeedbackLoading ? (
                            <div style={{ width: 14, height: 14, border: `2px solid ${PURPLE.primary}20`, borderTop: `2px solid ${PURPLE.primary}`, borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                          ) : (
                            <ThumbsDown size={14} />
                          )}
                          {feedback === 'dislike' ? 'Disliked' : 'Dislike'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              /* LIST VIEW - DENGAN FEEDBACK BUTTON */
              <div style={{ background: cardBg, borderRadius: 24, border: `1px solid ${border}`, overflow: 'hidden' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '60px 1fr 100px 100px 120px 140px',
                  padding: '14px 20px',
                  background: `${PURPLE.primary}10`,
                  borderBottom: `1px solid ${border}`,
                  fontSize: 12,
                  fontWeight: 600,
                  color: textLight
                }}>
                  <div>#</div>
                  <div>Produk</div>
                  <div>Kategori</div>
                  <div>Warna</div>
                  <div style={{ textAlign: 'right' }}>Hybrid Score</div>
                  <div style={{ textAlign: 'center' }}>Feedback</div>
                </div>
                {getPaginatedRecommendations().map((rec, idx) => {
                  const colorIndex = idx % COLORFUL.length
                  const feedback = feedbacks[rec.article_id]
                  const isFeedbackLoading = feedbackLoading[rec.article_id]
                  
                  return (
                    <div
                      key={rec.article_id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '60px 1fr 100px 100px 120px 140px',
                        padding: '16px 20px',
                        borderBottom: idx < getPaginatedRecommendations().length - 1 ? `1px solid ${border}` : 'none',
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = `${PURPLE.primary}05`}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{
                        width: 32, height: 32, borderRadius: 10,
                        background: `linear-gradient(135deg, ${COLORFUL[colorIndex]}, ${COLORFUL[colorIndex]}80)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 700, color: 'white'
                      }}>{(currentPage - 1) * itemsPerPage + idx + 1}</div>
                      <div>
                        <div style={{ fontWeight: 600, color: text }}>{rec.product_name?.substring(0, 40)}</div>
                        <div style={{ fontSize: 11, color: textLight, fontFamily: 'monospace' }}>{rec.article_id}</div>
                      </div>
                      <div><span style={{ background: `${PURPLE.primary}10`, padding: '4px 10px', borderRadius: 20, fontSize: 11, color: PURPLE.primary }}>{rec.category}</span></div>
                      <div><span style={{ background: `${PURPLE.primary}10`, padding: '4px 10px', borderRadius: 20, fontSize: 11, color: PURPLE.primary }}>{rec.colour}</span></div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{
                          background: getScoreBg(rec.hybrid_score),
                          padding: '4px 12px',
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 600,
                          color: getScoreColor(rec.hybrid_score)
                        }}>
                          {rec.hybrid_score.toFixed(2)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            sendFeedback(rec.article_id, 'like')
                          }}
                          disabled={isFeedbackLoading}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '4px 10px',
                            borderRadius: 20,
                            border: `1px solid ${feedback === 'like' ? '#10b981' : border}`,
                            background: feedback === 'like' ? '#10b98115' : 'transparent',
                            cursor: isFeedbackLoading ? 'not-allowed' : 'pointer',
                            fontSize: 11,
                            color: feedback === 'like' ? '#10b981' : textLight
                          }}
                        >
                          <ThumbsUp size={12} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            sendFeedback(rec.article_id, 'dislike')
                          }}
                          disabled={isFeedbackLoading}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '4px 10px',
                            borderRadius: 20,
                            border: `1px solid ${feedback === 'dislike' ? '#ef4444' : border}`,
                            background: feedback === 'dislike' ? '#ef444415' : 'transparent',
                            cursor: isFeedbackLoading ? 'not-allowed' : 'pointer',
                            fontSize: 11,
                            color: feedback === 'dislike' ? '#ef4444' : textLight
                          }}
                        >
                          <ThumbsDown size={12} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 12,
                    border: `1px solid ${border}`,
                    background: cardBg,
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    opacity: currentPage === 1 ? 0.5 : 1,
                    color: text
                  }}
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        border: currentPage === pageNum ? 'none' : `1px solid ${border}`,
                        background: currentPage === pageNum ? PURPLE.primary : 'transparent',
                        color: currentPage === pageNum ? 'white' : text,
                        cursor: 'pointer',
                        fontWeight: currentPage === pageNum ? 600 : 400
                      }}
                    >
                      {pageNum}
                    </button>
                  )
                })}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 12,
                    border: `1px solid ${border}`,
                    background: cardBg,
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    opacity: currentPage === totalPages ? 0.5 : 1,
                    color: text
                  }}
                >
                  Next
                </button>
              </div>
            )}

            <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: textLight }}>
              Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, recommendations.length)} dari {recommendations.length} produk
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}