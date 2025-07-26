import { NextRequest, NextResponse } from 'next/server'

interface PerformanceMetric {
  name: string
  value: number
  unit: string
  timestamp: number
  page: string
  userAgent: string
}

interface WebVitalMetric {
  metric: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  timestamp: number
  url: string
  userAgent: string
}

// In-memory storage for demo (use database in production)
const metrics: PerformanceMetric[] = []
const webVitals: WebVitalMetric[] = []

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    if (data.metric && data.rating) {
      // Web Vital metric
      const webVital: WebVitalMetric = {
        metric: data.metric,
        value: data.value,
        rating: data.rating,
        timestamp: data.timestamp || Date.now(),
        url: data.url || '',
        userAgent: data.userAgent || ''
      }
      
      webVitals.push(webVital)
      
      // Keep only last 1000 entries
      if (webVitals.length > 1000) {
        webVitals.splice(0, webVitals.length - 1000)
      }
    } else {
      // Regular performance metric
      const metric: PerformanceMetric = {
        name: data.name,
        value: data.value,
        unit: data.unit,
        timestamp: data.timestamp || Date.now(),
        page: data.page || '',
        userAgent: data.userAgent || ''
      }
      
      metrics.push(metric)
      
      // Keep only last 1000 entries
      if (metrics.length > 1000) {
        metrics.splice(0, metrics.length - 1000)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error storing performance metric:', error)
    return NextResponse.json(
      { error: 'Failed to store metric' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const page = searchParams.get('page')
    const limit = parseInt(searchParams.get('limit') || '100')

    let data: any[]

    if (type === 'web-vitals') {
      data = webVitals
    } else {
      data = metrics
    }

    // Filter by page if specified
    if (page) {
      data = data.filter(item => 
        (item as any).page === page || (item as any).url?.includes(page)
      )
    }

    // Sort by timestamp (newest first) and limit
    data = data
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit)

    // Calculate summary statistics
    const summary = {
      total: data.length,
      lastUpdated: data.length > 0 ? data[0].timestamp : null
    }

    if (type === 'web-vitals') {
      const vitalSummary = webVitals.reduce((acc, vital) => {
        if (!acc[vital.metric]) {
          acc[vital.metric] = { good: 0, needsImprovement: 0, poor: 0, total: 0 }
        }
        acc[vital.metric][vital.rating === 'needs-improvement' ? 'needsImprovement' : vital.rating]++
        acc[vital.metric].total++
        return acc
      }, {} as Record<string, any>)

      summary['vitalsBreakdown'] = vitalSummary
    }

    return NextResponse.json({
      success: true,
      data,
      summary
    })
  } catch (error) {
    console.error('Error retrieving performance metrics:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve metrics' },
      { status: 500 }
    )
  }
}