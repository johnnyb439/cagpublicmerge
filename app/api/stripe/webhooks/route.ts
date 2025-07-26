import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/config';
import { headers } from 'next/headers';
import Stripe from 'stripe';

// This webhook endpoint handles Stripe events
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCreated(subscription);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout completed:', session.id);
  
  // Update user's subscription status in your database
  // This is where you'd integrate with Supabase or your preferred database
  
  if (session.metadata?.userId) {
    // Example: Update user's membership tier
    // await updateUserMembership(session.metadata.userId, 'premium');
    console.log(`User ${session.metadata.userId} upgraded to premium`);
  }

  // Send confirmation email
  // await sendConfirmationEmail(session.customer_email, session);
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('Subscription created:', subscription.id);
  
  // Update user's subscription in database
  const customerId = subscription.customer as string;
  
  // Example database update
  // await updateUserSubscription(customerId, {
  //   subscriptionId: subscription.id,
  //   status: subscription.status,
  //   priceId: subscription.items.data[0].price.id,
  //   currentPeriodEnd: new Date(subscription.current_period_end * 1000),
  // });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Subscription updated:', subscription.id);
  
  // Update subscription status in database
  const customerId = subscription.customer as string;
  
  // Handle subscription changes (upgrade/downgrade, payment method update, etc.)
  // await updateUserSubscription(customerId, {
  //   status: subscription.status,
  //   priceId: subscription.items.data[0].price.id,
  //   currentPeriodEnd: new Date(subscription.current_period_end * 1000),
  //   cancelAtPeriodEnd: subscription.cancel_at_period_end,
  // });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Subscription deleted:', subscription.id);
  
  // Downgrade user to free tier
  const customerId = subscription.customer as string;
  
  // await updateUserMembership(customerId, 'free');
  // await sendCancellationEmail(customerId);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Payment succeeded:', invoice.id);
  
  // Update payment history
  // Send receipt email
  // Extend subscription period if applicable
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Payment failed:', invoice.id);
  
  // Notify user of failed payment
  // Update subscription status
  // Send dunning email
}

// Helper functions for database operations (implement based on your database choice)
// async function updateUserMembership(userId: string, tier: string) {
//   // Implementation depends on your database
// }

// async function updateUserSubscription(customerId: string, data: any) {
//   // Implementation depends on your database
// }

// async function sendConfirmationEmail(email: string, session: Stripe.Checkout.Session) {
//   // Implementation depends on your email service
// }