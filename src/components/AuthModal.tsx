import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { X, Mail, Lock, Loader2, Sparkles, AlertCircle, Eye, EyeOff, Wand2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

type AuthMode = 'login' | 'signup' | 'magic-link';

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      // Use popup flow for Google Login in AI Studio preview
      // This avoids the 403 X-Frame-Options error
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          skipBrowserRedirect: true // CRITICAL: Gives us the URL to open in popup
        }
      });

      if (error) throw error;
      
      if (data?.url) {
        // Open authorization URL in a popup
        const width = 600;
        const height = 700;
        const left = window.screenX + (window.innerWidth - width) / 2;
        const top = window.screenY + (window.innerHeight - height) / 2;
        
        window.open(
          data.url, 
          'supabase_oauth_popup', 
          `width=${width},height=${height},left=${left},top=${top}`
        );
      }
    } catch (err: any) {
      console.error('Google OAuth Error:', err);
      setError({ message: err.message, type: 'error' });
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError({ message: "Please enter your email.", type: 'error' });
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
      setError({ message: "✨ Magic link sent! Check your inbox.", type: 'success' });
    } catch (err: any) {
      setError({ message: err.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) onSuccess(data.user);
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
          onSuccess(data.user);
        } else {
          setError({ message: "📧 Confirmation email sent! Please check your inbox.", type: 'success' });
        }
      }
    } catch (err: any) {
      setError({ message: err.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-brand-bg/90 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            className="relative w-full max-w-md glass-card bg-brand-card/90 overflow-hidden border-brand-accent/20"
          >
            {/* Header Tabs */}
            <div className="flex border-b border-white/5">
              {(['login', 'signup', 'magic-link'] as AuthMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setMode(m);
                    setError(null);
                  }}
                  className={cn(
                    "flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative",
                    mode === m ? "text-brand-accent bg-white/5" : "text-brand-text-muted hover:text-brand-text"
                  )}
                >
                  {m.replace('-', ' ')}
                  {mode === m && (
                    <motion.div 
                      layoutId="activeAuthTab"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-accent shadow-[0_0_10px_rgba(85,205,209,0.5)]" 
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="p-8">
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-brand-text-muted hover:text-brand-text transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-8">
                <div className="inline-flex w-14 h-14 items-center justify-center rounded-2xl bg-brand-accent/20 text-brand-accent mb-4 shadow-[0_0_20px_rgba(85,205,209,0.2)]">
                  {mode === 'magic-link' ? <Wand2 className="w-7 h-7" /> : <Sparkles className="w-7 h-7" />}
                </div>
                <h2 className="text-2xl font-black tracking-tight mb-2">
                  {mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Start your journey' : 'Instant Login'}
                </h2>
                <p className="text-sm text-brand-text-muted">
                  {mode === 'login' 
                    ? 'Log in to access your dashboard' 
                    : mode === 'signup' 
                      ? 'Create a free account to get started' 
                      : 'No password needed. Simple and secure.'}
                </p>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "mb-6 p-4 rounded-xl flex items-start gap-3 text-xs font-bold leading-relaxed",
                    error.type === 'success' 
                      ? "bg-green-500/10 text-green-400 border border-green-500/20" 
                      : "bg-red-500/10 text-red-400 border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]"
                  )}
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error.message}</span>
                </motion.div>
              )}

              <form onSubmit={mode === 'magic-link' ? handleMagicLink : handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-brand-text-muted tracking-widest px-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted group-focus-within:text-brand-accent transition-colors" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:border-brand-accent/50 focus:bg-white/10 transition-all font-medium"
                      placeholder="name@example.com"
                    />
                  </div>
                </div>

                {mode !== 'magic-link' && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[10px] font-black uppercase text-brand-text-muted tracking-widest">Password</label>
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted group-focus-within:text-brand-accent transition-colors" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-12 text-sm focus:outline-none focus:border-brand-accent/50 focus:bg-white/10 transition-all font-medium"
                        placeholder="••••••••"
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-text-muted hover:text-brand-accent transition-colors p-1"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                <button
                  disabled={isLoading}
                  type="submit"
                  className="w-full py-4 bg-brand-accent text-brand-bg rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-brand-accent/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      {mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Magic Link'}
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 flex flex-col items-center gap-6">
                <div className="w-full flex items-center gap-4">
                  <div className="h-px bg-white/5 flex-grow" />
                  <span className="text-[10px] text-white/20 uppercase font-black tracking-widest px-2">Or Continue with</span>
                  <div className="h-px bg-white/5 flex-grow" />
                </div>

                <button 
                  onClick={handleGoogleLogin}
                  className="w-full py-3.5 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all text-xs font-bold active:scale-[0.98] group"
                >
                  <svg className="w-4 h-4 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Google Account
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
