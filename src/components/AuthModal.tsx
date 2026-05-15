import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { X, Mail, Lock, Loader2, Sparkles, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { cn } from '../lib/utils';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [useMagicLink, setUseMagicLink] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMagicLink = async () => {
    if (!email) {
      setError("Please enter your email first.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        }
      });
      if (error) throw error;
      setError("Magic link sent! Check your inbox.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) {
      setError("Supabase configuration is missing. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your project secrets.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (error.message.includes('Email not confirmed')) {
            throw new Error("Please confirm your email. Check your inbox for the link!");
          }
          throw error;
        }
        onSuccess(data.user);
      } else {
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            emailRedirectTo: window.location.origin,
          }
        });
        if (error) throw error;
        
        if (data.user && data.session) {
          // Auto-login if confirmation is off
          onSuccess(data.user);
          onClose();
        } else {
          setError("Confirmation email sent! Please check your inbox to activate your account.");
        }
        return;
      }
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-brand-bg/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md glass-card p-8 bg-brand-card/90"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-brand-text-muted hover:text-brand-text transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-8">
              <div className="inline-flex w-12 h-12 items-center justify-center rounded-xl bg-brand-accent/20 text-brand-accent mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black tracking-tight mb-2">
                {isLogin ? 'Welcome back' : 'Start your journey'}
              </h2>
              <p className="text-sm text-brand-text-muted">
                {isLogin ? 'Login to access your scans and pro features.' : 'Create an account to start scanning like a pro.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className={cn(
                  "p-3 rounded-lg flex items-start gap-3 text-xs font-medium",
                  error.includes('confirmation') || error.includes('link sent') ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                )}>
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-brand-text-muted tracking-widest px-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-brand-accent transition-colors"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              {!useMagicLink && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-brand-text-muted tracking-widest px-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-12 text-sm focus:outline-none focus:border-brand-accent transition-colors"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-text-muted hover:text-brand-accent transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              <button
                disabled={isLoading}
                type={useMagicLink ? "button" : "submit"}
                onClick={useMagicLink ? handleMagicLink : undefined}
                className="w-full py-4 bg-brand-accent text-brand-bg rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-brand-accent/20 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  useMagicLink ? 'Send Magic Link' : (isLogin ? 'Sign In' : 'Sign Up')
                )}
              </button>
            </form>

            <div className="mt-6 flex flex-col items-center gap-4">
              {isLogin && (
                <button
                  type="button"
                  onClick={() => {
                    setUseMagicLink(!useMagicLink);
                    setError(null);
                  }}
                  className="text-xs text-brand-accent/80 hover:text-brand-accent hover:underline transition-all"
                >
                  {useMagicLink ? "Use email & password instead" : "Sign in with Magic Link"}
                </button>
              )}

              <div className="w-full flex items-center gap-4 py-2">
                <div className="h-px bg-white/5 flex-grow" />
                <span className="text-[10px] text-white/20 uppercase font-black tracking-widest">OR</span>
                <div className="h-px bg-white/5 flex-grow" />
              </div>

              <div className="flex gap-4 w-full">
                <button 
                  onClick={async () => {
                    setError(null);
                    const { data, error } = await supabase.auth.signInWithOAuth({
                      provider: 'google',
                      options: {
                        redirectTo: window.location.origin,
                        skipBrowserRedirect: true
                      }
                    });
                    
                    if (error) {
                      setError(error.message);
                      return;
                    }

                    if (data?.url) {
                      // Open Google's OAuth URL in a new window/popup
                      window.open(data.url, '_blank', 'width=600,height=700');
                    }
                  }}
                  className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all text-xs font-bold"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Google
                </button>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 text-center px-2">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setUseMagicLink(false);
                  setError(null);
                }}
                className="text-xs text-brand-text-muted hover:text-brand-accent transition-colors"
              >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
