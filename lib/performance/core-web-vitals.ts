// Core Web Vitals optimization utilities

export interface WebVitalsMetrics {
  CLS: number; // Cumulative Layout Shift
  FID: number; // First Input Delay
  FCP: number; // First Contentful Paint
  LCP: number; // Largest Contentful Paint
  TTFB: number; // Time to First Byte
}

export interface PerformanceEntry {
  name: string;
  startTime: number;
  duration: number;
  entryType: string;
}

// Performance monitoring class
export class PerformanceMonitor {
  private metrics: Partial<WebVitalsMetrics> = {};
  private observers: PerformanceObserver[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers();
    }
  }

  private initializeObservers() {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          this.metrics.LCP = lastEntry.startTime;
          this.reportMetric('LCP', lastEntry.startTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (e) {
        console.warn('LCP observer not supported');
      }

      // First Input Delay (FID)
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            this.metrics.FID = entry.processingStart - entry.startTime;
            this.reportMetric('FID', this.metrics.FID);
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      } catch (e) {
        console.warn('FID observer not supported');
      }

      // Cumulative Layout Shift (CLS)
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
              this.metrics.CLS = clsValue;
            }
          });
          this.reportMetric('CLS', clsValue);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch (e) {
        console.warn('CLS observer not supported');
      }

      // First Contentful Paint (FCP)
      try {
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (entry.name === 'first-contentful-paint') {
              this.metrics.FCP = entry.startTime;
              this.reportMetric('FCP', entry.startTime);
            }
          });
        });
        fcpObserver.observe({ entryTypes: ['paint'] });
        this.observers.push(fcpObserver);
      } catch (e) {
        console.warn('FCP observer not supported');
      }
    }

    // Time to First Byte (TTFB)
    if (window.performance && window.performance.timing) {
      const navigation = window.performance.timing;
      this.metrics.TTFB = navigation.responseStart - navigation.requestStart;
      this.reportMetric('TTFB', this.metrics.TTFB);
    }
  }

  private reportMetric(name: string, value: number) {
    // Send to analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', name, {
        event_category: 'Web Vitals',
        value: Math.round(value),
        non_interaction: true,
      });
    }

    // Console logging for development
    if (process.env.NODE_ENV === 'development') {
      console.log(`${name}: ${value}`);
    }
  }

  getMetrics(): Partial<WebVitalsMetrics> {
    return { ...this.metrics };
  }

  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Image optimization utilities
export class ImageOptimizer {
  static async compressImage(file: File, quality: number = 0.8): Promise<Blob> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        const MAX_WIDTH = 1920;
        const MAX_HEIGHT = 1080;
        
        let { width, height } = img;
        
        if (width > height) {
          if (width > MAX_WIDTH) {
            height = (height * MAX_WIDTH) / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = (width * MAX_HEIGHT) / height;
            height = MAX_HEIGHT;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(resolve as BlobCallback, 'image/jpeg', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  static preloadCriticalImages(imageUrls: string[]) {
    imageUrls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      document.head.appendChild(link);
    });
  }

  static lazyLoadImages() {
    if ('IntersectionObserver' in window) {
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

      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }
}

// Code splitting utilities
export class CodeSplitter {
  private static loadedChunks = new Set<string>();

  static async loadChunk(chunkName: string): Promise<any> {
    if (this.loadedChunks.has(chunkName)) {
      return Promise.resolve();
    }

    if (typeof window === 'undefined') {
      // Don't load chunks on server side
      return Promise.resolve();
    }

    try {
      let moduleToLoad;
      switch (chunkName) {
        case 'chart-lib':
          moduleToLoad = await import('recharts');
          break;
        case 'animation-lib':
          moduleToLoad = await import('framer-motion');
          break;
        default:
          throw new Error(`Unknown chunk: ${chunkName}`);
      }
      
      this.loadedChunks.add(chunkName);
      return moduleToLoad;
    } catch (error) {
      console.error(`Failed to load chunk ${chunkName}:`, error);
      throw error;
    }
  }

  static preloadChunk(chunkName: string) {
    // Preload chunk in background
    requestIdleCallback(() => {
      this.loadChunk(chunkName).catch(() => {
        // Silently fail for preloading
      });
    });
  }
}

// Resource hints utilities
export class ResourceHints {
  static addDNSPrefetch(domains: string[]) {
    domains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = `//${domain}`;
      document.head.appendChild(link);
    });
  }

