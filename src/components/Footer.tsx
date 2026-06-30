import React from 'react';
import { Camera, Twitter, Instagram, Mail, Github, Zap, Youtube } from 'lucide-react';
import { cn } from '../lib/utils';
import sellscanLogo from '../assets/sellscan_logo_transparent.png';

export function Footer() {
  return (
    <footer className="w-full bg-[#212121] border-t border-brand-border/30 pt-16 pb-8 px-6 md:px-12 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-16">
          {/* Brand section */}
          <div className="col-span-1 md:col-span-1 flex flex-col gap-4">
            <div className="flex items-center gap-3 mb-2 h-8">
              <img 
                src={sellscanLogo} 
                alt="Sellscan" 
                className="h-full w-auto object-contain pointer-events-none transition-all duration-300 group-hover:scale-[1.02]"
              />
            </div>
            <p className="text-sm text-brand-text-muted leading-relaxed">
              Your intelligent resale companion. Scan, analyze, and optimize your listings for maximum profit.
            </p>
            <div className="flex items-center gap-4 mt-2">
              <a href="https://www.instagram.com/sellscan/" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-brand-text/5 hover:bg-brand-accent hover:text-slate-900 text-brand-text-muted transition-all">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://www.youtube.com/@Sellscan" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-brand-text/5 hover:bg-brand-accent hover:text-slate-900 text-brand-text-muted transition-all">
                <Youtube className="w-4 h-4" />
              </a>
              <a href="https://www.tiktok.com/@sellscan.test.dev" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-brand-text/5 hover:bg-brand-accent hover:text-slate-900 text-brand-text-muted transition-all">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91.04.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.22-1.15 4.39-2.92 5.76-1.74 1.34-4.04 1.83-6.17 1.36-2.13-.49-3.92-1.87-4.9-3.8-1.02-2-1.13-4.44-.28-6.52.82-1.99 2.51-3.52 4.6-4.13 2.11-.6 4.41-.39 6.36.63V9.87c-1.24-.62-2.65-.95-4.04-.94-1.45.02-2.9.47-4.07 1.33-1.17.86-1.95 2.15-2.31 3.55-.38 1.48-.22 3.09.43 4.45.64 1.37 1.85 2.45 3.32 2.96 1.48.51 3.14.47 4.58-.11 1.43-.59 2.58-1.72 3.2-3.13.56-1.29.79-2.73.74-4.15V.02h-4.63z" />
                </svg>
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
            &copy; 2026 Sellscan. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
