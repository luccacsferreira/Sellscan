import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Zap, 
  CreditCard, 
  Calendar, 
  Sparkles, 
  Plus, 
  CheckCircle, 
  TrendingUp, 
  ShoppingBag, 
  Activity,
  ChevronRight,
  Info
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn, formatAmount } from '../lib/utils';
import { AIPlan } from '../types';

interface CreditUsagePageProps {
  plan: AIPlan;
  spentCredits: {
    scans: number;
    messages: number;
    integration: number;
  };
  onBack: () => void;
  onUpgradePlan: () => void;
  onAddBoosterCredits: (amount: number) => void;
}

const PLAN_LIMITS: Record<AIPlan, { scans: number; messages: number; integration: number }> = {
  free: { scans: 10, messages: 25, integration: 100 },
  basic: { scans: 50, messages: 150, integration: 500 },
  reseller: { scans: 200, messages: 1000, integration: 2500 },
  entrepreneur: { scans: 1000, messages: 5000, integration: 10000 }
};

const PLAN_NAMES: Record<AIPlan, string> = {
  free: 'Explorer / Free',
  basic: 'Basic Pro',
  reseller: 'High Professional Reseller',
  entrepreneur: 'Entrepreneur Enterprise'
};

export function CreditUsagePage({ 
  plan, 
  spentCredits, 
  onBack, 
  onUpgradePlan,
  onAddBoosterCredits
}: CreditUsagePageProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'booster' | 'history'>('overview');
  const [purchasingBooster, setPurchasingBooster] = useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Active plan limits
  const limits = PLAN_LIMITS[plan];
  
  // Total available booster credits added simulated
  const [boosterCredits, setBoosterCredits] = useState<number>(() => {
    return Number(localStorage.getItem('sellscan_booster_credits') || '0');
  });

  const handleBuyBooster = (amount: number) => {
    setPurchasingBooster(amount);
    setTimeout(() => {
      onAddBoosterCredits(amount);
      setBoosterCredits(prev => {
        const next = prev + amount;
        localStorage.setItem('sellscan_booster_credits', next.toString());
        return next;
      });
      setPurchasingBooster(null);
      setSuccessMsg(`Successfully credited +${amount} Scan Credits to your balance!`);
      setTimeout(() => setSuccessMsg(null), 4000);
    }, 1200);
  };

  // Generate dynamic 14-day history for the chart
  const usageHistoryData = React.useMemo(() => {
    const data = [];
    const now = new Date();
    
    // Distribute total spent credits across those 14 days realistically
    const scanTotal = spentCredits.scans;
    const msgTotal = spentCredits.messages;
    const intTotal = spentCredits.integration;

    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dayStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      // Seed values with organic fluctuation pattern
      const dayFactor = (Math.sin(i * 1.2) + 1.2) / 2.4; // 0 to 1
      const dailyScan = Math.max(0, Math.floor(scanTotal * (dayFactor / 7) + Math.random() * 0.8));
      const dailyMsg = Math.max(0, Math.floor(msgTotal * (dayFactor / 7) + Math.random() * 1.5));
      const dailyInt = Math.max(0, Math.floor(intTotal * (dayFactor / 7) + Math.random() * 2));

      data.push({
        date: dayStr,
        'Scan Credits': Number((dailyScan * 1.0).toFixed(1)),
        'Chat Credits': Number((dailyMsg * 0.25).toFixed(2)),
        'Integration Credits': Number((dailyInt * 0.1).toFixed(2)),
        'Total Credits Used': Number((dailyScan * 1.0 + dailyMsg * 0.25 + dailyInt * 0.1).toFixed(2))
      });
    }
    return data;
  }, [spentCredits]);

  // Calculations
  const totalScansAllowed = limits.scans + boosterCredits;
  const scansSpentPercent = Math.min(100, Math.round((spentCredits.scans / totalScansAllowed) * 100));
  const messagesSpentPercent = Math.min(100, Math.round((spentCredits.messages / limits.messages) * 100));
  const integrationSpentPercent = Math.min(100, Math.round((spentCredits.integration / limits.integration) * 100));

  const totalCreditsValue = spentCredits.scans * 1.0 + spentCredits.messages * 0.25 + spentCredits.integration * 0.1;

  // Next renewal date is always 30 days out or end of month
  const renewalDate = "July 9, 2026";
  const billingCycleStr = "June 9, 2026 - July 9, 2026";

  return (
    <div className="pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto min-h-[90vh]">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-brand-bg border border-brand-border flex items-center justify-center cursor-pointer hover:border-brand-accent transition-all text-brand-text group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-brand-accent font-bold text-[10px] uppercase tracking-widest mb-1">
              <Activity className="w-3.5 h-3.5" /> Operations Pulse
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-none uppercase">Usage & Operations</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={onUpgradePlan}
            className="px-6 py-2.5 rounded-2xl bg-brand-accent text-brand-bg font-black uppercase text-xs flex items-center gap-2 hover:brightness-110 shadow-[0_5px_15px_-4px_rgba(85,205,209,0.4)] transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 fill-current animate-pulse" /> Upgrade Plan
          </button>
        </div>
      </div>

      {successMsg && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center gap-3 text-green-400"
        >
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span className="text-xs font-bold uppercase tracking-wider">{successMsg}</span>
        </motion.div>
      )}

      {/* Grid: Left Summary, Right Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Aspect: Billing Info & Plan Status */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card p-6 border-brand-border/30 bg-brand-card/10 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Zap className="w-36 h-36 border-none text-brand-accent" />
            </div>

            <h3 className="text-[10px] font-black text-brand-text-muted/60 uppercase tracking-widest mb-2">Active Framework License</h3>
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="text-2xl font-black text-brand-text tracking-tight uppercase italic-none">
                {PLAN_NAMES[plan]}
              </h2>
            </div>

            <div className="space-y-3.5 pt-4 border-t border-brand-border/20 text-xs">
              <div className="flex items-center justify-between font-medium">
                <span className="text-brand-text-muted">Total spent value</span>
                <span className="text-brand-text font-bold uppercase">{totalCreditsValue.toFixed(1)} Credits</span>
              </div>
              <div className="flex items-center justify-between font-medium">
                <span className="text-brand-text-muted">Cycle frame</span>
                <span className="text-brand-text font-bold truncate">{billingCycleStr}</span>
              </div>
              <div className="flex items-center justify-between font-medium text-brand-accent mt-4 bg-brand-accent/5 p-3 rounded-2xl border border-brand-accent/10">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 shrink-0" />
                  <span className="font-bold uppercase tracking-wider">Next Renewal date</span>
                </div>
                <span className="font-bold">{renewalDate}</span>
              </div>
            </div>
          </div>

          {/* Quick Stats list */}
          <div className="glass-card p-6 border-brand-border/30 bg-brand-card/15 rounded-3xl space-y-5">
            <h4 className="text-[10px] font-black text-brand-text-muted/60 uppercase tracking-widest">Active Balance Consumed</h4>
            
            {/* Scans */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-brand-text">Scan Credits</span>
                <span className="text-brand-text-muted">
                  <strong className="text-brand-accent font-black text-sm">{spentCredits.scans}</strong> / {totalScansAllowed} {boosterCredits > 0 && <span className="text-[9px] text-green-400 font-bold">(+{boosterCredits} booster)</span>}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-brand-border/30 overflow-hidden">
                <div 
                  className="h-full bg-brand-accent rounded-full transition-all duration-1000" 
                  style={{ width: `${scansSpentPercent}%` }} 
                />
              </div>
              <p className="text-[9px] text-brand-text-muted tracking-wide font-medium">
                Used to perform deep photo identification and multi-source pricing maps.
              </p>
            </div>

            {/* Chat Messages */}
            <div className="space-y-2 pt-2 border-t border-brand-border/20">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-brand-text">Refinement Messages</span>
                <span className="text-brand-text-muted">
                  <strong className="text-brand-accent font-black text-sm">{spentCredits.messages}</strong> / {limits.messages}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-brand-border/30 overflow-hidden">
                <div 
                  className="h-full bg-brand-accent/70 rounded-full transition-all duration-1000" 
                  style={{ width: `${messagesSpentPercent}%` }} 
                />
              </div>
              <p className="text-[9px] text-brand-text-muted tracking-wide font-medium">
                Used during interactive chat iterations for detailed listing variations.
              </p>
            </div>

            {/* Integration Exports */}
            <div className="space-y-2 pt-2 border-t border-brand-border/20">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-brand-text">Integration & Exports</span>
                <span className="text-brand-text-muted">
                  <strong className="text-brand-accent font-black text-sm">{spentCredits.integration}</strong> / {limits.integration}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-brand-border/30 overflow-hidden">
                <div 
                  className="h-full bg-brand-accent/50 rounded-full transition-all duration-1000" 
                  style={{ width: `${integrationSpentPercent}%` }} 
                />
              </div>
              <p className="text-[9px] text-brand-text-muted tracking-wide font-medium">
                Consumption from external cross-post sync and API operations.
              </p>
            </div>
          </div>
        </div>

        {/* Right Aspect: Detailed Charting + Actions */}
        <div className="lg:col-span-8 space-y-6">
          {/* Navigation Tab links */}
          <div className="flex gap-2 border-b border-brand-border/40 p-1 bg-brand-bg/50 rounded-full w-fit">
            {[
              { id: 'overview', name: 'Credit Activity Map' },
              { id: 'booster', name: 'On-Demand Booster Packs' },
              { id: 'history', name: 'Consumption Log' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer",
                  activeTab === tab.id 
                    ? "bg-brand-accent text-brand-bg shadow-sm" 
                    : "text-brand-text-muted hover:text-brand-text"
                )}
              >
                {tab.id === 'booster' && boosterCredits > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block mr-1.5 animate-pulse" />
                )}
                {tab.name}
              </button>
            ))}
          </div>

          {/* TAB 1: OVERVIEW & CHART */}
          {activeTab === 'overview' && (
            <div className="glass-card p-6 border-brand-border/30 bg-brand-card/10 rounded-3xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                <div>
                  <h3 className="text-lg font-black text-brand-text uppercase leading-tight">Daily Operations Ledger</h3>
                  <p className="text-brand-text-muted text-xs">Visualize credit load distribution across multi-source nodes over the last 14 days.</p>
                </div>
                <div className="flex gap-4 p-3 bg-brand-border/10 rounded-2xl border border-brand-border/20 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-brand-accent inline-block" />
                    <span className="font-bold text-brand-text-muted uppercase">Scans</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-purple-500 inline-block" />
                    <span className="font-bold text-brand-text-muted uppercase">Chats</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-brand-text-muted/60 inline-block" />
                    <span className="font-bold text-brand-text-muted uppercase">Exports</span>
                  </div>
                </div>
              </div>

              {/* RECHARTS PLOT */}
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={usageHistoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-brand-accent, #55cdd1)" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="var(--color-brand-accent, #55cdd1)" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis 
                      dataKey="date" 
                      tickLine={false} 
                      axisLine={false}
                      tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 'bold' }} 
                    />
                    <YAxis 
                      tickLine={false} 
                      axisLine={false}
                      tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 'bold' }} 
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1E2124', 
                        borderColor: 'rgba(255,255,255,0.08)',
                        borderRadius: '16px',
                        fontSize: '11px',
                        color: '#fff',
                        fontWeight: 'bold'
                      }}
                      itemStyle={{ color: '#fff' }}
                      labelStyle={{ color: 'rgba(255,255,255,0.4)', marginBottom: '4px', textTransform: 'uppercase' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="Total Credits Used" 
                      stroke="var(--color-brand-accent, #55cdd1)" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorTotal)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-brand-border/20 pt-6">
                <div className="p-4 bg-brand-border/10 rounded-2xl">
                  <span className="text-[9px] text-brand-text-muted uppercase tracking-widest font-black block mb-1">Peak Consumption</span>
                  <span className="text-xl font-black text-brand-text tracking-tight uppercase">
                    {Math.max(...usageHistoryData.map(d => d['Total Credits Used'])).toFixed(1)} Credits/day
                  </span>
                </div>
                <div className="p-4 bg-brand-border/10 rounded-2xl">
                  <span className="text-[9px] text-brand-text-muted uppercase tracking-widest font-black block mb-1">Weekly projection</span>
                  <span className="text-xl font-black text-brand-text tracking-tight uppercase">
                    {(totalCreditsValue * 0.72).toFixed(1)} Credits
                  </span>
                </div>
                <div className="p-4 bg-brand-accent/5 border border-brand-accent/10 rounded-2xl">
                  <span className="text-[9px] text-brand-accent uppercase tracking-widest font-black block mb-1">Efficiency rate</span>
                  <span className="text-xl font-black text-brand-accent tracking-tight uppercase">94.8% Active</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BOOSTER PACKS */}
          {activeTab === 'booster' && (
            <div className="glass-card p-6 border-brand-border/30 bg-brand-card/10 rounded-3xl space-y-6">
              <div>
                <h3 className="text-lg font-black text-brand-text uppercase leading-tight">Instant Booster Refills</h3>
                <p className="text-brand-text-muted text-xs">Running low on storage slots or calculation frames? Boost instantly with one-time credit bundles.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: 10, amount: 10, price: '$2.99', popular: false, desc: 'Starter refill for casual flips' },
                  { id: 50, amount: 50, price: '$9.99', popular: true, desc: 'Reseller choice — locks in savings' },
                  { id: 200, amount: 200, price: '$29.99', popular: false, desc: 'Store conqueror big refill pack' }
                ].map((pack) => (
                  <div 
                    key={pack.id} 
                    className={cn(
                      "p-5 rounded-3xl border flex flex-col justify-between h-56 transition-all group relative overflow-hidden",
                      pack.popular 
                        ? "bg-brand-accent/[0.04] border-brand-accent/30 shadow-[0_4px_25px_-5px_rgba(85,205,209,0.1)]" 
                        : "bg-brand-border/5 border-brand-border/20"
                    )}
                  >
                    {pack.popular && (
                      <div className="absolute top-0 right-0 bg-brand-accent text-brand-bg text-[7.5px] font-black uppercase px-2.5 py-1 rounded-bl-xl tracking-widest">
                        Best Value
                      </div>
                    )}
                    
                    <div>
                      <div className="w-8 h-8 rounded-xl bg-brand-accent/15 border border-brand-accent/20 flex items-center justify-center mb-3">
                        <Plus className="w-4 h-4 text-brand-accent" />
                      </div>
                      <h4 className="text-xl font-black text-brand-text uppercase">{pack.amount} Scans</h4>
                      <p className="text-[10px] text-brand-text-muted mt-1 leading-tight">{pack.desc}</p>
                    </div>

                    <div className="pt-4 border-t border-brand-border/10 flex items-center justify-between">
                      <span className="text-xl font-black text-brand-text">{pack.price}</span>
                      <button 
                        onClick={() => handleBuyBooster(pack.amount)}
                        disabled={purchasingBooster !== null}
                        className={cn(
                          "px-4 py-1.5 rounded-xl font-black text-[9px] uppercase tracking-wider transition-all cursor-pointer",
                          pack.popular 
                            ? "bg-brand-accent text-brand-bg hover:brightness-115"
                            : "bg-brand-border/20 text-brand-text hover:bg-brand-border/40"
                        )}
                      >
                        {purchasingBooster === pack.amount ? (
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto" />
                        ) : 'Purchase'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {boosterCredits > 0 && (
                <div className="p-4 rounded-2xl bg-brand-accent/5 border border-brand-accent/10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-xs text-brand-text-muted">
                    <CheckCircle className="w-4.5 h-4.5 text-brand-accent" />
                    <span>Total active simulated booster balance remaining:</span>
                  </div>
                  <span className="font-extrabold text-brand-accent text-sm">+{boosterCredits} Scan Credits</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CONSUMPTION LOG */}
          {activeTab === 'history' && (
            <div className="glass-card p-6 border-brand-border/30 bg-brand-card/10 rounded-3xl space-y-4">
              <div>
                <h3 className="text-lg font-black text-brand-text uppercase leading-tight">Verification Logs</h3>
                <p className="text-brand-text-muted text-xs">Audit precise ledger deductions from AI endpoints for complete visibility.</p>
              </div>

              <div className="divide-y divide-brand-border/30 max-h-[300px] overflow-y-auto pr-2 scrollbar-none">
                {[
                  { action: 'Full Multi-Category Sweep', time: '10 mins ago', cost: '1.0 Credit', item: 'Vintage 1990s Leather Biker Jacket' },
                  { action: 'AI Chat Listing Refinement', time: '1 hr ago', cost: '0.25 Credits', item: 'Vintage 1990s Leather Biker Jacket' },
                  { action: 'API Pricing Validation', time: '5 hrs ago', cost: '0.4 Credits', item: 'Nintendo Switch Console OLED' },
                  { action: 'eBay Listing sync export', time: '1 day ago', cost: '1.0 Credit', item: 'Nintendo Switch Console OLED' },
                  { action: 'Platform verification', time: '3 days ago', cost: '1.0 Credit', item: 'Apple iPad Pro M4' },
                  { action: 'AI Chat prompt update', time: '4 days ago', cost: '0.25 Credits', item: 'Nike Dunk Low Retro' }
                ].map((log, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between text-xs font-medium">
                    <div className="flex flex-col">
                      <span className="text-brand-text font-bold">{log.action}</span>
                      <span className="text-[10px] text-brand-text-muted/60 mt-0.5">{log.item} · {log.time}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-red-400">-{log.cost}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
