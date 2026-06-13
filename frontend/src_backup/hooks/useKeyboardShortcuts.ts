// src/hooks/useKeyboardShortcuts.ts
import { useEffect } from 'react'

export function useKeyboardShortcuts({
  onSearch,
  onEscape,
  onEnter,
  enabled = true
}: {
  onSearch?: () => void
  onEscape?: () => void
  onEnter?: () => void
  enabled?: boolean
}) {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K untuk search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        onSearch?.()
      }
      // Escape untuk close modal/dropdown
      if (e.key === 'Escape') {
        onEscape?.()
      }
      // Enter untuk submit
      if (e.key === 'Enter') {
        onEnter?.()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onSearch, onEscape, onEnter, enabled])
}