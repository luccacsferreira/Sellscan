import { createClient } from '@supabase/supabase-js';

// For client-side, we use import.meta.env which requires VITE_ prefix
// We also check window.SUPABASE_CONFIG which is injected by our server in production
const getSupabaseConfig = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // 1. Check for window.SUPABASE_CONFIG (Injected by server at runtime)
  if (typeof window !== 'undefined' && (window as any).SUPABASE_CONFIG) {
    const config = (window as any).SUPABASE_CONFIG;
    const injectedUrl = config.VITE_SUPABASE_URL;
    const injectedKey = config.VITE_SUPABASE_ANON_KEY;

    if (injectedUrl && injectedKey && !injectedUrl.includes('placeholder') && !injectedUrl.includes('undefined')) {
      console.log('🛡️ Using runtime Supabase config');
      return { url: injectedUrl, key: injectedKey };
    }
    console.warn('🛡️ Injected config found but invalid, falling back...');
  }

  // 2. Fallback to build-time vars (Hardcoded in bundle)
  if (envUrl && !envUrl.includes('placeholder') && envUrl.trim() !== '') {
    console.log('🛡️ Using build-time Supabase URL');
    return { url: envUrl, key: envKey };
  }
  
  console.error('🛡️ CRITICAL: No Supabase config found! This app will fail auth.');
  return { 
    url: envUrl || 'https://placeholder-url.supabase.co', 
    key: envKey || 'placeholder-key' 
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
