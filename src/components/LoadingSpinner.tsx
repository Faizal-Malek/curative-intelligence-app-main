import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
}

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <Loader2 className={cn('animate-spin text-slate-600', sizeClasses[size])} />
      {text && <p className="text-sm text-slate-600">{text}</p>}
    </div>
  );
}

export function FullPageLoader({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <LoadingSpinner size="xl" text={text} />
    </div>
  );
}

export function CardLoader({ text }: { text?: string }) {
  return (
    <div className="flex items-center justify-center p-12 bg-white rounded-lg border border-slate-200">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
}

export function InlineLoader({ text }: { text?: string }) {
  return (
    <div className="flex items-center gap-2">
      <Loader2 className="h-4 w-4 animate-spin text-slate-600" />
      {text && <span className="text-sm text-slate-600">{text}</span>}
    </div>
  );
}
