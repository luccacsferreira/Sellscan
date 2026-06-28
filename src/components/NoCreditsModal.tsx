import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertCircle, Zap, ArrowRight, CreditCard } from 'lucide-react';
import { AIPlan } from '../types';

interface NoCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  plan: AIPlan;
}

export function NoCreditsModal({ isOpen, onClose, onUpgrade, plan }: NoCreditsModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-brand-bg border border-brand-border rounded-3xl p-6 md:p-8 z-[101] shadow-2xl overflow-hidden"
          >
            {/* Background effects */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-brand-text-muted hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center mt-4">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              
              <h2 className="text-2xl font-black mb-3 uppercase tracking-tight">Out of Credits</h2>
              
              <p className="text-brand-text-muted mb-8 max-w-[280px]">
                You have reached the maximum number of scans allowed for your current {plan === 'free' ? 'Explorer' : 'plan'}. 
              </p>

              <div className="w-full space-y-3">
                <button
                  onClick={() => {
                    onClose();
                    onUpgrade();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-brand-accent text-brand-bg font-bold hover:scale-[1.02] transition-all"
                >
                  <Zap className="w-5 h-5" />
                  Upgrade Plan
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onUpgrade();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl border border-brand-border text-brand-text hover:bg-white/5 transition-all"
                >
                  <CreditCard className="w-5 h-5" />
                  Buy Booster Credits
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
