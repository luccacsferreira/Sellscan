/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ArrowLeft, FolderRoot, ChevronDown, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ProductAnalysis, ChatMessage, ScanResult, Project, AIPipelineConfig } from '../types';
import { cn } from '../lib/utils';
import { chatAboutProduct } from '../services/aiService';
import { useLocation } from '../lib/LocationContext';

// Sub Components
import { VerdictBox } from './dashboard/VerdictBox';
import { IdentityBox } from './dashboard/IdentityBox';
import { PriceInsightBox } from './dashboard/PriceInsightBox';
import { PlatformStrategyBox } from './dashboard/PlatformStrategyBox';
import { PracticalTipsBox } from './dashboard/PracticalTipsBox';
import { MarketSentimentBox } from './dashboard/MarketSentimentBox';
import { PriceTrendBox } from './dashboard/PriceTrendBox';
import { MockupGeneratorBox } from './dashboard/MockupGeneratorBox';
import { AssistantSidebar } from './dashboard/AssistantSidebar';

const CURRENCY_SYMBOLS: Record<string, string> = {
  'GBP': '£',
  'USD': '$',
  'EUR': '€',
  'BRL': 'R$'
};

interface ScanDashboardProps {
  scan: ScanResult;
  onUpdateAnalysis: (newAnalysis: ProductAnalysis) => void;
  onUpdateScan: (scan: ScanResult) => void;
  projects: Project[];
  onBack: () => void;
  pipeline: AIPipelineConfig;
}

