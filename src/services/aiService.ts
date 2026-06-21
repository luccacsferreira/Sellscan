import { ProductAnalysis, UserLocation, AIPipelineConfig } from "../types";

export interface AnalysisOptions {
  image?: string;
  description?: string;
  location?: UserLocation;
  isDemo?: boolean;
  pipeline?: AIPipelineConfig;
}

export async function analyzeProduct(options: AnalysisOptions): Promise<ProductAnalysis> {
  const { pipeline, ...params } = options;

  let modelToUse = 'gemini';
  if (pipeline?.researchModel.startsWith('gpt')) {
    modelToUse = 'gpt4';
  }

  const endpoint = modelToUse === 'gpt4' ? '/api/ai/gpt' : '/api/ai/gemini';
  
  // Construct the prompt
  const locationContext = params.location 
    ? `The user is located in: ${params.location.country}${params.location.state ? `, ${params.location.state}` : ''}. Adapt currency (£/$/€/R$), local buying trends, and preferred platforms. 
       - If near Brazil OR identifying a Brazilian product (e.g. Flamengo jersey): YOU MUST include at least 2 Brazilian platforms like 'Mercado Livre', 'Enjoei', or 'OLX Brazil' in the "platforms" array. 
       - Otherwise, prioritize large regional platforms relevant to the user's country.` 
    : "The user's location is unknown. Assume a global market. If the item has a clear regional origin (e.g. Brazilian football club), prioritize that region's platforms (at least 2).";

  const prompt = `SELLSCAN AI — FULL SYSTEM PROMPT
You are the core intelligence behind SellScan, an AI-powered resale valuation platform.

1. ITEM IDENTIFICATION & REGION
- Identify specific item, brand, and actual country of origin/main market (set as "detectedOrigin").
- Example: A Flamengo jersey should be identified with "detectedOrigin": "Brazil".
- Always identify: item name, brand, category, condition, and notable characteristics.
- Hard-to-Detect/Unclear Products Rule: If extreme difficulty, DO NOT fail. Suppose what it could be, set "unclearProduct": true, and provide 3-5 "alternativeOptions".

2. MARKET PRICE RESEARCH
- Return three tiers for Market Worth and Listing Strategy (min, max, sweetSpot).
- High Precision Decimal Requirement: You MUST generate precise, non-rounded decimal figures showing actual cents (e.g., 143.72, 55.43). 
- Avoid Round Numbers: You are strictly forbidden from returning prices ending in .00.
- Apply creative charm pricing decimal offsets (such as .78, .31, .62, .14) to ALL price tiers.

3. HISTORICAL VALUE TRACK
- Strictly Positive Rule: Prices MUST ALWAYS BE POSITIVE. Never return zero or negative values.
- VOLATILITY RULE: Ensure the graph is NOT a straight line. Market prices fluctuate. Include realistic micro-peaks and deep-valleys. 
- "month": 5-10 points. "year": 6-12 points. "allTime": Complete timeline (10-20 points).

4. OMNI-CHANNEL STRATEGY
- Recommend exactly 4 to 5 top platforms. 
- If detectedOrigin is Brazil, include at least 2 Brazilian platforms.

8. OUTPUT FORMAT (JSON STRICT)
{
  "quickVerdict": "string",
  "suggestedTitle": "string",
  "suggestedDescription": "string",
  "productDetails": {
    "name": "string",
    "brand": "string",
    "category": "string",
    "condition": "string",
    "characteristics": ["string"],
    "detectedOrigin": "string",
    "releaseYear": number,
    "lowConfidence": boolean,
    "unclearProduct": boolean
  },
  "alternativeOptions": ["string"],
  "worthRange": {"min": number, "max": number, "sweetSpot": number},
  "priceRange": {"min": number, "max": number, "sweetSpot": number, "platformAverage": number, "currency": "string"},
  "platforms": [
    {"name": "string", "edge": "string", "listPrice": number, "avgPrice": number, "profit": number}
  ],
  "practicalTips": [
    {"action": "string", "impact": "low|medium|high", "valueAdd": number, "description": "string"}
  ],
  "marketSentiment": {
    "consensus": "string",
    "goodThings": ["string"],
    "badThings": ["string"]
  },
  "priceHistory": {
    "month": [{"date": "MMM DD", "price": number}],
    "year": [{"date": "MMM 'YY", "price": number}],
    "allTime": [{"date": "YYYY", "price": number}],
    "isLive": boolean,
    "limitedHistory": boolean
  }
}

${locationContext}
Note: This system uses high-performance LLMs to derive these insights.`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      image: params.image
    })
  });

  if (!response.ok) {
    let errorMessage = "Failed to analyze with " + modelToUse;
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
  pipeline?: AIPipelineConfig
): Promise<{ analysis?: ProductAnalysis; chatResponse: string }> {
  let modelToUse = 'gemini';
  if (pipeline?.strategyModel.startsWith('gpt')) {
    modelToUse = 'gpt4';
  }
  const endpoint = modelToUse === 'gpt4' ? '/api/ai/gpt' : '/api/ai/gemini';
  
  const systemPrompt = modelToUse === 'gemini' ? "" : `You are Sellscan AI, an expert reseller consultant.
  You have just analyzed a product and provided a report: ${JSON.stringify(currentAnalysis)}.
  
  CLEAN FORMATTING RULES:
  - NEVER use double-asterisks (**) for bolding. It is visual noise. 
  - Use simple clean bullets (•) or numbers (1.) for lists.
  - Keep responses concise and professional.
  - If the user wants to update a specific part of the analysis, you MUST provide the UPDATED analysis in your response.
  
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
    let errorMessage = "Failed to chat with " + modelToUse;
    try {
      const err = await response.json();
      errorMessage = err.error || errorMessage;
    } catch {
      errorMessage = `Server error (${response.status}): ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  
  if (modelToUse === 'gemini') {
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
