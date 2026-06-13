/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Clock, ExternalLink, ArrowRight, Search, Trash2, FolderRoot, ChevronDown, Check } from 'lucide-react';
import { ScanResult, Project } from '../types';
import { cn, formatAmount } from '../lib/utils';
import { useLocation } from '../lib/LocationContext';

const CURRENCY_SYMBOLS: Record<string, string> = {
  'GBP': '£',
  'USD': '$',
  'EUR': '€',
  'BRL': 'R$'
};

interface HistoryPageProps {
  history: ScanResult[];
  projects: Project[];
  onSelect: (scan: ScanResult) => void;
  onUpdateScan: (scan: ScanResult) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
}

export function HistoryPage({ history, projects, onSelect, onUpdateScan, onDelete, onClear }: HistoryPageProps) {
  const { currency } = useLocation();
  const currencySymbol = CURRENCY_SYMBOLS[currency] || currency;
  const [assigningId, setAssigningId] = React.useState<string | null>(null);

  const handleAssignToProject = (e: React.MouseEvent, scan: ScanResult, projectId: string | null) => {
    e.stopPropagation();
    onUpdateScan({ ...scan, projectId: projectId || undefined });
    setAssigningId(null);
  };

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
          {history.map((scan) => {
            const project = projects.find(p => p.id === scan.projectId);
            const isAssigning = assigningId === scan.id;

            return (
              <motion.div 
                key={scan.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card group cursor-pointer hover:border-brand-accent/30 transition-all flex flex-col relative"
                onClick={() => onSelect(scan)}
              >
                <div className="aspect-[16/9] bg-brand-bg overflow-hidden border-b border-brand-border relative">
                  {scan.imageUrl ? (
                    <img src={scan.imageUrl} alt="Product" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-brand-border">
                      <Search className="w-12 h-12" />
                    </div>
                  )}

                  {/* Project Selector Overlay for individual cards */}
                  <div className="absolute top-3 right-3 z-10">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setAssigningId(isAssigning ? null : scan.id);
                      }}
                      className={cn(
                        "p-2 rounded-lg backdrop-blur-md transition-all border shadow-lg",
                        project 
                          ? "bg-brand-accent/20 border-brand-accent/40 text-brand-accent" 
                          : "bg-black/40 border-white/10 text-white/50 hover:text-white"
                      )}
                      title={project ? `Project: ${project.name}` : "Assign to project"}
                    >
                      <FolderRoot className="w-4 h-4" />
                    </button>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Delete this scan?')) {
                          onDelete(scan.id);
                        }
                      }}
                      className="p-2 ml-2 rounded-lg backdrop-blur-md bg-red-500/20 border border-red-500/40 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg"
                      title="Delete scan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {isAssigning && (
                      <div className="absolute top-10 right-0 w-48 glass-card p-2 bg-brand-bg/95 backdrop-blur-xl z-[20] shadow-2xl border-brand-border animate-in fade-in zoom-in-95 duration-200">
                        <p className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest px-3 py-2 mb-1 border-b border-brand-border/50">Assign to project</p>
                        <div className="max-h-40 overflow-y-auto custom-scrollbar">
                           <button 
                             onClick={(e) => handleAssignToProject(e, scan, null)}
                             className={cn(
                               "w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-between",
                               !scan.projectId ? "text-brand-accent bg-brand-accent/10" : "text-brand-text-muted hover:bg-white/5 hover:text-brand-text"
                             )}
                           >
                             None
                             {!scan.projectId && <Check className="w-3 h-3" />}
                           </button>
                           {projects.map(p => (
                             <button
                               key={p.id}
                               onClick={(e) => handleAssignToProject(e, scan, p.id)}
                               className={cn(
                                 "w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-between",
                                 scan.projectId === p.id ? "text-brand-accent bg-brand-accent/10" : "text-brand-text-muted hover:bg-white/5 hover:text-brand-text"
                               )}
                             >
                                <div className="flex items-center gap-2 truncate">
                                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />
                                  <span className="truncate">{p.name}</span>
                                </div>
                                {scan.projectId === p.id && <Check className="w-3 h-3" />}
                             </button>
                           ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-[10px] uppercase font-bold text-brand-accent tracking-wider">
                       {new Date(scan.timestamp).toLocaleDateString()}
                    </div>
                    {project && (
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-brand-accent/10 border border-brand-accent/20">
                         <div className="w-1 h-1 rounded-full" style={{ backgroundColor: project.color }} />
                         <span className="text-[9px] font-black uppercase text-brand-accent tracking-tighter">{project.name}</span>
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-lg mb-2 line-clamp-1">
                    {scan.analysis?.productDetails?.brand || 'Unknown'} {scan.analysis?.productDetails?.type || 'Product'}
                  </h3>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xl font-bold">{currencySymbol}{formatAmount(scan.analysis?.priceRange?.sweetSpot)}</span>
                    <div className="w-8 h-8 rounded-full bg-brand-bg border border-brand-border flex items-center justify-center group-hover:bg-brand-accent group-hover:text-brand-bg transition-all">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
