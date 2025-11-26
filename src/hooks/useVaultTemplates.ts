import { useCallback, useEffect, useState } from 'react'

export interface VaultTemplate {
  id: string
  title: string
  description?: string
  category: string
  structure?: Record<string, unknown>
}

export function useVaultTemplates(enabled = true) {
  const [templates, setTemplates] = useState<VaultTemplate[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTemplates = useCallback(async () => {
    if (!enabled) return
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/vault/templates', { cache: 'no-store' })
      if (!response.ok) {
        throw new Error('Failed to load templates')
      }
      const data = await response.json()
      setTemplates(data.templates || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load templates')
    } finally {
      setLoading(false)
    }
  }, [enabled])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  return {
    templates,
    loading,
    error,
    refresh: fetchTemplates,
  }
}