export function ScanDashboard({ scan, onUpdateAnalysis, onUpdateScan, projects, onBack, pipeline }: ScanDashboardProps) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [highlightedCard, setHighlightedCard] = useState<string | null>(null);
  const [selectedMockup, setSelectedMockup] = useState<string | null>(null);
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
  const [analysisHistory, setAnalysisHistory] = useState<ProductAnalysis[]>([scan.analysis]);
  const [animationStage, setAnimationStage] = useState(0);

  const box1Ref = useRef<HTMLDivElement>(null);
  const box2Ref = useRef<HTMLDivElement>(null);
  const box3Ref = useRef<HTMLDivElement>(null);
  const box4Ref = useRef<HTMLDivElement>(null);
  const box5Ref = useRef<HTMLDivElement>(null);
  const box6Ref = useRef<HTMLDivElement>(null);
  const box7Ref = useRef<HTMLDivElement>(null);
  const box8Ref = useRef<HTMLDivElement>(null);

  const [isInterfered, setIsInterfered] = useState(false);
  const interferenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Force direct scroll to the very top immediately when new scan is loaded
    window.scrollTo({ top: 0, behavior: 'instant' });
    setAnimationStage(0);
    setIsInterfered(false);
    if (interferenceTimeoutRef.current) {
      clearTimeout(interferenceTimeoutRef.current);
    }
  }, [scan.id]);

  // Track physical manual zoom/scrolling interference to override auto scroll temporary
  useEffect(() => {
    const handleInterference = () => {
      setIsInterfered(true);
      if (interferenceTimeoutRef.current) {
        clearTimeout(interferenceTimeoutRef.current);
      }
      interferenceTimeoutRef.current = setTimeout(() => {
        setIsInterfered(false);
      }, 2000);
    };

    window.addEventListener('wheel', handleInterference, { passive: true });
    window.addEventListener('touchmove', handleInterference, { passive: true });
    window.addEventListener('keydown', handleInterference, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleInterference);
      window.removeEventListener('touchmove', handleInterference);
      window.removeEventListener('keydown', handleInterference);
      if (interferenceTimeoutRef.current) {
        clearTimeout(interferenceTimeoutRef.current);
      }
    };
  }, []);

  // Smooth scroll sequence to current active box
  useEffect(() => {
    if (isInterfered) return;

    const scrollActiveIntoView = () => {
      let targetRef: React.RefObject<HTMLDivElement | null> | null = null;
      if (animationStage === 0) targetRef = box1Ref;
      else if (animationStage === 1) targetRef = box2Ref;
      else if (animationStage === 2) targetRef = box3Ref;
      else if (animationStage === 3) targetRef = box4Ref;
      else if (animationStage === 4) targetRef = box5Ref;
      else if (animationStage === 5) targetRef = box6Ref;
      else if (animationStage === 6) targetRef = box7Ref;

      if (targetRef && targetRef.current) {
        targetRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    };

    const timer = setTimeout(scrollActiveIntoView, 120);
    return () => clearTimeout(timer);
  }, [animationStage, isInterfered]);

  const skipAnimation = () => {
    setAnimationStage(6);
  };
  
  const { currency } = useLocation();
  const currencySymbol = CURRENCY_SYMBOLS[currency] || currency;

  const currentProject = projects.find(p => p.id === scan.projectId);
  
  // Ensure backward compatibility with old scans
  const analysis = useMemo(() => ({
    ...scan.analysis,
    productDetails: scan.analysis.productDetails || { 
      name: 'Unknown Item',
      brand: 'Unknown', 
      type: 'Product', 
      condition: 'Unknown', 
      category: 'Other',
      characteristics: []
    },
    worthRange: scan.analysis.worthRange || scan.analysis.priceRange || { min: 0, max: 0, sweetSpot: 0 },
    priceRange: scan.analysis.priceRange || { min: 0, max: 0, sweetSpot: 0, platformAverage: 0, currency: 'USD' },
    practicalTips: scan.analysis.practicalTips || [],
    marketSentiment: scan.analysis.marketSentiment || { 
      consensus: 'General retail items', 
      goodThings: [], 
      badThings: [] 
    },
    priceHistory: scan.analysis.priceHistory && 'data' in scan.analysis.priceHistory 
      ? scan.analysis.priceHistory 
      : { 
          data: Array.isArray(scan.analysis.priceHistory) ? scan.analysis.priceHistory : [], 
          isLive: true, 
          limitedHistory: false 
        },
    platforms: (scan.analysis.platforms || []).map(p => ({
      ...p,
      edge: p.edge || '',
      listPrice: p.listPrice || (p as any).sellingPrice || 0,
      avgPrice: p.avgPrice || 0,
      profit: p.profit || (p as any).estimatedProfit || 0
    }))
  }), [scan.analysis]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isSending) return;

    const userMessage: ChatMessage = { role: 'user', content: text };
    setChatMessages(prev => [...prev, userMessage]);
    setIsSending(true);

    try {
      const response = await chatAboutProduct([...chatMessages, userMessage], analysis, pipeline);
      
      const assistantMessage: ChatMessage = { role: 'assistant', content: response.chatResponse };
      setChatMessages(prev => [...prev, assistantMessage]);
      
      if (response.analysis) {
        onUpdateAnalysis(response.analysis);
        setAnalysisHistory(prev => [...prev, response.analysis!]);
        setHighlightedCard('all');
        setTimeout(() => setHighlightedCard(null), 2000);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setChatMessages(prev => [...prev, { role: 'assistant', content: "I encountered an error syncronizing with the pricing engine. Please attempt the request again." }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleRevert = (index: number) => {
    if (analysisHistory[index]) {
      const revertedAnalysis = analysisHistory[index];
      onUpdateAnalysis(revertedAnalysis);
      // Optional: clear history after this point or keep it? Reverting usually keeps the "branch" until a new change occurs
      setChatMessages(prev => [...prev, { role: 'assistant', content: `Reverted to revision ${index + 1}.` }]);
    }
  };

  const handleAssignProject = (projectId: string | null) => {
    onUpdateScan({ ...scan, projectId: projectId || undefined });
    setIsProjectMenuOpen(false);
  };

  return (
    <div className="pt-20 pb-28 md:pb-20 px-4 md:px-10 max-w-[1400px] mx-auto min-h-screen flex flex-col lg:flex-row gap-6 md:gap-10 relative">
      <AnimatePresence>
        {selectedMockup && (
          <PlatformMockup 
            platform={selectedMockup} 
            scan={scan} 
            onClose={() => setSelectedMockup(null)} 
          />
        )}
      </AnimatePresence>

      {/* LEFT: RESULTS DASHBOARD (8 BOXES) */}
      <div className="flex-grow space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-brand-text-muted hover:text-brand-text transition-colors group w-fit"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
              <span className="text-xs font-black uppercase tracking-[0.2em]">Exit to Feed</span>
            </button>

            {animationStage < 6 && (
              <button 
                onClick={skipAnimation}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-border/20 border border-brand-border/30 text-[9px] font-bold text-brand-accent hover:border-brand-accent/50 hover:bg-brand-accent/5 transition-all cursor-pointer animate-pulse"
              >
                <span>⚡ Fast-Forward AI</span>
              </button>
            )}
          </div>

          <div className="relative">
            <button 
              onClick={() => setIsProjectMenuOpen(!isProjectMenuOpen)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-[10px] font-black uppercase tracking-widest",
                currentProject 
                  ? "bg-brand-accent/5 border-brand-accent/30 text-brand-accent" 
                  : "bg-brand-bg border-brand-border text-brand-text-muted hover:text-brand-text hover:border-brand-text/30"
              )}
            >
              <FolderRoot className="w-4 h-4" />
              {currentProject ? currentProject.name : "Assign to Archive"}
              <ChevronDown className={cn("w-3 h-3 transition-transform", isProjectMenuOpen && "rotate-180")} />
            </button>

            <AnimatePresence>
              {isProjectMenuOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full mt-2 right-0 w-64 glass-card p-2 bg-brand-bg/95 backdrop-blur-xl z-[200] shadow-2xl border-brand-border"
                >
                  <p className="text-[9px] font-black text-brand-text-muted uppercase tracking-[0.2em] px-4 py-3 border-b border-brand-border/50 mb-1">Select Destination</p>
                  <div className="max-h-60 overflow-y-auto custom-scrollbar">
                    <button 
                      onClick={() => handleAssignProject(null)}
                      className={cn(
                        "w-full text-left px-4 py-2.5 rounded-xl text-[11px] font-bold transition-all flex items-center justify-between",
                        !scan.projectId ? "text-brand-accent bg-brand-accent/10" : "text-brand-text-muted hover:bg-white/5 hover:text-brand-text"
                      )}
                    >
                      Untethered Scans
                      {!scan.projectId && <Check className="w-3 h-3" />}
                    </button>
                    {projects.map(p => (
                      <button
                        key={p.id}
                        onClick={() => handleAssignProject(p.id)}
                        className={cn(
                          "w-full text-left px-4 py-2.5 rounded-xl text-[11px] font-bold transition-all flex items-center justify-between",
                          scan.projectId === p.id ? "text-brand-accent bg-brand-accent/10" : "text-brand-text-muted hover:bg-white/5 hover:text-brand-text"
                        )}
                      >
                         <div className="flex items-center gap-3 truncate">
                           <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]" style={{ backgroundColor: p.color }} />
                           <span className="truncate">{p.name}</span>
                         </div>
                         {scan.projectId === p.id && <Check className="w-3 h-3" />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      {/* BOX 1: QUICK VERDICT */}
      <div ref={box1Ref} className="px-1 md:px-0">
        <VerdictBox 
          verdict={analysis.quickVerdict} 
          highlighted={highlightedCard === 'all'} 
          active={animationStage >= 0}
          onComplete={() => setAnimationStage(prev => Math.max(prev, 1))}
        />
      </div>

      {/* BOX 2: PRODUCT IDENTITY */}
      {animationStage >= 1 && (
        <div ref={box2Ref} className="px-1 md:px-0">
          <IdentityBox 
            imageUrl={scan.imageUrl}
            name={analysis.productDetails.name}
            brand={analysis.productDetails.brand}
            type={analysis.productDetails.type}
            condition={analysis.productDetails.condition}
            category={analysis.productDetails.category}
            active={animationStage >= 1}
            onComplete={() => setAnimationStage(prev => Math.max(prev, 2))}
          />
        </div>
      )}

        {/* BOX 3: PRICE INSIGHTS */}
        {animationStage >= 2 && (
          <div ref={box3Ref}>
            <PriceInsightBox 
              worthRange={analysis.worthRange}
              sellRange={analysis.priceRange}
              currencySymbol={currencySymbol}
              active={animationStage >= 2}
              onComplete={() => setAnimationStage(prev => Math.max(prev, 3))}
            />
          </div>
        )}

        {/* BOX 4: PLATFORM STRATEGY */}
        {animationStage >= 3 && (
          <div ref={box4Ref}>
            <PlatformStrategyBox 
              platforms={analysis.platforms}
              currencySymbol={currencySymbol}
              active={animationStage >= 3}
              onComplete={() => setAnimationStage(prev => Math.max(prev, 4))}
            />
          </div>
        )}

        {/* BOX 5: PRACTICAL TIPS */}
        {animationStage >= 4 && (
          <div ref={box5Ref}>
            <PracticalTipsBox 
              tips={analysis.practicalTips}
              basePrice={analysis.priceRange.sweetSpot}
              currencySymbol={currencySymbol}
              active={animationStage >= 4}
              onComplete={() => setAnimationStage(prev => Math.max(prev, 5))}
            />
          </div>
        )}

        {/* BOX 6: MARKET SENTIMENT */}
        {animationStage >= 5 && (
          <div ref={box6Ref}>
            <MarketSentimentBox 
              sentiment={analysis.marketSentiment} 
              active={animationStage >= 5}
              onComplete={() => setAnimationStage(prev => Math.max(prev, 6))}
            />
          </div>
        )}

        {/* BOX 7: PRICE TREND */}
        {animationStage >= 6 && (
          <div ref={box7Ref} className="transition-all duration-700">
            <PriceTrendBox 
              history={analysis.priceHistory}
              currencySymbol={currencySymbol}
            />
          </div>
        )}

        {/* BOX 8: MOCKUP GENERATOR */}
        {animationStage >= 6 && (
          <div ref={box8Ref} className="transition-all duration-700">
            <MockupGeneratorBox 
              scan={scan}
              platforms={analysis.platforms.map(p => p.name)}
              onGenerate={setSelectedMockup}
            />
          </div>
        )}
      </div>

      {/* RIGHT SIDEBAR: ASSISTANT */}
      <AssistantSidebar 
        messages={chatMessages}
        onSendMessage={handleSendMessage}
        onRevert={handleRevert}
        isSending={isSending}
        historyLog={analysisHistory}
      />
    </div>
  );
}

function PlatformMockup({ platform, scan, onClose }: { platform: string, scan: ScanResult, onClose: () => void }) {
  // Keeping simplified logic for now, could be expanded later
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-brand-bg/90 backdrop-blur-2xl" onClick={onClose} />
      <div className="glass-card w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar relative z-10 flex flex-col">
         <div className="p-6 border-b border-brand-border flex items-center justify-between sticky top-0 bg-brand-bg/80 backdrop-blur-md z-20">
           <div className="flex items-center gap-3">
             <div className="px-3 py-1 rounded-full bg-brand-accent/10 border border-brand-accent/20 text-[10px] font-black uppercase text-brand-accent">
               Live Render: {platform}
             </div>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors"><X className="w-5 h-5" /></button>
         </div>
         <div className="p-8">
            <div className="max-w-xl mx-auto space-y-10 pb-10">
               <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-brand-card border border-brand-border group">
                  <img src={scan.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
               </div>
               <div className="space-y-6">
                  <h1 className="text-3xl font-black tracking-tight">{scan.analysis.suggestedTitle}</h1>
                  <div className="flex items-center justify-between border-y border-brand-border/50 py-6">
                    <span className="text-4xl font-black text-brand-accent">{CURRENCY_SYMBOLS[scan.analysis.priceRange.currency] || scan.analysis.priceRange.currency}{scan.analysis.priceRange.sweetSpot.toFixed(2)}</span>
                    <button className="px-8 py-3 rounded-2xl bg-brand-accent text-brand-bg font-black uppercase text-xs">Buy Now</button>
                  </div>
                  <div className="prose prose-invert prose-sm">
                    {scan.analysis.suggestedDescription}
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
