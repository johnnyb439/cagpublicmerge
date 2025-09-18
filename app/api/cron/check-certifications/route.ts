import { NextRequest, NextResponse } from 'next/server'
import { certificationCheckHandler } from '@/lib/services/certification-notifications'

/**
 * Cron endpoint for checking certification expiry
 * Can be called by Vercel Cron, AWS EventBridge, or any scheduler
 *
 * Recommended schedule: Daily at 9:00 AM
 * Vercel cron config (vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/check-certifications",
 *     "schedule": "0 9 * * *"
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Optional: Verify cron secret for security
    const cronSecret = request.headers.get('x-cron-secret')
    if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('[CRON] Starting certification expiry check...')

    const result = await certificationCheckHandler()

    console.log('[CRON] Certification check completed:', result.body)

    return NextResponse.json(JSON.parse(result.body), {
      status: result.statusCode
    })
  } catch (error) {
    console.error('[CRON] Error in certification check:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Also support POST for manual triggers
export async function POST(request: NextRequest) {
  return GET(request)
}