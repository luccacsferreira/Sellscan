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
  { id: 'plans', title: 'Pricing Plans', icon: <Zap className="w-4 h-4" /> },
  { id: 'credits', title: 'Credit Usage', icon: <CreditCard className="w-4 h-4" /> },
  { id: 'policies', title: 'Policies', icon: <Shield className="w-4 h-4" /> },
];

export function DocsPage({ onBack }: { onBack: () => void }) {
  const [activeSection, setActiveSection] = useState('getting-started');
  const [activePolicySubTab, setActivePolicySubTab] = useState('terms');

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
              <button 
                onClick={() => alert("To submit an official support ticket, please sign in and access the secure interactive Support desk located in your User Dashboard profile settings. Our agents respond within 24 hours.")}
                className="w-full flex items-center gap-3.5 px-4 py-3 text-[13px] font-bold text-brand-text-muted hover:text-brand-text transition-colors rounded-xl hover:bg-white/5 text-left cursor-pointer"
              >
                <div className="text-brand-text-muted/30">
                  <MessageSquare className="w-4 h-4" />
                </div>
                Support Ticket
              </button>
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
                <DocsCard 
                  title="Quick Start" 
                  description="Learn the basics of scanning your first product and interpreting AI insights."
                  icon={<Target className="w-5 h-5" />}
                  onClick={() => setActiveSection('tutorial')}
                />
                <DocsCard 
                  title="Pricing Plans" 
                  description="Explore our membership tiers, credit allocations, and exclusive feature unlocks."
                  icon={<Zap className="w-5 h-5" />}
                  onClick={() => setActiveSection('plans')}
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

          {activeSection === 'plans' && (
            <div className="space-y-12">
              <div className="space-y-4">
                <h1 className="text-4xl font-black tracking-tighter">Membership Tiers</h1>
                <p className="text-xl text-brand-text-muted leading-relaxed max-w-2xl font-medium">
                  Choose the intelligence tier that fits your resale volume. All paid plans include priority server access and advanced AI models.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-12 pt-8">
                <div className="space-y-6">
                  <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-brand-accent rounded-full" />
                    Tier Comparison
                  </h2>
                  <div className="overflow-x-auto rounded-3xl border border-brand-border bg-brand-card/20 backdrop-blur-sm">
                    <table className="w-full text-left min-w-[700px]">
                      <thead>
                        <tr className="bg-white/5 border-b border-brand-border font-bold uppercase tracking-widest text-[10px] text-brand-text-muted">
                          <th className="px-6 py-5">Feature</th>
                          <th className="px-6 py-5">Explorer</th>
                          <th className="px-6 py-5">Reseller</th>
                          <th className="px-6 py-5 text-brand-accent">Founder</th>
                          <th className="px-6 py-5">Entrepreneur</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-border text-[13px]">
                        <PlanRow label="Monthly Credits" values={['3/week', '40', '120', '300']} />
                        <PlanRow label="AI Models" values={['Flash', 'Pro + GPT-4', 'Pro + GPT-4', 'Premium Bundle']} />
                        <PlanRow label="Price Analysis" values={['Basic', 'Advanced', 'Full Data', 'Real-time']} />
                        <PlanRow label="AI Chat Access" values={['None', 'Basic', 'Full', 'Unlimited']} />
                        <PlanRow label="Listing Generator" values={['Disabled', 'Standard', 'Enhanced', 'Premium']} />
                        <PlanRow label="Demand Insights" values={['None', 'Limited', 'Full', 'Deep Market']} />
                        <PlanRow label="Priority Support" values={['No', 'Email', 'Dashboard', '24/7 Priority']} />
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="glass-card p-8 bg-brand-card/10 border-brand-border/40 space-y-4">
                    <h3 className="text-lg font-black text-brand-accent uppercase tracking-widest">Why Upgrade?</h3>
                    <p className="text-brand-text-muted leading-relaxed font-medium">
                      The free <strong>Explorer</strong> tier is meant for casual decluttering. If you flip items regularly, the <strong>Reseller</strong> plan pays for itself with improved pricing accuracy and automated listing generation. 
                    </p>
                  </div>
                  <div className="glass-card p-8 bg-brand-accent/5 border-brand-accent/20 space-y-4">
                    <h3 className="text-lg font-black text-brand-accent uppercase tracking-widest">Founder Benefits</h3>
                    <p className="text-brand-text-muted leading-relaxed font-medium">
                      Our <strong>Founder</strong> tier unlocks full access to the AI Chat assistant, allowing you to refine listings, ask for cross-platform pricing, and get deeper profit analysis on every scan.
                    </p>
                  </div>
                </div>
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
            <div className="max-w-4xl space-y-10">
              <div>
                <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter">Policies & Legal Compliance</h1>
                <p className="text-brand-text-muted text-lg max-w-2xl">
                  Please review our comprehensive, binding terms and compliance mechanisms protecting user intellectual property, secure transaction pipelines, and privacy bounds.
                </p>
              </div>

              {/* Sub-tabs buttons */}
              <div className="flex flex-wrap gap-2 border-b border-brand-border pb-1">
                {[
                  { id: 'terms', label: 'Terms of Service' },
                  { id: 'privacy', label: 'Privacy Policy' },
                  { id: 'data', label: 'Data & AI Usage' },
                  { id: 'cookies', label: 'Cookie Declaration' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActivePolicySubTab(tab.id)}
                    className={cn(
                      "px-5 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 relative -mb-[2px] cursor-pointer",
                      activePolicySubTab === tab.id
                        ? "border-brand-accent text-brand-accent"
                        : "border-transparent text-brand-text-muted hover:text-brand-text"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Policy viewer panel */}
              <div className="glass-card p-6 md:p-10 bg-brand-card/20 border-brand-border/40 rounded-3xl space-y-6 text-sm text-brand-text-muted leading-relaxed max-w-none">
                
                {activePolicySubTab === 'terms' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-brand-border pb-4">
                      <h2 className="text-xl font-black text-brand-text tracking-tight uppercase">Terms of Service</h2>
                      <span className="text-[10px] font-mono bg-brand-accent/10 text-brand-accent px-2 py-1 rounded">VERSION 2.2</span>
                    </div>
                    <p className="text-xs text-brand-text-muted italic">Last updated: June 2, 2026</p>
                    <p>
                      Welcome to <strong>trysellscan.com</strong> (“the Sellscan Platform”, “the Service”). By accessing, registering an account, capturing images, executing scans, or committing transactions with Sellscan Inc., you agree to be bound by these Terms of Service. If you do not accept these term clauses, you must suspend your access to the platform immediately.
                    </p>

                    <h3 className="text-base font-bold text-brand-text uppercase tracking-wider font-mono pt-4">1. Scope of Service & Platform License</h3>
                    <p>
                      Sellscan utilizes advanced vision-language deep learning pipelines (including Google Gemini API nodes) to categorize, identify, assess, and suggest list parameters for fashion apparel, collectibles, rare vintage products, electronics, and standard retail items. Sellscan grants you a non-commercial, revocable, personal license to utilize our client-facing scanner modules and inventory manager panel according to standard usage quotas.
                    </p>

                    <h3 className="text-base font-bold text-brand-text uppercase tracking-wider font-mono pt-4">2. Account Safety & Subscriptions</h3>
                    <p>
                      Access to specific processing thresholds (including Basic and Premium modules) requires secure account registration managed securely via Supabase Authentication. You must maintain confidential control over your sign-on credentials. Subscriptions operate on a persistent recurring billing baseline corresponding to your subscription cycle (Monthly or Yearly) and are processed exclusively via <strong>Stripe Certified Payment Gateway</strong>.
                    </p>

                    <h3 className="text-base font-bold text-brand-text uppercase tracking-wider font-mono pt-4">3. Fair Allocation, Rate Limits & System Abuse</h3>
                    <p>
                      Platform resources are strictly metered based on credits. Subscriptions operate under automatic credit allocation ceilings to maintain optimal server response times and guarantee latency consistency for all creators. Running script-based automated screen scrapers, reverse-engineering API endpoints, or launching heavy batch-upload spiders from personal clients is strictly prohibited and constitutes immediate grounds for profile termination and credit forfeiture.
                    </p>

                    <h3 className="text-base font-bold text-brand-text uppercase tracking-wider font-mono pt-4">4. Disclaimers: Market Valuation Estimates & AI Limitation</h3>
                    <p>
                      All returned valuation guidelines, suggested marketplace targets, sweet-spot pricing indexes, and text drafts are generated via neural-network heuristic approximations. <strong>Sellscan does not guarantee, represent, or warrant that physical scanned items will fetch specific financial rewards in secondary markets.</strong> Re-selling involves inherent visual and monetary risk; you agree that Sellscan owns zero liability for pricing choices, inventory transactions, or losses occurred on Etsy, eBay, Vinted, Wallapop, Depop, or any secondary trade websites.
                    </p>

                    <h3 className="text-base font-bold text-brand-text uppercase tracking-wider font-mono pt-4">5. Customer Support & Official Contacts</h3>
                    <p>
                      For active billing queries, credit rectifications, or customer service support, please submit an official message directly through the <strong>Support channel inside your User profile dashboard</strong>. All commercial operations are structured exclusively under Delaware, United States governing system.
                    </p>

                    <h3 className="text-base font-bold text-brand-text uppercase tracking-wider font-mono pt-4">6. Jurisdiction & Severe Terms</h3>
                    <p>
                      These terms are governed by and construed in accordance with the laws of Delaware, United States, without regard to its conflict of law provisions. Claims and disputes shall be settled exclusively in courts located inside that jurisdiction.
                    </p>
                  </div>
                )}

                {activePolicySubTab === 'privacy' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-brand-border pb-4">
                      <h2 className="text-xl font-black text-brand-text tracking-tight uppercase">Privacy Policy</h2>
                      <span className="text-[10px] font-mono bg-brand-accent/10 text-brand-accent px-2 py-1 rounded">VERSION 2.2</span>
                    </div>
                    <p className="text-xs text-brand-text-muted italic">Last updated: June 2, 2026</p>
                    <p>
                      At Sellscan, we hold client data integrity in the highest regard, designing secure image transmission channels and establishing standard structures to comply fully with the GDPR (General Data Protection Regulation) and California Consumer Privacy Act (CCPA).
                    </p>

                    <h3 className="text-base font-bold text-brand-text uppercase tracking-wider font-mono pt-4">1. Personal Information We Collect</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Identity Records:</strong> Authenticated email addresses and user unique identifiers (UUIDs) registered through Supabase Auth.</li>
                      <li><strong>Image Uploads:</strong> Item visuals uploaded to the scanner. These images are optimized and cleaned of sensitive EXIF parameters automatically before processing.</li>
                      <li><strong>Transaction Metadata:</strong> Stripe receipt logs, billing intervals, and transaction state tokens. Raw proprietary credit card numbers never traverse our databases.</li>
                    </ul>

                    <h3 className="text-base font-bold text-brand-text uppercase tracking-wider font-mono pt-4">2. Processing, Transmission, & AI Services</h3>
                    <p>
                      Visual files are cached in certified cloud object buckets and dispatched to AI servers (Google Gemini services) through secure proxies. Please consult our Data Usage & AI Policy to understand how these elements are strictly decoupled from general public retraining loops.
                    </p>

                    <h3 className="text-base font-bold text-brand-text uppercase tracking-wider font-mono pt-4">3. Children's Privacy Protection (COPPA Compliance)</h3>
                    <p>
                      <strong>Sellscan’s visual scanner tools and subscription systems are built strictly for individuals aged 13 and older.</strong> We do not knowingly compile, request, or keep personal parameters or images representing individuals under the age of 13. If you believe a child under 13 has registered or dispatched data, please alert us through our official support chat or dashboard, and we will delete all corresponding account details securely and permanently.
                    </p>

                    <h3 className="text-base font-bold text-brand-text uppercase tracking-wider font-mono pt-4">4. CCPA / GDPR Data Choices & Consumer Rights</h3>
                    <p>
                      We fully support global information rights. You can:
                      <br />• Request complete export of all database entries associated with your Supabase identifier.
                      <br />• Modify incorrect profile details.
                      <br />• Initiate complete, irreversible accounts and scan history wipes directly through the User Profile Settings menu.
                    </p>

                    <h3 className="text-base font-bold text-brand-text uppercase tracking-wider font-mono pt-4">5. Privacy Support Inquiries</h3>
                    <p>
                      For privacy-focused inquiries, please contact our privacy compliance group via the interactive Support center inside your User Profile dashboard, or execute a complete purge using in-app settings.
                    </p>
                  </div>
                )}

                {activePolicySubTab === 'data' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-brand-border pb-4">
                      <h2 className="text-xl font-black text-brand-text tracking-tight uppercase">Data Usage & AI Policy</h2>
                      <span className="text-[10px] font-mono bg-brand-accent/10 text-brand-accent px-2 py-1 rounded">VERSION 2.2</span>
                    </div>
                    <p className="text-xs text-brand-text-muted italic">Last updated: June 2, 2026</p>
                    <p>
                      This special document outlines how Sellscan handles visual coordinates, user-submitted media, generated descriptions, and machine learning pipelines without compromising intellectual capital or user transparency.
                    </p>

                    <h3 className="text-base font-bold text-brand-text uppercase tracking-wider font-mono pt-4">1. Zero Foundational LLM Retraining</h3>
                    <p>
                      We enforce zero-retraining guidelines in our API service contracts: <strong>No photo uploads, description edits, listing edits, or pricing adjustments processed on Sellscan are ever utilized by downstream suppliers to train or refine public foundation models.</strong> Your business insights remain your exclusive competitive edge.
                    </p>

                    <h3 className="text-base font-bold text-brand-text uppercase tracking-wider font-mono pt-4">2. Sanitization & EXIF Sweeper</h3>
                    <p>
                      Image files are compressed, scaled, and stripped of geographical coordinate stamps on the client-side or during initial ingestion. This prevents the dissemination of home or location-specific telemetry while keeping your uploads fast over standard wireless connections.
                    </p>

                    <h3 className="text-base font-bold text-brand-text uppercase tracking-wider font-mono pt-4">3. Automated Individual Decision-making Disclaimer</h3>
                    <p>
                      Our visual agents employ automated categorization to offer appraising guidelines, but final commercial decisions are entirely human-guided. The platform provides recommendations solely as informational guidelines, and we encourage users to verify appraisals manually before settling transactions on external trade systems.
                    </p>

                    <h3 className="text-base font-bold text-brand-text uppercase tracking-wider font-mono pt-4">4. Intellectual Ownership of AI Outputs</h3>
                    <p>
                      Every generated listing title, descriptive draft, and bulleted platform proposal is 100% owned by the creator. You possess unrestricted copyright privileges to copy, publish, modify, or export these files for commercial sale across Etsy, eBay, Vinted, Vestiaire Collective, Wallapop, Depop, or custom online storefronts.
                    </p>
                  </div>
                )}

                {activePolicySubTab === 'cookies' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-brand-border pb-4">
                      <h2 className="text-xl font-black text-brand-text tracking-tight uppercase">Cookie Declaration</h2>
                      <span className="text-[10px] font-mono bg-brand-accent/10 text-brand-accent px-2 py-1 rounded">VERSION 2.2</span>
                    </div>
                    <p className="text-xs text-brand-text-muted italic">Last updated: June 2, 2026</p>
                    <p>
                      We utilize cookies and browser storage with absolute restriction, reserving digital tracking exclusively for critical platform capabilities.
                    </p>

                    <h3 className="text-base font-bold text-brand-text uppercase tracking-wider font-mono pt-4">1. Essential Operational Variables</h3>
                    <p>
                      These local instances are strictly necessary for the website to load:
                      <br />• <strong>Security & Auth:</strong> Supabase session identifiers and tokens to keep you authorized during uploads.
                      <br />• <strong>Preference Storage:</strong> Saved defaults such as your localized default currency values, last scanned filters, and theme configuration (light/dark) cached inside localStorage.
                      <br />• <strong>Partner Allocation:</strong> Unique referral variables recorded locally to correctly credit active contributors if a premium tier is purchased.
                    </p>

                    <h3 className="text-base font-bold text-brand-text uppercase tracking-wider font-mono pt-4">2. Zero Cross-Site Ad Tracking Cookies</h3>
                    <p>
                      <strong>trysellscan.com does not deploy marketing pixels, cross-site behavior trackers, or third-party ad network cookies.</strong> We do not sell your browsing patterns, inventory classifications, or platform coordinates to advertising brokers.
                    </p>

                    <h3 className="text-base font-bold text-brand-text uppercase tracking-wider font-mono pt-4">3. Direct Control Options</h3>
                    <p>
                      You can change your browser settings to reject cookies entirely or clear your browser's localStorage at any point. Note that clearing operational tokens will sign you out and require credentials on your next session.
                    </p>
                  </div>
                )}
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

function PlanRow({ label, values }: { label: string, values: string[] }) {
  return (
    <tr className="hover:bg-white/5 transition-colors">
      <td className="px-6 py-4 font-bold text-brand-text-muted/60">{label}</td>
      {values.map((v, i) => (
        <td key={i} className={cn(
          "px-6 py-4 font-medium",
          i === 2 ? "text-brand-accent font-black" : "text-brand-text"
        )}>
          {v}
        </td>
      ))}
    </tr>
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
