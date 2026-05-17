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
    
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        return;
      }

      if (session?.user) {
        setUser(session.user);
        setStatus('success');
        
        // Wait a bit to show the nice "success" state before redirecting/messaging
        setTimeout(() => {
          if (window.opener) {
            window.opener.postMessage({ 
              type: 'SUPABASE_OAUTH_SUCCESS',
              user: {
                email: session.user.email,
                name: session.user.user_metadata?.full_name,
                avatar: session.user.user_metadata?.avatar_url
              }
            }, window.location.origin);
            setTimeout(() => window.close(), 100);
          } else {
            // If not in a popup, redirect to home
            window.location.href = '/';
          }
        }, 2000);
      } else {
        // If no session but we were redirected here, it might still be processing
        // Supabase usually handles this automatically on load if detectSessionInUrl is true
      }
    };

    // Listen for auth state change
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        setStatus('success');
        setTimeout(() => {
          if (window.opener) {
            window.opener.postMessage({ 
              type: 'SUPABASE_OAUTH_SUCCESS',
              user: {
                email: session.user.email,
                name: session.user.user_metadata?.full_name,
                avatar: session.user.user_metadata?.avatar_url
              }
            }, window.location.origin);
            setTimeout(() => window.close(), 100);
          } else {
            window.location.href = '/';
          }
        }, 2000);
      }
    });

    checkSession();
    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md glass-card p-10 bg-brand-bg border-brand-accent/20 text-center shadow-2xl relative overflow-hidden"
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
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div 
              key="success"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
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
                   <h2 className="text-3xl font-black tracking-tight leading-none">
                     {user?.user_metadata?.full_name?.split(' ')[0] || 'Welcome back'}!
                   </h2>
                   <p className="text-brand-accent font-bold text-sm tracking-wide uppercase opacity-80">Logging you in</p>
                </div>
                
                <div className="mt-4 px-4 py-2 rounded-full bg-white/5 border border-white/5 text-brand-text-muted text-[11px] font-bold">
                  {user?.email}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-center gap-3 text-brand-text-muted text-[10px] uppercase font-black tracking-[0.2em] opacity-40">
                <Loader2 className="w-3 h-3 animate-spin" />
                Finalizing redirection
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
              <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-10 h-10 text-red-500" />
              </div>
              <div>
                <h2 className="text-2xl font-black mb-2">Session Expired</h2>
                <p className="text-brand-text-muted mb-6">We couldn't verify your session. Please try signing in again.</p>
                <button 
                  onClick={() => window.location.href = '/'}
                  className="px-8 py-3 rounded-xl bg-brand-accent text-brand-bg font-bold"
                >
                  Return to Home
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
