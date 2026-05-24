/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, Wrench, Paintbrush, Package, Plus, ExternalLink, 
  Copy, Check, Send, Sparkles, MessageCircle, ArrowLeft,
  DollarSign, TrendingUp, Info, Users, X, ShoppingBag, Eye, Heart, MessageSquare as LucideMessageSquare, Share2, MoreHorizontal, User as LucideUser,
  Maximize2, Minimize2, FolderRoot, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { ProductAnalysis, ChatMessage, ScanResult, Project } from '../types';
import { cn } from '../lib/utils';
import { chatAboutProduct, AIModel } from '../services/aiService';
import { useLocation } from '../lib/LocationContext';

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
  selectedModel: AIModel;
}

export function ScanDashboard({ scan, onUpdateAnalysis, onUpdateScan, projects, onBack, selectedModel }: ScanDashboardProps) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [copying, setCopying] = useState<'title' | 'description' | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [highlightedCard, setHighlightedCard] = useState<string | null>(null);
  const [selectedMockup, setSelectedMockup] = useState<string | null>(null);
  const [isChatFullscreen, setIsChatFullscreen] = useState(false);
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
  const { currency } = useLocation();
  const currencySymbol = CURRENCY_SYMBOLS[currency] || currency;

  const chatInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleCopy = (text: string, type: 'title' | 'description') => {
    navigator.clipboard.writeText(text);
    setCopying(type);
    setTimeout(() => setCopying(null), 2000);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isSending) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setChatMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsSending(true);

    try {
      const response = await chatAboutProduct([...chatMessages, userMessage], scan.analysis, selectedModel);
      
      const assistantMessage: ChatMessage = { role: 'assistant', content: response.chatResponse };
      setChatMessages(prev => [...prev, assistantMessage]);
      
      if (response.analysis) {
        onUpdateAnalysis(response.analysis);
        // Visual feedback
        setHighlightedCard('all');
        setTimeout(() => setHighlightedCard(null), 2000);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setChatMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I ran into an error. Please try again." }]);
    } finally {
      setIsSending(false);
    }
  };

  const prefillChat = (text: string) => {
    setInput(text);
    setTimeout(() => chatInputRef.current?.focus(), 50);
  };

  const currentProject = projects.find(p => p.id === scan.projectId);

  const handleAssignProject = (projectId: string | null) => {
    onUpdateScan({ ...scan, projectId: projectId || undefined });
    setIsProjectMenuOpen(false);
  };

  const analysis = scan.analysis;

  return (
    <div className="pt-20 pb-28 md:pb-20 px-4 md:px-10 max-w-7xl mx-auto min-h-screen flex flex-col md:flex-row gap-8 relative">
      <AnimatePresence>
        {selectedMockup && (
          <PlatformMockup 
            platform={selectedMockup} 
            scan={scan} 
            onClose={() => setSelectedMockup(null)} 
          />
        )}
      </AnimatePresence>

      {/* LEFT: RESULTS DASHBOARD */}
      <div className={cn(
        "flex-grow space-y-8 scroll-smooth transition-all duration-500",
        isChatFullscreen ? "opacity-0 pointer-events-none scale-95" : "opacity-100"
      )}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-brand-text-muted hover:text-brand-text transition-colors group w-fit"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
            <span className="text-sm font-bold uppercase tracking-widest">Back to Scanner</span>
          </button>

          {/* Project Selector */}
          <div className="relative">
            <button 
              onClick={() => setIsProjectMenuOpen(!isProjectMenuOpen)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all text-xs font-bold uppercase tracking-wider",
                currentProject 
                  ? "bg-brand-accent/5 border-brand-accent/30 text-brand-accent" 
                  : "bg-brand-bg border-brand-border text-brand-text-muted hover:text-brand-text hover:border-brand-text/30"
              )}
            >
              <FolderRoot className="w-4 h-4" />
              {currentProject ? currentProject.name : "Assign to Project"}
              <ChevronDown className={cn("w-3 h-3 transition-transform", isProjectMenuOpen && "rotate-180")} />
            </button>

            <AnimatePresence>
              {isProjectMenuOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full mt-2 right-0 w-56 glass-card p-2 bg-brand-bg/95 backdrop-blur-xl z-[200] shadow-2xl border-brand-border"
                >
                  <p className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest px-3 py-2 mb-1 border-b border-brand-border/50">Select Project</p>
                  <div className="max-h-60 overflow-y-auto custom-scrollbar">
                    <button 
                      onClick={() => handleAssignProject(null)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-between",
                        !scan.projectId ? "text-brand-accent bg-brand-accent/10" : "text-brand-text-muted hover:bg-white/5 hover:text-brand-text"
                      )}
                    >
                      None
                      {!scan.projectId && <Check className="w-3 h-3" />}
                    </button>
                    {projects.map(p => (
                      <button
                        key={p.id}
                        onClick={() => handleAssignProject(p.id)}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-between",
                          scan.projectId === p.id ? "text-brand-accent bg-brand-accent/10" : "text-brand-text-muted hover:bg-white/5 hover:text-brand-text"
                        )}
                      >
                         <div className="flex items-center gap-2 truncate">
                           <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
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

        {/* Quick Verdict */}
        <motion.div 
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           className={cn(
             "glass-card p-6 border-brand-accent/30 bg-brand-accent/5 accent-glow relative overflow-hidden",
             highlightedCard === 'all' && "accent-glow border-brand-accent scale-[1.01]"
           )}
        >
          <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-accent shadow-[0_0_15px_-2px_var(--color-brand-accent)]" />
          <div className="flex items-center gap-2 text-brand-accent text-xs font-bold uppercase tracking-wider mb-3">
            <Zap className="w-3 h-3 fill-current" /> Quick Verdict
          </div>
          <p className="text-2xl font-bold leading-tight tracking-tight text-white/90">{analysis?.quickVerdict || 'No verdict available'}</p>
        </motion.div>

        <div className="space-y-6 pb-12">
          {/* Product Overview Card (Full Width) */}
          <div className="glass-card flex flex-col md:flex-row min-h-[220px] group overflow-hidden border-brand-border/10">
            {scan.imageUrl && (
              <div className="w-full md:w-1/3 min-h-[200px] bg-black/20 flex-shrink-0 relative">
                <img src={scan.imageUrl} alt="Product" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-brand-bg/20" />
              </div>
            )}
            <div className="p-8 flex-grow flex flex-col justify-center">
              <div className="mb-6">
                <span className="text-[10px] uppercase font-bold text-brand-text-muted tracking-[0.2em] block mb-3 opacity-60">Identified Item</span>
                <h3 className="text-3xl font-black tracking-tight text-white/95 leading-tight mb-2">
                  {analysis?.productDetails?.brand || 'Unknown'} <span className="text-brand-accent">{analysis?.productDetails?.type || 'Product'}</span>
                </h3>
                <p className="text-brand-text-muted text-sm max-w-xl">This item has been cross-referenced across major reselling databases for accurate valuation.</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                <DetailItem label="Condition" value={analysis?.productDetails?.condition || 'Unknown'} />
                <DetailItem label="Category" value={analysis?.productDetails?.category || 'Other'} />
                <DetailItem label="Brand" value={analysis?.productDetails?.brand || 'Generic'} />
                <DetailItem label="Method" value="AI Optical Scan" />
              </div>
            </div>
          </div>

          {/* Price Card (Full Width) */}
          <div className="glass-card p-0 flex flex-col md:flex-row relative overflow-hidden border-brand-border/10">
            <div className="w-full md:w-[40%] p-8 flex flex-col justify-center border-b md:border-b-0 md:border-r border-brand-border/10 bg-brand-bg/20">
              <div className="mb-2">
                <h3 className="text-[10px] font-extrabold uppercase text-brand-text-muted tracking-[0.2em] opacity-60 mb-6">Sweet Spot Price</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-6xl font-black tracking-tighter text-white">
                    {currencySymbol}{analysis?.priceRange?.sweetSpot || 0}
                  </span>
                </div>
              </div>
              
              {/* Range Bar Indicator */}
              <div className="relative mt-2">
                <div className="h-2 w-full bg-brand-border/20 rounded-full overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${(((analysis?.priceRange?.sweetSpot || 0) - ((analysis?.priceRange?.min || 0) * 0.5)) / ((analysis?.priceRange?.max || 1) * 1.5 - ((analysis?.priceRange?.min || 0) * 0.5))) * 100}%` }}
                     className="h-full bg-brand-accent shadow-[0_0_15px_rgba(85,205,209,0.4)]"
                   />
                </div>
                <div className="flex justify-between mt-3 text-xs font-bold text-brand-text-muted/60">
                  <span>{currencySymbol}{analysis?.priceRange?.min || 0}</span>
                  <span>{currencySymbol}{analysis?.priceRange?.max || 0}</span>
                </div>
              </div>

              <div className="mt-10">
                <button 
                  onClick={() => prefillChat(`How can I justify a price above ${currencySymbol}${analysis.priceRange.max} for this ${analysis.productDetails.brand} ${analysis.productDetails.type}?`)}
                  className="w-full py-4 rounded-xl bg-brand-accent text-brand-bg text-[11px] font-black uppercase tracking-widest transition-all shadow-[0_10px_20px_-5px_rgba(85,205,209,0.3)] hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 fill-current" /> Get Premium Pricing Strategy
                </button>
              </div>
            </div>

            <div className="flex-grow p-8 flex flex-col justify-center gap-10">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                 <div>
                   <h4 className="text-[10px] font-black text-brand-accent uppercase tracking-widest mb-2">Market Sentiment</h4>
                   <p className="text-sm text-brand-text-muted leading-relaxed">Buyers are moving fast on {analysis?.productDetails?.brand || 'this brand'}. Similar items are clearing in under 4 days when priced around {currencySymbol}{analysis?.priceRange?.sweetSpot || 0}.</p>
                 </div>
                 <div>
                   <h4 className="text-[10px] font-black text-brand-accent uppercase tracking-widest mb-2">Pricing Logic</h4>
                   <p className="text-sm text-brand-text-muted leading-relaxed">Adjusted for {analysis?.productDetails?.condition || 'current'} state and current platform seasonal trends.</p>
                 </div>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6 overflow-visible">
            {/* Platforms Card */}
          <div className="glass-card p-6 lg:col-span-1 border-brand-border/10 flex flex-col">
             <h3 className="text-[10px] font-extrabold uppercase text-brand-text-muted tracking-[0.2em] opacity-60 mb-6">Top Platforms</h3>
             <div className="space-y-3 mb-6">
               {(analysis?.platforms || []).slice(0, 5).map((p, i) => (
                 <div 
                  key={i} 
                  onClick={() => setSelectedMockup(p.name)}
                  className="flex flex-col gap-1.5 p-4 rounded-xl bg-brand-bg/40 border border-brand-border/40 hover:border-brand-accent/40 active:scale-[0.98] transition-all cursor-pointer group relative overflow-hidden"
                >
                   <div className="flex items-center justify-between relative z-10">
                     <div className="flex items-center gap-3">
                       <span className="w-6 h-6 rounded-lg bg-brand-bg border border-brand-border flex items-center justify-center text-[10px] font-black text-brand-accent">
                         {i + 1}
                       </span>
                       <span className="font-bold text-white group-hover:text-brand-accent transition-colors">{p.name}</span>
                       <Eye className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-brand-accent" />
                     </div>
                     <span className="text-[9px] font-black px-2 py-1 rounded bg-brand-accent/10 text-brand-accent border border-brand-accent/20 uppercase tracking-tighter">
                       {i === 0 ? "Fast Sell" : i === 1 ? "Hot Demand" : "Low Fees"}
                     </span>
                   </div>
                   <p className="text-xs text-brand-text-muted leading-relaxed relative z-10 pl-9">{p.reasoning}</p>
                   <div className="absolute inset-0 bg-brand-accent opacity-0 group-hover:opacity-[0.03] transition-opacity" />
                 </div>
               ))}
             </div>
              <button 
                onClick={() => prefillChat(`Give me 5 more platforms where this ${analysis.productDetails.brand} ${analysis.productDetails.type} would sell well`)}
                className="mt-auto w-full py-3 rounded-xl bg-brand-accent text-brand-bg text-[11px] font-black uppercase tracking-[0.1em] transition-all shadow-[0_10px_20px_-5px_rgba(85,205,209,0.2)] hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 fill-current" /> Get 5 more platforms
              </button>
          </div>

          {/* Improvements Card */}
          <div className="glass-card p-6 lg:col-span-1 border-brand-border/10">
             <h3 className="text-[10px] font-extrabold uppercase text-brand-text-muted tracking-[0.2em] opacity-60 mb-6">Execution Steps</h3>
             <ul className="space-y-5">
               {(analysis?.improvements || []).map((imp, i) => (
                 <li key={i} className="flex items-start gap-4">
                   <div className="w-8 h-8 rounded-xl bg-brand-bg/50 border border-brand-border flex items-center justify-center flex-shrink-0 mt-0.5">
                     {i === 0 ? <Wrench className="w-4 h-4 text-brand-accent" /> : 
                      i === 1 ? <Paintbrush className="w-4 h-4 text-brand-accent" /> : 
                               <Package className="w-4 h-4 text-brand-accent" />}
                   </div>
                   <div className="flex flex-col gap-0.5">
                     <span className="text-[10px] font-bold text-brand-accent uppercase tracking-widest opacity-60">Step 0{i+1}</span>
                     <span className="text-sm text-brand-text/80 leading-relaxed font-medium">{imp}</span>
                   </div>
                 </li>
               ))}
             </ul>
              <button 
                onClick={() => prefillChat(`Give me 5 more specific ways to increase the value of this ${analysis.productDetails.brand}`)}
                className="mt-8 w-full py-3 rounded-xl bg-brand-accent text-brand-bg text-[11px] font-black uppercase tracking-widest transition-all shadow-[0_10px_20px_-5px_rgba(85,205,209,0.2)] hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                 <Sparkles className="w-4 h-4 fill-current" /> Get Specialized Prep Tips
              </button>
          </div>

          {/* Buyer Sentiment Card */}
          {analysis.buyerSentiment && (
            <div className="glass-card p-6 lg:col-span-2 border-brand-border/10">
              <div className="flex flex-col md:flex-row gap-8 mb-8 border-b border-brand-border/10 pb-8">
                <div className="md:w-1/3">
                  <div className="flex items-center gap-2 text-brand-accent text-xs font-bold uppercase tracking-widest mb-4">
                    <Users className="w-4 h-4" /> Buyer Sentiment
                  </div>
                  <div className="flex items-baseline gap-2 mb-4">
                    <div className="text-4xl font-bold">{analysis.buyerSentiment.overallRating}</div>
                    <div className="flex gap-0.5 pb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Sparkles 
                          key={star} 
                          className={cn(
                            "w-4 h-4",
                            star <= analysis.buyerSentiment!.overallRating ? "text-brand-accent fill-current" : "text-neutral-800"
                          )} 
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-brand-text-muted leading-relaxed italic">
                    "{analysis.buyerSentiment.summary}"
                  </p>
                </div>
                
                <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-[10px] font-bold text-green-500 uppercase tracking-widest mb-4">Common Praise</h4>
                    <ul className="space-y-3">
                      {analysis.buyerSentiment.pros.map((pro, i) => (
                        <li key={i} className="flex items-start gap-2 text-[11px] text-brand-text-muted font-medium">
                          <Check className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-4">Common Complaints</h4>
                    <ul className="space-y-3">
                      {analysis.buyerSentiment.cons.map((con, i) => (
                        <li key={i} className="flex items-start gap-2 text-[11px] text-brand-text-muted font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => prefillChat(`How can I improve buyer trust for this particular ${analysis.productDetails.type}?`)}
                className="w-full py-3 rounded-xl bg-brand-accent text-brand-bg text-[11px] font-black uppercase tracking-widest transition-all shadow-[0_10px_20px_-5px_rgba(85,205,209,0.2)] hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 fill-current" /> Increase Trust Score
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Listing Preview Card */}
        <div className="glass-card p-0 overflow-hidden">
          <div className="bg-brand-bg border-b border-brand-border p-4 flex items-center justify-between">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
            </div>
            <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest">Optimized Listing Preview</span>
            <div className="w-10 h-10" />
          </div>
          <div className="p-8 space-y-8">
            <div>
              <div className="flex items-center justify-between mb-2">
                 <h4 className="text-xs font-bold uppercase text-brand-text-muted tracking-wider">Suggested Title</h4>
                 <button 
                   onClick={() => handleCopy(analysis?.suggestedTitle || '', 'title')}
                   className="text-brand-text-muted hover:text-brand-text transition-colors flex items-center gap-1 text-xs"
                 >
                   {copying === 'title' ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                 </button>
              </div>
              <p className="text-lg font-bold leading-tight">{analysis?.suggestedTitle || 'Untitled Scan'}</p>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                 <h4 className="text-xs font-bold uppercase text-brand-text-muted tracking-wider">Suggested Description</h4>
                 <button 
                   onClick={() => handleCopy(analysis?.suggestedDescription || '', 'description')}
                   className="text-brand-text-muted hover:text-brand-text transition-colors flex items-center gap-1 text-xs"
                 >
                   {copying === 'description' ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                 </button>
              </div>
              <div className="prose prose-invert prose-sm max-w-none text-brand-text-muted leading-relaxed">
                <ReactMarkdown>{analysis?.suggestedDescription || 'No description provided'}</ReactMarkdown>
              </div>
            </div>
            <div className="pt-6 border-t border-brand-border/50 flex flex-col gap-6">
              <div className="flex flex-wrap gap-2">
                {analysis.platforms.slice(0, 2).map((p, i) => (
                  <PlatformTag key={i} badge={p.name} />
                ))}
                <PlatformTag badge="SEO Optimized" active />
              </div>

              <button 
                onClick={() => prefillChat(`Rewrite this ${analysis.productDetails.type} description to be more persuasive and sales-focused.`)}
                className="w-full py-3 rounded-xl bg-brand-accent text-brand-bg text-[11px] font-black uppercase tracking-widest transition-all shadow-[0_10px_20px_-5px_rgba(85,205,209,0.2)] hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 fill-current" /> Boost Sales Copy
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: AI CHAT SIDEBAR (Sticky) */}
      <div className={cn(
        "shrink-0 transition-all duration-500 flex flex-col items-center",
        isChatFullscreen ? "fixed inset-0 z-[150] w-full h-full p-4 md:p-10 bg-brand-bg/95 backdrop-blur-xl" : "w-full md:w-[280px] lg:w-[320px]"
      )}>
        <div className={cn(
          "flex flex-col glass-card border-brand-border/10 bg-brand-bg/30 backdrop-blur-md shadow-2xl transition-all duration-500",
          isChatFullscreen ? "w-full max-w-4xl h-full" : "sticky top-24 w-full h-[500px] md:h-[calc(100vh-120px)]"
        )}>
           <div className="p-4 border-b border-brand-border/50 flex items-center justify-between bg-brand-bg/40">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center animate-pulse">
                  <Sparkles className="w-4 h-4 text-brand-accent" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight italic">Sellscan AI</h3>
                </div>
              </div>

              <button 
                onClick={() => setIsChatFullscreen(!isChatFullscreen)}
                className="p-2 rounded-lg hover:bg-brand-accent/10 text-brand-text-muted hover:text-brand-accent transition-all"
                title={isChatFullscreen ? "Exit Fullscreen" : "Fullscreen Chat"}
              >
                {isChatFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
           </div>
         
         <div className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar scroll-smooth bg-brand-bg/10">
            {chatMessages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-brand-accent/5 flex items-center justify-center border border-brand-accent/10 rotate-3">
                  <MessageCircle className="w-8 h-8 text-brand-accent/80" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-base tracking-tight leading-tight">Expert Strategy Chat</h4>
                  <p className="text-xs text-brand-text-muted leading-relaxed px-4">
                    Refine your listing in seconds. Ask for better tags, local market trends, or shipping hacks.
                  </p>
                </div>
                <div className="flex flex-col gap-2 w-full max-w-[240px]">
                  <SuggestionBtn text="Optimize for Depop" onClick={prefillChat} />
                  <SuggestionBtn text="Write 5 SEO tags" onClick={prefillChat} />
                  <SuggestionBtn text="Is this a good flip?" onClick={prefillChat} />
                </div>
              </div>
            )}
            
            {chatMessages.map((msg, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={cn(
                  "flex flex-col max-w-[90%] gap-1",
                  msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                <div className={cn(
                  "px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm",
                  msg.role === 'user' 
                    ? "bg-brand-accent text-brand-bg font-bold rounded-tr-none" 
                    : "bg-brand-card text-brand-text/90 rounded-tl-none border border-brand-border shadow-black/5"
                )}>
                  {msg.content}
                </div>
              </motion.div>
            ))}
            {isSending && (
               <div className="flex gap-2 items-center p-3 text-[10px] font-bold text-brand-accent uppercase tracking-widest bg-brand-accent/5 rounded-xl w-fit">
                  <Loader2 className="w-3 h-3 animate-spin" /> Analyzing request...
               </div>
            )}
            <div ref={chatEndRef} />
         </div>
 
          <div className="p-4 border-t border-brand-border/50 bg-brand-bg/80 backdrop-blur-sm">
            <div className="relative group">
              <textarea 
                ref={chatInputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                placeholder="Message Sellscan AI..."
                className="w-full bg-brand-border/20 border border-brand-border/50 rounded-2xl px-4 py-4 pr-12 text-sm focus:outline-none focus:border-brand-accent/40 transition-all resize-none h-24 group-hover:bg-brand-border/30 text-white placeholder:text-brand-text-muted/50"
              />
              <button 
                onClick={handleSendMessage}
                disabled={!input.trim() || isSending}
                className={cn(
                  "absolute right-3 bottom-4 p-2 rounded-xl transition-all shadow-lg",
                  input.trim() ? "bg-brand-accent text-brand-bg scale-100 opacity-100" : "text-brand-text-muted/30 scale-90 opacity-50"
                )}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string, value: string }) {
  return (
    <div>
      <span className="text-[10px] uppercase font-bold text-brand-text-muted tracking-widest block mb-0.5">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}

function PlatformTag({ badge, active }: { badge: string, active?: boolean }) {
  return (
    <span className={cn(
      "px-2 py-1 rounded text-[10px] font-bold border",
      active 
        ? "bg-brand-accent/10 border-brand-accent/30 text-brand-accent" 
        : "bg-brand-border border-brand-border text-brand-text-muted"
    )}>
      {badge}
    </span>
  );
}

function SuggestionBtn({ text, onClick }: { text: string, onClick: (t: string) => void }) {
  return (
    <button 
      onClick={() => onClick(text)}
      className="text-left px-3 py-2 rounded-lg bg-brand-bg border border-brand-border text-[11px] text-brand-text-muted hover:border-brand-accent/50 hover:text-brand-text transition-all flex items-center gap-2 group"
    >
      <Zap className="w-3 h-3 text-brand-accent opacity-50 group-hover:opacity-100" />
      {text}
    </button>
  );
}

function Loader2({ className }: { className?: string }) {
  return (
    <svg 
      className={cn("animate-spin", className)} 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}

function PlatformMockup({ platform, scan, onClose }: { platform: string, scan: ScanResult, onClose: () => void }) {
  const analysis = scan.analysis;
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 overflow-hidden"
    >
      <div 
        className="absolute inset-0 bg-brand-bg/80 backdrop-blur-xl" 
        onClick={onClose}
      />
      
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-4xl max-h-full bg-brand-bg border border-brand-border rounded-[32px] shadow-2xl flex flex-col relative z-10 overflow-hidden"
      >
        {/* Mockup Header */}
        <div className="p-4 border-b border-brand-border flex items-center justify-between bg-brand-card">
          <div className="flex items-center gap-3">
             <div className="px-3 py-1 rounded-full bg-brand-bg border border-brand-border text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
               <div className={cn(
                 "w-2 h-2 rounded-full",
                 platform.toLowerCase().includes('ebay') ? "bg-blue-500" :
                 platform.toLowerCase().includes('vinted') ? "bg-teal-500" :
                 platform.toLowerCase().includes('depop') ? "bg-red-500" :
                 "bg-green-500"
               )} />
               {platform} MOCKUP
             </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-brand-bg flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-2xl mx-auto space-y-8">
            {/* Generic Listing Layout Based on Platform */}
            {platform.toLowerCase().includes('ebay') ? (
              <EbayMockup scan={scan} />
            ) : platform.toLowerCase().includes('vinted') ? (
              <VintedMockup scan={scan} />
            ) : platform.toLowerCase().includes('depop') ? (
              <DepopMockup scan={scan} />
            ) : (
              <DefaultMockup scan={scan} platform={platform} />
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function EbayMockup({ scan }: { scan: ScanResult }) {
  const { analysis, imageUrl } = scan;
  const { currency } = useLocation();
  const currencySymbol = CURRENCY_SYMBOLS[currency] || currency;
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/2 aspect-square rounded-xl bg-neutral-100 overflow-hidden border border-neutral-200">
          <img src={imageUrl} alt="Product" className="w-full h-full object-cover" />
        </div>
        <div className="w-full md:w-1/2 space-y-4">
          <h1 className="text-xl font-medium leading-tight text-neutral-900">{analysis.suggestedTitle}</h1>
          <div className="flex items-center gap-2">
            <div className="flex text-amber-500"><Sparkles className="w-3 h-3 fill-current" /><Sparkles className="w-3 h-3 fill-current" /><Sparkles className="w-3 h-3 fill-current" /></div>
            <span className="text-xs text-neutral-500">100% positive feedback</span>
          </div>
          <div className="py-4 border-y border-neutral-100">
            <div className="text-sm text-neutral-600 mb-1">Price:</div>
            <div className="text-3xl font-bold text-neutral-900">{currencySymbol}{analysis.priceRange.sweetSpot}</div>
            <div className="text-xs text-neutral-500 mt-1">Approximately {currencySymbol}{analysis.priceRange.sweetSpot}</div>
          </div>
          <div className="space-y-2">
            <button className="w-full py-3 bg-blue-600 text-white font-bold rounded-full text-sm">Buy It Now</button>
            <button className="w-full py-3 bg-blue-100 text-blue-700 font-bold rounded-full text-sm">Add to basket</button>
          </div>
        </div>
      </div>
      <div className="p-6 bg-neutral-50 rounded-xl border border-neutral-200">
        <h3 className="font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">Description</h3>
        <div className="prose prose-neutral prose-sm max-w-none text-neutral-700">
          <ReactMarkdown>{analysis.suggestedDescription}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

function VintedMockup({ scan }: { scan: ScanResult }) {
  const { analysis, imageUrl } = scan;
  const { currency } = useLocation();
  const currencySymbol = CURRENCY_SYMBOLS[currency] || currency;
  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl border border-neutral-100 shadow-xl overflow-hidden animate-in zoom-in-95 duration-500">
      <div className="p-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold text-xs">JD</div>
        <div className="text-sm">
          <div className="font-bold text-neutral-900">John_Reseller</div>
          <div className="flex gap-0.5"><Sparkles className="w-2.5 h-2.5 text-amber-400 fill-current" /> <Sparkles className="w-2.5 h-2.5 text-amber-400 fill-current" /> <Sparkles className="w-2.5 h-2.5 text-amber-400 fill-current" /></div>
        </div>
      </div>
      <div className="aspect-square bg-neutral-50">
        <img src={imageUrl} alt="Product" className="w-full h-full object-cover" />
      </div>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-neutral-900">{currencySymbol}{analysis.priceRange.sweetSpot}</div>
          <Heart className="w-6 h-6 text-neutral-300" />
        </div>
        <div>
          <h3 className="font-bold text-neutral-900 mb-1">{analysis.productDetails.brand} {analysis.productDetails.type}</h3>
          <p className="text-xs text-neutral-500 uppercase tracking-wider">{analysis.productDetails.condition} • {analysis.productDetails.category}</p>
        </div>
        <div className="text-sm text-neutral-700 leading-relaxed line-clamp-4">
           {analysis.suggestedDescription}
        </div>
        <button className="w-full py-3 bg-teal-500 text-white font-bold rounded-lg transition-transform active:scale-95">I'm interested</button>
      </div>
    </div>
  );
}

function DepopMockup({ scan }: { scan: ScanResult }) {
  const { analysis, imageUrl } = scan;
  const { currency } = useLocation();
  const currencySymbol = CURRENCY_SYMBOLS[currency] || currency;
  return (
    <div className="max-w-md mx-auto bg-white border border-neutral-200 animate-in slide-in-from-right-8 duration-500">
      <div className="p-3 flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-black" />
        <span className="text-xs font-bold tracking-tight">vintage_vault</span>
      </div>
      <div className="aspect-square bg-neutral-100 relative">
        <img src={imageUrl} alt="Product" className="w-full h-full object-cover" />
        <div className="absolute bottom-4 left-4 flex gap-2">
          <div className="bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest">{analysis.productDetails.brand}</div>
        </div>
      </div>
      <div className="p-4 space-y-4 flex flex-col">
        <div className="flex gap-4">
          <Heart className="w-5 h-5" />
          <LucideMessageSquare className="w-5 h-5" />
          <Share2 className="w-5 h-5" />
          <MoreHorizontal className="w-5 h-5 ml-auto" />
        </div>
        <div>
          <span className="font-bold text-sm mr-2">vintage_vault</span>
          <span className="text-sm text-neutral-800">{analysis.suggestedTitle}</span>
        </div>
        <div className="text-sm text-neutral-500 whitespace-pre-wrap">
          {analysis.suggestedDescription}
        </div>
        <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
          <span className="font-black text-lg">{currencySymbol}{analysis.priceRange.sweetSpot}</span>
          <button className="ml-auto bg-red-600 text-white px-6 py-2 text-xs font-bold uppercase tracking-widest rounded-full">Buy now</button>
        </div>
      </div>
    </div>
  );
}

function DefaultMockup({ scan, platform }: { scan: ScanResult, platform: string }) {
  const { analysis, imageUrl } = scan;
  const { currency } = useLocation();
  const currencySymbol = CURRENCY_SYMBOLS[currency] || currency;
  return (
    <div className="glass-card overflow-hidden animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-2/5 aspect-square">
          <img src={imageUrl} alt="Product" className="w-full h-full object-cover" />
        </div>
        <div className="p-8 flex-grow space-y-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-accent mb-2 block">{platform} Listing</span>
            <h1 className="text-2xl font-bold leading-tight">{analysis.suggestedTitle}</h1>
          </div>
          <div className="flex items-center justify-between py-4 border-y border-brand-border">
            <div className="text-3xl font-bold">{currencySymbol}{analysis.priceRange.sweetSpot}</div>
            <div className="text-xs text-brand-text-muted text-right">
              Recommended for {platform}<br />
              <span className="text-brand-accent">{analysis.platforms.find(p => p.name === platform)?.matchScore}% Match Score</span>
            </div>
          </div>
          <div className="prose prose-invert prose-sm max-w-none text-brand-text-muted">
            <ReactMarkdown>{analysis.suggestedDescription}</ReactMarkdown>
          </div>
          <button className="w-full py-4 bg-brand-accent text-brand-bg font-bold rounded-2xl hover:scale-[1.02] transition-all">
            List on {platform}
          </button>
        </div>
      </div>
    </div>
  );
}
