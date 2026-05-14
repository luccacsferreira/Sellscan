import React from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Trash2, 
  Edit3, 
  Plus, 
  Search,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import { Project, ScanResult } from '../types';
import { cn } from '../lib/utils';
import { useLocation } from '../lib/LocationContext';

const CURRENCY_SYMBOLS: Record<string, string> = {
  'GBP': '£',
  'USD': '$',
  'EUR': '€',
  'BRL': 'R$'
};

interface ProjectDetailProps {
  project: Project;
  scans: ScanResult[];
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onNewScan: () => void;
  onSelectScan: (scan: ScanResult) => void;
}

export function ProjectDetail({ 
  project, 
  scans, 
  onBack, 
  onEdit, 
  onDelete,
  onNewScan,
  onSelectScan
}: ProjectDetailProps) {
  const { currency } = useLocation();
  const currencySymbol = CURRENCY_SYMBOLS[currency] || currency;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-start gap-6">
          <button 
            onClick={onBack}
            className="w-12 h-12 rounded-full border border-brand-border flex items-center justify-center hover:bg-brand-accent hover:text-brand-bg transition-all mt-1"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }} />
              <span className="text-xs font-bold uppercase tracking-widest text-brand-text-muted">Project</span>
            </div>
            <h1 className="text-4xl font-bold mb-2">{project.name}</h1>
            <p className="text-brand-text-muted max-w-xl">{project.description}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onEdit}
            className="p-3 rounded-xl bg-brand-bg border border-brand-border hover:border-brand-accent/50 transition-all"
            title="Edit Project"
          >
            <Edit3 className="w-5 h-5" />
          </button>
          <button 
            onClick={onDelete}
            className="p-3 rounded-xl bg-brand-bg border border-brand-border hover:border-red-500/50 hover:text-red-500 transition-all"
            title="Delete Project"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <button 
            onClick={onNewScan}
            className="px-6 py-3 rounded-xl bg-brand-accent text-brand-bg font-bold hover:scale-[1.02] transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {scans.length > 0 ? (
          scans.map((scan) => (
            <motion.div
              key={scan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card group cursor-pointer hover:border-brand-accent/30 transition-all flex flex-col"
              onClick={() => onSelectScan(scan)}
            >
              <div className="aspect-[16/9] bg-brand-bg overflow-hidden border-b border-brand-border relative">
                {scan.imageUrl ? (
                  <img src={scan.imageUrl} alt="Product" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center flex-col gap-2 opacity-50">
                    <Search className="w-8 h-8 text-brand-accent" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">No Image</span>
                  </div>
                )}
                <div className="absolute top-3 right-3 px-2 py-1 bg-brand-bg/80 backdrop-blur-md border border-brand-border rounded text-[10px] font-bold uppercase tracking-widest">
                  {scan.analysis.productDetails.category}
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="text-[10px] font-mono text-brand-text-muted mb-1 uppercase">
                  {new Date(scan.timestamp).toLocaleDateString()}
                </div>
                <h3 className="font-bold text-lg leading-tight mb-4 group-hover:text-brand-accent transition-colors line-clamp-2">
                  {scan.analysis.suggestedTitle}
                </h3>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-text-muted">Target Price</span>
                    <span className="text-xl font-bold">{currencySymbol}{scan.analysis.priceRange.sweetSpot}</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-brand-bg border border-brand-border flex items-center justify-center group-hover:bg-brand-accent group-hover:text-brand-bg transition-all">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full border-2 border-dashed border-brand-border rounded-3xl p-20 text-center flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-brand-bg border border-brand-border flex items-center justify-center mb-8">
               <Search className="w-10 h-10 text-brand-text-muted" />
            </div>
            <h2 className="text-2xl font-bold mb-3">No items in this project</h2>
            <p className="text-brand-text-muted mb-8 max-w-sm">Start scanning products to add them to your "{project.name}" collection.</p>
            <button 
              onClick={onNewScan}
              className="px-8 py-3 rounded-full bg-brand-accent text-brand-bg font-bold hover:scale-105 transition-all"
            >
              Scan first item
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
