import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [activeTab, setActiveTab] = useState<'email' | 'wallet'>('email')
  const { loginWithEmail, connectWithGoogle, connectWithApple, loading } = useAuth()
  const navigate = useNavigate()

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    await loginWithEmail(email, password)
    navigate('/app')
  }

  return (
    <main className="flex min-h-screen w-full bg-black selection:bg-white/30 p-2 transition-all duration-500 lg:h-screen lg:overflow-hidden lg:p-4">
      {/* Left Column — Hero */}
      <div className="hidden lg:flex relative flex-col items-center justify-end pb-32 px-12 rounded-3xl overflow-hidden shadow-2xl h-full w-[52%]">
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260506_081238_406ed0e3-5d83-436e-a512-0bbff7ec5b95.mp4"
            type="video/mp4"
          />
        </video>

        <motion.div
          className="relative z-10 w-full max-w-xs space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.15, delayChildren: 0.2 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2"
          >
            <div className="w-6 h-6 rounded bg-gradient-to-br from-[#FF5A00] to-[#FF7A00] flex items-center justify-center text-xs font-bold text-black">i3</div>
            <span className="text-xl font-semibold tracking-tight text-white">Inbox3</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl font-medium tracking-tight whitespace-nowrap text-white">Welcome Back</h2>
            <p className="text-white/60 text-sm leading-relaxed px-4 mt-2">
              Reconnect to your decentralized identity and pick up where you left off.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white text-black border border-white">
              <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-sm font-medium">1</div>
              <span className="text-sm font-medium">Verify your identity</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-gray text-white border-none">
              <div className="w-7 h-7 rounded-full bg-white/10 text-white/40 flex items-center justify-center text-sm font-medium">2</div>
              <span className="text-sm font-medium text-white/60">Access your messages</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-gray text-white border-none">
              <div className="w-7 h-7 rounded-full bg-white/10 text-white/40 flex items-center justify-center text-sm font-medium">3</div>
              <span className="text-sm font-medium text-white/60">Resume conversations</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Right Column — Form */}
      <div className="flex-1 flex flex-col items-center justify-center py-12 lg:py-6 px-4 sm:px-12 lg:px-16 xl:px-24 overflow-y-auto lg:overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="w-full max-w-xl space-y-8 lg:space-y-6 sm:space-y-10"
        >
          <div className="space-y-2">
            <h1 className="text-3xl font-medium tracking-tight text-white">Sign In</h1>
            <p className="text-white/40 text-sm">Enter your credentials to access your inbox.</p>
          </div>

          {/* Tabs */}
          <div className="grid grid-cols-2 p-1 bg-brand-gray border border-white/10 rounded-xl">
            <button
              onClick={() => setActiveTab('email')}
              className={`py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                activeTab === 'email' ? 'bg-white text-black shadow-lg' : 'text-white/40 hover:text-white'
              }`}
            >
              Email / Social
            </button>
            <button
              onClick={() => setActiveTab('wallet')}
              className={`py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                activeTab === 'wallet' ? 'bg-white text-black shadow-lg' : 'text-white/40 hover:text-white'
              }`}
            >
              Wallet Extension
            </button>
          </div>

          {activeTab === 'email' ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => connectWithGoogle()}
                  disabled={loading}
                  className="bg-black border border-white/10 rounded-xl hover:bg-white/5 transition-colors p-3.5 flex items-center justify-center gap-2 text-white disabled:opacity-50"
                >
                  <div className="w-5 h-5 flex items-center justify-center font-bold text-xs border border-white/20 rounded bg-white/5 text-white">G</div>
                  <span className="text-sm font-medium">Google</span>
                </button>
                <button
                  onClick={() => connectWithApple()}
                  disabled={loading}
                  className="bg-black border border-white/10 rounded-xl hover:bg-white/5 transition-colors p-3.5 flex items-center justify-center gap-2 text-white disabled:opacity-50"
                >
                  <div className="w-5 h-5 flex items-center justify-center font-bold text-xs border border-white/20 rounded bg-white/5 text-white">A</div>
                  <span className="text-sm font-medium">Apple</span>
                </button>
              </div>

              <div className="relative flex items-center">
                <div className="flex-1 h-px bg-white/10" />
                <span className="bg-black px-4 text-xs font-medium text-white/40 uppercase tracking-widest">Or</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-white">Email</label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-brand-gray border-none rounded-xl h-11 px-4 text-white placeholder:text-white/20 focus:ring-2 focus:ring-white/20 focus:outline-none transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-white">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-brand-gray border-none rounded-xl h-11 px-4 pr-11 text-white placeholder:text-white/20 focus:ring-2 focus:ring-white/20 focus:outline-none transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email || !password}
                  className="w-full h-14 bg-white text-black font-semibold rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all duration-200 mt-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="space-y-3">
              <Link
                to="/wallet"
                className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl bg-black border border-white/10 hover:bg-white/5 transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 flex items-center justify-center font-bold text-xs border border-white/20 rounded bg-white/5 text-white">P</div>
                  <span className="text-sm font-medium text-white">Connect Petra Extension</span>
                </div>
                <ArrowRight className="h-4 w-4 text-white/30 group-hover:text-white transition-colors" />
              </Link>
              <Link
                to="/keyless"
                className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl bg-black border border-white/10 hover:bg-white/5 transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 flex items-center justify-center font-bold text-xs border border-white/20 rounded bg-white/5 text-white">K</div>
                  <span className="text-sm font-medium text-white">Passkey / Biometric Auth</span>
                </div>
                <ArrowRight className="h-4 w-4 text-white/30 group-hover:text-white transition-colors" />
              </Link>
            </div>
          )}

          <p className="text-center text-sm text-white/40">
            New to Inbox3?{' '}
            <Link to="/signup" className="text-white hover:text-white/80 transition-colors font-medium">
              Create account
            </Link>
          </p>
        </motion.div>
      </div>
    </main>
  )
}
