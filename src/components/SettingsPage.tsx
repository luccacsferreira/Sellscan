/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { User, Bell, Shield, CreditCard, LogOut, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

export function SettingsPage() {
  return (
    <div className="pt-32 pb-20 px-4 max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold mb-12">Settings</h1>
      
      <div className="space-y-4">
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
