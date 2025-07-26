'use client'

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Zap, Shield, Users } from 'lucide-react';
import { formatCurrency, createCheckoutSession, getStripe } from '@/lib/stripe/client';
import { STRIPE_PRODUCTS, MEMBERSHIP_FEATURES } from '@/lib/stripe/config';

interface PricingTableProps {
  userId?: string;
  currentTier?: 'FREE' | 'PREMIUM';
}

export default function PricingTable({ userId, currentTier = 'FREE' }: PricingTableProps) {
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string, planName: string) => {
    setLoading(priceId);
    
    try {
      const { url } = await createCheckoutSession({
        priceId,
        successUrl: '/dashboard/billing?success=true',
        cancelUrl: '/pricing?canceled=true',
        userId,
        metadata: {
          plan: planName,
          interval: billingInterval,
        },
      });

      const stripe = await getStripe();
      if (stripe && url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const plans = [
    {
      name: 'Free',
      tier: 'FREE' as const,
      description: 'Perfect for getting started',
      price: { monthly: 0, yearly: 0 },
      features: [
        `${MEMBERSHIP_FEATURES.FREE.jobAlerts} job alerts`,
        `Up to ${MEMBERSHIP_FEATURES.FREE.applications} applications`,
        `${MEMBERSHIP_FEATURES.FREE.resumeViews} resume review`,
        `${MEMBERSHIP_FEATURES.FREE.mockInterviews} mock interviews`,
        'Basic search filters',
        'Email support',
      ],
      cta: currentTier === 'FREE' ? 'Current Plan' : 'Downgrade',
      popular: false,
      icon: Users,
    },
    {
      name: 'Premium',
      tier: 'PREMIUM' as const,
      description: 'For serious job seekers',
      price: { 
        monthly: STRIPE_PRODUCTS.PREMIUM_MEMBERSHIP.monthly.amount, 
        yearly: STRIPE_PRODUCTS.PREMIUM_MEMBERSHIP.yearly.amount 
      },
      priceId: {
        monthly: STRIPE_PRODUCTS.PREMIUM_MEMBERSHIP.monthly.priceId,
        yearly: STRIPE_PRODUCTS.PREMIUM_MEMBERSHIP.yearly.priceId,
      },
      features: [
        'Unlimited job alerts',
        'Unlimited applications',
        'Unlimited resume reviews',
        'Unlimited mock interviews',
        'Advanced search filters',
        'Exclusive job postings',
        '20% off resume reviews',
        '15% off interview coaching',
        'Priority support',
        'Early access to new features',
      ],
      cta: currentTier === 'PREMIUM' ? 'Current Plan' : 'Upgrade Now',
      popular: true,
      icon: Star,
    },
  ];

  return (
    <div className="py-12">
      {/* Billing Toggle */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <button
            onClick={() => setBillingInterval('monthly')}
            className={`px-4 py-2 rounded-md transition-colors ${
              billingInterval === 'monthly'
                ? 'bg-white dark:bg-gray-700 shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingInterval('yearly')}
            className={`px-4 py-2 rounded-md transition-colors ${
              billingInterval === 'yearly'
                ? 'bg-white dark:bg-gray-700 shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Yearly
            <span className="ml-1 text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
              Save 33%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const price = plan.price[billingInterval];
          const priceId = plan.priceId?.[billingInterval];
          
          return (
            <motion.div
              key={plan.name}
              whileHover={{ scale: 1.02 }}
              className={`relative p-8 rounded-xl border-2 ${
                plan.popular
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <Icon className={`w-12 h-12 mx-auto mb-4 ${
                  plan.popular ? 'text-blue-500' : 'text-gray-600'
                }`} />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {plan.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  {plan.description}
                </p>
              </div>

              <div className="text-center mb-6">
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    {price === 0 ? 'Free' : formatCurrency(price)}
                  </span>
                  {price > 0 && (
                    <span className="text-gray-600 dark:text-gray-400 ml-2">
                      /{billingInterval === 'yearly' ? 'year' : 'month'}
                    </span>
                  )}
                </div>
                {billingInterval === 'yearly' && price > 0 && (
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    {formatCurrency(STRIPE_PRODUCTS.PREMIUM_MEMBERSHIP.monthly.amount * 12 - price)} saved per year
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => {
                  if (priceId && plan.tier !== currentTier) {
                    handleSubscribe(priceId, plan.name);
                  }
                }}
                disabled={!priceId || plan.tier === currentTier || loading === priceId}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  plan.tier === currentTier
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : plan.popular
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100'
                } ${loading === priceId ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading === priceId ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Processing...
                  </div>
                ) : (
                  plan.cta
                )}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Additional Services */}
      <div className="mt-16 max-w-6xl mx-auto">
        <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
          Professional Services
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ServiceCard
            icon={Shield}
            title="Resume Review"
            description="Professional resume review and optimization"
            prices={{
              basic: STRIPE_PRODUCTS.RESUME_REVIEW.basic.amount,
              premium: STRIPE_PRODUCTS.RESUME_REVIEW.premium.amount,
            }}
            priceIds={{
              basic: STRIPE_PRODUCTS.RESUME_REVIEW.basic.priceId,
              premium: STRIPE_PRODUCTS.RESUME_REVIEW.premium.priceId,
            }}
            onPurchase={handleSubscribe}
            loading={loading}
          />
          <ServiceCard
            icon={Zap}
            title="Interview Coaching"
            description="One-on-one interview preparation sessions"
            prices={{
              single: STRIPE_PRODUCTS.INTERVIEW_COACHING.session.amount,
              package: STRIPE_PRODUCTS.INTERVIEW_COACHING.package_3.amount,
            }}
            priceIds={{
              single: STRIPE_PRODUCTS.INTERVIEW_COACHING.session.priceId,
              package: STRIPE_PRODUCTS.INTERVIEW_COACHING.package_3.priceId,
            }}
            onPurchase={handleSubscribe}
            loading={loading}
          />
          <ServiceCard
            icon={Users}
            title="Featured Job Posting"
            description="For employers: Promote your job listings"
            prices={{
              single: STRIPE_PRODUCTS.FEATURED_JOB_POSTING.single.amount,
              bundle: STRIPE_PRODUCTS.FEATURED_JOB_POSTING.bundle_5.amount,
            }}
            priceIds={{
              single: STRIPE_PRODUCTS.FEATURED_JOB_POSTING.single.priceId,
              bundle: STRIPE_PRODUCTS.FEATURED_JOB_POSTING.bundle_5.priceId,
            }}
            onPurchase={handleSubscribe}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}

interface ServiceCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  prices: Record<string, number>;
  priceIds: Record<string, string>;
  onPurchase: (priceId: string, title: string) => void;
  loading: string | null;
}

function ServiceCard({ icon: Icon, title, description, prices, priceIds, onPurchase, loading }: ServiceCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
      <Icon className="w-8 h-8 text-blue-500 mb-4" />
      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h4>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        {description}
      </p>
      <div className="space-y-2">
        {Object.entries(prices).map(([type, price]) => (
          <button
            key={type}
            onClick={() => onPurchase(priceIds[type], `${title} - ${type}`)}
            disabled={loading === priceIds[type]}
            className="w-full text-left p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex justify-between items-center">
              <span className="capitalize font-medium">{type}</span>
              <span className="text-blue-500 font-semibold">
                {formatCurrency(price)}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}