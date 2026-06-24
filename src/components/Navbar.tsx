/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Camera, Search, User, LogIn, Menu, Sun, Moon, Zap, X, Sparkles, Info, Settings, CreditCard, Gift, BookOpen, HelpCircle, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import sellscanLogo from '../assets/sellscan_logo_transparent.png';
import { AIPlan } from '../types';

import { supabase } from '../lib/supabase';

interface NavbarProps {
  onNewScan?: () => void;
  onGoHome?: () => void;
  onViewHistory?: () => void;
  onViewAnalytics?: () => void;
  onViewSettings?: () => void;
  onViewDocs?: () => void;
  onViewAffiliate?: () => void;
  onViewPricing?: () => void;
  onSignInClick?: () => void;
  onGetStartedClick?: () => void;
  isLoggedIn?: boolean;
  currentView: string;
  userEmail?: string;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onToggleLanguage?: () => void;
  rightElement?: React.ReactNode;
  
  // Credit specific props
  currentScan?: any;
  plan?: AIPlan;
  spentCredits?: {
    scans: number;
    messages: number;
    integration: number;
  };
  onViewCredits?: () => void;
}

export function Navbar({ 
  onNewScan, 
  onGoHome, 
  onViewHistory,
  onViewAnalytics,
  onViewSettings,
  onViewDocs,
  onViewAffiliate,
  onViewPricing,
  onSignInClick,
  onGetStartedClick,
  isLoggedIn = false, 
  currentView,
  userEmail,
  theme, 
  onToggleTheme,
  onToggleLanguage,
  rightElement,
  currentScan,
  plan = 'free',
  spentCredits = { scans: 0, messages: 0, integration: 0 },
  onViewCredits
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isCreditsPopoverOpen, setIsCreditsPopoverOpen] = React.useState(false);

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
          <div className="flex items-center gap-2 relative">
            <div 
              className="flex items-center h-16 cursor-pointer group pb-0 relative"
              onClick={() => {
                if (currentScan && currentView === 'dashboard') {
                  setIsCreditsPopoverOpen(prev => !prev);
                } else if (onGoHome) {
                  onGoHome();
                }
              }}
            >
              <div className="relative h-10 w-28 md:h-12 md:w-36 flex items-center">
                <img 
                  src={sellscanLogo} 
                  alt="Sellscan" 
                  className="h-full w-auto object-contain pointer-events-none transition-all duration-300 group-hover:scale-[1.02]"
                />
              </div>
            </div>

            {currentScan && currentView === 'dashboard' && (
              <div 
                className="flex items-center gap-2 px-2 py-1 rounded-xl bg-white/[0.02] border border-brand-border/30 backdrop-blur-sm cursor-pointer hover:bg-white/[0.06] transition-all shrink-0"
                onClick={() => setIsCreditsPopoverOpen(prev => !prev)}
              >
                <span className="text-brand-text-muted/60 font-black font-mono text-xs">/</span>
                <div className="w-6 h-6 rounded-lg overflow-hidden border border-brand-border/40 shrink-0">
                  <img 
                    src={currentScan.imageUrl} 
                    alt="Scan thumbnail" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover" 
                  />
                </div>
                <span className="text-[10px] md:text-xs font-black tracking-tight text-white/95 uppercase max-w-[100px] md:max-w-[170px] truncate leading-none">
                  {currentScan.analysis?.suggestedTitle || currentScan.description || "Active Product"}
                </span>
              </div>
            )}

            {/* Credit usage popover sliding dropdown */}
            <AnimatePresence>
              {isCreditsPopoverOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40 bg-transparent" 
                    onClick={() => setIsCreditsPopoverOpen(false)} 
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    className="absolute top-14 left-0 w-80 bg-brand-bg/95 border border-brand-border p-5 rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] backdrop-blur-2xl z-50 text-brand-text flex flex-col gap-4 text-left"
                  >
                    {/* Popover Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white uppercase tracking-wider">Credit usage</span>
                        <Info className="w-3.5 h-3.5 text-brand-border" />
                      </div>
                      <span className="text-[9px] font-bold text-brand-text-muted/60 uppercase">Renews 7/1/26 12am UTC</span>
                    </div>

                    <div className="space-y-3 pt-1">
                      {/* Message Credits */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span className="text-brand-text-muted">Message credits</span>
                          <span>{spentCredits.messages} / {
                            (plan === 'free' ? 25 : plan === 'basic' ? 150 : plan === 'reseller' ? 1000 : 5000)
                          }</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-brand-border/30 overflow-hidden">
                          <div 
                            className="h-full bg-brand-accent rounded-full" 
                            style={{ 
                              width: `${Math.min(100, (spentCredits.messages / (plan === 'free' ? 25 : plan === 'basic' ? 150 : plan === 'reseller' ? 1000 : 5000)) * 100)}%` 
                            }} 
                          />
                        </div>
                        <div className="text-[9px] text-brand-text-muted/50 font-bold uppercase tracking-wider">Daily limit: 0/5</div>
                      </div>

                      {/* Integration Credits */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span className="text-brand-text-muted">Integration credits</span>
                          <span>{spentCredits.integration} / {
                            (plan === 'free' ? 100 : plan === 'basic' ? 500 : plan === 'reseller' ? 2500 : 10000)
                          }</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-brand-border/30 overflow-hidden">
                          <div 
                            className="h-full bg-brand-accent/70 rounded-full" 
                            style={{ 
                              width: `${Math.min(100, (spentCredits.integration / (plan === 'free' ? 100 : plan === 'basic' ? 500 : plan === 'reseller' ? 2500 : 10000)) * 100)}%` 
                            }} 
                          />
                        </div>
                      </div>
                    </div>

                    {/* Upgrade button */}
                    <button 
                      onClick={() => {
                        setIsCreditsPopoverOpen(false);
                        onViewPricing?.();
                      }}
                      className="w-full py-2.5 rounded-2xl bg-brand-accent/15 border border-brand-accent/20 text-brand-accent text-xs font-black uppercase text-center hover:bg-brand-accent hover:text-brand-bg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" /> Upgrade your plan
                    </button>

                    {/* Menu links from screenshot */}
                    <div className="flex flex-col border-t border-brand-border/30 pt-2.5 gap-1.5 shrink-0">
                      {[
                        { icon: <Settings className="w-3.5 h-3.5 animate-none" />, label: 'Settings', action: onViewSettings },
                        { icon: <CreditCard className="w-3.5 h-3.5 animate-none" />, label: 'Pricing plans', action: onViewPricing },
                        { icon: <Gift className="w-3.5 h-3.5 animate-none" />, label: 'Win free credits', action: () => alert("👋 Win Free Credits!\n\nEarn 25% commissions + lifetime scan credits when someone subscribes using your link in the Partner program!") },
                        { icon: <BookOpen className="w-3.5 h-3.5 animate-none" />, label: 'Documentation', action: onViewDocs },
                        { icon: <HelpCircle className="w-3.5 h-3.5 animate-none" />, label: 'Get help', action: () => alert("Need assistance? Send an email to support@sellscan.ai and our agents will respond in under an hour.") }
                      ].map((item, idx) => (
                        <button 
                          key={idx}
                          onClick={() => {
                            setIsCreditsPopoverOpen(false);
                            item.action?.();
                          }}
                          className="flex items-center gap-2.5 py-1 text-xs font-bold text-brand-text-muted hover:text-white transition-colors cursor-pointer text-left w-full"
                        >
                          <span className="text-brand-text-muted/65 group-hover:text-white">{item.icon}</span>
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Underlined view credit usage text from user */}
                    <div className="text-center pt-2 border-t border-brand-border/20">
                      <button 
                        onClick={() => {
                          setIsCreditsPopoverOpen(false);
                          onViewCredits?.();
                        }}
                        className="text-xs text-brand-accent font-bold hover:brightness-110 underline decoration-brand-accent/30 underline-offset-4 cursor-pointer"
                      >
                        view your credit usage
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {(isLoggedIn && currentView !== 'landing') ? (
              <>
                <button 
                  onClick={onGoHome} 
                  className={cn("text-brand-text-muted hover:text-brand-text transition-colors text-sm font-bold uppercase tracking-widest", currentView === 'home' && "text-brand-font-black font-semibold text-brand-accent")}
                >
                  Home
                </button>
                <button 
                  onClick={onViewAnalytics} 
                  className={cn("text-brand-text-muted hover:text-brand-text transition-colors text-sm font-bold uppercase tracking-widest", currentView === 'analytics' && "text-brand-font-black font-semibold text-brand-accent")}
                >
                  Analytics
                </button>
                <button 
                  onClick={onViewHistory} 
                  className={cn("text-brand-text-muted hover:text-brand-text transition-colors text-sm font-bold uppercase tracking-widest", currentView === 'history' && "text-brand-font-black font-semibold text-brand-accent")}
                >
                  History
                </button>
                <button 
                  onClick={onViewPricing} 
                  className={cn("text-brand-text-muted hover:text-brand-text transition-colors text-sm font-bold uppercase tracking-widest", currentView === 'pricing' && "text-brand-font-black font-semibold text-brand-accent")}
                >
                  Pricing
                </button>
                <button 
                  onClick={onViewAffiliate} 
                  className={cn("text-brand-text-muted hover:text-brand-text transition-colors text-sm font-bold uppercase tracking-widest", currentView === 'affiliate' && "text-brand-font-black font-semibold text-brand-accent")}
                >
                  Partners
                </button>
              </>
            ) : (
              <>
                <a href="#features" className="text-brand-text-muted hover:text-brand-text transition-colors text-sm font-medium">Features</a>
                <button onClick={onViewPricing} className="text-brand-text-muted hover:text-brand-text transition-colors text-sm font-medium">Pricing</button>
                <button onClick={onViewDocs} className="text-brand-text-muted hover:text-brand-text transition-colors text-sm font-medium">Documentation</button>
              </>
            )}
            
            <div className="flex items-center gap-4">
              {rightElement && (
                <div className="hidden lg:block">
                  {rightElement}
                </div>
              )}
              <button 
                onClick={onToggleTheme}
                className="p-2 rounded-full hover:bg-brand-card transition-colors text-brand-text-muted hover:text-brand-text"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              {onToggleLanguage && (
                <button 
                  onClick={onToggleLanguage}
                  className="p-2 rounded-full hover:bg-brand-card transition-colors text-brand-text-muted hover:text-brand-text"
                  aria-label="Toggle language"
                >
                  <Globe className="w-5 h-5" />
                </button>
              )}

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
            {onToggleLanguage && (
              <button 
                onClick={onToggleLanguage}
                className="p-2 rounded-full hover:bg-brand-card transition-colors text-brand-text-muted"
                aria-label="Toggle language"
              >
                <Globe className="w-5 h-5" />
              </button>
            )}
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
                      onClick={() => handleMobileNav(onViewPricing!)} 
                      className="text-left text-lg font-bold text-brand-text flex items-center gap-3"
                    >
                      Pricing
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
                    <button onClick={() => { setIsMobileMenuOpen(false); onViewPricing?.(); }} className="text-left text-lg font-bold text-brand-text">Pricing</button>
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
