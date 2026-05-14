/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LayoutDashboard, Camera, History, BarChart2, Settings } from 'lucide-react';
import { cn } from '../lib/utils';

interface BottomNavProps {
  activeView: string;
  onNavigate: (view: any) => void;
}

export function BottomNav({ activeView, onNavigate }: BottomNavProps) {
  const navItems = [
    { id: 'home', label: 'Home', icon: LayoutDashboard },
    { id: 'upload', label: 'Scan', icon: Camera, primary: true },
    { id: 'history', label: 'History', icon: History },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-brand-bg/80 backdrop-blur-lg border-t border-brand-border px-6 py-3 pb-8 flex items-center justify-between">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeView === item.id || 
                        (item.id === 'home' && ['dashboard', 'project-detail', 'analytics'].includes(activeView));
        
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={cn(
              "flex flex-col items-center gap-1 transition-all",
              item.primary ? "-mt-8" : "",
              isActive ? "text-brand-accent" : "text-brand-text-muted"
            )}
          >
            {item.primary ? (
              <div className="w-14 h-14 rounded-2xl bg-brand-accent shadow-[0_10px_25px_-5px_var(--color-brand-accent-glow)] flex items-center justify-center text-brand-bg mb-1">
                <Icon className="w-7 h-7" />
              </div>
            ) : (
              <Icon className="w-6 h-6" />
            )}
            <span className={cn(
              "text-[10px] font-bold uppercase tracking-widest",
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
