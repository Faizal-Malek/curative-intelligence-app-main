// File Path: src/hooks/useStorageQuota.ts
'use client';

import { useEffect, useState, useCallback } from 'react';

export interface StorageQuota {
  used: number;
  limit: number;
  percentage: number;
  available: number;
  plan: string;
}

export function useStorageQuota() {
  const [storage, setStorage] = useState<StorageQuota | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStorage = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/storage/quota');
      if (!response.ok) {
        throw new Error('Failed to fetch storage quota');
      }
      const data = await response.json();
      setStorage(data.storage);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStorage();
  }, [fetchStorage]);

  return {
    storage,
    loading,
    error,
    refetch: fetchStorage,
  };
}
