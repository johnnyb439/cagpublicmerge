'use client'

import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Check, Star, Zap, Shield, Users, Sparkles } from 'lucide-react'

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface Plan {
  id: string
  name: string
  price: number
  priceId: string | null
  interval: string
  features: string[]
  popular: boolean
  description: string
}

interface PlansResponse {
  success: boolean
  plans: {
    free: Plan
    premium: Plan
    enterprise: Plan
  }
}

export default function SubscriptionPage() {
  const [plans, setPlans] = useState<PlansResponse['plans'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/subscription/plans')
      const data: PlansResponse = await response.json()
      
      if (data.success) {
        setPlans(data.plans)
      }
    } catch (error) {
      console.error('Error fetching plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async (planId: string) => {
    if (planId === 'free') return // Free plan doesn't need checkout
    
    setCheckoutLoading(planId)
    
    try {
      const plan = plans![planId as keyof typeof plans]
      
      // Mock user data (in real app, get from auth context)
      const mockUser = {
        id: 'user_123',
        email: 'test@cag.com'
      }

      const response = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.priceId,
          userId: mockUser.id,
          email: mockUser.email,
          planId: planId,
        }),
      })

      const data = await response.json()

      if (data.success && data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url
      } else {
        alert('Failed to create checkout session: ' + data.error)
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to start checkout process')
    } finally {
      setCheckoutLoading(null)
    }
  }

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'free':
        return <Sparkles className="w-6 h-6 text-blue-500" />
      case 'premium':
        return <Star className="w-6 h-6 text-yellow-500" />
      case 'enterprise':
        return <Shield className="w-6 h-6 text-purple-500" />
      default:
        return <Zap className="w-6 h-6" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading subscription plans...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your CAG Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Unlock your potential with the perfect plan for your career journey. 
            From getting started to enterprise solutions, we've got you covered.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans && Object.entries(plans).map(([key, plan]) => (
            <div 
              key={key} 
              className={`relative bg-white rounded-xl p-8 ${
                plan.popular 
                  ? 'border-2 border-blue-500 shadow-2xl scale-105' 
                  : 'border border-gray-200 shadow-lg hover:shadow-xl'
              } transition-all duration-300`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
              )}
              
              <div className="text-center pb-8 pt-6">
                <div className="flex justify-center mb-4">
                  {getPlanIcon(key)}
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                <p className="text-sm text-gray-600 mt-2">{plan.description}</p>
                
                <div className="mt-4">
                  <div className="text-5xl font-bold text-gray-900">
                    ${plan.price}
                    {plan.price > 0 && (
                      <span className="text-lg font-normal text-gray-500">
                        /{plan.interval}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 mb-8">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="pt-4">
                <button
                  onClick={() => handleSubscribe(key)}
                  disabled={checkoutLoading === key}
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-300 ${
                    plan.popular
                      ? 'btn-cag-gradient cag-glow text-white hover:opacity-90'
                      : 'bg-gray-900 hover:bg-gray-800 text-white'
                  } ${checkoutLoading === key ? 'opacity-50 cursor-not-allowed' : 'hover:transform hover:scale-105'}`}
                >
                  {checkoutLoading === key ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Processing...
                    </div>
                  ) : (
                    <>
                      {key === 'free' ? 'Get Started Free' : `Subscribe to ${plan.name}`}
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Features Comparison */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Why Choose CAG Professional?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <Users className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Expert Community</h3>
              <p className="text-gray-600">Connect with security professionals and get insider insights</p>
            </div>
            
            <div className="text-center">
              <Zap className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">AI-Powered Feedback</h3>
              <p className="text-gray-600">Get instant, personalized feedback to improve your interview skills</p>
            </div>
            
            <div className="text-center">
              <Shield className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Security Cleared Jobs</h3>
              <p className="text-gray-600">Access exclusive opportunities requiring security clearances</p>
            </div>
          </div>
        </div>

        {/* Money Back Guarantee */}
        <div className="mt-12 text-center bg-white rounded-xl p-8 shadow-lg max-w-2xl mx-auto">
          <Shield className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">30-Day Money Back Guarantee</h3>
          <p className="text-gray-600">
            Try CAG Professional risk-free. If you're not completely satisfied, 
            we'll refund your money within 30 days. No questions asked.
          </p>
        </div>
      </div>
    </div>
  )
}