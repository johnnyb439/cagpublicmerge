import { NextRequest, NextResponse } from 'next/server'
import { newsletterService } from '@/lib/newsletter'
import { withRateLimit } from '@/lib/api/withRateLimit'

export const GET = withRateLimit(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    
    if (!token) {
      return NextResponse.json(
        { error: 'Confirmation token is required' },
        { status: 400 }
      )
    }
    
    const confirmed = await newsletterService.confirmSubscription(token)
    
    if (!confirmed) {
      return NextResponse.json(
        { error: 'Invalid or expired confirmation token' },
        { status: 400 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Newsletter subscription confirmed successfully!'
    })
  } catch (error) {
    console.error('Error confirming newsletter subscription:', error)
    return NextResponse.json(
      { error: 'Failed to confirm subscription' },
      { status: 500 }
    )
  }
}