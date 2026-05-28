import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, TrendingUp, Info, ChevronDown, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import { PlatformInsight } from '../../types';

interface PlatformStrategyBoxProps {
  platforms: PlatformInsight[];
  currencySymbol: string;
  active?: boolean;
  onComplete?: () => void;
}

export function PlatformStrategyBox({ platforms, currencySymbol, active = false, onComplete }: PlatformStrategyBoxProps) {
  const [showAll, setShowAll] = useState(false);
  const displayedPlatforms = showAll ? platforms.slice(0, 10) : platforms.slice(0, 5);

  React.useEffect(() => {
    if (active && onComplete) {
      const timer = setTimeout(onComplete, 1200);
      return () => clearTimeout(timer);
    }
  }, [active, onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "glass-card p-6 border-brand-border/10 overflow-hidden transition-all duration-500",
        !active && "opacity-40"
      )}
    >
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-brand-border/50">
        <div>
          <h3 className="text-[10px] font-extrabold uppercase text-brand-text-muted tracking-[0.2em] opacity-60 mb-1">Omni-Channel Strategy</h3>
          <p className="text-xs text-brand-text-muted font-medium">Cross-platform arbitrage and profit optimization</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex flex-col items-end">
             <span className="text-[9px] font-bold text-brand-text-muted uppercase">Global Market Avg.</span>
             <span className="text-sm font-bold text-brand-text">
                {currencySymbol}{(platforms.reduce((acc, p) => acc + (p.avgPrice || 0), 0) / (platforms.length || 1)).toFixed(2)}
             </span>
           </div>
        </div>
      </div>

      <div className="hidden md:grid grid-cols-12 gap-4 mb-4 px-4 text-[9px] font-black uppercase tracking-widest text-brand-text-muted">
        <div className="col-span-3">Platform</div>
        <div className="col-span-3">Competitive Edge</div>
        <div className="col-span-2">List At</div>
        <div className="col-span-2">Listing Avg.</div>
        <div className="col-span-2 text-right">Est. Profit</div>
      </div>

      <div className="space-y-2">
        {displayedPlatforms.map((p, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
            transition={{ delay: i * 0.12, duration: 0.35, ease: "easeOut" }}
            className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 rounded-xl bg-brand-bg/40 border border-brand-border/40 hover:border-brand-accent/40 transition-all group items-center"
          >
            <div className="md:col-span-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-bg border border-brand-border flex items-center justify-center text-[10px] font-black text-brand-accent">
                {i + 1}
              </div>
              <span className="font-bold text-brand-text group-hover:text-brand-accent transition-colors">{p.name}</span>
            </div>
            
            <div className="md:col-span-3">
              <span className="text-[11px] font-medium text-brand-text-muted leading-relaxed italic">
                "{p.edge}"
              </span>
            </div>

            <div className="md:col-span-2">
              <span className="text-sm font-black text-brand-accent">{currencySymbol}{p.listPrice.toFixed(2)}</span>
            </div>

            <div className="md:col-span-2">
              <span className="text-xs font-medium text-brand-text-muted">{currencySymbol}{p.avgPrice.toFixed(2)}</span>
            </div>

            <div className="md:col-span-2 text-right">
              <div className="flex flex-col items-end">
                <span className="text-sm font-black text-brand-text">{currencySymbol}{p.profit.toFixed(2)}</span>
                <span className="text-[9px] text-green-500 font-bold uppercase tracking-wider">After Fees</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {!showAll && platforms.length > 5 && (
        <button 
          onClick={() => setShowAll(true)}
          className="mt-6 w-full py-4 rounded-xl border border-brand-accent/20 bg-brand-accent/5 text-brand-accent text-[11px] font-black uppercase tracking-widest hover:bg-brand-accent/10 transition-all flex items-center justify-center gap-2"
        >
          View Top 10 Marketplace Targets (0.2 Credits) <ChevronDown className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
}
