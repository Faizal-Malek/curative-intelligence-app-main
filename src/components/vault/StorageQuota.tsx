// File Path: src/components/vault/StorageQuota.tsx
'use client';

import { useEffect, useState } from 'react';
import { HardDrive, AlertCircle } from 'lucide-react';
import { formatBytes, isUnlimitedStorage } from '@/lib/storage-utils';
import Link from 'next/link';

interface StorageData {
  used: number;
  limit: number;
  percentage: number;
  available: number;
  plan: string;
}

export function StorageQuota() {
  const [storage, setStorage] = useState<StorageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStorage();
  }, []);

  const fetchStorage = async () => {
    try {
      const response = await fetch('/api/storage/quota');
      if (response.ok) {
        const data = await response.json();
        setStorage(data.storage);
      }
    } catch (error) {
      console.error('Failed to fetch storage:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-[#EADCCE] bg-white/75 p-4 backdrop-blur animate-pulse">
        <div className="h-4 bg-[#E9DCC9] rounded w-1/2 mb-2"></div>
        <div className="h-2 bg-[#E9DCC9] rounded w-full"></div>
      </div>
    );
  }

  if (!storage) return null;

  const unlimited = isUnlimitedStorage(storage.plan);
  const isNearLimit = storage.percentage >= 80 && !unlimited;
  const isFull = storage.percentage >= 100 && !unlimited;

  return (
    <div className="rounded-2xl border border-[#EADCCE] bg-white/75 p-4 backdrop-blur">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <HardDrive className="h-4 w-4 text-[#8B6F47]" />
          <span className="text-sm font-medium text-[#2F2626]">Storage</span>
        </div>
        {unlimited ? (
          <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
            Unlimited
          </span>
        ) : (
          <span className="text-xs text-[#6B5E5E]">
            {formatBytes(storage.used)} / {formatBytes(storage.limit)}
          </span>
        )}
      </div>

      {!unlimited && (
        <>
          <div className="w-full h-2 bg-[#E9DCC9] rounded-full overflow-hidden mb-2">
            <div
              className={`h-full transition-all duration-500 ${
                isFull
                  ? 'bg-red-500'
                  : isNearLimit
                  ? 'bg-orange-500'
                  : 'bg-gradient-to-r from-[#D2B193] to-[#B89B7B]'
              }`}
              style={{ width: `${Math.min(storage.percentage, 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-[#6B5E5E]">
              {storage.percentage.toFixed(1)}% used
            </span>
            <span className="text-xs text-[#6B5E5E]">
              {formatBytes(storage.available)} free
            </span>
          </div>

          {(isNearLimit || isFull) && (
            <div className="mt-3 flex items-start gap-2 p-3 rounded-lg bg-orange-50 border border-orange-200">
              <AlertCircle className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-orange-800">
                  {isFull
                    ? 'Storage limit reached. Upgrade your plan to upload more files.'
                    : 'Storage almost full. Consider upgrading your plan.'}
                </p>
                <Link
                  href="/pricing"
                  className="text-xs font-medium text-orange-600 hover:text-orange-700 underline mt-1 inline-block"
                >
                  View Plans
                </Link>
              </div>
            </div>
          )}
        </>
      )}

      {unlimited && (
        <p className="text-xs text-[#6B5E5E] mt-1">
          Upload as many files as you need with Enterprise.
        </p>
      )}
    </div>
  );
}
