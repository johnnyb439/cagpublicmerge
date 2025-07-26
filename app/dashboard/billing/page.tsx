'use client'

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  Calendar, 
  Check, 
  AlertCircle, 
  ExternalLink,
  Download,
  Settings
} from 'lucide-react';
import { createCustomerPortalSession, formatCurrency } from '@/lib/stripe/client';

// Mock data - in production, fetch from your database
const mockSubscription = {
  id: 'sub_123456789',
  status: 'active' as const,
  plan: 'Premium',
  amount: 2999,
  interval: 'month' as const,
  currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  cancelAtPeriodEnd: false,
};

const mockPaymentMethods = [
  {
    id: 'pm_123456789',
    type: 'card' as const,
    brand: 'visa',
    last4: '4242',
    expMonth: 12,
    expYear: 2025,
    isDefault: true,
  },
];

const mockInvoices = [
  {
    id: 'in_123456789',
    date: new Date('2024-01-01'),
    amount: 2999,
    status: 'paid' as const,
    downloadUrl: '#',
  },
  {
    id: 'in_123456788',
    date: new Date('2023-12-01'),
    amount: 2999,
    status: 'paid' as const,
    downloadUrl: '#',
  },
];

export default function BillingPage() {
  const [loading, setLoading] = useState(false);
  const [customerId] = useState('cus_mock_customer_id'); // In production, get from user data

  const handleOpenCustomerPortal = async () => {
    setLoading(true);
    try {
      const { url } = await createCustomerPortalSession(customerId);
      window.location.href = url;
    } catch (error) {
      console.error('Failed to open customer portal:', error);
      alert('Unable to open billing portal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      active: 'bg-green-100 text-green-800',
      past_due: 'bg-yellow-100 text-yellow-800',
      canceled: 'bg-red-100 text-red-800',
      incomplete: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors] || statusColors.incomplete}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Billing & Subscription
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your subscription, payment methods, and billing history.
        </p>
      </div>

      {/* Current Subscription */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Current Plan
          </h2>
          {getStatusBadge(mockSubscription.status)}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Plan</p>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {mockSubscription.plan}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Amount</p>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {formatCurrency(mockSubscription.amount)}/{mockSubscription.interval}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Next Billing Date</p>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {mockSubscription.currentPeriodEnd.toLocaleDateString()}
            </p>
          </div>
        </div>

        {mockSubscription.cancelAtPeriodEnd && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-500 mr-2" />
              <p className="text-yellow-700 dark:text-yellow-300">
                Your subscription will cancel on {mockSubscription.currentPeriodEnd.toLocaleDateString()}.
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 flex gap-4">
          <button
            onClick={handleOpenCustomerPortal}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            {loading ? 'Loading...' : 'Manage Subscription'}
          </button>
          <button className="border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-medium transition-colors">
            Change Plan
          </button>
        </div>
      </motion.div>

      {/* Payment Methods */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Payment Methods
          </h2>
          <button className="text-blue-500 hover:text-blue-600 font-medium">
            Add Payment Method
          </button>
        </div>

        <div className="space-y-3">
          {mockPaymentMethods.map((method) => (
            <div
              key={method.id}
              className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg"
            >
              <div className="flex items-center">
                <CreditCard className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    •••• •••• •••• {method.last4}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {method.brand.toUpperCase()} • Expires {method.expMonth}/{method.expYear}
                  </p>
                </div>
                {method.isDefault && (
                  <span className="ml-3 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                    Default
                  </span>
                )}
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                •••
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Billing History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Billing History
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Date
                </th>
                <th className="text-left py-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Amount
                </th>
                <th className="text-left py-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Status
                </th>
                <th className="text-left py-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Invoice
                </th>
              </tr>
            </thead>
            <tbody>
              {mockInvoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 text-gray-900 dark:text-white">
                    {invoice.date.toLocaleDateString()}
                  </td>
                  <td className="py-3 text-gray-900 dark:text-white">
                    {formatCurrency(invoice.amount)}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center">
                      <Check className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-green-600 dark:text-green-400 capitalize">
                        {invoice.status}
                      </span>
                    </div>
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => window.open(invoice.downloadUrl, '_blank')}
                      className="text-blue-500 hover:text-blue-600 flex items-center"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Usage & Limits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Current Usage
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UsageCard
            title="Job Alerts"
            current={5}
            limit="Unlimited"
            description="Active job alerts"
          />
          <UsageCard
            title="Applications"
            current={23}
            limit="Unlimited"
            description="Applications this month"
          />
          <UsageCard
            title="Resume Reviews"
            current={2}
            limit="Unlimited"
            description="Reviews used this month"
          />
          <UsageCard
            title="Mock Interviews"
            current={8}
            limit="Unlimited"
            description="Practice sessions completed"
          />
        </div>
      </motion.div>
    </div>
  );
}

interface UsageCardProps {
  title: string;
  current: number;
  limit: string | number;
  description: string;
}

function UsageCard({ title, current, limit, description }: UsageCardProps) {
  const percentage = typeof limit === 'number' ? (current / limit) * 100 : 0;
  const isUnlimited = limit === 'Unlimited';

  return (
    <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {current} / {limit}
        </span>
      </div>
      
      {!isUnlimited && (
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
          <div
            className="bg-blue-500 h-2 rounded-full"
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      )}
      
      <p className="text-xs text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}