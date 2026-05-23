import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import OpenAI from "openai";
import { GoogleGenerativeAI as GoogleGenAI } from "@google/generative-ai";
import dotenv from "dotenv";
import Stripe from "stripe";
import bodyParser from "body-parser";
import { createClient } from '@supabase/supabase-js';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  const getStripe = () => {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not configured on the server.");
    }
    return new Stripe(process.env.STRIPE_SECRET_KEY);
  };

  // Supabase Admin for fulfilling orders bypassing RLS
  const getSupabaseAdmin = () => {
    const url = process.env.VITE_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
      console.warn("⚠️ Supabase Admin (URL or Service Key) not configured.");
      return null;
    }
    return createClient(url, serviceKey);
  };

  // Stripe Webhook - MUST be defined before express.json() to get raw body
  app.post("/api/stripe/webhook", bodyParser.raw({ type: 'application/json' }), async (req, res) => {
    const stripe = getStripe();
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("⚠️ STRIPE_WEBHOOK_SECRET is not set.");
      return res.status(400).send("Webhook secret missing");
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      console.error(`❌ Webhook Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Handle the event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id || session.metadata?.userId;
      const userEmail = session.customer_email;
      
      console.log(`✅ Payment successful for user ${userId} (${userEmail})`);
      
      if (supabaseAdmin && userId) {
        // Determine credits based on price (You can map Price IDs here)
        // This is a basic implementation - you should customize this mapping
        let creditsToGrant = 0;
        let tier = 'free';

        // Example mapping - Replace these with your actual Price IDs once you have them
        const priceId = session.metadata?.priceId || session.line_items?.data[0]?.price?.id || "";
        
        // Match against your actual Stripe Price IDs
        const isPremium = priceId === 'price_1TX3f0RCzE4WmLf5519Kp8zO' || priceId === 'price_1TX3jjRCzE4WmLf59KuysZhL';
        const isBasic = priceId === 'price_1TX3cnRCzE4WmLf5UJseWbYZ' || priceId === 'price_1TX3iCRCzE4WmLf5fwXNkaBB';

        if (isPremium) {
          creditsToGrant = 120;
          tier = 'premium';
        } else if (isBasic) {
          creditsToGrant = 40;
          tier = 'basic';
        }

        const { error } = await supabaseAdmin
          .from('profiles') // Assuming a 'profiles' table exists
          .upsert({ 
            id: userId,
            credits: creditsToGrant,
            tier: tier,
            updated_at: new Date()
          });

        if (error) console.error("❌ Error fulfilling order in Supabase:", error);
        else console.log(`🎉 Granted ${creditsToGrant} credits to user ${userId}`);
      }
    }

    res.json({ received: true });
  });

  app.use(express.json({ limit: '10mb' }));

  // Global middleware to add diagnostic header
  app.use((req, res, next) => {
    res.setHeader('X-Backend-Server', 'AI-Studio-Express');
    next();
  });

  // Dynamic environment configuration for the client (available in all environments)
  app.get("/env-config.js", (req, res) => {
    const config = {
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || 
                              process.env.SUPABASE_ANON_KEY || 
                              process.env.VITE_SUPABASE_ANC || 
                              process.env.SUPABASE_ANON_KE
    };
    
    console.log(`🛡️ Serving /env-config.js | Host: ${req.headers.host} | URL: ${config.VITE_SUPABASE_URL ? 'FOUND' : 'MISSING'}`);

    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.send(`
      window.SUPABASE_CONFIG = ${JSON.stringify(config)};
      console.log('🛡️ Config loaded via /env-config.js');
    `);
  });

  app.get("/api/diag", (req, res) => {
    res.json({
      timestamp: new Date().toISOString(),
      node_env: process.env.NODE_ENV,
      host: req.headers.host,
      supabase_url: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL ? 'CONFIGURED' : 'MISSING',
      supabase_key: process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANC ? 'CONFIGURED' : 'MISSING',
      all_supabase_keys: Object.keys(process.env).filter(k => k.includes('SUPABASE')),
      url_prefix: (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').substring(0, 15)
    });
  });

  // API Routes
  app.get("/api/config/supabase", (req, res) => {
    console.log(`🛡️ API Config requested | Host: ${req.headers.host}`);
    res.json({
      url: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
      anonKey: process.env.VITE_SUPABASE_ANON_KEY || 
               process.env.SUPABASE_ANON_KEY || 
               process.env.VITE_SUPABASE_ANC || 
               process.env.SUPABASE_ANON_KE ||
               process.env.VITE_SUPABASE_ANON ||
               process.env.SUPABASE_ANON
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
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
      }
      const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);
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
      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: "OPENAI_API_KEY is not configured on the server." });
      }
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
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
  
  app.post("/api/stripe/create-checkout", async (req, res) => {
    try {
      const stripe = getStripe();
      const { priceId, userId, userEmail, successUrl, cancelUrl } = req.body;
      
      if (!priceId) {
        return res.status(400).json({ error: "priceId is required" });
      }

      console.log(`💳 Creating Stripe checkout session for ${userEmail} | Price: ${priceId}`);

      const protocol = req.headers['x-forwarded-proto'] || 'http';
      const host = req.headers.host;
      const origin = `${protocol}://${host}`;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl || `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl || `${origin}/#pricing`,
        customer_email: userEmail,
        client_reference_id: userId, // Useful for fulfillment in webhooks
        metadata: {
          userId: userId || ""
        }
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Stripe Checkout Error:", error);
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
      console.log(`🛡️ Injection requested for: ${req.path} | Host: ${req.headers.host}`);
      try {
        const fs = await import("fs/promises");
        let htmlContent = "";
        try {
          htmlContent = await fs.readFile(path.join(distPath, "index.html"), "utf-8");
        } catch (readErr) {
          console.error("❌ Failed to read index.html from dist:", readErr);
          return res.status(500).send("Server Error: Missing index.html");
        }
        
        const config = {
          VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
          VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || 
                                  process.env.SUPABASE_ANON_KEY || 
                                  process.env.VITE_SUPABASE_ANC || 
                                  process.env.SUPABASE_ANON_KE ||
                                  process.env.VITE_SUPABASE_ANON ||
                                  process.env.SUPABASE_ANON
        };
        
        // Detailed debug info for console
        const debug = {
          status: config.VITE_SUPABASE_URL ? 'CONFIGURED' : 'UNCONFIGURED',
          env: process.env.NODE_ENV,
          keys: Object.keys(process.env).filter(k => k.includes('SUPABASE')),
          url_preview: config.VITE_SUPABASE_URL ? `${config.VITE_SUPABASE_URL.substring(0, 15)}...` : null,
          host: req.headers.host,
          time: new Date().toISOString(),
          version: '1.0.1'
        };

        const configScript = `
          <script id="supabase-config-injection">
            window.SUPABASE_CONFIG = ${JSON.stringify(config)};
            console.log('🛡️ Supabase Inline Injection:', ${JSON.stringify(debug)});
          </script>
        `;
        
        // Use a more robust regex for case-insensitive head tag matching
        const injectedHtml = htmlContent.replace(/<\/head>/i, `${configScript}</head>`);
        
        res.setHeader('Content-Type', 'text/html');
        // Very aggressive cache-control to bypass CDN caching
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('X-Injection-Status', config.VITE_SUPABASE_URL ? 'success' : 'missing-keys');
        
        return res.send(injectedHtml);
      } catch (e) {
        console.error("❌ Critical Injection failure:", e);
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
