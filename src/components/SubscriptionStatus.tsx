import React, { useState, useEffect } from 'react';
import { Crown, Calendar, CreditCard, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getUserSubscription } from '../services/stripeService';
import { getProductByPriceId } from '../stripe-config';

const SubscriptionStatus: React.FC = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const subData = await getUserSubscription(user);
        setSubscription(subData);
      } catch (error: any) {
        setError('Failed to load subscription data');
        console.error('Error fetching subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [user]);

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
          <span className="text-slate-600 dark:text-gray-400">Loading subscription...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-6">
        <div className="flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          <span className="text-red-700 dark:text-red-300">{error}</span>
        </div>
      </div>
    );
  }

  const product = subscription?.price_id ? getProductByPriceId(subscription.price_id) : null;

  if (!subscription || !product) {
    return (
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <div>
              <h3 className="font-semibold text-amber-900 dark:text-amber-100">No Active Subscription</h3>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Subscribe to unlock advanced environmental monitoring features
              </p>
            </div>
          </div>
          <a
            href="/pricing"
            className="bg-amber-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-amber-700 transition-colors duration-200"
          >
            View Plans
          </a>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700 dark:text-emerald-300';
      case 'trialing':
        return 'text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300';
      case 'past_due':
        return 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-300';
      case 'canceled':
        return 'text-red-700 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300';
      default:
        return 'text-slate-700 bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'trialing':
        return <Crown className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Crown className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-gray-100">
            Current Plan
          </h3>
        </div>
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${getStatusColor(subscription.subscription_status)}`}>
          {getStatusIcon(subscription.subscription_status)}
          <span className="text-sm font-medium capitalize">
            {subscription.subscription_status.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-gray-100 text-xl">
            {product.name}
          </h4>
          <p className="text-slate-600 dark:text-gray-400 text-sm">
            {product.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <CreditCard className="w-5 h-5 text-slate-500 dark:text-gray-400" />
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-gray-100">
                ${product.price}/month
              </p>
              <p className="text-xs text-slate-600 dark:text-gray-400">
                {subscription.payment_method_brand ? 
                  `${subscription.payment_method_brand.toUpperCase()} •••• ${subscription.payment_method_last4}` :
                  'Payment method on file'
                }
              </p>
            </div>
          </div>

          {subscription.current_period_end && (
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-slate-500 dark:text-gray-400" />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-gray-100">
                  Next billing
                </p>
                <p className="text-xs text-slate-600 dark:text-gray-400">
                  {new Date(subscription.current_period_end * 1000).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </div>

        {subscription.cancel_at_period_end && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-3">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Your subscription will cancel at the end of the current billing period.
            </p>
          </div>
        )}

        <div className="flex space-x-3">
          <a
            href="/pricing"
            className="text-emerald-600 dark:text-emerald-400 hover:underline text-sm font-medium"
          >
            Change Plan
          </a>
          <a
            href="/billing"
            className="text-slate-600 dark:text-gray-400 hover:underline text-sm font-medium"
          >
            Billing History
          </a>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionStatus;