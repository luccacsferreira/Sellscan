import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, Sparkles, MessageCircle, Maximize2, Minimize2, 
  RotateCcw, Trash2, ArrowLeft, Loader2, Zap 
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { ChatMessage, ProductAnalysis } from '../../types';

interface AssistantSidebarProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onRevert: (index: number) => void;
  isSending: boolean;
  historyLog: ProductAnalysis[];
}

export function AssistantSidebar({ messages, onSendMessage, onRevert, isSending, historyLog }: AssistantSidebarProps) {
  const [input, setInput] = useState('');
  const [isChatFullscreen, setIsChatFullscreen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isSending) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className={cn(
      "shrink-0 transition-all duration-500 flex flex-col items-center",
      isChatFullscreen ? "fixed inset-0 z-[150] w-full h-full p-4 md:p-10 bg-brand-bg/95 backdrop-blur-xl" : "w-full md:w-[280px] lg:w-[320px] sticky top-24 self-start"
    )}>
      <motion.div 
        layout
        className={cn(
          "flex flex-col glass-card border-brand-border/10 bg-brand-bg/30 backdrop-blur-md shadow-2xl transition-all duration-500 w-full",
          isChatFullscreen ? "w-full max-w-4xl h-full" : "h-[500px] md:h-[calc(100vh-120px)]"
        )}
      >
        <div className="p-4 border-b border-brand-border/50 flex items-center justify-between bg-brand-bg/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center">
              <Sparkles className={cn("w-4 h-4 text-brand-accent", isSending && "animate-pulse")} />
            </div>
            <h3 className="font-bold text-sm tracking-tight italic">Sellscan AI</h3>
          </div>

          <button 
            onClick={() => setIsChatFullscreen(!isChatFullscreen)}
            className="p-2 rounded-lg hover:bg-brand-accent/10 text-brand-text-muted hover:text-brand-accent transition-all"
          >
            {isChatFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-4 space-y-6 custom-scrollbar scroll-smooth">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-brand-accent/5 flex items-center justify-center border border-brand-accent/10 rotate-3">
                <MessageCircle className="w-8 h-8 text-brand-accent/80" />
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-base tracking-tight leading-tight uppercase">Strategic Command</h4>
                <p className="text-[11px] text-brand-text-muted leading-relaxed px-4 font-medium opacity-60">
                  Refine valuation parameters, request SEO listing boosts, or simulated shipping logistics analysis.
                </p>
              </div>
              <div className="flex flex-col gap-2 w-full px-4">
                <SuggestionBtn text="Lower sweet spot by 10%" onClick={onSendMessage} />
                <SuggestionBtn text="Optimize for eBay PowerSeller" onClick={onSendMessage} />
                <SuggestionBtn text="Is this a viable flip?" onClick={onSendMessage} />
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn(
                "flex flex-col max-w-[90%] gap-2",
                msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
              )}
            >
              <div className={cn(
                "px-4 py-3 rounded-2xl text-[13px] leading-relaxed shadow-sm",
                msg.role === 'user' 
                  ? "bg-brand-accent text-brand-bg font-bold rounded-tr-none" 
                  : "bg-brand-card text-brand-text/90 rounded-tl-none border border-brand-border"
              )}>
                {msg.content}
              </div>
              
              {msg.role === 'assistant' && i > 0 && i < messages.length - 1 && (
                <button 
                  onClick={() => onRevert(Math.floor(i / 2))}
                  className="flex items-center gap-1.5 text-[9px] font-black uppercase text-brand-text-muted hover:text-brand-accent transition-colors"
                >
                  <RotateCcw className="w-2.5 h-2.5" /> Revert to this State
                </button>
              )}
            </motion.div>
          ))}
          {isSending && (
             <div className="flex gap-2 items-center p-3 text-[10px] font-bold text-brand-accent uppercase tracking-widest bg-brand-accent/5 rounded-xl w-fit">
                <Loader2Icon className="w-3 h-3 animate-spin" /> Recalculating Matrix...
             </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 border-t border-brand-border/50 bg-brand-bg/80">
          <div className="relative group">
            <textarea 
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              placeholder="Ask for refinement..."
              className="w-full bg-brand-border/20 border border-brand-border/50 rounded-2xl px-4 py-4 pr-12 text-xs focus:outline-none focus:border-brand-accent/40 transition-all resize-none h-24 text-brand-text placeholder:text-brand-text-muted/50"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isSending}
              className={cn(
                "absolute right-3 bottom-4 p-2 rounded-xl transition-all",
                input.trim() ? "bg-brand-accent text-brand-bg opacity-100" : "text-brand-text-muted/30 opacity-50 pointer-events-none"
              )}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function SuggestionBtn({ text, onClick }: { text: string, onClick: (t: string) => void }) {
  return (
    <button 
      onClick={() => onClick(text)}
      className="text-left px-3 py-2 rounded-xl bg-brand-bg border border-brand-border text-[10px] font-bold text-brand-text-muted hover:border-brand-accent/50 hover:text-brand-text transition-all flex items-center gap-2 group"
    >
      <Zap className="w-3 h-3 text-brand-accent opacity-50 group-hover:opacity-100" />
      {text}
    </button>
  );
}

function Loader2Icon({ className }: { className?: string }) {
  return (
    <svg className={cn("animate-spin", className)} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}
