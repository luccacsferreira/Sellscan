import { ProductAnalysis, UserLocation } from "../types";

export type AIModel = 'gemini' | 'gpt4';

export interface AnalysisOptions {
  image?: string;
  description?: string;
  location?: UserLocation;
  isDemo?: boolean;
  model?: AIModel;
}

export async function analyzeProduct(options: AnalysisOptions): Promise<ProductAnalysis> {
  const { model = 'gemini', ...params } = options;

  const endpoint = model === 'gpt4' ? '/api/ai/gpt' : '/api/ai/gemini';
  
  // Construct the prompt
  const locationContext = params.location 
    ? `The user is located in: ${params.location.country}${params.location.state ? `, ${params.location.state}` : ''}. Adapt currency (£/$/€), local buying trends, and preferred platforms (e.g., if in UK, prioritize Vinted and eBay UK; if in US, prioritize Poshmark and Mercari) to this specific location.` 
    : "The user's location is unknown. Assume a global market but default to major international platforms and USD/GBP if unsure.";

  const prompt = `You are a specialized Multi-Agent Resale Intelligence System. 
  ${locationContext}
  
  EXECUTION PIPELINE:
  1. [IDENTITY AGENT (Gemini 1.5)]: Identify the exact brand, model, and edition. If digital/creative (logo/art), label as 'Creative Asset'.
  2. [MARKET RESEARCH AGENT (Simulated Search)]: Deep-dive into real-time market data across eBay, Vinted, StockX, Poshmark, and specialized freelance job boards (Upwork/Fiverr) for creative assets. 
     - You MUST provide realistic Price History that reflects actual volatility.
     - Look for 'Sold' listings, not just active ones.
  3. [SENTIMENT AGENT]: Extract owner/buyer consensus from Reddit, YouTube reviews, and community forums.
  4. [MOCKUP AGENT]: Generate high-fidelity platform-specific listing parameters.
  
  CRITICAL ACCURACY RULES:
  - If the item is rare, reflect that in the 'Quick Verdict'.
  - 'marketSentiment' MUST reflect real human pros/cons (e.g., 'Sizing runs small', 'Materials are fragile').
  - For digital items, 'platforms' should include Creative Market, Fiverr, or Upwork.
  
  Output MUST be a valid JSON object matching this schema:
  {
    "quickVerdict": "string",
    "practicalTips": [{"action": "string", "impact": "low|medium|high", "valueAdd": number, "description": "string"}],
    "platforms": [{"name": "string", "matchScore": number, "reasoning": "string", "advantages": ["string"], "sellingPrice": number, "listingPrices": [number], "estimatedProfit": number}],
    "suggestedTitle": "string",
    "suggestedDescription": "string",
    "priceRange": {"min": number, "max": number, "sweetSpot": number, "currency": "string"},
    "worthRange": {"min": number, "max": number, "sweetSpot": number},
    "productDetails": {"type": "string", "condition": "string", "brand": "string", "category": "string"},
    "marketSentiment": {"consensus": "string", "goodThings": ["string"], "badThings": ["string"]},
    "priceHistory": [{"date": "MMM YYYY", "price": number}]
  }
  
  Note: This system uses Gemini 1.5 Flash as the primary compute engine with fallbacks to internal search-grounding logic.`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      image: params.image
    })
  });

  if (!response.ok) {
    let errorMessage = "Failed to analyze with " + model;
    try {
      const err = await response.json();
      errorMessage = err.error || errorMessage;
    } catch {
      errorMessage = `Server error (${response.status}): ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function chatAboutProduct(
  messages: any[], 
  currentAnalysis: ProductAnalysis,
  model: AIModel = 'gemini'
): Promise<{ analysis?: ProductAnalysis; chatResponse: string }> {
  const endpoint = model === 'gpt4' ? '/api/ai/gpt' : '/api/ai/gemini';
  
  const systemPrompt = model === 'gemini' ? "" : `You are Sellscan AI, a expert reseller consultant.
  You have just analyzed a product and provided a report: ${JSON.stringify(currentAnalysis)}.
  
  The user will ask follow-up questions or requests to change parts of the report.
  If the user wants to update a specific part of the analysis, you MUST provide the UPDATED analysis in your response.
  
  Responses should be in JSON format:
  {
    "chatResponse": "string",
    "updatedAnalysis": { ... full analysis object ... } (OPTIONAL)
  }`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      prompt: systemPrompt,
      messages: messages,
      analysis: currentAnalysis
    })
  });

  if (!response.ok) {
    let errorMessage = "Failed to chat with " + model;
    try {
      const err = await response.json();
      errorMessage = err.error || errorMessage;
    } catch {
      errorMessage = `Server error (${response.status}): ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  
  if (model === 'gemini') {
    return {
      analysis: data.updatedAnalysis,
      chatResponse: data.text
    };
  } else {
    try {
      const result = JSON.parse(data.text);
      return {
        analysis: result.updatedAnalysis,
        chatResponse: result.chatResponse
      };
    } catch {
      return { chatResponse: data.text };
    }
  }
}
