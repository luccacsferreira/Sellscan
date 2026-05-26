import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ChevronRight, 
  BookOpen, 
  Zap, 
  Shield, 
  ArrowLeft, 
  CreditCard, 
  Image as ImageIcon, 
  MessageSquare, 
  Sparkles,
  Search,
  ExternalLink,
  Target,
  FileText
} from 'lucide-react';
import { cn } from '../lib/utils';

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
}

const SECTIONS: Section[] = [
  { id: 'getting-started', title: 'Getting started', icon: <Target className="w-4 h-4" /> },
  { id: 'tutorial', title: 'How to use Sellscan', icon: <BookOpen className="w-4 h-4" /> },
  { id: 'credits', title: 'Credit Usage', icon: <CreditCard className="w-4 h-4" /> },
  { id: 'policies', title: 'Policies', icon: <Shield className="w-4 h-4" /> },
];

export function DocsPage({ onBack }: { onBack: () => void }) {
  const [activeSection, setActiveSection] = useState('getting-started');

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)] bg-brand-bg text-brand-text">
      {/* Sidebar */}
      <aside className="w-full md:w-80 border-r border-brand-border h-fit md:h-[calc(100vh-80px)] md:sticky md:top-20 overflow-y-auto bg-brand-bg/50 backdrop-blur-xl">
        <div className="p-8 pt-10 space-y-10">
          <div>
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-[10px] font-black text-brand-text-muted hover:text-brand-accent transition-all uppercase tracking-[0.2em] mb-10 group"
            >
              <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Back to App
            </button>
            
            <div className="space-y-1">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-accent/60 mb-4 px-4">Documentation</h2>
              <nav className="space-y-1.5">
                {SECTIONS.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      "w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all group relative font-medium",
                      activeSection === section.id 
                        ? "bg-brand-accent/10 text-brand-accent" 
                        : "text-brand-text-muted hover:text-brand-text hover:bg-white/5"
                    )}
                  >
                    <div className={cn(
                      "transition-colors",
                      activeSection === section.id ? "text-brand-accent" : "text-brand-text-muted/50 group-hover:text-brand-text"
                    )}>
                      {section.icon}
                    </div>
                    <span className="text-[13px] font-bold tracking-tight">{section.title}</span>
                    {activeSection === section.id && (
                      <motion.div 
                        layoutId="activeDocIndicator"
                        className="absolute left-0 w-1 h-5 bg-brand-accent rounded-r-full shadow-[0_0_10px_rgba(85,205,209,0.5)]"
                      />
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          <div className="pt-8 border-t border-brand-border/40">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text-muted/40 mb-4 px-4">Resources</h3>
            <div className="space-y-1">
              <a 
                href="mailto:support@trysellscan.com" 
                className="flex items-center gap-3.5 px-4 py-3 text-[13px] font-bold text-brand-text-muted hover:text-brand-text transition-colors rounded-xl hover:bg-white/5"
              >
                <div className="text-brand-text-muted/30">
                  <MessageSquare className="w-4 h-4" />
                </div>
                Support Ticket
              </a>
              <button 
                className="w-full flex items-center gap-3.5 px-4 py-3 text-[13px] font-bold text-brand-text-muted hover:text-brand-text transition-colors rounded-xl hover:bg-white/5"
              >
                <div className="text-brand-text-muted/30">
                  <FileText className="w-4 h-4" />
                </div>
                Changelog
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-grow p-8 md:p-16 lg:p-24 overflow-y-auto max-w-6xl mx-auto">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {activeSection === 'getting-started' && (
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter">Sellscan Docs</h1>
                <p className="text-xl text-brand-text-muted leading-relaxed max-w-2xl font-medium">
                  Scan, analyze, and list your items in seconds. Get the most out of our AI-powered resale intelligence platform.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-12">
                <DocsCard 
                  title="Quick Start" 
                  description="Learn the basics of scanning your first product and interpreting AI insights."
                  icon={<Zap className="w-5 h-5" />}
                  onClick={() => setActiveSection('tutorial')}
                />
                <DocsCard 
                  title="Credit System" 
                  description="Understand how credits are consumed for different AI actions and reports."
                  icon={<CreditCard className="w-5 h-5" />}
                  onClick={() => setActiveSection('credits')}
                />
              </div>
            </div>
          )}

          {activeSection === 'tutorial' && (
            <div className="prose prose-invert prose-brand max-w-none">
              <h1 className="text-4xl font-black mb-8">How to use Sellscan</h1>
              
              <div className="space-y-12">
                <TutorialStep 
                  number="01"
                  title="Upload or Describe"
                  description="Start by uploading a clear photo of the item you want to sell. For better results, ensure good lighting and a neutral background. You can also manually describe the item if you don't have a photo."
                />
                <TutorialStep 
                  number="02"
                  title="Review AI Insights"
                  description="Our AI engine will identify the product, analyze current market demand, and suggest the ideal 'Sweet Spot' price. It also highlights what you can do to increase the item's value."
                />
                <TutorialStep 
                  number="03"
                  title="Generate Listing"
                  description="Use the 'Generate Listing' feature to get professional, human-sounding descriptions optimized for platforms like eBay, Depop, or Vinted."
                />
                <TutorialStep 
                  number="04"
                  title="Refine with Chat"
                  description="Need a shorter description? Want to check the price on a different platform? Just ask the AI assistant. It has the full context of your scan."
                />
              </div>
            </div>
          )}

          {activeSection === 'credits' && (
            <div className="space-y-12">
              <div>
                <h1 className="text-4xl font-black mb-4">Credit Usage</h1>
                <p className="text-brand-text-muted text-lg mb-8">Different AI operations have different resource costs. Here is how credits are calculated.</p>
              </div>

              <div className="space-y-16">
                <CreditTable 
                  title="📷 Core Actions" 
                  icon={<ImageIcon className="w-5 h-5 text-brand-accent" />}
                  items={[
                    { action: 'Full item scan (image → full result)', cost: '1.0 credit' },
                    { action: 'Multi-image scan (2–3 images)', cost: '1.5 credits' },
                    { action: 'Re-scan same item (refine)', cost: '0.5 credits' },
                  ]}
                />

                <CreditTable 
                  title="💬 Chat / AI Assistant" 
                  icon={<MessageSquare className="w-5 h-5 text-brand-accent" />}
                  items={[
                    { action: 'Short prompt (1–2 sentences)', cost: '0.1 credits' },
                    { action: 'Normal prompt (context reply)', cost: '0.25 credits' },
                    { action: 'Long prompt (deep reasoning)', cost: '0.5 credits' },
                  ]}
                />

                <CreditTable 
                  title="🧠 Premium AI features" 
                  icon={<Sparkles className="w-5 h-5 text-brand-accent" />}
                  items={[
                    { action: 'Price optimization deep analysis', cost: '0.5 credits' },
                    { action: 'Marketplace comparison report', cost: '0.5 credits' },
                    { action: 'Listing generator (Claude-style output)', cost: '0.3 credits' },
                    { action: 'Scam/risk detection', cost: '0.3 credits' },
                    { action: 'Profit estimate + demand score', cost: '0.4 credits' },
                  ]}
                />

                <CreditTable 
                  title="⚡ Optional (future add-ons)" 
                  icon={<Zap className="w-5 h-5 text-brand-accent" />}
                  items={[
                    { action: 'Auto cross-platform listing export', cost: '1.0 credit' },
                  ]}
                />
              </div>
            </div>
          )}

          {activeSection === 'policies' && (
            <div className="max-w-3xl space-y-12">
              <div>
                <h1 className="text-4xl font-black mb-4">Policies</h1>
                <p className="text-brand-text-muted text-lg">Terms of service and privacy information for Sellscan users.</p>
              </div>

              <div className="space-y-10">
                <PolicySection 
                  title="Data Usage & AI Training" 
                  content="Any data provided to Sellscan—including uploaded images, text descriptions, manual location settings, and preferred currencies—is processed by our AI infrastructure (Gemini, OpenAI, Claude). This specialized data is used to provide accurate market analysis and personalized recommendations. Some metadata may be used to refine our internal search algorithms to ensure local market accuracy. We maintain a zero-fabrication policy and do not share biometric or identifiable user data with external training sets."
                />
                <PolicySection 
                  title="Location & Currency Privacy" 
                  content="Your location data (country/region) and currency preferences are stored to localize market trends and suggest nearby marketplace platforms. While AI may suggest currencies based on neighbor countries or global standards (USD/EUR), this data is linked only to your account profile for consistent cross-session UI localization."
                />
                <PolicySection 
                  title="Security & Storage" 
                  content="All visual assets are stored using encrypted cloud storage buckets. Authenticated data is managed via secure infrastructure layers, ensuring that your scan history is private and accessible only via your verified login. We adhere to industry-standard data protection protocols for all AI interactions."
                />
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}

function DocsCard({ title, description, icon, onClick }: { title: string, description: string, icon: React.ReactNode, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="glass-card p-8 bg-brand-card/20 border-brand-border/40 hover:border-brand-accent/50 transition-all text-left group"
    >
      <div className="w-12 h-12 rounded-xl bg-brand-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-brand-text-muted text-sm leading-relaxed">{description}</p>
    </button>
  );
}

function TutorialStep({ number, title, description }: { number: string, title: string, description: string }) {
  return (
    <div className="flex gap-8 group">
      <div className="text-5xl font-black text-brand-accent/10 group-hover:text-brand-accent/30 transition-colors tabular-nums shrink-0">
        {number}
      </div>
      <div className="space-y-3">
        <h3 className="text-2xl font-bold">{title}</h3>
        <p className="text-brand-text-muted text-lg leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function CreditTable({ title, icon, items }: { title: string, icon: React.ReactNode, items: { action: string, cost: string }[] }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        {icon}
        <h3 className="text-xl font-black uppercase tracking-widest">{title}</h3>
      </div>
      <div className="overflow-hidden rounded-2xl border border-brand-border bg-brand-card/20 backdrop-blur-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/5 border-b border-brand-border font-bold uppercase tracking-widest text-[10px] text-brand-text-muted">
              <th className="px-6 py-4">Action</th>
              <th className="px-6 py-4 text-right">Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {items.map((item, i) => (
              <tr key={i} className="hover:bg-white/5 transition-colors group">
                <td className="px-6 py-4 text-sm font-medium">{item.action}</td>
                <td className="px-6 py-4 text-right text-sm font-black text-brand-accent">{item.cost}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PolicySection({ title, content }: { title: string, content: string }) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-brand-accent" />
        {title}
      </h3>
      <p className="text-brand-text-muted leading-relaxed font-medium">
        {content}
      </p>
    </div>
  );
}
