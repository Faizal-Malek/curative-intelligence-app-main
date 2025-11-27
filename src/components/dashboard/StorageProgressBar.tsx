// File Path: src/components/dashboard/StorageProgressBar.tsx
'use client';

import { AlertCircle, HardDrive, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useStorageQuota } from '@/hooks/useStorageQuota';
import { formatBytes, isUnlimitedStorage } from '@/lib/storage-utils';

interface StorageProgressBarProps {
  variant?: 'default' | 'compact';
  showUpgradeLink?: boolean;
}

export function StorageProgressBar({ variant = 'default', showUpgradeLink = true }: StorageProgressBarProps) {
  const { storage, loading } = useStorageQuota();

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
  const isNearLimit = storage.percentage >= 85 && !unlimited;
  const isFull = storage.percentage >= 100 && !unlimited;

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3">
        <HardDrive className="h-4 w-4 text-[#8B6F47]" />
        {unlimited ? (
          <span className="text-xs font-semibold text-green-600">Unlimited Storage</span>
        ) : (
          <>
            <div className="flex-1 max-w-[200px]">
              <div className="w-full h-1.5 bg-[#E9DCC9] rounded-full overflow-hidden">
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
            </div>
            <span className="text-xs text-[#6B5E5E] whitespace-nowrap">
              {formatBytes(storage.used)} / {formatBytes(storage.limit)}
            </span>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#EADCCE] bg-white/75 p-5 backdrop-blur shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <HardDrive className="h-5 w-5 text-[#8B6F47]" />
          <span className="text-sm font-semibold text-[#2F2626]">Storage Usage</span>
        </div>
        {unlimited ? (
          <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Unlimited
          </span>
        ) : (
          <span className="text-xs font-medium text-[#6B5E5E]">
            {formatBytes(storage.used)} / {formatBytes(storage.limit)}
          </span>
        )}
      </div>

      {!unlimited && (
        <>
          <div className="w-full h-3 bg-[#E9DCC9] rounded-full overflow-hidden mb-3 shadow-inner">
            <div
              className={`h-full transition-all duration-500 ${
                isFull
                  ? 'bg-gradient-to-r from-red-500 to-red-600'
                  : isNearLimit
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600'
                  : 'bg-gradient-to-r from-[#D2B193] to-[#B89B7B]'
              }`}
              style={{ width: `${Math.min(storage.percentage, 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs mb-3">
            <span className={`font-medium ${
              isFull ? 'text-red-600' : isNearLimit ? 'text-orange-600' : 'text-[#6B5E5E]'
            }`}>
              {storage.percentage.toFixed(1)}% used
            </span>
            <span className="text-[#6B5E5E]">
              {formatBytes(storage.available)} available
            </span>
          </div>

          {(isNearLimit || isFull) && showUpgradeLink && (
            <div className="mt-4 flex items-start gap-2 p-3 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200">
              <AlertCircle className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-medium text-orange-900 mb-1">
                  {isFull
                    ? 'Storage limit reached!'
                    : 'Storage almost full'}
                </p>
                <p className="text-xs text-orange-800 mb-2">
                  {isFull
                    ? 'Upgrade your plan to upload more files and continue creating.'
                    : 'Consider upgrading your plan for more storage space.'}
                </p>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-orange-700 hover:text-orange-800 underline transition-colors"
                >
                  View Plans
                  <TrendingUp className="h-3 w-3" />
                </Link>
              </div>
            </div>
          )}
        </>
      )}

      {unlimited && (
        <p className="text-xs text-[#6B5E5E]">
          Upload unlimited files with your Enterprise plan.
        </p>
      )}
    </div>
  );
}
