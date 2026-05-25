/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X, FileQuestion, Camera, ArrowRight, CornerDownRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'error' | 'warning' | 'info';
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export function NotificationModal({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'warning',
  actionLabel,
  onAction,
  icon
}: NotificationModalProps) {
  if (!isOpen) return null;

  const isError = type === 'error';
  const isWarning = type === 'warning';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-brand-bg/85 backdrop-blur-xl"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md glass-card p-8 bg-brand-card/90 border-brand-border/10 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        >
          {/* Decorative Corner Glow */}
          <div className={cn(
            "absolute -top-10 -right-10 w-32 h-32 blur-3xl opacity-20",
            isError ? "bg-red-500" : isWarning ? "bg-brand-accent" : "bg-blue-500"
          )} />

          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl hover:bg-white/5 text-brand-text-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center text-center space-y-6">
            <div className={cn(
              "w-16 h-16 rounded-3xl flex items-center justify-center border transition-transform duration-500 hover:rotate-12",
              isError ? "bg-red-500/10 border-red-500/20 text-red-400" : 
              isWarning ? "bg-brand-accent/10 border-brand-accent/20 text-brand-accent" :
              "bg-blue-500/10 border-blue-500/20 text-blue-400"
            )}>
              {icon || (isError ? <AlertTriangle className="w-8 h-8" /> : isWarning ? <FileQuestion className="w-8 h-8" /> : <Camera className="w-8 h-8" />)}
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black italic tracking-tight">{title}</h2>
              <p className="text-brand-text-muted text-sm leading-relaxed max-w-[280px]">
                {message}
              </p>
            </div>

            <div className="w-full pt-4 space-y-3">
              {actionLabel && onAction && (
                <button
                  onClick={() => {
                    onAction();
                    onClose();
                  }}
                  className={cn(
                    "w-full py-4 rounded-xl font-black uppercase text-xs tracking-[0.2em] transition-all flex items-center justify-center gap-2",
                    isError ? "bg-red-500 text-white" : "bg-brand-accent text-brand-bg shadow-[0_10px_20px_-5px_rgba(85,205,209,0.3)] hover:scale-[1.02]"
                  )}
                >
                  {actionLabel}
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
              
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl border border-white/5 text-[10px] font-black uppercase tracking-widest text-brand-text-muted hover:text-white hover:bg-white/5 transition-all"
              >
                Dismiss
              </button>
            </div>
            
            <div className="flex items-start gap-2 bg-black/20 p-3 rounded-lg text-left w-full group">
              <CornerDownRight className="w-3 h-3 text-brand-accent shrink-0 mt-0.5 opacity-40 group-hover:opacity-100 transition-opacity" />
              <p className="text-[10px] font-medium text-brand-text-muted/60 leading-tight italic">
                {isWarning 
                  ? "Try to upload a clearer photo with professional lighting or describe the item properties in the text field."
                  : "Check the file format (PNG, JPG) and ensure it's less than 10MB."
                }
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
