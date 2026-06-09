/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, HelpCircle, ArrowRight, Check, Image as ImageIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface UnclearProductSelectorProps {
  isOpen: boolean;
  imageUrl: string | null;
  options: string[];
  onSelect: (option: string | null) => void;
}

export function UnclearProductSelector({
  isOpen,
  imageUrl,
  options = [],
  onSelect
}: UnclearProductSelectorProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
        {/* Ambient Blurred Background Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-brand-bg/90 backdrop-blur-xl"
        />

        {/* Content Container Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          className="relative w-full max-w-4xl glass-card bg-brand-card/70 border-brand-border/20 shadow-[0_25px_60px_rgba(0,0,0,0.6)] rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-12"
        >
          {/* Accent decoration */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-brand-accent/10 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-brand-accent/5 blur-3xl rounded-full pointer-events-none" />

          {/* Left Column: Image context & explanatory banner */}
          <div className="md:col-span-5 p-6 md:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-brand-border/10 bg-black/20">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center mb-4 md:mb-6">
                <Sparkles className="w-5 h-5 text-brand-accent" />
              </div>
              <h3 className="text-xl md:text-2xl font-black tracking-tight leading-tight uppercase italic-none">
                AI Guidance Prompt
              </h3>
              <p className="text-brand-text-muted text-xs leading-relaxed mt-3">
                Our vision agents detected multiple distinct possibilities for this item. Selecting the correct context guarantees a hyper-accurate market report!
              </p>
            </div>

            {/* Image Preview Container */}
            <div className="my-6 md:my-8 aspect-[4/3] w-full rounded-2xl border border-brand-border/30 overflow-hidden relative bg-brand-bg/40 flex items-center justify-center group">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Analyzing context"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-brand-text-muted/30">
                  <ImageIcon className="w-8 h-8" />
                  <span className="text-[10px] font-black uppercase tracking-wider">No Image Supplied</span>
                </div>
              )}
              <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/5 text-[8px] font-black uppercase tracking-widest text-brand-accent">
                Your Scan
              </div>
            </div>

            <div className="text-[9px] font-black uppercase tracking-widest text-brand-text-muted/40 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse" />
              AWAITING CONFIRMATION
            </div>
          </div>

          {/* Right Column: Choices selection list */}
          <div className="md:col-span-7 p-6 md:p-8 flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-brand-accent">Item Refinement</span>
                <h4 className="text-lg md:text-xl font-bold tracking-tight mt-1 text-brand-text leading-tight">
                  Which item matches best?
                </h4>
              </div>

              {/* Scrollable container for up to 5 choices */}
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                {options.map((option, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.01, x: 2 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => onSelect(option)}
                    className="w-full text-left p-4 rounded-2xl bg-brand-bg/45 hover:bg-brand-accent/5 border border-brand-border/40 hover:border-brand-accent/40 transition-all flex items-center justify-between group relative overflow-hidden"
                  >
                    {/* Hover slider glow */}
                    <div className="absolute inset-y-0 left-0 w-1 bg-brand-accent transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                    
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-brand-border/10 border border-brand-border/30 flex items-center justify-center font-mono text-xs font-black text-brand-text-muted/60 group-hover:text-brand-accent group-hover:border-brand-accent/30 transition-colors">
                        0{idx + 1}
                      </div>
                      <span className="text-sm font-bold text-brand-text uppercase tracking-wide group-hover:text-brand-accent transition-colors">
                        {option}
                      </span>
                    </div>

                    <ArrowRight className="w-4 h-4 text-brand-text-muted/30 group-hover:text-brand-accent group-hover:translate-x-1 transition-all" />
                  </motion.button>
                ))}
              </div>
            </div>

            {/* I Don't Know / Skip Button */}
            <div className="mt-8 pt-6 border-t border-brand-border/10 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => onSelect(null)}
                className="flex-grow py-4 rounded-xl md:rounded-full bg-brand-accent text-brand-bg hover:brightness-105 font-black uppercase text-xs tracking-[0.2em] transition-all flex items-center justify-center gap-2 group shadow-lg shadow-brand-accent/15"
              >
                <HelpCircle className="w-4 h-4" />
                I don't know
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
