import { NextRequest, NextResponse } from 'next/server'
import { subscriptionPlans } from '../plans/route'

// Mock user subscription data (will connect to real database later)
const mockUserSubscriptions = new Map([
  // Test users with different tiers
  ['user_free_1', { planId: 'free', status: 'active', currentPeriodEnd: null }],
  ['user_premium_1', { planId: 'premium', status: 'active', currentPeriodEnd: new Date('2025-10-13') }],
  ['user_enterprise_1', { planId: 'enterprise', status: 'active', currentPeriodEnd: new Date('2025-11-13') }],
])

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId parameter required' },
        { status: 400 }
      )
    }

    // Get user subscription (mock data for now)
    const subscription = mockUserSubscriptions.get(userId) || { 
      planId: 'free', 
      status: 'active', 
      currentPeriodEnd: null 
    }

    // Get plan details
    const plan = subscriptionPlans[subscription.planId as keyof typeof subscriptionPlans]
    
    // Check if subscription is active
    const isActive = subscription.status === 'active' && 
      (!subscription.currentPeriodEnd || subscription.currentPeriodEnd > new Date())

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        subscription: {
          planId: subscription.planId,
          planName: plan.name,
          status: subscription.status,
          isActive,
          currentPeriodEnd: subscription.currentPeriodEnd,
          features: plan.features,
          limits: plan.limits
        }
      }
    })

  } catch (error) {
    console.error('User tier check error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check user tier',
        user: {
          subscription: {
            planId: 'free',
            planName: 'CAG Explorer',
            status: 'active',
            isActive: true,
            features: subscriptionPlans.free.features,
            limits: subscriptionPlans.free.limits
          }
        }
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, action, feature } = await request.json()

    if (!userId || !action) {
      return NextResponse.json(
        { success: false, error: 'userId and action required' },
        { status: 400 }
      )
    }

    // Get user's current subscription
    const subscription = mockUserSubscriptions.get(userId) || { 
      planId: 'free', 
      status: 'active', 
      currentPeriodEnd: null 
    }

    const plan = subscriptionPlans[subscription.planId as keyof typeof subscriptionPlans]
    
    // Check specific feature access
    let hasAccess = false
    let message = ''

    switch (action) {
      case 'check_mock_interview':
        if (plan.limits.mockInterviews === -1) {
          hasAccess = true
          message = 'Unlimited mock interviews available'
        } else {
          // In real implementation, check actual usage count
          hasAccess = true // Simplified for demo
          message = `${plan.limits.mockInterviews} mock interviews per month`
        }
        break

      case 'check_premium_content':
        hasAccess = plan.limits.premiumContent
        message = hasAccess ? 'Premium content access granted' : 'Premium content requires upgrade'
        break

      case 'check_ai_analysis':
        hasAccess = plan.limits.aiAnalysis
        message = hasAccess ? 'AI analysis available' : 'AI analysis requires Premium or Enterprise plan'
        break

      case 'check_job_applications':
        if (plan.limits.jobApplications === -1) {
          hasAccess = true
          message = 'Unlimited job applications'
        } else {
          hasAccess = true // Simplified for demo
          message = `${plan.limits.jobApplications} job applications per month`
        }
        break

      default:
        message = 'Unknown feature check'
    }

    return NextResponse.json({
      success: true,
      access: {
        hasAccess,
        message,
        planId: subscription.planId,
        planName: plan.name,
        feature,
        upgradeRequired: !hasAccess
      }
    })

  } catch (error) {
    console.error('Feature access check error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check feature access' 
      },
      { status: 500 }
    )
  }
}