export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const API_ENDPOINTS = {
  OVERVIEW: `${API_BASE_URL}/analytics/overview`,
  MONTHLY_TRANSACTIONS: `${API_BASE_URL}/analytics/monthly-transactions`,
  TOP_CATEGORIES: `${API_BASE_URL}/analytics/top-categories`,
  TOP_COLOURS: `${API_BASE_URL}/analytics/top-colours`,
  TOP_PRODUCTS: `${API_BASE_URL}/analytics/top-products`,
  MODEL_METRICS: `${API_BASE_URL}/analytics/model-metrics`,
  CUSTOMER_INFO: (id: string) => `${API_BASE_URL}/customer/${id}/info`,
  CUSTOMER_HISTORY: (id: string) => `${API_BASE_URL}/customer/${id}/history`,
  SEARCH_PRODUCTS: (q: string, limit: number = 20) => `${API_BASE_URL}/products/search?q=${q}&limit=${limit}`,
  RECOMMEND: `${API_BASE_URL}/recommend`,
  FEEDBACK: `${API_BASE_URL}/feedback`,
}
