import { supabase } from '../lib/supabase';
import { AffiliateProfile, Referral } from '../types';

export interface PartnerLink {
  id: string;
  code: string;
  createdAt: number;
  label: string;
  clicks: number;
}

export interface ReferredVisit {
  code: string;
  timestamp: number;
}

/**
 * Service to handle multiple affiliate promotional links,
 * referred clicks tracking, and attribution calculations.
 */
export const partnerService = {
  /**
   * Tracks a visitor clicking a referral code link.
   */
  recordClick(code: string) {
    if (!code) return;
    try {
      // 1. Save general click in visitor's history list
      const savedClicks = localStorage.getItem('sellscan_referred_licks_history');
      let clicksList: ReferredVisit[] = [];
      if (savedClicks) {
        try {
          clicksList = JSON.parse(savedClicks);
        } catch (e) {
          clicksList = [];
        }
      }

      // Avoid double logging if same code is clicked within 10 seconds
      const now = Date.now();
      const lastClick = clicksList[clicksList.length - 1];
      if (lastClick && lastClick.code === code && (now - lastClick.timestamp < 10000)) {
        return;
      }

      clicksList.push({ code, timestamp: now });
      localStorage.setItem('sellscan_referred_licks_history', JSON.stringify(clicksList));
      localStorage.setItem('sellscan_ref_code', code); // Sets active fallback ref code

      // 2. Increment clicks in the partner links store (simulated & real)
      const allGlobalLinks = this.getGlobalLinks();
      const idx = allGlobalLinks.findIndex(l => l.code.toUpperCase() === code.toUpperCase());
      if (idx !== -1) {
        allGlobalLinks[idx].clicks += 1;
        this.saveGlobalLinks(allGlobalLinks);
      }
    } catch (e) {
      console.error('Error tracking referred click:', e);
    }
  },

  /**
   * Get all clicked codes in visitor history
   */
  getClickHistory(): ReferredVisit[] {
    try {
      const saved = localStorage.getItem('sellscan_referred_licks_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  },

  /**
   * Clears referral click history
   */
  clearClickHistory() {
    localStorage.removeItem('sellscan_referred_licks_history');
    localStorage.removeItem('sellscan_ref_code');
  },

  /**
   * Returns when the user signed up/in (defaults to current session or user metadata)
   */
  getUserRegistrationTime(userId: string): number {
    const key = `sellscan_registration_time_${userId}`;
    const saved = localStorage.getItem(key);
    if (saved) return Number(saved);
    const now = Date.now();
    localStorage.setItem(key, String(now));
    return now;
  },

  /**
   * Calculate exact commission breakdown based on click history and purchase rules.
   * Rules:
   * 1. Register/Sign-in same day as click -> 20% commission.
   * 2. Registers same day or different, but buys another day (> 24 hours later) -> 15%.
   * 3. Split: First clicked code !== last clicked code, and last click is "same day" as purchase:
   *    - Last click partner gets 15%
   *    - First click partner gets 10%
   */
  assessAttribution(
    userId: string,
    purchaseAmount: number,
    purchaseTime: number = Date.now(),
    customClicks?: ReferredVisit[]
  ) {
    const clicks = customClicks || this.getClickHistory();
    const registrationTime = this.getUserRegistrationTime(userId);

    if (clicks.length === 0) {
      return { type: 'none', comms: [] };
    }

    // Filter clicks relevant up to the purchase time
    const validClicks = clicks.filter(c => c.timestamp <= purchaseTime);
    if (validClicks.length === 0) {
      return { type: 'none', comms: [] };
    }

    const firstClick = validClicks[0];
    const lastClick = validClicks[validClicks.length - 1];

    // CASE 3: Multi-touch Split Commission
    // If someone else brought them first, and you brought them again and purchased that same day.
    const isDifferentPartners = firstClick.code.toUpperCase() !== lastClick.code.toUpperCase();
    const isLastClickSameDayAsPurchase = (purchaseTime - lastClick.timestamp) <= 24 * 60 * 60 * 1000;

    if (isDifferentPartners && isLastClickSameDayAsPurchase) {
      const commLast = purchaseAmount * 0.15; // 15% for the closer (last partner)
      const commFirst = purchaseAmount * 0.10; // 10% for the introducer (first partner)
      return {
        type: 'split',
        description: 'Split Attribution (15% closer / 10% first touch)',
        comms: [
          { code: lastClick.code, rate: 0.15, amount: commLast, role: 'Closer (Same-day buy)' },
          { code: firstClick.code, rate: 0.10, amount: commFirst, role: 'Introducer (First touch)' }
        ]
      };
    }

    // CASE 1: Sign-in/up same day as opening link (20% commission)
    // Here we have either a single partner, or the same partner for first and last touch.
    const activeCode = lastClick.code;
    const isSignInSameDay = (registrationTime - lastClick.timestamp) <= 24 * 60 * 60 * 1000;
    
    if (isSignInSameDay) {
      const commission = purchaseAmount * 0.20; // 20%
      return {
        type: 'direct-20',
        description: 'Direct Referral (20% - Registered same day as click)',
        comms: [
          { code: activeCode, rate: 0.20, amount: commission, role: 'Lead Referrer (Same-day register)' }
        ]
      };
    }

    // CASE 2: Came via link, but bought on another day (15% commission)
    const commission = purchaseAmount * 0.15; // 15%
    return {
      type: 'direct-15',
      description: 'Delayed Referral (15% - Purchased on a later day)',
      comms: [
        { code: activeCode, rate: 0.15, amount: commission, role: 'Referrer (Delayed purchase)' }
      ]
    };
  },

  /**
   * Returns active promo links for a partner user
   */
  getPartnerLinks(userId: string): PartnerLink[] {
    const key = `sellscan_partner_links_${userId}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }

    // Generate initial link if none exists
    const initialCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    const defaultLinks: PartnerLink[] = [
      {
        id: 'init-default',
        code: initialCode,
        createdAt: Date.now(),
        label: 'Default Promotion Link',
        clicks: 0
      }
    ];
    localStorage.setItem(key, JSON.stringify(defaultLinks));
    
    // Register initial code in global catalog
    const globals = this.getGlobalLinks();
    if (!globals.some(g => g.code === initialCode)) {
      globals.push({
        id: 'init-default',
        userId,
        code: initialCode,
        createdAt: Date.now(),
        label: 'Default Promotion Link',
        clicks: 0
      });
      this.saveGlobalLinks(globals);
    }

    return defaultLinks;
  },

  /**
   * Save partner links
   */
  savePartnerLinks(userId: string, links: PartnerLink[]) {
    localStorage.setItem(`sellscan_partner_links_${userId}`, JSON.stringify(links));
  },

  /**
   * Generates a new link for a partner user
   */
  createPartnerLink(userId: string, label: string = 'Campaign Link'): PartnerLink {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase(); // e.g. "GIYZGGOU"
    const newLink: PartnerLink = {
      id: Math.random().toString(36).substring(2, 11),
      code,
      createdAt: Date.now(),
      label: label || `Promotion Link #${this.getPartnerLinks(userId).length + 1}`,
      clicks: 0
    };

    const currentLinks = this.getPartnerLinks(userId);
    currentLinks.push(newLink);
    this.savePartnerLinks(userId, currentLinks);

    // Register globally
    const globals = this.getGlobalLinks();
    globals.push({
      ...newLink,
      userId
    });
    this.saveGlobalLinks(globals);

    return newLink;
  },

  /**
   * Deletes a partner link
   */
  deletePartnerLink(userId: string, linkId: string) {
    const currentLinks = this.getPartnerLinks(userId);
    const updated = currentLinks.filter(l => l.id !== linkId);
    this.savePartnerLinks(userId, updated);

    // Update global links as well
    const globals = this.getGlobalLinks();
    const updatedGlobals = globals.filter(g => !(g.userId === userId && g.id === linkId));
    this.saveGlobalLinks(updatedGlobals);
  },

  /**
   * Get global registry of all links (to map clicked code back to partner user ID)
   */
  getGlobalLinks(): Array<PartnerLink & { userId: string }> {
    try {
      const saved = localStorage.getItem('sellscan_global_partner_links');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  },

  saveGlobalLinks(links: Array<PartnerLink & { userId: string }>) {
    localStorage.setItem('sellscan_global_partner_links', JSON.stringify(links));
  },

  /**
   * Simulated stats registry
   */
  getSimulatedProfile(userId: string): AffiliateProfile {
    const key = `sellscan_sim_aff_profile_${userId}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }

    const defaultProfile: AffiliateProfile = {
      id: `profile-${userId}`,
      userId,
      affiliateCode: this.getPartnerLinks(userId)[0]?.code || 'DEFAULT_VAL',
      totalEarnings: 0,
      pendingEarnings: 0,
      referralCount: 0,
      createdAt: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(defaultProfile));
    return defaultProfile;
  },

  saveSimulatedProfile(userId: string, profile: AffiliateProfile) {
    localStorage.setItem(`sellscan_sim_aff_profile_${userId}`, JSON.stringify(profile));
  },

  getSimulatedReferrals(userId: string): Referral[] {
    const key = `sellscan_sim_referrals_${userId}`;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  },

  saveSimulatedReferrals(userId: string, referrals: Referral[]) {
    localStorage.setItem(`sellscan_sim_referrals_${userId}`, JSON.stringify(referrals));
  }
};
