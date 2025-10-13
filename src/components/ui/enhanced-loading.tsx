/**
 * Enhanced loading and skeleton components for better UX
 */

'use client';

import React, { Suspense } from 'react';
import { cn } from '@/lib/utils';

// Enhanced Skeleton component with animation variations
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'circular' | 'rectangular' | 'text';
  animation?: 'pulse' | 'wave' | 'none';
  lines?: number; // For text variant
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className,
  variant = 'default',
  animation = 'pulse',
  lines = 1,
  width,
  height,
  style,
  ...props
}: SkeletonProps) {
  const baseClasses = 'bg-gradient-to-r from-[#F5F2E8]/60 via-[#EFE8D8]/80 to-[#F5F2E8]/60';
  
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  };
  
  const variantClasses = {
    default: 'rounded-md',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    text: 'rounded-sm h-4',
  };
  
  const combinedStyle = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1rem' : '1.5rem'),
    ...style,
  };
  
  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(
              baseClasses,
              animationClasses[animation],
              variantClasses[variant],
              index === lines - 1 && 'w-3/4', // Last line shorter
              className
            )}
            style={{
              ...combinedStyle,
              animationDelay: `${index * 0.1}s`,
            }}
            {...props}
          />
        ))}
      </div>
    );
  }
  
  return (
    <div
      className={cn(
        baseClasses,
        animationClasses[animation],
        variantClasses[variant],
        className
      )}
      style={combinedStyle}
      {...props}
    />
  );
}

// Card skeleton for dashboard items
export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-[#EFE8D8] bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton variant="circular" className="h-8 w-8" />
      </div>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}

// Analytics card skeleton
export function AnalyticsCardSkeleton() {
  return (
    <div className="rounded-xl border border-[#EFE8D8] bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-5 w-24" />
        <Skeleton variant="circular" className="h-6 w-6" />
      </div>
      <Skeleton className="h-8 w-20 mb-2" />
      <Skeleton className="h-3 w-16" />
      <div className="mt-4">
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
}

// Table skeleton
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex space-x-4 border-b border-[#EFE8D8] pb-3">
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton 
              key={colIndex} 
              className="h-4 flex-1" 
              style={{ animationDelay: `${(rowIndex * columns + colIndex) * 0.05}s` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// List item skeleton
export function ListItemSkeleton() {
  return (
    <div className="flex items-center space-x-3 p-3 border-b border-[#EFE8D8]">
      <Skeleton variant="circular" className="h-10 w-10" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-8 w-20" />
    </div>
  );
}

// Calendar day skeleton
export function CalendarDaySkeleton() {
  return (
    <div className="min-h-32 rounded-lg border border-[#EFE8D8] p-3">
      <Skeleton className="h-4 w-6 mb-2" />
      <div className="space-y-1">
        {Math.random() > 0.5 && <Skeleton className="h-6 w-full rounded" />}
        {Math.random() > 0.7 && <Skeleton className="h-6 w-full rounded" />}
      </div>
    </div>
  );
}

// Enhanced spinner component
export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'brand' | 'dots' | 'bars';
  className?: string;
}

export function Spinner({ size = 'md', variant = 'default', className }: SpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };
  
  if (variant === 'dots') {
    return (
      <div className={cn('flex space-x-1', className)}>
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className={cn(
              'rounded-full bg-[#D2B193] animate-bounce',
              size === 'sm' ? 'h-2 w-2' : 'h-3 w-3'
            )}
            style={{ animationDelay: `${index * 0.15}s` }}
          />
        ))}
      </div>
    );
  }
  
  if (variant === 'bars') {
    return (
      <div className={cn('flex space-x-1', className)}>
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className={cn(
              'bg-[#D2B193] animate-pulse',
              size === 'sm' ? 'h-4 w-1' : 'h-6 w-1'
            )}
            style={{ 
              animationDelay: `${index * 0.15}s`,
              animationDuration: '0.6s'
            }}
          />
        ))}
      </div>
    );
  }
  
  const variantClasses = {
    default: 'border-gray-300 border-t-[#D2B193]',
    brand: 'border-[#D2B193]/20 border-t-[#D2B193]',
  };
  
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    />
  );
}

// Loading state wrapper
export interface LoadingStateProps {
  loading: boolean;
  children: React.ReactNode;
  skeleton?: React.ReactNode;
  fallback?: React.ReactNode;
  error?: string | null;
  retry?: () => void;
}

export function LoadingState({
  loading,
  children,
  skeleton,
  fallback,
  error,
  retry,
}: LoadingStateProps) {
  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{error}</div>
        {retry && (
          <button
            onClick={retry}
            className="px-4 py-2 bg-[#D2B193] text-white rounded-md hover:bg-[#C5A885] transition-colors"
          >
            Retry
          </button>
        )}
      </div>
    );
  }
  
  if (loading) {
    return skeleton || fallback || <Spinner />;
  }
  
  return <>{children}</>;
}

// Lazy loading wrapper with intersection observer
export function LazyLoad({
  children,
  placeholder,
  threshold = 0.1,
  rootMargin = '50px',
}: {
  children: React.ReactNode;
  placeholder?: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
}) {
  const [isInView, setIsInView] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => observer.disconnect();
  }, [threshold, rootMargin]);
  
  return (
    <div ref={ref}>
      {isInView ? (
        <Suspense fallback={placeholder || <Skeleton className="h-48 w-full" />}>
          {children}
        </Suspense>
      ) : (
        placeholder || <Skeleton className="h-48 w-full" />
      )}
    </div>
  );
}

// Progress indicator
export interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  variant?: 'default' | 'brand';
}

export function Progress({
  value,
  max = 100,
  className,
  showLabel = false,
  variant = 'default',
}: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const variantClasses = {
    default: 'bg-gray-200',
    brand: 'bg-[#EFE8D8]',
  };
  
  const barClasses = {
    default: 'bg-blue-600',
    brand: 'bg-[#D2B193]',
  };
  
  return (
    <div className={cn('w-full', className)}>
      <div className={cn('h-2 rounded-full overflow-hidden', variantClasses[variant])}>
        <div
          className={cn('h-full transition-all duration-300 ease-out', barClasses[variant])}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="text-sm text-gray-600 mt-1">
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  );
}

// Add shimmer animation to global styles
export const shimmerStyles = `
@keyframes shimmer {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

.animate-shimmer {
  background: linear-gradient(
    90deg,
    rgba(245, 242, 232, 0.6) 0px,
    rgba(239, 232, 216, 0.8) 40px,
    rgba(245, 242, 232, 0.6) 80px
  );
  background-size: 400px;
  animation: shimmer 1.2s ease-in-out infinite;
}
`;

// Utility hook for loading states
export function useLoadingState() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  
  const withLoading = React.useCallback(async <T,>(
    promise: Promise<T>
  ): Promise<T | undefined> => {
    try {
      setLoading(true);
      setError(null);
      const result = await promise;
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      return undefined;
    } finally {
      setLoading(false);
    }
  }, []);
  
  return { loading, error, setError, withLoading };
}