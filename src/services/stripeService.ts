import { supabase } from './supabaseClient';
import type { User } from '@supabase/supabase-js';

export interface SubscriptionData {
  customer_id: string | null;
  subscription_id: string | null;
  subscription_status: string | null;
  price_id: string | null;
  current_period_start: number | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean | null;
  payment_method_brand: string | null;
  payment_method_last4: string | null;
}

export const getUserSubscription = async (user: User): Promise<SubscriptionData | null> => {
  try {
    if (!user) {
      throw new Error('User is required');
    }

    // Try to fetch from the view first
    const { data, error } = await supabase
      .from('stripe_user_subscriptions')
      .select('*')
      .maybeSingle();

    if (error) {
      console.error('Error fetching subscription from view:', error);
      
      // Fallback: try to fetch directly from tables with joins
      const { data: customerData, error: customerError } = await supabase
        .from('stripe_customers')
        .select('customer_id')
        .eq('user_id', user.id)
        .eq('deleted_at', null)
        .maybeSingle();

      if (customerError) {
        console.error('Error fetching customer:', customerError);
        throw new Error('Failed to fetch customer data');
      }

      if (!customerData) {
        console.log('No customer record found for user');
        return null;
      }

      // Fetch subscription data
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('stripe_subscriptions')
        .select('*')
        .eq('customer_id', customerData.customer_id)
        .eq('deleted_at', null)
        .maybeSingle();

      if (subscriptionError) {
        console.error('Error fetching subscription:', subscriptionError);
        throw new Error('Failed to fetch subscription data');
      }

      if (!subscriptionData) {
        console.log('No subscription found for customer');
        return null;
      }

      // Return formatted data
      return {
        customer_id: subscriptionData.customer_id,
        subscription_id: subscriptionData.subscription_id,
        subscription_status: subscriptionData.status,
        price_id: subscriptionData.price_id,
        current_period_start: subscriptionData.current_period_start,
        current_period_end: subscriptionData.current_period_end,
        cancel_at_period_end: subscriptionData.cancel_at_period_end,
        payment_method_brand: subscriptionData.payment_method_brand,
        payment_method_last4: subscriptionData.payment_method_last4,
      };
    }

    return data;
  } catch (error) {
    console.error('Error in getUserSubscription:', error);
    throw error;
  }
};

export const createCheckoutSession = async (params: {
  priceId: string;
  mode: 'subscription' | 'payment';
  successUrl: string;
  cancelUrl: string;
}) => {
  try {
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('User must be authenticated to create checkout session');
    }

    console.log('Invoking stripe-checkout function with params:', params);

    const { data, error } = await supabase.functions.invoke('stripe-checkout', {
      body: {
        priceId: params.priceId,
        mode: params.mode,
        successUrl: params.successUrl,
        cancelUrl: params.cancelUrl,
      },
    });

    if (error) {
      console.error('Supabase function invocation error:', error);
      throw new Error(`Failed to invoke Edge Function: ${error.message}`);
    }

    if (!data) {
      throw new Error('No data returned from Edge Function');
    }

    console.log('Checkout session created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in createCheckoutSession:', error);
    throw error;
  }
};

export const getUserOrders = async () => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('User must be authenticated');
    }

    const { data, error } = await supabase
      .from('stripe_user_orders')
      .select('*')
      .order('order_date', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      throw new Error('Failed to fetch order data');
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUserOrders:', error);
    throw error;
  }
};