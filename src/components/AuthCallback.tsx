import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, CheckCircle2, ShieldCheck, User as UserIcon } from 'lucide-react';
import { cn } from '../lib/utils';

export function AuthCallback() {
  const [status, setStatus] = useState<'authenticating' | 'success' | 'error'>('authenticating');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    console.log(`[AuthCallback] ${msg}`);
    setLogs(prev => [...prev.slice(-4), msg]);
  };

  useEffect(() => {
    addLog('Mounted: ' + window.location.hostname);
    
    // Safety timeout - if nothing happens in 15 seconds, show error with more info
    const timeout = setTimeout(() => {
      if (status === 'authenticating') {
        addLog('Authentication timed out');
        setStatus('error');
        setErrorMessage('The connection timed out while verifying your session. This might be due to a poor network connection or session expiry.');
      }
    }, 15000);

    const checkSession = async () => {
      try {
        addLog('Checking session status...');
        
        // 1. Check if we already have a session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (session?.user) {
          addLog('Session found for ' + session.user.email);
          handleSuccess(session.user);
          return;
        }

        if (error) {
          addLog('Session check error: ' + error.message);
        }

        // 2. Explicitly handle PKCE code exchange if found in URL
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        
        if (code) {
          addLog('Exchanging code...');
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            addLog('Exchange error: ' + exchangeError.message);
            // Don't set error immediately, wait for onAuthStateChange
          } else if (data.session?.user) {
            addLog('Exchange success!');
            handleSuccess(data.session.user);
            return;
          }
        } else {
          addLog('No code found in URL');
        }
        
      } catch (e: any) {
        addLog('Critical error: ' + e.message);
        setStatus('error');
        setErrorMessage(e.message);
      }
    };

    const handleSuccess = (user: User) => {
      addLog('Auth success: ' + user.email);
      setUser(user);
      setStatus('success');
      
      setTimeout(() => {
        if (window.opener) {
          addLog('Notifying parent window');
          window.opener.postMessage({ 
            type: 'SUPABASE_OAUTH_SUCCESS',
            user: {
              email: user.email,
              name: user.user_metadata?.full_name,
              avatar: user.user_metadata?.avatar_url
            }
          }, window.location.origin);
          
          setTimeout(() => {
            try { window.close(); } catch (e) { window.location.href = '/'; }
          }, 300);
        } else {
          addLog('Redirecting to home');
          window.location.href = '/';
        }
      }, 1500);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      addLog('Auth event: ' + event);
      if (session?.user) {
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

              <div className="bg-black/20 rounded-lg p-3 text-[10px] font-mono text-brand-text-muted text-left space-y-1">
                {logs.map((log, i) => (
                  <div key={i} className="truncate opacity-60">
                    {i === logs.length - 1 ? '> ' : '  '}{log}
                  </div>
                ))}
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
                  {errorMessage || "We synchronized your account but couldn't verify the session. This can happen if the link expired or was opened in a different browser."}
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <button 
                  onClick={() => window.location.reload()}
                  className="w-full py-4 rounded-xl bg-brand-accent text-brand-bg font-black uppercase tracking-widest text-sm"
                >
                  Retry Connection
                </button>
                <button 
                  onClick={() => window.location.href = '/'}
                  className="w-full py-3 rounded-xl border border-white/10 text-brand-text-muted font-bold text-xs"
                >
                  Return to Landing
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
