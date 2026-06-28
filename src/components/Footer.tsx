import React from 'react';
import { Camera, Twitter, Instagram, Mail, Github, Zap } from 'lucide-react';
import { cn } from '../lib/utils';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-brand-bg border-t border-brand-border/30 pt-16 pb-8 px-6 md:px-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-accent/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-16">
          {/* Brand section */}
          <div className="col-span-1 md:col-span-1 flex flex-col gap-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-brand-accent shadow-[0_0_15px_var(--color-brand-accent)] flex items-center justify-center border border-white/20">
                <Camera className="w-5 h-5 text-slate-900" />
              </div>
              <span className="text-xl font-black italic tracking-tighter uppercase text-brand-text">SELLSCAN</span>
            </div>
            <p className="text-sm text-brand-text-muted leading-relaxed">
              Your intelligent resale companion. Scan, analyze, and optimize your listings for maximum profit.
            </p>
            <div className="flex items-center gap-4 mt-2">
              <a href="#" className="p-2 rounded-full bg-brand-text/5 hover:bg-brand-accent hover:text-slate-900 text-brand-text-muted transition-all">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-full bg-brand-text/5 hover:bg-brand-accent hover:text-slate-900 text-brand-text-muted transition-all">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-full bg-brand-text/5 hover:bg-brand-accent hover:text-slate-900 text-brand-text-muted transition-all">
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links sections */}
          <div className="col-span-1">
            <h4 className="text-xs font-black uppercase text-brand-text tracking-widest mb-6">Product</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-sm text-brand-text-muted hover:text-brand-accent transition-colors">Features</a></li>
              <li><a href="#" className="text-sm text-brand-text-muted hover:text-brand-accent transition-colors">Pricing</a></li>
              <li><a href="#" className="text-sm text-brand-text-muted hover:text-brand-accent transition-colors">Supported Platforms</a></li>
              <li><a href="#" className="text-sm text-brand-text-muted hover:text-brand-accent transition-colors flex items-center gap-2">Changelog <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-brand-accent/20 text-brand-accent">NEW</span></a></li>
            </ul>
          </div>

          <div className="col-span-1">
            <h4 className="text-xs font-black uppercase text-brand-text tracking-widest mb-6">Resources</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-sm text-brand-text-muted hover:text-brand-accent transition-colors">Documentation</a></li>
              <li><a href="#" className="text-sm text-brand-text-muted hover:text-brand-accent transition-colors">Blog</a></li>
              <li><a href="#" className="text-sm text-brand-text-muted hover:text-brand-accent transition-colors">Reseller Guide</a></li>
              <li><a href="#" className="text-sm text-brand-text-muted hover:text-brand-accent transition-colors">Partner Program</a></li>
            </ul>
          </div>

          <div className="col-span-1">
            <h4 className="text-xs font-black uppercase text-brand-text tracking-widest mb-6">Legal</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-sm text-brand-text-muted hover:text-brand-accent transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-sm text-brand-text-muted hover:text-brand-accent transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-sm text-brand-text-muted hover:text-brand-accent transition-colors">Cookie Policy</a></li>
              <li><a href="#" className="text-sm text-brand-text-muted hover:text-brand-accent transition-colors flex items-center gap-2">Contact Support</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-brand-border/30 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-brand-text-muted">
            &copy; {currentYear} SellScan. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-text-muted">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-text/5 border border-brand-border/50">
              <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" /> All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
