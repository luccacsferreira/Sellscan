import React from 'react';
import { motion } from 'motion/react';
import { Check, X, Zap, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface PricingCardProps {
  tier: string;
  priceLabel: string;
  description: string;
  features: { text: string; included: boolean }[];
  cta: string;
  variant: 'muted' | 'accent' | 'primary';
  popular?: boolean;
  credits: string;
  isActive: boolean;
  isAnyHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  onAction?: () => void;
  isLoading?: boolean;
  originalPrice?: string;
}

export function PricingCard({ 
  tier, 
  priceLabel, 
  description, 
  features, 
  cta, 
  variant, 
  popular, 
  credits,
  isActive,
  isAnyHovered,
  onHover,
  onLeave,
  onAction,
  isLoading,
  originalPrice
}: PricingCardProps) {
  return (
    <motion.div 
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      variants={{
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0 }
      }}
      className={cn(
        "bg-brand-card p-8 lg:p-10 relative flex flex-col transition-all duration-500 group overflow-visible border rounded-[2.5rem] w-[85vw] sm:w-[320px] lg:w-auto shrink-0 snap-center",
        isActive 
          ? "border-brand-accent shadow-[0_0_60px_-10px_rgba(85,205,209,0.6)] lg:scale-[1.08] z-20 ring-2 ring-brand-accent/40" 
          : isAnyHovered 
            ? "border-brand-border/20 opacity-40 blur-[2px] lg:scale-[0.95] grayscale-[0.5]" 
            : (popular 
                ? "border-brand-accent/50 shadow-[0_0_40px_-10px_rgba(85,205,209,0.4)] z-10" 
                : "border-brand-border hover:border-brand-accent/20")
      )}
    >
      {popular && (
        <div className={cn(
          "absolute -top-[2px] left-0 right-0 h-10 rounded-t-[2.5rem] flex items-center justify-center text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 z-0",
          isActive || (!isAnyHovered && popular)
            ? "bg-brand-accent text-slate-900 shadow-[0_-10px_20px_-5px_rgba(85,205,209,0.3)]"
            : "bg-brand-border/40 text-brand-text-muted/60"
        )}>
          Most Popular
        </div>
      )}
      
      <div className={cn("mb-8 transition-all duration-500", popular ? "mt-10" : "mt-0")}>
        <div className="flex items-center justify-between mb-3">
          <h3 className={cn(
            "text-2xl font-bold tracking-tight mb-2 transition-all duration-300", 
            isActive || (!isAnyHovered && popular) ? "text-brand-text" : "text-brand-text/80"
          )}>
            {tier}
          </h3>
        </div>
        <p className="text-[13px] text-brand-text-muted/70 leading-relaxed mb-8 h-10 font-medium">
          {description}
        </p>
        
        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold tracking-tighter text-brand-text">{priceLabel}</span>
            <span className="text-brand-text-muted/60 text-sm font-semibold">/mo</span>
          </div>
          {originalPrice && (
            <div className="text-sm text-brand-text-muted/30 font-bold line-through mt-1">
              {originalPrice}
            </div>
          )}
        </div>

        <div className={cn(
          "inline-flex items-center gap-2 px-4 py-1.5 rounded-xl transition-all duration-300 border font-bold text-[11px] uppercase tracking-wider",
          isActive || (!isAnyHovered && popular)
            ? "bg-brand-accent/10 border-brand-accent/20 text-brand-accent" 
            : "bg-brand-bg/50 border-brand-border/50 text-brand-text-muted/80"
        )}>
          <Zap className="w-3.5 h-3.5 fill-current" /> {credits}
        </div>
      </div>

      <div className="h-px bg-brand-border/50 w-full mb-8" />

      <div className="space-y-4 mb-10 flex-grow">
        <p className="text-[10px] font-bold text-brand-text-muted/45 uppercase tracking-widest mb-2 px-1">Plan highlights:</p>
        {features.map((f, i) => (
          <div key={i} className={cn(
            "flex items-start gap-4 text-[13px] transition-all duration-300 font-medium",
            f.included 
              ? (isActive || (!isAnyHovered && popular) ? "text-brand-text" : "text-brand-text-muted") 
              : "text-brand-text-muted/40"
          )}>
            <div className={cn(
              "mt-0.5 shrink-0 transition-all duration-300",
              f.included ? "text-emerald-500" : "text-brand-text-muted/30"
            )}>
              {f.included ? <Check className="w-4 h-4" strokeWidth={3} /> : <X className="w-4 h-4" strokeWidth={3} />}
            </div>
            <span className="leading-tight tracking-tight">{f.text}</span>
          </div>
        ))}
      </div>

      <button 
        onClick={onAction}
        disabled={isLoading}
        className={cn(
          "w-full py-4 rounded-xl font-bold text-xs transition-all duration-300 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border-2",
          isActive 
            ? "bg-brand-accent border-brand-accent text-slate-900 shadow-md hover:brightness-105" 
            : "bg-transparent border-brand-border/80 text-brand-text-muted hover:border-brand-accent/40 hover:text-brand-text"
        )}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-slate-900/20 border-t-slate-900 rounded-full animate-spin" />
        ) : (
          cta === 'Get started free' ? 'Get started' : `Get ${tier}`
        )}
      </button>
    </motion.div>
  );
}
