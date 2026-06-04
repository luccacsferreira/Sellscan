/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Configuration for Stripe Price IDs
export const STRIPE_PRICES = {
  BASIC: {
    MONTHLY: 'price_1TeaH3RCzE4WmLf5ptaXAskM',
    MONTHLY_DISCOUNT: 'price_1TeIc0RCzE4WmLf5kaoHFt9z',
    YEARLY: 'price_1TeaHrRCzE4WmLf53aVjR8jV',
    YEARLY_DISCOUNT: 'price_1TeIdORCzE4WmLf5PYHevCKT',
  },
  RESELLER: {
    MONTHLY: 'price_1TeaJ7RCzE4WmLf5GFIP8o7V',
    MONTHLY_DISCOUNT: 'price_1TeIfORCzE4WmLf5XyoIptU3',
    YEARLY: 'price_1TeaK2RCzE4WmLf5IdNCB8M5',
    YEARLY_DISCOUNT: 'price_1TeIhZRCzE4WmLf54arqUdNi',
  },
  ENTREPRENEUR: {
    MONTHLY: 'price_1TeaL7RCzE4WmLf5xOmRk72E',
    MONTHLY_DISCOUNT: 'price_1TeIjuRCzE4WmLf5qLJn3MvC',
    YEARLY: 'price_1TeaM5RCzE4WmLf5pf4lB2KE',
    YEARLY_DISCOUNT: 'price_1TeIn6RCzE4WmLf5eXzi92yU',
  }
};

export function getPriceId(tier: string, billingCycle: 'monthly' | 'yearly'): string {
  const LAUNCH_DATE_KEY = 'sellscan_launch_promo_start';
  const DURATION = 48 * 60 * 60 * 1000;
  const startTime = localStorage.getItem(LAUNCH_DATE_KEY);
  const isDiscountActive = startTime ? (Date.now() - parseInt(startTime)) < DURATION : true;

  const cycle = billingCycle === 'monthly' ? 'MONTHLY' : 'YEARLY';
  const suffix = isDiscountActive ? '_DISCOUNT' : '';
  const key = `${cycle}${suffix}` as 'MONTHLY' | 'MONTHLY_DISCOUNT' | 'YEARLY' | 'YEARLY_DISCOUNT';

  if (tier === 'Basic') {
    return STRIPE_PRICES.BASIC[key];
  } else if (tier === 'Reseller') {
    return STRIPE_PRICES.RESELLER[key];
  } else if (tier === 'Entrepreneur') {
    return STRIPE_PRICES.ENTREPRENEUR[key];
  }
  return '';
}
