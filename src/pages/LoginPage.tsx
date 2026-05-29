import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from 'sonner'
import { CDN_URLS } from '../constants'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [activeTab, setActiveTab] = useState<'email' | 'wallet'>('email')
  const [error, setError] = useState('')
  const { loginWithEmail, connectWithGoogle, connectWithApple, loading, initialized } = useAuth()
  const navigate = useNavigate()

  if (!initialized) {
    return (
      <main className="flex min-h-screen w-full bg-[#F5F5F5] items-center justify-center p-4">
        <div className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin" />
      </main>
    )
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    setError('')
    try {
      await loginWithEmail(email, password)
      navigate('/app')
    } catch {
      setError('Invalid email or password')
      toast.error('Login failed')
    }
  }

  return (
    <main className="flex min-h-screen w-full bg-[#F5F5F5] selection:bg-black/10 p-2 transition-all duration-500 lg:h-screen lg:overflow-hidden lg:p-4">
      {/* Left Column — Hero */}
      <div className="hidden lg:flex relative flex-col items-center justify-end pb-32 px-12 rounded-[2rem] overflow-hidden shadow-xl h-full w-[52%]">
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
          <source
            src={CDN_URLS.heroVideo}
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
            <div className="w-6 h-6 rounded bg-black flex items-center justify-center text-xs font-bold text-white shadow-md">i3</div>
            <span className="text-xl font-semibold tracking-tight text-white drop-shadow-md">Inbox3</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl font-medium tracking-tight whitespace-nowrap text-white drop-shadow-md">Welcome Back</h2>
            <p className="text-white/80 text-sm leading-relaxed px-4 mt-2 drop-shadow">
              Reconnect to your decentralized identity and pick up where you left off.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20"
          >
            <div className="flex items-center gap-3 p-3 rounded-xl bg-black text-white shadow-md">
              <div className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center text-sm font-medium">1</div>
              <span className="text-sm font-medium">Verify your identity</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10 text-white border border-white/10">
              <div className="w-7 h-7 rounded-full bg-white/20 text-white flex items-center justify-center text-sm font-medium">2</div>
              <span className="text-sm font-medium text-white/80">Access your messages</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10 text-white border border-white/10">
              <div className="w-7 h-7 rounded-full bg-white/20 text-white flex items-center justify-center text-sm font-medium">3</div>
              <span className="text-sm font-medium text-white/80">Resume conversations</span>
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
            <h1 className="text-3xl font-medium tracking-tight text-black">Sign In</h1>
            <p className="text-black/50 text-sm">Enter your credentials to access your inbox.</p>
          </div>

          {/* Tabs */}
          <div className="grid grid-cols-2 p-1 bg-white border border-black/10 rounded-xl shadow-sm">
            <button
              onClick={() => setActiveTab('email')}
              className={`py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                activeTab === 'email' ? 'bg-black text-white shadow-md' : 'text-black/50 hover:text-black'
              }`}
            >
              Email / Social
            </button>
            <button
              onClick={() => setActiveTab('wallet')}
              className={`py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                activeTab === 'wallet' ? 'bg-black text-white shadow-md' : 'text-black/50 hover:text-black'
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
                  className="bg-white border border-black/10 rounded-xl hover:bg-black/5 transition-colors p-3.5 flex items-center justify-center gap-2 text-black shadow-sm disabled:opacity-50"
                >
                  <div className="w-5 h-5 flex items-center justify-center font-bold text-xs border border-black/20 rounded bg-black/5 text-black">G</div>
                  <span className="text-sm font-medium">Google</span>
                </button>
                <button
                  onClick={() => connectWithApple()}
                  disabled={loading}
                  className="bg-white border border-black/10 rounded-xl hover:bg-black/5 transition-colors p-3.5 flex items-center justify-center gap-2 text-black shadow-sm disabled:opacity-50"
                >
                  <div className="w-5 h-5 flex items-center justify-center font-bold text-xs border border-black/20 rounded bg-black/5 text-black">A</div>
                  <span className="text-sm font-medium">Apple</span>
                </button>
              </div>

              <div className="relative flex items-center">
                <div className="flex-1 h-px bg-black/10" />
                <span className="bg-[#F5F5F5] px-4 text-xs font-semibold text-black/40 uppercase tracking-widest">Or</span>
                <div className="flex-1 h-px bg-black/10" />
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-black/80">Email</label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white border border-black/10 rounded-xl h-11 px-4 text-black placeholder:text-black/30 focus:ring-2 focus:ring-black/10 focus:border-black/20 focus:outline-none transition-all duration-200 shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-black/80">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white border border-black/10 rounded-xl h-11 px-4 pr-11 text-black placeholder:text-black/30 focus:ring-2 focus:ring-black/10 focus:border-black/20 focus:outline-none transition-all duration-200 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black/80 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <button
                  type="submit"
                  disabled={loading || !email || !password}
                  className="w-full h-14 bg-black text-white font-semibold rounded-xl hover:bg-black/90 active:scale-[0.98] transition-all duration-200 mt-4 flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
                className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl bg-white border border-black/10 hover:bg-black/5 transition-all duration-200 group shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 flex items-center justify-center font-bold text-xs border border-black/20 rounded bg-black/5 text-black">P</div>
                  <span className="text-sm font-medium text-black">Connect Petra Extension</span>
                </div>
                <ArrowRight className="h-4 w-4 text-black/40 group-hover:text-black transition-colors" />
              </Link>
              <Link
                to="/keyless"
                className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl bg-white border border-black/10 hover:bg-black/5 transition-all duration-200 group shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 flex items-center justify-center font-bold text-xs border border-black/20 rounded bg-black/5 text-black">K</div>
                  <span className="text-sm font-medium text-black">Passkey / Biometric Auth</span>
                </div>
                <ArrowRight className="h-4 w-4 text-black/40 group-hover:text-black transition-colors" />
              </Link>
            </div>
          )}

          <p className="text-center text-sm text-black/50">
            New to Inbox3?{' '}
            <Link to="/signup" className="text-black hover:text-black/80 transition-colors font-medium">
              Create account
            </Link>
          </p>
        </motion.div>
      </div>
    </main>
  )
}
