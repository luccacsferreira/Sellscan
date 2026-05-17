import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, CheckCircle2, ShieldCheck, User as UserIcon } from 'lucide-react';
import { cn } from '../lib/utils';

export function AuthCallback() {
  const [status, setStatus] = useState<'authenticating' | 'success' | 'error'>('authenticating');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // This component captures the Supabase session details from the hash/URL
    console.log('AuthCallback mounted', window.location.href);
    
    // Safety timeout - if nothing happens in 20 seconds, show error
    const timeout = setTimeout(() => {
      if (status === 'authenticating') {
        console.warn('Authentication timed out after 20s');
        setStatus('error');
      }
    }, 20000);

    const checkSession = async () => {
      try {
        console.log('Checking Supabase session... (Runtime Info)', { 
          host: window.location.hostname, 
          href: window.location.href,
          hasBaseUrl: !!supabase.auth,
          configInjected: !!(window as any).SUPABASE_CONFIG
        });
        
        // 1. Check if we already have a session
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('Session check result:', { 
          hasSession: !!session, 
          user: session?.user?.email,
          error 
        });
        
        if (session?.user) {
          handleSuccess(session.user);
          return;
        }

        // 2. Explicitly handle PKCE code exchange if found in URL
        // Supabase usually does this, but explicit call is more reliable on secondary domains
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        
        if (code) {
          console.log('Explicit PKCE code exchange for:', code.substring(0, 10) + '...');
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            console.error('PKCE Exchange Error:', exchangeError);
            // Don't set error immediately, give onAuthStateChange a chance
          } else if (data.session?.user) {
            console.log('PKCE Exchange Success via manual trigger!');
            handleSuccess(data.session.user);
            return;
          }
        }
        
        if (error && !code) {
          console.error('Auth callback getSession error:', error);
          setStatus('error');
        }
      } catch (e) {
        console.error('Unexpected error in checkSession:', e);
        setStatus('error');
      }
    };

    const handleSuccess = (user: User) => {
      console.log('Authentication successful for:', user.email);
      setUser(user);
      setStatus('success');
      
      // Wait a bit to show the nice "success" state
      setTimeout(() => {
        if (window.opener) {
          console.log('Signaling window.opener and closing popup');
          window.opener.postMessage({ 
            type: 'SUPABASE_OAUTH_SUCCESS',
            user: {
              email: user.email,
              name: user.user_metadata?.full_name,
              avatar: user.user_metadata?.avatar_url
            }
          }, window.location.origin);
          
          // Close after a tiny delay to ensure message is sent
          setTimeout(() => {
            try {
              window.close();
            } catch (e) {
              console.warn('Failed to close window, redirecting instead:', e);
              window.location.href = '/';
            }
          }, 200);
        } else {
          console.log('No window.opener found, redirecting to home');
          window.location.href = '/';
        }
      }, 1500);
    };

    // Listen for auth state change - this is often more reliable than getSession for OAuth callbacks
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, { hasSession: !!session });
      if (event === 'SIGNED_IN' && session?.user) {
        handleSuccess(session.user);
      }
    });

    checkSession();
    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="fixed inset-0 min-h-screen bg-brand-bg flex items-center justify-center p-6 z-[9999]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md glass-card p-10 bg-brand-bg border-brand-accent/20 text-center shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
      >
        {/* Background glow */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-accent to-transparent opacity-50" />
        
        <AnimatePresence mode="wait">
          {status === 'authenticating' && (
            <motion.div 
              key="authenticating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="relative mx-auto w-20 h-20">
                <div className="absolute inset-0 rounded-full border-4 border-brand-accent/10" />
                <div className="absolute inset-0 rounded-full border-4 border-brand-accent border-t-transparent animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <ShieldCheck className="w-8 h-8 text-brand-accent/50" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-black italic tracking-tight mb-2">Verifying Identity</h2>
                <p className="text-brand-text-muted text-sm font-medium">Securing your Sellscan account access...</p>
              </div>
              
              <div className="text-[10px] uppercase font-black tracking-widest text-brand-text-muted opacity-30 pt-4">
                Origin: {window.location.hostname}
              </div>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              <div className="flex flex-col items-center">
                <motion.div 
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', damping: 12 }}
                  className="relative mb-6"
                >
                  <div className="w-24 h-24 rounded-full border-4 border-brand-accent p-1.5 shadow-[0_0_30px_rgba(85,205,209,0.3)] bg-brand-bg overflow-hidden">
                    {user?.user_metadata?.avatar_url ? (
                      <img 
                        src={user.user_metadata.avatar_url} 
                        alt="Profile" 
                        referrerPolicy="no-referrer"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-brand-accent/10 flex items-center justify-center">
                        <UserIcon className="w-10 h-10 text-brand-accent" />
                      </div>
                    )}
                  </div>
                  <motion.div 
                    initial={{ scale: 0, x: 20 }}
                    animate={{ scale: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="absolute -bottom-1 -right-1 bg-brand-bg rounded-full p-1 border border-brand-border"
                  >
                    <div className="bg-green-500 rounded-full p-1">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                  </motion.div>
                </motion.div>

                <div className="space-y-1">
                   <h2 className="text-3xl font-black tracking-tight leading-none italic">
                     {user?.user_metadata?.full_name?.split(' ')[0] || 'Welcome back'}!
                   </h2>
                   <p className="text-brand-accent font-black text-xs tracking-[0.2em] uppercase mt-2">Authenticated Successfully</p>
                </div>
                
                <div className="mt-6 px-4 py-2 rounded-full bg-black/40 border border-white/5 text-brand-text-muted text-[11px] font-bold">
                  {user?.email}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-center gap-3 text-brand-text-muted text-[10px] uppercase font-black tracking-[0.2em] opacity-40">
                <Loader2 className="w-3 h-3 animate-spin" />
                Returning to Application
              </div>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div 
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-10 h-10 text-red-500" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black mb-1 italic">Verification Failed</h2>
                <p className="text-brand-text-muted text-sm leading-relaxed">
                  We synchronized your account but couldn't verify the session. This can happen if the link expired or was opened in a different browser.
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <button 
                  onClick={() => window.location.href = '/'}
                  className="w-full py-4 rounded-xl bg-brand-accent text-brand-bg font-black uppercase tracking-widest text-sm"
                >
                  Try Again
                </button>
                <button 
                  onClick={() => {
                     // Last resort: signal success anyway if we think we might have a session
                     if (window.opener) {
                       window.opener.postMessage({ type: 'SUPABASE_OAUTH_SUCCESS' }, window.location.origin);
                       window.close();
                     } else {
                       window.location.href = '/';
                     }
                  }}
                  className="w-full py-3 rounded-xl border border-white/10 text-brand-text-muted font-bold text-xs"
                >
                  I'm already logged in
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
