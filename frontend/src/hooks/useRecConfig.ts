// frontend/src/hooks/useRecConfig.ts
import { useState, useEffect, useCallback } from 'react'

export interface RecConfig {
  w_cf: number
  w_cbf: number
  top_n: number
}

const STORAGE_KEY = 'fashionrec_config'

export const DEFAULT_REC_CONFIG: RecConfig = {
  w_cf: 0.6,
  w_cbf: 0.4,
  top_n: 12,
}

function readConfig(): RecConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_REC_CONFIG
    const parsed = JSON.parse(raw)
    return {
      w_cf: typeof parsed.w_cf === 'number' ? parsed.w_cf : DEFAULT_REC_CONFIG.w_cf,
      w_cbf: typeof parsed.w_cbf === 'number' ? parsed.w_cbf : DEFAULT_REC_CONFIG.w_cbf,
      top_n: typeof parsed.top_n === 'number' ? parsed.top_n : DEFAULT_REC_CONFIG.top_n,
    }
  } catch {
    return DEFAULT_REC_CONFIG
  }
}

function writeConfig(cfg: RecConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg))
  // notify other components/tabs listening via the custom event below
  window.dispatchEvent(new CustomEvent('fashionrec-config-changed', { detail: cfg }))
}

/**
 * Hook to read & write the shared recommendation config
 * (w_cf, w_cbf, top_n) persisted in localStorage.
 *
 * - Call `setConfig(partialOrFull)` to update + persist.
 * - Automatically syncs across components within the same tab
 *   (via CustomEvent) and across tabs (via the `storage` event).
 */
export function useRecConfig() {
  const [config, setConfigState] = useState<RecConfig>(() => readConfig())

  useEffect(() => {
    const handleCustom = (e: Event) => {
      const detail = (e as CustomEvent<RecConfig>).detail
      if (detail) setConfigState(detail)
    }
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setConfigState(readConfig())
    }
    window.addEventListener('fashionrec-config-changed', handleCustom)
    window.addEventListener('storage', handleStorage)
    return () => {
      window.removeEventListener('fashionrec-config-changed', handleCustom)
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  const setConfig = useCallback((next: Partial<RecConfig> | ((prev: RecConfig) => RecConfig)) => {
    setConfigState(prev => {
      const merged = typeof next === 'function' ? next(prev) : { ...prev, ...next }
      writeConfig(merged)
      return merged
    })
  }, [])

  const resetConfig = useCallback(() => {
    setConfigState(DEFAULT_REC_CONFIG)
    writeConfig(DEFAULT_REC_CONFIG)
  }, [])

  return { config, setConfig, resetConfig }
}