import React from 'react';
import { motion } from 'motion/react';
import { Zap, X, Sparkles, ChevronLeft } from 'lucide-react';
import { AIPipelineConfig, AIModelId, AIPlan } from '../types';
import { AI_MODELS } from '../lib/ai-config';
import { cn } from '../lib/utils';

interface AICustomizationPageProps {
  pipeline: AIPipelineConfig;
  setPipeline: (config: AIPipelineConfig) => void;
  plan: AIPlan;
  onBack: () => void;
}

export function AICustomizationPage({ pipeline, setPipeline, plan, onBack }: AICustomizationPageProps) {
  const costPerScan = React.useMemo(() => {
    const detection = AI_MODELS.find(m => m.id === pipeline.detectionModel)?.costPerScan || 0;
    const research = AI_MODELS.find(m => m.id === pipeline.researchModel)?.costPerScan || 0;
    const strategy = AI_MODELS.find(m => m.id === pipeline.strategyModel)?.costPerScan || 0;
    return detection + research + strategy;
  }, [pipeline]);

  return (
    <div className="pt-24 pb-20 px-4 md:px-8 max-w-5xl mx-auto min-h-[90vh] flex flex-col">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-brand-bg border border-brand-border flex items-center justify-center hover:border-brand-accent transition-all group mr-2"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-brand-accent/20 flex items-center justify-center shadow-[0_0_20px_rgba(85,205,209,0.3)] hidden sm:flex">
            <Zap className="text-brand-accent w-6 h-6" />
          </div>
          <div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-brand-text">AI Core Customization</h2>
            <p className="text-brand-text-muted font-medium text-xs sm:text-sm">Fine-tune your resale intelligence engine</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 flex-grow">
        <div className="space-y-8 flex flex-col">
          <PipelineStep 
            title="Detection Core" 
            description="Optical recognition & identity validation"
            currentId={pipeline.detectionModel}
            onSelect={(id) => setPipeline({ ...pipeline, detectionModel: id })}
            plan={plan}
          />
          <PipelineStep 
            title="Deep Research" 
            description="Market index scraping & price history analysis"
            currentId={pipeline.researchModel}
            onSelect={(id) => setPipeline({ ...pipeline, researchModel: id })}
            plan={plan}
          />
          <PipelineStep 
            title="Strategy Engine" 
            description="Pricing parity & channel optimization"
            currentId={pipeline.strategyModel}
            onSelect={(id) => setPipeline({ ...pipeline, strategyModel: id })}
            plan={plan}
          />
        </div>

        <div className="space-y-8 flex flex-col">
          <div className="glass-card p-8 bg-brand-bg/50 border border-brand-border/30 relative overflow-hidden group flex-grow shadow-lg">
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                <Sparkles className="w-32 h-32 text-brand-text" />
             </div>
             <h3 className="text-xl font-black mb-6 text-brand-text uppercase">Pipeline Preview</h3>
             <div className="space-y-4">
                <PreviewRow label="Identity Ground-Truth" modelId={pipeline.detectionModel} />
                <PreviewRow label="Omni-Channel Scraping" modelId={pipeline.researchModel} />
                <PreviewRow label="Rescale Valuation" modelId={pipeline.strategyModel} />
             </div>

             <div className="mt-auto pt-12">
                <div className="mt-auto pt-8 border-t border-brand-border/20">
                   <div className="flex items-center justify-between mb-4">
                     <span className="text-xs font-bold text-brand-text-muted uppercase tracking-widest">Pricing Efficiency</span>
                     <span className="text-xs font-black text-brand-accent">REAL-TIME CALC</span>
                   </div>
                   <div className="text-6xl font-black text-brand-text tracking-tighter mb-2">
                      {costPerScan.toFixed(2)}
                   </div>
                   <p className="text-brand-text-muted font-bold text-sm tracking-widest uppercase">Credits Per Scan</p>
                </div>
             </div>
          </div>

          <div className="p-8 rounded-3xl bg-brand-accent/5 border border-brand-accent/10">
             <p className="text-xs leading-relaxed text-brand-text-muted italic">
               * Some models are restricted based on your current plan level. Upgrade your plan to unlock state-of-the-art models for maximum reselling edge.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PipelineStep({ title, description, currentId, onSelect, plan }: { 
  title: string, 
  description: string, 
  currentId: AIModelId, 
  onSelect: (id: AIModelId) => void,
  plan: AIPlan
}) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-black tracking-tight text-brand-text uppercase">{title}</h3>
        <p className="text-xs text-brand-text-muted font-medium">{description}</p>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {AI_MODELS.map(m => {
          const tierRanking: Record<AIPlan, number> = {
            free: 0,
            basic: 1,
            reseller: 2,
            entrepreneur: 3
          };
          
          const isLocked = tierRanking[plan] < tierRanking[m.minPlan];
          return (
            <button
              key={m.id}
              onClick={() => !isLocked && onSelect(m.id)}
              disabled={isLocked}
              className={cn(
                "p-4 rounded-2xl border transition-all flex items-center justify-between group text-left cursor-pointer",
                currentId === m.id 
                  ? "bg-brand-accent/10 border-brand-accent shadow-[0_0_15px_rgba(85,205,209,0.1)]" 
                  : "bg-brand-bg/50 border-brand-border hover:border-brand-accent/30",
                isLocked && "opacity-40 cursor-not-allowed grayscale"
              )}
            >
              <div className="flex items-center gap-3">
                 <div className={cn(
                   "w-2 h-2 rounded-full",
                   currentId === m.id ? "bg-brand-accent shadow-[0_0_8px_rgba(85,205,209,0.8)]" : "bg-brand-border"
                 )} />
                 <div>
                   <span className="text-sm font-bold block text-brand-text">{m.name}</span>
                   <span className="text-[10px] text-brand-text-muted uppercase font-black">{m.provider}</span>
                 </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-black block text-brand-text">{m.costPerScan.toFixed(2)} Credits</span>
                {isLocked && <span className="text-[8px] font-black uppercase text-brand-accent tracking-tighter">Locked ({m.minPlan})</span>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PreviewRow({ label, modelId }: { label: string, modelId: AIModelId }) {
  const model = AI_MODELS.find(m => m.id === modelId);
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-brand-text-muted font-medium">{label}</span>
      <div className="flex items-center gap-2">
         <span className="text-[10px] font-black uppercase bg-brand-bg/50 text-brand-text px-2 py-0.5 rounded border border-brand-border">{model?.name}</span>
      </div>
    </div>
  );
}
