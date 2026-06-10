/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  HelpCircle, 
  Layers, 
  DollarSign, 
  TrendingUp, 
  Globe, 
  Zap, 
  Loader2, 
  PartyPopper 
} from 'lucide-react';
import { cn } from '../lib/utils';

// Definition of tiers matches app config
type Tier = 'Explorer' | 'Basic' | 'Reseller' | 'Entrepreneur';

interface OnboardingQuizProps {
  onStartScanning: () => void;
  onSubscribe: (tier: string) => void;
  onViewAllPlans: () => void;
}

export function OnboardingQuiz({
  onStartScanning,
  onSubscribe,
  onViewAllPlans,
}: OnboardingQuizProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [describeSelf, setDescribeSelf] = useState<string>('');
  const [otherText, setOtherText] = useState<string>('');
  const [volume, setVolume] = useState<string>('');
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMsg, setLoadingMsg] = useState<string>('');
  
  // Suggested plan state
  const [suggestedTier, setSuggestedTier] = useState<Tier>('Basic');
  const [suggestedReasoning, setSuggestedReasoning] = useState<string>('');

  const descriptionOptions = [
    { id: 'casual', label: 'Casual Seller / Decluttering', desc: 'Listing occasional closet finds, family hand-me-downs, and general room assets.' },
    { id: 'reseller', label: 'Professional Reseller', desc: 'Active flipper buying low at thrifts/outlets and listing across secondary networks.' },
    { id: 'entrepreneur', label: 'E-Commerce Entrepreneur', desc: 'Running scalable merchant operations, wholesale liquidations, or physical storefronts.' },
    { id: 'other', label: 'Other', desc: 'I have a unique resale strategy, custom catalog workflow, or specialized niche.' }
  ];

  const volumeOptions = [
    { label: 'Under 10 items / month', value: '1 - 10' },
    { label: '10 to 50 items / month', value: '11 - 50' },
    { label: '51 to 200 items / month', value: '51 - 200' },
    { label: 'More than 200 items / month', value: '200+' }
  ];

  const platformOptions = [
    'eBay', 'Poshmark', 'Mercari', 'Grailed', 'Depop', 'Amazon', 'Shopify / Personal Site', 'Offline Sales / Local'
  ];

  const togglePlatform = (p: string) => {
    if (platforms.includes(p)) {
      setPlatforms(platforms.filter(item => item !== p));
    } else {
      setPlatforms([...platforms, p]);
    }
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!describeSelf) return;
      setStep(2);
    } else if (step === 2) {
      if (!volume) return;
      setStep(3);
    } else if (step === 3) {
      processSuggestions();
    }
  };

  const handlePrevStep = () => {
    if (step > 1 && step <= 3) {
      setStep((step - 1) as any);
    }
  };

  const processSuggestions = async () => {
    setStep(4);
    setIsLoading(true);

    const msgs = [
      "Mapping your reseller blueprint...",
      "Analyzing marketplace algorithms...",
      "Matching listing volumes with optimized credits...",
      "Sourcing Gemini dynamic pricing matrices...",
      "Generating personalized subscription recommendation..."
    ];

    let msgIndex = 0;
    setLoadingMsg(msgs[0]);

    const interval = setInterval(() => {
      msgIndex++;
      if (msgIndex < msgs.length) {
        setLoadingMsg(msgs[msgIndex]);
      }
    }, 700);

    try {
      const isOther = describeSelf === 'other';
      const userText = isOther && otherText.trim() ? otherText.trim() : (descriptionOptions.find(o => o.id === describeSelf)?.label || '');
      
      const response = await fetch('/api/ai/suggest-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          describeOther: userText,
          volume,
          platforms
        })
      });

      if (!response.ok) {
        throw new Error("Analysis failed status");
      }

      const data = await response.json();
      setSuggestedTier(data.suggestedTier as Tier || 'Basic');
      setSuggestedReasoning(data.reasoning || "We selected this based on your platform activity.");
    } catch (e) {
      console.error("AI recommendation failed, fallback rule algorithm is triggered:", e);
      // Hard fallback logic in client to guarantee 100% success
      let targetTier: Tier = 'Explorer';
      let textReason = "We matches you to our Explorer tier to let you pilot basic scans without overhead costs.";

      if (volume === '200+' || describeSelf === 'entrepreneur') {
        targetTier = 'Entrepreneur';
        textReason = "Because you manage extensive scaling inventory (>200 items/mo), the Entrepreneur subscription locks in supreme credit volume for your storefront needs.";
      } else if (volume === '51 - 200' || describeSelf === 'reseller') {
        targetTier = 'Reseller';
        textReason = "Operating active cross-platform stores benefits greatly from the Reseller plan's high credit allotments and premier pricing models.";
      } else if (volume === '11 - 50') {
        targetTier = 'Basic';
        textReason = "The Basic framework matches small-scale side flipping perfectly. You command ample scans to target lucrative margins.";
      }

      setSuggestedTier(targetTier);
      setSuggestedReasoning(textReason);
    } finally {
      clearInterval(interval);
      setIsLoading(false);
      setStep(5);
    }
  };

  // Helper values for displaying the card
  const getTierDetails = (tier: Tier) => {
    switch (tier) {
      case 'Explorer':
        return {
          price: '$0',
          credits: '3 Credits / Week',
          color: 'from-gray-500/20 to-zinc-600/20',
          badge: 'border-white/10 text-brand-text/80 bg-white/5',
          features: ['Gemini 1.5 Lite Integration', 'Basic item recognition', 'Basic price estimate', 'Marketplace suggestions']
        };
      case 'Basic':
        return {
          price: '$0.99*',
          credits: '40 Credits / Month',
          color: 'from-blue-500/10 to-indigo-600/15',
          badge: 'border-blue-500/30 text-blue-400 bg-blue-500/5',
          features: ['Gemini 2.5 Pro + GPT-4.1', 'Extra Marketplace Suggestions', 'AI Listing generator', 'Custom Listing Rules']
        };
      case 'Reseller':
        return {
          price: '$1.99*',
          credits: '120 Credits / Month',
          color: 'from-brand-accent/10 to-brand-accent/25',
          badge: 'border-brand-accent/30 text-brand-accent bg-brand-accent/5',
          features: ['Gemini 2.5 Pro + GPT 5.0', 'Unlimited Chatbot usage', 'Batch Upload (up to 5)', 'Mock-up Generator']
        };
      case 'Entrepreneur':
        return {
          price: '$2.99*',
          credits: '300 Credits / Month',
          color: 'from-amber-500/10 to-orange-600/20',
          badge: 'border-amber-500/30 text-amber-400 bg-amber-500/5',
          features: ['Gemini 2.5 + GPT 5.2 + Claude 4.6', 'Unrestricted Landing Page Builder', 'Batch Upload (up to 20)', 'Custom AI model selection']
        };
    }
  };

  const currentTierDetails = getTierDetails(suggestedTier);

  return (
    <div className="min-h-[85vh] py-8 md:py-16 flex items-center justify-center relative overflow-hidden px-4">
      {/* Background radial effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-accent/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10">
        <AnimatePresence mode="wait">
          {/* STEP 1: Describe Self */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="glass-card bg-brand-card/40 border-brand-border/40 p-6 md:p-10 rounded-3xl shadow-xl"
            >
              <div className="flex items-center gap-2 text-brand-accent text-xs font-black uppercase tracking-[0.25em] mb-4">
                <Sparkles className="w-4 h-4" />
                Step 1 of 3: Identity Selection
              </div>
              <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-brand-text mb-2">
                What describes your resale style best?
              </h2>
              <p className="text-brand-text-muted text-sm mb-8 leading-relaxed">
                Choose the profile that matches your scanning objectives so we can customize your dashboard layout.
              </p>

              <div className="space-y-3 mb-6">
                {descriptionOptions.map((opt) => (
                  <label
                    key={opt.id}
                    onClick={() => setDescribeSelf(opt.id)}
                    className={cn(
                      "w-full block p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group",
                      describeSelf === opt.id
                        ? "bg-brand-accent/5 border-brand-accent/50 shadow-md"
                        : "bg-brand-bg/40 border-brand-border/30 hover:bg-brand-bg/60 hover:border-brand-border/60"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 shrink-0 transition-all",
                        describeSelf === opt.id
                          ? "border-brand-accent bg-brand-accent text-brand-bg"
                          : "border-brand-border/80 text-transparent"
                      )}>
                        <Check className="w-3.5 h-3.5 stroke-[4px]" />
                      </div>
                      <div>
                        <span className="block font-bold text-sm text-brand-text uppercase tracking-wide group-hover:text-brand-accent transition-colors">
                          {opt.label}
                        </span>
                        <span className="block text-xs text-brand-text-muted mt-1 leading-normal">
                          {opt.desc}
                        </span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              {/* Dynamic text entry for other */}
              <AnimatePresence>
                {describeSelf === 'other' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mb-6"
                  >
                    <div className="p-4 rounded-2xl bg-black/20 border border-brand-border/30">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-brand-accent mb-2">
                        How would you describe your unique setup? (The AI will calculate your plan)
                      </label>
                      <input
                        type="text"
                        value={otherText}
                        onChange={(e) => setOtherText(e.target.value)}
                        placeholder="e.g. Rare collectible designer shoes, private watch collection cataloging..."
                        className="w-full bg-brand-bg/80 border border-brand-border/60 focus:border-brand-accent rounded-xl px-4 py-3 text-sm text-brand-text outline-none transition-colors"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-end pt-4 border-t border-brand-border/10">
                <button
                  disabled={!describeSelf || (describeSelf === 'other' && !otherText.trim())}
                  onClick={handleNextStep}
                  className="bg-brand-accent disabled:opacity-40 disabled:hover:brightness-100 text-brand-bg hover:brightness-110 px-6 py-3.5 rounded-xl md:rounded-full font-black uppercase text-xs tracking-widest flex items-center gap-2 shadow-lg transition-all"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Listing volume */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="glass-card bg-brand-card/40 border-brand-border/40 p-6 md:p-10 rounded-3xl shadow-xl"
            >
              <div className="flex items-center gap-2 text-brand-accent text-xs font-black uppercase tracking-[0.25em] mb-4">
                <Sparkles className="w-4 h-4" />
                Step 2 of 3: Scan Thresholds
              </div>
              <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-brand-text mb-2">
                What is your estimated scan volume?
              </h2>
              <p className="text-brand-text-muted text-sm mb-8 leading-relaxed">
                Scans are used to gather brand metadata, real-time value bands, and target market insights.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {volumeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setVolume(opt.value)}
                    className={cn(
                      "p-4 rounded-2xl border text-left transition-all h-24 flex flex-col justify-between group",
                      volume === opt.value
                        ? "bg-brand-accent/5 border-brand-accent/50 shadow-md"
                        : "bg-brand-bg/40 border-brand-border/30 hover:bg-brand-bg/60 hover:border-brand-border/60"
                    )}
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#888] group-hover:text-brand-accent transition-colors">
                      Monthly Scans
                    </span>
                    <span className="text-base font-black text-brand-text uppercase tracking-wide mt-1">
                      {opt.value}
                    </span>
                    <span className="text-[10px] text-brand-text-muted/70 truncate">
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex justify-between pt-4 border-t border-brand-border/10">
                <button
                  onClick={handlePrevStep}
                  className="border border-brand-border/40 hover:border-brand-text-muted text-brand-text px-5 py-3 rounded-xl md:rounded-full font-black uppercase text-xs tracking-widest flex items-center gap-2 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  disabled={!volume}
                  onClick={handleNextStep}
                  className="bg-brand-accent disabled:opacity-40 disabled:hover:brightness-100 text-brand-bg hover:brightness-110 px-6 py-3.5 rounded-xl md:rounded-full font-black uppercase text-xs tracking-widest flex items-center gap-2 shadow-lg transition-all"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Multi platforms */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -25 }}
              transition={{ duration: 0.25 }}
              className="glass-card bg-brand-card/40 border-brand-border/40 p-6 md:p-10 rounded-3xl shadow-xl"
            >
              <div className="flex items-center gap-2 text-brand-accent text-xs font-black uppercase tracking-[0.25em] mb-4">
                <Sparkles className="w-4 h-4" />
                Step 3 of 3: Channels Mapping
              </div>
              <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-brand-text mb-2">
                Which platforms do you target?
              </h2>
              <p className="text-brand-text-muted text-sm mb-8 leading-relaxed">
                Select all secondary channels where you cross-list your scanned merchandise. We optimize your margins database automatically.
              </p>

              <div className="grid grid-cols-2 gap-2.5 mb-8">
                {platformOptions.map((plat) => {
                  const isSelected = platforms.includes(plat);
                  return (
                    <button
                      key={plat}
                      onClick={() => togglePlatform(plat)}
                      className={cn(
                        "p-3 rounded-xl border text-sm font-semibold transition-all flex items-center justify-between",
                        isSelected
                          ? "bg-brand-accent/5 border-brand-accent/40 text-brand-accent font-bold"
                          : "bg-brand-bg/30 border-brand-border/30 hover:bg-brand-bg/50 text-brand-text-muted hover:text-brand-text"
                      )}
                    >
                      <span className="uppercase tracking-wide text-xs">{plat}</span>
                      <div className={cn(
                        "w-4.5 h-4.5 rounded border flex items-center justify-center text-xs transition-colors shrink-0",
                        isSelected
                          ? "border-brand-accent bg-brand-accent text-brand-bg"
                          : "border-brand-border/80 text-transparent"
                      )}>
                        <Check className="w-3 h-3 stroke-[4px]" />
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between pt-4 border-t border-brand-border/10">
                <button
                  onClick={handlePrevStep}
                  className="border border-brand-border/40 hover:border-brand-text-muted text-brand-text px-5 py-3 rounded-xl md:rounded-full font-black uppercase text-xs tracking-widest flex items-center gap-2 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  onClick={handleNextStep}
                  className="bg-brand-accent text-brand-bg hover:brightness-110 px-6 py-3.5 rounded-xl md:rounded-full font-black uppercase text-xs tracking-widest flex items-center gap-2 shadow-lg transition-all"
                >
                  Generate Suggestion
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: AI Matching Loading screen */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass-card bg-brand-card/40 border-brand-border/40 p-10 md:p-16 rounded-3xl shadow-xl flex flex-col items-center justify-center text-center h-[400px]"
            >
              <div className="relative mb-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  className="w-16 h-16 rounded-full border-t-2 border-r-2 border-brand-accent border-b border-l border-brand-border/20"
                />
                <Sparkles className="w-6 h-6 text-brand-accent absolute inset-0 m-auto animate-pulse" />
              </div>

              <h3 className="text-xl font-bold text-brand-text uppercase tracking-wider mb-2">
                Sellscan Engine
              </h3>
              <p className="text-brand-text-muted text-xs uppercase tracking-widest font-black max-w-sm mt-1 animate-pulse">
                {loadingMsg}
              </p>
            </motion.div>
          )}

          {/* STEP 5: Suggestion output plan cards */}
          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="glass-card bg-brand-card/40 border-brand-border/40 p-6 md:p-10 rounded-3xl shadow-xl space-y-8"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2 text-brand-accent text-xs font-black uppercase tracking-[0.25em] mb-1">
                    <PartyPopper className="w-4 h-4 text-brand-accent" />
                    Custom Matching Complete
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-brand-text">
                    Your Tailored Subscription Profile
                  </h2>
                </div>
                <div className={cn("px-4 py-1.5 rounded-full border text-[10px] uppercase font-black tracking-widest shrink-0 self-start sm:self-center", currentTierDetails.badge)}>
                  {suggestedTier} Recommended
                </div>
              </div>

              {/* Dynamic Reasoning Card from Gemini */}
              <div className="p-5 md:p-6 rounded-2xl bg-black/25 border border-brand-border/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/5 blur-2xl rounded-full pointer-events-none" />
                <div className="flex items-center gap-2 text-brand-accent text-[9px] font-black uppercase tracking-widest mb-2.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Gemini Agent Insight
                </div>
                <p className="text-brand-text text-sm leading-relaxed font-semibold italic-none">
                  "{suggestedReasoning}"
                </p>
              </div>

              {/* Recommended Tier Details Visualizer */}
              <div className={cn("rounded-2xl bg-gradient-to-br border border-brand-border/50 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6", currentTierDetails.color)}>
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-accent">Subscription Package</span>
                  <div className="text-2xl font-black uppercase tracking-tight text-brand-text flex items-baseline gap-2">
                    {suggestedTier} Tier
                    <span className="text-xs font-medium text-brand-text-muted uppercase italic-none">({currentTierDetails.credits})</span>
                  </div>
                  <div className="text-base font-black text-brand-text/90">
                    {currentTierDetails.price} <span className="text-xs font-medium text-brand-text-muted/80">/ month</span>
                  </div>
                </div>

                <div className="space-y-1.5 shrink-0">
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/50 block mb-1">Includes Benefits:</span>
                  {currentTierDetails.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-brand-text/80">
                      <div className="w-3.5 h-3.5 rounded-full bg-brand-accent/25 flex items-center justify-center text-brand-accent">
                        <Check className="w-2.5 h-2.5 stroke-[4px]" />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions panel */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-6 border-t border-brand-border/10">
                <button
                  onClick={onViewAllPlans}
                  className="w-full sm:w-auto border border-brand-border/40 hover:border-brand-text-muted text-brand-text px-5 py-3 rounded-xl md:rounded-full font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-all order-2 sm:order-1"
                >
                  View All Plans
                </button>

                <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-3 order-1 sm:order-2">
                  <button
                    onClick={onStartScanning}
                    className="w-full sm:w-auto bg-brand-bg hover:bg-brand-bg/60 border border-brand-border/50 text-brand-text hover:text-brand-accent px-5 py-3 rounded-xl md:rounded-full font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-all"
                  >
                    Scan First (Skip)
                  </button>

                  <button
                    onClick={() => onSubscribe(suggestedTier)}
                    className="w-full sm:w-auto bg-brand-accent text-brand-bg hover:brightness-110 px-6 py-3 px-8 rounded-xl md:rounded-full font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-brand-accent/15 grow"
                  >
                    Unlock Plan
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
