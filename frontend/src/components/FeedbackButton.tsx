// src/components/FeedbackButton.tsx
import { useState } from 'react'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import axios from 'axios'
import { API_BASE_URL } from '../config/api'

interface FeedbackButtonProps {
  articleId: string
  customerId?: string
  onFeedback?: (type: 'like' | 'dislike') => void
}

export function FeedbackButton({ articleId, customerId, onFeedback }: FeedbackButtonProps) {
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null)
  const [loading, setLoading] = useState(false)

  const sendFeedback = async (type: 'like' | 'dislike') => {
    if (feedback === type) return
    
    setLoading(true)
    try {
      await axios.post(`${API_BASE_URL}/feedback`, {
        article_id: articleId,
        customer_id: customerId,
        feedback: type,
        timestamp: new Date().toISOString()
      })
      setFeedback(type)
      onFeedback?.(type)
    } catch (error) {
      console.error('Feedback error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <button
        onClick={() => sendFeedback('like')}
        disabled={loading}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '6px 12px',
          borderRadius: 30,
          border: `1px solid ${feedback === 'like' ? '#10b981' : '#e2e8f0'}`,
          background: feedback === 'like' ? '#10b98115' : 'transparent',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
          fontSize: 12,
          color: feedback === 'like' ? '#10b981' : '#64748b'
        }}
      >
        <ThumbsUp size={14} /> Like
      </button>
      <button
        onClick={() => sendFeedback('dislike')}
        disabled={loading}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '6px 12px',
          borderRadius: 30,
          border: `1px solid ${feedback === 'dislike' ? '#ef4444' : '#e2e8f0'}`,
          background: feedback === 'dislike' ? '#ef444415' : 'transparent',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
          fontSize: 12,
          color: feedback === 'dislike' ? '#ef4444' : '#64748b'
        }}
      >
        <ThumbsDown size={14} /> Dislike
      </button>
    </div>
  )
}