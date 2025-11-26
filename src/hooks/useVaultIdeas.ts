import { useCallback, useEffect, useMemo, useState } from 'react'

export type VaultIdeaStatus = 'DRAFT' | 'READY' | 'SCHEDULED' | 'ARCHIVED'

export interface VaultIdea {
  id: string
  title: string
  content: string
  tags: string[]
  status: VaultIdeaStatus
  createdAt: string
  updatedAt: string
  metadata?: Record<string, unknown> | null
}

interface UseVaultIdeasOptions {
  enabled?: boolean
}

interface CreateIdeaPayload {
  title: string
  content: string
  tags?: string[]
  status?: VaultIdeaStatus
  metadata?: Record<string, unknown>
}

export function useVaultIdeas(options: UseVaultIdeasOptions = {}) {
  const { enabled = true } = options
  const [ideas, setIdeas] = useState<VaultIdea[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchIdeas = useCallback(async () => {
    if (!enabled) return
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/vault/ideas', { cache: 'no-store' })
      if (!response.ok) {
        throw new Error('Failed to load ideas')
      }
      const data = await response.json()
      setIdeas(data.ideas || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load vault ideas')
    } finally {
      setLoading(false)
    }
  }, [enabled])

  useEffect(() => {
    fetchIdeas()
  }, [fetchIdeas])

  const createIdea = useCallback(
    async (payload: CreateIdeaPayload) => {
      const response = await fetch('/api/vault/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        throw new Error('Failed to save idea')
      }
      await fetchIdeas()
    },
    [fetchIdeas]
  )

  const deleteIdea = useCallback(
    async (id: string) => {
      const response = await fetch(`/api/vault/ideas/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        throw new Error('Unable to delete idea')
      }
      setIdeas((prev) => prev.filter((idea) => idea.id !== id))
    },
    []
  )

  const ideaCount = useMemo(() => ideas.length, [ideas])

  return {
    ideas,
    loading,
    error,
    count: ideaCount,
    refresh: fetchIdeas,
    createIdea,
    deleteIdea,
  }
}
