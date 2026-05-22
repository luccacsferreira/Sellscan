import { supabase } from '../lib/supabase';
import { Project, ScanResult } from '../types';

/**
 * Service to handle all Supabase database operations
 * Separates DB logic from UI components for better maintainability
 */
export const dbService = {
  /**
   * Fetch all projects for the current user
   */
  async getProjects() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return data.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      color: p.color,
      createdAt: new Date(p.created_at).getTime()
    }));
  },

  /**
   * Create a new project
   */
  async createProject(project: Omit<Project, 'id' | 'createdAt'>) {
    const { data, error } = await supabase
      .from('projects')
      .insert({
        name: project.name,
        description: project.description,
        color: project.color
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update an existing project
   */
  async updateProject(project: Project) {
    const { error } = await supabase
      .from('projects')
      .update({
        name: project.name,
        description: project.description,
        color: project.color
      })
      .eq('id', project.id);

    if (error) throw error;
  },

  /**
   * Delete a project
   */
  async deleteProject(id: string) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Fetch all scans for the current user
   */
  async getScans() {
    const { data, error } = await supabase
      .from('scans')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) throw error;

    return data.map(s => ({
      id: s.id,
      timestamp: s.timestamp,
      imageUrl: s.image_url,
      description: s.description,
      analysis: s.analysis,
      projectId: s.project_id
    }));
  },

  /**
   * Save or update a scan
   */
  async saveScan(scan: ScanResult) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('scans')
      .upsert({
        id: scan.id.length >= 30 ? scan.id : undefined, // Potential UUID check
        user_id: user.id,
        project_id: scan.projectId || null,
        timestamp: scan.timestamp,
        image_url: scan.imageUrl,
        description: scan.description,
        analysis: scan.analysis
      });

    if (error) throw error;
  },

  /**
   * Affiliate methods
   */
  async getAffiliateProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('affiliate_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
    
    if (!data) return null;

    return {
      id: data.id,
      userId: data.user_id,
      affiliateCode: data.affiliate_code,
      totalEarnings: data.total_earnings,
      pendingEarnings: data.pending_earnings,
      referralCount: data.referral_count,
      createdAt: new Date(data.created_at).getTime()
    };
  },

  async createAffiliateProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const { data, error } = await supabase
      .from('affiliate_profiles')
      .insert({
        user_id: user.id,
        affiliate_code: code,
        total_earnings: 0,
        pending_earnings: 0,
        referral_count: 0
      })
      .select()
      .single();

    if (error) throw error;
    
    return {
      id: data.id,
      userId: data.user_id,
      affiliateCode: data.affiliate_code,
      totalEarnings: data.total_earnings,
      pendingEarnings: data.pending_earnings,
      referralCount: data.referral_count,
      createdAt: new Date(data.created_at).getTime()
    };
  },

  async getReferrals() {
    const profile = await this.getAffiliateProfile();
    if (!profile) return [];

    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .eq('affiliate_id', profile.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(r => ({
      id: r.id,
      affiliateId: r.affiliate_id,
      referredUserId: r.referred_user_id,
      status: r.status,
      commissionAmount: r.commission_amount,
      type: r.type,
      createdAt: new Date(r.created_at).getTime()
    }));
  },

  async linkReferral(referredUserId: string) {
    const refCode = localStorage.getItem('sellscan_ref_code');
    if (!refCode) return;

    try {
      // 1. Find the affiliate with this code
      const { data: affiliate, error: affError } = await supabase
        .from('affiliate_profiles')
        .select('*')
        .eq('affiliate_code', refCode)
        .single();

      if (affError || !affiliate) return;

      // 2. Prevent self-referral
      if (affiliate.user_id === referredUserId) return;

      // 3. Create the referral record
      const { error: refError } = await supabase
        .from('referrals')
        .insert({
          affiliate_id: affiliate.id,
          referred_user_id: referredUserId,
          status: 'pending',
          commission_amount: 0,
          type: 'conversion' // Initial signup
        });

      if (!refError) {
        // Clear the code after successful linking
        localStorage.removeItem('sellscan_ref_code');
        
        // Try to increment referral count
        try {
          await supabase.rpc('increment_referral_count', { profile_id: affiliate.id });
        } catch (e) {
          console.warn('RPC increment_referral_count not found, falling back to direct update');
          await supabase
            .from('affiliate_profiles')
            .update({ referral_count: (affiliate.referral_count || 0) + 1 })
            .eq('id', affiliate.id);
        }
      }
    } catch (e) {
      console.error('Error linking referral:', e);
    }
  }
};
