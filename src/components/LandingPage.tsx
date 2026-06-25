/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Camera, Type, ArrowRight, Zap, TrendingUp, MessageSquare, Quote, Search, Check, X, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { PricingCard } from './PricingCard';
import { getPriceId, getPricingDisplay } from '../lib/stripe';
import af1Example from '../assets/Example_Image.jpeg';
import clothesImg from '../assets/clothes.png';
import voiceImg from '../assets/voice.png';
import qImg from '../assets/q.png';
import pontoImg from '../assets/ponto.png';
import wImg from '../assets/w.png';
import eImg from '../assets/e.png';
import photoImg from '../assets/photo-1491553895911-0055eca6402d.png';
import aImg from '../assets/a.png';
import bImg from '../assets/b.png';
import aaImg from '../assets/aa.png';
import ppImg from '../assets/pp.png';
import pokemonImg from '../assets/pokemon.png';
import glassesImg from '../assets/glasses.png';
import shoeImg from '../assets/612eQB-fcqL._AC_UF894,1000_QL80_.png';
import slImg from '../assets/s-l400.png';
import clocksImg from '../assets/antique-clocks.png';

import { VerdictBox } from './dashboard/VerdictBox';
import { IdentityBox } from './dashboard/IdentityBox';
import { PriceInsightBox } from './dashboard/PriceInsightBox';
import { PlatformStrategyBox } from './dashboard/PlatformStrategyBox';
import { PracticalTipsBox } from './dashboard/PracticalTipsBox';
import { MarketSentimentBox } from './dashboard/MarketSentimentBox';
import { PriceTrendBox } from './dashboard/PriceTrendBox';
import { MockupGeneratorBox } from './dashboard/MockupGeneratorBox';
import { AssistantSidebar } from './dashboard/AssistantSidebar';
import { PlatformMockup } from './dashboard/PlatformMockup';
import { ProductAnalysis, ScanResult } from '../types';

const mockAnalysis: ProductAnalysis = {
  quickVerdict: "Nike Air Jordan 1 Mid \"Gym Red/Black Toe\" (2021). Iconic colorway featuring a white leather base with black overlays and red accents. Released August 2021. High demand on major resale platforms and marketplaces.",
  platforms: [
    { name: "StockX", edge: "Authentication", listPrice: 120, avgPrice: 110, profit: 95 },
    { name: "GOAT", edge: "Sneakerhead Audience", listPrice: 125, avgPrice: 115, profit: 98 },
    { name: "eBay", edge: "Low Fees", listPrice: 110, avgPrice: 100, profit: 95 },
    { name: "Grailed", edge: "Streetwear community", listPrice: 115, avgPrice: 105, profit: 90 },
  ],
  priceRange: { min: 85, max: 145, sweetSpot: 102, platformAverage: 115, currency: "GBP" },
  worthRange: { min: 110, max: 150, sweetSpot: 125 },
  productDetails: {
    name: "Air Jordan 1 Mid Gym Red",
    type: "Sneakers",
    condition: "Excellent",
    brand: "Nike",
    category: "Apparel",
    characteristics: ["Red/Black Toe", "Original Box"],
    releaseYear: 2021
  },
  practicalTips: [
    { action: "Deep clean leather", impact: "high", valueAdd: 25, description: "Adds £20-30 perceived value." },
    { action: "Re-lace neatly", impact: "low", valueAdd: 5, description: "Clean presentation matters for primary photo." },
    { action: "Include original box clearly", impact: "high", valueAdd: 30, description: "Major platforms require it for 'Deadstock' or pristine condition." },
  ],
  marketSentiment: {
    consensus: "Positive",
    goodThings: ["Iconic Chicago-esque colors", "High liquidity"],
    badThings: ["Mids have slightly less prestige than Highs", "Creases easily"]
  },
  priceHistory: {
    month: [
      { date: "Aug 01", price: 110 },
      { date: "Aug 08", price: 108 },
      { date: "Aug 15", price: 112 },
      { date: "Aug 22", price: 115 },
      { date: "Aug 29", price: 115 },
    ],
    year: [
      { date: "Oct '23", price: 145 },
      { date: "Dec '23", price: 135 },
      { date: "Feb '24", price: 130 },
      { date: "Apr '24", price: 125 },
      { date: "Jun '24", price: 120 },
      { date: "Aug '24", price: 115 }
    ],
    allTime: [
      { date: "2021", price: 180 },
      { date: "2022", price: 165 },
      { date: "2023", price: 145 },
      { date: "2024", price: 115 }
    ],
    isLive: true,
    limitedHistory: false
  }
};

const mockScan: ScanResult = {
  id: "example-id",
  timestamp: Date.now(),
  imageUrl: af1Example,
  analysis: mockAnalysis,
};

