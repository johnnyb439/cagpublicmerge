import { redis } from '@/lib/redis/client'

interface CacheMetrics {
  hits: number
  misses: number
  sets: number
  deletes: number
  errors: number
  avgResponseTime: number
}

class CacheMonitor {
  private metrics: Map<string, CacheMetrics> = new Map()
  private metricsInterval: ReturnType<typeof setInterval> | null = null
  
  constructor() {
    // Start periodic metrics reporting
    if (process.env.NODE_ENV === 'production') {
      this.startMetricsReporting()
    }
  }
  
  private getMetrics(key: string): CacheMetrics {
    if (!this.metrics.has(key)) {
      this.metrics.set(key, {
        hits: 0,
        misses: 0,
        sets: 0,
        deletes: 0,
        errors: 0,
        avgResponseTime: 0
      })
    }
    return this.metrics.get(key)!
  }
  
  recordHit(key: string, responseTime?: number) {
    const metrics = this.getMetrics(key)
    metrics.hits++
    if (responseTime !== undefined) {
      metrics.avgResponseTime = (metrics.avgResponseTime * (metrics.hits - 1) + responseTime) / metrics.hits
    }
  }
  
  recordMiss(key: string) {
    const metrics = this.getMetrics(key)
    metrics.misses++
  }
  
  recordSet(key: string) {
    const metrics = this.getMetrics(key)
    metrics.sets++
  }
  
  recordDelete(key: string) {
    const metrics = this.getMetrics(key)
    metrics.deletes++
  }
  
  recordError(key: string) {
    const metrics = this.getMetrics(key)
    metrics.errors++
  }
  
  getHitRate(key: string): number {
    const metrics = this.getMetrics(key)
    const total = metrics.hits + metrics.misses
    return total > 0 ? (metrics.hits / total) * 100 : 0
  }
  
  getAllMetrics(): Map<string, CacheMetrics> {
    return new Map(this.metrics)
  }
  
  resetMetrics() {
    this.metrics.clear()
  }
  
  private startMetricsReporting() {
    // Report metrics every 5 minutes
    this.metricsInterval = setInterval(() => {
      this.reportMetrics()
    }, 5 * 60 * 1000)
  }
  
  private async reportMetrics() {
    const allMetrics = this.getAllMetrics()
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Cache Metrics Report:')
      allMetrics.forEach((metrics, key) => {
        console.log(`  ${key}:`, {
          hitRate: `${this.getHitRate(key).toFixed(2)}%`,
          ...metrics
        })
      })
    }
    
    // Store metrics in Redis for monitoring
    if (redis) {
      try {
        const timestamp = new Date().toISOString()
        const metricsData = {
          timestamp,
          metrics: Array.from(allMetrics.entries()).map(([key, metrics]) => ({
            key,
            hitRate: this.getHitRate(key),
            ...metrics
          }))
        }
        
        await redis.zadd(
          'cache:metrics',
          Date.now(),
          JSON.stringify(metricsData)
        )
        
        // Keep only last 24 hours of metrics
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000)
        await redis.zremrangebyscore('cache:metrics', '-inf', oneDayAgo)
      } catch (error) {
        console.error('Failed to store cache metrics:', error)
      }
    }
    
    // Reset metrics after reporting
    this.resetMetrics()
  }
  
  stopMetricsReporting() {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval)
      this.metricsInterval = null
    }
  }
}

export const cacheMonitor = new CacheMonitor()

// Instrumented cache wrapper with metrics
export async function withMetrics<T>(
  key: string,
  fn: () => Promise<T>,
  getCached: () => Promise<T | null>,
  setCached: (value: T) => Promise<void>
): Promise<T> {
  const startTime = Date.now()
  
  try {
    // Try to get from cache
    const cached = await getCached()
    if (cached !== null) {
      cacheMonitor.recordHit(key, Date.now() - startTime)
      return cached
    }
    
    cacheMonitor.recordMiss(key)
    
    // Execute function
    const result = await fn()
    
    // Cache the result
    await setCached(result)
    cacheMonitor.recordSet(key)
    
    return result
  } catch (error) {
    cacheMonitor.recordError(key)
    throw error
  }
}

// API endpoint to get cache metrics
export async function getCacheMetricsFromRedis(): Promise<any[]> {
  if (!redis) return []
  
  try {
    // Get metrics from last hour
    const oneHourAgo = Date.now() - (60 * 60 * 1000)
    const metrics = await redis.zrangebyscore(
      'cache:metrics',
      oneHourAgo,
      '+inf'
    )
    
    return metrics.map(m => JSON.parse(m))
  } catch (error) {
    console.error('Failed to get cache metrics:', error)
    return []
  }
}