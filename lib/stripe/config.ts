import Stripe from 'stripe';

// Initialize Stripe with secret key (server-side only)
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

// Stripe publishable key for client-side
export const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!;

// Product and pricing configuration
export const STRIPE_PRODUCTS = {
  PREMIUM_MEMBERSHIP: {
    monthly: {
      priceId: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID!,
      amount: 2999, // $29.99
    },
    yearly: {
      priceId: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID!,
      amount: 19999, // $199.99 (save ~33%)
    },
  },
  FEATURED_JOB_POSTING: {
    single: {
      priceId: process.env.STRIPE_FEATURED_JOB_PRICE_ID!,
      amount: 4999, // $49.99
    },
    bundle_5: {
      priceId: process.env.STRIPE_FEATURED_JOB_BUNDLE_5_PRICE_ID!,
      amount: 19999, // $199.99 (5 posts)
    },
  },
  RESUME_REVIEW: {
    basic: {
      priceId: process.env.STRIPE_RESUME_BASIC_PRICE_ID!,
      amount: 7999, // $79.99
    },
    premium: {
      priceId: process.env.STRIPE_RESUME_PREMIUM_PRICE_ID!,
      amount: 14999, // $149.99
    },
  },
  INTERVIEW_COACHING: {
    session: {
      priceId: process.env.STRIPE_COACHING_SESSION_PRICE_ID!,
      amount: 9999, // $99.99
    },
    package_3: {
      priceId: process.env.STRIPE_COACHING_PACKAGE_3_PRICE_ID!,
      amount: 24999, // $249.99 (3 sessions)
    },
  },
} as const;

// Feature access levels
export const MEMBERSHIP_FEATURES = {
  FREE: {
    jobAlerts: 3,
    applications: 10,
    resumeViews: 1,
    mockInterviews: 2,
    searchFilters: 'basic',
    priority: 'low',
  },
  PREMIUM: {
    jobAlerts: 'unlimited',
    applications: 'unlimited',
    resumeViews: 'unlimited',
    mockInterviews: 'unlimited',
    searchFilters: 'advanced',
    priority: 'high',
    exclusiveJobs: true,
    resumeReviewDiscount: 0.2, // 20% off
    coachingDiscount: 0.15, // 15% off
  },
} as const;

export type MembershipTier = keyof typeof MEMBERSHIP_FEATURES;
export type StripeProduct = keyof typeof STRIPE_PRODUCTS;