export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  price: number;
  mode: 'payment' | 'subscription';
  features: string[];
}

export const stripeProducts: StripeProduct[] = [
  {
    id: 'prod_SYZuKDFXZL1L3R',
    priceId: 'price_1RdSkaPpYBBi0tJU7aHWs73q',
    name: 'Basic Guardian',
    description: 'Essential environmental monitoring for individuals and small teams',
    price: 9.99,
    mode: 'subscription',
    features: [
      'Real-time pollution data',
      'Limited historical data (up to 1 month)',
      'Basic alerts and notifications',
      'Limited data export options'
    ]
  },
  {
    id: 'prod_SYZvUkZjY28pqv',
    priceId: 'price_1RdSlKPpYBBi0tJUsA41XvQM',
    name: 'Eco Warrior',
    description: 'Advanced monitoring for environmental professionals and organizations',
    price: 19.99,
    mode: 'subscription',
    features: [
      'Real-time pollution data',
      'Advanced historical data (up to 1 year)',
      'Customizable alerts and notifications',
      'Advanced data export options (CSV, Excel)',
      'Priority customer support'
    ]
  },
  {
    id: 'prod_SYZxPJgWQHmYOJ',
    priceId: 'price_1RdSnBPpYBBi0tJU8T0Fp7R0',
    name: 'Environmental Expert',
    description: 'Complete environmental intelligence platform for enterprises',
    price: 29.99,
    mode: 'subscription',
    features: [
      'Real-time pollution data',
      'Advanced historical data (up to 5 years)',
      'Customizable alerts and notifications',
      'Advanced data export options (CSV, Excel, API access)',
      'Priority customer support',
      'Quarterly environmental reports'
    ]
  }
];

export const getProductByPriceId = (priceId: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.priceId === priceId);
};

export const getProductById = (id: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.id === id);
};