import React from 'react';
import { motion } from 'motion/react';
import { Zap } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Typewriter } from './Typewriter';

interface VerdictBoxProps {
  verdict: string;
  highlighted?: boolean;
  active?: boolean;
  onComplete?: () => void;
}

export function VerdictBox({ verdict, highlighted, active = true, onComplete }: VerdictBoxProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "glass-card p-6 border-brand-accent/30 bg-brand-accent/5 accent-glow relative overflow-hidden",
        highlighted && "accent-glow border-brand-accent scale-[1.01]"
      )}
    >
      <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-accent shadow-[0_0_15px_-2px_var(--color-brand-accent)]" />
      <div className="flex items-center gap-2 text-brand-accent text-xs font-bold uppercase tracking-wider mb-3">
        <Zap className="w-3 h-3 fill-current" /> Quick Verdict
      </div>
      <p className="text-2xl font-bold leading-tight tracking-tight text-brand-text/90 min-h-[3rem]">
        {active ? (
          <Typewriter text={verdict || 'Analyzing product potential...'} speed={8} onComplete={onComplete} />
        ) : (
          <span className="opacity-25 blur-[1.5px] select-none">Analyzing product potential...</span>
        )}
      </p>
    </motion.div>
  );
}
