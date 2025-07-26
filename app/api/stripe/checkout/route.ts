import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/config';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { priceId, successUrl, cancelUrl, userId, metadata = {} } = body;

    if (!priceId || !successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Get the origin from headers
    const headersList = headers();
    const origin = headersList.get('origin') || process.env.NEXT_PUBLIC_APP_URL;

    // Create customer or retrieve existing one
    let customerId: string | undefined;
    if (userId) {
      // In production, you'd fetch user data from your database
      // For now, we'll create a new customer or use existing logic
      const customers = await stripe.customers.list({
        metadata: { userId },
        limit: 1,
      });

      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      }
    }

    // Create Checkout Sessions
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: priceId.includes('month') || priceId.includes('year') ? 'subscription' : 'payment',
      success_url: `${origin}${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}${cancelUrl}`,
      metadata: {
        userId: userId || '',
        ...metadata,
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      customer_update: customerId ? {
        address: 'auto',
        name: 'auto',
      } : undefined,
      tax_id_collection: {
        enabled: true,
      },
    });

    return NextResponse.json({
      id: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}