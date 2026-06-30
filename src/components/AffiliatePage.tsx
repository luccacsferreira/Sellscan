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
  ExternalLink,
  Loader2,
  Plus,
  Trash2,
  Info,
  Calendar,
  Layers,
  ArrowRight,
  BarChart3,
  ChevronDown
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { partnerService, PartnerLink } from '../services/partnerService';
import { AffiliateProfile, Referral } from '../types';
import { cn } from '../lib/utils';

export const AffiliatePage: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<AffiliateProfile | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [partnerLinks, setPartnerLinks] = useState<PartnerLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newLinkLabel, setNewLinkLabel] = useState('');
  
  // Simulation selected states
  const [simSelectedLink, setSimSelectedLink] = useState('');
  const [simAmount, setSimAmount] = useState('49.00');
  const [activeStatLink, setActiveStatLink] = useState<string | null>(null);

  useEffect(() => {
    fetchUserDataAndProfile();
  }, []);

  const fetchUserDataAndProfile = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        
        // Load or initialize affiliate profile
        const prof = partnerService.getSimulatedProfile(user.id);
        setProfile(prof);

        // Load referrals
        const refs = partnerService.getSimulatedReferrals(user.id);
        setReferrals(refs);

        // Load multiple partner links
        const links = partnerService.getPartnerLinks(user.id);
        setPartnerLinks(links);
        if (links.length > 0) {
          setSimSelectedLink(links[0].code);
          setActiveStatLink(links[0].code);
        }
      }
    } catch (error) {
      console.error('Error fetching affiliate data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setIsGenerating(true);
    
    try {
      const label = newLinkLabel.trim() || `Campaign Link #${partnerLinks.length + 1}`;
      const newL = partnerService.createPartnerLink(userId, label);
      
      const updatedLinks = partnerService.getPartnerLinks(userId);
      setPartnerLinks(updatedLinks);
      setNewLinkLabel('');
      
      // Update selected simulation link if first custom
      if (!simSelectedLink) {
        setSimSelectedLink(newL.code);
      }
    } catch (err) {
      console.error('Err creating link:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteLink = (linkId: string) => {
    if (!userId) return;
    partnerService.deletePartnerLink(userId, linkId);
    const updatedLinks = partnerService.getPartnerLinks(userId);
    setPartnerLinks(updatedLinks);
    
    // Adjust simulator select dropdown fallback
    if (updatedLinks.length > 0) {
      setSimSelectedLink(updatedLinks[0].code);
    } else {
      setSimSelectedLink('');
    }
  };

  const copyToClipboard = (code: string) => {
    const url = `${window.location.origin}/${code}`;
    navigator.clipboard.writeText(url);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Run the commission rules simulation representing direct and multitouch splits
  const runSimulation = (scenarioType: 'same-day' | 'delayed-buy' | 'split-touch') => {
    if (!userId || !profile) return;

    const amount = parseFloat(simAmount) || 49.00;
    const clickCode = simSelectedLink || partnerLinks[0]?.code || 'GIYZGGOU';
    const fakeBuyerId = 'buyer_' + Math.random().toString(36).substring(2, 9);
    
    let simulatedClicks: Array<{ code: string; timestamp: number }> = [];
    let scenarioLabel = '';
    const clickTimeSameDay = Date.now() - 3 * 60 * 60 * 1000; // 3 hours ago

    if (scenarioType === 'same-day') {
      // 1. Same-day registration and purchase (20% commission)
      simulatedClicks = [{ code: clickCode, timestamp: clickTimeSameDay }];
      scenarioLabel = 'Same-day Direct';
    } 
    else if (scenarioType === 'delayed-buy') {
      // 2. Delayed purchase on subsequent day (15% commission)
      const clickTimeOtherDay = Date.now() - 48 * 60 * 60 * 1000; // 2 days ago
      simulatedClicks = [{ code: clickCode, timestamp: clickTimeOtherDay }];
      scenarioLabel = 'Delayed Direct';
    } 
    else if (scenarioType === 'split-touch') {
      // 3. Split commission: Partner B (Another partner) brought user first, today you closer brought them again and they bought today
      // First touch: Code "INTROD88" (Another Partner's ID) 3 days ago
      // Last touch (your link): Today click on selectedLink, then purchase
      simulatedClicks = [
        { code: 'INTROD88', timestamp: Date.now() - 72 * 60 * 60 * 1000 },
        { code: clickCode, timestamp: clickTimeSameDay }
      ];
      scenarioLabel = 'Multitouch Split';
    }

    // Assess commission rates using partnerService algorithm
    const attribution = partnerService.assessAttribution(
      fakeBuyerId, 
      amount, 
      Date.now(), 
      simulatedClicks
    );

    // Filter commissions given to this partner
    const yourCommissions = attribution.comms.filter(c => c.code.toUpperCase() === clickCode.toUpperCase());
    const otherPartCommissions = attribution.comms.filter(c => c.code.toUpperCase() !== clickCode.toUpperCase());

    if (yourCommissions.length > 0) {
      const yourComm = yourCommissions[0];
      const newlyEarned = yourComm.amount;

      // Update simulated stats
      const updatedProfile: AffiliateProfile = {
        ...profile,
        totalEarnings: profile.totalEarnings + newlyEarned,
        pendingEarnings: profile.pendingEarnings + newlyEarned,
        referralCount: profile.referralCount + 1
      };
      
      // Save profile
      partnerService.saveSimulatedProfile(userId, updatedProfile);
      setProfile(updatedProfile);

      // Save referral row
      const newReferral: Referral = {
        id: `ref-${Math.random().toString(36).substring(2, 9)}`,
        affiliateId: profile.id,
        referredUserId: fakeBuyerId,
        status: 'completed',
        commissionAmount: newlyEarned,
        type: 'sale',
        createdAt: Date.now()
      };

      const currentReferrals = [newReferral, ...referrals];
      partnerService.saveSimulatedReferrals(userId, currentReferrals);
      setReferrals(currentReferrals);

      // Trigger standard clicks simulation count increments
      const updatedLinks = partnerLinks.map(l => {
        if (l.code.toUpperCase() === clickCode.toUpperCase()) {
          return { ...l, clicks: l.clicks + 1 };
        }
        return l;
      });
      setPartnerLinks(updatedLinks);
      partnerService.savePartnerLinks(userId, updatedLinks);

      // Alert nice response
      const splitMsg = scenarioType === 'split-touch' 
        ? `\n\nSplit details:\n• You (Closer): 15% (+$${newlyEarned.toFixed(2)})\n• Partner INTROD88 (First-touch): 10% (+$${(amount * 0.1).toFixed(2)})`
        : ` (Earned ${yourComm.rate * 100}% of $${amount.toFixed(2)})`;

      alert(`🎉 Simulation Successful!\n\nScenario: ${scenarioLabel}\nCommission Accredited: +$${newlyEarned.toFixed(2)}${splitMsg}`);
    } else {
      alert(`Simulation completed. Under this scenario, the selected link code did not qualify for closing or attribution credit.`);
    }
  };

  const handleResetSimStats = () => {
    if (!userId || !profile) return;
    if (confirm("Are you sure you want to reset your simulated earnings and referrals list?")) {
      const resetProfile: AffiliateProfile = {
        ...profile,
        totalEarnings: 0,
        pendingEarnings: 0,
        referralCount: 0
      };
      partnerService.saveSimulatedProfile(userId, resetProfile);
      setProfile(resetProfile);

      partnerService.saveSimulatedReferrals(userId, []);
      setReferrals([]);
      
      // Reset clicks
      const links = partnerLinks.map(l => ({ ...l, clicks: 0 }));
      setPartnerLinks(links);
      partnerService.savePartnerLinks(userId, links);

      alert("Simulated stats reset successfully.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-accent/20 border-t-brand-accent rounded-full animate-spin" />
          <p className="text-brand-text-muted text-sm font-mono uppercase tracking-widest">Initialising Dashboard...</p>
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
              <Percent className="w-5 h-5 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-[0.3em]">Partner Program</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-brand-text tracking-tight leading-tight">
              Manage & Grow Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-brand-accent to-emerald-400">Commissions</span>
            </h1>
            <p className="mt-4 text-brand-text-muted max-w-xl text-md leading-relaxed">
              Generate custom campaign links, share with other sellers, and earn split commissions based on our high-performance marketing attribution rules.
            </p>
          </div>
          
          <div className="flex items-center gap-4 p-1.5 bg-brand-text/5 border border-brand-border/50 rounded-2xl">
            <div className="px-4 py-2">
              <p className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest mb-1">Affiliate Status</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-medium text-brand-text uppercase tracking-wider">Verified Partner</span>
              </div>
            </div>
            <div className="w-px h-10 bg-brand-text/5" />
            <div className="px-4 py-2">
              <p className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest mb-1">Max Commission Rate</p>
              <span className="text-xs font-bold text-brand-accent uppercase tracking-wider">Up to 20% split</span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Dashboard Column */}
        <div className="xl:col-span-2 space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-brand-text/5 border border-brand-border/50 p-6 rounded-2xl group hover:border-brand-accent/30 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-brand-accent/20 rounded-xl flex items-center justify-center text-brand-accent border border-brand-accent/20">
                  <Wallet className="w-5 h-5" />
                </div>
                <TrendingUp className="w-4 h-4 text-green-400 opacity-40" />
              </div>
              <p className="text-[10px] font-black text-brand-text-muted uppercase tracking-[0.2em] mb-1">Total Earnings</p>
              <h3 className="text-3xl font-black text-brand-text">${profile?.totalEarnings.toFixed(2) || '0.00'}</h3>
              <p className="text-[9px] text-green-400/60 mt-1">Ready for clearance</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-brand-text/5 border border-brand-border/50 p-6 rounded-2xl group hover:border-brand-accent/30 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-teal-500/20 rounded-xl flex items-center justify-center text-teal-400 border border-teal-500/20">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <p className="text-[10px] font-black text-brand-text-muted uppercase tracking-[0.2em] mb-1">Pending Clearance</p>
              <h3 className="text-3xl font-black text-brand-text">${profile?.pendingEarnings.toFixed(2) || '0.00'}</h3>
              <p className="text-[9px] text-brand-text-muted mt-1">Clearing on 14 days cycle</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-brand-text/5 border border-brand-border/50 p-6 rounded-2xl group hover:border-brand-accent/30 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-400 border border-purple-500/20">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <p className="text-[10px] font-black text-brand-text-muted uppercase tracking-[0.2em] mb-1">Referral Conversions</p>
              <h3 className="text-3xl font-black text-brand-text">{profile?.referralCount || 0}</h3>
              <p className="text-[9px] text-purple-400/60 mt-1">Linked active users</p>
            </motion.div>
          </div>

          {/* Link Analytics View */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-brand-bg/50 border border-brand-border p-6 rounded-2xl"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                <BarChart3 className="text-brand-accent w-5 h-5" />
                <h3 className="text-lg font-bold text-brand-text">Link Analytics</h3>
              </div>
              <div className="relative">
                <select 
                  value={activeStatLink || ''} 
                  onChange={(e) => setActiveStatLink(e.target.value)}
                  className="appearance-none bg-brand-bg border border-brand-border rounded-xl pl-4 pr-10 py-2.5 text-sm font-bold text-brand-text outline-none focus:border-brand-accent/50 w-full sm:w-64"
                >
                  {partnerLinks.map(link => (
                    <option key={link.id} value={link.code}>{link.label} ({link.code})</option>
                  ))}
                  {partnerLinks.length === 0 && <option value="">No links yet</option>}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted pointer-events-none" />
              </div>
            </div>

            {activeStatLink ? (() => {
              const link = partnerLinks.find(l => l.code === activeStatLink);
              if (!link) return null;
              
              // Generate pseudo-deterministic stats based on total clicks
              const totalClicks = link.clicks;
              const todayClicks = Math.floor(totalClicks * 0.15);
              const lastWeekClicks = Math.floor(totalClicks * 0.45);
              const lastMonthClicks = Math.floor(totalClicks * 0.85);

              const totalUsers = Math.floor(totalClicks * 0.6);
              const todayUsers = Math.floor(todayClicks * 0.65);
              const lastWeekUsers = Math.floor(lastWeekClicks * 0.62);

              return (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-brand-text/5 rounded-xl border border-brand-border/50">
                    <p className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest mb-2">Accesses</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm"><span className="text-brand-text-muted">Today</span><span className="font-bold text-brand-text">{todayClicks}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-brand-text-muted">Last Week</span><span className="font-bold text-brand-text">{lastWeekClicks}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-brand-text-muted">Last Month</span><span className="font-bold text-brand-text">{lastMonthClicks}</span></div>
                      <div className="flex justify-between text-sm border-t border-brand-border/50 pt-1 mt-1"><span className="text-brand-text-muted">Total</span><span className="font-bold text-brand-accent">{totalClicks}</span></div>
                    </div>
                  </div>
                  <div className="p-4 bg-brand-text/5 rounded-xl border border-brand-border/50">
                    <p className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest mb-2">Unique Users</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm"><span className="text-brand-text-muted">Today</span><span className="font-bold text-brand-text">{todayUsers}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-brand-text-muted">Last Week</span><span className="font-bold text-brand-text">{lastWeekUsers}</span></div>
                      <div className="flex justify-between text-sm border-t border-brand-border/50 pt-1 mt-1"><span className="text-brand-text-muted">Total</span><span className="font-bold text-brand-accent">{totalUsers}</span></div>
                    </div>
                  </div>
                  <div className="p-4 bg-brand-text/5 rounded-xl border border-brand-border/50 col-span-2 flex flex-col justify-center items-center text-center">
                    <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mb-3">
                       <DollarSign className="w-6 h-6 text-green-500" />
                    </div>
                    <p className="text-2xl font-black text-brand-text mb-1">${(totalUsers * 49 * 0.15).toFixed(2)}</p>
                    <p className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest">Est. Revenue Generated</p>
                  </div>
                </div>
              );
            })() : (
              <p className="text-center text-brand-text-muted py-8 italic text-sm">Select a link to view its performance analytics.</p>
            )}
          </motion.div>

          {/* Multiple Promotional Links management section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-brand-text/5 border border-brand-border/50 p-6 rounded-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <LinkIcon className="text-brand-accent w-5 h-5" />
                <h3 className="text-lg font-bold text-brand-text">Your Promotion Links</h3>
              </div>
              <span className="text-[10px] text-brand-text-muted bg-brand-text/5 px-2 py-1 rounded">
                Active: {partnerLinks.length}
              </span>
            </div>

            {/* Link generation form */}
            <form onSubmit={handleCreateLink} className="flex gap-2 mb-6">
              <input 
                type="text" 
                placeholder="Campaign label (e.g. Meta Ads, Newsletter...)"
                value={newLinkLabel} 
                onChange={(e) => setNewLinkLabel(e.target.value)}
                className="flex-1 bg-brand-text/5 text-sm border border-brand-border/50 rounded-xl px-4 py-3 text-brand-text outline-none focus:border-brand-accent/50 transition-all"
              />
              <button 
                type="submit" 
                disabled={isGenerating}
                className="bg-brand-accent text-brand-bg hover:bg-white text-xs font-black uppercase tracking-widest px-5 py-3 rounded-xl flex items-center gap-1.5 transition-all"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Add Link
              </button>
            </form>

            {/* List generated links */}
            <div className="space-y-3">
              {partnerLinks.map(link => (
                <div key={link.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white/[0.02] hover:bg-white/[0.04] border border-brand-border/50 rounded-xl gap-4 transition-all">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-brand-text truncate">{link.label}</span>
                      <span className="text-[9px] font-mono bg-brand-accent/10 px-1.5 py-0.5 rounded text-brand-accent">
                        {link.clicks} Clicks
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-brand-text-muted truncate">
                      {window.location.origin}/{link.code}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button 
                      onClick={() => copyToClipboard(link.code)}
                      className="text-xs font-semibold px-3 py-1.5 bg-brand-text/5 border border-brand-border/50 rounded-lg text-brand-text hover:text-brand-accent flex items-center gap-1.5 transition-colors"
                    >
                      {copiedCode === link.code ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-brand-accent" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy Link
                        </>
                      )}
                    </button>
                    <button 
                      onClick={() => handleDeleteLink(link.id)}
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/10 transition-colors"
                      title="Remove campaign link"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {partnerLinks.length === 0 && (
                <div className="text-center p-8 text-brand-text-muted text-xs italic">
                  Generate your first partner marketing link above.
                </div>
              )}
            </div>
          </motion.div>

          {/* New Interactive Sandbox Playground verifying standard + split attribution commission rules */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-yellow-400">
                <Sparkles className="w-5 h-5" />
                <h4 className="text-sm font-bold uppercase tracking-wider">Multi-Touch Attribution Sandbox Playground</h4>
              </div>
              <button 
                onClick={handleResetSimStats}
                className="text-[9px] bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 text-red-200 px-2.5 py-1 rounded"
              >
                Reset Simulator Balance
              </button>
            </div>
            
            <p className="text-xs text-yellow-200/60 leading-relaxed mb-6">
              Test how Sellscan accounts for direct referrals, delayed entries, and multi-touch split-attribution. Configure your inputs below to trigger simulated buying user scenarios:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-[10px] uppercase font-black text-yellow-400/80 block mb-1">Target Campaign Link</label>
                <select 
                  value={simSelectedLink}
                  onChange={(e) => setSimSelectedLink(e.target.value)}
                  className="w-full text-xs font-bold font-mono bg-zinc-900 text-brand-text rounded-lg px-3 py-2 border border-brand-border/50 outline-none"
                >
                  {partnerLinks.map(l => (
                    <option key={l.id} value={l.code}>
                      {l.code} ({l.label})
                    </option>
                  ))}
                  {partnerLinks.length === 0 && (
                    <option value="">GIYZGGOU (Demo Link)</option>
                  )}
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-black text-yellow-400/80 block mb-1">Simulated User Sale Amount ($)</label>
                <input 
                  type="number"
                  value={simAmount}
                  onChange={(e) => setSimAmount(e.target.value)}
                  className="w-full text-xs font-bold font-mono bg-zinc-900 text-brand-text rounded-lg px-3 py-2 border border-brand-border/50 outline-none"
                  placeholder="49.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Scenario 1: Same day registration */}
              <button
                onClick={() => runSimulation('same-day')}
                className="p-4 bg-zinc-900 hover:bg-zinc-800 border-l-4 border-l-teal-400 border border-brand-border/50 rounded-xl text-left transition-all"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-brand-text mb-1">
                  <Calendar className="w-3.5 h-3.5 text-teal-400" />
                  Same-Day Sign-in (20%)
                </div>
                <p className="text-[10px] text-brand-text-muted leading-normal">
                  User clicks your link and registers account on the same day. Prompts <span className="font-bold text-teal-400">20% commission</span>.
                </p>
              </button>

              {/* Scenario 2: Buy on another day */}
              <button
                onClick={() => runSimulation('delayed-buy')}
                className="p-4 bg-zinc-900 hover:bg-zinc-800 border-l-4 border-l-brand-accent border border-brand-border/50 rounded-xl text-left transition-all"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-brand-text mb-1">
                  <Clock className="w-3.5 h-3.5 text-brand-accent" />
                  Delayed Purchase (15%)
                </div>
                <p className="text-[10px] text-brand-text-muted leading-normal">
                  User visits via your link, but returns on a subsequent calendar day to buy. Prompts <span className="font-bold text-brand-accent">15% commission</span>.
                </p>
              </button>

              {/* Scenario 3: Different partners split */}
              <button
                onClick={() => runSimulation('split-touch')}
                className="p-4 bg-zinc-900 hover:bg-zinc-800 border-l-4 border-l-purple-500 border border-brand-border/50 rounded-xl text-left transition-all"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-brand-text mb-1">
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  Multi-Touch Split (15% & 10%)
                </div>
                <p className="text-[10px] text-brand-text-muted leading-normal">
                  Partner B brought them first, but today they click your link & buy. You get <span className="font-bold text-purple-400">15%</span>, Partner B gets <span className="font-bold text-purple-300">10%</span>.
                </p>
              </button>
            </div>
          </motion.div>

          {/* Recent Referrals Activity logs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-brand-text/5 border border-brand-border/50 rounded-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-brand-border/50 flex justify-between items-center">
              <h3 className="font-bold text-brand-text flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-brand-accent" />
                Attribution Tracking & Leads
              </h3>
              <span className="text-[10px] text-brand-text-muted uppercase font-black tracking-widest bg-brand-text/5 px-2 py-0.5 rounded">
                Real-Time Sandbox Sync
              </span>
            </div>
            
            <div className="divide-y divide-white/5">
              {referrals.length > 0 ? (
                referrals.map((referral) => (
                  <div key={referral.id} className="p-4 hover:bg-white/[0.02] transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent">
                        <DollarSign className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-brand-text">
                          Commission Payment Fulfill
                        </p>
                        <p className="text-[10px] text-brand-text-muted flex items-center gap-2">
                          Buyer Ref ID: {referral.referredUserId} • {new Date(referral.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-400">
                        +${referral.commissionAmount.toFixed(2)}
                      </p>
                      <p className="text-[9px] uppercase font-black text-green-400/60 tracking-widest">
                        credited
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-brand-text/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-brand-border/50">
                    <Clock className="w-8 h-8 text-brand-text-muted" />
                  </div>
                  <p className="text-brand-text-muted font-bold uppercase tracking-widest text-[10px]">No activity recorded yet</p>
                  <p className="text-brand-text-muted text-xs mt-1">Configure the Attribution Simulator playground above to register leads instantly.</p>
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
            className="bg-brand-text/5 border border-brand-border/50 p-6 rounded-2xl"
          >
            <h4 className="text-xs font-black text-brand-accent uppercase tracking-widest mb-6">Attribution & Commission Guidelines</h4>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-text/5 flex items-center justify-center text-[10px] font-bold text-brand-text">1</div>
                <div>
                  <p className="text-sm font-bold text-brand-text mb-1">Direct Same-day Leads</p>
                  <p className="text-xs text-brand-text-muted leading-relaxed">Earn 20% on any tier product purchased if your referee signs in the same day they click.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-text/5 flex items-center justify-center text-[10px] font-bold text-brand-text">2</div>
                <div>
                  <p className="text-sm font-bold text-brand-text mb-1">Follow-up Conversions</p>
                  <p className="text-xs text-brand-text-muted leading-relaxed">Earn 15% on any purchase if they visited through your link, even on subsequent days.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-text/5 flex items-center justify-center text-[10px] font-bold text-brand-text">3</div>
                <div>
                  <p className="text-sm font-bold text-brand-text mb-1">Attribution split</p>
                  <p className="text-xs text-brand-text-muted leading-relaxed">If Partner B brought them first, but they click your link today and order, you closer get 15%, Partner B gets 10%.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Support/FAQ CTA */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-brand-text/5 border border-brand-border/50 p-6 rounded-2xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-12 bg-blue-500/10 blur-[50px] transition-all group-hover:scale-150" />
            <h4 className="text-sm font-bold text-brand-text mb-2 relative z-10">Need Assistance?</h4>
            <p className="text-xs text-brand-text-muted mb-4 relative z-10 leading-relaxed">
              Contact our affiliate support team for custom assets, marketing materials, or higher tier rates.
            </p>
            <button className="flex items-center gap-2 text-xs font-bold text-brand-text hover:text-brand-accent transition-colors relative z-10">
              Help Documentation
              <ExternalLink className="w-3 h-3" />
            </button>
          </motion.div>
          
          {/* Withdrawal Section */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-brand-text/5 border border-brand-border/50 p-6 rounded-2xl"
          >
            <div className="flex justify-between items-end mb-4">
              <div>
                <p className="text-[10px] font-black text-brand-text-muted uppercase tracking-widest mb-1">Ready for Payout</p>
                <h5 className="text-2xl font-black text-brand-text">${profile?.totalEarnings ? (profile.totalEarnings * 0.8).toFixed(2) : '0.00'}</h5>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-mono text-brand-text-muted mb-1">Min. $50.00</p>
                <div className="w-24 h-1 bg-brand-text/5 rounded-full overflow-hidden">
                  <div className="w-0 h-full bg-brand-accent" style={{ width: `${Math.min(((profile?.totalEarnings || 0) * 0.8 / 50) * 100, 100)}%` }} />
                </div>
              </div>
            </div>
            <button 
              disabled={((profile?.totalEarnings || 0) * 0.8) < 50}
              className={cn(
                "w-full py-4 text-brand-text font-black uppercase tracking-widest text-[10px] rounded-xl border transition-all",
                ((profile?.totalEarnings || 0) * 0.8) >= 50
                  ? "bg-brand-accent hover:brightness-115 text-brand-bg border-transparent cursor-pointer"
                  : "bg-brand-text/5 text-brand-text-muted cursor-not-allowed border-brand-border/50"
              )}
            >
              Request Withdrawal
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
