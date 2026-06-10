/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Configuration for Stripe Price IDs
// Using standard naming for easy override via environment variables
const getPriceEnv = (key: string) => {
  // In Vite/React, we use import.meta.env for public variables
  // But for price IDs, we can also check standard globals if injected
  const val = (import.meta.env[`VITE_STRIPE_PRICE_${key}`]) || (window as any).STRIPE_PRICE_IDS?.[key];
  return val || '';
};

export const STRIPE_PRICES = {
  BASIC: {
    MONTHLY: getPriceEnv('BASIC_MONTHLY'),
    MONTHLY_DISCOUNT: getPriceEnv('BASIC_MONTHLY_DISCOUNT'),
    YEARLY: getPriceEnv('BASIC_YEARLY'),
    YEARLY_DISCOUNT: getPriceEnv('BASIC_YEARLY_DISCOUNT'),
  },
  RESELLER: {
    MONTHLY: getPriceEnv('RESELLER_MONTHLY'),
    MONTHLY_DISCOUNT: getPriceEnv('RESELLER_MONTHLY_DISCOUNT'),
    YEARLY: getPriceEnv('RESELLER_YEARLY'),
    YEARLY_DISCOUNT: getPriceEnv('RESELLER_YEARLY_DISCOUNT'),
  },
  ENTREPRENEUR: {
    MONTHLY: getPriceEnv('ENTREPRENEUR_MONTHLY'),
    MONTHLY_DISCOUNT: getPriceEnv('ENTREPRENEUR_MONTHLY_DISCOUNT'),
    YEARLY: getPriceEnv('ENTREPRENEUR_YEARLY'),
    YEARLY_DISCOUNT: getPriceEnv('ENTREPRENEUR_YEARLY_DISCOUNT'),
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
