'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Crown, 
  Zap, 
  Calendar, 
  TrendingUp, 
  Settings,
  ExternalLink,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'

interface UserSubscription {
  planId: string
  planName: string
  status: string
  isActive: boolean
  currentPeriodEnd?: Date | null
  features: string[]
  limits: {
    mockInterviews: number
    jobApplications: number
    premiumContent: boolean
    aiAnalysis: boolean
  }
}

interface UserTierResponse {
  success: boolean
  user: {
    id: string
    subscription: UserSubscription
  }
}

interface SubscriptionStatusProps {
  userId?: string
  className?: string
}

export default function SubscriptionStatus({ 
  userId = 'user_premium_1', // Default test user
  className = '' 
}: SubscriptionStatusProps) {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [usageStats] = useState({
    mockInterviewsUsed: 8,
    jobApplicationsUsed: 12,
    performanceScore: 85
  })

  useEffect(() => {
    fetchUserTier()
  }, [userId])

  const fetchUserTier = async () => {
    try {
      const response = await fetch(`/api/subscription/user-tier?userId=${userId}`)
      const data: UserTierResponse = await response.json()
      
      if (data.success) {
        setSubscription(data.user.subscription)
      }
    } catch (error) {
      console.error('Error fetching user tier:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPlanIcon = () => {
    if (!subscription) return <Sparkles className="w-5 h-5" />
    
    switch (subscription.planId) {
      case 'premium':
        return <Crown className="w-5 h-5 text-yellow-500" />
      case 'enterprise':
        return <Zap className="w-5 h-5 text-purple-500" />
      default:
        return <Sparkles className="w-5 h-5 text-blue-500" />
    }
  }

  const getPlanColor = () => {
    if (!subscription) return 'bg-blue-100 text-blue-800'
    
    switch (subscription.planId) {
      case 'premium':
        return 'bg-yellow-100 text-yellow-800'
      case 'enterprise':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return 'Never expires'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0 // Unlimited
    return Math.min((used / limit) * 100, 100)
  }

  if (loading) {
    return (
      <Card className={`animate-pulse ${className}`}>
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!subscription) {
    return (
      <Card className={`border-red-200 ${className}`}>
        <CardContent className="pt-6">
          <p className="text-red-600">Unable to load subscription status</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getPlanIcon()}
            <div>
              <CardTitle className="text-lg">{subscription.planName}</CardTitle>
              <CardDescription>Current subscription plan</CardDescription>
            </div>
          </div>
          <Badge className={getPlanColor()}>
            {subscription.status === 'active' ? 'Active' : subscription.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Plan Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Renews: {formatDate(subscription.currentPeriodEnd)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <TrendingUp className="w-4 h-4" />
            <span>Performance: {usageStats.performanceScore}%</span>
          </div>
        </div>

        {/* Usage Stats */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Usage This Month</h4>
          
          {/* Mock Interviews */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Mock Interviews</span>
              <span>
                {usageStats.mockInterviewsUsed}
                {subscription.limits.mockInterviews === -1 
                  ? ' (Unlimited)' 
                  : ` / ${subscription.limits.mockInterviews}`
                }
              </span>
            </div>
            <Progress 
              value={getUsagePercentage(usageStats.mockInterviewsUsed, subscription.limits.mockInterviews)} 
              className="h-2"
            />
          </div>

          {/* Job Applications */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Job Applications</span>
              <span>
                {usageStats.jobApplicationsUsed}
                {subscription.limits.jobApplications === -1 
                  ? ' (Unlimited)' 
                  : ` / ${subscription.limits.jobApplications}`
                }
              </span>
            </div>
            <Progress 
              value={getUsagePercentage(usageStats.jobApplicationsUsed, subscription.limits.jobApplications)} 
              className="h-2"
            />
          </div>
        </div>

        {/* Features */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Plan Features</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className={`flex items-center gap-2 ${subscription.limits.premiumContent ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-2 h-2 rounded-full ${subscription.limits.premiumContent ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              Premium Content
            </div>
            <div className={`flex items-center gap-2 ${subscription.limits.aiAnalysis ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-2 h-2 rounded-full ${subscription.limits.aiAnalysis ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              AI Analysis
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          {subscription.planId === 'free' ? (
            <Link href="/subscription" className="flex-1">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                <Crown className="w-4 h-4 mr-2" />
                Upgrade Plan
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/subscription" className="flex-1">
                <Button variant="outline" className="w-full">
                  <Settings className="w-4 h-4 mr-2" />
                  Manage Plan
                </Button>
              </Link>
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}