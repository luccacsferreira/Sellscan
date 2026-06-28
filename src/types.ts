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

export type AIPlan = 'free' | 'basic' | 'reseller' | 'entrepreneur';

export const PLAN_LIMITS: Record<AIPlan, { scans: number; messages: number; integration: number }> = {
  free: { scans: 10, messages: 25, integration: 100 },
  basic: { scans: 50, messages: 150, integration: 500 },
  reseller: { scans: 200, messages: 1000, integration: 2500 },
  entrepreneur: { scans: 1000, messages: 5000, integration: 10000 }
};

export const PLAN_NAMES: Record<AIPlan, string> = {
  free: 'Explorer / Free',
  basic: 'Basic Pro',
  reseller: 'High Professional Reseller',
  entrepreneur: 'Entrepreneur'
};

export type AIModelId = 
  | 'gemini-1.5-flash' 
  | 'gemini-1.5-pro' 
  | 'gpt-4o-mini' 
  | 'gpt-4o' 
  | 'gpt-5-preview'
  | 'claude-3.5-sonnet'
  | 'claude-3.5-opus'
  | 'gemini-1.5-lite'
  | 'gemini-2.5-pro'
  | 'gpt-4.1'
  | 'gpt-5.0'
  | 'gpt-5.2'
  | 'claude-4.6-haiku'
  | 'claude-4.6-sonnet';

export interface AIModelInfo {
  id: AIModelId;
  name: string;
  provider: 'google' | 'openai' | 'anthropic';
  costPerScan: number;
  minPlan: AIPlan;
}

export interface AIPipelineConfig {
  detectionModel: AIModelId;
  researchModel: AIModelId;
  strategyModel: AIModelId;
}

export interface UserAIPreference {
  plan: AIPlan;
  pipeline: AIPipelineConfig;
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
  alternativeOptions?: string[];
  productDetails: {
    name: string;
    type: string;
    condition: string;
    brand: string;
    category: string;
    characteristics: string[];
    detectedOrigin?: string; // e.g. "Brazil", "USA", "Europe"
    releaseYear?: number;
    lowConfidence?: boolean;
    unclearProduct?: boolean;
  };
  marketSentiment: {
    consensus: string;
    goodThings: string[];
    badThings: string[];
  };
  tutorial?: string;
  researchedUrls?: string[];
  priceHistory: {
    month: { date: string; price: number }[];
    year: { date: string; price: number }[];
    allTime: { date: string; price: number }[];
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
