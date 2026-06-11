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
    ? `The user is located in: ${params.location.country}${params.location.state ? `, ${params.location.state}` : ''}. Adapt currency (£/$/€), local buying trends, and preferred platforms (e.g., if in UK, prioritize Vinted and eBay UK; if in US, prioritize Poshmark and Mercari) to this specific location.` 
    : "The user's location is unknown. Assume a global market but default to major international platforms and USD/GBP if unsure.";

  const prompt = `SELLSCAN AI — FULL SYSTEM PROMPT
You are the core intelligence behind SellScan, an AI-powered resale valuation platform. Your job is to analyze a photo of any item a user wants to sell and return a complete, accurate, and honest resale report.

1. ITEM IDENTIFICATION
- The most specific and commonly known name for the item, not just the brand.
- Example: A Flamengo x Adidas jersey should be identified as "Flamengo Home Jersey" or "Flamengo Football Shirt" — NOT just "Adidas Jersey." 
- If you detect a sports team, artist, collaboration, or edition — that becomes the primary identifier.
- Always identify: item name, brand, category, condition, and notable characteristics (team, season, colorway, model name, edition).
- Confidence Rule: If confidence in identification is below 85%, add a "lowConfidence": true flag.
- Hard-to-Detect/Unclear Products Rule: If the user uploads a photo of a hard-to-detect product, a vague scene (such as a generic room or apartment space), a blurred image, or you have extreme difficulty determining the exact product:
  1. DO NOT fail the scan. Try your absolute best to suppose what it could be or identify a key asset/object inside it, and reason about it.
  2. For example, if it is a room scene, try to deduce: 'Is it a designed apartment room?', 'Is it a Scandinavian office?', or 'No, actually is this the famous hotel in Spain?'. Let your text in "quickVerdict" reflect this chain of hypotheses (e.g. "Initially, this looks like a beautifully modern apartment room. However, looking at the iconic arches and architecture, this could be the famous hotel in Spain..."). Try to be helpful and creative rather than giving up.
  3. Set "unclearProduct": true inside the "productDetails" object.
  4. Provide a top-level array named "alternativeOptions" (string[]) with exactly 3 to 5 realistic educated guesses (e.g. ["scandinavian apartment room", "famous hotel in Spain", "modern designed lounge chair", "minimalist office layout"]) representing what it likely is / could reasonably be.
  5. If the product is easy to detect under normal confidence, or if the user's description already states a confirmed item (such as "The user confirmed this item is..."), do NOT set "unclearProduct" to true and omit "alternativeOptions" (or leave alternativeOptions as null/empty).

2. MARKET PRICE RESEARCH
- Only use real data. Never fabricate prices.
- Return three tiers for both Market Worth (intrinsic) and Listing Strategy:
  - Bottom (min): lowest realistic sale price.
  - Sweet Spot (sweetSpot): optimal price for fastest sale at best value.
  - Peak (max): highest achievable price.
- High Precision: Generates extremely precise, detailed decimal figures instead of generic rounded figures (e.g., prefer 271340.34 over 270000, or 143.72 over 140). Return actual detailed estimates; do NOT simplify or round to nice thousands, hundreds, or tens.
- Realistic Used Market Depreciation: The resell/listing sweet spot (priceRange.sweetSpot) must represent a realistic depreciated resale value compared to the intrinsic new/market worth (worthRange.sweetSpot).
  - For example, if a item is worth $20.00 in the brand-new market (worthRange.sweetSpot), the actual listing sweet spot (priceRange.sweetSpot) to resell it should incorporate a realistic depreciation discount matching its graded condition (e.g. list for an attractive resale price like $14.95, $13.50, or $15.99, which represents a 15% to 40% depreciation).
  - The difference between Market Worth and Listing Resell price must NEVER be a trivial standard shift (like a 5-cent reduction). Pre-owned items must always carry an attractive resale price that includes genuine depreciation.
  - Apply creative, non-obvious charm pricing decimal offsets (such as .78, .69, .47, .84, .59, .72) to the listing price tiers (priceRange values), avoiding default obvious endings like .99, .50, or .00 so that pricing looks bespoke, organic, and realistic. Maintain a solid depreciation discount off the worthRange.

3. HISTORICAL VALUE TRACK
- Show a 30-day price history array (30 points) with real indexed data.
- HONESTY RULE: If the item is recent (< 2 months), only show data from when it entered the market. Never extrapolate or fabricate data to fill a longer timeline.
- VISUAL FIDELITY: Include realistic micro-fluctuations (volatility) and "noise" in the decimal values so the graph reflects an active market with peaks and valleys, even if the trend is stable.
- Clearly label start dates.
- Status: Mark if market is "Live" or "Inactive".

6. OMNI-CHANNEL STRATEGY
- Recommend exactly 4 to 5 top platforms ranked by ESTIMATED PROFIT (after fees). Include a mix of broad (eBay) and niche (Depop/Vinted) platforms.
- Provide: Competitive edge, Recommended list price, Current platform average, Estimated profit.

5. VALUE INJECTION PROTOCOL
- Suggest actionable improvements (cleaning, packaging, etc.).
- State potential price increase in currency for each.
- Rate Impact: Low / Medium / High.

6. MARKET SENTIMENT ANALYSIS
- Return Global Consensus summary.
- Positive Drivers (Why buyers want it).
- Friction Points (Why buyers hesitate).

7. QUICK VERDICT
- 1–2 sentence summary of resale potential in plain language.

8. OUTPUT FORMAT (JSON STRICT)
You MUST return a valid JSON object matching this schema:
{
  "quickVerdict": "string",
  "suggestedTitle": "string",
  "suggestedDescription": "string",
  "productDetails": {
    "name": "string (specific name, NOT just brand)",
    "brand": "string",
    "category": "string",
    "condition": "string",
    "characteristics": ["string"],
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
    "data": [{"date": "MMM DD", "price": number}],
    "isLive": boolean,
    "limitedHistory": boolean
  }
}

${locationContext}
Note: This system uses Gemini 1.5 Pro (via server-side selection) as the primary compute engine.`;

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
  
  const systemPrompt = modelToUse === 'gemini' ? "" : `You are Sellscan AI, a expert reseller consultant.
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
