import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Zap, X, Cloud, WifiOff, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';

interface DiscountTimerProps {
  variant?: 'compact' | 'full';
  onClose?: () => void;
  onClaimDiscount?: () => void;
}

// A beautiful parameterized BlueCloud sub-component to surround the card
function BlueCloud({ className, style, delay = 0, scale = 1 }: { className?: string; style?: React.CSSProperties; delay?: number; scale?: number }) {
  return (
    <motion.div
      initial={{ y: 0, x: 0 }}
      animate={{ 
        y: [0, -8, 0],
        x: [0, 5, 0],
        scale: [scale, scale * 1.05, scale]
      }}
      transition={{ 
        duration: 6 + Math.random() * 4, 
        repeat: Infinity, 
        ease: "easeInOut",
        delay: delay 
      }}
      className={cn("absolute pointer-events-none text-blue-200/50 fill-blue-100/40 filter drop-shadow-[0_8px_16px_rgba(59,130,246,0.15)]", className)}
      style={style}
    >
      <Cloud className="w-full h-full fill-current" />
    </motion.div>
  );
}

// A beautiful horizontal traveling cloud component with undulating vertical drift
function TravelingCloud({ 
  top, 
  bottom, 
  delay = 0, 
  duration = 20, 
  scale = 1,
  className,
  yPattern = [0, -12, 18, -12, 0]
}: { 
  top?: string; 
  bottom?: string; 
  delay?: number; 
  duration?: number; 
  scale?: number;
  className?: string;
  yPattern?: number[];
}) {
  return (
    <motion.div
      initial={{ left: "-30%", y: 0, opacity: 0 }}
      animate={{ 
        left: ["-30%", "115%"],
        y: yPattern,
        opacity: [0, 0.45, 0.55, 0.45, 0],
        scale: [scale, scale * 1.12, scale * 0.95, scale * 1.08, scale]
      }}
      transition={{ 
        duration: duration, 
        repeat: Infinity, 
        ease: "linear",
        delay: delay 
      }}
      className={cn("absolute pointer-events-none text-blue-200/50 fill-blue-100/40 filter drop-shadow-[0_8px_16px_rgba(59,130,246,0.12)] z-0", className)}
      style={{ top, bottom }}
    >
      <Cloud className="w-full h-full fill-current" />
    </motion.div>
  );
}

