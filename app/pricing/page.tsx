'use client'

import React from 'react';
import { motion } from 'framer-motion';
import PricingTable from '@/components/stripe/PricingTable';
import { CheckCircle, X } from 'lucide-react';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Unlock your career potential with our comprehensive job search platform
            designed specifically for cleared professionals.
          </p>
        </motion.div>

        {/* Success/Cancel Messages */}
        <SuccessMessage />
        <CancelMessage />

        {/* Pricing Table */}
        <PricingTable />

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Frequently Asked Questions
          </h2>
          <div className="max-w-4xl mx-auto">
            <FAQItem
              question="Can I cancel my subscription anytime?"
              answer="Yes, you can cancel your subscription at any time. Your access will continue until the end of your current billing period."
            />
            <FAQItem
              question="What payment methods do you accept?"
              answer="We accept all major credit cards (Visa, MasterCard, American Express) and support secure payments through Stripe."
            />
            <FAQItem
              question="Is there a free trial?"
              answer="We offer a generous free tier that includes 3 job alerts, 10 applications, and basic features. You can always upgrade when you're ready."
            />
            <FAQItem
              question="Do you offer refunds?"
              answer="We offer a 30-day money-back guarantee for all premium subscriptions. Contact support if you're not satisfied."
            />
            <FAQItem
              question="What happens to my data if I cancel?"
              answer="Your data remains accessible for 30 days after cancellation. You can reactivate anytime during this period to restore full access."
            />
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Have questions? {' '}
            <a 
              href="/contact" 
              className="text-blue-500 hover:text-blue-600 font-medium"
            >
              Contact our support team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

function SuccessMessage() {
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const success = searchParams.get('success');

  if (!success) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mb-8 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4"
    >
      <div className="flex items-center">
        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
        <div>
          <h3 className="text-lg font-medium text-green-900 dark:text-green-100">
            Payment Successful!
          </h3>
          <p className="text-green-700 dark:text-green-300">
            Welcome to your premium membership. You now have access to all premium features.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function CancelMessage() {
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const canceled = searchParams.get('canceled');

  if (!canceled) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mb-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4"
    >
      <div className="flex items-center">
        <X className="w-5 h-5 text-yellow-500 mr-3" />
        <div>
          <h3 className="text-lg font-medium text-yellow-900 dark:text-yellow-100">
            Payment Canceled
          </h3>
          <p className="text-yellow-700 dark:text-yellow-300">
            No worries! You can upgrade to premium anytime to unlock all features.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

interface FAQItemProps {
  question: string;
  answer: string;
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 text-left flex justify-between items-center hover:text-blue-500 transition-colors"
      >
        <span className="font-medium text-gray-900 dark:text-white">{question}</span>
        <span className="text-2xl">{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="pb-4"
        >
          <p className="text-gray-600 dark:text-gray-400">{answer}</p>
        </motion.div>
      )}
    </div>
  );
}