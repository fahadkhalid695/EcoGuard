import React, { useState, useEffect } from 'react';
import { Check, Star, Zap, Shield, ArrowRight, Loader2, ArrowLeft, Mail, MapPin } from 'lucide-react';
import { stripeProducts } from '../stripe-config';
import { useAuth } from '../hooks/useAuth';
import { createCheckoutSession } from '../services/stripeService';

const PricingPage: React.FC = () => {
  const { user } = useAuth();
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  const handleSubscribe = async (priceId: string) => {
    if (!user) {
      setError('Please sign in to subscribe to a plan');
      return;
    }

    setLoadingPriceId(priceId);
    setError(null);

    try {
      console.log('Creating checkout session for price:', priceId);
      
      const { url } = await createCheckoutSession({
        priceId,
        mode: 'subscription',
        successUrl: `${window.location.origin}/success`,
        cancelUrl: `${window.location.origin}/pricing`
      });

      if (url) {
        console.log('Redirecting to checkout:', url);
        window.location.href = url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      setError(error.message || 'Failed to create checkout session. Please try again.');
    } finally {
      setLoadingPriceId(null);
    }
  };

  const getPlanIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Shield className="w-8 h-8 text-emerald-600 dark:text-emerald-500" />;
      case 1:
        return <Zap className="w-8 h-8 text-blue-600 dark:text-blue-500" />;
      case 2:
        return <Star className="w-8 h-8 text-purple-600 dark:text-purple-500" />;
      default:
        return <Shield className="w-8 h-8 text-emerald-600 dark:text-emerald-500" />;
    }
  };

  const getPlanColor = (index: number) => {
    switch (index) {
      case 0:
        return {
          gradient: 'from-emerald-500 to-green-600',
          bg: 'from-emerald-50 to-green-50',
          darkBg: 'from-emerald-900/30 to-green-900/30',
          border: 'border-emerald-200',
          darkBorder: 'dark:border-emerald-800',
          text: 'text-emerald-700',
          darkText: 'dark:text-emerald-400'
        };
      case 1:
        return {
          gradient: 'from-blue-500 to-cyan-600',
          bg: 'from-blue-50 to-cyan-50',
          darkBg: 'from-blue-900/30 to-cyan-900/30',
          border: 'border-blue-200',
          darkBorder: 'dark:border-blue-800',
          text: 'text-blue-700',
          darkText: 'dark:text-blue-400'
        };
      case 2:
        return {
          gradient: 'from-purple-500 to-indigo-600',
          bg: 'from-purple-50 to-indigo-50',
          darkBg: 'from-purple-900/30 to-indigo-900/30',
          border: 'border-purple-200',
          darkBorder: 'dark:border-purple-800',
          text: 'text-purple-700',
          darkText: 'dark:text-purple-400'
        };
      default:
        return {
          gradient: 'from-emerald-500 to-green-600',
          bg: 'from-emerald-50 to-green-50',
          darkBg: 'from-emerald-900/30 to-green-900/30',
          border: 'border-emerald-200',
          darkBorder: 'dark:border-emerald-800',
          text: 'text-emerald-700',
          darkText: 'dark:text-emerald-400'
        };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Button */}
        <div className="mb-12">
          <button
            onClick={() => window.history.back()}
            className="flex items-center space-x-2 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200 transition-colors duration-200 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="font-medium">Back to Dashboard</span>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Error
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-6xl font-heading font-bold text-slate-900 dark:text-gray-100 mb-6">
            Choose Your Environmental Plan
          </h1>
          <p className="text-xl text-slate-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Select the perfect plan for your environmental monitoring needs. All plans include real-time data, 
            AI-powered insights, and secure cloud storage.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {stripeProducts.map((product, index) => {
            const colors = getPlanColor(index);
            const isLoading = loadingPriceId === product.priceId;

            return (
              <div
                key={product.id}
                className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 ${
                  index === 1 ? 'border-blue-500 dark:border-blue-600 z-10' : `${colors.border} ${colors.darkBorder} dark:border-gray-700`
                } overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105`}
              >
                <div className="p-8">
                  {/* Plan Icon and Name */}
                  <div className="text-center mb-8">
                    <div className={`inline-flex p-4 bg-gradient-to-r ${colors.bg} ${colors.darkBg} dark:from-gray-700 dark:to-gray-600 rounded-2xl mb-4`}>
                      {getPlanIcon(index)}
                    </div>
                    <h3 className="text-2xl font-heading font-bold text-slate-900 dark:text-gray-100 mb-2">
                      {product.name}
                    </h3>
                    <p className="text-slate-600 dark:text-gray-400 text-sm">
                      {product.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="text-center mb-8">
                    <div className="flex items-baseline justify-center">
                      <span className="text-5xl font-bold text-slate-900 dark:text-gray-100">
                        ${product.price}
                      </span>
                      <span className="text-slate-600 dark:text-gray-400 ml-2">/month</span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-gray-500 mt-2">
                      Billed monthly, cancel anytime
                    </p>
                  </div>

                  {/* Features */}
                  <div className="space-y-4 mb-8">
                    {product.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start space-x-3">
                        <div className={`flex-shrink-0 w-5 h-5 bg-gradient-to-r ${colors.gradient} rounded-full flex items-center justify-center mt-0.5`}>
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className={`${colors.text} ${colors.darkText} text-sm leading-relaxed`}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleSubscribe(product.priceId)}
                    disabled={isLoading || !user}
                    className={`w-full flex items-center justify-center space-x-2 py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
                      index === 1
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white hover:from-blue-600 hover:to-cyan-700 shadow-lg hover:shadow-xl'
                        : `bg-gradient-to-r ${colors.gradient} text-white hover:shadow-lg`
                    } disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <span>{user ? 'Get Started' : 'Sign In to Subscribe'}</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>

                  {!user && (
                    <p className="text-center text-sm text-slate-500 dark:text-gray-500 mt-4">
                      Please sign in to subscribe to a plan
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Features Comparison */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold text-slate-900 dark:text-gray-100 mb-4">
              Compare All Features
            </h2>
            <p className="text-slate-600 dark:text-gray-400">
              See what's included in each plan to make the best choice for your needs
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-gray-700 dark:to-gray-600">
                    <th className="text-left py-6 px-6 font-semibold text-slate-900 dark:text-gray-100">
                      Features
                    </th>
                    {stripeProducts.map((product) => (
                      <th key={product.id} className="text-center py-6 px-6 font-semibold text-slate-900 dark:text-gray-100">
                        {product.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
                  <tr>
                    <td className="py-4 px-6 font-medium text-slate-900 dark:text-gray-100">
                      Real-time pollution data
                    </td>
                    <td className="py-4 px-6 text-center">
                      <Check className="w-5 h-5 text-emerald-600 mx-auto" />
                    </td>
                    <td className="py-4 px-6 text-center">
                      <Check className="w-5 h-5 text-emerald-600 mx-auto" />
                    </td>
                    <td className="py-4 px-6 text-center">
                      <Check className="w-5 h-5 text-emerald-600 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 font-medium text-slate-900 dark:text-gray-100">
                      Historical data retention
                    </td>
                    <td className="py-4 px-6 text-center text-slate-600 dark:text-gray-400">
                      1 month
                    </td>
                    <td className="py-4 px-6 text-center text-slate-600 dark:text-gray-400">
                      1 year
                    </td>
                    <td className="py-4 px-6 text-center text-slate-600 dark:text-gray-400">
                      5 years
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 font-medium text-slate-900 dark:text-gray-100">
                      Data export options
                    </td>
                    <td className="py-4 px-6 text-center text-slate-600 dark:text-gray-400">
                      Limited
                    </td>
                    <td className="py-4 px-6 text-center text-slate-600 dark:text-gray-400">
                      CSV, Excel
                    </td>
                    <td className="py-4 px-6 text-center text-slate-600 dark:text-gray-400">
                      CSV, Excel, API
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 font-medium text-slate-900 dark:text-gray-100">
                      Customer support
                    </td>
                    <td className="py-4 px-6 text-center text-slate-600 dark:text-gray-400">
                      Standard
                    </td>
                    <td className="py-4 px-6 text-center text-slate-600 dark:text-gray-400">
                      Priority
                    </td>
                    <td className="py-4 px-6 text-center text-slate-600 dark:text-gray-400">
                      Priority
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 font-medium text-slate-900 dark:text-gray-100">
                      Quarterly reports
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="text-slate-400 dark:text-gray-600">—</span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="text-slate-400 dark:text-gray-600">—</span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <Check className="w-5 h-5 text-emerald-600 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 font-medium text-slate-900 dark:text-gray-100">
                      AI-powered predictions
                    </td>
                    <td className="py-4 px-6 text-center text-slate-600 dark:text-gray-400">
                      Basic
                    </td>
                    <td className="py-4 px-6 text-center text-slate-600 dark:text-gray-400">
                      Advanced
                    </td>
                    <td className="py-4 px-6 text-center text-slate-600 dark:text-gray-400">
                      Enterprise
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 font-medium text-slate-900 dark:text-gray-100">
                      Custom alerts
                    </td>
                    <td className="py-4 px-6 text-center text-slate-600 dark:text-gray-400">
                      5 max
                    </td>
                    <td className="py-4 px-6 text-center text-slate-600 dark:text-gray-400">
                      20 max
                    </td>
                    <td className="py-4 px-6 text-center text-slate-600 dark:text-gray-400">
                      Unlimited
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold text-slate-900 dark:text-gray-100 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-gray-700">
              <h3 className="font-semibold text-slate-900 dark:text-gray-100 mb-3">
                Can I change my plan anytime?
              </h3>
              <p className="text-slate-600 dark:text-gray-400 text-sm">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be prorated and reflected in your next billing cycle.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-gray-700">
              <h3 className="font-semibold text-slate-900 dark:text-gray-100 mb-3">
                Is there a free trial?
              </h3>
              <p className="text-slate-600 dark:text-gray-400 text-sm">
                We offer a 14-day free trial for all plans. No credit card required to start your trial.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-gray-700">
              <h3 className="font-semibold text-slate-900 dark:text-gray-100 mb-3">
                What payment methods do you accept?
              </h3>
              <p className="text-slate-600 dark:text-gray-400 text-sm">
                We accept all major credit cards, PayPal, and bank transfers for annual subscriptions.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-gray-700">
              <h3 className="font-semibold text-slate-900 dark:text-gray-100 mb-3">
                Can I cancel anytime?
              </h3>
              <p className="text-slate-600 dark:text-gray-400 text-sm">
                Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your current billing period.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-20 bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-slate-200 dark:border-gray-700">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-gray-100">
              Need Help Choosing a Plan?
            </h2>
            <p className="text-slate-600 dark:text-gray-400 mt-2">
              Our team is ready to assist you in selecting the right plan for your needs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-gray-100 mb-2">Email</h3>
              <p className="text-emerald-600 dark:text-emerald-400">fahadkhalid695@gmail.com</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-gray-100 mb-2">Phone</h3>
              <p className="text-blue-600 dark:text-blue-400">+92300-4343753</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-gray-100 mb-2">Location</h3>
              <p className="text-purple-600 dark:text-purple-400">Lahore, Punjab, Pakistan</p>
            </div>
          </div>
        </div>

        {/* Powered by Bolt */}
        <div className="mt-16 text-center">
          <a 
            href="https://bolt.new/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block transition-transform hover:scale-105"
          >
            <img 
              src="/white_circle_360x360.png" 
              alt="Powered by Bolt" 
              className="h-10 w-auto"
            />
          </a>
        </div>
      </div>
    </div>
  );
};

// Add Phone icon component
const Phone = (props: any) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
    </svg>
  );
};

export default PricingPage;