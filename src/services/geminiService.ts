/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import { ProductAnalysis } from "../types";

let genAI: GoogleGenAI | null = null;

function getAI() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set. Please add it to your environment variables.");
    }
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
}

const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    quickVerdict: { type: Type.STRING, description: "A one-sentence summary of the product's resale potential." },
    improvements: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of actionable improvements." },
    platforms: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          matchScore: { type: Type.NUMBER, description: "Score from 0 to 100." },
          reasoning: { type: Type.STRING }
        },
        required: ["name", "matchScore", "reasoning"]
      }
    },
    suggestedTitle: { type: Type.STRING },
    suggestedDescription: { type: Type.STRING },
    priceRange: {
      type: Type.OBJECT,
      properties: {
        min: { type: Type.NUMBER },
        max: { type: Type.NUMBER },
        sweetSpot: { type: Type.NUMBER },
        currency: { type: Type.STRING }
      },
      required: ["min", "max", "sweetSpot", "currency"]
    },
    productDetails: {
      type: Type.OBJECT,
      properties: {
        type: { type: Type.STRING },
        condition: { type: Type.STRING },
        brand: { type: Type.STRING },
        category: { type: Type.STRING }
      },
      required: ["type", "condition", "brand", "category"]
    },
    buyerSentiment: {
      type: Type.OBJECT,
      properties: {
        overallRating: { type: Type.NUMBER, description: "Average rating from 1 to 5 stars." },
        summary: { type: Type.STRING, description: "Summary of human reviews and general opinion." },
        pros: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Key positive points from reviews." },
        cons: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Key negative points or common complaints." }
      },
      required: ["overallRating", "summary", "pros", "cons"]
    }
  },
  required: ["quickVerdict", "improvements", "platforms", "suggestedTitle", "suggestedDescription", "priceRange", "productDetails", "buyerSentiment"]
};

export async function analyzeProduct(image?: string, description?: string): Promise<ProductAnalysis> {
  const parts: any[] = [];
  
  if (image) {
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: image.split(',')[1] // Assuming base64 data URL
      }
    });
  }
  
  if (description) {
    parts.push({ text: `Context provided by user: ${description}` });
  }

  const prompt = `You are an expert market analyst for resellers. 
  1. Identify this product's exact brand, model, edition, and likely condition.
  2. USE THE INTERNET to research current similar sold listings and active competitors.
  3. SEARCH FOR REVIEWS: Look for what real people are saying about this product online (YouTube reviews, Reddit, specialized forums, store ratings).
  4. Analyze pricing trends for this specific product across Vinted, eBay, Depop, etc.
  5. Recommend exactly what physical improvements should be made to maximize value.
  6. Suggest the top 3-4 selling platforms with scores and specific reasoning for this exact item.
  7. Generate a human-written, non-robotic title and description optimized for the #1 recommended platform.
  8. Set a competitive price range (£/$/€) with a "sweet spot" for a 7-day sale.
  
  IMPORTANT: Do not make up information. If you cannot find specific data, use your best expert judgment but indicate the level of certainty in the reasoning.
  
  Output the results in the requested JSON format.`;

  const response = await getAI().models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts: [...parts, { text: prompt }] },
    tools: [
      { googleSearch: {} }
    ],
    toolConfig: { includeServerSideToolInvocations: true },
    config: {
      responseMimeType: "application/json",
      responseSchema: ANALYSIS_SCHEMA as any,
      thinkingConfig: {
        thinkingLevel: ThinkingLevel.HIGH
      }
    }
  } as any);

  return JSON.parse(response.text);
}

export async function chatAboutProduct(
  history: { role: 'user' | 'assistant', content: string }[], 
  currentAnalysis: ProductAnalysis
): Promise<{ analysis?: ProductAnalysis; chatResponse: string }> {
  const systemInstruction = `You are Sellscan AI, a expert reseller consultant.
  You have just analyzed a product and provided a report: ${JSON.stringify(currentAnalysis)}.
  
  The user will ask follow-up questions or requests to change parts of the report (e.g., "make the title shorter", "try eBay instead").
  
  If the user wants to update a specific part of the analysis, you MUST provide the UPDATED analysis in your response, AND a short helpful chat message.
  
  Responses should be in JSON format:
  {
    "chatResponse": "Sure, I've updated the description to be more punchy...",
    "updatedAnalysis": { ... updated full analysis object ... } (OPTIONAL, only if a change was requested)
  }`;

  const response = await getAI().models.generateContent({
    model: "gemini-3-flash-preview",
    contents: history.map(h => ({ role: h.role, parts: [{ text: h.content }] })),
    config: {
      systemInstruction,
      responseMimeType: "application/json"
    }
  });

  const result = JSON.parse(response.text);
  return {
    analysis: result.updatedAnalysis,
    chatResponse: result.chatResponse
  };
}
