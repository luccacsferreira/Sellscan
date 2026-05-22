import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Link as LinkIcon, 
  DollarSign, 
  TrendingUp, 
  Copy, 
  Check, 
  ChevronRight, 
  Wallet, 
  ArrowUpRight,
  Sparkles,
  Percent,
  Clock,
  ExternalLink
} from 'lucide-react';
import { dbService } from '../services/dbService';
import { supabase } from '../lib/supabase';
import { AffiliateProfile, Referral } from '../types';
import { cn } from '../lib/utils';

export const AffiliatePage: React.FC = () => {
  const [profile, setProfile] = useState<AffiliateProfile | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchAffiliateData();
  }, []);

  const fetchAffiliateData = async () => {
    setIsLoading(true);
    try {
      const profileData = await dbService.getAffiliateProfile();
      setProfile(profileData);
      
      if (profileData) {
        const referralsData = await dbService.getReferrals();
        setReferrals(referralsData);
      }
    } catch (error) {
      console.error('Error fetching affiliate data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateLink = async () => {
    setIsGenerating(true);
    try {
      const newProfile = await dbService.createAffiliateProfile();
      setProfile(newProfile);
    } catch (error) {
      console.error('Error generating affiliate link:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (!profile) return;
    const url = `${window.location.origin}?ref=${profile.affiliateCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-accent/20 border-t-brand-accent rounded-full animate-spin" />
          <p className="text-white/40 text-sm font-mono uppercase tracking-widest">Initialising Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <div className="flex items-center gap-2 text-brand-accent mb-3">
              <Percent className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-[0.3em]">Partner Program</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Grow with <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-brand-accent to-white">Sellscan</span>
            </h1>
            <p className="mt-4 text-white/60 max-w-xl text-lg leading-relaxed">
              Earn generous commissions by inviting other sellers to Sellscan. 
              Get paid for every sale and grow your passive income stream.
            </p>
          </div>
          
          <div className="flex items-center gap-4 p-1 bg-white/5 border border-white/10 rounded-2xl">
            <div className="px-4 py-2">
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Status</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-bold text-white uppercase tracking-wider">Active Member</span>
              </div>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="px-4 py-2">
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Commission Rate</p>
              <span className="text-sm font-bold text-brand-accent uppercase tracking-wider">20% Per Sale</span>
            </div>
          </div>
        </motion.div>
      </div>

      {!profile ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative bg-gradient-to-br from-white/10 to-transparent border border-white/10 rounded-3xl p-8 md:p-16 text-center overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-24 bg-brand-accent/20 blur-[120px] -z-10" />
          <div className="absolute bottom-0 left-0 p-24 bg-blue-500/20 blur-[120px] -z-10" />
          
          <div className="max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-brand-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-brand-accent/50">
              <Sparkles className="w-10 h-10 text-brand-accent" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Start Your Affiliate Journey</h2>
            <p className="text-white/60 mb-10 text-lg leading-relaxed">
              Join our partner program and start earning 20% on every sale made through your link. 
              Enjoy recurring commissions and passive growth as your network matures.
            </p>
            
            <button
              onClick={handleGenerateLink}
              disabled={isGenerating}
              className="group relative inline-flex items-center gap-4 bg-brand-accent text-brand-bg px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-white transition-all duration-300 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  Become a Partner
                  <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left border-t border-white/10 pt-12">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-brand-accent text-sm font-bold uppercase tracking-widest">
                  <DollarSign className="w-4 h-4" />
                  20% Commission
                </div>
                <p className="text-xs text-white/40 leading-relaxed">High percentage on all successful product sells via your unique link.</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-brand-accent text-sm font-bold uppercase tracking-widest">
                  <TrendingUp className="w-4 h-4" />
                  +5% Referral Bonus
                </div>
                <p className="text-xs text-white/40 leading-relaxed">Extra bonus when your referred users bring in new paying customers.</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-brand-accent text-sm font-bold uppercase tracking-widest">
                  <Wallet className="w-4 h-4" />
                  Fast Payouts
                </div>
                <p className="text-xs text-white/40 leading-relaxed">Easy withdrawal options with low minimum thresholds and transparent tracking.</p>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Dashboard Column */}
          <div className="xl:col-span-2 space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/5 border border-white/10 p-6 rounded-2xl group hover:border-brand-accent/30 transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 bg-brand-accent/20 rounded-xl flex items-center justify-center text-brand-accent border border-brand-accent/20">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <TrendingUp className="w-4 h-4 text-green-400 opacity-40" />
                </div>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">Total Earnings</p>
                <h3 className="text-3xl font-black text-white">${profile.totalEarnings.toLocaleString()}</h3>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.95, delay: 0.1 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/5 border border-white/10 p-6 rounded-2xl group hover:border-brand-accent/30 transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 border border-blue-500/20">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">Pending Clearance</p>
                <h3 className="text-3xl font-black text-white">${profile.pendingEarnings.toLocaleString()}</h3>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.95, delay: 0.2 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/5 border border-white/10 p-6 rounded-2xl group hover:border-brand-accent/30 transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-400 border border-purple-500/20">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">Total Referrals</p>
                <h3 className="text-3xl font-black text-white">{profile.referralCount}</h3>
              </motion.div>
            </div>

            {/* Affiliate Link Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-brand-accent border border-white/10 p-8 rounded-3xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-32 bg-white/30 blur-[80px] -mr-16 -mt-16" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 text-brand-bg/60 font-bold text-xs uppercase tracking-widest mb-4">
                  <LinkIcon className="w-4 h-4" />
                  Your Promotion Link
                </div>
                <h3 className="text-2xl font-black text-brand-bg mb-8">Share Sellscan, Earn 20%</h3>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 bg-brand-bg text-white px-6 py-4 rounded-xl flex items-center justify-between border border-white/5 shadow-2xl">
                    <span className="font-mono text-sm opacity-60 truncate mr-4">
                      {window.location.origin}?ref={profile.affiliateCode}
                    </span>
                    <button 
                      onClick={copyToClipboard}
                      className="p-2 hover:bg-white/5 rounded-lg transition-colors text-brand-accent"
                    >
                      {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                  <button className="sm:w-auto px-8 py-4 bg-brand-bg hover:brightness-125 transition-all text-white font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2">
                    Invite Friends
                    <ArrowUpRight className="w-5 h-5" />
                  </button>
                </div>
                
                <p className="mt-6 text-brand-bg/60 text-[10px] uppercase font-bold tracking-widest text-center sm:text-left">
                  Share this link anywhere to track clicks and conversions automatically.
                </p>
              </div>
            </motion.div>

            {/* Simulated Logic Section (Demo Only) */}
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-black text-yellow-400 uppercase tracking-widest">Sandbox Simulation</span>
                <span className="text-[8px] font-medium text-yellow-400/60 uppercase">Affiliate logic active</span>
              </div>
              <p className="text-[10px] text-yellow-200/40 leading-relaxed mb-4">
                Test your tracking: simulate a 20% direct sale or a 5% tier-2 referral bonus to see how your balance updates.
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={async () => {
                   const { data: { user } } = await supabase.auth.getUser();
                   if (!user) return;
                   await dbService.processSale(user.id, 50);
                   fetchAffiliateData();
                  }}
                  className="px-3 py-1.5 bg-yellow-400/20 text-yellow-400 text-[9px] font-bold uppercase rounded-lg hover:bg-yellow-400/30 transition-all"
                >
                  Simulate $50 Sale (+20%)
                </button>
                <button 
                  onClick={async () => {
                    // This is harder to simulate fully without another user context, 
                    // but we'll manually increment pending for the visual demo
                    setProfile(prev => prev ? { 
                      ...prev, 
                      pendingEarnings: prev.pendingEarnings + 2.5 
                    } : null);
                  }}
                  className="px-3 py-1.5 bg-yellow-400/5 text-yellow-400/40 text-[9px] font-bold uppercase rounded-lg hover:bg-yellow-400/10 transition-all border border-yellow-400/10"
                >
                  Simulate Tier-2 (+5%)
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-brand-accent" />
                  Recent Referrals
                </h3>
                <button className="text-[10px] font-bold text-white/40 uppercase tracking-widest hover:text-white transition-colors">
                  View Full Report
                </button>
              </div>
              
              <div className="divide-y divide-white/5">
                {referrals.length > 0 ? (
                  referrals.map((referral) => (
                    <div key={referral.id} className="p-4 hover:bg-white/[0.02] transition-colors flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-110",
                          referral.status === 'completed' ? "bg-green-500/10 text-green-400" : "bg-blue-500/10 text-blue-400"
                        )}>
                          {referral.type === 'sale' ? <DollarSign className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">
                            {referral.type === 'sale' ? 'Sale Commission' : 'New User Signup'}
                          </p>
                          <p className="text-[10px] text-white/40 flex items-center gap-2">
                            {new Date(referral.createdAt).toLocaleDateString()} at {new Date(referral.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          "text-sm font-bold",
                          referral.status === 'completed' ? "text-green-400" : "text-white/40"
                        )}>
                          {referral.commissionAmount > 0 ? `+$${referral.commissionAmount.toFixed(2)}` : '--'}
                        </p>
                        <p className={cn(
                          "text-[9px] uppercase font-black tracking-widest",
                          referral.status === 'completed' ? "text-green-400/60" : "text-white/20"
                        )}>
                          {referral.status}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                      <Clock className="w-8 h-8 text-white/20" />
                    </div>
                    <p className="text-white/40 font-bold uppercase tracking-widest text-[10px]">No activity recorded yet</p>
                    <p className="text-white/20 text-xs mt-1">When someone uses your link, it will appear here.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar / More Info */}
          <div className="space-y-6">
            {/* Program Details */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/5 border border-white/10 p-6 rounded-2xl"
            >
              <h4 className="text-xs font-black text-brand-accent uppercase tracking-widest mb-6">Program Rules</h4>
              <ul className="space-y-6">
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white">1</div>
                  <div>
                    <p className="text-sm font-bold text-white mb-1">Standard Sale</p>
                    <p className="text-xs text-white/40 leading-relaxed">Earn 20% commission on the total sell price of any product sold via your link.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white">2</div>
                  <div>
                    <p className="text-sm font-bold text-white mb-1">Multi-Tier Bonus</p>
                    <p className="text-xs text-white/40 leading-relaxed">Refer someone who becomes an affiliate? Earn 5% of their future referral commissions.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white">3</div>
                  <div>
                    <p className="text-sm font-bold text-white mb-1">Payout Windows</p>
                    <p className="text-xs text-white/40 leading-relaxed">Commissions are cleared 14 days after a successful transaction to account for potential returns.</p>
                  </div>
                </li>
              </ul>
            </motion.div>

            {/* Support/FAQ CTA */}
            <motion.div 
              initial={{ opacity: 0, x: 20, delay: 0.1 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/5 border border-white/10 p-6 rounded-2xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-12 bg-blue-500/10 blur-[50px] transition-all group-hover:scale-150" />
              <h4 className="text-sm font-bold text-white mb-2 relative z-10">Need Assistance?</h4>
              <p className="text-xs text-white/40 mb-4 relative z-10 leading-relaxed">
                Contact our affiliate support team for custom assets, marketing materials, or higher tier rates.
              </p>
              <button className="flex items-center gap-2 text-xs font-bold text-white hover:text-brand-accent transition-colors relative z-10">
                Help Documentation
                <ExternalLink className="w-3 h-3" />
              </button>
            </motion.div>
            
            {/* Withdrawal Section */}
            <motion.div 
              initial={{ opacity: 0, x: 20, delay: 0.2 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/5 border border-white/10 p-6 rounded-2xl"
            >
              <div className="flex justify-between items-end mb-4">
                <div>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Ready for Payout</p>
                  <h5 className="text-2xl font-black text-white">$0.00</h5>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-mono text-white/40 mb-1">Min. $50.00</p>
                  <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="w-0 h-full bg-brand-accent" />
                  </div>
                </div>
              </div>
              <button 
                disabled 
                className="w-full py-4 bg-white/5 text-white/20 font-black uppercase tracking-widest text-[10px] rounded-xl cursor-not-allowed border border-white/5"
              >
                Request Withdrawal
              </button>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
};
