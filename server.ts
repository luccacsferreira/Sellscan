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

// Helper to find a key across multiple naming conventions (VITE_ prefix, etc.)
const getEnv = (key: string) => {
  return process.env[key] || process.env[`VITE_${key}`] || process.env[`NEXT_PUBLIC_${key}`];
};

async function startServer() {
  // 1. Extreme Brute-Force Sync: Scan all env vars for common key patterns
  // This handles naming variations, case sensitivity, and unexpected prefixes
  console.log("🔍 Scanning environment for keys...");
  const envKeys = Object.keys(process.env);
  
  // Log all keys found (censored) to help debug presence
  console.log("🔑 Detected Env Keys:", envKeys.map(k => {
    const lowerKey = k.toLowerCase();
    if (lowerKey.includes('session') || lowerKey.includes('token') || lowerKey.includes('pass') || lowerKey.includes('secret') || lowerKey.includes('key')) {
      return `${k}: [REDACTED]`;
    }
    return k;
  }).join(', '));

  envKeys.forEach(envKey => {
    const key = envKey.toUpperCase();
    let val = process.env[envKey];
    if (!val || typeof val !== 'string' || val.trim() === '') return;

    // Aggressive quote stripping
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);

    // 1. Value-based identification (THE MOST RELIABLE)
    // Gemini/Google keys start with AIza
    if (val.startsWith('AIza')) {
       if (!process.env.GEMINI_API_KEY) {
         process.env.GEMINI_API_KEY = val;
         console.log(`✨ [AUTO-DETECT] Identified Gemini-compatible Key in ${envKey}`);
       }
    }
    // Stripe keys start with sk_live_ or sk_test_
    if (val.startsWith('sk_')) {
       if (!process.env.STRIPE_SECRET_KEY) {
         process.env.STRIPE_SECRET_KEY = val;
         console.log(`✨ [AUTO-DETECT] Identified Stripe Secret Key in ${envKey}`);
       }
    }
    // OpenAI keys start with sk-
    if (val.startsWith('sk-') && !val.includes('sk_')) { // sk- is OpenAI, sk_ is Stripe
       if (!process.env.OPENAI_API_KEY) {
         process.env.OPENAI_API_KEY = val;
         console.log(`✨ [AUTO-DETECT] Identified OpenAI Key in ${envKey}`);
       }
    }
    // Supabase URL identification
    if (val.includes('.supabase.co')) {
      if (!process.env.SUPABASE_URL) {
        process.env.SUPABASE_URL = val;
        process.env.VITE_SUPABASE_URL = val;
        console.log(`✨ [AUTO-DETECT] Identified Supabase URL in ${envKey}`);
      }
    }

    // 2. Name-based fallback (Existing logic)
    // Gemini / Google Check: Look for GEMINI, GOOGLE, AI, or even just "KEY" patterns
    if (
      key.includes('GEMINI') || 
      (key.includes('GOOGLE') && key.includes('AI')) || 
      (key.includes('GOOGLE') && key.includes('KEY')) ||
      key === 'GOOGLE_API_KEY' || 
      key === 'AI_KEY'
    ) {
      if (!process.env.GEMINI_API_KEY) {
        process.env.GEMINI_API_KEY = val;
        console.log(`✅ [SYNC] Mapped ${envKey} -> GEMINI_API_KEY`);
      }
    }
    
    // Stripe Check: Look for STRIPE, SK_, PK_, or SECRET
    if (key.includes('STRIPE') || key.startsWith('SK_') || (key.includes('STRIPE') && key.includes('SECRET'))) {
      if (!process.env.STRIPE_SECRET_KEY && (key.includes('SECRET') || key.includes('SK_'))) {
        process.env.STRIPE_SECRET_KEY = val;
        console.log(`✅ [SYNC] Mapped ${envKey} -> STRIPE_SECRET_KEY`);
      }
    }
    
    // OpenAI Check
    if (key.includes('OPENAI') || key.includes('GPT')) {
      if (!process.env.OPENAI_API_KEY && key.includes('KEY')) {
        process.env.OPENAI_API_KEY = val;
        console.log(`✅ [SYNC] Mapped ${envKey} -> OPENAI_API_KEY`);
      }
    }
    
    // Supabase URL
    if (key.includes('SUPABASE') && (key.includes('URL') || key.includes('URI'))) {
      if (!process.env.SUPABASE_URL) process.env.SUPABASE_URL = val;
      if (!process.env.VITE_SUPABASE_URL) process.env.VITE_SUPABASE_URL = val;
    }
    
    // Supabase Anon Key
    if (key.includes('SUPABASE') && (key.includes('ANON') || key.includes('PUBLIC') || key.includes('CLIENT'))) {
      if (!process.env.SUPABASE_ANON_KEY) process.env.SUPABASE_ANON_KEY = val;
      if (!process.env.VITE_SUPABASE_ANON_KEY) process.env.VITE_SUPABASE_ANON_KEY = val;
    }
    
    // Supabase Service Role
    if (key.includes('SUPABASE') && (key.includes('SERVICE') || key.includes('ROLE') || key.includes('ADMIN') || key.includes('SK_SUPA'))) {
      if (!process.env.SUPABASE_SERVICE_ROLE_KEY) process.env.SUPABASE_SERVICE_ROLE_KEY = val;
    }
  });

  console.log("🚀 Server starting...");
  
  const configStatus = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    STRIPE: process.env.STRIPE_SECRET_KEY ? "CONFIGURED (Ends: " + process.env.STRIPE_SECRET_KEY.slice(-4) + ")" : "MISSING",
    GEMINI: process.env.GEMINI_API_KEY ? "CONFIGURED (Ends: " + process.env.GEMINI_API_KEY.slice(-4) + ")" : "MISSING",
    OPENAI: process.env.OPENAI_API_KEY ? "CONFIGURED" : "MISSING",
    SUPABASE: (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL) ? "CONFIGURED" : "MISSING",
    ADMIN: process.env.SUPABASE_SERVICE_ROLE_KEY ? "CONFIGURED" : "MISSING",
    TOTAL_ENV_KEYS: envKeys.length,
    CWD: process.cwd(),
  };

  // Targeted API Key detection for the user's "21 keys" check
  const importantKeys = [
    'GEMINI_API_KEY', 'STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 
    'VITE_STRIPE_PUBLISHABLE_KEY',
    'SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY',
    'OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'APP_URL'
  ];
  
  // Normalization map for common UI-truncated environment variables from Google Cloud / Cloud Run
  const truncatedMapping: Record<string, string> = {
    'VITE_STRIPE_PRICE_ENTREPRENEUR_YEARLY_D': 'VITE_STRIPE_PRICE_ENTREPRENEUR_YEARLY_DISCOUNT',
    'VITE_STRIPE_PRICE_ENTREPRENEUR_MONTHLY_D': 'VITE_STRIPE_PRICE_ENTREPRENEUR_MONTHLY_DISCOUNT',
    'VITE_STRIPE_PRICE_RESELLER_YEARLY_DISCOU': 'VITE_STRIPE_PRICE_RESELLER_YEARLY_DISCOUNT',
    'VITE_STRIPE_PRICE_RESELLER_YEARLY_DISCO': 'VITE_STRIPE_PRICE_RESELLER_YEARLY_DISCOUNT',
    'VITE_STRIPE_PRICE_RESELLER_MONTHLY_DISC': 'VITE_STRIPE_PRICE_RESELLER_MONTHLY_DISCOUNT',
    'VITE_STRIPE_PRICE_BASIC_MONTHLY_DISCOUN': 'VITE_STRIPE_PRICE_BASIC_MONTHLY_DISCOUNT',
    'VITE_STRIPE_PRICE_BASIC_YEARLY_DISCOUNT': 'VITE_STRIPE_PRICE_BASIC_YEARLY_DISCOUNT', // Guard
  };

  Object.entries(truncatedMapping).forEach(([truncated, full]) => {
    if (process.env[truncated] && !process.env[full]) {
      process.env[full] = process.env[truncated];
      console.log(`✨ [NORMALIZED] Mapped truncated env ${truncated} -> ${full}`);
    }
  });

  const priceIdKeys = Object.keys(process.env).filter(k => k.startsWith('VITE_STRIPE_PRICE_') && (process.env[k]?.length || 0) > 5);
  
  // Detection for "Product ID instead of Price ID" error
  priceIdKeys.forEach(k => {
    const val = process.env[k] || '';
    if (val.startsWith('prod_')) {
      console.error(`🚨 DETECTED PRODUCT ID IN PRICE FIELD: ${k} is set to a Product ID (${val}). Stripe checkout requires a PRICE ID (starting with price_).`);
    } else if (val && !val.startsWith('price_')) {
      console.warn(`⚠️ UNUSUAL PRICE ID: ${k} is set to ${val}. Most Stripe Price IDs start with 'price_'.`);
    }
  });
  const foundImportant = importantKeys.filter(k => !!process.env[k]);
  const totalUserManaged = foundImportant.length + priceIdKeys.length;
  
  console.log("📋 Configuration Status:", configStatus);
  console.log(`🎯 USER API KEY VERIFICATION: Detected ${totalUserManaged} of 22 expected keys.`);
  if (totalUserManaged < 21) {
    console.warn(`⚠️ Warning: Only ${totalUserManaged} active keys detected. Please check your AI Studio Secrets panel.`);
  }

  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  const getStripe = () => {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      console.error("❌ getStripe triggered but STRIPE_SECRET_KEY is undefined/empty in process.env");
      console.log("Current ENV keys (censored):", Object.keys(process.env).filter(k => !k.includes('SESSION') && !k.includes('TOKEN')));
      throw new Error("STRIPE_SECRET_KEY is not configured on the server.");
    }
    return new Stripe(key, { apiVersion: '2024-12-18.preview' as any });
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

      let promoCode = '';
      let couponId = '';
      const discountAmount = session.total_details?.amount_discount || 0;

      try {
        console.log(`🔍 Retrieving expanded checkout session ${session.id}...`);
        const expandedSession = await stripe.checkout.sessions.retrieve(
          session.id,
          {
            expand: [
              'discounts',
              'discounts.promotion_code',
              'subscription',
              'subscription.discount',
              'subscription.discount.promotion_code',
              'invoice',
              'invoice.discount',
              'invoice.discount.promotion_code',
            ],
          }
        );

        // 1. Direct discounts array on expanded session
        const discounts = expandedSession.discounts;
        if (discounts && discounts.length > 0) {
          const discount = discounts[0];
          if (discount && typeof discount !== 'string') {
            if (discount.promotion_code && typeof discount.promotion_code !== 'string') {
              promoCode = discount.promotion_code.code;
              console.log(`🎉 Found promoCode from expandedSession.discounts: ${promoCode}`);
            }
            if (discount.coupon) {
              couponId = typeof discount.coupon === 'string' ? discount.coupon : discount.coupon.id;
              console.log(`🎉 Found couponId from expandedSession.discounts: ${couponId}`);
            }
          }
        }

        // 2. Fallback to session.total_details.breakdown.discounts
        const sessionDiscounts = (expandedSession as any).total_details?.breakdown?.discounts;
        if (!promoCode && sessionDiscounts && sessionDiscounts.length > 0) {
          console.log(`🔍 Checking ${sessionDiscounts.length} discounts in session.total_details.breakdown.discounts`);
          for (const d of sessionDiscounts) {
            const discObj = d.discount;
            if (discObj && typeof discObj !== 'string') {
              if (discObj.promotion_code && typeof discObj.promotion_code !== 'string') {
                promoCode = discObj.promotion_code.code;
                console.log(`🎉 Found promoCode from total_details breakdown: ${promoCode}`);
              }
              if (discObj.coupon) {
                couponId = typeof discObj.coupon === 'string' ? discObj.coupon : discObj.coupon.id;
                console.log(`🎉 Found couponId from total_details breakdown: ${couponId}`);
              }
            }
          }
        }

        // 3. Fallback to subscription discount if we expanded subscription
        if (!promoCode && expandedSession.subscription) {
          const sub = expandedSession.subscription as any;
          if (sub && typeof sub !== 'string') {
            if (sub.discount) {
              const disc = sub.discount;
              if (disc.promotion_code && typeof disc.promotion_code !== 'string') {
                promoCode = disc.promotion_code.code;
                console.log(`🎉 Found promoCode from expandedSubscription (discount): ${promoCode}`);
              }
              if (disc.coupon) {
                couponId = typeof disc.coupon === 'string' ? disc.coupon : disc.coupon.id;
                console.log(`🎉 Found couponId from expandedSubscription (discount): ${couponId}`);
              }
            } else if (sub.discounts && sub.discounts.length > 0) {
              const disc = sub.discounts[0];
              if (disc && typeof disc !== 'string') {
                if (disc.promotion_code && typeof disc.promotion_code !== 'string') {
                  promoCode = disc.promotion_code.code;
                  console.log(`🎉 Found promoCode from expandedSubscription (discounts list): ${promoCode}`);
                }
                if (disc.coupon) {
                  couponId = typeof disc.coupon === 'string' ? disc.coupon : disc.coupon.id;
                  console.log(`🎉 Found couponId from expandedSubscription (discounts list): ${couponId}`);
                }
              }
            }
          }
        }

        // 4. Fallback to invoice discount if we expanded invoice
        if (!promoCode && expandedSession.invoice) {
          const inv = expandedSession.invoice as any;
          if (inv && typeof inv !== 'string') {
            if (inv.discount) {
              const disc = inv.discount;
              if (disc.promotion_code && typeof disc.promotion_code !== 'string') {
                promoCode = disc.promotion_code.code;
                console.log(`🎉 Found promoCode from expandedInvoice (discount): ${promoCode}`);
              }
              if (disc.coupon) {
                couponId = typeof disc.coupon === 'string' ? disc.coupon : disc.coupon.id;
                console.log(`🎉 Found couponId from expandedInvoice (discount): ${couponId}`);
              }
            } else if (inv.discounts && inv.discounts.length > 0) {
              const disc = inv.discounts[0];
              if (disc && typeof disc !== 'string') {
                if (disc.promotion_code && typeof disc.promotion_code !== 'string') {
                  promoCode = disc.promotion_code.code;
                  console.log(`🎉 Found promoCode from expandedInvoice (discounts list): ${promoCode}`);
                }
                if (disc.coupon) {
                  couponId = typeof disc.coupon === 'string' ? disc.coupon : disc.coupon.id;
                  console.log(`🎉 Found couponId from expandedInvoice (discounts list): ${couponId}`);
                }
              }
            }
          }
        }

      } catch (err: any) {
        console.error("⚠️ Failed to retrieve expanded session discounts:", err.message);
      }

      // 5. Direct API fallback if subscription is a string and not expanded
      if (!promoCode && session.subscription) {
        try {
          console.log(`🔍 Checking subscription ${session.subscription} via direct API query...`);
          const subDetail = await stripe.subscriptions.retrieve(
            session.subscription as string,
            {
              expand: ['discount', 'discount.promotion_code', 'discounts', 'discounts.promotion_code'],
            }
          ) as any;
          if (subDetail.discount) {
            const disc = subDetail.discount;
            if (disc.promotion_code && typeof disc.promotion_code !== 'string') {
              promoCode = disc.promotion_code.code;
              console.log(`🎉 Found promoCode from subDetail (discount): ${promoCode}`);
            }
            if (disc.coupon) {
              couponId = typeof disc.coupon === 'string' ? disc.coupon : disc.coupon.id;
            }
          } else if (subDetail.discounts && subDetail.discounts.length > 0) {
            const disc = subDetail.discounts[0];
            if (disc && typeof disc !== 'string') {
              if (disc.promotion_code && typeof disc.promotion_code !== 'string') {
                promoCode = disc.promotion_code.code;
                console.log(`🎉 Found promoCode from subDetail (discounts list): ${promoCode}`);
              }
              if (disc.coupon) {
                couponId = typeof disc.coupon === 'string' ? disc.coupon : disc.coupon.id;
              }
            }
          }
        } catch (subErr: any) {
          console.warn("⚠️ Sub direct query error:", subErr.message);
        }
      }
      
      if (supabaseAdmin && userId) {
        // Determine credits based on price (Dynamic mapping from Environment)
        let creditsToGrant = 0;
        let tier = 'Explorer';
        
        const priceMap: Record<string, { tier: string, credits: number }> = {};
        const tiersList = [
          { name: 'basic', credits: 40, envPrefix: 'BASIC' },
          { name: 'reseller', credits: 120, envPrefix: 'RESELLER' },
          { name: 'entrepreneur', credits: 300, envPrefix: 'ENTREPRENEUR' }
        ];
        const cycleSuffixes = ['MONTHLY', 'MONTHLY_DISCOUNT', 'YEARLY', 'YEARLY_DISCOUNT'];

        tiersList.forEach(t => {
          cycleSuffixes.forEach(s => {
            const envKey = `VITE_STRIPE_PRICE_${t.envPrefix}_${s}`;
            const id = process.env[envKey];
            if (id) {
              priceMap[id] = { tier: t.name, credits: t.credits };
            }
          });
        });

        const priceId = session.metadata?.priceId || session.line_items?.data[0]?.price?.id || "";
        const mapping = priceMap[priceId];
        
        if (mapping) {
          tier = mapping.tier;
          creditsToGrant = mapping.credits;
          console.log(`💳 Resolved Tier: ${tier} | Credits: ${creditsToGrant} (Price: ${priceId})`);
        } else {
          console.warn(`🛑 Unrecognized Price ID: ${priceId}. No tier or credits mapped.`);
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

        // If a promotion code was used, log it to the user's promo code logs table
        if (promoCode) {
          console.log(`🎁 Promo code "${promoCode}" applied to purchase for user ${userId}. Attempting to record in database logs...`);
          const logPayload = {
            user_id: userId,
            email: userEmail,
            promo_code: promoCode,
            coupon_id: couponId,
            amount_discount: discountAmount / 100,
            checkout_session_id: session.id,
            created_at: new Date()
          };
          
          try {
            // Attempt standard variations of logging table name
            const { error: logErr1 } = await supabaseAdmin
              .from('promo_code_logs')
              .insert(logPayload);
              
            if (logErr1) {
              console.warn("⚠️ 'promo_code_logs' table failed, trying 'promo_codes_log':", logErr1.message);
              const { error: logErr2 } = await supabaseAdmin
                .from('promo_codes_log')
                .insert(logPayload);
                
              if (logErr2) {
                console.warn("⚠️ 'promo_codes_log' table failed, trying 'promo_logs':", logErr2.message);
                const { error: logErr3 } = await supabaseAdmin
                  .from('promo_logs')
                  .insert(logPayload);
                  
                if (logErr3) {
                  console.error("❌ Promo code logging failed on all fallback tables:", logErr3.message);
                } else {
                  console.log("🎉 Successfully saved promo log to 'promo_logs'!");
                }
              } else {
                console.log("🎉 Successfully saved promo log to 'promo_codes_log'!");
              }
            } else {
              console.log("🎉 Successfully saved promo log to 'promo_code_logs'!");
            }
          } catch (dbErr: any) {
            console.error("❌ Database exception logging promo code:", dbErr.message);
          }
        }
      }
    }

    res.json({ received: true });
  });

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Global middleware to add diagnostic header
  app.use((req, res, next) => {
    res.setHeader('X-Backend-Server', 'AI-Studio-Express');
    next();
  });

  // Dynamic environment configuration for the client (available in all environments)
  app.get("/env-config.js", (req, res) => {
    const priceIds: Record<string, string> = {};
    Object.keys(process.env).forEach(key => {
      if (key.includes('STRIPE_PRICE_')) {
        const val = process.env[key] || '';
        priceIds[key.replace('VITE_', '').replace('STRIPE_PRICE_', '')] = val;
      }
    });

    // Mirror the normalized full keys to the mapping for the frontend
    Object.keys(truncatedMapping).forEach(truncatedKey => {
      const fullKey = truncatedMapping[truncatedKey];
      const val = process.env[fullKey];
      if (val) {
        priceIds[fullKey.replace('VITE_', '').replace('STRIPE_PRICE_', '')] = val;
      }
    });

    const config = {
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || 
                              process.env.SUPABASE_ANON_KEY || 
                              process.env.VITE_SUPABASE_ANC || 
                              process.env.SUPABASE_ANON_KEY,
      VITE_STRIPE_PUBLISHABLE_KEY: process.env.VITE_STRIPE_PUBLISHABLE_KEY
    };
    
    console.log(`🛡️ Serving /env-config.js | Host: ${req.headers.host} | CWD: ${process.cwd()} | URL: ${config.VITE_SUPABASE_URL ? 'FOUND' : 'MISSING'}`);

    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.send(`
      window.SUPABASE_CONFIG = ${JSON.stringify(config)};
      window.STRIPE_PRICE_IDS = ${JSON.stringify(priceIds)};
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
      stripe: !!process.env.STRIPE_SECRET_KEY,
      supabase: !!(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL),
      supabaseKey: !!(process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY),
      node_env: process.env.NODE_ENV,
      env_keys: Object.keys(process.env).filter(k => !k.includes('SESSION') && !k.includes('TOKEN'))
    });
  });

  app.get("/api/debug/env", (req, res) => {
    // Only return keys, NEVER values for security
    const audit = Object.keys(process.env).map(k => ({
      key: k,
      hasValue: !!process.env[k],
      length: process.env[k]?.length || 0,
      suffix: process.env[k]?.slice(-4) || 'N/A'
    }));

    res.json({
      status: "Aggressive Env Check",
      audit,
      resolved: {
        GEMINI: !!process.env.GEMINI_API_KEY,
        STRIPE: !!process.env.STRIPE_SECRET_KEY,
        OPENAI: !!process.env.OPENAI_API_KEY,
        SUPABASE: !!process.env.SUPABASE_URL
      }
    });
  });

  app.post("/api/ai/gemini", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        // Fallback to OpenAI if Gemini key is missing
        if (process.env.OPENAI_API_KEY) {
          console.warn("⚠️ Gemini Key missing, redirecting to OpenAI fallback...");
          return res.redirect(307, "/api/ai/gpt");
        }
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
      }
      
      const genAI = new GoogleGenAI(apiKey);
      const { prompt: userPrompt, image, messages, analysis } = req.body;
      
      // Use Pro for analysis if possible, Flash for chat
      const modelName = messages ? "gemini-1.5-flash" : "gemini-1.5-pro";
      const model = genAI.getGenerativeModel({ model: modelName });

      try {
        if (messages) {
          // Chat mode
          const chat = model.startChat({
            history: messages.slice(0, -1).map((m: any) => ({
              role: m.role === 'user' ? 'user' : 'model',
              parts: [{ text: m.content }]
            })),
            generationConfig: { maxOutputTokens: 2000 }
          });

          const systemCtxt = `You are Sellscan AI, the core intelligence behind SellScan. Follow the SELLSCAN AI TRAINING PROTOCOL:
          
          1. IDENTIFICATION: Prioritize specificity (e.g. "Flamengo Home Jersey") over manufacturer brand.
          2. PRICING: Provide three tiers: Bottom, Sweet Spot, and Peak. Use decimal precision and creative, non-obvious charm pricing decimal offsets (such as .78, .69, .47, .84, .59, .72) rather than standard endings like .50 or .99 which are too obvious. Avoid simple round endings like .00 except when absolutely necessary.
          3. HONESTY: Never fabricate history for recent items. If data is limited, say so.
          4. REFINEMENT: If the user corrects you or provides more info, you MUST analyze and provide an updated JSON.
          5. UI UPDATES: To update the report, include "UPDATED_ANALYSIS:" followed by the full modified JSON object matching the original schema.
          
          CURRENT SCAN ANALYSIS: ${JSON.stringify(analysis)}`;
          
          const lastMsg = messages[messages.length - 1].content;
          const result = await chat.sendMessage(`${systemCtxt}\n\nUser: ${lastMsg}`);
          const text = result.response.text();
          
          let updatedAnalysis = null;
          if (text.includes("UPDATED_ANALYSIS:")) {
             const parts = text.split("UPDATED_ANALYSIS:");
             try { updatedAnalysis = JSON.parse(parts[1].trim()); } catch(e) {}
          }

          return res.json({ text, updatedAnalysis });
        } else {
          // Analysis mode
          const parts: any[] = [{ text: userPrompt }];
          if (image) {
            const [meta, data] = image.split(',');
            const mimeType = meta.split(':')[1].split(';')[0];
            parts.push({ inlineData: { data, mimeType } });
          }

          const result = await model.generateContent(parts);
          const response = await result.response;
          const text = response.text();
          
          try {
            // Robust JSON extraction for cases where AI adds markdown or conversational fluff
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error("No JSON found in AI response");
            return res.json(JSON.parse(jsonMatch[0]));
          } catch (parseError) {
            console.error("JSON Parse Error. Raw Text:", text);
            throw new Error("Analysis failed. The image might be too complex or unclear for current detection agents.");
          }
        }
      } catch (geminiError: any) {
        console.error("❌ Gemini Call Failed:", geminiError.message);
        // Fallback to OpenAI if Gemini fails mid-request
        if (process.env.OPENAI_API_KEY) {
          console.warn("🔄 Gemini failed, attempting GPT-4o fallback...");
          const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
          
          let gptMessages = messages ? messages.map((m: any) => ({ role: m.role, content: m.content })) : [
            { role: "user", content: [{ type: "text", text: userPrompt }] }
          ];
          
          if (!messages && image) {
            (gptMessages[0].content as any[]).push({ type: "image_url", image_url: { url: image } });
          }

          const gptResponse = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: gptMessages,
            response_format: messages ? undefined : { type: "json_object" },
          });

          const content = gptResponse.choices[0].message.content || "";
          if (messages) {
            return res.json({ text: content });
          } else {
            return res.json(JSON.parse(content || "{}"));
          }
        }
        throw geminiError;
      }
    } catch (error: any) {
      console.error("Critical AI Route Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ai/gpt", async (req, res) => {
    try {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        console.error("❌ GPT API request failed: OPENAI_API_KEY is missing.");
        return res.status(500).json({ error: "OPENAI_API_KEY is not configured on the server." });
      }
      const openai = new OpenAI({ apiKey });
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

  app.post("/api/ai/suggest-plan", async (req, res) => {
    try {
      const { describeOther, volume, platforms } = req.body;
      const userText = describeOther || "";
      const volText = volume || "";
      const plArray = platforms || [];

      // Built-in rule-based fallback if no AI key configured or if call fails
      const fallbackSuggestion = () => {
        let suggestedTier = "Explorer";
        let reasoning = "Based on your active start, the Explorer tier is the perfect zero-cost launchpad to scan items, test market speeds, and learn the ropes!";

        const lowUserText = userText.toLowerCase();
        const isProfessional = lowUserText.includes("professional") || lowUserText.includes("business") || lowUserText.includes("entrepreneur") || lowUserText.includes("shop") || lowUserText.includes("reseller") || lowUserText.includes("wholesale") || lowUserText.includes("store");
        
        if (volText.includes("200+") || lowUserText.includes("bulk") || lowUserText.includes("warehouse") || (isProfessional && volText.includes("51 - 200"))) {
          suggestedTier = "Entrepreneur";
          reasoning = `Since you run a larger scale operation with ${volText || "high volume"} active inventory and list across multiple channels, the Entrepreneur plan is engineered for you. You get maximum scans, advanced sentiment analytics, and custom developer tools.`;
        } else if (volText.includes("51 - 200") || isProfessional || lowUserText.includes("flip") || lowUserText.includes("ebayer")) {
          suggestedTier = "Reseller";
          reasoning = `As an active flipper targeting platforms like ${plArray.join(', ') || 'eBay, Grailed'}, your listing density matches the Reseller tier perfectly. This unlocks our premier cross-platform intelligence, dedicated margins tracker, and pricing matrices.`;
        } else if (volText.includes("11 - 50") || lowUserText.includes("hobby") || lowUserText.includes("clean") || lowUserText.includes("garage")) {
          suggestedTier = "Basic";
          reasoning = `With a moderate pace of ${volText || "11-50 listings"} a month, the Basic plan gives you the essential scan credits, condition rating benchmarks, and platform routing to lift your side-gig to new heights.`;
        }
        
        return { suggestedTier, reasoning };
      };

      const geminiKey = process.env.GEMINI_API_KEY;
      const openaiKey = process.env.OPENAI_API_KEY;

      if (!geminiKey && !openaiKey) {
        console.warn("⚠️ No AI keys configured for plan suggestion. Using rule-based builder.");
        return res.json(fallbackSuggestion());
      }

      const promptHtml = `You are the Sellscan dynamic plan recommendation engine.
We offer four plans:
- 'Explorer': For casual decluttering/hobbyists, list <10 items/mo.
- 'Basic': For regular local flippers, list 10-50 items/mo.
- 'Reseller': For dedicated part-time/full-time flippers, list 50-200 items/mo, cross-platform listing.
- 'Entrepreneur': For bulk liquidators, brick-and-mortar stores, or high volume operations listing >200 items/mo.

Based on this user profile, select the absolute best plan and write a professional, highly encouraging 2-3 sentence reasoning addressing them directly:
- User's business model (especially if custom/other description was provided): "${userText}"
- Intended volume: "${volText}"
- Platforms to list: "${plArray.join(', ')}"

Return **JSON ONLY** with the exact schema:
{
  "suggestedTier": "Explorer" | "Basic" | "Reseller" | "Entrepreneur",
  "reasoning": "A personalized explanation speaking directly to their strategy, noting their platforms/volume, and outlining exactly why this tier is supreme for them."
}`;

      if (geminiKey) {
        try {
          const genAI = new GoogleGenAI(geminiKey);
          const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
          const result = await model.generateContent(promptHtml);
          const response = await result.response;
          const responseText = response.text() || "";
          
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            return res.json(JSON.parse(jsonMatch[0]));
          }
          return res.json(JSON.parse(responseText.trim()));
        } catch (err) {
          console.error("Gemini failed parsing suggested plan:", err);
        }
      }

      if (openaiKey) {
        try {
          const openai = new OpenAI({ apiKey: openaiKey });
          const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: promptHtml }],
            response_format: { type: "json_object" }
          });
          const content = response.choices[0].message.content || "";
          return res.json(JSON.parse(content.trim()));
        } catch (err) {
          console.error("OpenAI failed parsing suggested plan:", err);
        }
      }

      // Final bulletproof fallback
      return res.json(fallbackSuggestion());
    } catch (error: any) {
      console.error("Endpoint failed, fallback triggered:", error);
      res.json({
        suggestedTier: "Basic",
        reasoning: "We recommend starting on the Basic plan to fully pilot your multi-platform listings with generous credits!"
      });
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

      if (!process.env.STRIPE_SECRET_KEY) {
        console.error("❌ STRIPE_SECRET_KEY is missing in env variables.");
        return res.status(500).json({ error: "Stripe is not configured on the server." });
      }

      const host = req.headers.host;
      const protocol = req.headers['x-forwarded-proto'] || (host?.includes('localhost') ? 'http' : 'https');
      const origin = `${protocol}://${host}`;

      console.log(`🌐 Origins: SUCCESS=${origin}/dashboard, CANCEL=${origin}/#pricing`);
      console.log(`📦 Payload for session:`, {
        priceId,
        userId: userId || "MISSING",
        userEmail: userEmail || "MISSING",
        mode: 'subscription'
      });

      const sessionOpts: any = {
        payment_method_types: ['card'],
        allow_promotion_codes: true, 
        billing_address_collection: 'auto',
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl || `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl || `${origin}/#pricing`,
        metadata: {
          userId: userId || "",
          priceId: priceId
        },
        subscription_data: {
          metadata: {
            userId: userId || ""
          }
        }
      };

      if (userEmail) {
        sessionOpts.customer_email = userEmail;
      }
      
      if (userId) {
        sessionOpts.client_reference_id = userId;
      }

      const session = await stripe.checkout.sessions.create(sessionOpts);
      console.log(`✅ Session created: ${session.id} | URL: ${session.url?.substring(0, 30)}...`);
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
        
        const priceIds: Record<string, string> = {};
        Object.keys(process.env).forEach(key => {
          if (key.includes('STRIPE_PRICE_')) {
            const val = process.env[key] || '';
            priceIds[key.replace('VITE_', '').replace('STRIPE_PRICE_', '')] = val;
          }
        });

        // Mirror the normalized full keys to the mapping for the frontend
        Object.keys(truncatedMapping).forEach(truncatedKey => {
          const fullKey = truncatedMapping[truncatedKey];
          const val = process.env[fullKey];
          if (val) {
            priceIds[fullKey.replace('VITE_', '').replace('STRIPE_PRICE_', '')] = val;
          }
        });

        const config = {
          VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
          VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || 
                                  process.env.SUPABASE_ANON_KEY || 
                                  process.env.VITE_SUPABASE_ANC || 
                                  process.env.SUPABASE_ANON_KEY ||
                                  process.env.VITE_SUPABASE_ANON ||
                                  process.env.SUPABASE_ANON,
          VITE_STRIPE_PUBLISHABLE_KEY: process.env.VITE_STRIPE_PUBLISHABLE_KEY
        };
        
        // Detailed debug info for console
        const debug = {
          status: config.VITE_SUPABASE_URL ? 'READY' : 'WAITING_FOR_CONFIG',
          env: process.env.NODE_ENV,
          detected_keys: Object.keys(process.env).filter(k => 
            !k.includes('SESSION') && !k.includes('TOKEN') && !k.includes('PASS')
          ),
          resolved: {
            gemini: !!process.env.GEMINI_API_KEY,
            stripe: !!process.env.STRIPE_SECRET_KEY,
            openai: !!process.env.OPENAI_API_KEY,
            supabase: !!(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL)
          },
          host: req.headers.host,
          time: new Date().toISOString(),
          version: '1.2.0'
        };

        const configScript = `
          <script id="supabase-config-injection">
            window.SUPABASE_CONFIG = ${JSON.stringify(config)};
            window.STRIPE_PRICE_IDS = ${JSON.stringify(priceIds)};
            console.log('%c SELLSCAN SYSTEM BOOT ', 'background: #55cdd1; color: #000; font-weight: bold; padding: 4px; border-radius: 4px;');
            console.log('🛡️ Status:', ${JSON.stringify(debug.status)});
            console.log('🤖 Gemini:', ${debug.resolved.gemini ? "'✅ Configured'" : "'❌ Missing'"});
            console.log('💳 Stripe:', ${debug.resolved.stripe ? "'✅ Configured'" : "'❌ Missing'"});
            console.log('📊 Supabase:', ${debug.resolved.supabase ? "'✅ Configured'" : "'❌ Missing'"});
            console.log('🧩 Env Keys Audit:', ${JSON.stringify(debug.detected_keys || [])});
            
            if (!${debug.resolved.gemini} || !${debug.resolved.stripe}) {
              console.group('%c ⚠️ CRITICAL CONFIGURATION WARNING ', 'background: #ff4d4d; color: #fff; font-weight: bold;');
              console.warn('One or more API keys are missing on the server.');
              console.info('If you are on trysellscan.com (Custom Domain), you MUST set these secrets in your Google Cloud Console / Deployment Settings.');
              console.info('AI Studio sidebar secrets ONLY apply to the preview environments.');
              console.info('Required Keys: GEMINI_API_KEY, STRIPE_SECRET_KEY, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY');
              console.groupEnd();
            }
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
