'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface CacheOptions {
  ttl?: number // Time to live in seconds
  key?: string // Custom cache key
  revalidateOnFocus?: boolean
  revalidateOnReconnect?: boolean
}

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

// In-memory cache store
const cacheStore = new Map<string, CacheEntry<any>>()

export function useRequestCache<T>(
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
) {
  const {
    ttl = 300, // 5 minutes default
    key,
    revalidateOnFocus = true,
    revalidateOnReconnect = true
  } = options

  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isValidating, setIsValidating] = useState(false)
  
  const cacheKey = key || fetcher.toString()
  const isMountedRef = useRef(true)

  const fetchData = useCallback(async (skipCache = false) => {
    // Check cache first
    if (!skipCache) {
      const cached = cacheStore.get(cacheKey)
      if (cached && Date.now() - cached.timestamp < cached.ttl * 1000) {
        setData(cached.data)
        setIsLoading(false)
        return cached.data
      }
    }

    setIsValidating(true)
    try {
      const result = await fetcher()
      
      if (isMountedRef.current) {
        // Update cache
        cacheStore.set(cacheKey, {
          data: result,
          timestamp: Date.now(),
          ttl
        })
        
        setData(result)
        setError(null)
      }
      
      return result
    } catch (err) {
      if (isMountedRef.current) {
        setError(err as Error)
      }
      throw err
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false)
        setIsValidating(false)
      }
    }
  }, [cacheKey, fetcher, ttl])

  const revalidate = useCallback(() => {
    return fetchData(true)
  }, [fetchData])

  const mutate = useCallback((newData: T | ((prev: T | null) => T)) => {
    const updatedData = typeof newData === 'function' 
      ? (newData as (prev: T | null) => T)(data)
      : newData
    
    setData(updatedData)
    
    // Update cache
    cacheStore.set(cacheKey, {
      data: updatedData,
      timestamp: Date.now(),
      ttl
    })
  }, [cacheKey, data, ttl])

  // Initial fetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Cleanup
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Revalidate on focus
  useEffect(() => {
    if (!revalidateOnFocus) return

    const handleFocus = () => {
      if (document.visibilityState === 'visible') {
        revalidate()
      }
    }

    document.addEventListener('visibilitychange', handleFocus)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleFocus)
      window.removeEventListener('focus', handleFocus)
    }
  }, [revalidate, revalidateOnFocus])

  // Revalidate on reconnect
  useEffect(() => {
    if (!revalidateOnReconnect) return

    const handleOnline = () => {
      revalidate()
    }

    window.addEventListener('online', handleOnline)

    return () => {
      window.removeEventListener('online', handleOnline)
    }
  }, [revalidate, revalidateOnReconnect])

  return {
    data,
    error,
    isLoading,
    isValidating,
    revalidate,
    mutate
  }
}

// Utility to clear cache
export function clearRequestCache(key?: string) {
  if (key) {
    cacheStore.delete(key)
  } else {
    cacheStore.clear()
  }
}

// Utility to preload data
export function preloadRequest<T>(
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
) {
  const { ttl = 300, key } = options
  const cacheKey = key || fetcher.toString()
  
  fetcher().then(data => {
    cacheStore.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl
    })
  })
}