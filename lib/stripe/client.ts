'use client'

import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

// Initialize Stripe.js with publishable key
export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
};

// Helper function to format currency
export const formatCurrency = (amount: number, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount / 100);
};

// Helper function to create checkout session
export const createCheckoutSession = async (params: {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  userId?: string;
  metadata?: Record<string, string>;
}) => {
  const response = await fetch('/api/stripe/checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error('Failed to create checkout session');
  }

  return response.json();
};

// Helper function to create customer portal session
export const createCustomerPortalSession = async (customerId: string) => {
  const response = await fetch('/api/stripe/customer-portal', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ customerId }),
  });

  if (!response.ok) {
    throw new Error('Failed to create customer portal session');
  }

  return response.json();
};

// Payment method types
export type PaymentMethod = 'card' | 'sepa_debit' | 'ideal' | 'bancontact';

// Subscription status types
export type SubscriptionStatus = 
  | 'incomplete'
  | 'incomplete_expired'
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid';

// Customer type
export interface StripeCustomer {
  id: string;
  email: string;
  name?: string;
  subscriptions: {
    id: string;
    status: SubscriptionStatus;
    priceId: string;
    currentPeriodEnd: number;
    cancelAtPeriodEnd: boolean;
  }[];
  paymentMethods: {
    id: string;
    type: PaymentMethod;
    last4?: string;
    brand?: string;
  }[];
}

// Checkout session type
export interface CheckoutSession {
  id: string;
  url: string;
  customer?: string;
  subscription?: string;
  payment_intent?: string;
}