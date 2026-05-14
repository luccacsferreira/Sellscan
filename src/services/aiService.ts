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

  const prompt = `You are an expert market analyst for resellers. 
  ${locationContext}
  
  1. Identify this product's exact brand, model, edition, and likely condition.
  2. Research current similar sold listings and active competitors in the user's location if specified.
  3. Look for what real people are saying about this product online (YouTube reviews, Reddit, specialized forums, store ratings).
  4. Analyze pricing trends for this specific product across Vinted, StockX, GOAT, Depop, Grailed, and Vestiaire Collective, as well as local leaders like Poshmark (US) or Mercari (US/Japan) if applicable.
  5. Recommend exactly what low-effort, high-impact physical improvements should be made to maximize value.
  6. Suggest the top 3-4 selling platforms with scores and specific reasoning for this item.
  7. Generate a human-written, non-robotic title and description optimized for the #1 recommended platform.
  8. Set a competitive price range with a "sweet spot" for a 7-day sale. Use local currency.
  
  Output MUST be a valid JSON object matching this schema:
  {
    "quickVerdict": "string",
    "improvements": ["string"],
    "platforms": [{"name": "string", "matchScore": number, "reasoning": "string"}],
    "suggestedTitle": "string",
    "suggestedDescription": "string",
    "priceRange": {"min": number, "max": number, "sweetSpot": number, "currency": "string"},
    "productDetails": {"type": "string", "condition": "string", "brand": "string", "category": "string"},
    "buyerSentiment": {"overallRating": number, "summary": "string", "pros": ["string"], "cons": ["string"]}
  }`;

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
