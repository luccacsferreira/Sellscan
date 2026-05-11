/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Upload, Camera, Type, ArrowRight, Zap, TrendingUp, MessageSquare, Quote, Search } from 'lucide-react';
import { cn } from '../lib/utils';

import af1Example from '../assets/Example_Image.jpeg';

interface LandingPageProps {
  onStart: () => void;
}

export function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div className="pt-32 pb-20 px-4">
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto text-center mb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-accent/10 text-brand-accent border border-brand-accent/20 text-xs font-bold mb-6">
            <Zap className="w-3 h-3 fill-current" /> AI-powered resell analysis
          </span>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
            Scan any product. <br />
            <span className="text-brand-accent">Know exactly</span> how to sell it.
          </h1>
          <p className="text-lg md:text-xl text-brand-text-muted mb-10 max-w-2xl mx-auto leading-relaxed">
            Upload a photo or describe any item. Sellscan analyses the market, 
            tells you what to fix, where to list it, and writes the description — in seconds.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={onStart}
              className="w-full sm:w-auto bg-brand-accent hover:bg-brand-accent/90 text-brand-bg px-8 py-4 rounded-full text-lg font-bold transition-all shadow-[0_10px_30px_-10px_var(--color-brand-accent-glow)] hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              Scan your first product <ArrowRight className="w-5 h-5" />
            </button>
            <button className="w-full sm:w-auto bg-brand-card hover:bg-brand-border border border-brand-border px-8 py-4 rounded-full text-lg font-bold transition-all flex items-center justify-center">
              See how it works
            </button>
          </div>
          <p className="mt-6 text-sm text-brand-text-muted">Free to start · No credit card required</p>
        </motion.div>
      </section>

      {/* Example Preview Section */}
      <section className="max-w-6xl mx-auto mb-32 px-4">
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
      </section>

      {/* Features Grid */}
      <section id="features" className="max-w-6xl mx-auto mb-32">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to sell smarter</h2>
          <p className="text-brand-text-muted">From market research to copy — one scan does it all.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple pricing</h2>
          <p className="text-brand-text-muted">Start free, upgrade when you need more.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <PricingCard 
             price="$0"
             tier="Free"
             features={["3 scans per month", "Full AI analysis", "Chat with scan results", "Copy-ready listings"]}
             cta="Get started free"
             variant="muted"
          />
          <PricingCard 
             price="$12"
             tier="Pro"
             features={["Unlimited scans", "Full scan history", "Priority AI processing", "Everything in Free"]}
             cta="Start Pro"
             variant="accent"
             popular
          />
        </div>
      </section>
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
    <div className="glass-card p-8 hover:border-brand-accent/50 transition-all group">
      <div className="w-12 h-12 rounded-xl bg-brand-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-brand-text-muted leading-relaxed">{description}</p>
    </div>
  );
}

function PricingCard({ price, tier, features, cta, variant, popular }: { price: string, tier: string, features: string[], cta: string, variant: 'muted' | 'accent', popular?: boolean }) {
  return (
    <div className={cn(
      "glass-card p-8 relative flex flex-col",
      popular && "border-brand-accent/50 scale-[1.02] z-10 accent-glow"
    )}>
      {popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-accent text-brand-bg px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
          Most Popular
        </span>
      )}
      <div className="mb-8">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold">{price}</span>
          <span className="text-brand-text-muted text-sm pb-1">/month</span>
        </div>
        <h3 className="text-lg font-bold mb-2 mt-2">{tier}</h3>
        <p className="text-sm text-brand-text-muted">
          {tier === 'Free' ? 'Perfect for occasional flippers' : 'For serious resellers'}
        </p>
      </div>
      <ul className="space-gap flex-grow mb-8 space-y-4">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-3 text-sm text-brand-text-muted">
            <Zap className="w-4 h-4 text-brand-accent fill-current" /> {f}
          </li>
        ))}
      </ul>
      <button className={cn(
        "w-full py-4 rounded-xl font-bold transition-all",
        variant === 'accent' ? "bg-brand-accent text-brand-bg hover:bg-brand-accent/90" : "bg-brand-border text-brand-text hover:bg-brand-border/80"
      )}>
        {cta}
      </button>
    </div>
  );
}
