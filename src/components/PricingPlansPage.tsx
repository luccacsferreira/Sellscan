import React, { useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { PricingCard } from './PricingCard';
import { getPriceId, getPricingDisplay } from '../lib/stripe';
import { supabase } from '../lib/supabase';
import { AlertCircle } from 'lucide-react';

interface PricingPlansPageProps {
  user: any;
  onSignIn: (tier?: string) => void;
  onStartNewScan: () => void;
}

export function PricingPlansPage({ user, onSignIn, onStartNewScan }: PricingPlansPageProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  const handleCheckout = async (tier: string) => {
    if (tier === 'Explorer' || tier === 'Free') {
      onStartNewScan();
      return;
    }

    try {
      setLoadingTier(tier);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        onSignIn(tier); // Open auth modal and save intent
        return;
      }

      const priceId = getPriceId(tier, billingCycle);

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
        const errorData = await response.json();
        throw new Error(errorData.error || `Server responded with ${response.status}`);
      }

      const data = await response.json();
      console.log("💳 Checkout session created:", data);
      
      if (data.url) {
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
    <div className="pt-28 pb-20 px-4 max-w-7xl mx-auto min-h-[80vh] flex flex-col justify-center">
      <div className="text-center mb-10">
        <span className="text-[10px] font-black uppercase text-brand-accent tracking-[0.3em] mb-4 block">Membership Tiers</span>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4">Scale your resale empire</h1>
        <p className="text-brand-text-muted text-sm md:text-base max-w-xl mx-auto">
          Select the price intelligence plan that fits your volume. Enjoy high-speed calculations, item suggestions, and demand trends instantly.
        </p>
        
        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <span className={cn("text-xs font-bold transition-colors", billingCycle === 'monthly' ? "text-brand-text" : "text-brand-text-muted")}>Monthly Billing</span>
          <button 
            onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
            className="w-12 h-6 rounded-full bg-brand-bg border border-brand-border relative p-1 transition-colors hover:border-brand-accent/50"
          >
            <motion.div 
              animate={{ x: billingCycle === 'monthly' ? 0 : 24 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="w-4 h-4 rounded-full bg-brand-accent"
            />
          </button>
          <div className="flex items-center gap-2">
            <span className={cn("text-xs font-bold transition-colors", billingCycle === 'yearly' ? "text-brand-text" : "text-brand-text-muted")}>Yearly Billing</span>
            <span className={cn(
              "text-[9px] px-2 py-0.5 rounded-md font-black tracking-normal transition-colors",
              billingCycle === 'yearly' 
                ? "bg-brand-accent text-[#0F1216] font-black block shadow-sm border border-brand-accent/40" 
                : "bg-brand-border/15 text-brand-text-muted border border-brand-border/30"
            )}>
              -31% SAVINGS
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-row lg:grid lg:grid-cols-4 overflow-x-auto lg:overflow-x-visible snap-x snap-mandatory gap-6 md:gap-4 items-stretch py-12 pb-20 -mx-4 px-4 lg:mx-0 lg:px-0 scrollbar-none">
        
        {/* Explorer Plan */}
        <PricingCard 
           tier="Explorer"
           description="Perfect for casual decluttering."
           priceLabel="$0"
           credits="3 Credits / Week"
           features={[
             { text: "Gemini Flash Integration", included: true },
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
           onAction={() => handleCheckout('Explorer')}
           isLoading={loadingTier === 'Explorer'}
        />

        {/* Basic Plan */}
        <PricingCard 
           tier="Basic"
           description="For regular flippers hitting local shops."
           priceLabel={getPricingDisplay('Basic', billingCycle).priceLabel}
           originalPrice={getPricingDisplay('Basic', billingCycle).originalPrice}
           credits="40 Credits / Month"
           features={[
             { text: "Gemini Pro + GPT-4o-mini", included: true },
             { text: "AI pricing analysis", included: true },
             { text: "AI Listing generator", included: true },
             { text: "Marketplace recommendations", included: true },
             { text: "Basic AI chat usage", included: true },
             { text: "Claude Haiku Support", included: true },
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
             { text: "Everything in Basic", included: true },
             { text: "Advanced Market Analysis", included: true },
             { text: "Demand & Profit Insights", included: true },
             { text: "Priority Cloud Processing", included: true },
             { text: "Full Chatbot access", included: true },
             { text: "More AI Listing drafts", included: true },
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
             { text: "Everything in Reseller", included: true },
             { text: "No Daily Limits", included: true },
             { text: "Landing Page Builder", included: true },
             { text: "Marketing Copy Generator", included: true },
             { text: "Premium AI Models Access", included: true },
             { text: "Advanced Market Insights", included: true },
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
      </div>
    </div>
  );
}
