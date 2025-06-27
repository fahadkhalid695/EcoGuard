import React, { useEffect, useState } from 'react';
import { CheckCircle, ArrowRight, Download, Calendar, CreditCard } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getUserSubscription } from '../services/stripeService';
import { getProductByPriceId } from '../stripe-config';

const SuccessPage: React.FC = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const subData = await getUserSubscription(user);
        setSubscription(subData);
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [user]);

  const product = subscription?.price_id ? getProductByPriceId(subscription.price_id) : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-emerald-700">Loading your subscription details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mb-6">
            <CheckCircle className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-heading font-bold text-slate-900 dark:text-gray-100 mb-4">
            Welcome to EcoGuard Pro!
          </h1>
          <p className="text-xl text-slate-600 dark:text-gray-400 max-w-2xl mx-auto">
            Your subscription has been successfully activated. You now have access to advanced environmental monitoring features.
          </p>
        </div>

        {/* Subscription Details */}
        {product && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-gray-100">
                Subscription Details
              </h2>
              <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 px-4 py-2 rounded-full text-sm font-semibold">
                Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-gray-100 mb-4">
                  {product.name}
                </h3>
                <p className="text-slate-600 dark:text-gray-400 mb-4">
                  {product.description}
                </p>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold text-slate-900 dark:text-gray-100">
                    ${product.price}
                  </span>
                  <span className="text-slate-600 dark:text-gray-400">/month</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-5 h-5 text-slate-500 dark:text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-gray-100">
                      Payment Method
                    </p>
                    <p className="text-sm text-slate-600 dark:text-gray-400">
                      {subscription?.payment_method_brand ? 
                        `${subscription.payment_method_brand.toUpperCase()} •••• ${subscription.payment_method_last4}` :
                        'Card on file'
                      }
                    </p>
                  </div>
                </div>

                {subscription?.current_period_end && (
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-slate-500 dark:text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-gray-100">
                        Next Billing Date
                      </p>
                      <p className="text-sm text-slate-600 dark:text-gray-400">
                        {new Date(subscription.current_period_end * 1000).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Features Unlocked */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-gray-100 mb-6">
            Features Now Available
          </h2>
          
          {product && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center mt-0.5">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-slate-700 dark:text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl p-8 text-white mb-8">
          <h2 className="text-2xl font-heading font-bold mb-6">What's Next?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">1</span>
              </div>
              <h3 className="font-semibold mb-2">Explore Your Dashboard</h3>
              <p className="text-emerald-100 text-sm">
                Access real-time environmental data and AI-powered insights
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">2</span>
              </div>
              <h3 className="font-semibold mb-2">Set Up Alerts</h3>
              <p className="text-emerald-100 text-sm">
                Configure custom notifications for environmental thresholds
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">3</span>
              </div>
              <h3 className="font-semibold mb-2">Download Reports</h3>
              <p className="text-emerald-100 text-sm">
                Export your environmental data for analysis and compliance
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="flex items-center justify-center space-x-2 bg-emerald-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-emerald-700 transition-colors duration-200"
          >
            <span>Go to Dashboard</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={() => window.location.href = '/reports'}
            className="flex items-center justify-center space-x-2 border-2 border-emerald-600 text-emerald-600 dark:text-emerald-400 px-8 py-4 rounded-xl font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors duration-200"
          >
            <Download className="w-5 h-5" />
            <span>Download Sample Report</span>
          </button>
        </div>

        {/* Support Information */}
        <div className="text-center mt-12 p-6 bg-slate-100 dark:bg-gray-700 rounded-xl">
          <h3 className="font-semibold text-slate-900 dark:text-gray-100 mb-2">
            Need Help Getting Started?
          </h3>
          <p className="text-slate-600 dark:text-gray-400 mb-4">
            Our support team is here to help you make the most of your EcoGuard Pro subscription.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:fahadkhalid695@gmail.com"
              className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
            >
              Contact Support
            </a>
            <a
              href="/docs"
              className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
            >
              View Documentation
            </a>
          </div>
        </div>
        
        {/* Powered by Bolt */}
        <div className="mt-12 text-center">
          <a 
            href="https://bolt.new/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block transition-transform hover:scale-105"
          >
            <img 
              src="/white_circle_360x360.png" 
              alt="Powered by Bolt" 
              className="h-16 w-auto"
            />
          </a>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;