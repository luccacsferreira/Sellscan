import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, CheckCircle, Info } from 'lucide-react';
import { cn } from '../../lib/utils';

interface TutorialBoxProps {
  tutorial: string;
  active?: boolean;
  onComplete?: () => void;
}

export function TutorialBox({ tutorial, active = false, onComplete }: TutorialBoxProps) {
  React.useEffect(() => {
    if (active && onComplete) {
      const timer = setTimeout(onComplete, 800);
      return () => clearTimeout(timer);
    }
  }, [active, onComplete]);

  if (!tutorial) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "glass-card p-6 border-brand-border/10 transition-all duration-500",
        !active && "opacity-40"
      )}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-brand-accent" />
        </div>
        <div>
          <h3 className="text-[10px] font-extrabold uppercase text-brand-text-muted tracking-[0.2em] opacity-60 mb-1">Listing Tutorial</h3>
          <p className="text-sm font-bold text-brand-text">How to list it successfully</p>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-white/5 border border-brand-border/50 space-y-3">
        <div className="flex gap-3 items-start">
          <Info className="w-4 h-4 text-brand-accent shrink-0 mt-0.5" />
          <p className="text-sm text-brand-text-muted leading-relaxed whitespace-pre-wrap font-medium">
            {tutorial}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
