/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PlatformInsight {
  name: string;
  edge: string;
  listPrice: number;
  avgPrice: number;
  profit: number;
}

export interface PracticalTip {
  action: string;
  impact: 'low' | 'medium' | 'high';
  valueAdd: number;
  description: string;
}

export interface ProductAnalysis {
  quickVerdict: string;
  practicalTips: PracticalTip[];
  platforms: PlatformInsight[];
  suggestedTitle?: string;
  suggestedDescription?: string;
  priceRange: {
    min: number;
    max: number;
    sweetSpot: number;
    platformAverage: number;
    currency: string;
  };
  worthRange: {
    min: number;
    max: number;
    sweetSpot: number;
  };
  productDetails: {
    name: string;
    type: string;
    condition: string;
    brand: string;
    category: string;
    characteristics: string[];
    lowConfidence?: boolean;
  };
  marketSentiment: {
    consensus: string;
    goodThings: string[];
    badThings: string[];
  };
  priceHistory: {
    data: { date: string; price: number }[];
    isLive: boolean;
    limitedHistory: boolean;
  };
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ScanResult {
  id: string;
  timestamp: number;
  imageUrl?: string;
  description?: string;
  analysis: ProductAnalysis;
  projectId?: string; // Link to a project
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  color: string;
  thumbnailUrl?: string;
}

export interface UserStats {
  totalScans: number;
  totalMarketValue: number;
  averageSweetSpot: number;
  categories: { name: string; count: number; value: number }[];
  scansByDate: { date: string; count: number }[];
}

export interface UserLocation {
  country: string;
  state?: string;
  currency?: string;
  method: 'auto' | 'manual';
  timestamp: number;
}

export interface AffiliateProfile {
  id: string;
  userId: string;
  affiliateCode: string;
  totalEarnings: number;
  pendingEarnings: number;
  referralCount: number;
  createdAt: number;
}

export interface Referral {
  id: string;
  affiliateId: string;
  referredUserId: string;
  status: 'pending' | 'completed' | 'cancelled';
  commissionAmount: number;
  type: 'sale' | 'conversion';
  createdAt: number;
}
