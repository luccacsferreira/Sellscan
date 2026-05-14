import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import OpenAI from "openai";
import { GoogleGenerativeAI as GoogleGenAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // OpenAI Instance
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // Gemini Instance
  const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY || "");

  // API Routes
  app.post("/api/ai/gemini", async (req, res) => {
    try {
      const { prompt, image, messages, analysis } = req.body;
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      if (messages) {
        // Chat mode
        const chat = model.startChat({
          history: messages.slice(0, -1).map((m: any) => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
          })),
          generationConfig: { maxOutputTokens: 2000 }
        });

        const systemCtxt = `You are Sellscan AI. Current analysis context: ${JSON.stringify(analysis)}. If requested to update, include "UPDATED_ANALYSIS:" followed by JSON.`;
        const lastMsg = messages[messages.length - 1].content;
        const result = await chat.sendMessage(`${systemCtxt}\n\nUser: ${lastMsg}`);
        const text = result.response.text();
        
        let updatedAnalysis = null;
        if (text.includes("UPDATED_ANALYSIS:")) {
           const parts = text.split("UPDATED_ANALYSIS:");
           try { updatedAnalysis = JSON.parse(parts[1].trim()); } catch(e) {}
        }

        res.json({ text, updatedAnalysis });
      } else {
        // Analysis mode
        const parts: any[] = [{ text: prompt }];
        if (image) {
          const [meta, data] = image.split(',');
          const mimeType = meta.split(':')[1].split(';')[0];
          parts.push({ inlineData: { data, mimeType } });
        }

        const result = await model.generateContent(parts);
        const response = await result.response;
        res.json(JSON.parse(response.text().replace(/```json|```/g, "")));
      }
    } catch (error: any) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ai/gpt", async (req, res) => {
    try {
      const { prompt, image, messages } = req.body;
      
      let gptMessages: any[] = [];
      
      if (messages) {
        gptMessages = messages.map((m: any) => ({
          role: m.role,
          content: m.content
        }));
      } else {
        gptMessages = [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
            ],
          },
        ];

        if (image) {
          (gptMessages[0].content as any[]).push({
            type: "image_url",
            image_url: { url: image },
          });
        }
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: gptMessages,
        response_format: messages ? undefined : { type: "json_object" },
      });

      const content = response.choices[0].message.content || "";
      if (messages) {
        res.json({ text: content });
      } else {
        res.json(JSON.parse(content || "{}"));
      }
    } catch (error: any) {
      console.error("GPT Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
