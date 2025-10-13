/**
 * Dynamic component loader with code splitting and performance optimization
 */

'use client';

import React, { ComponentType, Suspense, lazy } from 'react';
import { Skeleton } from '@/components/ui/enhanced-loading';

// Dynamic import with error handling
export function createDynamicComponent<T extends Record<string, any>>(
  importFunc: () => Promise<{ default: ComponentType<T> }>,
  fallback?: React.ComponentType<any>
) {
  const LazyComponent = lazy(importFunc);
  
  return React.forwardRef<any, T>((props, ref) => {
    const FallbackComponent = fallback || (() => <Skeleton height="200px" />);
    
    return (
      <Suspense fallback={<FallbackComponent />}>
        <LazyComponent {...props} ref={ref} />
      </Suspense>
    );
  });
}

// Example: How to create dynamic components (replace with actual component paths)
// export const DynamicCalendar = createDynamicComponent(
//   () => import('@/components/calendar/CalendarView'),
//   () => <Skeleton height="400px" className="rounded-lg" />
// );

// Dynamic route component loader
export function createDynamicRoute<T extends Record<string, any>>(
  importFunc: () => Promise<{ default: ComponentType<T> }>,
  loadingComponent?: React.ComponentType<any>
) {
  const LazyRoute = lazy(importFunc);
  
  return React.forwardRef<any, T>((props, ref) => {
    const LoadingComponent = loadingComponent || (() => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Skeleton height="40px" width="200px" className="mb-4" />
          <Skeleton height="20px" width="300px" className="mb-8" />
          <div className="space-y-4">
            <Skeleton height="100px" />
            <Skeleton height="100px" />
            <Skeleton height="100px" />
          </div>
        </div>
      </div>
    ));
    
    return (
      <Suspense fallback={<LoadingComponent />}>
        <LazyRoute {...props} ref={ref} />
      </Suspense>
    );
  });
}

// Intersection Observer hook for performance optimization
export function useIntersectionObserver(
  elementRef: React.RefObject<HTMLElement | null>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = React.useState(false);

  React.useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, {
      threshold: 0.1,
      rootMargin: '50px',
      ...options,
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, [elementRef, options]);

  return isIntersecting;
}

// Performance monitoring hook
export function usePerformanceMonitor(componentName: string) {
  React.useEffect(() => {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Log performance metrics (can be sent to analytics)
      if (renderTime > 16.67) { // > 1 frame at 60fps
        console.warn(`Performance: ${componentName} took ${renderTime.toFixed(2)}ms to render`);
      }

      // Optional: Send to analytics service
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'component_render_time', {
          component_name: componentName,
          render_time: Math.round(renderTime),
          custom_map: { metric1: 'render_time' }
        });
      }
    };
  }, [componentName]);
}

// Lazy loading wrapper with intersection observer
export interface LazyLoadProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

export function LazyLoad({ 
  children, 
  fallback = <Skeleton height="200px" />, 
  threshold = 0.1, 
  rootMargin = '50px',
  once = true 
}: LazyLoadProps) {
  const [hasLoaded, setHasLoaded] = React.useState(false);
  const elementRef = React.useRef<HTMLDivElement>(null);
  
  const isIntersecting = useIntersectionObserver(elementRef, {
    threshold,
    rootMargin,
  });

  React.useEffect(() => {
    if (isIntersecting && (!once || !hasLoaded)) {
      setHasLoaded(true);
    }
  }, [isIntersecting, once, hasLoaded]);

  return (
    <div ref={elementRef}>
      {hasLoaded ? children : fallback}
    </div>
  );
}

// Bundle size analyzer (development only)
export function analyzeBundleSize() {
  if (process.env.NODE_ENV === 'development') {
    // This would be used with webpack-bundle-analyzer or similar
    console.log('Bundle analysis would run here in development');
  }
}

// Image optimization component
export interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  placeholder = 'empty',
  blurDataURL
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
  };

  if (hasError) {
    return (
      <div 
        className={`bg-gray-200 dark:bg-gray-700 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-500">Failed to load image</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {!isLoaded && placeholder === 'blur' && (
        <div 
          className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse"
          style={{
            backgroundImage: blurDataURL ? `url(${blurDataURL})` : undefined,
            backgroundSize: 'cover',
            filter: 'blur(10px)',
          }}
        />
      )}
      
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 ${className}`}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
      />
    </div>
  );
}

// Preload critical resources
export function preloadCriticalResources() {
  if (typeof window !== 'undefined') {
    // Preload critical fonts
    const criticalFonts = [
      '/fonts/inter-var.woff2',
      '/fonts/inter-bold.woff2',
    ];

    criticalFonts.forEach(font => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = font;
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });

    // Preload critical images
    const criticalImages = [
      '/images/logo.svg',
      '/images/hero-bg.jpg',
    ];

    criticalImages.forEach(image => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = image;
      link.as = 'image';
      document.head.appendChild(link);
    });
  }
}

// Component to track and optimize Core Web Vitals
export function CoreWebVitalsTracker() {
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    // Track CLS (Cumulative Layout Shift)
    let cls = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          cls += (entry as any).value;
        }
      }
    }).observe({ type: 'layout-shift', buffered: true });

    // Track LCP (Largest Contentful Paint)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log('LCP:', lastEntry.startTime);
    }).observe({ type: 'largest-contentful-paint', buffered: true });

    // Track FID (First Input Delay)
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.log('FID:', (entry as any).processingStart - entry.startTime);
      }
    }).observe({ type: 'first-input', buffered: true });

    // Cleanup function
    return () => {
      console.log('Final CLS score:', cls);
    };
  }, []);

  return null; // This component doesn't render anything
}