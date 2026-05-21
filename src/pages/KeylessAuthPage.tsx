import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Shield, CheckCircle2, RefreshCw, ExternalLink } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from 'sonner'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.22 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  )
}

export default function KeylessAuthPage() {
  const { connectWithGoogle, connectWithApple, connectWithPasskey, loading } = useAuth()
  const [activeMethod, setActiveMethod] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)
  const [initStep, setInitStep] = useState(0)
  const navigate = useNavigate()

  const initializationSteps = [
    'Redirecting to OAuth provider...',
    'Deriving cryptographic identity from JWT...',
    'Mapping keyless account to Aptos address...'
  ]

  const handleGoogle = async () => {
    setActiveMethod('Google')
    setIsInitializing(true)
    setInitStep(0)
    try {
      await connectWithGoogle()
      const interval = setInterval(() => {
        setInitStep((prev) => {
          if (prev >= initializationSteps.length - 1) {
            clearInterval(interval)
            setTimeout(() => navigate('/profile'), 600)
            return prev
          }
          return prev + 1
        })
      }, 1200)
    } catch {
      toast.error('Google sign-in cancelled')
      setIsInitializing(false)
      setActiveMethod(null)
    }
  }

  const handleApple = async () => {
    setActiveMethod('Apple')
    setIsInitializing(true)
    setInitStep(0)
    try {
      await connectWithApple()
      const interval = setInterval(() => {
        setInitStep((prev) => {
          if (prev >= initializationSteps.length - 1) {
            clearInterval(interval)
            setTimeout(() => navigate('/profile'), 600)
            return prev
          }
          return prev + 1
        })
      }, 1200)
    } catch {
      toast.error('Apple sign-in cancelled')
      setIsInitializing(false)
      setActiveMethod(null)
    }
  }

  const handlePasskey = async () => {
    setActiveMethod('Passkey')
    setIsInitializing(true)
    setInitStep(0)
    try {
      await connectWithPasskey()
      const interval = setInterval(() => {
        setInitStep((prev) => {
          if (prev >= initializationSteps.length - 1) {
            clearInterval(interval)
            setTimeout(() => navigate('/profile'), 600)
            return prev
          }
          return prev + 1
        })
      }, 1200)
    } catch {
      toast.error('Passkey creation cancelled')
      setIsInitializing(false)
      setActiveMethod(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0C0E] text-slate-100 font-sans relative overflow-hidden flex flex-col">

      {/* Global Header Line */}
      <header className="w-full border-b border-white/[0.05] bg-[#0B0C0E]/80 backdrop-blur-md z-50 sticky top-0">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/login" className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-[#A855F7] to-[#FF6B35] flex items-center justify-center font-mono font-bold text-black text-lg shadow-[0_0_20px_rgba(168,85,247,0.2)]">
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

      {/* Main Core Layout Split Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 grid lg:grid-cols-12 gap-12 items-center py-12 z-10">

        {/* Pane A: Brand Value Anchor */}
        <div className="lg:col-span-5 space-y-8 text-left">
          <div className="space-y-4">
            <span className="px-3 py-1 rounded-md bg-[#FF5A00]/10 border border-[#FF5A00]/20 text-[#FF5A00] font-mono text-xs uppercase tracking-widest font-semibold">
              Keyless Authentication
            </span>
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              No Keys. No Seeds. Just Identity.
            </h1>
            <p className="text-slate-400 text-base leading-relaxed">
              Use your existing Google or Apple account, or create a secure passkey. Aptos Keyless derives your cryptographic identity directly from OAuth tokens—no private key management required.
            </p>
          </div>

          <div className="space-y-4 border-t border-white/[0.05] pt-6">
            <div className="flex gap-4 items-start">
              <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.05] text-[#FF5A00] mt-0.5">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-200">Zero-Key Management</h3>
                <p className="text-xs text-slate-400 mt-0.5">No seed phrases to lose. Your OAuth token maps directly to an Aptos address.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.05] text-[#FF6B35] mt-0.5">
                <ArrowRight className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-200">Biometric Passkeys</h3>
                <p className="text-xs text-slate-400 mt-0.5">WebAuthn-based authentication using your device fingerprint or face ID.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pane B: Clean Glassmorphic Auth Options */}
        <div className="lg:col-span-7 flex justify-center lg:justify-end">
          <div className="w-full max-w-xl bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 lg:p-8 backdrop-blur-xl shadow-[0_24px_60px_rgba(0,0,0,0.8)] relative">

            <AnimatePresence mode="wait">
              {isInitializing ? (
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
                      <h3 className="text-md font-semibold text-white">Authenticating via {activeMethod}</h3>
                      <p className="text-xs text-slate-400 font-mono tracking-tight">Deriving cryptographic identity from provider...</p>
                    </div>

                    <div className="space-y-2.5 text-left border border-white/[0.04] bg-black/30 rounded-xl p-4 font-mono text-[11px]">
                      {initializationSteps.map((step, idx) => (
                        <div key={idx} className="flex items-center gap-2.5">
                          {initStep > idx ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          ) : initStep === idx ? (
                            <RefreshCw className="h-3.5 w-3.5 text-[#A855F7] animate-spin shrink-0" />
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
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="space-y-1.5">
                    <h2 className="text-xl font-bold text-white tracking-tight">Passwordless Entry Point</h2>
                    <p className="text-xs text-slate-400">Select your preferred authentication method for keyless identity derivation.</p>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={handleGoogle}
                      disabled={loading}
                      className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-[#A855F7]/40 hover:bg-white/[0.05] transition-all duration-200 group disabled:opacity-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center">
                          <GoogleIcon />
                        </div>
                        <div className="text-left">
                          <span className="text-sm font-medium text-slate-200">Continue with Google</span>
                          <p className="text-[10px] text-slate-500 mt-0.5">Aptos Keyless OAuth derivation</p>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-[#A855F7] transition-colors" />
                    </button>

                    <button
                      onClick={handleApple}
                      disabled={loading}
                      className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-[#A855F7]/40 hover:bg-white/[0.05] transition-all duration-200 group disabled:opacity-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center">
                          <AppleIcon />
                        </div>
                        <div className="text-left">
                          <span className="text-sm font-medium text-slate-200">Continue with Apple</span>
                          <p className="text-[10px] text-slate-500 mt-0.5">Aptos Keyless OAuth derivation</p>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-[#A855F7] transition-colors" />
                    </button>

                    <div className="relative py-3">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10" />
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="bg-[#0B0C0E] px-3 text-slate-500 font-mono text-[10px] uppercase tracking-widest">Alternative</span>
                      </div>
                    </div>

                    <button
                      onClick={handlePasskey}
                      disabled={loading}
                      className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-[#A855F7]/40 hover:bg-[#A855F7]/5 transition-all duration-200 group disabled:opacity-50"
                    >
                      <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-[#FF5A00]/20 to-[#FF7A00]/20 border border-white/[0.05] flex items-center justify-center">
                              <Shield className="h-4 w-4 text-[#FF5A00]" />
                            </div>
                        <div className="text-left">
                          <span className="text-sm font-medium text-slate-200">Create Passkey</span>
                          <p className="text-[10px] text-slate-500 mt-0.5">WebAuthn biometric authentication</p>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-[#A855F7] transition-colors" />
                    </button>
                  </div>

                  <div className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl">
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      <span className="text-slate-300 font-medium">Aptos Keyless</span> derives your on-chain identity from OAuth tokens. No private keys are stored or managed—your cryptographic proof is generated per-session.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </main>

      {/* Structured Footer Anchor */}
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
