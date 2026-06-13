// src/components/Toast.tsx
import { useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info'

interface ToastProps {
  message: string
  type: ToastType
  isVisible: boolean
  onClose: () => void
  duration?: number
}

export function Toast({ message, type, isVisible, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  if (!isVisible) return null

  const colors = {
    success: { bg: '#10b981', icon: CheckCircle },
    error: { bg: '#ef4444', icon: AlertCircle },
    info: { bg: '#3b82f6', icon: Info }
  }

  const Icon = colors[type].icon

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      zIndex: 9999,
      animation: 'slideUp 0.3s ease'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: colors[type].bg,
        color: 'white',
        padding: '14px 20px',
        borderRadius: 16,
        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        minWidth: 280,
        maxWidth: 400
      }}>
        <Icon size={20} />
        <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{message}</span>
        <button onClick={onClose} style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'white',
          opacity: 0.7,
          padding: 4
        }}>
          <X size={16} />
        </button>
      </div>
      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}