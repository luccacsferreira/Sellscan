/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { User, Bell, Shield, CreditCard, LogOut, ChevronRight, MapPin, RefreshCcw, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { useLocation } from '../lib/LocationContext';

export function SettingsPage() {
  const { location, setLocation, requestLocation, isLoading } = useLocation();

  return (
    <div className="pt-32 pb-20 px-4 max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold mb-12">Settings</h1>
      
      <div className="space-y-4">
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

        <SettingsGroup title="Account">
          <SettingsItem icon={<User className="text-blue-500" />} label="Profile Information" value="luccacsferreira@gmail.com" />
          <SettingsItem icon={<Bell className="text-amber-500" />} label="Notifications" value="Enabled" />
          <SettingsItem icon={<Shield className="text-green-500" />} label="Security" value="MFA Active" />
        </SettingsGroup>

        <SettingsGroup title="Subscription">
          <SettingsItem 
            icon={<CreditCard className="text-brand-accent" />} 
            label="Current Plan" 
            value="Free Tier" 
            action={<span className="text-brand-accent font-bold">Upgrade</span>}
          />
        </SettingsGroup>

        <SettingsGroup title="Developer">
          <div className="p-6 bg-brand-bg/50">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-5 h-5 text-brand-accent" />
              <h3 className="font-bold">Gemini API Configuration</h3>
            </div>
            <p className="text-sm text-brand-text-muted mb-4">
              This app uses Google's Gemini Flash for product analysis. 
              To use your own key:
            </p>
            <ol className="text-xs space-y-3 list-decimal list-inside text-brand-text-muted mb-6">
              <li>Open the <span className="text-brand-text font-bold">Settings</span> menu in AI Studio (bottom left).</li>
              <li>Go to the <span className="text-brand-text font-bold">Secrets</span> panel.</li>
              <li>Add a secret with the name <code className="bg-brand-border px-1.5 py-0.5 rounded text-brand-accent font-mono">GEMINI_API_KEY</code> and your key as the value.</li>
              <li>Restart the application.</li>
            </ol>
            <div className="p-3 bg-brand-accent/5 border border-brand-accent/20 rounded-xl">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold uppercase text-brand-text-muted">Current Key Status</span>
                <span className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-full",
                  process.env.GEMINI_API_KEY ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                )}>
                  {process.env.GEMINI_API_KEY ? 'CONNECTED' : 'MISSING'}
                </span>
              </div>
              <p className="text-[10px] text-brand-text-muted italic">
                {process.env.GEMINI_API_KEY 
                  ? "Application is connected to the Gemini API." 
                  : "Scanning will run in Demo Mode (mock data) until a key is provided."}
              </p>
            </div>
          </div>
        </SettingsGroup>

        <button className="w-full mt-8 p-4 rounded-2xl bg-red-500/5 border border-red-500/20 text-red-500 font-bold flex items-center justify-center gap-2 hover:bg-red-500/10 transition-all">
          <LogOut className="w-4 h-4" /> Sign out
        </button>
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
