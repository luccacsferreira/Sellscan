import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Zap, X, Cloud, WifiOff, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';

interface DiscountTimerProps {
  variant?: 'compact' | 'full';
  onClose?: () => void;
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

export function DiscountTimer({ variant = 'full', onClose }: DiscountTimerProps) {
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
      <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white border border-blue-200 text-blue-600 shadow-[0_4px_12px_rgba(37,99,235,0.08)] relative overflow-hidden group">
        {/* Animated clouds in background */}
        <motion.div 
          animate={{ x: [0, 8, 0], y: [0, -4, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -right-2 -top-2 text-blue-200/40 pointer-events-none"
        >
          <Cloud className="w-8 h-8 fill-current" />
        </motion.div>
        
        <div className="flex items-center gap-2">
          {isOffline ? (
            <WifiOff className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
          ) : (
            <Clock className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
          )}
          <span className="text-[10px] font-black uppercase tracking-widest font-mono text-blue-700">
            {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
          </span>
        </div>
        <div className="h-4 w-px bg-blue-100" />
        <span className="text-[9px] font-black uppercase tracking-tighter text-blue-600 group-hover:text-blue-800 transition-colors whitespace-nowrap">
          {isOffline ? 'Offline Active' : 'Discount Active'}
        </span>
      </div>
    );
  }

  return (
    <div className="relative p-8 md:p-10 rounded-[2.5rem] bg-white border-2 border-blue-100/80 shadow-[0_20px_50px_rgba(59,130,246,0.18)] text-center flex flex-col items-center overflow-visible">
      
      {/* Surrounded by Beautiful Blue Clouds */}
      <BlueCloud className="-top-12 -left-12 w-32 h-24" delay={0} scale={1.1} />
      <BlueCloud className="-top-16 -right-12 w-36 h-28" delay={1.5} scale={1.0} />
      <BlueCloud className="-bottom-12 -left-16 w-36 h-28" delay={0.7} scale={1.05} />
      <BlueCloud className="-bottom-16 -right-10 w-32 h-24" delay={2.2} scale={0.95} />
      <BlueCloud className="-left-20 top-1/3 w-28 h-20" delay={3.0} scale={0.9} />
      <BlueCloud className="-right-20 top-1/2 w-28 h-20" delay={1.2} scale={0.9} />

      {/* Internal decorative mini clouds for depth */}
      <div className="absolute inset-x-0 bottom-0 top-0 overflow-hidden rounded-[2.3rem] pointer-events-none opacity-40">
        <div className="absolute left-6 top-12 text-blue-100/60 w-16 h-12"><Cloud className="w-full h-full fill-current" /></div>
        <div className="absolute right-12 bottom-16 text-blue-100/60 w-20 h-16"><Cloud className="w-full h-full fill-current" /></div>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        
        {/* Offline Protection / Status Badge */}
        <div className="mb-5">
          {isOffline ? (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-black uppercase tracking-wider shadow-sm animate-pulse">
              <WifiOff className="w-3.5 h-3.5" />
              <span>Offline Mode • Live Timer Running</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-xs font-black uppercase tracking-wider shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Offline-Resilient Timer Active</span>
            </div>
          )}
        </div>

        <div className="w-16 h-16 rounded-2xl bg-blue-50 border-2 border-blue-100 flex items-center justify-center mb-6 shadow-[0_8px_20px_rgba(59,130,246,0.15)]">
          <Zap className="w-8 h-8 text-blue-600 fill-current" />
        </div>
        
        <h2 className="text-3xl md:text-4xl font-extrabold mb-3 tracking-tight text-blue-950 uppercase">
          Exclusive Launch Discount
        </h2>
        <p className="text-blue-700/80 text-sm mb-8 max-w-md font-semibold leading-relaxed">
          Lock in your lifetime "Founder" rates before the timer hits zero. 
          Save up to 31% on all annual plans. Fully offline-resilient countdown enabled.
        </p>

        {/* Timer Box with Blue Accents & White Box inner style */}
        <div className="flex gap-4 mb-10">
          <TimerUnit value={timeLeft.hours} label="Hours" />
          <div className="text-3xl font-black text-blue-300 mt-2 animate-pulse">:</div>
          <TimerUnit value={timeLeft.minutes} label="Minutes" />
          <div className="text-3xl font-black text-blue-300 mt-2 animate-pulse">:</div>
          <TimerUnit value={timeLeft.seconds} label="Seconds" />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <button 
            onClick={onClose}
            className="flex-1 px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_12px_25px_-5px_rgba(37,99,235,0.4)]"
          >
            Claim Discount Now
          </button>
          <button 
            onClick={onClose}
            className="flex-1 px-8 py-4 rounded-2xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 font-extrabold uppercase tracking-widest transition-all"
          >
            Maybe Later
          </button>
        </div>
      </div>
      
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl bg-blue-50 border border-blue-100 text-blue-500 hover:text-blue-700 hover:bg-blue-100 transition-all z-20"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

function TimerUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 border-2 border-blue-100 flex items-center justify-center text-3xl font-extrabold text-blue-600 shadow-[0_4px_12px_rgba(59,130,246,0.1)] tabular-nums">
        {String(value).padStart(2, '0')}
      </div>
      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-500/80">{label}</span>
    </div>
  );
}
