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

  // Dynamic environment configuration for the client (available in all environments)
  app.get("/env-config.js", (req, res) => {
    const config = {
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
    };
    
    // Debug info (safe partial keys)
    const debug = {
      url_prefix: config.VITE_SUPABASE_URL ? config.VITE_SUPABASE_URL.substring(0, 15) : 'MISSING',
      key_present: !!config.VITE_SUPABASE_ANON_KEY,
      timestamp: new Date().toISOString(),
      env_keys: Object.keys(process.env).filter(k => k.includes('SUPABASE'))
    };

    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.send(`
      window.SUPABASE_CONFIG = ${JSON.stringify(config)};
      console.log('🛡️ Env config loaded from server:', ${JSON.stringify(debug)});
    `);
  });

  // OpenAI Instance
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // Gemini Instance
  const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY || "");

  // API Routes
  app.get("/api/config/supabase", (req, res) => {
    res.json({
      url: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
      anonKey: process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
    });
  });

  app.get("/api/health/secrets", (req, res) => {
    res.json({
      gemini: !!process.env.GEMINI_API_KEY,
      openai: !!process.env.OPENAI_API_KEY,
      supabase: !!(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL),
      supabaseKey: !!(process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY),
      node_env: process.env.NODE_ENV,
      env_keys: Object.keys(process.env).filter(k => k.includes('SUPABASE'))
    });
  });

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
    
    // Explicitly handle root and index.html with injection BEFORE static middleware
    const handleInjection = async (req: express.Request, res: express.Response) => {
      try {
        const fs = await import("fs/promises");
        let html = await fs.readFile(path.join(distPath, "index.html"), "utf-8");
        
        const config = {
          VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
          VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
        };
        
        // Detailed debug info for console
        const debug = {
          status: config.VITE_SUPABASE_URL ? 'CONFIGURED' : 'UNCONFIGURED',
          env: process.env.NODE_ENV,
          keys: Object.keys(process.env).filter(k => k.includes('SUPABASE')),
          url_preview: config.VITE_SUPABASE_URL ? config.VITE_SUPABASE_URL.substring(0, 15) : null
        };

        const configScript = `
          <script id="supabase-config-injection">
            window.SUPABASE_CONFIG = ${JSON.stringify(config)};
            console.log('🛡️ Supabase Injection:', ${JSON.stringify(debug)});
          </script>
        `;
        
        html = html.replace("</head>", `${configScript}</head>`);
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        return res.send(html);
      } catch (e) {
        console.error("Injection failed:", e);
        return res.sendFile(path.join(distPath, "index.html"));
      }
    };

    app.get("/", (req, res) => handleInjection(req, res));
    app.get("/index.html", (req, res) => handleInjection(req, res));
    
    // Serve static files (exclude index.html from being served automatically at /)
    app.use(express.static(distPath, { index: false }));

    // Fallback for SPA routing - handle injection here too
    app.get("*", async (req, res, next) => {
      // If it looks like a route (no dot in the path), serve injected index.html
      if (!req.path.includes(".")) {
        return handleInjection(req, res);
      }
      next();
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
