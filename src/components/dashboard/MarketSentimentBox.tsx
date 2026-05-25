import React from 'react';
import { motion } from 'motion/react';
import { MessageSquare, ThumbsUp, ThumbsDown, Globe } from 'lucide-react';
import { cn } from '../../lib/utils';

interface MarketSentimentBoxProps {
  sentiment: {
    consensus: string;
    goodThings: string[];
    badThings: string[];
  };
}

export function MarketSentimentBox({ sentiment }: MarketSentimentBoxProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="glass-card p-6 border-brand-border/10"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-[10px] font-extrabold uppercase text-brand-text-muted tracking-[0.2em] opacity-60 mb-1">Market Sentiment Analysis</h3>
          <p className="text-xs text-brand-text-muted font-medium">Real-time owner feedback & community consensus</p>
        </div>
        <div className="flex -space-x-2">
           <div className="w-8 h-8 rounded-full border-2 border-brand-bg bg-neutral-800 flex items-center justify-center text-[10px] font-black">Y</div>
           <div className="w-8 h-8 rounded-full border-2 border-brand-bg bg-blue-600 flex items-center justify-center text-[10px] font-black">R</div>
           <div className="w-8 h-8 rounded-full border-2 border-brand-bg bg-orange-600 flex items-center justify-center text-[10px] font-black">F</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 p-6 rounded-2xl bg-brand-bg/40 border border-brand-border/50 flex flex-col justify-center">
          <div className="flex items-center gap-2 text-brand-accent mb-4">
            <Globe className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Global Consensus</span>
          </div>
          <p className="text-sm font-bold text-white/90 leading-relaxed italic">
            "{sentiment.consensus}"
          </p>
        </div>

        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-500">
              <ThumbsUp className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Positive Drivers</span>
            </div>
            <ul className="space-y-2">
              {sentiment.goodThings.map((item, i) => (
                <li key={i} className="flex items-start gap-3 p-3 rounded-xl bg-green-500/5 border border-green-500/10 text-[11px] text-brand-text-muted leading-tight font-medium">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-red-400">
              <ThumbsDown className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Friction Points</span>
            </div>
            <ul className="space-y-2">
              {sentiment.badThings.map((item, i) => (
                <li key={i} className="flex items-start gap-3 p-3 rounded-xl bg-red-400/5 border border-red-400/10 text-[11px] text-brand-text-muted leading-tight font-medium">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
