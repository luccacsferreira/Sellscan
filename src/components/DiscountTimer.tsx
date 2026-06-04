import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Zap, X, Cloud } from 'lucide-react';
import { cn } from '../lib/utils';

interface DiscountTimerProps {
  variant?: 'compact' | 'full';
  onClose?: () => void;
}

export function DiscountTimer({ variant = 'full', onClose }: DiscountTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);
  
  useEffect(() => {
    // Check for existing start time or set new one
    let targetTime = localStorage.getItem('sellscan_discount_deadline');
    
    if (!targetTime) {
      const deadline = Date.now() + (48 * 60 * 60 * 1000); // 48 hours from now
      localStorage.setItem('sellscan_discount_deadline', deadline.toString());
      targetTime = deadline.toString();
    }

    const timer = setInterval(() => {
      const now = Date.now();
      const diff = parseInt(targetTime!) - now;

      if (diff <= 0) {
        setTimeLeft(null);
        clearInterval(timer);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!timeLeft) return null;

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-brand-accent/10 border border-brand-accent/20 text-brand-accent shadow-[0_0_15px_rgba(85,205,209,0.1)] relative overflow-hidden group">
        {/* Animated clouds in background */}
        <motion.div 
          animate={{ x: [0, 10, 0], y: [0, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -right-2 -top-2 text-brand-accent/10 opacity-40 pointer-events-none"
        >
          <Cloud className="w-8 h-8 fill-current" />
        </motion.div>
        
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest font-mono">
            {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
          </span>
        </div>
        <div className="h-4 w-px bg-brand-accent/20" />
        <span className="text-[9px] font-black uppercase tracking-tighter opacity-80 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Discount Active
        </span>
      </div>
    );
  }

  return (
    <div className="relative p-8 rounded-[2.5rem] bg-[#0A0E12] border border-brand-border/40 overflow-hidden shadow-2xl">
      {/* Decorative Blue Clouds background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ x: Math.random() * 400 - 200, y: Math.random() * 200 - 100, opacity: 0.1 }}
            animate={{ 
              x: [null, Math.random() * 400 - 200],
              y: [null, Math.random() * 200 - 100],
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ 
              duration: 10 + Math.random() * 10, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute text-brand-accent"
          >
            <Cloud 
              className="fill-current" 
              style={{ 
                width: 100 + Math.random() * 150, 
                height: 100 + Math.random() * 150,
                filter: 'blur(30px)'
              }} 
            />
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(85,205,209,0.2)]">
          <Zap className="w-8 h-8 text-brand-accent fill-current" />
        </div>
        
        <h2 className="text-3xl font-black mb-2 tracking-tight text-white uppercase italic-none">
          Exclusive Launch Discount
        </h2>
        <p className="text-brand-text-muted text-sm mb-8 max-w-md font-medium leading-relaxed">
          Lock in your lifetime "Founder" rates before the timer hits zero. 
          Save up to 31% on all annual plans.
        </p>

        {/* Timer Box */}
        <div className="flex gap-4 mb-10">
          <TimerUnit value={timeLeft.hours} label="Hours" />
          <div className="text-3xl font-black text-brand-accent/40 mt-2">:</div>
          <TimerUnit value={timeLeft.minutes} label="Minutes" />
          <div className="text-3xl font-black text-brand-accent/40 mt-2">:</div>
          <TimerUnit value={timeLeft.seconds} label="Seconds" />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <button 
            onClick={onClose}
            className="flex-1 px-8 py-4 rounded-2xl bg-brand-accent text-brand-bg font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_20px_40px_-10px_rgba(85,205,209,0.4)]"
          >
            Claim Discount Now
          </button>
          <button 
            onClick={onClose}
            className="flex-1 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-brand-text-muted font-black uppercase tracking-widest hover:bg-white/10 transition-all"
          >
            Maybe Later
          </button>
        </div>
      </div>
      
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 border border-white/10 text-brand-text-muted hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

function TimerUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="w-16 h-16 rounded-2xl bg-brand-bg/50 border border-brand-accent/20 flex items-center justify-center text-3xl font-black text-brand-accent shadow-xl backdrop-blur-xl tabular-nums">
        {String(value).padStart(2, '0')}
      </div>
      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-text-muted/60">{label}</span>
    </div>
  );
}
