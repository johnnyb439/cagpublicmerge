import { NextResponse } from 'next/server'

export interface CacheOptions {
  maxAge?: number // seconds
  sMaxAge?: number // CDN cache seconds
  staleWhileRevalidate?: number // seconds
  immutable?: boolean
  private?: boolean
  noCache?: boolean
  noStore?: boolean
  mustRevalidate?: boolean
}

// Cache presets for different content types
export const CachePresets = {
  // Static assets - cache for 1 year
  STATIC: {
    maxAge: 31536000,
    immutable: true
  },
  
  // Images - cache for 30 days
  IMAGE: {
    maxAge: 2592000,
    sMaxAge: 2592000,
    staleWhileRevalidate: 86400
  },
  
  // API responses - cache for 5 minutes
  API: {
    maxAge: 300,
    sMaxAge: 300,
    staleWhileRevalidate: 60
  },
  
  // User-specific data - no CDN cache
  PRIVATE: {
    maxAge: 300,
    private: true
  },
  
  // Real-time data - no cache
  REALTIME: {
    noCache: true,
    noStore: true
  },
  
  // Page HTML - cache with revalidation
  PAGE: {
    maxAge: 0,
    sMaxAge: 86400,
    staleWhileRevalidate: 3600
  }
}

export function setCacheHeaders(response: NextResponse, options: CacheOptions): NextResponse {
  const directives: string[] = []
  
  if (options.noStore) {
    directives.push('no-store')
  } else if (options.noCache) {
    directives.push('no-cache')
  } else {
    if (options.private) {
      directives.push('private')
    } else {
      directives.push('public')
    }
    
    if (options.maxAge !== undefined) {
      directives.push(`max-age=${options.maxAge}`)
    }
    
    if (options.sMaxAge !== undefined) {
      directives.push(`s-maxage=${options.sMaxAge}`)
    }
    
    if (options.staleWhileRevalidate !== undefined) {
      directives.push(`stale-while-revalidate=${options.staleWhileRevalidate}`)
    }
    
    if (options.immutable) {
      directives.push('immutable')
    }
    
    if (options.mustRevalidate) {
      directives.push('must-revalidate')
    }
  }
  
  response.headers.set('Cache-Control', directives.join(', '))
  
  // Add Vary header for proper caching
  const existingVary = response.headers.get('Vary') || ''
  const varyHeaders = new Set(existingVary.split(',').map(h => h.trim()).filter(Boolean))
  varyHeaders.add('Accept-Encoding')
  response.headers.set('Vary', Array.from(varyHeaders).join(', '))
  
  return response
}

// Helper function to create cached response
export function createCachedResponse<T>(
  data: T,
  options: CacheOptions = CachePresets.API
): NextResponse {
  const response = NextResponse.json(data)
  return setCacheHeaders(response, options)
}

// ETag support for conditional requests
export function generateETag(content: string): string {
  // Simple ETag generation - in production use a proper hash
  const hash = Buffer.from(content).toString('base64').slice(0, 16)
  return `"${hash}"`
}

export function handleConditionalRequest(
  request: Request,
  content: string,
  etag?: string
): NextResponse | null {
  const generatedEtag = etag || generateETag(content)
  const ifNoneMatch = request.headers.get('If-None-Match')
  
  if (ifNoneMatch === generatedEtag) {
    return new NextResponse(null, { status: 304 })
  }
  
  return null
}