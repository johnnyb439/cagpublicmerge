import { NextRequest, NextResponse } from 'next/server'
import { newsletterService } from '@/lib/newsletter'
import { withRateLimit } from '@/lib/api/withRateLimit'

export const POST = withRateLimit(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { email, categories, frequency, userId } = body
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }
    
    try {
      const subscription = await newsletterService.subscribe(
        email,
        categories || ['job_alerts'],
        frequency || 'weekly',
        userId
      )
      
      return NextResponse.json({
        success: true,
        message: 'Subscription created. Please check your email to confirm.',
        subscription: {
          id: subscription.id,
          email: subscription.email,
          categories: subscription.categories,
          frequency: subscription.frequency
        }
      })
    } catch (error: any) {
      if (error.message === 'Email already subscribed') {
        return NextResponse.json(
          { error: 'This email is already subscribed to our newsletter' },
          { status: 409 }
        )
      }
      throw error
    }
  } catch (error) {
    console.error('Error subscribing to newsletter:', error)
    return NextResponse.json(
      { error: 'Failed to subscribe to newsletter' },
      { status: 500 }
    )
  }
}, {
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 10 // 10 requests per minute for newsletter subscriptions
})