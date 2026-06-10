import { AIModelInfo, AIPipelineConfig, AIPlan } from '../types';

export const AI_MODELS: AIModelInfo[] = [
  { id: 'gemini-1.5-lite', name: 'Gemini 1.5 Lite', provider: 'google', costPerScan: 0.1, minPlan: 'free' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'google', costPerScan: 0.5, minPlan: 'basic' },
  { id: 'gpt-4.1', name: 'GPT-4.1 Elite', provider: 'openai', costPerScan: 0.4, minPlan: 'basic' },
  { id: 'gpt-5.0', name: 'GPT 5.0 Vision', provider: 'openai', costPerScan: 1.2, minPlan: 'reseller' },
  { id: 'gpt-5.2', name: 'GPT-5.2 Omni', provider: 'openai', costPerScan: 2.0, minPlan: 'entrepreneur' },
  { id: 'claude-4.6-haiku', name: 'Claude 4.6 Haiku', provider: 'anthropic', costPerScan: 0.3, minPlan: 'entrepreneur' },
  { id: 'claude-4.6-sonnet', name: 'Claude 4.6 Sonnet', provider: 'anthropic', costPerScan: 1.0, minPlan: 'entrepreneur' },
];

export const DEFAULT_PIPELINES: Record<AIPlan, AIPipelineConfig> = {
  free: {
    detectionModel: 'gemini-1.5-lite',
    researchModel: 'gemini-1.5-lite',
    strategyModel: 'gemini-1.5-lite',
  },
  basic: {
    detectionModel: 'gemini-2.5-pro',
    researchModel: 'gpt-4.1',
    strategyModel: 'gemini-2.5-pro',
  },
  reseller: {
    detectionModel: 'gemini-2.5-pro',
    researchModel: 'gpt-5.0',
    strategyModel: 'gpt-5.0',
  },
  entrepreneur: {
    detectionModel: 'gemini-2.5-pro',
    researchModel: 'gpt-5.2',
    strategyModel: 'claude-4.6-sonnet',
  }
};

export function calculateScanCost(config: AIPipelineConfig): number {
  const models = [config.detectionModel, config.researchModel, config.strategyModel];
  return models.reduce((total, id) => {
    const model = AI_MODELS.find(m => m.id === id);
    return total + (model?.costPerScan || 0);
  }, 0);
}
