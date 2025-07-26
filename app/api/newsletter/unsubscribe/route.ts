import { NextRequest, NextResponse } from 'next/server'
import { newsletterService } from '@/lib/newsletter'
import { withRateLimit } from '@/lib/api/withRateLimit'

export const POST = withRateLimit(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { email } = body
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }
    
    const unsubscribed = await newsletterService.unsubscribe(email)
    
    if (!unsubscribed) {
      return NextResponse.json(
        { error: 'Email not found in subscription list' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed from newsletter'
    })
  } catch (error) {
    console.error('Error unsubscribing from newsletter:', error)
    return NextResponse.json(
      { error: 'Failed to unsubscribe from newsletter' },
      { status: 500 }
    )
  }
}, {
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 10 // 10 requests per minute for unsubscribing
})

export const GET = withRateLimit(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }
    
    const unsubscribed = await newsletterService.unsubscribe(email)
    
    if (!unsubscribed) {
      return NextResponse.json(
        { error: 'Email not found in subscription list' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed from newsletter'
    })
  } catch (error) {
    console.error('Error unsubscribing from newsletter:', error)
    return NextResponse.json(
      { error: 'Failed to unsubscribe from newsletter' },
      { status: 500 }
    )
  }
}, {
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 10 // 10 requests per minute for unsubscribing via GET
})