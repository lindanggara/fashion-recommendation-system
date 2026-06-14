// frontend/src/pages/CustomerHistory/CustomerHistoryPage.tsx
import { useState, useEffect, useRef } from 'react'
import { 
  Search, User, Package, Star, ShoppingBag, Award, 
  Download, Filter, RefreshCw, DollarSign,
  ShoppingCart, RotateCcw, ChevronDown, Check,
  History, Trash2, Clock, Sparkles
} from 'lucide-react'
import axios from 'axios'
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts'
import { API_BASE_URL } from '../../config/api'

interface Purchase {
  article_id: string
  product_name: string
  category: string
  colour: string
  rating: number
  price?: number
  purchase_date?: string
}

interface CustomerSummary {
  total_spent: number
  total_items: number
  avg_rating: number
  favorite_category: string
  favorite_colour: string
  last_purchase: string
}

// Preview data (fallback jika backend belum siap)
const PREVIEW_HISTORY: Purchase[] = [
  { article_id: '0706016001', product_name: 'Ladies Classic Tee', category: 'Upper body', colour: 'Black', rating: 5, price: 299000 },
  { article_id: '0448509014', product_name: 'Slim Fit Denim Jeans', category: 'Lower body', colour: 'Dark Blue', rating: 4, price: 599000 },
  { article_id: '0372860001', product_name: 'Basic Hoodie', category: 'Upper body', colour: 'Grey', rating: 5, price: 399000 },
  { article_id: '0610776002', product_name: 'Ribbed Jersey Top', category: 'Upper body', colour: 'White', rating: 4, price: 199000 },
  { article_id: '0156231001', product_name: 'Floral Wrap Dress', category: 'Full body', colour: 'Pink', rating: 5, price: 499000 },
]

// Preview summary
const PREVIEW_SUMMARY: CustomerSummary = {
  total_spent: 1995000,
  total_items: 5,
  avg_rating: 4.6,
  favorite_category: 'Upper body',
  favorite_colour: 'Black',
  last_purchase: '2024-01-15'
}

// Contoh Customer ID yang valid
const EXAMPLE_CUSTOMERS = [
  { id: '00007d2de826758b65a93dd24ce629ed66842531df6699338c5570910a014cc2', label: '🛍️ Customer Aktif', color: '#10b981' },
  { id: '0000f9c9e9d5e2a1b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6', label: '⭐ Customer Premium', color: '#f59e0b' },
]

