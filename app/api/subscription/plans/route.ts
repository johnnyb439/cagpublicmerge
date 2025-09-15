import { NextRequest, NextResponse } from 'next/server'

// CAG Subscription Plans - Enterprise Ready! 🚀
const subscriptionPlans = {
  free: {
    id: 'free',
    name: 'CAG Explorer',
    price: 0,
    priceId: null,
    interval: 'forever',
    features: [
      '5 Mock Interviews per month',
      'Basic job board access',
      'Standard question difficulty',
      'Email support',
      'CAG community access'
    ],
    limits: {
      mockInterviews: 5,
      jobApplications: 3,
      premiumContent: false,
      aiAnalysis: false
    },
    popular: false,
    description: 'Perfect for getting started with CAG'
  },
  premium: {
    id: 'premium',
    name: 'CAG Professional',
    price: 29,
    priceId: 'price_1S6vexK8Sx6It0G0Fh2KqMz3', // Real Stripe price ID
    interval: 'month',
    features: [
      'Unlimited Mock Interviews',
      'Full job board access with details',
      'AI-powered interview feedback',
      'Advanced difficulty questions',
      'Priority email support',
      'Downloadable resources',
      'Interview performance analytics',
      'Custom learning paths'
    ],
    limits: {
      mockInterviews: -1, // Unlimited
      jobApplications: -1,
      premiumContent: true,
      aiAnalysis: true
    },
    popular: true,
    description: 'Most popular for serious job seekers'
  },
  enterprise: {
    id: 'enterprise',
    name: 'CAG Enterprise',
    price: 99,
    priceId: 'price_enterprise_monthly', // Will be set from Stripe
    interval: 'month',
    features: [
      'Everything in Professional',
      'Team management dashboard',
      'Bulk user accounts',
      'Custom branding',
      'API access',
      'Dedicated account manager',
      'Custom integrations',
      'Advanced analytics',
      'Priority phone support',
      'Training workshops'
    ],
    limits: {
      mockInterviews: -1,
      jobApplications: -1,
      premiumContent: true,
      aiAnalysis: true,
      teamManagement: true,
      apiAccess: true
    },
    popular: false,
    description: 'For teams and organizations'
  }
}

export async function GET(request: NextRequest) {
  try {
    // Return all subscription plans
    return NextResponse.json({
      success: true,
      plans: subscriptionPlans,
      message: 'CAG subscription plans retrieved successfully'
    })
  } catch (error) {
    console.error('Error fetching subscription plans:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch subscription plans',
        plans: subscriptionPlans // Fallback to static plans
      },
      { status: 500 }
    )
  }
}