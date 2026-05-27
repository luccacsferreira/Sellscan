import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Wrench, Check, Plus, Star } from 'lucide-react';
import { cn } from '../../lib/utils';
import { PracticalTip } from '../../types';

interface PracticalTipsBoxProps {
  tips: PracticalTip[];
  basePrice: number;
  currencySymbol: string;
}

export function PracticalTipsBox({ tips, basePrice, currencySymbol }: PracticalTipsBoxProps) {
  const [selectedTips, setSelectedTips] = useState<number[]>([]);

  const toggleTip = (index: number) => {
    setSelectedTips(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const addedValue = selectedTips.reduce((acc, idx) => acc + (tips[idx]?.valueAdd || 0), 0);
  const finalPrice = basePrice + addedValue;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="glass-card p-6 border-brand-border/10"
    >
      <div className="mb-8">
        <h3 className="text-[10px] font-extrabold uppercase text-brand-text-muted tracking-[0.2em] opacity-60 mb-1">Value Injection Protocol</h3>
        <p className="text-xs text-brand-text-muted font-medium">Physical refinements to shift your item into a higher tier</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {tips.map((tip, i) => (
          <button
            key={i}
            onClick={() => toggleTip(i)}
            className={cn(
              "p-5 rounded-2xl border transition-all text-left flex flex-col gap-3 group relative overflow-hidden",
              selectedTips.includes(i) 
                ? "bg-brand-accent/10 border-brand-accent shadow-[0_0_15px_-5px_rgba(85,205,209,0.3)]" 
                : "bg-brand-bg/40 border-brand-border hover:border-brand-text/30"
            )}
          >
            <div className="flex justify-between items-start">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                selectedTips.includes(i) ? "bg-brand-accent text-brand-bg" : "bg-brand-bg border border-brand-border group-hover:border-brand-accent/50"
              )}>
                <Wrench className="w-5 h-5" />
              </div>
              <div className={cn(
                "w-5 h-5 rounded-full border flex items-center justify-center transition-all",
                selectedTips.includes(i) ? "bg-brand-accent border-brand-accent" : "border-brand-border"
              )}>
                {selectedTips.includes(i) && <Check className="w-3 h-3 text-brand-bg stroke-[4px]" />}
              </div>
            </div>
            
            <div>
              <h4 className={cn("font-bold text-sm mb-1 transition-colors", selectedTips.includes(i) ? "text-brand-accent" : "text-brand-text")}>{tip.action}</h4>
              <p className="text-[11px] text-brand-text-muted leading-relaxed line-clamp-2">{tip.description}</p>
            </div>

            <div className="mt-auto pt-4 flex items-center justify-between border-t border-brand-border/30">
              <span className="text-[10px] font-bold text-brand-accent uppercase">+{currencySymbol}{tip.valueAdd}</span>
              <span className={cn(
                "text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter",
                tip.impact === 'high' ? "bg-green-500/10 text-green-500" : 
                tip.impact === 'medium' ? "bg-amber-500/10 text-amber-500" : "bg-blue-500/10 text-blue-500"
              )}>
                {tip.impact} impact
              </span>
            </div>
          </button>
        ))}
      </div>

      <div className="p-6 rounded-2xl bg-brand-bg/60 border border-brand-border border-dashed flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest mb-1">Base Sweet Spot</span>
            <span className="text-xl font-bold text-brand-text/60">{currencySymbol}{basePrice.toFixed(2)}</span>
          </div>
          <div className="text-brand-text-muted">
            <Plus className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest mb-1">Total Value Add</span>
            <span className="text-xl font-bold text-brand-accent">+{currencySymbol}{addedValue.toFixed(2)}</span>
          </div>
        </div>

        <div className="h-12 w-px bg-brand-border hidden md:block" />

        <div className="flex flex-col items-center md:items-end">
          <div className="flex items-center gap-2 mb-1">
            <Star className="w-3 h-3 text-brand-accent fill-current" />
            <span className="text-[10px] font-extrabold text-brand-accent uppercase tracking-widest">New Target Price</span>
          </div>
          <span className="text-4xl font-black tracking-tighter text-brand-text">
            {currencySymbol}{finalPrice.toFixed(2)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