export default function CustomerHistoryPage({ theme, showToast }: { theme: string; showToast?: (message: string, type: 'success' | 'error' | 'info') => void }) {
  const isDark = theme === 'dark'
  const bg = isDark ? '#0f0f1a' : '#f4f3ff'
  const cardBg = isDark ? '#1e1e32' : '#ffffff'
  const text = isDark ? '#e2e8f0' : '#111827'
  const textLight = isDark ? '#94a3b8' : '#6b7280'
  const border = isDark ? '#2a2a4a' : '#ede9fe'
  const primary = '#7c5af3'
  const heroBg = isDark ? '#1a1540' : '#ede9fe'
  const heroText = isDark ? '#c4b5fd' : '#4c3db5'
  const heroSub = isDark ? '#a78bfa' : '#6d5de0'

  const [customerId, setCustomerId] = useState('')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<Purchase[]>([])
  const [searched, setSearched] = useState(false)
  const [customerSummary, setCustomerSummary] = useState<CustomerSummary | null>(null)
  const [showPreview, setShowPreview] = useState(true)
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [categories, setCategories] = useState<string[]>([])
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  
  // Export states
  const [exporting, setExporting] = useState(false)
  
  // Reorder states
  const [reordering, setReordering] = useState<string | null>(null)

  // Search History states
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const historyDropdownRef = useRef<HTMLDivElement>(null)

  // Keyboard Shortcuts
  useKeyboardShortcuts({
    onSearch: () => {
      document.querySelector<HTMLInputElement>('.customer-history-input')?.focus()
    },
    onEscape: () => {
      setShowFilterDropdown(false)
      setShowHistory(false)
    },
    enabled: true
  })

  // Load search history dari localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('customer_search_history')
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory))
    }
  }, [])

  // Save search history ke localStorage
  const saveToHistory = (id: string) => {
    const newHistory = [id, ...searchHistory.filter(h => h !== id)].slice(0, 10)
    setSearchHistory(newHistory)
    localStorage.setItem('customer_search_history', JSON.stringify(newHistory))
  }

  // Clear history
  const clearHistory = () => {
    setSearchHistory([])
    localStorage.removeItem('customer_search_history')
    setShowHistory(false)
    if (showToast) showToast('Riwayat pencarian dihapus', 'success')
  }

  // Fetch categories from history
  useEffect(() => {
    if (history.length > 0) {
      const uniqueCategories = [...new Set(history.map(item => item.category))]
      setCategories(uniqueCategories)
    }
  }, [history])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (historyDropdownRef.current && !historyDropdownRef.current.contains(event.target as Node)) {
        const isHistoryButton = (event.target as HTMLElement).closest('.history-button')
        const isSearchInput = (event.target as HTMLElement).closest('.customer-history-input')
        if (!isHistoryButton && !isSearchInput) {
          setShowHistory(false)
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Load contoh customer
  const loadExampleCustomer = async (id: string, label: string) => {
    setCustomerId(id)
    setShowPreview(false)
    setShowHistory(false)
    
    setLoading(true)
    setSearched(true)
    setSelectedCategory('all')
    
    saveToHistory(id)
    
    try {
      const response = await axios.get(`${API_BASE_URL}/customer/${id}/history`)
      const purchases = response.data.purchases || []
      setHistory(purchases)
      
      if (showToast) {
        if (purchases.length > 0) {
          showToast(`Ditemukan ${purchases.length} riwayat pembelian untuk ${label}! 📋`, 'success')
        } else {
          showToast(`Customer ${label} tidak memiliki riwayat pembelian`, 'info')
        }
      }
      
      try {
        const summaryResponse = await axios.get(`${API_BASE_URL}/customer/${id}/summary`)
        setCustomerSummary(summaryResponse.data)
      } catch {
        const totalSpent = purchases.reduce((sum: number, item: Purchase) => sum + (item.price || 0), 0)
        const avgRating = purchases.length > 0 ? purchases.reduce((sum: number, item: Purchase) => sum + item.rating, 0) / purchases.length : 0
        const categoryCount: Record<string, number> = {}
        const colourCount: Record<string, number> = {}
        purchases.forEach((item: Purchase) => {
          categoryCount[item.category] = (categoryCount[item.category] || 0) + 1
          colourCount[item.colour] = (colourCount[item.colour] || 0) + 1
        })
        const favoriteCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '-'
        const favoriteColour = Object.entries(colourCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '-'
        setCustomerSummary({
          total_spent: totalSpent,
          total_items: purchases.length,
          avg_rating: avgRating,
          favorite_category: favoriteCategory,
          favorite_colour: favoriteColour,
          last_purchase: purchases[0]?.purchase_date || new Date().toISOString()
        })
      }
    } catch (error) {
      console.error('Error:', error)
      if (showToast) showToast('Gagal mendapatkan history customer', 'error')
      setShowPreview(true)
      setSearched(false)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!customerId.trim()) {
      if (showToast) showToast('Masukkan Customer ID terlebih dahulu', 'error')
      return
    }
    
    setShowPreview(false)
    saveToHistory(customerId.trim())
    setShowHistory(false)
    
    setLoading(true)
    setSearched(true)
    setSelectedCategory('all')
    
    try {
      const response = await axios.get(`${API_BASE_URL}/customer/${customerId}/history`)
      const purchases = response.data.purchases || []
      setHistory(purchases)
      
      if (showToast) {
        if (purchases.length > 0) {
          showToast(`Ditemukan ${purchases.length} riwayat pembelian! 📋`, 'success')
        } else {
          showToast('Customer tidak memiliki riwayat pembelian', 'info')
        }
      }
      
      try {
        const summaryResponse = await axios.get(`${API_BASE_URL}/customer/${customerId}/summary`)
        setCustomerSummary(summaryResponse.data)
      } catch {
        const totalSpent = purchases.reduce((sum: number, item: Purchase) => sum + (item.price || 0), 0)
        const avgRating = purchases.length > 0 ? purchases.reduce((sum: number, item: Purchase) => sum + item.rating, 0) / purchases.length : 0
        const categoryCount: Record<string, number> = {}
        const colourCount: Record<string, number> = {}
        purchases.forEach((item: Purchase) => {
          categoryCount[item.category] = (categoryCount[item.category] || 0) + 1
          colourCount[item.colour] = (colourCount[item.colour] || 0) + 1
        })
        const favoriteCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '-'
        const favoriteColour = Object.entries(colourCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '-'
        setCustomerSummary({
          total_spent: totalSpent,
          total_items: purchases.length,
          avg_rating: avgRating,
          favorite_category: favoriteCategory,
          favorite_colour: favoriteColour,
          last_purchase: purchases[0]?.purchase_date || new Date().toISOString()
        })
      }
    } catch (error) {
      console.error('Error:', error)
      if (showToast) showToast('Gagal mendapatkan history customer. Pastikan backend running', 'error')
      setShowPreview(true)
      setSearched(false)
    } finally {
      setLoading(false)
    }
  }

  // Filter history by category
  const getFilteredHistory = () => {
    if (selectedCategory === 'all') return history
    return history.filter(item => item.category === selectedCategory)
  }

  const filteredHistory = getFilteredHistory()

  // Export to CSV
  const exportToCSV = async () => {
    const dataToExport = showPreview ? PREVIEW_HISTORY : filteredHistory
    if (dataToExport.length === 0) {
      if (showToast) showToast('Tidak ada data untuk diexport', 'error')
      return
    }
    
    setExporting(true)
    try {
      const headers = ['Product Name', 'Category', 'Colour', 'Rating', 'Price', 'Purchase Date']
      const rows = dataToExport.map(item => [
        `"${item.product_name}"`,
        item.category,
        item.colour,
        item.rating,
        item.price || 0,
        item.purchase_date || '-'
      ])
      
      const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const fileName = showPreview ? 'preview_history.csv' : `customer_${customerId.slice(0, 10)}_history.csv`
      a.download = fileName
      a.click()
      URL.revokeObjectURL(url)
      if (showToast) showToast('History exported successfully! 📥', 'success')
    } catch (error) {
      console.error('Export error:', error)
      if (showToast) showToast('Failed to export history', 'error')
    } finally {
      setExporting(false)
    }
  }

  // Reorder product
  const handleReorder = async (product: Purchase) => {
    setReordering(product.article_id)
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      if (showToast) showToast(`"${product.product_name}" added to cart! 🛒`, 'success')
    } catch (error) {
      console.error('Reorder error:', error)
      if (showToast) showToast('Failed to reorder product', 'error')
    } finally {
      setReordering(null)
    }
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
  }

  const selectHistoryItem = (id: string) => {
    setCustomerId(id)
    setShowHistory(false)
    setTimeout(() => {
      handleSearch()
    }, 100)
  }

  return (
    <div style={{ background: bg, minHeight: 'calc(100vh - 120px)', fontFamily: "'Inter',-apple-system,sans-serif" }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 2rem 64px' }}>

        {/* Hero Section */}
        <div style={{ background: heroBg, borderRadius: 36, padding: '3rem 2.5rem', textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: isDark ? '#2a2040' : '#ddd6fe', borderRadius: 100, padding: '6px 20px', marginBottom: 24 }}>
            <User size={15} color={isDark ? '#c4b5fd' : primary} />
            <span style={{ fontSize: 14, fontWeight: 600, color: isDark ? '#c4b5fd' : primary }}>Customer Insights</span>
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, color: heroText, margin: '0 0 16px', lineHeight: 1.2 }}>
            Customer <span style={{ color: primary }}>Purchase History</span>
          </h1>
          <p style={{ fontSize: 18, color: heroSub, maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
            Lihat riwayat pembelian, preferensi, dan analisis pelanggan
          </p>
          <p style={{ fontSize: 11, color: textLight, marginTop: 12 }}>
            💡 Tekan <kbd style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: 6, fontSize: 10 }}>Ctrl+K</kbd> untuk fokus ke search
          </p>
        </div>

        {/* Search Section with History */}
        <div ref={searchContainerRef} style={{ maxWidth: 800, margin: '0 auto', marginBottom: 48, position: 'relative' }}>
          <div style={{ 
            display: 'flex', 
            gap: 12, 
            background: cardBg, 
            padding: '6px',
            borderRadius: 60, 
            border: `1px solid ${border}`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', paddingLeft: 20, gap: 8 }}>
              <Search size={20} color={primary} />
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
                  <History size={16} color={showHistory ? primary : textLight} />
                </button>
              )}
            </div>
            <input
              className="customer-history-input"
              type="text"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              placeholder="Masukkan Customer ID (contoh: 00007d2de826758b65a93dd24ce629ed66842531df6699338c5570910a014cc2)"
              style={{ 
                flex: 1, 
                padding: '16px 0', 
                border: 'none', 
                fontSize: 14, 
                outline: 'none', 
                background: 'transparent', 
                color: text,
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
                background: `linear-gradient(135deg, ${primary}, #5b4bd6)`, 
                color: 'white', 
                border: 'none', 
                padding: '14px 32px', 
                borderRadius: 60, 
                fontWeight: 700, 
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: 14,
                opacity: loading ? 0.7 : 1
              }}>
              {loading ? 'Memuat...' : 'Cari'}
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
                  onMouseEnter={(e) => e.currentTarget.style.background = `${primary}10`}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <History size={14} color={primary} />
                  <span style={{ fontSize: 12, fontFamily: 'monospace', color: text }}>{id.substring(0, 40)}...</span>
                  <Clock size={12} color={textLight} style={{ marginLeft: 'auto' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ========== PREVIEW SECTION ========== */}
        {!searched && showPreview && (
          <div style={{ marginTop: 32 }}>
            {/* Contoh Customer ID */}
            <div style={{ 
              background: `linear-gradient(135deg, ${primary}05, ${primary}02)`,
              borderRadius: 24, 
              padding: '24px',
              marginBottom: 28,
              border: `1px solid ${border}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <Sparkles size={20} color={primary} />
                <span style={{ fontSize: 15, fontWeight: 700, color: text }}>Coba dengan Contoh Customer ID</span>
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                {EXAMPLE_CUSTOMERS.map((customer) => (
                  <button
                    key={customer.id}
                    onClick={() => loadExampleCustomer(customer.id, customer.label)}
                    style={{
                      padding: '10px 24px',
                      background: cardBg,
                      border: `1px solid ${border}`,
                      borderRadius: 40,
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 600,
                      color: text,
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = primary
                      e.currentTarget.style.color = 'white'
                      e.currentTarget.style.borderColor = primary
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = cardBg
                      e.currentTarget.style.color = text
                      e.currentTarget.style.borderColor = border
                    }}
                  >
                    {customer.label}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: 12, color: textLight, textAlign: 'center', marginTop: 16 }}>
                Klik salah satu contoh di atas untuk melihat riwayat pembelian
              </p>
            </div>

            {/* Preview 5 Riwayat Pembelian */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <ShoppingBag size={18} color={primary} />
                <h3 style={{ fontSize: 16, fontWeight: 700, color: text, margin: 0 }}>
                  5 Contoh Riwayat Pembelian
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {PREVIEW_HISTORY.map((item, idx) => (
                  <div 
                    key={idx}
                    style={{ 
                      background: cardBg, 
                      borderRadius: 16, 
                      padding: '16px 20px', 
                      border: `1px solid ${border}`,
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 12,
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = primary
                      e.currentTarget.style.transform = 'translateY(-2px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = border
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1 }}>
                      <div style={{ 
                        width: 40, 
                        height: 40, 
                        borderRadius: 12, 
                        background: `${primary}10`, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                      }}>
                        <Package size={20} color={primary} />
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: text }}>{item.product_name}</div>
                        <div style={{ display: 'flex', gap: 8, fontSize: 11, color: textLight, marginTop: 4 }}>
                          <span>{item.category}</span>
                          <span>•</span>
                          <span>{item.colour}</span>
                          {item.price && (
                            <>
                              <span>•</span>
                              <span style={{ color: '#10b981', fontWeight: 500 }}>{formatCurrency(item.price)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ display: 'flex', gap: 2 }}>
                        {[...Array(item.rating)].map((_, i) => (
                          <Star key={i} size={14} fill="#fbbf24" color="#fbbf24" />
                        ))}
                        {[...Array(5 - item.rating)].map((_, i) => (
                          <Star key={i + item.rating} size={14} fill="#e2e8f0" color="#e2e8f0" />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 12, color: textLight, textAlign: 'center', marginTop: 20 }}>
                💡 Masukkan Customer ID di atas untuk melihat data spesifik
              </p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div style={{ width: 48, height: 48, border: `3px solid ${border}`, borderTop: `3px solid ${primary}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        )}

        {/* Empty State */}
        {searched && !loading && history.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60, background: cardBg, borderRadius: 32, border: `1px solid ${border}` }}>
            <div style={{ width: 80, height: 80, borderRadius: 40, background: `${primary}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <User size={40} color={textLight} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: text, marginBottom: 8 }}>Tidak Ada Riwayat Pembelian</h3>
            <p style={{ fontSize: 15, color: textLight }}>Customer ini belum memiliki riwayat pembelian</p>
            <button
              onClick={() => {
                setShowPreview(true)
                setSearched(false)
                setHistory([])
                setCustomerSummary(null)
              }}
              style={{
                marginTop: 16,
                background: `${primary}10`,
                border: 'none',
                padding: '8px 20px',
                borderRadius: 30,
                color: primary,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500
              }}
            >
              Lihat Contoh Riwayat
            </button>
          </div>
        )}

        {/* Results Section */}
        {!showPreview && history.length > 0 && (
          <>
            {/* Header with Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ background: `${primary}15`, borderRadius: 14, padding: 12 }}>
                  <ShoppingBag size={22} color={primary} />
                </div>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 700, color: text, margin: 0 }}>Riwayat Pembelian</h2>
                  <p style={{ fontSize: 14, color: textLight, marginTop: 4 }}>
                    {filteredHistory.length} dari {history.length} produk
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                {/* Filter Dropdown */}
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      background: `${primary}10`,
                      border: `1px solid ${border}`,
                      borderRadius: 30,
                      padding: '10px 20px',
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 500,
                      color: text
                    }}
                  >
                    <Filter size={16} color={primary} />
                    {selectedCategory === 'all' ? 'All Categories' : selectedCategory}
                    <ChevronDown size={14} />
                  </button>

                  {showFilterDropdown && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: 8,
                      background: cardBg,
                      borderRadius: 16,
                      border: `1px solid ${border}`,
                      boxShadow: `0 8px 24px rgba(0,0,0,0.15)`,
                      minWidth: 180,
                      zIndex: 100,
                      overflow: 'hidden'
                    }}>
                      <div
                        onClick={() => {
                          setSelectedCategory('all')
                          setShowFilterDropdown(false)
                        }}
                        style={{
                          padding: '10px 16px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          background: selectedCategory === 'all' ? `${primary}10` : 'transparent',
                          color: selectedCategory === 'all' ? primary : text
                        }}
                      >
                        <Check size={14} color={selectedCategory === 'all' ? primary : 'transparent'} />
                        All Categories
                      </div>
                      {categories.map(cat => (
                        <div
                          key={cat}
                          onClick={() => {
                            setSelectedCategory(cat)
                            setShowFilterDropdown(false)
                          }}
                          style={{
                            padding: '10px 16px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            background: selectedCategory === cat ? `${primary}10` : 'transparent',
                            color: selectedCategory === cat ? primary : text
                          }}
                        >
                          <Check size={14} color={selectedCategory === cat ? primary : 'transparent'} />
                          {cat}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Export Button */}
                <button
                  onClick={exportToCSV}
                  disabled={exporting}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: `${primary}10`,
                    border: `1px solid ${border}`,
                    borderRadius: 30,
                    padding: '10px 20px',
                    cursor: exporting ? 'not-allowed' : 'pointer',
                    fontSize: 13,
                    fontWeight: 500,
                    color: text,
                    opacity: exporting ? 0.6 : 1
                  }}
                >
                  <Download size={16} color={primary} />
                  {exporting ? 'Exporting...' : 'Export CSV'}
                </button>
              </div>
            </div>

            {/* Customer Summary Cards */}
            {(customerSummary || showPreview) && (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: 16, 
                marginBottom: 32 
              }}>
                <div style={{ background: cardBg, borderRadius: 20, padding: '18px 20px', border: `1px solid ${border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <DollarSign size={20} color={primary} />
                    <span style={{ fontSize: 12, color: textLight }}>Total Spending</span>
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: text }}>
                    {showPreview ? formatCurrency(PREVIEW_SUMMARY.total_spent) : formatCurrency(customerSummary?.total_spent || 0)}
                  </div>
                </div>

                <div style={{ background: cardBg, borderRadius: 20, padding: '18px 20px', border: `1px solid ${border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <ShoppingCart size={20} color={primary} />
                    <span style={{ fontSize: 12, color: textLight }}>Total Items</span>
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: text }}>
                    {showPreview ? PREVIEW_SUMMARY.total_items : customerSummary?.total_items || 0}
                  </div>
                </div>

                <div style={{ background: cardBg, borderRadius: 20, padding: '18px 20px', border: `1px solid ${border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <Star size={20} color={primary} />
                    <span style={{ fontSize: 12, color: textLight }}>Avg Rating</span>
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: text }}>
                    {showPreview ? PREVIEW_SUMMARY.avg_rating.toFixed(1) : (customerSummary?.avg_rating || 0).toFixed(1)} / 5
                  </div>
                </div>

                <div style={{ background: cardBg, borderRadius: 20, padding: '18px 20px', border: `1px solid ${border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <Award size={20} color={primary} />
                    <span style={{ fontSize: 12, color: textLight }}>Favorite</span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: text }}>
                    {showPreview ? PREVIEW_SUMMARY.favorite_category : customerSummary?.favorite_category || '-'}
                  </div>
                  <div style={{ fontSize: 12, color: textLight }}>
                    {showPreview ? PREVIEW_SUMMARY.favorite_colour : customerSummary?.favorite_colour || '-'}
                  </div>
                </div>
              </div>
            )}

            {/* History List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {(showPreview ? PREVIEW_HISTORY : filteredHistory).map((item, idx) => (
                <div 
                  key={idx} 
                  style={{ 
                    background: cardBg, 
                    borderRadius: 20, 
                    padding: '20px 24px', 
                    border: `1px solid ${border}`,
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 16
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, minWidth: 200 }}>
                    <div style={{ 
                      width: 52, 
                      height: 52, 
                      borderRadius: 14, 
                      background: `${primary}10`, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      <Package size={24} color={primary} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: text, marginBottom: 6 }}>
                        {item.product_name}
                      </h3>
                      <div style={{ display: 'flex', gap: 10, fontSize: 13, color: textLight, flexWrap: 'wrap' }}>
                        <span style={{ background: `${primary}10`, padding: '4px 12px', borderRadius: 20 }}>{item.category}</span>
                        <span style={{ background: `${primary}10`, padding: '4px 12px', borderRadius: 20 }}>{item.colour}</span>
                        {item.price && (
                          <span style={{ background: '#10b98115', padding: '4px 12px', borderRadius: 20, color: '#10b981' }}>
                            {formatCurrency(item.price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 6,
                      background: `${primary}10`,
                      padding: '8px 16px',
                      borderRadius: 40
                    }}>
                      <Star size={16} fill="#fbbf24" color="#fbbf24" />
                      <span style={{ fontSize: 16, fontWeight: 700, color: text }}>{item.rating}</span>
                      <span style={{ fontSize: 11, color: textLight }}>/5</span>
                    </div>

                    <button
                      onClick={() => handleReorder(item)}
                      disabled={reordering === item.article_id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        background: `linear-gradient(135deg, ${primary}, #5b4bd6)`,
                        border: 'none',
                        borderRadius: 40,
                        padding: '8px 18px',
                        cursor: reordering === item.article_id ? 'not-allowed' : 'pointer',
                        color: 'white',
                        fontSize: 12,
                        fontWeight: 600,
                        opacity: reordering === item.article_id ? 0.7 : 1,
                        transition: 'all 0.2s'
                      }}
                    >
                      {reordering === item.article_id ? (
                        <RefreshCw size={14} className="spin" />
                      ) : (
                        <RotateCcw size={14} />
                      )}
                      Beli Lagi
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredHistory.length === 0 && selectedCategory !== 'all' && (
              <div style={{ textAlign: 'center', padding: 40, background: cardBg, borderRadius: 24, border: `1px solid ${border}` }}>
                <Filter size={32} color={textLight} style={{ opacity: 0.5, marginBottom: 12 }} />
                <p style={{ color: textLight }}>Tidak ada produk dengan kategori "{selectedCategory}"</p>
                <button
                  onClick={() => setSelectedCategory('all')}
                  style={{
                    marginTop: 12,
                    background: `${primary}10`,
                    border: 'none',
                    padding: '6px 16px',
                    borderRadius: 20,
                    color: primary,
                    cursor: 'pointer',
                    fontSize: 12
                  }}
                >
                  Clear Filter
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .spin {
          animation: spin 0.8s linear infinite;
        }
      `}</style>
    </div>
  )
}