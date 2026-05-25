import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layout, Sparkles, X, ChevronRight, Check, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ScanResult } from '../../types';

interface MockupGeneratorBoxProps {
  scan: ScanResult;
  platforms: string[];
  onGenerate: (platform: string) => void;
}

export function MockupGeneratorBox({ scan, platforms, onGenerate }: MockupGeneratorBoxProps) {
  const [selected, setSelected] = useState(platforms[0] || '');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      onGenerate(selected);
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="glass-card p-0 border-brand-border/10 overflow-hidden"
    >
      <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
        <div className="md:w-1/2 space-y-6">
          <div>
            <h3 className="text-[10px] font-extrabold uppercase text-brand-text-muted tracking-[0.2em] opacity-60 mb-1">Reality Mockup Engine</h3>
            <p className="text-sm font-bold text-white/90">Preview your listing exactly as it appears live</p>
          </div>

          <div className="space-y-3">
             <span className="text-[9px] font-black uppercase tracking-widest text-brand-text-muted opacity-40">Select Target Marketplace</span>
             <div className="grid grid-cols-2 gap-2">
                {platforms.map((p) => (
                  <button 
                    key={p}
                    onClick={() => setSelected(p)}
                    className={cn(
                      "px-4 py-3 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between group",
                      selected === p ? "bg-brand-accent/10 border-brand-accent text-brand-accent" : "bg-brand-bg/40 border-brand-border text-brand-text-muted hover:border-brand-text/30"
                    )}
                  >
                    {p}
                    <div className={cn(
                      "w-4 h-4 rounded-full border flex items-center justify-center transition-all",
                      selected === p ? "bg-brand-accent border-brand-accent" : "border-brand-border"
                    )}>
                      {selected === p && <Check className="w-2.5 h-2.5 text-brand-bg stroke-[4px]" />}
                    </div>
                  </button>
                ))}
             </div>
          </div>

          <div className="pt-4 border-t border-brand-border/50">
             <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold text-brand-text-muted uppercase">Generation Cost</span>
                <span className="text-xs font-bold text-white">0.5 Credits</span>
             </div>
             <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-4 rounded-xl bg-brand-accent text-brand-bg text-[11px] font-black uppercase tracking-widest transition-all shadow-[0_10px_20px_-5px_rgba(85,205,209,0.3)] hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 overflow-hidden relative"
             >
                {isGenerating ? (
                  <>
                    <Zap className="w-4 h-4 animate-spin" /> Rendering Environments...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 fill-current" /> Generate High-Fidelity Mockup
                  </>
                )}
             </button>
          </div>
        </div>

        <div className="md:w-1/2 bg-brand-bg/60 rounded-3xl border border-brand-border border-dashed flex flex-col items-center justify-center p-8 text-center relative group">
           <div className="w-20 h-20 rounded-2xl bg-brand-bg border border-brand-border flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-500">
              <Layout className="w-10 h-10 text-brand-accent/40" />
           </div>
           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text-muted mb-2">Internal GPU Preview</p>
           <p className="text-xs text-brand-text-muted/60 max-w-[200px]">Waiting for rendering instructions. Select a platform to proceed.</p>
           
           <div className="absolute inset-0 bg-brand-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </motion.div>
  );
}
