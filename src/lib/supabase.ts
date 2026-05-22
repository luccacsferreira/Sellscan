import { createClient } from '@supabase/supabase-js';

// Configuration interface
export interface SupabaseConfig {
  url: string;
  anonKey: string;
  source: 'injected' | 'build-time' | 'late-fetch' | 'manual' | 'none';
}

const STORAGE_KEY = 'sellscan_manual_supabase_config';

/**
 * Resolves the Supabase configuration from multiple sources in priority order:
 * 1. window.SUPABASE_CONFIG (Injected by server at runtime)
 * 2. Manual configuration (Saved in localStorage)
 * 3. import.meta.env (Build-time variables - usually empty in AI Studio)
 */
const resolveConfig = (): SupabaseConfig => {
  // 1. Injected by Express server in index.html or env-config.js
  if (typeof window !== 'undefined' && (window as any).SUPABASE_CONFIG) {
    const c = (window as any).SUPABASE_CONFIG;
    const url = c.VITE_SUPABASE_URL || c.SUPABASE_URL;
    const key = c.VITE_SUPABASE_ANON_KEY || c.SUPABASE_ANON_KEY;
    if (url && key && !url.includes('placeholder') && url.trim() !== '') {
      return { url, anonKey: key, source: 'injected' };
    }
  }

  // 2. Manual backup (Developer fallback)
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.url && parsed.anonKey && !parsed.url.includes('placeholder')) {
          return { ...parsed, source: 'manual' };
        }
      }
    } catch (e) {}
  }

  // 3. Build-time variables
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (envUrl && !envUrl.includes('placeholder') && envUrl.trim() !== '') {
    return { url: envUrl, anonKey: envKey, source: 'build-time' };
  }

  return {
    url: 'https://placeholder-url.supabase.co',
    anonKey: 'placeholder-key',
    source: 'none'
  };
};

const config = resolveConfig();

// Late fetch helper (doesn't block export)
if (typeof window !== 'undefined' && config.source === 'none') {
  fetch('/api/config/supabase')
    .then(async (res) => {
      const isExpress = res.headers.get('X-Backend-Server') === 'AI-Studio-Express';
      
      if (!res.ok || !isExpress) {
        throw new Error(isExpress ? 'Config not found on server' : 'Static host detected (missing Express backend)');
      }
      return res.json();
    })
    .then(data => {
      if (data.url && data.anonKey && !data.url.includes('placeholder')) {
        console.log('🛡️ Late-fetch successful, persisting...');
        const newConfig = { url: data.url, anonKey: data.anonKey, source: 'late-fetch' };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
        
        // Refresh if not already refreshed
        const url = new URL(window.location.href);
        if (!url.searchParams.has('ref')) {
          url.searchParams.set('ref', Date.now().toString());
          window.location.href = url.toString();
        }
      }
    })
    .catch((e) => {
      console.warn(`🛡️ Config fetch failed: ${e.message}`);
      if (e.message.includes('Static host')) {
        console.info('💡 DIAGNOSIS: Your custom domain trysellscan.com is likely pointing to a static server (like GitHub Pages) instead of your Cloud Run instance.');
      }
    });
}

export const isSupabaseConfigured = config.source !== 'none';
export const getSupabaseConfig = () => config;

export const saveManualConfig = (url: string, key: string) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ url, anonKey: key, source: 'manual' }));
  window.location.reload();
};

export const clearManualConfig = () => {
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
};

export const getSupabaseDebugInfo = () => ({
  url: config.url,
  isConfigured: isSupabaseConfigured,
  source: config.source,
  hasInjectedConfig: typeof window !== 'undefined' && !!(window as any).SUPABASE_CONFIG,
  origin: typeof window !== 'undefined' ? window.location.origin : 'server'
});

export const supabase = createClient(
  config.url,
  config.anonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    }
  }
);
