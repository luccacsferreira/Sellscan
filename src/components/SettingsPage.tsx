/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { User, Bell, Shield, CreditCard, LogOut, ChevronRight, MapPin, RefreshCcw, Zap, Sun, Moon, X, Sparkles, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useLocation } from '../lib/LocationContext';
import { supabase } from '../lib/supabase';

import { AIModelId, AIPipelineConfig, AIPlan } from '../types';
import { AI_MODELS, calculateScanCost, DEFAULT_PIPELINES } from '../lib/ai-config';

import { LanguageModal } from './LanguageModal';

export function SettingsPage({ 
  pipeline,
  setPipeline,
  plan = 'free',
  isLoggedIn,
  userEmail,
  themeMode,
  setThemeMode
}: { 
  pipeline: AIPipelineConfig,
  setPipeline: (p: AIPipelineConfig) => void,
  plan?: AIPlan,
  isLoggedIn: boolean,
  userEmail?: string,
  themeMode: 'dark' | 'light' | 'system',
  setThemeMode: (m: 'dark' | 'light' | 'system') => void
}) {
  const { location, setLocation, requestLocation, isLoading } = useLocation();
  const [secretsStatus, setSecretsStatus] = React.useState({ gemini: false, openai: false });
  const [isAICoreOpen, setIsAICoreOpen] = React.useState(false);
  const [isLangModalOpen, setIsLangModalOpen] = React.useState(false);

  const costPerScan = calculateScanCost(pipeline);

  React.useEffect(() => {
    fetch('/api/health/secrets')
      .then(res => res.json())
      .then(data => setSecretsStatus(data))
      .catch(() => {});
  }, []);

  return (
    <div className="pt-32 pb-20 px-4 max-w-3xl mx-auto">
      <LanguageModal isOpen={isLangModalOpen} onClose={() => setIsLangModalOpen(false)} />
      
      <h1 className="text-4xl font-bold mb-12">Settings</h1>
      
      <div className="space-y-4">
        {isLoggedIn && (
          <SettingsGroup title="Account">
            <SettingsItem icon={<User className="text-blue-500" />} label="Profile Information" value={userEmail || "Anonymous"} />
            <SettingsItem icon={<Bell className="text-amber-500" />} label="Notifications" value="Enabled" />
            <SettingsItem icon={<Shield className="text-green-500" />} label="Security" value="MFA Active" />
          </SettingsGroup>
        )}

        <SettingsGroup title="Preferences">
          <div className="p-4 flex items-center justify-between hover:bg-brand-bg group cursor-pointer transition-all" onClick={() => setIsLangModalOpen(true)}>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-bg border border-brand-border flex items-center justify-center">
                <Globe className="text-brand-accent" />
              </div>
              <div>
                <p className="text-sm font-bold">App Language</p>
                <p className="text-xs text-brand-text-muted">Global Translation</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-brand-text-muted group-hover:translate-x-1 transition-transform" />
          </div>
        </SettingsGroup>

        <SettingsGroup title="Appearance">
          <div className="p-6 bg-brand-bg/50">
            <div className="flex items-center gap-3 mb-6">
              <Sun className="w-5 h-5 text-brand-accent shadow-[0_0_15px_rgba(85,205,209,0.5)]" />
              <h3 className="font-bold">Theme Mode</h3>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
               {[
                 { id: 'light', name: 'Light', icon: <Sun className="w-4 h-4" /> },
                 { id: 'dark', name: 'Dark', icon: <Moon className="w-4 h-4" /> },
                 { id: 'system', name: 'Automatic', icon: <Zap className="w-4 h-4" /> }
               ].map((m) => (
                 <button
                   key={m.id}
                   onClick={() => setThemeMode(m.id as any)}
                   className={cn(
                     "flex flex-col items-center justify-center p-4 rounded-xl border transition-all text-center gap-2",
                     themeMode === m.id 
                       ? "bg-brand-accent/10 border-brand-accent shadow-[0_0_10px_rgba(85,205,209,0.2)]" 
                       : "bg-brand-bg border-brand-border hover:border-brand-accent/40"
                   )}
                 >
                   <div className={cn(
                     "transition-colors",
                     themeMode === m.id ? "text-brand-accent" : "text-brand-text-muted"
                   )}>
                     {m.icon}
                   </div>
                   <span className={cn(
                     "text-[10px] font-bold uppercase tracking-widest",
                     themeMode === m.id ? "text-brand-accent" : "text-brand-text-muted"
                   )}>{m.name}</span>
                 </button>
               ))}
            </div>
          </div>
        </SettingsGroup>

        <SettingsGroup title="Location">
          <div className="p-4 flex items-center justify-between hover:bg-brand-bg group cursor-pointer transition-all">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-bg border border-brand-border flex items-center justify-center">
                <MapPin className="text-brand-accent" />
              </div>
              <div>
                <p className="text-sm font-bold">Market Location</p>
                <p className="text-xs text-brand-text-muted">
                  {location ? `${location.country}${location.state ? `, ${location.state}` : ''} (${location.method})` : 'Not set'}
                </p>
              </div>
            </div>
            <button 
              onClick={() => requestLocation()}
              disabled={isLoading}
              className="p-2 rounded-lg bg-brand-accent/10 text-brand-accent hover:bg-brand-accent/20 transition-all disabled:opacity-50"
            >
              <RefreshCcw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            </button>
          </div>
          <div className="p-4 space-y-4 bg-brand-bg/20">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-brand-text-muted ml-1">Country</label>
                  <input 
                    type="text" 
                    placeholder="Enter country"
                    defaultValue={location?.country || ''}
                    onBlur={(e) => {
                      if (e.target.value.trim() && e.target.value !== location?.country) {
                        setLocation({
                          country: e.target.value.trim(),
                          state: location?.state,
                          method: 'manual',
                          timestamp: Date.now()
                        });
                      }
                    }}
                    className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-2 text-sm outline-none focus:border-brand-accent transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-brand-text-muted ml-1">State/Region (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="Enter state"
                    defaultValue={location?.state || ''}
                    onBlur={(e) => {
                      if (e.target.value !== location?.state) {
                        setLocation({
                          country: location?.country || '',
                          state: e.target.value.trim() || undefined,
                          method: 'manual',
                          timestamp: Date.now()
                        });
                      }
                    }}
                    className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-2 text-sm outline-none focus:border-brand-accent transition-all"
                  />
                </div>
             </div>
          </div>
        </SettingsGroup>

        <SettingsGroup title="Intelligence Core">
          <div className="p-6 bg-brand-bg/50">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-brand-accent shadow-[0_0_15px_rgba(85,205,209,0.5)]" />
                <h3 className="font-bold">AI Pipeline Customization</h3>
              </div>
              <button 
                onClick={() => setIsAICoreOpen(true)}
                className="px-4 py-2 rounded-xl bg-brand-accent text-brand-bg text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_20px_rgba(85,205,209,0.3)]"
              >
                Configure Core
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
               <ConfigSummaryItem label="Detection" modelId={pipeline.detectionModel} />
               <ConfigSummaryItem label="Market Research" modelId={pipeline.researchModel} />
               <ConfigSummaryItem label="Sales Strategy" modelId={pipeline.strategyModel} />
            </div>

            <div className="mt-8 flex items-center justify-between p-4 rounded-xl border border-brand-border/20 bg-brand-bg/40">
               <div>
                  <span className="text-[10px] font-bold uppercase text-brand-text-muted tracking-widest block mb-1">Estimated Cost</span>
                  <span className="text-xl font-black text-white">{costPerScan.toFixed(1)} <span className="text-brand-text-muted text-xs font-medium">Credits / Scan</span></span>
               </div>
               <div className="flex flex-wrap gap-4">
                  <StatusBadge label="Google" active={secretsStatus.gemini} />
                  <StatusBadge label="OpenAI" active={secretsStatus.openai} />
               </div>
            </div>
          </div>
        </SettingsGroup>

        <SettingsGroup title="Subscription">
          <div className="p-4 flex items-center justify-between hover:bg-brand-bg group cursor-pointer transition-all">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-bg border border-brand-border flex items-center justify-center">
                <CreditCard className="text-brand-accent" />
              </div>
              <div>
                <p className="text-sm font-bold">Current Plan</p>
                <div className="flex gap-2 mt-1">
                  {(['free', 'basic', 'reseller', 'entrepreneur'] as AIPlan[]).map(p => (
                    <button 
                      key={p}
                      onClick={() => {
                        const savedPlan = localStorage.getItem('sellscan_plan');
                        if (savedPlan !== p) {
                          localStorage.setItem('sellscan_plan', p);
                          window.location.reload(); // Simple way to sync for now
                        }
                      }}
                      className={cn(
                        "text-[9px] px-2 py-0.5 rounded border font-black uppercase tracking-tighter",
                        plan === p ? "bg-brand-accent text-brand-bg border-brand-accent" : "bg-white/5 border-white/10 text-brand-text-muted"
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <span className="text-brand-accent font-bold text-sm">Active</span>
          </div>
        </SettingsGroup>

        {isLoggedIn && (
          <button 
            onClick={async () => {
              const { error } = await supabase.auth.signOut();
              if (error) alert(error.message);
            }}
            className="w-full mt-8 p-4 rounded-2xl bg-red-500/5 border border-red-500/20 text-red-500 font-bold flex items-center justify-center gap-2 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        )}
      </div>

      {/* FULL SCREEN AI CORE PANEL */}
      <AnimatePresence>
        {isAICoreOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-brand-bg flex flex-col p-6 md:p-12 overflow-y-auto"
          >
            <div className="max-w-4xl mx-auto w-full flex-grow flex flex-col">
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-accent/20 flex items-center justify-center shadow-[0_0_20px_rgba(85,205,209,0.3)]">
                    <Zap className="text-brand-accent w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-4xl font-black tracking-tight">AI Core Customization</h2>
                    <p className="text-brand-text-muted font-medium">Fine-tune your resale intelligence engine</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsAICoreOpen(false)}
                  className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all group"
                >
                  <X className="text-white group-hover:scale-110 transition-transform" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 flex-grow">
                <div className="space-y-8 flex flex-col">
                  <PipelineStep 
                    title="Detection Core" 
                    description="Optical recognition & identity validation"
                    currentId={pipeline.detectionModel}
                    onSelect={(id) => setPipeline({ ...pipeline, detectionModel: id })}
                    plan={plan}
                  />
                  <PipelineStep 
                    title="Deep Research" 
                    description="Market index scraping & price history analysis"
                    currentId={pipeline.researchModel}
                    onSelect={(id) => setPipeline({ ...pipeline, researchModel: id })}
                    plan={plan}
                  />
                  <PipelineStep 
                    title="Strategy Engine" 
                    description="Pricing parity & channel optimization"
                    currentId={pipeline.strategyModel}
                    onSelect={(id) => setPipeline({ ...pipeline, strategyModel: id })}
                    plan={plan}
                  />
                </div>

                <div className="space-y-8 flex flex-col">
                  <div className="glass-card p-8 bg-brand-bg/50 border-brand-border/10 relative overflow-hidden group flex-grow">
                     <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Sparkles className="w-32 h-32" />
                     </div>
                     <h3 className="text-xl font-black mb-6">Pipeline Preview</h3>
                     <div className="space-y-4">
                        <PreviewRow label="Identity Ground-Truth" modelId={pipeline.detectionModel} />
                        <PreviewRow label="Omni-Channel Scraping" modelId={pipeline.researchModel} />
                        <PreviewRow label="Rescale Valuation" modelId={pipeline.strategyModel} />
                     </div>

                     <div className="mt-auto pt-12">
                        <div className="mt-auto pt-8 border-t border-white/5">
                           <div className="flex items-center justify-between mb-4">
                             <span className="text-xs font-bold text-brand-text-muted uppercase tracking-widest">Pricing Efficiency</span>
                             <span className="text-xs font-black text-brand-accent">REAL-TIME CALC</span>
                           </div>
                           <div className="text-6xl font-black text-white tracking-tighter mb-2">
                              {costPerScan.toFixed(1)}
                           </div>
                           <p className="text-brand-text-muted font-bold text-sm tracking-widest uppercase">Credits Per Scan</p>
                        </div>
                     </div>
                  </div>

                  <div className="p-8 rounded-3xl bg-brand-accent/5 border border-brand-accent/10">
                     <p className="text-xs leading-relaxed text-brand-text-muted italic">
                       * Some models are restricted based on your current plan level. Upgrade your plan to unlock state-of-the-art models like GPT-5 and Claude 3.5 Opus for maximum reselling edge.
                     </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SettingsGroup({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-bold uppercase text-brand-text-muted tracking-widest ml-4 mb-2">{title}</h3>
      <div className="glass-card divide-y divide-brand-border">
        {children}
      </div>
    </div>
  );
}

function SettingsItem({ icon, label, value, action }: { icon: React.ReactNode, label: string, value: string, action?: React.ReactNode }) {
  return (
    <div className="p-4 flex items-center justify-between hover:bg-brand-bg group cursor-pointer transition-all">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-brand-bg border border-brand-border flex items-center justify-center">
          {icon}
        </div>
        <div>
          <p className="text-sm font-bold">{label}</p>
          <p className="text-xs text-brand-text-muted">{value}</p>
        </div>
      </div>
      {action ? action : <ChevronRight className="w-4 h-4 text-brand-text-muted group-hover:translate-x-1 transition-transform" />}
    </div>
  );
}

function StatusBadge({ label, active }: { label: string, active: boolean }) {
  return (
    <div className="flex items-center gap-2">
       <div className={cn("w-2 h-2 rounded-full", active ? "bg-green-500 animate-pulse" : "bg-red-500")} />
       <span className="text-[10px] font-black uppercase text-white opacity-70">{label}</span>
    </div>
  );
}

function PipelineStep({ title, description, currentId, onSelect, plan }: { 
  title: string, 
  description: string, 
  currentId: AIModelId, 
  onSelect: (id: AIModelId) => void,
  plan: AIPlan
}) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-black tracking-tight">{title}</h3>
        <p className="text-xs text-brand-text-muted font-medium">{description}</p>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {AI_MODELS.map(m => {
          const tierRanking: Record<AIPlan, number> = {
            free: 0,
            basic: 1,
            reseller: 2,
            entrepreneur: 3
          };
          
          const isLocked = tierRanking[plan] < tierRanking[m.minPlan];
          return (
            <button
              key={m.id}
              onClick={() => !isLocked && onSelect(m.id)}
              disabled={isLocked}
              className={cn(
                "p-4 rounded-2xl border transition-all flex items-center justify-between group text-left",
                currentId === m.id 
                  ? "bg-brand-accent/10 border-brand-accent shadow-[0_0_15px_rgba(85,205,209,0.1)]" 
                  : "bg-white/5 border-white/5 hover:border-white/20",
                isLocked && "opacity-40 cursor-not-allowed grayscale"
              )}
            >
              <div className="flex items-center gap-3">
                 <div className={cn(
                   "w-2 h-2 rounded-full",
                   currentId === m.id ? "bg-brand-accent shadow-[0_0_8px_rgba(85,205,209,0.8)]" : "bg-white/20"
                 )} />
                 <div>
                   <span className="text-sm font-bold block">{m.name}</span>
                   <span className="text-[10px] text-brand-text-muted uppercase font-black">{m.provider}</span>
                 </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-black block">{m.costPerScan.toFixed(1)} Credits</span>
                {isLocked && <span className="text-[8px] font-black uppercase text-brand-accent tracking-tighter">Locked</span>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ConfigSummaryItem({ label, modelId }: { label: string, modelId: AIModelId }) {
  const model = AI_MODELS.find(m => m.id === modelId);
  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
      <span className="text-[9px] font-bold uppercase text-brand-text-muted tracking-widest block mb-1">{label}</span>
      <span className="text-xs font-black truncate block">{model?.name || 'Unknown'}</span>
    </div>
  );
}

function PreviewRow({ label, modelId }: { label: string, modelId: AIModelId }) {
  const model = AI_MODELS.find(m => m.id === modelId);
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-brand-text-muted font-medium">{label}</span>
      <div className="flex items-center gap-2">
         <span className="text-[10px] font-black uppercase bg-white/5 px-2 py-0.5 rounded border border-white/10">{model?.name}</span>
      </div>
    </div>
  );
}
