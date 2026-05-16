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
  console.log('Supabase check:', { 
    url: supabaseUrl ? `${supabaseUrl.substring(0, 10)}...` : 'undefined',
    hasKey: !!supabaseAnonKey,
    isConfigured: isSupabaseConfigured
  });
  
  if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
    console.error('Supabase URL is missing or placeholder. Please check VITE_SUPABASE_URL in Secrets.');
  }
  if (!supabaseAnonKey || supabaseAnonKey.includes('placeholder')) {
    console.error('Supabase Anon Key is missing or placeholder. Please check VITE_SUPABASE_ANON_KEY in Secrets.');
  }
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
);
