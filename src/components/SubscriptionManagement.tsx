import React, { useState, useEffect } from 'react';
import { Crown, CreditCard, Calendar, AlertCircle, CheckCircle, ExternalLink, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getUserSubscription, createCheckoutSession, type SubscriptionData } from '../services/stripeService';
import { stripeProducts, getProductByPriceId } from '../stripe-config';

const SubscriptionManagement: React.FC = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [upgradeLoading, setUpgradeLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setError('');
        const subData = await getUserSubscription(user);
        setSubscription(subData);
      } catch (error: any) {
        console.error('Error fetching subscription:', error);
        setError(error.message || 'Failed to load subscription data');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [user]);

  const handleUpgrade = async (priceId: string) => {
    if (!user) return;

    setUpgradeLoading(priceId);
    setError('');

    try {
      const { url } = await createCheckoutSession({
        priceId,
        mode: 'subscription',
        successUrl: `${window.location.origin}/success`,
        cancelUrl: `${window.location.origin}/pricing`
      });

      if (url) {
        window.location.href = url;
      }
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      setError(error.message || 'Failed to start upgrade process');
    } finally {
      setUpgradeLoading(null);
    }
  };

  const currentProduct = subscription?.price_id ? getProductByPriceId(subscription.price_id) : null;
  const availableUpgrades = stripeProducts.filter(product => 
    !currentProduct || product.price > currentProduct.price
  );

  if (!user) {
    return (
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-6">
        <div className="flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          <div>
            <h3 className="font-semibold text-amber-900 dark:text-amber-100">Sign In Required</h3>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Please sign in to manage your subscription
            </p>
          </div>
        </div>
      </div>
    );
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
          <div>
            <span className="text-red-700 dark:text-red-300 font-medium">Error loading subscription</span>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      {currentProduct ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Crown className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-gray-100">
                Current Plan
              </h3>
            </div>
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${
              subscription?.subscription_status === 'active' 
                ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-700'
                : 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-700'
            }`}>
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium capitalize">
                {subscription?.subscription_status?.replace('_', ' ') || 'Unknown'}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-gray-100 text-xl">
                {currentProduct.name}
              </h4>
              <p className="text-slate-600 dark:text-gray-400 text-sm">
                {currentProduct.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <CreditCard className="w-5 h-5 text-slate-500 dark:text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-gray-100">
                    ${currentProduct.price}/month
                  </p>
                  <p className="text-xs text-slate-600 dark:text-gray-400">
                    {subscription?.payment_method_brand ? 
                      `${subscription.payment_method_brand.toUpperCase()} •••• ${subscription.payment_method_last4}` :
                      'Payment method on file'
                    }
                  </p>
                </div>
              </div>

              {subscription?.current_period_end && (
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

            {subscription?.cancel_at_period_end && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-3">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Your subscription will cancel at the end of the current billing period.
                </p>
              </div>
            )}

            <div className="flex space-x-3">
              <a
                href="https://billing.stripe.com/p/login/test_28o5nC0Ql2Hl0Za288"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 hover:underline text-sm font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Manage Billing</span>
              </a>
            </div>
          </div>
        </div>
      ) : (
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
      )}

      {/* Available Upgrades */}
      {currentProduct && availableUpgrades.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-gray-100 mb-6">
            Available Upgrades
          </h3>

          <div className="space-y-6">
            {availableUpgrades.map((product) => (
              <div 
                key={product.id}
                className="p-4 border border-slate-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-gray-100">{product.name}</h4>
                    <p className="text-sm text-slate-600 dark:text-gray-400">{product.description}</p>
                  </div>
                  <div className="text-xl font-bold text-slate-900 dark:text-gray-100">
                    ${product.price}<span className="text-sm font-normal text-slate-600 dark:text-gray-400">/mo</span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {product.features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700 dark:text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleUpgrade(product.priceId)}
                  disabled={upgradeLoading === product.priceId}
                  className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-medium hover:from-emerald-700 hover:to-teal-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {upgradeLoading === product.priceId ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    'Upgrade Now'
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionManagement;