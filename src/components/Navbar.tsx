/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Camera, Search, User, LogIn, Menu, Sun, Moon } from 'lucide-react';
import { cn } from '../lib/utils';

interface NavbarProps {
  onNewScan?: () => void;
  onGoHome?: () => void;
  onViewHistory?: () => void;
  onViewAnalytics?: () => void;
  onViewSettings?: () => void;
  isLoggedIn?: boolean;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export function Navbar({ 
  onNewScan, 
  onGoHome, 
  onViewHistory,
  onViewAnalytics,
  onViewSettings,
  isLoggedIn = false, 
  theme, 
  onToggleTheme 
}: NavbarProps) {
  const getLogoUrl = (filename: string) => {
    const base = import.meta.env.BASE_URL || '/';
    const cleanBase = base.endsWith('/') ? base : `${base}/`;
    return `${cleanBase}${filename}`;
  };

  const logoUrl = theme === 'dark' ? getLogoUrl('logo_white_cropped.png') : getLogoUrl('logo_black_cropped.png');

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 px-4 md:px-8 transition-all duration-300">
      {/* Background with Opaque-to-Transparent Gradient */}
      <div 
        className="absolute inset-0 z-0 backdrop-blur-md pointer-events-none"
        style={{
          background: `linear-gradient(to right, 
            var(--bg) 0%, 
            var(--bg) 180px, 
            color-mix(in srgb, var(--bg), transparent 20%) 600px)`
        }}
      />
      
      {/* Bottom Border Line - Layered in front of logo */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-brand-border z-20" />
      
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between relative z-10">
        <div 
          className="flex items-end h-16 cursor-pointer group pb-0"
          onClick={onGoHome}
        >
          <img 
            src={logoUrl} 
            alt="Sellscan" 
            className="h-14 w-auto object-contain object-bottom pointer-events-none"
          />
        </div>

        <div className="hidden md:flex items-center gap-8">
          {isLoggedIn ? (
            <>
              <button 
                onClick={onGoHome} 
                className="text-brand-text-muted hover:text-brand-text transition-colors text-sm font-bold uppercase tracking-widest"
              >
                Dashboard
              </button>
              <button 
                onClick={onViewAnalytics} 
                className="text-brand-text-muted hover:text-brand-text transition-colors text-sm font-bold uppercase tracking-widest"
              >
                Analytics
              </button>
              <button 
                onClick={onViewHistory} 
                className="text-brand-text-muted hover:text-brand-text transition-colors text-sm font-bold uppercase tracking-widest"
              >
                History
              </button>
            </>
          ) : (
            <>
              <a href="#features" className="text-brand-text-muted hover:text-brand-text transition-colors text-sm font-medium">Features</a>
              <a href="#pricing" className="text-brand-text-muted hover:text-brand-text transition-colors text-sm font-medium">Pricing</a>
            </>
          )}
          
          <div className="flex items-center gap-4">
            <button 
              onClick={onToggleTheme}
              className="p-2 rounded-full hover:bg-brand-card transition-colors text-brand-text-muted hover:text-brand-text"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {isLoggedIn ? (
              <div className="flex items-center gap-4">
                <button 
                  onClick={onNewScan}
                  className="bg-brand-accent hover:bg-brand-accent/90 text-brand-bg px-5 py-2 rounded-full text-sm font-bold transition-all shadow-[0_5px_20px_-5px_var(--color-brand-accent-glow)]"
                >
                  Scanner
                </button>
                <button 
                  onClick={onViewSettings}
                  className="w-10 h-10 rounded-xl bg-brand-bg border border-brand-border flex items-center justify-center cursor-pointer hover:border-brand-accent transition-all group"
                >
                  <User className="w-5 h-5 text-brand-text-muted group-hover:text-brand-accent" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <button className="text-brand-text hover:text-brand-accent transition-colors text-sm font-medium">Sign in</button>
                <button className="bg-brand-accent hover:bg-brand-accent/90 text-brand-bg px-5 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2">
                  Get Started <LogIn className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="md:hidden flex items-center gap-4">
          <button 
            onClick={onToggleTheme}
            className="p-2 rounded-full hover:bg-brand-card transition-colors text-brand-text-muted"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button className="text-brand-text-muted">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </nav>
  );
}
