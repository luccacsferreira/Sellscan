/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Camera, Search, User, LogIn, Menu, Sun, Moon, Zap, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import sellscanLogo from '../assets/sellscan_logo_transparent.png';

import { supabase } from '../lib/supabase';

interface NavbarProps {
  onNewScan?: () => void;
  onGoHome?: () => void;
  onViewHistory?: () => void;
  onViewAnalytics?: () => void;
  onViewSettings?: () => void;
  onViewDocs?: () => void;
  onViewAffiliate?: () => void;
  onSignInClick?: () => void;
  onGetStartedClick?: () => void;
  isLoggedIn?: boolean;
  currentView: string;
  userEmail?: string;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export function Navbar({ 
  onNewScan, 
  onGoHome, 
  onViewHistory,
  onViewAnalytics,
  onViewSettings,
  onViewDocs,
  onViewAffiliate,
  onSignInClick,
  onGetStartedClick,
  isLoggedIn = false, 
  currentView,
  userEmail,
  theme, 
  onToggleTheme 
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleMobileNav = (action: () => void) => {
    action();
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 px-4 md:px-8 transition-all duration-300">
        {/* Background with Blur */}
        <div 
          className="absolute inset-0 z-0 backdrop-blur-md bg-brand-bg/80 pointer-events-none"
        />
        
        {/* Bottom Border Line - Layered in front of logo */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-brand-border z-20" />
        
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between relative z-10">
          <div 
            className="flex items-center h-16 cursor-pointer group pb-0 relative"
            onClick={onGoHome}
          >
            <div className="relative h-10 w-32 md:h-12 md:w-40 flex items-center">
              <img 
                src={sellscanLogo} 
                alt="Sellscan" 
                className="h-full w-auto object-contain pointer-events-none transition-all duration-300 group-hover:scale-[1.02]"
              />
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {(isLoggedIn && currentView !== 'landing') ? (
              <>
                <button 
                  onClick={onGoHome} 
                  className="text-brand-text-muted hover:text-brand-text transition-colors text-sm font-bold uppercase tracking-widest"
                >
                  Home
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
                <button 
                  onClick={onViewAffiliate} 
                  className="text-brand-text-muted hover:text-brand-text transition-colors text-sm font-bold uppercase tracking-widest"
                >
                  Partners
                </button>
              </>
            ) : (
              <>
                <a href="#features" className="text-brand-text-muted hover:text-brand-text transition-colors text-sm font-medium">Features</a>
                <a href="#pricing" className="text-brand-text-muted hover:text-brand-text transition-colors text-sm font-medium">Pricing</a>
                <button onClick={onViewDocs} className="text-brand-text-muted hover:text-brand-text transition-colors text-sm font-medium">Documentation</button>
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
                <div className="flex items-center gap-3">
                  {currentView === 'landing' ? (
                    <>
                      <button 
                        onClick={onGetStartedClick || onSignInClick} 
                        className="bg-brand-accent hover:bg-brand-accent/90 text-brand-bg px-5 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2"
                      >
                        Get Started <LogIn className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={onViewSettings}
                        className="w-10 h-10 rounded-xl bg-brand-bg border border-brand-border flex items-center justify-center cursor-pointer hover:border-brand-accent transition-all group overflow-hidden"
                      >
                        <User className="w-5 h-5 text-brand-text-muted group-hover:text-brand-accent" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={onNewScan}
                        className="bg-brand-accent hover:bg-brand-accent/90 text-brand-bg px-5 py-2 rounded-full text-sm font-bold transition-all shadow-[0_5px_20px_-5px_var(--color-brand-accent-glow)] group flex items-center gap-2"
                      >
                        <Camera className="w-4 h-4 group-hover:scale-110 transition-transform" /> Scanner
                      </button>
                      <button 
                        onClick={onViewSettings}
                        className="w-10 h-10 rounded-xl bg-brand-bg border border-brand-border flex items-center justify-center cursor-pointer hover:border-brand-accent transition-all group overflow-hidden"
                      >
                        <User className="w-5 h-5 text-brand-text-muted group-hover:text-brand-accent" />
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <button onClick={onSignInClick} className="text-brand-text hover:text-brand-accent transition-colors text-sm font-medium">Sign in</button>
                  <button onClick={onGetStartedClick || onSignInClick} className="bg-brand-accent hover:bg-brand-accent/90 text-brand-bg px-5 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2">
                    Get Started <LogIn className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <button 
              onClick={onToggleTheme}
              className="p-2 rounded-full hover:bg-brand-card transition-colors text-brand-text-muted"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-brand-text-muted hover:text-brand-text transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[100] md:hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute inset-0 bg-brand-bg/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
               className="absolute right-0 top-0 bottom-0 w-[280px] bg-brand-bg border-l border-brand-border p-6 flex flex-col"
            >
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <img src="/favicon.png" alt="Logo" className="w-8 h-8 rounded-lg shadow-lg shadow-brand-accent/10" />
                  <span className="text-sm font-black italic tracking-tighter text-brand-text">SELLSCAN</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-brand-text-muted hover:text-brand-text transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex flex-col gap-6">
                {(isLoggedIn && currentView !== 'landing') ? (
                  <>
                    <button 
                      onClick={() => handleMobileNav(onGoHome!)} 
                      className="text-left text-lg font-bold text-brand-text flex items-center gap-3"
                    >
                      Home
                    </button>
                    <button 
                      onClick={() => handleMobileNav(onViewAnalytics!)} 
                      className="text-left text-lg font-bold text-brand-text flex items-center gap-3"
                    >
                      Analytics
                    </button>
                    <button 
                      onClick={() => handleMobileNav(onViewHistory!)} 
                      className="text-left text-lg font-bold text-brand-text flex items-center gap-3"
                    >
                      History
                    </button>
                    <button 
                      onClick={() => handleMobileNav(onViewAffiliate!)} 
                      className="text-left text-lg font-bold text-brand-text flex items-center gap-3"
                    >
                      Partner Program
                    </button>
                    <button 
                      onClick={() => handleMobileNav(onViewSettings!)} 
                      className="text-left text-lg font-bold text-brand-text flex items-center gap-3"
                    >
                      Settings
                    </button>
                    <button 
                      onClick={() => handleMobileNav(onNewScan!)} 
                      className="w-full bg-brand-accent text-brand-bg py-4 rounded-2xl font-bold mt-4 flex items-center justify-center gap-2"
                    >
                      <Camera className="w-5 h-5" /> Open Scanner
                    </button>
                  </>
                ) : (
                  <>
                    <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-brand-text">Features</a>
                    <a href="#pricing" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-brand-text">Pricing</a>
                    <button onClick={() => { setIsMobileMenuOpen(false); onViewDocs?.(); }} className="text-left text-lg font-bold text-brand-text">Documentation</button>
                    <div className="h-px bg-brand-border my-2" />
                    {isLoggedIn ? (
                      <>
                        <button 
                          onClick={() => { setIsMobileMenuOpen(false); onGetStartedClick?.(); }} 
                          className="bg-brand-accent text-brand-bg py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
                        >
                          Get Started <LogIn className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => { setIsMobileMenuOpen(false); onViewSettings?.(); }} 
                          className="text-left text-lg font-bold text-brand-text flex items-center gap-2"
                        >
                           <User className="w-5 h-5" /> Account Details
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => { setIsMobileMenuOpen(false); onSignInClick?.(); }} className="text-left text-lg font-bold text-brand-text">Sign in</button>
                        <button onClick={() => { setIsMobileMenuOpen(false); (onGetStartedClick || onSignInClick)?.(); }} className="bg-brand-accent text-brand-bg py-4 rounded-2xl font-bold flex items-center justify-center gap-2">
                          Get Started <LogIn className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>

              <div className="mt-auto py-6">
                <div className="flex items-center gap-2 text-brand-text-muted">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-widest">Sellscan AI Online</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
