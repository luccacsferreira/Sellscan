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
  const DEADLINE_KEY = 'sellscan_discount_deadline';
  let targetTime = localStorage.getItem(DEADLINE_KEY);
  if (!targetTime) {
    const deadline = Date.now() + (48 * 60 * 60 * 1000);
    localStorage.setItem(DEADLINE_KEY, deadline.toString());
    targetTime = deadline.toString();
  }
  const isDiscountActive = Date.now() < parseInt(targetTime);

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

export function getPricingDisplay(tier: string, billingCycle: 'monthly' | 'yearly'): {
  priceLabel: string;
  originalPrice?: string;
} {
  const DEADLINE_KEY = 'sellscan_discount_deadline';
  let targetTime = localStorage.getItem(DEADLINE_KEY);
  if (!targetTime) {
    const deadline = Date.now() + (48 * 60 * 60 * 1000);
    localStorage.setItem(DEADLINE_KEY, deadline.toString());
    targetTime = deadline.toString();
  }
  const isDiscountActive = Date.now() < parseInt(targetTime);
  const isMonthly = billingCycle === 'monthly';

  if (tier === 'Basic') {
    if (isDiscountActive) {
      return {
        priceLabel: '$0.99',
        originalPrice: isMonthly ? '$3.99' : '$2.99'
      };
    } else {
      return {
        priceLabel: isMonthly ? '$3.99' : '$2.99',
        originalPrice: undefined
      };
    }
  }

  if (tier === 'Reseller') {
    if (isDiscountActive) {
      return {
        priceLabel: isMonthly ? '$3.99' : '$1.99',
        originalPrice: isMonthly ? '$5.99' : '$4.16'
      };
    } else {
      return {
        priceLabel: isMonthly ? '$5.99' : '$4.16',
        originalPrice: undefined
      };
    }
  }

  if (tier === 'Entrepreneur') {
    if (isDiscountActive) {
      return {
        priceLabel: isMonthly ? '$5.99' : '$2.99',
        originalPrice: isMonthly ? '$8.99' : '$6.16'
      };
    } else {
      return {
        priceLabel: isMonthly ? '$8.99' : '$6.16',
        originalPrice: undefined
      };
    }
  }

  return { priceLabel: '$0' };
}
