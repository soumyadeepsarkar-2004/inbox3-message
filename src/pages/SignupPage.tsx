import { useState } from 'react'
import { Shield, ArrowRight, CheckCircle2, RefreshCw, ExternalLink, Eye, EyeOff } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isInitializing, setIsInitializing] = useState(false)
  const [initStep, setInitStep] = useState(0)
  const { signupWithEmail, connectWithGoogle, connectWithApple, loading } = useAuth()
  const navigate = useNavigate()

  const initializationSteps = [
    'Generating cryptographic keypair...',
    'Registering identity on Aptos network...',
    'Allocating sovereign message registers...'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !password) return
    setIsInitializing(true)
    setInitStep(0)
    try {
      await signupWithEmail(email, password, name)
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
      setIsInitializing(false)
    }
  }

  const handleSocialAuth = async (provider: 'google' | 'apple') => {
    setIsInitializing(true)
    setInitStep(0)
    try {
      if (provider === 'google') await connectWithGoogle()
      else await connectWithApple()
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
      setIsInitializing(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0C0E] text-slate-100 font-sans relative overflow-hidden flex flex-col">

      {/* Global Header Line */}
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
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
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
              New Node Registration
            </span>
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              Initialize Your Identity.
            </h1>
            <p className="text-slate-400 text-base leading-relaxed">
              Create your sovereign messaging node. No servers, no intermediaries—just cryptographic identity and on-chain message registers.
            </p>
          </div>

          <div className="space-y-4 border-t border-white/[0.05] pt-6">
            <div className="flex gap-4 items-start">
              <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.05] text-[#FF5A00] mt-0.5">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-200">Self-Sovereign Identity</h3>
                <p className="text-xs text-slate-400 mt-0.5">Your wallet address or keyless credential becomes your unique network identity.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.05] text-[#FF5A00] mt-0.5">
                <ArrowRight className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-200">Instant On-Chain Deployment</h3>
                <p className="text-xs text-slate-400 mt-0.5">Message registers deploy automatically to Aptos testnet upon registration.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pane B: Clean Glassmorphic Registration Block */}
        <div className="lg:col-span-7 flex justify-center lg:justify-end">
          <div className="w-full max-w-xl bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 lg:p-8 backdrop-blur-xl shadow-[0_24px_60px_rgba(0,0,0,0.8)] relative">

            {!isInitializing ? (
                <div className="space-y-6">
                  <div className="space-y-1.5">
                    <h2 className="text-xl font-bold text-white tracking-tight">Node Genesis Protocol</h2>
                    <p className="text-xs text-slate-400">Register your identity and allocate on-chain message storage.</p>
                  </div>

                  {/* Social Quick Entry */}
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

                  <div className="relative flex items-center">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="bg-[#0B0C0E] px-4 text-xs font-mono text-slate-500 uppercase tracking-widest">Or register manually</span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>

                  {/* Manual Registration Form */}
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                      <label className="text-xs font-mono text-slate-400 mb-1 block">Operator Name</label>
                      <input
                        type="text"
                        placeholder="Satoshi"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl h-10 px-4 text-sm text-white placeholder:text-slate-600 focus:ring-1 focus:ring-[#FF5A00]/30 focus:border-[#FF5A00]/40 focus:outline-none transition-all"
                      />
                    </div>
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
                          placeholder="Min 8 characters"
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
                      disabled={loading || !name || !email || !password}
                      className="w-full h-11 bg-gradient-to-r from-[#FF5A00] to-[#FF7A00] text-black font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm mt-4"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                      ) : (
                        <>
                          Initialize Node
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </form>

                  <div className="text-center">
                    <p className="text-[11px] text-slate-500 font-mono">
                      Already registered?{' '}
                      <Link to="/login" className="text-[#FF5A00] hover:text-[#FF7A00] transition-colors font-medium">
                        Restore session
                      </Link>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-6 space-y-8 flex flex-col items-center text-center">
                  <div className="relative flex items-center justify-center h-16 w-16">
                    <div className="absolute inset-0 rounded-full border-2 border-t-[#FF5A00] border-r-transparent border-b-transparent border-l-transparent animate-spin duration-700" />
                    <Shield className="h-6 w-6 text-[#FF5A00] animate-pulse" />
                  </div>

                  <div className="space-y-4 w-full max-w-sm">
                    <div className="space-y-1">
                      <h3 className="text-md font-semibold text-white">Deploying Genesis Node</h3>
                      <p className="text-xs text-slate-400 font-mono tracking-tight">Registering identity and allocating on-chain storage...</p>
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
                </div>
              )}

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
