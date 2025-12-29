
import React, { useState } from 'react';
import { motion as motionBase } from 'framer-motion';
import { Lock, Mail, ArrowRight } from 'lucide-react';

// Fix for framer-motion type mismatch in the current environment
const motion = motionBase as any;

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate login delay
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess();
    }, 1200);
  };

  return (
    <section className="min-h-[80vh] flex items-center justify-center px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white p-12 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-black/5"
      >
        <div className="text-center mb-12">
          <h2 className="text-5xl font-gothic mb-4">Admin Entrance.</h2>
          <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Authorized Access Only</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="relative border-b border-black/10 focus-within:border-black transition-colors py-2">
            <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              required
              type="email" 
              placeholder="EMAIL ADDRESS" 
              className="w-full bg-transparent pl-8 text-[11px] font-mono outline-none uppercase tracking-widest"
            />
          </div>

          <div className="relative border-b border-black/10 focus-within:border-black transition-colors py-2">
            <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              required
              type="password" 
              placeholder="SECURE PASSWORD" 
              className="w-full bg-transparent pl-8 text-[11px] font-mono outline-none uppercase tracking-widest"
            />
          </div>

          <button 
            disabled={loading}
            className="w-full py-4 bg-black text-white text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center space-x-3 hover:bg-zinc-800 transition-all disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-pulse">Authenticating...</span>
            ) : (
              <>
                <span>Enter Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-12 text-center">
          <button className="text-[9px] font-mono text-zinc-400 hover:text-black transition-colors uppercase tracking-widest">
            Forgot Credentials?
          </button>
        </div>
      </motion.div>
    </section>
  );
};

export default Login;
