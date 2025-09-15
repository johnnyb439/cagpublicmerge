import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { subscriptionPlans } from '../plans/route'

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-09-30.acacia',
})

export async function POST(request: NextRequest) {
  try {
    const { priceId, userId, email, planId } = await request.json()

    // Validate required fields
    if (!priceId || !userId || !email || !planId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: priceId, userId, email, planId' 
        },
        { status: 400 }
      )
    }

    // Get plan details for metadata
    const plan = subscriptionPlans[planId as keyof typeof subscriptionPlans]
    if (!plan) {
      return NextResponse.json(
        { success: false, error: 'Invalid plan ID' },
        { status: 400 }
      )
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${request.nextUrl.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${request.nextUrl.origin}/subscription?canceled=true`,
      metadata: {
        userId,
        planId,
        planName: plan.name,
      },
      subscription_data: {
        metadata: {
          userId,
          planId,
          planName: plan.name,
        },
      },
      // Enable billing portal for subscription management
      allow_promotion_codes: true,
    })

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
      message: `Checkout session created for ${plan.name}`
    })

  } catch (error) {
    console.error('Stripe checkout error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Checkout session creation failed',
        details: 'Please check your Stripe configuration and API keys'
      },
      { status: 500 }
    )
  }
}

// Handle GET requests (for testing)
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'CAG Stripe Checkout API is ready!',
    testMode: !process.env.STRIPE_SECRET_KEY?.startsWith('sk_live'),
    timestamp: new Date().toISOString()
  })
}