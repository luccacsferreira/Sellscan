import { AIModelInfo, AIPipelineConfig, AIPlan } from '../types';

export const AI_MODELS: AIModelInfo[] = [
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'google', costPerScan: 0.1, minPlan: 'free' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'google', costPerScan: 0.5, minPlan: 'basic' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', costPerScan: 0.2, minPlan: 'basic' },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', costPerScan: 0.8, minPlan: 'basic' },
  { id: 'gpt-5-preview', name: 'GPT-5 Preview', provider: 'openai', costPerScan: 2.5, minPlan: 'premium' },
  { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'anthropic', costPerScan: 0.6, minPlan: 'premium' },
  { id: 'claude-3.5-opus', name: 'Claude 3.5 Opus', provider: 'anthropic', costPerScan: 1.5, minPlan: 'premium' },
];

export const DEFAULT_PIPELINES: Record<AIPlan, AIPipelineConfig> = {
  free: {
    detectionModel: 'gemini-1.5-flash',
    researchModel: 'gemini-1.5-flash',
    strategyModel: 'gemini-1.5-flash',
  },
  basic: {
    detectionModel: 'gemini-1.5-flash',
    researchModel: 'gpt-4o-mini',
    strategyModel: 'gemini-1.5-pro',
  },
  premium: {
    detectionModel: 'gemini-1.5-pro',
    researchModel: 'gpt-4o-mini',
    strategyModel: 'gpt-4o',
  }
};

export function calculateScanCost(config: AIPipelineConfig): number {
  const models = [config.detectionModel, config.researchModel, config.strategyModel];
  return models.reduce((total, id) => {
    const model = AI_MODELS.find(m => m.id === id);
    return total + (model?.costPerScan || 0);
  }, 0);
}
