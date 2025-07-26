'use client'

import { useEffect, useState } from 'react'
import { performanceMonitor, PerformanceBudget, resourceHints } from '@/lib/performance/core-web-vitals'

interface PerformanceOptimizerProps {
  enableMonitoring?: boolean;
  enableBudgetChecking?: boolean;
  enableResourceHints?: boolean;
}

export default function PerformanceOptimizer({
  enableMonitoring = true,
  enableBudgetChecking = true,
  enableResourceHints = true
}: PerformanceOptimizerProps) {
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || isInitialized) return;

    const initializePerformanceOptimizations = async () => {
      try {
        // Initialize performance monitoring
        if (enableMonitoring) {
          // Performance monitor is auto-initialized in constructor
          console.log('Performance monitoring initialized');
        }

        // Add resource hints for external domains
        if (enableResourceHints) {
          resourceHints.addDNSPrefetch([
            'fonts.googleapis.com',
            'fonts.gstatic.com',
            'api.github.com',
            'vercel.app'
          ]);

          resourceHints.addPreconnect([
            'https://fonts.googleapis.com',
            'https://fonts.gstatic.com',
            'https://api.github.com'
          ]);
        }

        // Check performance budget (in development)
        if (enableBudgetChecking && process.env.NODE_ENV === 'development') {
          // Wait for page load to complete
          window.addEventListener('load', async () => {
            setTimeout(async () => {
              const budgetResult = await PerformanceBudget.checkBudget();
              if (!budgetResult.passed) {
                console.warn('Performance budget exceeded:', budgetResult.breakdown);
              }
            }, 1000);
          });
        }

        // Preload critical chunks
        if ('requestIdleCallback' in window) {
          requestIdleCallback(() => {
            // Preload commonly used chunks
            import('framer-motion').catch(() => {});
            import('lucide-react').catch(() => {});
          });
        }

        // Initialize intersection observer for lazy loading
        if ('IntersectionObserver' in window) {
          const lazyImages = document.querySelectorAll('img[data-src]');
          if (lazyImages.length > 0) {
            const imageObserver = new IntersectionObserver((entries) => {
              entries.forEach(entry => {
                if (entry.isIntersecting) {
                  const img = entry.target as HTMLImageElement;
                  const src = img.dataset.src;
                  if (src) {
                    img.src = src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                  }
                }
              });
            });

            lazyImages.forEach(img => imageObserver.observe(img));
          }
        }

        // Optimize loading of non-critical resources
        const optimizeNonCriticalResources = () => {
          // Defer loading of analytics scripts
          if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
              // Any non-critical initialization can go here
            });
          }
        };

        optimizeNonCriticalResources();
        setIsInitialized(true);

      } catch (error) {
        console.error('Failed to initialize performance optimizations:', error);
      }
    };

    initializePerformanceOptimizations();

    // Cleanup on unmount
    return () => {
      if (performanceMonitor) {
        performanceMonitor.cleanup();
      }
    };
  }, [enableMonitoring, enableBudgetChecking, enableResourceHints, isInitialized]);

  // Add critical CSS inlining for above-the-fold content
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Preload critical fonts
    const criticalFonts = [
      '/fonts/montserrat-variable.woff2',
      '/fonts/inter-variable.woff2'
    ];

    criticalFonts.forEach(font => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      link.href = font;
      document.head.appendChild(link);
    });

    // Add viewport meta tag if not present
    if (!document.querySelector('meta[name="viewport"]')) {
      const viewport = document.createElement('meta');
      viewport.name = 'viewport';
      viewport.content = 'width=device-width, initial-scale=1, shrink-to-fit=no';
      document.head.appendChild(viewport);
    }

    // Optimize third-party scripts loading
    const optimizeThirdPartyScripts = () => {
      // Delay loading of non-critical third-party scripts
      setTimeout(() => {
        // Any third-party script optimization logic
      }, 3000);
    };

    window.addEventListener('load', optimizeThirdPartyScripts);

    return () => {
      window.removeEventListener('load', optimizeThirdPartyScripts);
    };
  }, []);

  // This component doesn't render anything visible
  return null;
}