import { createClient } from '@supabase/supabase-js';

// For client-side, we use import.meta.env which requires VITE_ prefix
// We also check window.SUPABASE_CONFIG which is injected by our server in production
const getSupabaseConfig = () => {
  // 1. Check for window.SUPABASE_CONFIG (Injected by server at runtime in production)
  if (typeof window !== 'undefined') {
    const config = (window as any).SUPABASE_CONFIG;
    if (config) {
      const url = config.VITE_SUPABASE_URL || config.SUPABASE_URL;
      const key = config.VITE_SUPABASE_ANON_KEY || config.SUPABASE_ANON_KEY;

      if (url && key && !url.includes('placeholder') && url.trim() !== '') {
        console.log('🛡️ Using runtime Supabase config from server');
        return { url, key };
      }
      console.warn('🛡️ window.SUPABASE_CONFIG found but is invalid:', config);
    }
  }

  // 2. Fallback to build-time vars (from .env at build time)
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (envUrl && !envUrl.includes('placeholder') && envUrl.trim() !== '') {
    console.log('🛡️ Using build-time Supabase config');
    return { url: envUrl, key: envKey };
  }
  
  // 3. Last resort: Try to fetch configuration from the server-side proxy asynchronously
  // This helps if index.html was cached without injection
  if (typeof window !== 'undefined') {
    fetch('/api/config/supabase')
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Failed to fetch');
      })
      .then(data => {
        if (data.url && data.anonKey && !data.url.includes('placeholder')) {
          console.log('🛡️ Late-fetch successful, updating and reloading...');
          (window as any).SUPABASE_CONFIG = {
            VITE_SUPABASE_URL: data.url,
            VITE_SUPABASE_ANON_KEY: data.anonKey
          };
          
          const url = new URL(window.location.href);
          if (!url.searchParams.has('config_refreshed')) {
            url.searchParams.set('config_refreshed', 'true');
            window.location.href = url.toString();
          }
        }
      })
      .catch(e => console.error('🛡️ Failed to late-fetch Supabase config:', e));
  }

  console.error('🛡️ NO VALID SUPABASE CONFIG FOUND');
  return { 
    url: 'https://placeholder-url.supabase.co', 
    key: 'placeholder-key' 
  };
};

const { url: supabaseUrl, key: supabaseAnonKey } = getSupabaseConfig();

// Check if variables exist and are not placeholders
export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('placeholder') && 
  supabaseUrl.trim() !== ''
);

export const getSupabaseDebugInfo = () => ({
  url: supabaseUrl,
  isConfigured: isSupabaseConfigured,
  hasInjectedConfig: typeof window !== 'undefined' && !!(window as any).SUPABASE_CONFIG,
  buildTimeUrl: import.meta.env.VITE_SUPABASE_URL,
  origin: typeof window !== 'undefined' ? window.location.origin : 'server'
});

if (typeof window !== 'undefined') {
  // Enhanced debugging for the user
  const check = { 
    url: supabaseUrl ? (supabaseUrl.includes('placeholder') ? 'PLACEHOLDER' : 'SET') : 'MISSING',
    hasKey: !!supabaseAnonKey && !supabaseAnonKey.includes('placeholder'),
    isConfigured: isSupabaseConfigured,
    injected: !!(window as any).SUPABASE_CONFIG
  };
  
  if (!isSupabaseConfigured) {
    console.group('🛡️ Supabase Config Status');
    console.warn('Supabase is not fully configured.');
    console.table(check);
    console.info('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in AI Studio Secrets.');
    console.groupEnd();
  }
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co', 
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce' // Use PKCE for better security and frame handling
    }
  }
);
