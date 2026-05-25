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

  const prompt = `You are an expert market analyst for resellers and digital creators. 
  ${locationContext}
  
  1. Identify this product's exact brand, model, edition, and likely condition. 
     If the image is not a physical product (e.g., it is a graphic, logo, animation, or abstract art), analyze it as a "Digital Asset" or "Creative Service".
  2. Research current similar sold listings or freelance market rates (e.g., for design work) in the user's location.
  3. Look for what real people are saying about this product or service online (YouTube reviews, Reddit, specialized forums, store ratings).
  4. Analyze pricing/valuation across relevant platforms:
     - For physical goods: Vinted, StockX, GOAT, Depop, Grailed, Mercari, eBay.
     - For digital/creative assets: Upwork, Fiverr, Creative Market, Behance (Job Board), or NFT marketplaces if applicable.
  5. Recommend exactly what low-effort, high-impact refinements (Practical Tips) should be made to maximize value.
  6. Generate a representative 6-month price or demand history.
  7. Suggest the top 10 potential selling platforms, scored and with specific advantages/pricing for each.
  8. Track overall market sentiment (consensus, pros, cons mentioned by real buyers/clients).
  
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
  
  Additional Instructions:
  - 'worthRange' is the intrinsic market value or valuation.
  - 'priceRange' is the recommended listing price/rate for a fast conversion.
  - 'listingPrices' for platforms should be an array of 5 current active listing prices or job posting rates observed.
  - If it is a digital asset, 'brand' can be 'Independent Creator' or the detected style/origin.`;

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
