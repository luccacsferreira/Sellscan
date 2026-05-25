/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PlatformInsight {
  name: string;
  matchScore: number;
  reasoning: string;
  advantages: string[];
  sellingPrice: number;
  listingPrices: number[];
  estimatedProfit: number;
}

export interface PracticalTip {
  action: string;
  impact: 'low' | 'medium' | 'high';
  valueAdd: number;
  description: string;
}

export interface ProductAnalysis {
  quickVerdict: string;
  improvements: string[];
  practicalTips: PracticalTip[];
  platforms: PlatformInsight[];
  suggestedTitle: string;
  suggestedDescription: string;
  priceRange: {
    min: number;
    max: number;
    sweetSpot: number;
    currency: string;
  };
  worthRange: {
    min: number;
    max: number;
    sweetSpot: number;
  };
  productDetails: {
    type: string;
    condition: string;
    brand: string;
    category: string;
  };
  buyerSentiment?: {
    overallRating: number;
    summary: string;
    pros: string[];
    cons: string[];
  };
  marketSentiment: {
    consensus: string;
    goodThings: string[];
    badThings: string[];
  };
  priceHistory: { date: string; price: number }[];
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
