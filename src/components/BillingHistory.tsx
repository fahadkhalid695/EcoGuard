import React, { useState, useEffect } from 'react';
import { Receipt, Download, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getUserOrders } from '../services/stripeService';

const BillingHistory: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const orderData = await getUserOrders();
        setOrders(orderData);
      } catch (error: any) {
        setError('Failed to load billing history');
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'unpaid':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!user) {
    return (
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-6">
        <div className="flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          <div>
            <h3 className="font-semibold text-amber-900 dark:text-amber-100">Sign In Required</h3>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Please sign in to view your billing history
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
          <span className="text-slate-600 dark:text-gray-400">Loading billing history...</span>
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Receipt className="w-6 h-6 text-slate-700 dark:text-gray-300" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-gray-100">Billing History</h2>
        </div>
        <button
          onClick={() => window.history.back()}
          className="flex items-center space-x-2 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200 transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="bg-slate-50 dark:bg-gray-700 rounded-xl p-8 text-center">
          <Receipt className="w-12 h-12 text-slate-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-gray-100 mb-2">No Billing History</h3>
          <p className="text-slate-600 dark:text-gray-400">
            You haven't made any purchases yet. Visit our pricing page to subscribe to a plan.
          </p>
          <a
            href="/pricing"
            className="inline-block mt-4 px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors duration-200"
          >
            View Pricing
          </a>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-gray-700">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-gray-100">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-gray-100">Description</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-gray-100">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-gray-100">Status</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-gray-100">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
                {orders.map((order) => (
                  <tr key={order.order_id} className="hover:bg-slate-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-gray-100">
                      {formatDate(order.order_date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-gray-100">
                      {order.order_status === 'completed' ? 'Subscription Payment' : 'Pending Payment'}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-gray-100">
                      {formatCurrency(order.amount_total, order.currency)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(order.payment_status)}`}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300"
                        title="Download Receipt"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingHistory;