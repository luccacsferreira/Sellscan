/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a raw number using European style (dots for thousand separators, comma for cents decimal)
 * e.g., 200000.01 -> "200.000,01"
 */
export function formatAmount(value: number | string | undefined | null): string {
  if (value === undefined || value === null) return '0.00';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0.00';
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
}

/**
 * Formats a value with a currency symbol prepended
 */
export function formatPrice(value: number | string | undefined | null, symbol: string = ''): string {
  return `${symbol}${formatAmount(value)}`;
}

