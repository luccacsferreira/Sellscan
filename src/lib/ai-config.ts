import { AIModelInfo, AIPipelineConfig, AIPlan } from '../types';

export const AI_MODELS: AIModelInfo[] = [
  { id: 'gemini-1.5-lite', name: 'Gemini 1.5 Lite', provider: 'google', costPerScan: 0.34, minPlan: 'free' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'google', costPerScan: 0.33, minPlan: 'free' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'google', costPerScan: 0.42, minPlan: 'basic' },
  { id: 'gemini-pro-latest', name: 'Gemini Pro Latest', provider: 'google', costPerScan: 0.45, minPlan: 'reseller' },
  { id: 'gpt-4.1', name: 'GPT-4.1 Elite', provider: 'openai', costPerScan: 0.48, minPlan: 'basic' },
  { id: 'gpt-5.0', name: 'GPT 5.0 Vision', provider: 'openai', costPerScan: 0.65, minPlan: 'reseller' },
  { id: 'gpt-5.2', name: 'GPT-5.2 Omni', provider: 'openai', costPerScan: 0.82, minPlan: 'entrepreneur' },
  { id: 'claude-4.6-haiku', name: 'Claude 4.6 Haiku', provider: 'anthropic', costPerScan: 0.38, minPlan: 'entrepreneur' },
  { id: 'claude-4.6-sonnet', name: 'Claude 4.6 Sonnet', provider: 'anthropic', costPerScan: 0.75, minPlan: 'entrepreneur' },
];

export const DEFAULT_PIPELINES: Record<AIPlan, AIPipelineConfig> = {
  free: {
    detectionModel: 'gemini-1.5-lite',
    researchModel: 'gemini-1.5-flash',
    strategyModel: 'gemini-1.5-flash',
  },
  basic: {
    detectionModel: 'gemini-2.5-pro',
    researchModel: 'gpt-4.1',
    strategyModel: 'gemini-2.5-pro',
  },
  reseller: {
    detectionModel: 'gemini-pro-latest',
    researchModel: 'gpt-5.0',
    strategyModel: 'gpt-5.0',
  },
  entrepreneur: {
    detectionModel: 'gemini-pro-latest',
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
