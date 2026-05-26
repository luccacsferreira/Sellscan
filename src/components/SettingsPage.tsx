/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { User, Bell, Shield, CreditCard, LogOut, ChevronRight, MapPin, RefreshCcw, Zap, Sun, Moon } from 'lucide-react';
import { cn } from '../lib/utils';
import { useLocation } from '../lib/LocationContext';
import { supabase } from '../lib/supabase';

import { AIModel } from '../services/aiService';

export function SettingsPage({ 
  selectedModel, 
  setSelectedModel,
  isLoggedIn,
  userEmail,
  themeMode,
  setThemeMode
}: { 
  selectedModel: AIModel, 
  setSelectedModel: (m: AIModel) => void,
  isLoggedIn: boolean,
  userEmail?: string,
  themeMode: 'dark' | 'light' | 'system',
  setThemeMode: (m: 'dark' | 'light' | 'system') => void
}) {
  const { location, setLocation, currency, setCurrency, requestLocation, isLoading } = useLocation();
  const [secretsStatus, setSecretsStatus] = React.useState({ gemini: false, openai: false });

  React.useEffect(() => {
    fetch('/api/health/secrets')
      .then(res => res.json())
      .then(data => setSecretsStatus(data))
      .catch(() => {});
  }, []);

  return (
    <div className="pt-32 pb-20 px-4 max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold mb-12">Settings</h1>
      
      <div className="space-y-4">
        {isLoggedIn && (
          <SettingsGroup title="Account">
            <SettingsItem icon={<User className="text-blue-500" />} label="Profile Information" value={userEmail || "Anonymous"} />
            <SettingsItem icon={<Bell className="text-amber-500" />} label="Notifications" value="Enabled" />
            <SettingsItem icon={<Shield className="text-green-500" />} label="Security" value="MFA Active" />
          </SettingsGroup>
        )}

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

        <SettingsGroup title={themeMode === 'light' ? "Localization Settings" : "Location & Currency"}>
          <div className="p-6 bg-brand-bg/50 space-y-8">
             {/* Location Section */}
             <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-brand-accent shadow-[0_0_15px_rgba(85,205,209,0.5)]" />
                    <h3 className="font-bold">Market Location</h3>
                  </div>
                  <button 
                    onClick={() => requestLocation()}
                    disabled={isLoading}
                    className="p-2 rounded-lg bg-brand-accent/10 text-brand-accent hover:bg-brand-accent/20 transition-all disabled:opacity-50"
                  >
                    <RefreshCcw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-brand-text-muted tracking-widest ml-1">Country</label>
                     <input 
                       type="text" 
                       placeholder="Enter country"
                       defaultValue={location?.country || ''}
                       onBlur={(e) => {
                         const val = e.target.value.trim();
                         if (val && val !== location?.country) {
                           setLocation({
                             country: val,
                             state: location?.state,
                             method: 'manual',
                             timestamp: Date.now()
                           });
                         }
                       }}
                       className="w-full bg-brand-bg/80 border border-brand-border dark:border-brand-border rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-accent transition-all font-medium text-brand-text"
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-brand-text-muted tracking-widest ml-1 text-left">State / Region</label>
                     <input 
                       type="text" 
                       placeholder="Optional state"
                       defaultValue={location?.state || ''}
                       onBlur={(e) => {
                         const val = e.target.value.trim();
                         if (val !== location?.state) {
                           setLocation({
                             country: location?.country || '',
                             state: val || undefined,
                             method: 'manual',
                             timestamp: Date.now()
                           });
                         }
                       }}
                       className="w-full bg-brand-bg/80 border border-brand-border dark:border-brand-border rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-accent transition-all font-medium text-brand-text"
                     />
                   </div>
                </div>
             </div>

             {/* Currency Section */}
             <div className="space-y-4 pt-6 border-t border-brand-border/20">
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 flex items-center justify-center font-black text-brand-accent text-lg shadow-[0_0_15px_rgba(85,205,209,0.3)]">
                    {currency === 'GBP' ? '£' : currency === 'EUR' ? '€' : '$'}
                  </span>
                  <h3 className="font-bold">Active Currency</h3>
                </div>

                <div className="space-y-3">
                   <p className="text-[10px] font-black uppercase text-brand-text-muted tracking-widest ml-1">AI Smart Suggestions</p>
                   <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { code: currency || 'USD', label: 'Local Market', reason: 'Based on location' },
                        { code: 'USD', label: 'US Dollar', reason: 'Global standard' },
                        { code: 'EUR', label: 'Euro', reason: 'Regional major' },
                        { code: 'BRL', label: 'Real', reason: 'Neighbor market' }
                      ].map((c, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrency(c.code)}
                          className={cn(
                            "flex flex-col p-3 rounded-lg border transition-all text-left group",
                            currency === c.code 
                              ? "bg-brand-accent/10 border-brand-accent" 
                              : "bg-brand-bg border-brand-border dark:border-brand-border hover:border-brand-accent/40"
                          )}
                        >
                          <span className="text-xs font-black text-brand-text">{c.code}</span>
                          <span className="text-[8px] text-brand-text-muted font-bold uppercase truncate">{c.label}</span>
                        </button>
                      ))}
                   </div>

                   <div className="mt-4 flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Type manual currency (e.g. Yen, IDR, ₹)"
                        className="flex-1 bg-brand-bg/80 border border-brand-border dark:border-brand-border rounded-xl px-4 py-2 text-xs outline-none focus:border-brand-accent transition-all font-bold text-brand-text"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const val = (e.target as HTMLInputElement).value;
                            if (val.trim()) setCurrency(val.trim().toUpperCase());
                          }
                        }}
                      />
                      <button className="bg-brand-accent text-brand-bg px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110">Apply</button>
                   </div>
                </div>
             </div>
          </div>
        </SettingsGroup>

        <SettingsGroup title="AI Neural Intelligence">
          <div className="p-6 bg-brand-bg/50 space-y-8">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-brand-accent shadow-[0_0_15px_rgba(85,205,209,0.5)]" />
                  <h3 className="font-bold">Intelligence Tiers</h3>
                </div>
                <div className="px-3 py-1 bg-brand-accent/10 rounded-full border border-brand-accent/20">
                  <span className="text-[10px] font-black text-brand-accent uppercase tracking-[0.2em]">Free Plan</span>
                </div>
              </div>
              
              <div className="space-y-4">
                 {[
                   { 
                     id: 'free', 
                     tier: 'Free Plan', 
                     models: ['Gemini 1.5 Flash (Lite)'], 
                     desc: 'Standard visual recognition',
                     active: true,
                     limited: false
                   },
                   { 
                     id: 'basic', 
                     tier: 'Basic Pro', 
                     models: ['Gemini Pro (Multimodal)', 'GPT-4o Mini', 'GPT-5.0 Early'], 
                     desc: 'High-speed market indexing',
                     active: false,
                     limited: true
                   },
                   { 
                     id: 'premium', 
                     tier: 'Industry Leader', 
                     models: ['Claude 3.5 Sonnet', 'GPT-4o Ultra', 'Gemini Ultra'], 
                     desc: 'Deep reasoning & risk detection',
                     active: false,
                     limited: true
                   }
                 ].map((t) => (
                   <div 
                     key={t.id}
                     className={cn(
                       "p-5 rounded-2xl border transition-all relative overflow-hidden",
                       t.active 
                        ? "bg-brand-accent/5 border-brand-accent/30 shadow-[0_0_30px_rgba(85,205,209,0.05)]" 
                        : "bg-brand-bg border-brand-border opacity-60"
                     )}
                   >
                     <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-[10px] font-black text-brand-accent tracking-[0.2em] uppercase mb-1">{t.tier}</p>
                          <h4 className="text-sm font-black text-brand-text">{t.models.join(' + ')}</h4>
                        </div>
                        {!t.active && (
                          <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded border border-white/5">
                             <div className="w-1.5 h-1.5 rounded-full bg-brand-text-muted/40" />
                             <span className="text-[8px] font-bold text-brand-text-muted/60 uppercase">Locked</span>
                          </div>
                        )}
                     </div>
                     <p className="text-[11px] text-brand-text-muted font-medium mb-4">{t.desc}</p>
                     
                     <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                           {[1,2,3].map(i => (
                             <div key={i} className="w-5 h-5 rounded-full border-2 border-brand-bg bg-brand-border overflow-hidden flex items-center justify-center">
                                <div className="w-full h-full bg-brand-accent/20" />
                             </div>
                           ))}
                        </div>
                        <span className="text-[8px] font-bold text-brand-text-muted/40 uppercase tracking-widest">Model Stack Analysis Active</span>
                     </div>
                   </div>
                 ))}
              </div>
            </div>
          </div>
        </SettingsGroup>

        <div className="fixed bottom-24 right-8 z-[100] md:bottom-8">
           <div className="glass-card p-4 bg-brand-bg/90 backdrop-blur-xl border-brand-accent/20 shadow-2xl w-56 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                 <h4 className="text-[9px] font-black uppercase text-brand-text-muted tracking-widest">Credit Calculator</h4>
                 <div className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse" />
              </div>
              <div className="space-y-1.5">
                 <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg border border-white/5">
                    <span className="text-[10px] font-bold text-brand-text-muted">Per Scan</span>
                    <span className="text-xs font-black text-brand-accent">1.0</span>
                 </div>
                 <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg border border-white/5">
                    <span className="text-[10px] font-bold text-brand-text-muted">Chat Reply</span>
                    <span className="text-xs font-black text-brand-accent">0.25</span>
                 </div>
                 <div className="flex justify-between items-center bg-brand-accent/10 p-2 rounded-lg border border-brand-accent/20">
                    <span className="text-[10px] font-bold text-brand-accent">Est. Total</span>
                    <span className="text-xs font-black text-brand-accent">1.25 cr</span>
                 </div>
              </div>
              <button className="w-full py-2 bg-brand-accent/10 border border-brand-accent/20 rounded-lg text-[9px] font-black uppercase tracking-widest text-brand-accent hover:bg-brand-accent/20 transition-all">
                Reset Calculator
              </button>
           </div>
        </div>

        <SettingsGroup title="Subscription">
          <SettingsItem 
            icon={<CreditCard className="text-brand-accent" />} 
            label="Current Plan" 
            value="Free Tier" 
            action={<span className="text-brand-accent font-bold">Upgrade</span>}
          />
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
