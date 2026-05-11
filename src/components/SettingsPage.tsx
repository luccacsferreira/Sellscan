/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { User, Bell, Shield, CreditCard, LogOut, ChevronRight, MapPin, RefreshCcw } from 'lucide-react';
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
