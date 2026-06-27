import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Info } from 'lucide-react';
import { cn, formatAmount, formatPrice } from '../../lib/utils';
import { Typewriter } from './Typewriter';

interface PriceRange {
  min: number;
  max: number;
  sweetSpot: number;
}

interface PriceInsightBoxProps {
  worthRange: PriceRange;
  sellRange: PriceRange;
  currencySymbol: string;
  active?: boolean;
  onComplete?: () => void;
}

export function PriceInsightBox({ worthRange, sellRange, currencySymbol, active = false, onComplete }: PriceInsightBoxProps) {
  const [localStage, setLocalStage] = React.useState(0);

  React.useEffect(() => {
    if (!active) {
      setLocalStage(0);
    }
  }, [active]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      <PriceCard 
        title="Market Worth" 
        subtitle="Intrinsic Item Value"
        range={worthRange} 
        currency={currencySymbol}
        gradient="from-neutral-700 via-neutral-500 to-neutral-700"
        credits="Refine: 0.5"
        isStageActive={active}
        isTypingActive={active && localStage >= 0}
        onComplete={() => setLocalStage(1)}
      />
      <PriceCard 
        title="Listing Strategy" 
        subtitle="Optimal Selling Range"
        range={sellRange} 
        currency={currencySymbol}
        gradient="from-brand-accent/40 via-brand-accent to-brand-accent/40"
        credits="Refine: 0.2"
        active
        isStageActive={active && localStage >= 1}
        isTypingActive={active && localStage >= 1}
        onComplete={onComplete}
      />
    </motion.div>
  );
}

function PriceCard({ title, subtitle, range, currency, gradient, active, credits, isStageActive, isTypingActive, onComplete }: any) {
  const denominator = range.max - range.min;
  const percentage = denominator === 0 ? 50 : ((range.sweetSpot - range.min) / denominator) * 100;

  return (
    <div className={cn(
      "glass-card p-6 flex flex-col relative overflow-hidden border-brand-border/10 transition-all duration-500",
      active && "border-brand-accent/20 bg-brand-accent/5",
      !isStageActive && "opacity-40"
    )}>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-[10px] font-extrabold uppercase text-brand-text-muted tracking-[0.2em] opacity-60 mb-1">{title}</h3>
          <p className="text-xs text-brand-text-muted font-medium italic">{subtitle}</p>
        </div>
      </div>

      <div className="flex flex-col mb-8">
        <span className="text-xs font-bold text-brand-text-muted mb-2 block">Recommended Sweet Price:</span>
        <span className={cn("text-5xl font-black tracking-tighter min-h-[3rem] block", active ? "text-brand-accent" : "text-brand-text")}>
          {isTypingActive ? (
            <Typewriter text={formatPrice(range.sweetSpot, currency)} speed={25} onComplete={onComplete} />
          ) : (
            <span className="opacity-25 blur-[1.5px]">{currency}0,00</span>
          )}
        </span>
      </div>

      <div className="space-y-4">
        <div className="relative h-4 w-full bg-brand-bg rounded-full overflow-hidden border border-brand-border/50">
          <div className={cn("absolute inset-0 bg-gradient-to-r transition-all duration-1000", isStageActive ? gradient : "from-transparent to-transparent bg-neutral-800")} style={{ width: isStageActive ? '100%' : '0%' }} />
          {isStageActive && (
            <motion.div 
              initial={{ left: "0%" }}
              animate={{ left: `${percentage}%` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_white] z-10"
            />
          )}
        </div>
        <div className="relative h-10 w-full mt-2 text-[10px] font-black uppercase tracking-widest text-brand-text-muted">
          <div className="absolute left-0 top-0 flex flex-col items-start">
            <span className="opacity-40 mb-1">Bottom</span>
            <span className="text-brand-text/80">
              {isStageActive ? (
                <span>{formatPrice(range.min, currency)}</span>
              ) : (
                <span className="opacity-25 blur-[1px]">{currency}00,00</span>
              )}
            </span>
          </div>
          <motion.div 
            initial={{ left: "0%" }}
            animate={{ left: isStageActive ? `clamp(15%, ${percentage}%, 85%)` : '0%' }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute top-0 flex flex-col items-center text-brand-accent"
            style={{ transform: 'translateX(-50%)' }}
          >
            <span className="text-brand-accent mb-1 font-medium">Sweet Spot</span>
            <span className="text-brand-accent">
              {isStageActive ? (
                <span>{formatPrice(range.sweetSpot, currency)}</span>
              ) : (
                <span className="opacity-25 blur-[1px]">{currency}00,00</span>
              )}
            </span>
          </motion.div>
          <div className="absolute right-0 top-0 flex flex-col items-end">
            <span className="opacity-40 mb-1">Peak</span>
            <span className="text-brand-text/80">
              {isStageActive ? (
                <span>{formatPrice(range.max, currency)}</span>
              ) : (
                <span className="opacity-25 blur-[1px]">{currency}00,00</span>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