interface LandingPageProps {
  onStart: () => void;
  onSignIn: (tier?: string) => void;
  isLoggedIn: boolean;
}

export function LandingPage({ onStart, onSignIn, isLoggedIn }: LandingPageProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [activeLegalModal, setActiveLegalModal] = useState<'privacy' | 'terms' | 'data' | 'cookies' | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<number | null>(null);
  const [showCookieConsent, setShowCookieConsent] = useState(false);
  const [selectedMockup, setSelectedMockup] = useState<string | null>(null);

  useEffect(() => {
    const accepted = localStorage.getItem('sellscan_cookies_accepted');
    if (!accepted) {
      const timer = setTimeout(() => {
        setShowCookieConsent(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptCookies = (accepted: boolean) => {
    localStorage.setItem('sellscan_cookies_accepted', accepted ? 'true' : 'false');
    setShowCookieConsent(false);
  };

  const handleCheckout = async (tier: string) => {
    if (tier === 'Free') {
      onStart();
      return;
    }

    try {
      setLoadingTier(tier);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        onSignIn(tier); // Open auth modal and save intent
        return;
      }

      let priceId = getPriceId(tier, billingCycle);

      if (!priceId) {
        alert("Action Required: This tier or billing cycle is not configured with a Price ID yet.");
        setLoadingTier(null);
        return;
      }

      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          userId: session.user.id,
          userEmail: session.user.email,
        }),
      });

      if (!response.ok) {
        let errorMessage = `Server responded with ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          try {
            const text = await response.text();
            if (text) errorMessage = text;
          } catch (e2) {}
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("💳 Checkout session created:", data);
      
      if (data.url) {
        // Use top-level navigation to ensure Stripe Checkout opens even from an iframe
        try {
          window.top!.location.href = data.url;
        } catch (e) {
          window.location.href = data.url;
        }
      } else {
        throw new Error("No checkout URL returned from server");
      }
    } catch (err: any) {
      console.error("Checkout failed:", err);
      alert("Checkout could not be started: " + (err.message || "Unknown error") + "\n\nTip: Please contact support if the issue persists.");
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <div className="pt-32 pb-20 px-4">
      <AnimatePresence>
        {selectedMockup && (
          <PlatformMockup
            platform={selectedMockup}
            scan={{...mockScan, id: 'landing-demo'}}
            onClose={() => setSelectedMockup(null)}
          />
        )}
      </AnimatePresence>
      {/* Hero Section */}
      <section className="max-w-5xl mx-auto text-center mb-32 relative">
        {/* Abstract Background element */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-accent/5 rounded-full blur-[120px] pointer-events-none -z-10" />
        
        <motion.div
           initial="initial"
           animate="animate"
           variants={{
             animate: {
               transition: {
                 staggerChildren: 0.1
               }
             }
           }}
           className="px-4"
        >
          <motion.span 
            variants={{
              initial: { opacity: 0, y: 10 },
              animate: { opacity: 1, y: 0 }
            }}
            className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-brand-accent/10 text-brand-accent border border-brand-accent/20 text-[10px] md:text-xs font-black tracking-widest uppercase mb-8 md:mb-10"
          >
            <Zap className="w-3 h-3 fill-current" /> AI-powered resell scan
          </motion.span>
          
          <motion.h1 
            variants={{
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 }
            }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter mb-6 md:mb-8 leading-[0.95] max-w-4xl mx-auto transition-colors duration-75"
          >
            Scan any product. <br />
            <span className="text-brand-accent bg-clip-text text-transparent bg-gradient-to-b from-brand-accent to-brand-accent/80 pb-2 md:pb-4 inline-block align-bottom -mb-2 md:-mb-4">Know exactly</span> <br />
            how to sell it.
          </motion.h1>

          <motion.p 
            variants={{
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 }
            }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-base md:text-2xl text-brand-text-muted mb-10 md:mb-12 max-w-2xl mx-auto leading-relaxed px-4 font-medium"
          >
            Upload a photo or describe any item. Sellscan analyses the market, 
            tells you what to fix, where to list it, and writes the description — in seconds.
          </motion.p>

          <motion.div 
            variants={{
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 }
            }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6"
          >
            <button 
              onClick={onStart}
              className="w-full sm:w-auto bg-brand-accent hover:bg-brand-accent/90 text-brand-bg px-8 md:px-10 py-4 md:py-5 rounded-xl md:rounded-2xl text-base md:text-lg font-black uppercase tracking-widest transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 group"
            >
              Scan first product 
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <a 
              href="#features"
              className="w-full sm:w-auto bg-brand-card hover:bg-brand-border border border-brand-border px-8 md:px-10 py-4 md:py-5 rounded-xl md:rounded-2xl text-base md:text-lg font-black uppercase tracking-widest transition-all flex items-center justify-center hover:scale-[1.02] active:scale-[0.98]"
            >
              See how it works
            </a>
          </motion.div>
          
          <motion.p 
            variants={{
              initial: { opacity: 0 },
              animate: { opacity: 1 }
            }}
            transition={{ delay: 1 }}
            className="mt-8 text-xs font-bold text-brand-text-muted opacity-60 uppercase tracking-[0.2em]"
          >
            Free to start · No credit card required
          </motion.p>
        </motion.div>
      </section>

      {/* Example Preview Section */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-[1400px] mx-auto mb-32 px-4 md:px-10"
      >
        <div className="flex items-center gap-2 mb-6">
          <div className="w-2 h-2 rounded-full bg-brand-accent shadow-[0_0_8px_var(--color-brand-accent)]" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-accent">EXAMPLE SCAN • AIR JORDAN 1 MID</span>
        </div>
        
        <div className="bg-[#1a1a1a] [.light_&]:bg-white p-4 md:p-8 rounded-[2rem] border border-brand-border/20 w-full relative">
          {/* RESULTS DASHBOARD (8 BOXES) */}
          <div className="flex-grow space-y-6 md:space-y-10 w-full">
            <VerdictBox verdict={mockAnalysis.quickVerdict} highlighted={false} active={true} />
            <IdentityBox 
              imageUrl={mockScan.imageUrl} 
              name={mockAnalysis.productDetails.name} 
              brand={mockAnalysis.productDetails.brand} 
              type={mockAnalysis.productDetails.type} 
              condition={mockAnalysis.productDetails.condition} 
              category={mockAnalysis.productDetails.category} 
              active={true} 
            />
            <PriceInsightBox worthRange={mockAnalysis.worthRange} sellRange={mockAnalysis.priceRange} currencySymbol="£" active={true} />
            <PlatformStrategyBox platforms={mockAnalysis.platforms} currencySymbol="£" active={true} />
            <PracticalTipsBox tips={mockAnalysis.practicalTips} basePrice={mockAnalysis.priceRange.sweetSpot} currencySymbol="£" active={true} />
            <MarketSentimentBox sentiment={mockAnalysis.marketSentiment} active={true} />
            <PriceTrendBox history={mockAnalysis.priceHistory} currencySymbol="£" scanId="example-id" productName={mockAnalysis.productDetails.name} />
            <MockupGeneratorBox 
              scan={{...mockScan, id: 'landing-demo'}} 
              platforms={mockAnalysis.platforms.map((p) => p.name)} 
              onGenerate={(p) => setSelectedMockup(p)} 
              preloadedHistory={mockAnalysis.platforms.map((p) => p.name)}
            />
          </div>
        </div>
      </motion.section>

      {/* Features Grid */}
      <section id="features" className="max-w-6xl mx-auto mb-32 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-[10px] font-black uppercase text-brand-accent tracking-[0.3em] mb-4 block">Core Features</span>
          <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">Everything you need to sell smarter</h2>
          <p className="text-brand-text-muted text-lg">From market research to copy — one scan does it all.</p>
        </motion.div>
        <motion.div 
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            animate: {
              transition: {
                staggerChildren: 0.6
              }
            }
          }}
          className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-6"
        >
          {[
            {
              icon: <Search />,
              title: "Market research in seconds",
              description: "Compares similar sold listings, analyses demand, and spots pricing opportunities — without you lifting a finger."
            },
            {
              icon: <Quote />,
              title: "Human-sounding listings",
              description: "AI-written titles and descriptions that sound like a real seller wrote them. Optimized for your target platform."
            },
            {
              icon: <TrendingUp />,
              title: "Know exactly what to fix",
              description: "Get actionable improvements that actually move the needle: cleaning, repackaging, photography tips."
            },
            {
              icon: <MessageSquare />,
              title: "Live AI refinements",
              description: "Chat with your scan results. Ask to shorten the description, try a different platform, or adjust the price."
            }
          ].map((feature, i) => (
            <FeatureCard 
              key={i}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              isSelected={selectedFeature === i}
              isOtherSelected={selectedFeature !== null && selectedFeature !== i}
              onClick={() => setSelectedFeature(selectedFeature === i ? null : i)}
            />
          ))}
        </motion.div>
      </section>

      {/* Marquee Showcase */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: false, margin: "-100px" }}
        transition={{ duration: 1.2 }}
        className="mb-32 overflow-hidden py-20 bg-brand-accent/[0.02]"
      >
        <div className="max-w-6xl mx-auto px-4 mb-16 text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Scan any item</h2>
          <p className="text-brand-text-muted text-lg">From rare collectibles to high-end vintage — Sellscan knows the value.</p>
        </div>
        
        <div className="flex flex-col gap-8">
          <MarqueeRow direction="right" images={COLLECTIBLES_ROW_1} />
          <MarqueeRow direction="left" images={COLLECTIBLES_ROW_2} />
        </div>
      </motion.section>

      {/* Pricing Section */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 scroll-mt-24">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <span className="text-[10px] font-black uppercase text-brand-accent tracking-[0.3em] mb-4 block">Pricing Plans</span>
          <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter leading-none">Level up your <br className="hidden md:block" /> resale game.</h2>
          <p className="text-brand-text-muted text-xl max-w-2xl mx-auto leading-relaxed italic-none">
            Choose the intelligence tier that fits your volume. <br className="hidden sm:block" />
            Upgrade or cancel anytime.
          </p>
        </motion.div>

        <div className="flex justify-center mb-16">
          <div className="bg-brand-card/80 p-1.5 rounded-2xl border border-brand-border flex flex-col items-center gap-4 shadow-sm">
            <div className="flex gap-1.5">
              <button 
                onClick={() => setBillingCycle('yearly')}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer",
                  billingCycle === 'yearly' 
                    ? "bg-brand-accent text-slate-900 shadow-md font-extrabold" 
                    : "text-brand-text-muted hover:text-brand-text"
                )}
              >
                Yearly Billing
                <span className={cn(
                  "text-[9px] px-2 py-0.5 rounded-md font-black tracking-normal transition-colors",
                  billingCycle === 'yearly' 
                    ? "bg-brand-bg text-brand-text shadow-sm border border-brand-border" 
                    : "bg-brand-accent/15 text-brand-accent border border-brand-accent/10"
                )}>
                  -31% SAVINGS
                </span>
              </button>
              <button 
                onClick={() => setBillingCycle('monthly')}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all cursor-pointer",
                  billingCycle === 'monthly' 
                    ? "bg-brand-accent text-slate-950 shadow-md font-extrabold" 
                    : "text-brand-text-muted hover:text-brand-text"
                )}
              >
                Monthly
              </button>
            </div>
          </div>
        </div>

        <motion.div 
          initial="initial"
          whileInView="animate"
          viewport={{ once: false, margin: "-100px" }}
          variants={{
            animate: {
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          className="flex flex-row lg:grid lg:grid-cols-4 overflow-x-auto lg:overflow-x-visible snap-x snap-mandatory gap-6 md:gap-4 items-stretch py-24 pb-32 -mx-4 px-4 lg:mx-0 lg:px-0 scrollbar-none"
        >
          {/* Explorer Plan */}
          <PricingCard 
             tier="Explorer"
             description="Perfect for casual decluttering."
             priceLabel="$0"
             credits="3 Credits / Week"
             features={[
               { text: "Gemini 1.5 Lite Integration", included: true },
               { text: "Basic item recognition", included: true },
               { text: "Basic price estimate", included: true },
               { text: "Marketplace suggestion", included: true },
               { text: "AI Resale Chat access", included: false },
             ]}
             cta="Get started free"
             variant="muted"
             isActive={hoveredIndex === 0}
             isAnyHovered={hoveredIndex !== null}
             onHover={() => setHoveredIndex(0)}
             onLeave={() => setHoveredIndex(null)}
             onAction={() => handleCheckout('Free')}
             isLoading={loadingTier === 'Free'}
          />

          {/* Basic Plan */}
          <PricingCard 
             tier="Basic"
             description="For regular flippers hitting local shops."
             priceLabel={getPricingDisplay('Basic', billingCycle).priceLabel}
             originalPrice={getPricingDisplay('Basic', billingCycle).originalPrice}
             credits="40 Credits / Month"
             features={[
               { text: "Gemini 2.5 Pro + GPT-4.1", included: true },
               { text: "Extra Marketplace Suggestions", included: true },
               { text: "AI pricing analysis", included: true },
               { text: "AI Listing generator", included: true },
               { text: "Basic AI chat usage", included: true },
               { text: "Custom Listing Rules", included: true },
             ]}
             cta="Get Basic"
             variant="primary"
             isActive={hoveredIndex === 1}
             isAnyHovered={hoveredIndex !== null}
             onHover={() => setHoveredIndex(1)}
             onLeave={() => setHoveredIndex(null)}
             onAction={() => handleCheckout('Basic')}
             isLoading={loadingTier === 'Basic'}
          />

          {/* Reseller Plan - Most Popular */}
          <PricingCard 
             tier="Reseller"
             description="High-volume intelligence for professionals."
             priceLabel={getPricingDisplay('Reseller', billingCycle).priceLabel}
             originalPrice={getPricingDisplay('Reseller', billingCycle).originalPrice}
             credits="120 Credits / Month"
             popular
             features={[
               { text: "Gemini 2.5 Pro + GPT 5.0", included: true },
               { text: "Unlimited Chatbot usage", included: true },
               { text: "Batch Upload (up to 5)", included: true },
               { text: "Mock-up Generator", included: true },
               { text: "Faster Processing speeds", included: true },
               { text: "Everything in Basic", included: true },
             ]}
             cta="Get Reseller"
             variant="accent"
             isActive={hoveredIndex === 2}
             isAnyHovered={hoveredIndex !== null}
             onHover={() => setHoveredIndex(2)}
             onLeave={() => setHoveredIndex(null)}
             onAction={() => handleCheckout('Reseller')}
             isLoading={loadingTier === 'Reseller'}
          />

          {/* Entrepreneur Plan */}
          <PricingCard 
             tier="Entrepreneur"
             description="Ultimate power for multi-channel empires."
             priceLabel={getPricingDisplay('Entrepreneur', billingCycle).priceLabel}
             originalPrice={getPricingDisplay('Entrepreneur', billingCycle).originalPrice}
             credits="300 Credits / Month"
             features={[
               { text: "Gemini 2.5 + GPT 5.2 + Claude 4.6", included: true },
               { text: "Unlocks Landing Page Builder", included: true },
               { text: "Batch Upload (up to 20)", included: true },
               { text: "No Daily Limits", included: true },
               { text: "Custom AI model selection", included: true },
               { text: "Everything in Reseller", included: true },
             ]}
             cta="Get Entrepreneur"
             variant="accent"
             isActive={hoveredIndex === 3}
             isAnyHovered={hoveredIndex !== null}
             onHover={() => setHoveredIndex(3)}
             onLeave={() => setHoveredIndex(null)}
             onAction={() => handleCheckout('Entrepreneur')}
             isLoading={loadingTier === 'Entrepreneur'}
          />
        </motion.div>
      </section>

      {/* Legal Modals & Cookie Consent are preserved below */}

      {/* Dynamic Legal Modals Overlay Layer */}
      <AnimatePresence>
        {activeLegalModal && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveLegalModal(null)}
              className="absolute inset-0 bg-brand-bg/90 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              className="relative w-full max-w-3xl h-[85vh] bg-brand-bg border border-brand-border rounded-[2rem] overflow-hidden shadow-2xl flex flex-col z-10"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-brand-border bg-brand-card/50">
                <div className="flex items-center gap-2 text-brand-accent">
                  <span className="font-mono text-[10px] font-black uppercase tracking-widest bg-brand-accent/10 px-2 py-1 rounded">
                    {activeLegalModal.toUpperCase()} COMPLIANCE DOCUMENT
                  </span>
                </div>
                <button 
                  onClick={() => setActiveLegalModal(null)}
                  className="p-2 bg-brand-card hover:bg-brand-bg border border-brand-border text-brand-text-muted hover:text-brand-text rounded-xl transition-all outline-none cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Document Content */}
              <div className="flex-1 overflow-y-auto p-8 font-sans space-y-6 text-sm text-brand-text-muted leading-relaxed max-w-none custom-scrollbar">
                
                {activeLegalModal === 'terms' && (
                  <>
                    <h2 className="text-2xl font-black text-brand-text tracking-tight">Terms of Service</h2>
                    <p className="text-xs text-brand-text-muted italic">Last updated: June 2, 2026 • Version 2.2</p>
                    
                    <p>
                      Welcome to <strong>trysellscan.com</strong> (“the Sellscan Platform”, “the Service”). By accessing, registering an account, capturing images, executing scans, or committing transactions with Sellscan Inc., you agree to be bound by these Terms of Service. If you do not accept these term clauses, you must suspend your access to the platform immediately.
                    </p>

                    <h3 className="text-base font-bold text-brand-text uppercase tracking-wider font-mono mt-4">1. Scope of Service & Platform License</h3>
                    <p>
                      Sellscan utilizes advanced vision-language deep learning pipelines (including Google Gemini API nodes) to categorize, identify, assess, and suggest list parameters for fashion apparel, collectibles, rare vintage products, electronics, and standard retail items. Sellscan grants you a non-commercial, revocable, personal license to utilize our client-facing scanner modules and inventory manager panel according to standard usage quotas.
                    </p>

                    <h3 className="text-base font-bold text-brand-text uppercase tracking-wider font-mono mt-4">2. Account Safety & Subscriptions</h3>
                    <p>
                      Access to specific processing thresholds (including Basic and Premium modules) requires secure account registration managed securely via Supabase Authentication. You must maintain confidential control over your sign-on credentials. Subscriptions operate on a persistent recurring billing baseline corresponding to your subscription cycle (Monthly or Yearly) and are processed exclusively via <strong>Stripe Certified Payment Gateway</strong>.
                    </p>

                    <h3 className="text-base font-bold text-brand-text uppercase tracking-wider font-mono mt-4">3. Fair Allocation, Rate Limits & System Abuse</h3>
                    <p>
                      Platform resources are strictly metered based on credits. Subscriptions operate under automatic credit allocation ceilings to maintain optimal server response times and guarantee latency consistency for all creators. Running script-based automated screen scrapers, reverse-engineering API endpoints, or launching heavy batch-upload spiders from personal clients is strictly prohibited and constitutes immediate grounds for profile termination and credit forfeiture.
                    </p>

                    <h3 className="text-base font-bold text-brand-text uppercase tracking-wider font-mono mt-4">4. Disclaimers: Market Valuation Estimates & AI Limitation</h3>
                    <p>
                      All returned valuation guidelines, suggested marketplace targets, sweet-spot pricing indexes, and text drafts are generated via neural-network heuristic approximations. <strong>Sellscan does not guarantee, represent, or warrant that physical scanned items will fetch specific financial rewards in secondary markets.</strong> Re-selling involves inherent visual and monetary risk; you agree that Sellscan owns zero liability for pricing choices, inventory transactions, or losses occurred on Etsy, eBay, Vinted, Wallapop, Depop, or any secondary trade websites.
                    </p>

                    <h3 className="text-base font-bold text-brand-text uppercase tracking-wider font-mono mt-4">5. Customer Support & Official Contacts</h3>
                    <p>
                      For active billing queries, credit rectifications, or customer service support, please submit an official message directly through the <strong>Support channel inside your User profile dashboard</strong>. All commercial operations are structured exclusively under Delaware, United States governing system.
                    </p>

                    <h3 className="text-base font-bold text-brand-text uppercase tracking-wider font-mono mt-4">6. Jurisdiction & Severe Terms</h3>
                    <p>
                      These terms are governed by and construed in accordance with the laws of Delaware, United States, without regard to its conflict of law provisions. Claims and disputes shall be settled exclusively in courts located inside that jurisdiction.
                    </p>
                  </>
                )}

                {activeLegalModal === 'privacy' && (
                  <>
                    <h2 className="text-2xl font-black text-brand-text tracking-tight">Privacy Policy</h2>
                    <p className="text-xs text-brand-text-muted italic">Last updated: June 2, 2026 • Version 2.2</p>
                    
                    <p>
                      At Sellscan, we hold client data integrity in the highest regard, designing secure image transmission channels and establishing standard structures to comply fully with the GDPR (General Data Protection Regulation) and California Consumer Privacy Act (CCPA).
                    </p>

                    <h3 className="text-base font-bold text-brand-text uppercase tracking-wider font-mono mt-4">1. Personal Information We Collect</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Identity Records:</strong> Authenticated email addresses and user unique identifiers (UUIDs) registered through Supabase Auth.</li>
                      <li><strong>Image Uploads:</strong> Item visuals uploaded to the scanner. These images are optimized and cleaned of sensitive EXIF parameters automatically before processing.</li>
                      <li><strong>Transaction Metadata:</strong> Stripe receipt logs, billing intervals, and transaction state tokens. Raw proprietary credit card numbers never traverse our databases.</li>
                    </ul>

                    <h3 className="text-base font-bold text-brand-text uppercase tracking-wider font-mono mt-4">2. Processing, Transmission, & AI Services</h3>
                    <p>
                      Visual files are cached in certified cloud object buckets and dispatched to AI servers (Google Gemini services) through secure proxies. Please consult our Data Usage & AI Policy to understand how these elements are strictly decoupled from general public retraining loops.
                    </p>

                    <h3 className="text-base font-bold text-brand-text uppercase tracking-wider font-mono mt-4">3. Children's Privacy Protection (COPPA Compliance)</h3>
                    <p>
                      <strong>Sellscan’s visual scanner tools and subscription systems are built strictly for individuals aged 13 and older.</strong> We do not knowingly compile, request, or keep personal parameters or images representing individuals under the age of 13. If you believe a child under 13 has registered or dispatched data, please alert us through our official support chat or dashboard, and we will delete all corresponding account details securely and permanently.
                    </p>

                    <h3 className="text-base font-bold text-brand-text uppercase tracking-wider font-mono mt-4">4. CCPA / GDPR Data Choices & Consumer Rights</h3>
                    <p>
                      We fully support global information rights. You can:
                      <br />• Request complete export of all database entries associated with your Supabase identifier.
                      <br />• Modify incorrect profile details.
                      <br />• Initiate complete, irreversible accounts and scan history wipes directly through the User Profile Settings menu.
                    </p>

                    <h3 className="text-base font-bold text-brand-text uppercase tracking-wider font-mono mt-4">5. Privacy Support inquiries</h3>
                    <p>
                      For privacy-focused inquiries, please contact our privacy compliance group via the interactive Support center inside your User Profile dashboard, or execute a complete purge using in-app settings.
                    </p>
                  </>
                )}

                {activeLegalModal === 'data' && (
                  <>
                    <h2 className="text-2xl font-black text-brand-text tracking-tight">Data Usage & AI Policy</h2>
                    <p className="text-xs text-brand-text-muted italic">Last updated: June 2, 2026 • Version 2.2</p>
                    
                    <p>
                      This special document outlines how Sellscan handles visual coordinates, user-submitted media, generated descriptions, and machine learning pipelines without compromising intellectual capital or user transparency.
                    </p>

                    <h3 className="text-base font-bold text-brand-text uppercase tracking-wider font-mono mt-4">1. Zero Foundational LLM Retraining</h3>
                    <p>
                      We enforce zero-retraining guidelines in our API service contracts: <strong>No photo uploads, description edits, listing edits, or pricing adjustments processed on Sellscan are ever utilized by downstream suppliers to train or refine public foundation models.</strong> Your business insights remain your exclusive competitive edge.
                    </p>

                    <h3 className="text-base font-bold text-brand-text uppercase tracking-wider font-mono mt-4">2. Sanitization & EXIF Sweeper</h3>
                    <p>
                      Image files are compressed, scaled, and stripped of geographical coordinate stamps on the client-side or during initial ingestion. This prevents the dissemination of home or location-specific telemetry while keeping your uploads fast over standard wireless connections.
                    </p>

                    <h3 className="text-base font-bold text-brand-text uppercase tracking-wider font-mono mt-4">3. Automated Individual Decision-making Disclaimer</h3>
                    <p>
                      Our visual agents employ automated categorization to offer appraising guidelines, but final commercial decisions are entirely human-guided. The platform provides recommendations solely as informational guidelines, and we encourage users to verify appraisals manually before settling transactions on external trade systems.
                    </p>

                    <h3 className="text-base font-bold text-brand-text uppercase tracking-wider font-mono mt-4">4. Intellectual Ownership of AI Outputs</h3>
                    <p>
                      Every generated listing title, descriptive draft, and bulleted platform proposal is 100% owned by the creator. You possess unrestricted copyright privileges to copy, publish, modify, or export these files for commercial sale across Etsy, eBay, Vinted, Vestiaire Collective, Wallapop, Depop, or custom online storefronts.
                    </p>
                  </>
                )}

                {activeLegalModal === 'cookies' && (
                  <>
                    <h2 className="text-2xl font-black text-brand-text tracking-tight">Cookie Declaration</h2>
                    <p className="text-xs text-brand-text-muted italic">Last updated: June 2, 2026 • Version 2.2</p>
                    
                    <p>
                      We utilize cookies and browser storage with absolute restriction, reserving digital tracking exclusively for critical platform capabilities.
                    </p>

                    <h3 className="text-base font-bold text-brand-text uppercase tracking-wider font-mono mt-4">1. Essential Operational Variables</h3>
                    <p>
                      These local instances are strictly necessary for the website to load:
                      <br />• <strong>Security & Auth:</strong> Supabase session identifiers and tokens to keep you authorized during uploads.
                      <br />• <strong>Preference Storage:</strong> Saved defaults such as your localized default currency values, last scanned filters, and theme configuration (light/dark) cached inside localStorage.
                      <br />• <strong>Partner Allocation:</strong> Unique referral variables recorded locally to correctly credit active contributors if a paid plan is purchased.
                    </p>

                    <h3 className="text-base font-bold text-brand-text uppercase tracking-wider font-mono mt-4">2. Zero Cross-Site Ad Tracking Cookies</h3>
                    <p>
                      <strong>trysellscan.com does not deploy marketing pixels, cross-site behavior trackers, or third-party ad network cookies.</strong> We do not sell your browsing patterns, inventory classifications, or platform coordinates to advertising brokers.
                    </p>

                    <h3 className="text-base font-bold text-brand-text uppercase tracking-wider font-mono mt-4">3. Direct Control Options</h3>
                    <p>
                      You can change your browser settings to reject cookies entirely or clear your browser's localStorage at any point. Note that clearing operational tokens will sign you out and require credentials on your next session.
                    </p>
                  </>
                )}

              </div>

              {/* Footer */}
              <div className="p-6 border-t border-brand-border flex justify-end bg-brand-card/50">
                <button 
                  onClick={() => setActiveLegalModal(null)}
                  className="px-6 py-3 bg-brand-accent hover:brightness-110 active:scale-95 text-brand-bg font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-md"
                >
                  I Understand
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cookie Consent slide-up Modal banner */}
      <AnimatePresence>
        {showCookieConsent && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[200] max-w-sm w-[calc(100vw-3rem)] bg-brand-card/95 backdrop-blur-xl border border-brand-border/80 rounded-3xl p-6 shadow-2xl flex flex-col gap-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 bg-brand-accent/10 text-brand-accent text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-md border border-brand-accent/20 tracking-wider">
                <Zap className="w-3 h-3 fill-current animate-pulse" /> Trust & Cookies
              </div>
              <button 
                onClick={() => handleAcceptCookies(false)}
                className="text-brand-text-muted hover:text-brand-text p-1 transition-all cursor-pointer"
                title="Decline"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1.5">
              <h4 className="text-sm font-black text-brand-text tracking-tight">We respect your digital boundaries</h4>
              <p className="text-xs text-brand-text-muted leading-relaxed">
                We use secure, functional cookies to authenticate listings sessions and persist localized currency preferences. Absolutely zero behavioral ad tracking.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleAcceptCookies(true)}
                className="flex-grow py-2.5 bg-brand-accent hover:brightness-110 active:scale-95 text-slate-900 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md text-center"
              >
                Accept All
              </button>
              <button
                onClick={() => handleAcceptCookies(false)}
                className="px-4 py-2.5 bg-brand-text/5 hover:bg-brand-text/10 active:scale-95 text-brand-text-muted hover:text-brand-text text-xs font-bold rounded-xl border border-brand-border/60 transition-all cursor-pointer text-center"
              >
                Essential
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const COLLECTIBLES_ROW_1 = [
  clothesImg,
  voiceImg,
  qImg,
  pontoImg,
  wImg,
  eImg,
  photoImg,
  aImg,
];

const COLLECTIBLES_ROW_2 = [
  bImg,
  aaImg,
  ppImg,
  pokemonImg,
  glassesImg,
  shoeImg,
  slImg,
  clocksImg,
];

function MarqueeRow({ images, direction }: { images: string[], direction: 'left' | 'right' }) {
  const doubledImages = [...images, ...images];
  
  return (
    <div className="flex w-[200%] gap-6">
      <motion.div 
        className="flex gap-6 shrink-0"
        animate={{ 
          x: direction === 'left' ? [0, '-50%'] : ['-50%', 0]
        }}
        transition={{ 
          duration: 40, 
          repeat: Infinity, 
          ease: "linear"
        }}
      >
        {doubledImages.map((src, i) => (
          <div key={i} className="w-48 h-48 md:w-64 md:h-64 rounded-3xl overflow-hidden shadow-lg shrink-0 border border-brand-border/30">
            <img src={src} alt="Collectible" className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-500 hover:scale-110" />
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function PlatformMiniRow({ name, rank }: { name: string, rank: number }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="font-semibold text-brand-text/90">{rank}. {name}</span>
      <span className="text-[10px] text-brand-accent font-bold uppercase tracking-tighter">
        {rank === 1 ? 'Best' : rank === 2 ? 'High Demand' : rank === 3 ? 'Fast Sell' : 'Solid option'}
      </span>
    </div>
  );
}

function FeatureCard({ 
  icon, title, description, isSelected, isOtherSelected, onClick 
}: { 
  icon: React.ReactNode, title: string, description: string, isSelected?: boolean, isOtherSelected?: boolean, onClick?: () => void 
}) {
  return (
    <motion.button 
      onClick={onClick}
      variants={{
        initial: { opacity: 0, y: -40 },
        animate: { 
          opacity: 1, 
          y: 0,
          transition: {
            duration: 0.8,
            ease: "easeOut"
          }
        }
      }}
      className={cn(
        "glass-card p-4 md:p-8 transition-all duration-500 text-left relative focus:outline-none w-full",
        isSelected ? "border-brand-accent shadow-[0_0_30px_rgba(85,205,209,0.4)] scale-[1.05] z-10 bg-brand-bg/60" : "hover:border-brand-accent/30 hover:bg-brand-bg/40 border-brand-border/40",
        isOtherSelected && !isSelected ? "blur-[6px] opacity-30 scale-[0.98]" : "",
        !isSelected && !isOtherSelected && "hover:scale-[1.02]"
      )}
    >
      <div className={cn(
        "w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center mb-3 md:mb-6 transition-all duration-500",
        isSelected ? "bg-brand-accent shadow-[0_0_20px_rgba(85,205,209,0.5)]" : "bg-brand-accent/10"
      )}>
        {React.cloneElement(icon as React.ReactElement<any>, { className: cn("w-4 h-4 md:w-6 md:h-6 transition-colors duration-500", isSelected ? "text-slate-900" : "text-brand-accent") })}
      </div>
      <h3 className="text-sm md:text-xl font-bold mb-1.5 md:mb-3">{title}</h3>
      <p className="text-[10px] md:text-base text-brand-text-muted leading-relaxed line-clamp-3 md:line-clamp-none">{description}</p>
    </motion.button>
  );
}
