/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Clock, ExternalLink, ArrowRight, Search, Trash2 } from 'lucide-react';
import { ScanResult } from '../types';
import { cn } from '../lib/utils';
import { useLocation } from '../lib/LocationContext';

const CURRENCY_SYMBOLS: Record<string, string> = {
  'GBP': '£',
  'USD': '$',
  'EUR': '€',
  'BRL': 'R$'
};

interface HistoryPageProps {
  history: ScanResult[];
  onSelect: (scan: ScanResult) => void;
  onClear: () => void;
}

export function HistoryPage({ history, onSelect, onClear }: HistoryPageProps) {
  const { currency } = useLocation();
  const currencySymbol = CURRENCY_SYMBOLS[currency] || currency;

  return (
    <div className="pt-32 pb-20 px-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-bold mb-2">History</h1>
          <p className="text-brand-text-muted">Review your past product analyses and listings.</p>
        </div>
        {history.length > 0 && (
          <button 
            onClick={onClear}
            className="flex items-center gap-2 text-red-500 hover:bg-red-500/10 px-4 py-2 rounded-xl transition-all"
          >
            <Trash2 className="w-4 h-4" /> Clear all
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="glass-card p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-brand-bg border border-brand-border flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-brand-text-muted" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No history yet</h2>
            <p className="text-brand-text-muted mb-8">Once you scan products, they will appear here for quick access.</p>
            <button className="bg-brand-accent text-brand-bg px-6 py-3 rounded-full font-bold">Start your first scan</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {history.map((scan) => (
            <motion.div 
              key={scan.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card group cursor-pointer hover:border-brand-accent/30 transition-all flex flex-col"
              onClick={() => onSelect(scan)}
            >
              <div className="aspect-[16/9] bg-brand-bg overflow-hidden border-b border-brand-border">
                {scan.imageUrl ? (
                  <img src={scan.imageUrl} alt="Product" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-brand-border">
                    <Search className="w-12 h-12" />
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="text-[10px] uppercase font-bold text-brand-accent mb-1 tracking-wider">
                   {new Date(scan.timestamp).toLocaleDateString()}
                </div>
                <h3 className="font-bold text-lg mb-2 line-clamp-1">
                  {scan.analysis.productDetails.brand} {scan.analysis.productDetails.type}
                </h3>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xl font-bold">{currencySymbol}{scan.analysis.priceRange.sweetSpot}</span>
                  <div className="w-8 h-8 rounded-full bg-brand-bg border border-brand-border flex items-center justify-center group-hover:bg-brand-accent group-hover:text-brand-bg transition-all">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
