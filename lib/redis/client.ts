import { Redis } from 'ioredis'
import { cacheMonitor, withMetrics } from '@/lib/cache/metrics'

// Create Redis client with environment config
const createRedisClient = () => {
  if (process.env.REDIS_URL) {
    return new Redis(process.env.REDIS_URL)
  }
  
  // Fallback to local Redis
  return new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0'),
    retryStrategy: (times) => Math.min(times * 50, 2000),
  })
}

// Export singleton instance
export const redis = process.env.ENABLE_REDIS === 'true' ? createRedisClient() : null

// Cache wrapper with in-memory fallback
class CacheManager {
  private memoryCache: Map<string, { value: any; expires: number }> = new Map()
  
  async get<T>(key: string): Promise<T | null> {
    // Try Redis first
    if (redis) {
      try {
        const value = await redis.get(key)
        return value ? JSON.parse(value) : null
      } catch (error) {
        console.error('Redis get error:', error)
      }
    }
    
    // Fallback to memory cache
    const cached = this.memoryCache.get(key)
    if (cached && cached.expires > Date.now()) {
      return cached.value
    }
    
    this.memoryCache.delete(key)
    return null
  }
  
  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    const serialized = JSON.stringify(value)
    
    // Try Redis first
    if (redis) {
      try {
        await redis.setex(key, ttl, serialized)
        return
      } catch (error) {
        console.error('Redis set error:', error)
      }
    }
    
    // Fallback to memory cache
    this.memoryCache.set(key, {
      value,
      expires: Date.now() + (ttl * 1000)
    })
  }
  
  async delete(key: string): Promise<void> {
    // Try Redis first
    if (redis) {
      try {
        await redis.del(key)
      } catch (error) {
        console.error('Redis delete error:', error)
      }
    }
    
    // Always delete from memory cache
    this.memoryCache.delete(key)
  }
  
  async flush(): Promise<void> {
    // Flush Redis
    if (redis) {
      try {
        await redis.flushdb()
      } catch (error) {
        console.error('Redis flush error:', error)
      }
    }
    
    // Clear memory cache
    this.memoryCache.clear()
  }
  
  // Cache key generators
  generateKey(prefix: string, ...parts: (string | number)[]): string {
    return `${prefix}:${parts.join(':')}`
  }
}

export const cache = new CacheManager()

// Cache decorators
export function Cacheable(ttl: number = 3600) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    
    descriptor.value = async function (...args: any[]) {
      const cacheKey = cache.generateKey(target.constructor.name, propertyKey, ...args)
      
      // Try to get from cache
      const cached = await cache.get(cacheKey)
      if (cached !== null) {
        return cached
      }
      
      // Execute original method
      const result = await originalMethod.apply(this, args)
      
      // Cache the result
      await cache.set(cacheKey, result, ttl)
      
      return result
    }
    
    return descriptor
  }
}

// Cache middleware for API routes with metrics
export async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttl: number = 3600
): Promise<T> {
  return withMetrics(
    key,
    fn,
    () => cache.get<T>(key),
    (value: T) => cache.set(key, value, ttl)
  )
}