export function DiscountTimer({ variant = 'full', onClose, onClaimDiscount }: DiscountTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);
  const [isOffline, setIsOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false);
  
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

    // Track online/offline status to guarantee offline assurance
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(timer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!timeLeft) return null;

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white dark:bg-brand-card border border-blue-200 dark:border-brand-border text-blue-600 dark:text-brand-accent shadow-[0_4px_12px_rgba(37,99,235,0.08)] relative overflow-hidden group">
        {/* Animated clouds in background */}
        <motion.div 
          animate={{ x: [0, 8, 0], y: [0, -4, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -right-2 -top-2 text-blue-200/40 dark:text-blue-900/10 pointer-events-none"
        >
          <Cloud className="w-8 h-8 fill-current" />
        </motion.div>
        
        <div className="flex items-center gap-2">
          {isOffline ? (
            <WifiOff className="w-3.5 h-3.5 text-blue-500 dark:text-brand-accent animate-pulse" />
          ) : (
            <Clock className="w-3.5 h-3.5 text-blue-500 dark:text-brand-accent animate-pulse" />
          )}
          <span className="text-[10px] font-black uppercase tracking-widest font-mono text-blue-700 dark:text-brand-accent">
            {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
          </span>
        </div>
        <div className="h-4 w-px bg-blue-100 dark:bg-brand-border" />
        <span className="text-[9px] font-black uppercase tracking-tighter text-blue-600 dark:text-brand-accent/80 group-hover:text-blue-800 dark:group-hover:text-brand-accent transition-colors whitespace-nowrap">
          {isOffline ? 'Offline Active' : 'Discount Active'}
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-visible">
      {/* 2-3 slow traveling, undulating background clouds crossing horizontally */}
      <TravelingCloud top="-12%" duration={20} delay={0} scale={1.1} className="w-32 h-24" />
      <TravelingCloud top="35%" duration={26} delay={5} scale={0.9} className="w-24 h-18" yPattern={[0, 15, -12, 10, 0]} />
      <TravelingCloud bottom="-8%" duration={23} delay={10} scale={1.0} className="w-28 h-22" yPattern={[0, -10, 15, -8, 0]} />

      {/* Subtle static matching framing clouds anchored at the corner borders */}
      <BlueCloud className="-top-10 -left-6 w-24 h-18 opacity-45 dark:opacity-10" delay={0} scale={1.0} />
      <BlueCloud className="-bottom-8 -right-6 w-24 h-18 opacity-45 dark:opacity-10" delay={1.5} scale={1.0} />

      {/* Main beautiful White Card Box */}
      <div className="relative p-8 md:p-10 rounded-[2.5rem] bg-white dark:bg-brand-card border-2 border-blue-100/80 dark:border-brand-border/85 shadow-[0_20px_50px_rgba(59,130,246,0.18)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-center flex flex-col items-center overflow-hidden z-10">
        
        {/* Internal decorative mini clouds inside the card bounds for deep depth */}
        <div className="absolute inset-x-0 bottom-0 top-0 overflow-hidden rounded-[2.3rem] pointer-events-none opacity-20 dark:opacity-5">
          <div className="absolute left-6 top-12 text-blue-100/40 w-16 h-12"><Cloud className="w-full h-full fill-current" /></div>
          <div className="absolute right-12 bottom-16 text-blue-100/40 w-20 h-16"><Cloud className="w-full h-full fill-current" /></div>
        </div>

        <div className="relative z-10 flex flex-col items-center">
          
          {/* Offline Protection / Status Badge */}
          <div className="mb-5">
            {isOffline ? (
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-black uppercase tracking-wider shadow-sm animate-pulse">
                <WifiOff className="w-3.5 h-3.5" />
                <span>Offline Mode • Live Timer Running</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-brand-accent/10 border border-blue-200 dark:border-brand-accent/30 text-blue-600 dark:text-brand-accent text-xs font-black uppercase tracking-wider shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Offline-Resilient Timer Active</span>
              </div>
            )}
          </div>

          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-brand-accent/10 border-2 border-blue-100 dark:border-brand-accent/20 flex items-center justify-center mb-6 shadow-[0_8px_20px_rgba(59,130,246,0.15)] dark:shadow-none">
            <Zap className="w-8 h-8 text-blue-600 dark:text-brand-accent fill-current" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3 tracking-tight text-blue-950 dark:text-white uppercase">
            Exclusive Launch Discount
          </h2>
          <p className="text-blue-700/80 dark:text-brand-text-muted text-sm mb-8 max-w-md font-semibold leading-relaxed">
            Lock in your lifetime "Reseller" rates before the timer hits zero. 
            Save up to 31% on all annual plans. Fully offline-resilient countdown enabled.
          </p>

          {/* Timer Box with Blue Accents & White Box inner style */}
          <div className="flex gap-4 mb-10">
            <TimerUnit value={timeLeft.hours} label="Hours" />
            <div className="text-3xl font-black text-blue-300 dark:text-brand-border mt-2 animate-pulse">:</div>
            <TimerUnit value={timeLeft.minutes} label="Minutes" />
            <div className="text-3xl font-black text-blue-300 dark:text-brand-border mt-2 animate-pulse">:</div>
            <TimerUnit value={timeLeft.seconds} label="Seconds" />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <button 
              onClick={onClaimDiscount || onClose}
              className="flex-1 px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 dark:bg-brand-accent dark:hover:bg-brand-accent/90 text-white dark:text-[#0F1216] font-extrabold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_12px_25px_-5px_rgba(37,99,235,0.4)] dark:shadow-none"
            >
              Claim Discount Now
            </button>
            <button 
              onClick={onClose}
              className="flex-1 px-8 py-4 rounded-2xl bg-blue-50 hover:bg-blue-100 dark:bg-transparent dark:hover:bg-white/5 border border-blue-200 dark:border-brand-border text-blue-600 dark:text-brand-text-muted font-extrabold uppercase tracking-widest transition-all"
            >
              Maybe Later
            </button>
          </div>
        </div>
        
        {onClose && (
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-xl bg-blue-50 dark:bg-brand-card border border-blue-100 dark:border-brand-border text-blue-500 dark:text-brand-text-muted hover:text-blue-700 dark:hover:text-brand-text hover:bg-blue-100 dark:hover:bg-white/5 transition-all z-20"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}

function TimerUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-brand-bg/60 border-2 border-blue-100 dark:border-brand-border flex items-center justify-center text-3xl font-extrabold text-blue-600 dark:text-brand-accent shadow-[0_4px_12px_rgba(59,130,246,0.1)] dark:shadow-none tabular-nums">
        {String(value).padStart(2, '0')}
      </div>
      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-500/80 dark:text-brand-text-muted/60">{label}</span>
    </div>
  );
}
