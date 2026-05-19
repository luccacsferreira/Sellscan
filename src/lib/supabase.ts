import { createClient } from '@supabase/supabase-js';

// For client-side, we use import.meta.env which requires VITE_ prefix
// We also check window.SUPABASE_CONFIG which is injected by our server in production
const getSupabaseConfig = () => {
  // If we already have window.SUPABASE_CONFIG, use it
  if (typeof window !== 'undefined' && (window as any).SUPABASE_CONFIG) {
    const config = (window as any).SUPABASE_CONFIG;
    console.log('📡 Config found in window.SUPABASE_CONFIG:', { hasUrl: !!config.VITE_SUPABASE_URL });
    return {
      url: config.VITE_SUPABASE_URL || "",
      key: config.VITE_SUPABASE_ANON_KEY || ""
    };
  }

  const buildUrl = import.meta.env.VITE_SUPABASE_URL;
  const buildKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  console.log('📡 Using build-time config:', { hasUrl: !!buildUrl });

  // Fallback to build-time vars
  return { 
    url: buildUrl || "", 
    key: buildKey || "" 
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
  supabaseUrl || 'https://MISSING_SUPABASE_URL.supabase.co', 
  supabaseAnonKey || 'MISSING_ANON_KEY',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce' // Use PKCE for better security and frame handling
    }
  }
);