  static addPreconnect(origins: string[]) {
    origins.forEach(origin => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = origin;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }

  static addModulePreload(scripts: string[]) {
    scripts.forEach(script => {
      const link = document.createElement('link');
      link.rel = 'modulepreload';
      link.href = script;
      document.head.appendChild(link);
    });
  }
}

// Bundle analyzer for performance insights
export class BundleAnalyzer {
  static analyzeBundle() {
    if (process.env.NODE_ENV === 'development') {
      const scripts = Array.from(document.querySelectorAll('script[src]'));
      const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
      
      const analysis = {
        scripts: scripts.map(script => ({
          src: (script as HTMLScriptElement).src,
          async: (script as HTMLScriptElement).async,
          defer: (script as HTMLScriptElement).defer
        })),
        styles: styles.map(style => ({
          href: (style as HTMLLinkElement).href,
          media: (style as HTMLLinkElement).media
        })),
        totalScripts: scripts.length,
        totalStyles: styles.length
      };
      
      console.group('Bundle Analysis');
      console.table(analysis.scripts);
      console.table(analysis.styles);
      console.log(`Total Scripts: ${analysis.totalScripts}`);
      console.log(`Total Stylesheets: ${analysis.totalStyles}`);
      console.groupEnd();
      
      return analysis;
    }
  }
}

// Performance budget checker
export class PerformanceBudget {
  private static budgets = {
    javascript: 500 * 1024, // 500KB
    css: 200 * 1024, // 200KB
    images: 2 * 1024 * 1024, // 2MB
    fonts: 300 * 1024, // 300KB
    total: 3 * 1024 * 1024 // 3MB
  };

  static async checkBudget(): Promise<{
    passed: boolean;
    breakdown: Record<string, { size: number; budget: number; passed: boolean }>;
  }> {
    if (!('performance' in window) || !('getEntriesByType' in window.performance)) {
      return { passed: true, breakdown: {} };
    }

    const resources = window.performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    const breakdown = {
      javascript: { size: 0, budget: this.budgets.javascript, passed: true },
      css: { size: 0, budget: this.budgets.css, passed: true },
      images: { size: 0, budget: this.budgets.images, passed: true },
      fonts: { size: 0, budget: this.budgets.fonts, passed: true },
      total: { size: 0, budget: this.budgets.total, passed: true }
    };

    resources.forEach(resource => {
      const size = resource.transferSize || 0;
      const url = resource.name;
      
      if (url.match(/\.(js|mjs)$/)) {
        breakdown.javascript.size += size;
      } else if (url.match(/\.css$/)) {
        breakdown.css.size += size;
      } else if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
        breakdown.images.size += size;
      } else if (url.match(/\.(woff|woff2|ttf|otf)$/)) {
        breakdown.fonts.size += size;
      }
      
      breakdown.total.size += size;
    });

    Object.keys(breakdown).forEach(key => {
      const category = breakdown[key as keyof typeof breakdown];
      category.passed = category.size <= category.budget;
    });

    const passed = Object.values(breakdown).every(category => category.passed);

    if (process.env.NODE_ENV === 'development') {
      console.group('Performance Budget');
      Object.entries(breakdown).forEach(([key, value]) => {
        const status = value.passed ? '✅' : '❌';
        console.log(`${status} ${key}: ${(value.size / 1024).toFixed(2)}KB / ${(value.budget / 1024).toFixed(2)}KB`);
      });
      console.groupEnd();
    }

    return { passed, breakdown };
  }
}

// Export singleton instances
export const performanceMonitor = new PerformanceMonitor();
export const imageOptimizer = ImageOptimizer;
export const codeSplitter = CodeSplitter;
export const resourceHints = ResourceHints;
export const bundleAnalyzer = BundleAnalyzer;
export const performanceBudget = PerformanceBudget;