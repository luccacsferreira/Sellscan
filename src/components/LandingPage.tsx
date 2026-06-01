/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Upload, Camera, Type, ArrowRight, Zap, TrendingUp, MessageSquare, Quote, Search, Check, X, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

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

// Configuration for Stripe Price IDs
const STRIPE_PRICES = {
  BASIC_MONTHLY: 'price_1TX3cnRCzE4WmLf5UJseWbYZ',
  BASIC_YEARLY: 'price_1TX3iCRCzE4WmLf5fwXNkaBB',
  PREMIUM_MONTHLY: 'price_1TX3f0RCzE4WmLf5519Kp8zO',
  PREMIUM_YEARLY: 'price_1TX3jjRCzE4WmLf59KuysZhL',
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

      let priceId = '';
      if (tier === 'Basic') {
        priceId = billingCycle === 'monthly' ? STRIPE_PRICES.BASIC_MONTHLY : STRIPE_PRICES.BASIC_YEARLY;
      } else if (tier === 'Premium') {
        priceId = billingCycle === 'monthly' ? STRIPE_PRICES.PREMIUM_MONTHLY : STRIPE_PRICES.PREMIUM_YEARLY;
      }

      if (priceId.includes('_1PXXXXXXXXXXXXXX')) {
        alert("Action Required: Please copy your actual Price IDs from Stripe into LandingePage.tsx (STRIPE_PRICES constant).");
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
        const errorData = await response.json();
        throw new Error(errorData.error || `Server responded with ${response.status}`);
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
      alert("Checkout could not be started: " + (err.message || "Unknown error") + "\n\nTip: Make sure STRIPE_SECRET_KEY is set in your environment variables.");
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <div className="pt-32 pb-20 px-4">
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
            className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter mb-6 md:mb-8 leading-[0.95] max-w-4xl mx-auto"
          >
            Scan any product. <br />
            <span className="text-brand-accent bg-clip-text text-transparent bg-gradient-to-r from-brand-accent to-brand-accent/60">Know exactly</span> <br />
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
        viewport={{ once: false, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-6xl mx-auto mb-32 px-4"
      >
        <div className="flex items-center gap-2 mb-6">
          <div className="w-2 h-2 rounded-full bg-brand-accent shadow-[0_0_8px_var(--color-brand-accent)]" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-accent">EXAMPLE SCAN • AIR JORDAN 1 MID</span>
        </div>
        
        <div className="glass-card p-6 md:p-8 flex flex-col md:flex-row gap-8 bg-brand-card/30 backdrop-blur-sm group">
          {/* Left: Product Image (Square) */}
          <div className="w-full md:w-[400px] flex-shrink-0 aspect-square rounded-2xl overflow-hidden shadow-2xl relative">
            <img 
              src={af1Example} 
              alt="Air Jordan 1 Mid" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-bg/60 to-transparent pointer-events-none" />
          </div>

          {/* Right: Insights */}
          <div className="flex-grow space-y-6">
            {/* Quick Verdict */}
            <div className="p-5 rounded-2xl border border-brand-accent/20 bg-brand-accent/5">
              <div className="flex items-center gap-2 text-brand-accent text-[10px] font-bold uppercase tracking-widest mb-3">
                <Zap className="w-3 h-3 fill-current" /> Quick Verdict
              </div>
              <p className="text-lg font-medium leading-relaxed">
                Nike Air Jordan 1 Mid "Gym Red/Black Toe" (2021). Iconic colorway featuring a white leather base with black overlays and red accents. Released August 2021. High demand on major resale platforms and marketplaces. Expect £85–£115 ($110–$150).
              </p>
            </div>

            {/* Insight Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Platforms */}
              <div className="p-5 rounded-2xl bg-brand-bg/40 border border-brand-border">
                <h4 className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest mb-4">Best Platforms</h4>
                <div className="space-y-3">
                  <PlatformMiniRow name="StockX" rank={1} />
                  <PlatformMiniRow name="GOAT" rank={2} />
                  <PlatformMiniRow name="eBay" rank={3} />
                  <PlatformMiniRow name="Flight Club" rank={4} />
                  <PlatformMiniRow name="Grailed" rank={5} />
                </div>
              </div>

              {/* Price */}
              <div className="p-5 rounded-2xl bg-brand-bg/40 border border-brand-border h-full flex flex-col">
                <h4 className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest mb-4">Sweet Spot Price</h4>
                <div className="mt-auto">
                  <div className="text-4xl font-bold mb-4">£102</div>
                  <div className="h-1.5 w-full bg-brand-border rounded-full relative">
                    <div className="absolute h-full bg-brand-accent rounded-full w-[65%]" />
                  </div>
                  <div className="flex justify-between mt-2 text-[8px] text-brand-text-muted font-mono">
                    <span>£55</span>
                    <span>£145</span>
                  </div>
                </div>
              </div>

              {/* Improvements */}
              <div className="p-5 rounded-2xl bg-brand-bg/40 border border-brand-border">
                <h4 className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest mb-4">What to Improve</h4>
                <ul className="space-y-3 text-[11px] text-brand-text-muted font-medium">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-accent mt-1 flex-shrink-0" />
                    Deep clean the white leather and midsoles
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-accent mt-1 flex-shrink-0" />
                    Re-lace neatly and use shoe trees for shape
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-accent mt-1 flex-shrink-0" />
                    Include original box, tags, and proof of purchase
                  </li>
                </ul>
              </div>
            </div>

            {/* Listing Title */}
            <div className="p-5 rounded-2xl bg-brand-bg/20 border border-brand-border/40">
              <h4 className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest mb-2">AI-Written Listing Title</h4>
              <p className="text-sm font-bold opacity-80 leading-relaxed">
                "Air Jordan 1 Mid 'Gym Red/Black Toe' — US 10 (UK 9) — Excellent Condition — Original Box Included"
              </p>
            </div>
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
          viewport={{ once: false, margin: "-100px" }}
          variants={{
            animate: {
              transition: {
                staggerChildren: 0.08
              }
            }
          }}
          className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-6"
        >
          <FeatureCard 
            icon={<Search className="w-6 h-6 text-brand-accent" />}
            title="Market research in seconds"
            description="Compares similar sold listings, analyses demand, and spots pricing opportunities — without you lifting a finger."
          />
          <FeatureCard 
            icon={<TrendingUp className="w-6 h-6 text-brand-accent" />}
            title="Know exactly what to fix"
            description="Get actionable improvements that actually move the needle: cleaning, repackaging, photography tips."
          />
          <FeatureCard 
            icon={<Quote className="w-6 h-6 text-brand-accent" />}
            title="Human-sounding listings"
            description="AI-written titles and descriptions that sound like a real seller wrote them. Optimized for your target platform."
          />
          <FeatureCard 
            icon={<MessageSquare className="w-6 h-6 text-brand-accent" />}
            title="Live AI refinements"
            description="Chat with your scan results. Ask to shorten the description, try a different platform, or adjust the price."
          />
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

        {/* Monthly/Yearly Toggle */}
        <div className="flex justify-center mb-16">
          <div className="bg-brand-card/30 p-1 rounded-2xl border border-brand-border flex gap-1">
            <button 
              onClick={() => setBillingCycle('yearly')}
              className={cn(
                "px-6 py-2 rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-2",
                billingCycle === 'yearly' ? "bg-brand-accent text-brand-bg shadow-lg" : "text-brand-text-muted hover:text-brand-text"
              )}
            >
              Yearly
              <span className={cn(
                "text-[8px] px-1.5 py-0.5 rounded-full border lowercase",
                billingCycle === 'yearly' ? "bg-white/20 border-white/30 text-white" : "bg-brand-accent/10 border-brand-accent/20 text-brand-accent"
              )}>
                -31%
              </span>
            </button>
            <button 
              onClick={() => setBillingCycle('monthly')}
              className={cn(
                "px-6 py-2 rounded-xl text-xs font-bold uppercase transition-all",
                billingCycle === 'monthly' ? "bg-brand-accent text-brand-bg shadow-lg" : "text-brand-text-muted hover:text-brand-text underline-none"
              )}
            >
              Monthly
            </button>
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
          className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pb-32"
        >
          <PricingCard 
             tier="Free"
             description="Perfect for occasional decluttering."
             priceLabel="$0"
             credits="7 Credits / Month"
             features={[
               { text: "Uses Gemini Flash only", included: true },
               { text: "Basic price estimate", included: true },
               { text: "1 marketplace suggestion", included: true },
               { text: "Full item scan", included: false },
               { text: "AI Listing generator", included: false },
               { text: "AI Resale Chatbot", included: false }
             ]}
             cta="Get started"
             variant="muted"
             isActive={hoveredIndex === 0}
             onHover={() => setHoveredIndex(0)}
             onLeave={() => setHoveredIndex(null)}
             onAction={() => handleCheckout('Free')}
             isLoading={loadingTier === 'Free'}
          />

          <PricingCard 
             tier="Basic"
             description="For the regular flipper hitting the local charity shops."
             priceLabel={billingCycle === 'monthly' ? '$8.99' : '$6.20'}
             discount={billingCycle === 'yearly' ? '31% OFF' : undefined}
             credits="40 Credits / Month"
             features={[
               { text: "Gemini Pro + GPT-4o", included: true },
               { text: "7 Credits/day soft limit", included: true },
               { text: "Full item analysis", included: true },
               { text: "AI Listing generator", included: true },
               { text: "Limited Chatbot access", included: true },
               { text: "Price range estimation", included: true },
             ]}
             cta={billingCycle === 'monthly' ? 'Go Basic' : 'Save with Yearly'}
             variant="primary"
             popular
             isActive={hoveredIndex === 1 || hoveredIndex === null}
             onHover={() => setHoveredIndex(1)}
             onLeave={() => setHoveredIndex(null)}
             onAction={() => handleCheckout('Basic')}
             isLoading={loadingTier === 'Basic'}
          />

          <PricingCard 
             tier="Premium"
             description="For pro resellers scaling their business to full-time."
             priceLabel={billingCycle === 'monthly' ? '$14.99' : '$10.34'}
             discount={billingCycle === 'yearly' ? '31% OFF' : undefined}
             credits="120 Credits / Month"
             features={[
               { text: "Best Gemini + GPT-4o", included: true },
               { text: "No daily limits", included: true },
               { text: "Multi-platform listings", included: true },
               { text: "Profit & Demand estimation", included: true },
               { text: "Scam & Risk detection", included: true },
               { text: "Full Priority processing", included: true },
             ]}
             cta="Go Premium"
             variant="accent"
             isActive={hoveredIndex === 2}
             onHover={() => setHoveredIndex(2)}
             onLeave={() => setHoveredIndex(null)}
             onAction={() => handleCheckout('Premium')}
             isLoading={loadingTier === 'Premium'}
          />
        </motion.div>

        <div className="max-w-2xl mx-auto text-center pb-32">
          <p className="text-[10px] text-brand-text-muted tracking-wide leading-relaxed">
            * 1 Credit is consumed per product scan. Some advanced AI refinements may consume additional sub-credits. 
            Daily limits apply to Basic plans to ensure fair resource allocation. Credits refresh on your billing date.
          </p>
        </div>
      </section>
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

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      variants={{
        initial: { opacity: 0, y: -40 },
        animate: { 
          opacity: 1, 
          y: 0,
          transition: {
            duration: 0.4,
            ease: [0.23, 1, 0.32, 1]
          }
        }
      }}
      className="glass-card p-4 md:p-8 hover:border-brand-accent/50 transition-all group"
    >
      <div className="w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-brand-accent/10 flex items-center justify-center mb-3 md:mb-6 group-hover:scale-110 transition-transform">
        {React.cloneElement(icon as React.ReactElement<any>, { className: "w-4 h-4 md:w-6 md:h-6 text-brand-accent" })}
      </div>
      <h3 className="text-sm md:text-xl font-bold mb-1.5 md:mb-3">{title}</h3>
      <p className="text-[10px] md:text-base text-brand-text-muted leading-relaxed line-clamp-3 md:line-clamp-none">{description}</p>
    </motion.div>
  );
}

function PricingCard({ 
  tier, 
  priceLabel, 
  description, 
  features, 
  cta, 
  variant, 
  popular, 
  credits,
  isActive,
  onHover,
  onLeave,
  onAction,
  isLoading,
  discount
}: { 
  tier: string, 
  priceLabel: string, 
  description: string, 
  features: { text: string, included: boolean }[], 
  cta: string, 
  variant: 'muted' | 'accent' | 'primary', 
  popular?: boolean, 
  credits: string,
  isActive: boolean,
  onHover: () => void,
  onLeave: () => void,
  onAction?: () => void,
  isLoading?: boolean,
  discount?: string
}) {
  return (
    <motion.div 
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      variants={{
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0 }
      }}
      whileHover={{ 
        scale: 1.05,
        y: -12,
        transition: { duration: 0.4, ease: "easeOut" }
      }}
      className={cn(
        "glass-card p-8 lg:p-10 relative flex flex-col transition-all duration-500 group overflow-visible border-2",
        isActive 
          ? "border-brand-accent bg-brand-bg/90 md:scale-[1.02] shadow-[0_0_60px_-10px_rgba(85,205,209,0.8),inset_0_0_30px_rgba(85,205,209,0.15)] z-10" 
          : "bg-brand-card/20 border-brand-border/40 hover:border-brand-accent/20"
      )}
    >
      {/* Neon Glow Outer */}
      {isActive && (
        <div className="absolute inset-0 rounded-[2rem] shadow-[0_0_30px_rgba(85,205,209,0.2)] pointer-events-none -z-1" />
      )}

      {/* Top Neon Bar Glow */}
      <div className={cn(
        "absolute -top-[2px] left-1/2 -translate-x-1/2 w-3/4 h-[4px] transition-all duration-500 rounded-full",
        isActive 
          ? "bg-brand-accent shadow-[0_0_25px_4px_var(--color-brand-accent)] opacity-100" 
          : "bg-transparent opacity-0"
      )} />

      {popular && (
        <div className={cn(
          "absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300",
          isActive 
            ? "bg-brand-accent text-brand-bg shadow-[0_10px_20px_-5px_rgba(85,205,209,0.4)]"
            : "bg-brand-card text-brand-text-muted border border-brand-border"
        )}>
          Most Popular
        </div>
      )}
      
      <div className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <h3 className={cn(
            "text-xl font-black tracking-tight transition-all duration-300", 
            isActive ? "text-brand-accent drop-shadow-[0_0_12px_rgba(85,205,209,0.6)]" : "text-brand-text"
          )}>
            {tier}
          </h3>
          {discount && (
            <span className="bg-brand-accent/20 text-brand-accent text-[9px] font-black px-2 py-0.5 rounded-full border border-brand-accent/30 uppercase tracking-tighter">
              {discount}
            </span>
          )}
        </div>
        <p className="text-sm text-brand-text-muted leading-relaxed mb-8 h-12">
          {description}
        </p>
        <div className="flex items-baseline gap-1 mb-6">
          <span className="text-5xl font-black tracking-tight">{priceLabel}</span>
          <span className="text-brand-text-muted text-sm font-bold">/mo</span>
        </div>
        <div className={cn(
          "inline-flex items-center gap-2 px-3 py-1 rounded-lg transition-all duration-300 border",
          isActive 
            ? "bg-brand-accent/20 border-brand-accent/40 text-brand-accent shadow-[0_0_20px_rgba(85,205,209,0.4)]" 
            : "bg-white/5 border-white/10 text-brand-accent/70"
        )}>
          <Zap className="w-3 h-3 fill-current" /> <span className="text-[10px] font-bold uppercase tracking-widest">{credits}</span>
        </div>
      </div>

      <div className="space-y-4 mb-12 flex-grow">
        {features.map((f, i) => (
          <div key={i} className={cn(
            "flex items-start gap-3 text-sm transition-all duration-300",
            f.included ? (isActive ? "text-brand-text" : "text-brand-text/90") : "text-brand-text-muted/30"
          )}>
            <div className={cn(
              "mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all duration-300",
              f.included 
                ? (isActive ? "bg-brand-accent text-brand-bg shadow-[0_0_10px_rgba(85,205,209,0.6)]" : "bg-brand-accent/10 text-brand-accent") 
                : "bg-white/5 text-white/20"
            )}>
              {f.included ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
            </div>
            <span className="leading-snug font-medium italic-none">{f.text}</span>
          </div>
        ))}
      </div>

      <button 
        onClick={onAction}
        disabled={isLoading}
        className={cn(
          "w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all duration-300 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
          isActive 
            ? "bg-brand-accent text-brand-bg shadow-[0_0_40px_-5px_rgba(85,205,209,0.7)] hover:brightness-110" 
            : "bg-white/5 border border-brand-border/60 text-brand-text-muted hover:bg-white/10"
        )}
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : cta}
      </button>
    </motion.div>
  );
}
