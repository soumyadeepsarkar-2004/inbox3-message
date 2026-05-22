import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Shield, ArrowRight, CheckCircle2, RefreshCw, ExternalLink, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'email' | 'wallet'>('email');
  const [isInitializing, setIsInitializing] = useState(false);
  const [initStep, setInitStep] = useState(0);
  const { loginWithEmail, connectWithGoogle, connectWithApple, loading } = useAuth();
  const navigate = useNavigate();

  const initializationSteps = [
    "Verifying cryptographic identity proof...",
    "Decrypting local session registers...",
    "Restoring on-chain mailbox structures..."
  ];

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsInitializing(true);
    setInitStep(0);
    try {
      await loginWithEmail(email, password);
      const interval = setInterval(() => {
        setInitStep((prev) => {
          if (prev >= initializationSteps.length - 1) {
            clearInterval(interval);
            setTimeout(() => navigate('/app'), 600);
            return prev;
          }
          return prev + 1;
        });
      }, 1200);
    } catch {
      setIsInitializing(false);
    }
  };

  const handleSocialAuth = async (provider: 'google' | 'apple') => {
    setIsInitializing(true);
    setInitStep(0);
    try {
      if (provider === 'google') await connectWithGoogle();
      else await connectWithApple();
      
      const interval = setInterval(() => {
        setInitStep((prev) => {
          if (prev >= initializationSteps.length - 1) {
            clearInterval(interval);
            setTimeout(() => navigate('/app'), 600);
            return prev;
          }
          return prev + 1;
        });
      }, 1200);
    } catch {
      setIsInitializing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0C0E] text-slate-100 font-sans relative overflow-hidden flex flex-col">
      
      <header className="w-full border-b border-white/[0.05] bg-[#0B0C0E]/80 backdrop-blur-md z-50 sticky top-0">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-[#FF5A00] to-[#FF7A00] flex items-center justify-center font-mono font-bold text-black text-lg shadow-[0_0_20px_rgba(255,90,0,0.2)]">
              in3
            </div>
            <span className="font-mono tracking-wider text-lg font-bold uppercase bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Inbox3
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Aptos Testnet
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 grid lg:grid-cols-12 gap-12 items-center py-12 z-10">
        
        <div className="lg:col-span-5 space-y-8 text-left">
          <div className="space-y-4">
            <span className="px-3 py-1 rounded-md bg-[#FF5A00]/10 border border-[#FF5A00]/20 text-[#FF5A00] font-mono text-xs uppercase tracking-widest font-semibold">
              Node Re-Authentication
            </span>
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              Welcome Back, Operator.
            </h1>
            <p className="text-slate-400 text-base leading-relaxed">
              Reconnect to your decentralized identity and pick up where you left off. Your sovereign messaging layer awaits.
            </p>
          </div>

          <div className="space-y-4 border-t border-white/[0.05] pt-6">
            <div className="flex gap-4 items-start">
              <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.05] text-[#FF5A00] mt-0.5">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-200">Session Integrity Verified</h3>
                <p className="text-xs text-slate-400 mt-0.5">All previous encryption keys and message registers remain intact.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.05] text-[#FF5A00] mt-0.5">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-200">Multi-Vector Authentication</h3>
                <p className="text-xs text-slate-400 mt-0.5">Sign in via email, social keyless, or native wallet extension.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 flex justify-center lg:justify-end">
          <div className="w-full max-w-xl bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 lg:p-8 backdrop-blur-xl shadow-[0_24px_60px_rgba(0,0,0,0.8)] relative">
            
            <AnimatePresence mode="wait">
              {!isInitializing ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="space-y-1.5">
                    <h2 className="text-xl font-bold text-white tracking-tight">Credential Verification</h2>
                    <p className="text-xs text-slate-400">Select your preferred authentication vector to restore session.</p>
                  </div>

                  <div className="grid grid-cols-2 p-1 bg-black/40 border border-white/[0.05] rounded-xl">
                    <button
                      onClick={() => setActiveTab('email')}
                      className={`py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                        activeTab === 'email' 
                          ? 'bg-gradient-to-r from-[#FF5A00] to-[#FF7A00] text-black shadow-lg font-bold' 
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Email / Social
                    </button>
                    <button
                      onClick={() => setActiveTab('wallet')}
                      className={`py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                        activeTab === 'wallet' 
                          ? 'bg-gradient-to-r from-[#FF5A00] to-[#FF7A00] text-black shadow-lg font-bold' 
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Wallet Extension
                    </button>
                  </div>

                  <div className="min-h-[200px] flex flex-col justify-center">
                    {activeTab === 'email' ? (
                      <div className="space-y-3 w-full">
                        <div className="grid grid-cols-2 gap-3">
                          <button 
                            onClick={() => handleSocialAuth('google')}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-[#FF5A00]/40 hover:bg-white/[0.05] transition-all duration-200 disabled:opacity-50"
                          >
                            <div className="h-4 w-4 flex items-center justify-center font-bold text-xs border border-white/20 rounded bg-white/5 text-white">G</div>
                            <span className="text-xs font-medium text-slate-200">Google</span>
                          </button>
                          <button 
                            onClick={() => handleSocialAuth('apple')}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-[#FF5A00]/40 hover:bg-white/[0.05] transition-all duration-200 disabled:opacity-50"
                          >
                            <div className="h-4 w-4 flex items-center justify-center font-bold text-xs border border-white/20 rounded bg-white/5 text-white">A</div>
                            <span className="text-xs font-medium text-slate-200">Apple</span>
                          </button>
                        </div>

                        <form onSubmit={handleEmailSubmit} className="space-y-3 pt-2">
                          <div>
                            <label className="text-xs font-mono text-slate-400 mb-1 block">Email Address</label>
                            <input
                              type="email"
                              placeholder="operator@inbox3.network"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl h-10 px-4 text-sm text-white placeholder:text-slate-600 focus:ring-1 focus:ring-[#FF5A00]/30 focus:border-[#FF5A00]/40 focus:outline-none transition-all"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-mono text-slate-400 mb-1 block">Passphrase</label>
                            <div className="relative">
                              <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl h-10 px-4 pr-10 text-sm text-white placeholder:text-slate-600 focus:ring-1 focus:ring-[#FF5A00]/30 focus:border-[#FF5A00]/40 focus:outline-none transition-all"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                              >
                                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                          <button
                            type="submit"
                            disabled={loading || !email || !password}
                            className="w-full h-11 bg-gradient-to-r from-[#FF5A00] to-[#FF7A00] text-black font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                          >
                            {loading ? (
                              <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                            ) : (
                              <>
                                Verify Identity
                                <ArrowRight className="w-3.5 h-3.5" />
                              </>
                            )}
                          </button>
                        </form>
                      </div>
                    ) : (
                      <div className="space-y-3 w-full">
                        <Link
                          to="/wallet"
                          className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-[#FF5A00]/40 hover:bg-[#FF5A00]/5 transition-all duration-200 group"
                        >
                          <div className="flex items-center gap-3">
                            <Wallet className="h-5 w-5 text-slate-400 group-hover:text-[#FF5A00]" />
                            <span className="text-sm font-medium text-slate-200">Connect Petra Extension</span>
                          </div>
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400">Detected</span>
                        </Link>

                        <Link
                          to="/wallet"
                          className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-[#FF5A00]/40 hover:bg-[#FF5A00]/5 transition-all duration-200 group opacity-60"
                        >
                          <div className="flex items-center gap-3">
                            <Wallet className="h-5 w-5 text-slate-400" />
                            <span className="text-sm font-medium text-slate-200">Connect Martian Adapter</span>
                          </div>
                          <ArrowRight className="h-4 w-4 text-slate-600" />
                        </Link>

                        <Link
                          to="/keyless"
                          className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-[#FF5A00]/40 hover:bg-[#FF5A00]/5 transition-all duration-200 group"
                        >
                          <div className="flex items-center gap-3">
                            <Shield className="h-5 w-5 text-slate-400 group-hover:text-[#FF5A00]" />
                            <span className="text-sm font-medium text-slate-200">Passkey / Biometric Auth</span>
                          </div>
                          <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-[#FF5A00] transition-colors" />
                        </Link>
                      </div>
                    )}
                  </div>

                  <div className="text-center">
                    <p className="text-[11px] text-slate-500 font-mono">
                      New operator?{' '}
                      <Link to="/signup" className="text-[#FF5A00] hover:text-[#FF7A00] transition-colors font-medium">
                        Initialize new node
                      </Link>
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="py-6 space-y-8 flex flex-col items-center text-center"
                >
                  <div className="relative flex items-center justify-center h-16 w-16">
                    <div className="absolute inset-0 rounded-full border-2 border-t-[#FF5A00] border-r-transparent border-b-transparent border-l-transparent animate-spin duration-700" />
                    <Shield className="h-6 w-6 text-[#FF5A00] animate-pulse" />
                  </div>

                  <div className="space-y-4 w-full max-w-sm">
                    <div className="space-y-1">
                      <h3 className="text-md font-semibold text-white">Restoring Session Context</h3>
                      <p className="text-xs text-slate-400 font-mono tracking-tight">Verifying credentials and decrypting local registers...</p>
                    </div>

                    <div className="space-y-2.5 text-left border border-white/[0.04] bg-black/30 rounded-xl p-4 font-mono text-[11px]">
                      {initializationSteps.map((step, idx) => (
                        <div key={idx} className="flex items-center gap-2.5">
                          {initStep > idx ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          ) : initStep === idx ? (
                            <RefreshCw className="h-3.5 w-3.5 text-[#FF5A00] animate-spin shrink-0" />
                          ) : (
                            <div className="h-3.5 w-3.5 rounded-full border border-white/20 shrink-0" />
                          )}
                          <span className={initStep === idx ? 'text-[#FF5A00]' : initStep > idx ? 'text-slate-300' : 'text-slate-600'}>
                            {step}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </main>

      <footer className="w-full border-t border-white/[0.04] bg-black/20 py-4 z-10 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-[10px] text-slate-500">
          <div>© 2026 Inbox3 Protocol. All sovereign rights reserved.</div>
          <div className="flex gap-6">
            <a href="#explorer" className="hover:text-slate-300 transition-colors flex items-center gap-1">Contract Explorer <ExternalLink className="h-3 w-3" /></a>
            <a href="#docs" className="hover:text-slate-300 transition-colors">Technical Architecture Specification</a>
          </div>
        </div>
      </footer>

    </div>
  )
}
