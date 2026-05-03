/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, Wrench, Paintbrush, Package, Plus, ExternalLink, 
  Copy, Check, Send, Sparkles, MessageCircle, ArrowLeft,
  DollarSign, TrendingUp, Info, Users
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
    <div className="pt-24 pb-20 px-4 max-w-7xl mx-auto h-[calc(100vh-64px)] flex flex-col md:flex-row gap-6">
      {/* LEFT: RESULTS DASHBOARD */}
      <div className="flex-grow overflow-y-auto pr-0 md:pr-4 space-y-6 custom-scrollbar">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-brand-text-muted hover:text-brand-text transition-colors mb-2 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to new scan
        </button>

        {/* Quick Verdict */}
        <motion.div 
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           className={cn(
             "glass-card p-6 border-brand-accent/30 bg-brand-accent/5 accent-glow relative overflow-hidden",
             highlightedCard === 'all' && "accent-glow border-brand-accent scale-[1.01]"
           )}
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-brand-accent" />
          <div className="flex items-center gap-2 text-brand-accent text-xs font-bold uppercase tracking-wider mb-2">
            <Zap className="w-3 h-3 fill-current" /> Quick Verdict
          </div>
          <p className="text-xl font-medium leading-relaxed">{analysis.quickVerdict}</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Product Overview Card (Small version of image + details) */}
          <div className="glass-card flex flex-col sm:flex-row h-full">
            {scan.imageUrl && (
              <div className="w-full sm:w-1/3 aspect-square sm:aspect-auto">
                <img src={scan.imageUrl} alt="Product" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-6 flex-grow flex flex-col justify-center">
              <div className="mb-4">
                <span className="text-[10px] uppercase font-bold text-brand-text-muted tracking-widest block mb-1">Detected Product</span>
                <h3 className="text-xl font-bold">{analysis.productDetails.brand} {analysis.productDetails.type}</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <DetailItem label="Condition" value={analysis.productDetails.condition} />
                <DetailItem label="Category" value={analysis.productDetails.category} />
              </div>
            </div>
          </div>

          {/* Price Card */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold uppercase text-brand-text-muted tracking-wider">Suggested Price</h3>
              <div className="flex items-center gap-1 text-brand-accent text-xs font-medium">
                <TrendingUp className="w-3 h-3" /> High demand
              </div>
            </div>
            <div className="text-4xl font-bold mb-6">
              {analysis.priceRange.currency}{analysis.priceRange.sweetSpot}
            </div>
            
            {/* Range Bar */}
            <div className="relative pt-6">
              <div className="h-1.5 w-full bg-brand-border rounded-full" />
              <div 
                className="absolute top-6 h-1.5 bg-brand-accent rounded-full"
                style={{ 
                  left: `${((analysis.priceRange.min - (analysis.priceRange.min * 0.8)) / (analysis.priceRange.max * 1.2 - (analysis.priceRange.min * 0.8))) * 100}%`,
                  width: `${((analysis.priceRange.max - analysis.priceRange.min) / (analysis.priceRange.max * 1.2 - (analysis.priceRange.min * 0.8))) * 100}%`
                }}
              />
              <div 
                className="absolute -top-1 w-3 h-3 rounded-full bg-brand-text z-10 border-2 border-brand-accent"
                style={{ left: `${((analysis.priceRange.sweetSpot - (analysis.priceRange.min * 0.8)) / (analysis.priceRange.max * 1.2 - (analysis.priceRange.min * 0.8))) * 100}%` }}
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-brand-bg bg-brand-text px-1 rounded">Sweet Spot</div>
              </div>
              <div className="flex justify-between mt-2 text-[10px] text-brand-text-muted font-mono uppercase">
                <span>{analysis.priceRange.currency}{analysis.priceRange.min} (fast)</span>
                <span>{analysis.priceRange.currency}{analysis.priceRange.max} (patient)</span>
              </div>
            </div>
          </div>

          {/* Platforms Card */}
          <div className="glass-card p-6 lg:col-span-1">
             <h3 className="text-sm font-bold uppercase text-brand-text-muted tracking-wider mb-6">Best Platforms</h3>
             <div className="space-y-4">
               {analysis.platforms.map((p, i) => (
                 <div key={i} className="flex flex-col gap-1 p-3 rounded-xl bg-brand-bg/50 border border-brand-border hover:border-brand-accent/30 transition-all cursor-pointer group">
                   <div className="flex items-center justify-between">
                     <div className="font-bold flex items-center gap-2">
                       {p.name} <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                     </div>
                     <span className={cn(
                       "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                       p.matchScore > 80 ? "bg-brand-accent/10 text-brand-accent border-brand-accent/20" : "bg-brand-border text-brand-text-muted border-brand-border"
                     )}>
                       {p.matchScore}% Match
                     </span>
                   </div>
                   <p className="text-xs text-brand-text-muted leading-relaxed">{p.reasoning}</p>
                 </div>
               ))}
             </div>
          </div>

          {/* Improvements Card */}
          <div className="glass-card p-6 lg:col-span-1">
             <h3 className="text-sm font-bold uppercase text-brand-text-muted tracking-wider mb-6">What to improve</h3>
             <ul className="space-y-4">
               {analysis.improvements.map((imp, i) => (
                 <li key={i} className="flex items-start gap-3">
                   <div className="w-6 h-6 rounded-lg bg-brand-bg border border-brand-border flex items-center justify-center flex-shrink-0 mt-0.5">
                     {i === 0 ? <Wrench className="w-3 h-3 text-brand-accent" /> : 
                      i === 1 ? <Paintbrush className="w-3 h-3 text-brand-accent" /> : 
                               <Package className="w-3 h-3 text-brand-accent" />}
                   </div>
                   <span className="text-sm text-brand-text-muted leading-relaxed">{imp}</span>
                 </li>
               ))}
             </ul>
             <button 
               onClick={() => prefillChat("Suggest more improvements")}
               className="mt-6 text-xs text-brand-accent font-bold hover:underline flex items-center gap-1"
             >
               <Plus className="w-3 h-3" /> More ideas
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
              <PlatformTag badge="eBay" />
              <PlatformTag badge="Vinted" />
              <PlatformTag badge="SEO Optimized" active />
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: AI CHAT SIDEBAR */}
      <div className="w-full md:w-[380px] flex flex-col glass-card border-brand-border h-[500px] md:h-full">
         <div className="p-4 border-b border-brand-border flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-accent" />
            <h3 className="font-bold">Sellscan AI</h3>
            <span className="ml-auto text-[10px] font-bold bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full">Pro</span>
         </div>
         
         <div className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {chatMessages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-12 h-12 rounded-full bg-brand-accent/5 flex items-center justify-center border border-brand-accent/20">
                  <MessageCircle className="w-6 h-6 text-brand-accent" />
                </div>
                <div>
                  <h4 className="font-bold text-sm mb-1">Interactive Refinements</h4>
                  <p className="text-xs text-brand-text-muted leading-relaxed">
                    Ask me to change the title, find a better platform, or adjust the price. I'll update the dashboard in real-time.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-2 w-full">
                  <SuggestionBtn text="Make the title shorter" onClick={prefillChat} />
                  <SuggestionBtn text="Write description for Depop" onClick={prefillChat} />
                  <SuggestionBtn text="What if I want to sell faster?" onClick={prefillChat} />
                </div>
              </div>
            )}
            
            {chatMessages.map((msg, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex flex-col max-w-[85%] gap-1",
                  msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                <div className={cn(
                  "p-3 rounded-2xl text-sm leading-relaxed",
                  msg.role === 'user' 
                    ? "bg-brand-accent text-brand-bg font-medium rounded-tr-none" 
                    : "bg-brand-card text-brand-text rounded-tl-none border border-brand-border"
                )}>
                  {msg.content}
                </div>
              </motion.div>
            ))}
            {isSending && (
               <div className="flex gap-1 items-center p-2 text-brand-text-muted">
                  <Loader2 className="w-3 h-3 animate-spin" /> Thinking...
               </div>
            )}
            <div ref={chatEndRef} />
         </div>

          <div className="p-4 border-t border-brand-border bg-brand-bg/50">
            <div className="relative group">
              <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                placeholder="Ask me to change anything..."
                className="w-full bg-brand-border/50 border border-brand-border rounded-2xl px-4 py-3 pr-12 text-sm focus:outline-none focus:border-brand-accent/50 transition-all resize-none h-20 group-hover:border-brand-accent/30 text-brand-text"
              />
              <button 
                onClick={handleSendMessage}
                disabled={!input.trim() || isSending}
                className={cn(
                  "absolute right-3 bottom-4 p-1.5 rounded-lg transition-all",
                  input.trim() ? "bg-brand-accent text-brand-bg" : "text-brand-text-muted hover:text-brand-text"
                )}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="mt-2 text-[10px] text-center text-brand-text-muted">
              Sellscan AI can make mistakes. Always verify details.
            </p>
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
