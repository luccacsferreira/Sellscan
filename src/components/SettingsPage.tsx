/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { User, Bell, Shield, CreditCard, LogOut, ChevronRight, MapPin, RefreshCcw, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { useLocation } from '../lib/LocationContext';
import { supabase } from '../lib/supabase';

import { AIModel } from '../services/aiService';

export function SettingsPage({ 
  selectedModel, 
  setSelectedModel,
  isLoggedIn,
  userEmail
}: { 
  selectedModel: AIModel, 
  setSelectedModel: (m: AIModel) => void,
  isLoggedIn: boolean,
  userEmail?: string
}) {
  const { location, setLocation, requestLocation, isLoading } = useLocation();
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

        <SettingsGroup title="AI Analysis Engine">
          <div className="p-6 bg-brand-bg/50">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="w-5 h-5 text-brand-accent shadow-[0_0_15px_rgba(85,205,209,0.5)]" />
              <h3 className="font-bold">Select AI Model</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
               {[
                 { id: 'gemini', name: 'Gemini 3 Flash', desc: 'Fast & Multimodal', color: 'text-blue-400' },
                 { id: 'gpt4', name: 'GPT-4o', desc: 'High Accuracy', color: 'text-green-400' }
               ].map((m) => (
                 <button
                   key={m.id}
                   onClick={() => setSelectedModel(m.id as AIModel)}
                   className={cn(
                     "flex flex-col p-4 rounded-xl border transition-all text-left group",
                     selectedModel === m.id 
                       ? "bg-brand-accent/10 border-brand-accent shadow-[0_0_10px_rgba(85,205,209,0.2)]" 
                       : "bg-brand-bg border-brand-border hover:border-brand-accent/40"
                   )}
                 >
                   <div className="flex items-center justify-between mb-2">
                      <span className={cn("text-xs font-black uppercase tracking-tight", m.color)}>{m.name}</span>
                      <div className={cn(
                        "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all",
                        selectedModel === m.id ? "border-brand-accent bg-brand-accent" : "border-brand-border"
                      )}>
                        {selectedModel === m.id && <div className="w-1.5 h-1.5 rounded-full bg-brand-bg" />}
                      </div>
                   </div>
                   <span className="text-[10px] text-brand-text-muted font-medium">{m.desc}</span>
                 </button>
               ))}
            </div>
            
            <div className="mt-6 p-4 rounded-xl border border-brand-border/20 bg-brand-bg/40">
               <div className="flex items-center justify-between mb-2">
                 <span className="text-[10px] font-bold uppercase text-brand-text-muted tracking-widest">Active Secrets Status</span>
               </div>
               <div className="flex flex-wrap gap-4">
                  <StatusBadge label="Gemini" active={secretsStatus.gemini} />
                  <StatusBadge label="GPT-4" active={secretsStatus.openai} />
               </div>
               <p className="text-[9px] text-brand-text-muted italic mt-3 opacity-60">
                 * Ensure your API keys are configured in the AI Studio Secrets panel.
               </p>
            </div>
          </div>
        </SettingsGroup>

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
