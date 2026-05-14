/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, Wrench, Paintbrush, Package, Plus, ExternalLink, 
  Copy, Check, Send, Sparkles, MessageCircle, ArrowLeft,
  DollarSign, TrendingUp, Info, Users, X, ShoppingBag, Eye, Heart, MessageSquare as LucideMessageSquare, Share2, MoreHorizontal, User as LucideUser
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { ProductAnalysis, ChatMessage, ScanResult } from '../types';
import { cn } from '../lib/utils';
import { chatAboutProduct } from '../services/geminiService';

interface ScanDashboardProps {
  scan: ScanResult;
  onUpdateAnalysis: (newAnalysis: ProductAnalysis) => void;
  onBack: () => void;
}

export function ScanDashboard({ scan, onUpdateAnalysis, onBack }: ScanDashboardProps) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [copying, setCopying] = useState<'title' | 'description' | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [highlightedCard, setHighlightedCard] = useState<string | null>(null);
  const [selectedMockup, setSelectedMockup] = useState<string | null>(null);

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
      const response = await chatAboutProduct([...chatMessages, userMessage], scan.analysis);
      
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
  };

  const analysis = scan.analysis;

  return (
    <div className="pt-20 pb-28 md:pb-10 px-4 md:px-10 max-w-7xl mx-auto min-h-screen md:h-screen flex flex-col md:flex-row gap-8 overflow-hidden">
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
      <div className="flex-grow overflow-y-auto pr-0 md:pr-4 space-y-6 custom-scrollbar scroll-smooth">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-brand-text-muted hover:text-brand-text transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
            <span className="text-sm font-bold uppercase tracking-widest">Back to Scanner</span>
          </button>
          
          <div className="hidden sm:flex items-center gap-2 text-brand-text-muted">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Analysis Live</span>
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
          <p className="text-2xl font-bold leading-tight tracking-tight text-white/90">{analysis.quickVerdict}</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12 overflow-visible">
          {/* Product Overview Card */}
          <div className="glass-card flex flex-col sm:flex-row h-full group overflow-hidden border-brand-border/10">
            {scan.imageUrl && (
              <div className="w-full sm:w-[160px] lg:w-[180px] bg-black/20 flex-shrink-0 relative">
                <img src={scan.imageUrl} alt="Product" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-brand-bg/20" />
              </div>
            )}
            <div className="p-6 flex-grow flex flex-col justify-center">
              <div className="mb-6">
                <span className="text-[10px] uppercase font-bold text-brand-text-muted tracking-widest block mb-2 opacity-60">Detected Item</span>
                <h3 className="text-2xl font-bold tracking-tight text-white/95 leading-tight">
                  {analysis.productDetails.brand} <span className="text-brand-accent">{analysis.productDetails.type}</span>
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <DetailItem label="Condition" value={analysis.productDetails.condition} />
                <DetailItem label="Category" value={analysis.productDetails.category} />
              </div>
            </div>
          </div>

          {/* Price Card */}
          <div className="glass-card p-6 flex flex-col relative overflow-visible border-brand-border/10">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[10px] font-extrabold uppercase text-brand-text-muted tracking-[0.2em] opacity-60">Suggested Price</h3>
              <div className="flex items-center gap-1.5 text-brand-accent bg-brand-accent/10 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border border-brand-accent/20">
                <TrendingUp className="w-3 h-3" /> High Demand
              </div>
            </div>
            
            <div className="flex items-baseline gap-2 mb-8 mt-auto">
              <span className="text-5xl font-black tracking-tighter text-white">
                {analysis.priceRange.currency}{analysis.priceRange.sweetSpot}
              </span>
              <span className="text-brand-text-muted text-sm font-medium">avg listing</span>
            </div>
            
            {/* Range Bar */}
            <div className="relative pt-8 pb-2">
              <div className="h-2 w-full bg-brand-border/40 rounded-full overflow-hidden">
                 <div className="h-full bg-gradient-to-r from-brand-accent/20 via-brand-accent to-brand-accent/20 opacity-50" />
              </div>
              
              {/* Sweet Spot Marker */}
              <div 
                className="absolute top-5 transition-all duration-1000 ease-out"
                style={{ left: `${((analysis.priceRange.sweetSpot - (analysis.priceRange.min * 0.8)) / (analysis.priceRange.max * 1.2 - (analysis.priceRange.min * 0.8))) * 100}%` }}
              >
                <div className="flex flex-col items-center">
                  <div className="bg-brand-accent text-brand-bg px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter shadow-[0_5px_15px_-3px_var(--color-brand-accent)] mb-1">
                    Sweet Spot
                  </div>
                  <div className="w-4 h-4 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)] border-2 border-brand-accent" />
                </div>
              </div>

              <div className="flex justify-between mt-6 text-[10px] text-brand-text-muted font-bold tracking-widest uppercase">
                <div className="flex flex-col">
                  <span className="text-white/80">{analysis.priceRange.currency}{analysis.priceRange.min}</span>
                  <span className="opacity-40">Quick Sale</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-white/80">{analysis.priceRange.currency}{analysis.priceRange.max}</span>
                  <span className="opacity-40">Max Profit</span>
                </div>
              </div>
            </div>
          </div>

          {/* Platforms Card */}
          <div className="glass-card p-6 lg:col-span-1 border-brand-border/10">
             <h3 className="text-[10px] font-extrabold uppercase text-brand-text-muted tracking-[0.2em] opacity-60 mb-6">Best Platforms</h3>
             <div className="space-y-3">
               {analysis.platforms.map((p, i) => (
                 <div 
                  key={i} 
                  onClick={() => setSelectedMockup(p.name)}
                  className="flex flex-col gap-1.5 p-4 rounded-xl bg-brand-bg/40 border border-brand-border/40 hover:border-brand-accent/40 active:scale-[0.98] transition-all cursor-pointer group relative overflow-hidden"
                >
                   <div className="flex items-center justify-between relative z-10">
                     <div className="flex items-center gap-2">
                       <span className="font-bold text-white group-hover:text-brand-accent transition-colors">{p.name}</span>
                       <Eye className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-brand-accent" />
                     </div>
                     <span className={cn(
                       "text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter",
                       p.matchScore > 80 ? "bg-brand-accent text-brand-bg" : "bg-brand-border text-brand-text-muted"
                     )}>
                       {p.matchScore}% Match
                     </span>
                   </div>
                   <p className="text-xs text-brand-text-muted leading-relaxed relative z-10">{p.reasoning}</p>
                   {/* Subtle hover reveal */}
                   <div className="absolute inset-0 bg-brand-accent opacity-0 group-hover:opacity-[0.03] transition-opacity" />
                 </div>
               ))}
             </div>
          </div>

          {/* Improvements Card */}
          <div className="glass-card p-6 lg:col-span-1 border-brand-border/10">
             <h3 className="text-[10px] font-extrabold uppercase text-brand-text-muted tracking-[0.2em] opacity-60 mb-6">Execution Steps</h3>
             <ul className="space-y-5">
               {analysis.improvements.map((imp, i) => (
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
               onClick={() => prefillChat("Give me 5 more specific ways to increase the value of this item")}
               className="mt-8 px-4 py-2 rounded-lg bg-brand-accent/5 hover:bg-brand-accent/10 text-brand-accent text-xs font-bold transition-all flex items-center gap-2 group w-fit"
             >
               <Sparkles className="w-3 h-3 group-hover:rotate-12 transition-transform" /> Get Strategic Advice
             </button>
          </div>

          {/* Buyer Sentiment Card */}
          {analysis.buyerSentiment && (
            <div className="glass-card p-6 lg:col-span-2">
              <div className="flex flex-col md:flex-row gap-8">
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
            </div>
          )}
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
          <div className="p-8 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                 <h4 className="text-xs font-bold uppercase text-brand-text-muted tracking-wider">Suggested Title</h4>
                 <button 
                   onClick={() => handleCopy(analysis.suggestedTitle, 'title')}
                   className="text-brand-text-muted hover:text-brand-accent transition-colors flex items-center gap-1 text-xs"
                 >
                   {copying === 'title' ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                 </button>
              </div>
              <p className="text-lg font-bold leading-tight">{analysis.suggestedTitle}</p>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                 <h4 className="text-xs font-bold uppercase text-brand-text-muted tracking-wider">Suggested Description</h4>
                 <button 
                   onClick={() => handleCopy(analysis.suggestedDescription, 'description')}
                   className="text-brand-text-muted hover:text-brand-accent transition-colors flex items-center gap-1 text-xs"
                 >
                   {copying === 'description' ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                 </button>
              </div>
              <div className="prose prose-invert prose-sm max-w-none text-brand-text-muted leading-relaxed">
                <ReactMarkdown>{analysis.suggestedDescription}</ReactMarkdown>
              </div>
            </div>
            <div className="pt-4 border-t border-brand-border flex flex-wrap gap-2">
              {analysis.platforms.slice(0, 2).map((p, i) => (
                <PlatformTag key={i} badge={p.name} />
              ))}
              <PlatformTag badge="SEO Optimized" active />
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: AI CHAT SIDEBAR */}
      <div className="w-full md:w-[380px] lg:w-[420px] flex flex-col glass-card border-brand-border/10 bg-brand-bg/30 backdrop-blur-md h-[500px] md:h-auto md:max-h-full">
         <div className="p-4 border-b border-brand-border/50 flex items-center gap-3 bg-brand-bg/40">
            <div className="w-8 h-8 rounded-full bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-brand-accent" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight">Sellscan AI</h3>
              <div className="flex items-center gap-1.5 leading-none">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[9px] font-bold text-brand-text-muted uppercase tracking-widest">Active</span>
              </div>
            </div>
            <span className="ml-auto text-[9px] font-black bg-brand-accent text-brand-bg px-2 py-0.5 rounded uppercase tracking-tighter">Pro</span>
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
            <div className="text-3xl font-bold text-neutral-900">{analysis.priceRange.currency}{analysis.priceRange.sweetSpot}</div>
            <div className="text-xs text-neutral-500 mt-1">Approximately £{analysis.priceRange.sweetSpot}</div>
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
          <div className="text-2xl font-bold text-neutral-900">{analysis.priceRange.currency}{analysis.priceRange.sweetSpot}</div>
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
          <span className="font-black text-lg">{analysis.priceRange.currency}{analysis.priceRange.sweetSpot}</span>
          <button className="ml-auto bg-red-600 text-white px-6 py-2 text-xs font-bold uppercase tracking-widest rounded-full">Buy now</button>
        </div>
      </div>
    </div>
  );
}

function DefaultMockup({ scan, platform }: { scan: ScanResult, platform: string }) {
  const { analysis, imageUrl } = scan;
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
            <div className="text-3xl font-bold">{analysis.priceRange.currency}{analysis.priceRange.sweetSpot}</div>
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
