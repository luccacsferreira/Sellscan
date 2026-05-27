import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface IdentityBoxProps {
  imageUrl?: string;
  name?: string;
  brand: string;
  type: string;
  condition: string;
  category: string;
}

export function IdentityBox({ imageUrl, name, brand, type, condition, category }: IdentityBoxProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-card flex flex-col md:flex-row min-h-[220px] group overflow-hidden border-brand-border/10"
    >
      {imageUrl && (
        <div className="w-full md:w-1/3 min-h-[240px] bg-black/20 flex-shrink-0 relative">
          <img 
            src={imageUrl} 
            alt="Product" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-brand-bg/20" />
        </div>
      )}
      <div className="p-8 flex-grow flex flex-col justify-center">
        <div className="mb-6">
          <span className="text-[10px] uppercase font-bold text-brand-text-muted tracking-[0.2em] block mb-3 opacity-60">Identified Item (AI Groud-Truth Verifier)</span>
          <h3 className="text-3xl font-black tracking-tight text-brand-text/95 leading-tight mb-2">
            {name || `${brand || 'Unknown'} ${type || 'Product'}`}
          </h3>
          <p className="text-brand-text-muted text-sm max-w-xl">Optimized for search velocity. High specificity identification ensures your listing matches buyer search intent.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          <DetailItem label="Condition" value={condition || 'Unknown'} />
          <DetailItem label="Category" value={category || 'Other'} />
          <DetailItem label="Brand" value={brand || 'Generic'} />
          <DetailItem label="Scan Method" value="Optical Identity Agent" />
        </div>
      </div>
    </motion.div>
  );
}

function DetailItem({ label, value }: { label: string, value: string }) {
  return (
    <div>
      <span className="text-[10px] uppercase font-bold text-brand-text-muted tracking-widest block mb-0.5">{label}</span>
      <span className="text-sm font-semibold text-brand-text/80">{value}</span>
    </div>
  );
}
