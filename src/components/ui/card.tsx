// src/components/ui/Card.tsx
import * as React from "react"
import { cn } from "@/lib/utils"
import { Spinner } from "./enhanced-loading"

// --- Enhanced Card Component for Production ---
// Main Card component with extended functionality for production use
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  isInteractive?: boolean
  selected?: boolean
  variant?: 'solid' | 'glass' | 'bordered' | 'elevated' | 'gradient'
  loading?: boolean
  error?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ 
    className, 
    isInteractive = false, 
    selected = false, 
    variant = 'solid',
    loading = false,
    error,
    padding = 'md',
    children,
    ...props 
  }, ref) => {
    const baseClasses = 'rounded-xl text-[#3A2F2F] transition-all duration-200 ease-out';
    
    const variantClasses = {
      solid: 'bg-white shadow-[0_4px_12px_rgba(58,47,47,0.08)]',
      glass: 'glass bg-white/10 border-white/20 shadow-[0_6px_30px_rgba(58,47,47,0.10)]',
      bordered: 'bg-white border-2 border-gray-200 dark:bg-gray-800 dark:border-gray-700',
      elevated: 'bg-white shadow-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700',
      gradient: 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900',
    };

    const paddingClasses = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    const interactiveClasses = isInteractive 
      ? 'hover:shadow-[0_8px_24px_rgba(58,47,47,0.12)] active:scale-[.99] active:shadow-[0_2px_6px_rgba(58,47,47,0.10)] cursor-pointer' 
      : '';

    const selectedClasses = selected 
      ? 'border-2 border-brand-tan' 
      : 'border border-[#EFE8D8]';

    const errorClasses = error 
      ? 'border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20' 
      : '';

    if (loading) {
      return (
        <div
          ref={ref}
          className={cn(
            baseClasses,
            variantClasses[variant],
            paddingClasses[padding],
            selectedClasses,
            className
          )}
          {...props}
        >
          <div className="flex items-center justify-center py-8">
            <Spinner size="md" />
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div
          ref={ref}
          className={cn(
            baseClasses,
            errorClasses,
            paddingClasses[padding],
            className
          )}
          {...props}
        >
          <div className="text-center py-4">
            <div className="text-red-600 dark:text-red-400 mb-2">⚠️</div>
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          paddingClasses[padding],
          interactiveClasses,
          selectedClasses,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card"

// --- Simple Explanation ---
// The helper components below are purely structural:
// to provide consistent padding and typography inside any card.

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "font-semibold leading-none tracking-tight text-xl",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

// Enhanced CardFooter
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn("p-6 pt-0 border-t border-gray-200 dark:border-gray-700", className)} 
    {...props} 
  />
))
CardFooter.displayName = "CardFooter"

// Stat card for displaying metrics
export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  loading?: boolean;
  className?: string;
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ title, value, subtitle, trend, icon, loading = false, className }, ref) => {
    if (loading) {
      return (
        <Card ref={ref} className={className} variant="elevated">
          <div className="animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              {icon && <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded"></div>}
            </div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </Card>
      );
    }

    return (
      <Card ref={ref} className={className} variant="elevated" padding="md">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </span>
          {icon && (
            <div className="text-gray-400 dark:text-gray-500">
              {icon}
            </div>
          )}
        </div>
        
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </span>
          
          {trend && (
            <div className={cn(
              'flex items-center text-sm font-medium',
              trend.isPositive 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            )}>
              <span className="mr-1">
                {trend.isPositive ? '↗' : '↘'}
              </span>
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>
        
        {subtitle && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {subtitle}
          </p>
        )}
      </Card>
    );
  }
);
StatCard.displayName = "StatCard";

// Action card for CTA sections
export interface ActionCardProps {
  title: string;
  description: string;
  action: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
    loading?: boolean;
  };
  icon?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

const ActionCard = React.forwardRef<HTMLDivElement, ActionCardProps>(
  ({ title, description, action, icon, className, children }, ref) => {
    return (
      <Card ref={ref} className={className} variant="bordered" isInteractive padding="lg">
        <div className="text-center">
          {icon && (
            <div className="mx-auto mb-4 text-gray-400 dark:text-gray-500">
              {icon}
            </div>
          )}
          
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {title}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {description}
          </p>
          
          {children}
          
          <button
            onClick={action.onClick}
            disabled={action.loading}
            className={cn(
              'inline-flex items-center px-4 py-2 rounded-xl font-medium transition-all duration-200',
              action.variant === 'secondary'
                ? 'bg-[#E9DCC9]/50 text-[#2F2626] hover:bg-[#D2B193]/20 border border-[#EADCCE]'
                : 'bg-gradient-to-r from-[#D2B193] to-[#C4A68A] text-[#2F2626] hover:shadow-lg',
              action.loading && 'opacity-75 cursor-not-allowed'
            )}
          >
            {action.loading && <Spinner size="sm" className="mr-2" />}
            {action.label}
          </button>
        </div>
      </Card>
    );
  }
);
ActionCard.displayName = "ActionCard";

// Empty state card
export interface EmptyStateCardProps {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

const EmptyStateCard = React.forwardRef<HTMLDivElement, EmptyStateCardProps>(
  ({ title, description, action, icon, className, children }, ref) => {
    return (
      <Card ref={ref} className={className} padding="lg">
        <div className="text-center">
          {icon && (
            <div className="mx-auto mb-4 text-gray-300 dark:text-gray-600">
              {icon}
            </div>
          )}
          
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {title}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {description}
          </p>
          
          {children}
          
          {action && (
            <button
              onClick={action.onClick}
              className="inline-flex items-center px-4 py-2 rounded-xl bg-gradient-to-r from-[#D2B193] to-[#C4A68A] text-[#2F2626] font-semibold hover:shadow-xl transition-all duration-200"
            >
              {action.label}
            </button>
          )}
        </div>
      </Card>
    );
  }
);
EmptyStateCard.displayName = "EmptyStateCard";

export { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter,
  StatCard,
  ActionCard,
  EmptyStateCard
}
