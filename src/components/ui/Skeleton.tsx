'use client'

import React from 'react'
import { cn } from '@/lib/utils'

type Props = React.HTMLAttributes<HTMLDivElement>

export function Skeleton({ className, ...props }: Props) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-2xl bg-gradient-to-r from-[#F5EFE6]/60 via-[#E9DCC9]/60 to-[#F5EFE6]/60',
        className
      )}
      style={{
        backgroundSize: '200% 100%',
        animation: 'shimmer 2s infinite linear',
      }}
      {...props}
    />
  )
}

// Card skeleton for dashboard stats
export function SkeletonCard({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={cn(
        'animate-fade-in rounded-3xl border border-[#E9DCC9]/30 bg-white/90 p-6 shadow-[0_20px_55px_rgba(58,47,47,0.12)]',
        className
      )}
      style={style}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-11 w-11 rounded-full" />
      </div>
    </div>
  )
}

// Profile skeleton
export function SkeletonProfile({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-fade-in rounded-3xl border border-transparent bg-gradient-to-br from-white to-[#FBFAF8] p-6 shadow-[0_24px_60px_rgba(58,47,47,0.14)]',
        className
      )}
    >
      <div className="flex flex-col sm:flex-row items-start gap-6">
        <Skeleton className="h-20 w-20 rounded-2xl flex-shrink-0" />
        <div className="flex-1 space-y-4 w-full">
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-full max-w-md" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
          </div>
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
    </div>
  )
}

// Hero card skeleton
export function SkeletonHero({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-fade-in rounded-3xl border border-transparent bg-gradient-to-br from-[#FCF2E4] via-[#F7E7D3] to-[#F1DBC0] p-8 shadow-[0_32px_90px_rgba(58,47,47,0.18)]',
        className
      )}
    >
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-4 flex-1">
            <Skeleton className="h-6 w-40 rounded-full" />
            <Skeleton className="h-10 w-full max-w-md" />
            <Skeleton className="h-4 w-full max-w-xl" />
            <Skeleton className="h-4 w-full max-w-lg" />
          </div>
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Skeleton className="h-12 w-full sm:w-64 rounded-xl" />
          <Skeleton className="h-12 w-full sm:w-48 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

// Vault idea card skeleton
export function SkeletonVaultCard({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={cn(
        'animate-fade-in rounded-3xl border border-[#E9DCC9] bg-gradient-to-br from-white to-[#FBFAF8] p-6 shadow-[0_20px_55px_rgba(58,47,47,0.12)]',
        className
      )}
      style={style}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-2/3 mb-3" />
        <div className="flex items-center justify-between pt-3 border-t border-[#E9DCC9] mt-auto">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  )
}

export default Skeleton

