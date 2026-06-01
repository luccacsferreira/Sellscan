import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Briefcase, 
  TrendingUp, 
  Clock, 
  ArrowRight, 
  Search, 
  LayoutGrid, 
  BarChart3,
  Plus,
  Percent,
  Link as LinkIcon,
  Copy,
  Check,
  Wallet
} from 'lucide-react';
import { ScanResult, Project, UserStats, AffiliateProfile } from '../types';
import { cn } from '../lib/utils';
import { useLocation } from '../lib/LocationContext';
import { supabase } from '../lib/supabase';
import { partnerService, PartnerLink } from '../services/partnerService';

const CURRENCY_SYMBOLS: Record<string, string> = {
  'GBP': '£',
  'USD': '$',
  'EUR': '€',
  'BRL': 'R$'
};

interface DashboardHomeProps {
  stats: UserStats;
  recentScans: ScanResult[];
  projects: Project[];
  onStartNewScan: () => void;
  onCreateProject: () => void;
  onViewProject: (project: Project) => void;
  onViewAllScans: () => void;
  onViewAnalytics: () => void;
  onViewAffiliate?: () => void;
}

export function DashboardHome({ 
  stats, 
  recentScans, 
  projects, 
  onStartNewScan,
  onCreateProject,
  onViewProject,
  onViewAllScans,
  onViewAnalytics,
  onViewAffiliate
}: DashboardHomeProps) {
  const { currency } = useLocation();
  const currencySymbol = CURRENCY_SYMBOLS[currency] || currency;

  // Local state for partner/affiliate quick stats
  const [userId, setUserId] = useState<string | null>(null);
  const [partnerProfile, setPartnerProfile] = useState<AffiliateProfile | null>(null);
  const [partnerLinks, setPartnerLinks] = useState<PartnerLink[]>([]);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  useEffect(() => {
    const fetchPartnerData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          const prof = partnerService.getSimulatedProfile(user.id);
          setPartnerProfile(prof);
          const links = partnerService.getPartnerLinks(user.id);
          setPartnerLinks(links);
        }
      } catch (err) {
        console.error('Failed to load partner summary info:', err);
      }
    };
    fetchPartnerData();
  }, []);

  const handleCopy = (code: string) => {
    const url = `${window.location.origin}/${code}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(code);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-12">
      {/* Header with quick actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome back.</h1>
          <p className="text-sm md:text-base text-brand-text-muted leading-tight">Your personal commerce command center.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={onCreateProject}
            className="px-6 py-3 rounded-xl bg-brand-bg border border-brand-border hover:border-brand-accent/50 transition-all font-bold flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
          <button 
            onClick={onStartNewScan}
            className="px-8 py-3 rounded-xl bg-brand-accent text-brand-bg font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_10px_30px_-10px_var(--color-brand-accent-glow)] flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            Scanner
          </button>
        </div>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<Search className="w-5 h-5" />}
          label="Total Scans"
          value={stats.totalScans.toString()}
          trend="+12% from last week"
        />
        <StatCard 
          icon={<TrendingUp className="w-5 h-5" />}
          label="Market Value"
          value={`${currencySymbol}${stats.totalMarketValue.toLocaleString()}`}
          trend="Based on 20+ sources"
        />
        <StatCard 
          icon={<BarChart3 className="w-5 h-5" />}
          label="Avg. Resale"
          value={`${currencySymbol}${stats.averageSweetSpot.toFixed(0)}`}
          trend="Optimal sweet spot"
        />
        <div 
          onClick={onViewAnalytics}
          className="glass-card p-6 bg-brand-accent/5 border-brand-accent/20 cursor-pointer group hover:bg-brand-accent/10 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-brand-accent text-brand-bg flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-brand-text-muted mb-1">Analytics</h3>
            <p className="text-lg font-bold">View full report</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Recent Projects */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LayoutGrid className="w-5 h-5 text-brand-accent" />
              <h2 className="text-xl font-bold">Active Projects</h2>
            </div>
            <button className="text-sm font-bold text-brand-accent hover:underline">View All</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {projects.length > 0 ? (
              projects.map(project => (
                <div 
                  key={project.id}
                  onClick={() => onViewProject(project)}
                  className="glass-card group cursor-pointer hover:border-brand-accent/30 transition-all overflow-hidden"
                >
                  <div className="h-2 w-full" style={{ backgroundColor: project.color }} />
                  <div className="p-6">
                    <h3 className="text-lg font-bold mb-1 group-hover:text-brand-accent transition-colors">{project.name}</h3>
                    <p className="text-brand-text-muted text-sm line-clamp-2 mb-4">{project.description}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-xs font-mono text-brand-text-muted uppercase tracking-wider">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-brand-bg border border-brand-border flex items-center justify-center group-hover:bg-brand-accent group-hover:text-brand-bg transition-all">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 border-2 border-dashed border-brand-border rounded-2xl p-12 text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-brand-bg border border-brand-border flex items-center justify-center mb-6">
                   <Briefcase className="w-8 h-8 text-brand-text-muted" />
                </div>
                <h3 className="text-lg font-bold mb-2">No projects yet</h3>
                <p className="text-brand-text-muted mb-6">Organize your scans into projects for better management.</p>
                <button 
                  onClick={onCreateProject}
                  className="px-6 py-2 rounded-full border border-brand-accent text-brand-accent font-bold hover:bg-brand-accent hover:text-brand-bg transition-all"
                >
                  Create your first project
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Scans AND partner dashboard widget */}
        <div className="space-y-8">
          {/* Recent Activity */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-brand-accent" />
                <h2 className="text-xl font-bold">Recent Activity</h2>
              </div>
              <button onClick={onViewAllScans} className="text-sm font-bold text-brand-accent hover:underline">History</button>
            </div>

            <div className="space-y-3">
              {recentScans.slice(0, 4).map(scan => (
                <div 
                  key={scan.id}
                  className="p-3 rounded-xl bg-brand-bg border border-brand-border flex items-center gap-3 hover:border-brand-accent/20 transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-lg bg-brand-border overflow-hidden flex-shrink-0">
                    {scan.imageUrl ? (
                      <img src={scan.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-brand-text-muted">
                        <Search className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold truncate group-hover:text-brand-accent transition-colors">{scan.analysis?.suggestedTitle || 'Untitled Scan'}</h4>
                    <p className="text-xs text-brand-text-muted">{currencySymbol}{scan.analysis?.priceRange?.sweetSpot || 0}</p>
                  </div>
                  <div className="text-[10px] font-mono text-brand-text-muted uppercase">
                    {new Date(scan.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              ))}
              {recentScans.length === 0 && (
                <p className="text-center py-12 text-brand-text-muted italic border border-brand-border rounded-xl">
                  No recent activity.
                </p>
              )}
            </div>
          </div>

          {/* Quick Partner summary block */}
          {userId && partnerProfile && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 bg-brand-accent/5 border-brand-accent/20 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-brand-accent">
                  <Percent className="w-4 h-4" />
                  <span className="text-xs font-black uppercase tracking-widest">Partner Earnings</span>
                </div>
                {onViewAffiliate && (
                  <button 
                    onClick={onViewAffiliate}
                    className="text-[10px] text-brand-text-muted font-bold uppercase tracking-wider hover:text-brand-accent flex items-center gap-0.5"
                  >
                    Manage
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 border-b border-brand-border pb-4">
                <div>
                  <span className="text-[9px] text-brand-text-muted uppercase tracking-wider font-extrabold block">Commission Balance</span>
                  <span className="text-2xl font-black text-white tabular-nums">${partnerProfile.totalEarnings.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-[9px] text-brand-text-muted uppercase tracking-wider font-extrabold block">Total Leads</span>
                  <span className="text-2xl font-black text-white tabular-nums">{partnerProfile.referralCount}</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[9px] text-brand-text-muted uppercase tracking-wider font-extrabold flex items-center gap-1">
                  <LinkIcon className="w-3 h-3 text-brand-accent" />
                  Quick Campaign Links
                </span>
                <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
                  {partnerLinks.slice(0, 2).map(link => (
                    <div key={link.id} className="flex items-center justify-between bg-brand-bg px-3 py-2 rounded-lg border border-brand-border text-[11px]">
                      <div className="truncate pr-2">
                        <span className="font-bold text-white block truncate">{link.label}</span>
                        <span className="font-mono text-[9px] text-white/50 truncate block">{window.location.origin}/{link.code}</span>
                      </div>
                      <button 
                        onClick={() => handleCopy(link.code)}
                        className="p-1 px-1.5 bg-brand-accent/15 rounded text-brand-accent hover:bg-brand-accent hover:text-brand-bg transition-colors"
                        title="Copy promo link"
                      >
                        {copiedLink === link.code ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  ))}
                  {partnerLinks.length === 0 && (
                    <p className="text-[10px] text-brand-text-muted italic">No promotion links created yet.</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, trend }: { icon: React.ReactNode, label: string, value: string, trend: string }) {
  return (
    <div className="glass-card p-6">
      <div className="w-10 h-10 rounded-xl bg-brand-bg border border-brand-border flex items-center justify-center mb-6 text-brand-accent">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-brand-text-muted mb-1">{label}</h3>
        <p className="text-3xl font-bold mb-2 tabular-nums">{value}</p>
        <p className="text-xs text-brand-text-muted flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-brand-accent animate-pulse" />
          {trend}
        </p>
      </div>
    </div>
  );
}
