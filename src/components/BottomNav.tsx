/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LayoutDashboard, Camera, History, BarChart2, Settings, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface BottomNavProps {
  activeView: string;
  onNavigate: (view: any) => void;
}

export function BottomNav({ activeView, onNavigate }: BottomNavProps) {
  const navItems = [
    { id: 'home', label: 'Home', icon: LayoutDashboard },
    { id: 'history', label: 'History', icon: History },
    { id: 'upload', label: 'Scan', icon: Camera, primary: true },
    { id: 'affiliate', label: 'Partner', icon: Sparkles },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-brand-bg/90 backdrop-blur-3xl border-t border-brand-border/50 px-6 py-2 pb-7 flex items-center justify-between shadow-[0_-15px_50px_rgba(0,0,0,0.4)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeView === item.id || 
                        (item.id === 'home' && ['dashboard', 'project-detail', 'analytics'].includes(activeView));
        
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={cn(
              "flex flex-col items-center gap-1 transition-all relative",
              item.primary ? "-mt-10 scale-105" : "active:scale-90",
              isActive ? "text-brand-accent" : "text-brand-text-muted hover:text-brand-text"
            )}
          >
            {item.primary ? (
              <div className="w-14 h-14 rounded-2xl bg-brand-accent shadow-[0_12px_40px_-5px_var(--color-brand-accent-glow)] flex items-center justify-center text-brand-bg mb-1.5 border border-white/20 relative group">
                <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-active:opacity-100 transition-opacity" />
                <Icon className="w-7 h-7" />
              </div>
            ) : (
              <div className="w-10 h-10 flex items-center justify-center relative">
                <Icon className={cn("w-5 h-5 transition-transform", isActive && "scale-110")} />
                {isActive && (
                  <motion.div 
                    layoutId="activeNavTab"
                    className="absolute -top-1 w-1 h-1 rounded-full bg-brand-accent shadow-[0_0_10px_var(--color-brand-accent)]"
                  />
                )}
              </div>
            )}
            <span className={cn(
              "text-[8px] font-black uppercase tracking-[0.2em] transition-all",
              isActive ? "opacity-100 translate-y-0" : "opacity-40 translate-y-0.5",
              item.primary && "mt-0"
            )}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
