/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LayoutDashboard, Camera, History, BarChart2, Settings, Sparkles } from 'lucide-react';
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-brand-bg/85 backdrop-blur-2xl border-t border-brand-border/50 px-8 py-3 pb-8 flex items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeView === item.id || 
                        (item.id === 'home' && ['dashboard', 'project-detail', 'analytics'].includes(activeView));
        
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={cn(
              "flex flex-col items-center gap-1.5 transition-all relative",
              item.primary ? "-mt-10 scale-110" : "active:scale-90",
              isActive ? "text-brand-accent" : "text-brand-text-muted hover:text-brand-text"
            )}
          >
            {item.primary ? (
              <div className="w-14 h-14 rounded-2xl bg-brand-accent shadow-[0_10px_30px_-5px_var(--color-brand-accent-glow)] flex items-center justify-center text-brand-bg mb-2 border border-white/20">
                <Icon className="w-7 h-7" />
              </div>
            ) : (
              <>
                <Icon className={cn("w-5 h-5 mb-0.5 transition-transform", isActive && "scale-110")} />
                {isActive && (
                  <motion.div 
                    layoutId="activeNavTab"
                    className="absolute -top-3 w-1 h-1 rounded-full bg-brand-accent shadow-[0_0_8px_var(--color-brand-accent)]"
                  />
                )}
              </>
            )}
            <span className={cn(
              "text-[9px] font-black uppercase tracking-[0.15em] transition-opacity",
              isActive ? "opacity-100" : "opacity-60",
              item.primary && "mt-1"
            )}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
