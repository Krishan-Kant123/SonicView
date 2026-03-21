"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Please enter email and password");
    
    try {
      setLoading(true);
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success("Check your email for the confirmation link!");
        onClose();
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Successfully logged in!");
        onClose();
      }
    } catch (error: any) {
      console.error('Auth error:', error.message);
      toast.error(error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-sm p-8 rounded-[2rem] shadow-2xl obsidian-glass relative overflow-hidden border border-white/10"
          style={{ background: 'var(--surface-container)' }}
        >
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full" />
          
          <div className="flex justify-between items-start mb-8 relative z-10">
            <div>
              <h2 className="text-2xl font-black tracking-tight" style={{ color: 'var(--on-surface)' }}>
                {isSignUp ? "Create Account" : "Sign In"}
              </h2>
              <p className="text-xs mt-2 font-medium" style={{ color: 'var(--on-surface-variant)' }}>
                Sync your Playlists & API Key securely.
              </p>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    style={{ color: 'var(--on-surface-variant)' }}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleAuth} className="relative z-10 space-y-4">
            <div className="space-y-3">
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4 text-outline transition-colors group-focus-within:text-primary" />
                </div>
                <input 
                  type="email" required placeholder="Email address"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 pl-12 pr-4 bg-surface-container-low border border-white/5 rounded-xl text-sm text-on-surface placeholder:text-outline/40 focus:ring-1 focus:ring-primary/50 outline-none"
                />
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-outline transition-colors group-focus-within:text-primary" />
                </div>
                <input 
                  type="password" required placeholder="Password"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 pl-12 pr-4 bg-surface-container-low border border-white/5 rounded-xl text-sm text-on-surface placeholder:text-outline/40 focus:ring-1 focus:ring-primary/50 outline-none"
                />
              </div>
            </div>

            <button 
              type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold transition-all disabled:opacity-50 hover:opacity-90 shadow-lg active:scale-95 mt-2"
              style={{ background: 'var(--on-surface)', color: 'var(--surface-container-high)', boxShadow: '0 4px 15px rgba(255,255,255,0.05)' }}
            >
              {loading ? 'Authenticating...' : (isSignUp ? 'Sign Up' : 'Sign In')}
            </button>

            <button type="button" onClick={() => setIsSignUp(!isSignUp)}
                    className="w-full mt-2 text-xs font-bold hover:underline"
                    style={{ color: 'var(--on-surface-variant)' }}>
              {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
            </button>
          </form>
          
          <div className="mt-6 text-center text-[10px] font-medium tracking-widest uppercase relative z-10" style={{ color: 'var(--primary)' }}>
             End-to-End Encrypted Storage
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
