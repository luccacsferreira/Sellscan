import { createClient } from '@supabase/supabase-js';

// For client-side, we use import.meta.env which requires VITE_ prefix
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

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
    isConfigured: isSupabaseConfigured
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
