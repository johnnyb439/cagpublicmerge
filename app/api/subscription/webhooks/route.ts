import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-09-30.acacia',
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      )
    }

    console.log('🎉 Stripe webhook received:', event.type)

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session
        console.log('✅ Checkout session completed:', session.id)
        
        // Update user subscription in database
        await handleSubscriptionCreated(session)
        break

      case 'customer.subscription.created':
        const subscription = event.data.object as Stripe.Subscription
        console.log('🆕 New subscription created:', subscription.id)
        
        // Update user tier
        await handleSubscriptionUpdate(subscription, 'created')
        break

      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object as Stripe.Subscription
        console.log('🔄 Subscription updated:', updatedSubscription.id)
        
        // Handle plan changes, renewals, etc.
        await handleSubscriptionUpdate(updatedSubscription, 'updated')
        break

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription
        console.log('❌ Subscription canceled:', deletedSubscription.id)
        
        // Downgrade user to free tier
        await handleSubscriptionUpdate(deletedSubscription, 'deleted')
        break

      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice
        console.log('💰 Payment succeeded:', invoice.id)
        
        // Send receipt, update billing history
        await handlePaymentSucceeded(invoice)
        break

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice
        console.log('⚠️ Payment failed:', failedInvoice.id)
        
        // Send dunning emails, handle failed payments
        await handlePaymentFailed(failedInvoice)
        break

      default:
        console.log(`🤷 Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleSubscriptionCreated(session: Stripe.Checkout.Session) {
  const { userId, planId, planName } = session.metadata || {}
  
  if (!userId || !planId) {
    console.error('Missing metadata in checkout session:', session.id)
    return
  }

  console.log(`🎯 Creating subscription for user ${userId} on plan ${planName}`)
  
  // TODO: Update user in database
  // await updateUserSubscription(userId, {
  //   planId,
  //   status: 'active',
  //   stripeCustomerId: session.customer,
  //   stripeSubscriptionId: session.subscription
  // })

  // Send welcome email
  console.log(`📧 Would send welcome email to user ${userId} for ${planName}`)
}

async function handleSubscriptionUpdate(
  subscription: Stripe.Subscription, 
  action: 'created' | 'updated' | 'deleted'
) {
  const { userId, planId, planName } = subscription.metadata || {}
  
  if (!userId) {
    console.error('Missing userId in subscription metadata:', subscription.id)
    return
  }

  let status = 'active'
  let newPlanId = planId

  if (action === 'deleted') {
    status = 'canceled'
    newPlanId = 'free' // Downgrade to free tier
  } else if (subscription.status === 'past_due' || subscription.status === 'unpaid') {
    status = 'past_due'
  }

  console.log(`🔄 Updating subscription for user ${userId}: ${action} -> ${status}`)
  
  // TODO: Update user in database
  // await updateUserSubscription(userId, {
  //   planId: newPlanId,
  //   status,
  //   currentPeriodEnd: new Date(subscription.current_period_end * 1000)
  // })
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log(`✅ Payment succeeded: $${(invoice.amount_paid / 100).toFixed(2)}`)
  
  // TODO: Record payment in database, send receipt
  // await recordPayment({
  //   invoiceId: invoice.id,
  //   amount: invoice.amount_paid,
  //   currency: invoice.currency,
  //   customerId: invoice.customer
  // })
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log(`❌ Payment failed: $${(invoice.amount_due / 100).toFixed(2)}`)
  
  // TODO: Handle failed payment - send dunning email, retry logic
  // await handleFailedPayment({
  //   invoiceId: invoice.id,
  //   customerId: invoice.customer,
  //   attemptCount: invoice.attempt_count
  // })
}

// GET endpoint for webhook verification
export async function GET() {
  return NextResponse.json({
    message: 'CAG Stripe Webhooks endpoint is ready!',
    timestamp: new Date().toISOString()
  })
}