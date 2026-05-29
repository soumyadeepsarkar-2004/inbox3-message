import { motion } from 'framer-motion'
import { ArrowRight, Shield } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from 'sonner'
import { CDN_URLS } from '../constants'

export default function KeylessAuthPage() {
  const { connectWithGoogle, connectWithApple, connectWithPasskey, loading } = useAuth()
  const navigate = useNavigate()

  const handleGoogle = async () => {
    try {
      await connectWithGoogle()
      navigate('/profile')
    } catch {
      toast.error('Google sign-in cancelled')
    }
  }

  const handleApple = async () => {
    try {
      await connectWithApple()
      navigate('/profile')
    } catch {
      toast.error('Apple sign-in cancelled')
    }
  }

  const handlePasskey = async () => {
    try {
      await connectWithPasskey()
      navigate('/profile')
    } catch {
      toast.error('Passkey creation cancelled')
    }
  }

  return (
    <main className="flex min-h-screen w-full bg-black selection:bg-white/30 p-2 transition-all duration-500 lg:h-screen lg:overflow-hidden lg:p-4">
      {/* Left Column — Hero */}
      <div className="hidden lg:flex relative flex-col items-center justify-end pb-32 px-12 rounded-3xl overflow-hidden shadow-2xl h-full w-[52%]">
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
            <div className="w-6 h-6 rounded bg-gradient-to-br from-[#A855F7] to-[#FF6B35] flex items-center justify-center text-xs font-bold text-black">i3</div>
            <span className="text-xl font-semibold tracking-tight text-white">Inbox3</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl font-medium tracking-tight whitespace-nowrap text-white">No Keys. No Seeds.</h2>
            <p className="text-white/60 text-sm leading-relaxed px-4 mt-2">
              Sign in with your existing accounts using Aptos Keyless technology.
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
              <span className="text-sm font-medium">Choose provider</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-gray text-white border-none">
              <div className="w-7 h-7 rounded-full bg-white/10 text-white/40 flex items-center justify-center text-sm font-medium">2</div>
              <span className="text-sm font-medium text-white/60">Derive identity</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-gray text-white border-none">
              <div className="w-7 h-7 rounded-full bg-white/10 text-white/40 flex items-center justify-center text-sm font-medium">3</div>
              <span className="text-sm font-medium text-white/60">Access inbox</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Right Column — Auth Options */}
      <div className="flex-1 flex flex-col items-center justify-center py-12 lg:py-6 px-4 sm:px-12 lg:px-16 xl:px-24 overflow-y-auto lg:overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="w-full max-w-xl space-y-8 lg:space-y-6 sm:space-y-10"
        >
          <div className="space-y-2">
            <h1 className="text-3xl font-medium tracking-tight text-white">Keyless Sign In</h1>
            <p className="text-white/40 text-sm">Use your existing accounts—no private key management required.</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleGoogle}
              disabled={loading}
              className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl bg-black border border-white/10 hover:bg-white/5 transition-all duration-200 group disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center">
                  <div className="w-5 h-5 flex items-center justify-center font-bold text-sm text-black">G</div>
                </div>
                <div className="text-left">
                  <span className="text-sm font-medium text-white">Continue with Google</span>
                  <p className="text-[10px] text-white/40 mt-0.5">Aptos Keyless OAuth derivation</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-white/30 group-hover:text-white transition-colors" />
            </button>

            <button
              onClick={handleApple}
              disabled={loading}
              className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl bg-black border border-white/10 hover:bg-white/5 transition-all duration-200 group disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center">
                  <div className="w-5 h-5 flex items-center justify-center font-bold text-sm text-black">A</div>
                </div>
                <div className="text-left">
                  <span className="text-sm font-medium text-white">Continue with Apple</span>
                  <p className="text-[10px] text-white/40 mt-0.5">Aptos Keyless OAuth derivation</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-white/30 group-hover:text-white transition-colors" />
            </button>
          </div>

          <div className="relative flex items-center">
            <div className="flex-1 h-px bg-white/10" />
            <span className="bg-black px-4 text-xs font-medium text-white/40 uppercase tracking-widest">Alternative</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <button
            onClick={handlePasskey}
            disabled={loading}
            className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl bg-black border border-white/10 hover:bg-white/5 transition-all duration-200 group disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#A855F7]/20 to-[#FF6B35]/20 border border-white/10 flex items-center justify-center">
                <Shield className="h-4 w-4 text-[#FF6B35]" />
              </div>
              <div className="text-left">
                <span className="text-sm font-medium text-white">Create Passkey</span>
                <p className="text-[10px] text-white/40 mt-0.5">WebAuthn biometric authentication</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-white/30 group-hover:text-white transition-colors" />
          </button>

          <p className="text-center text-sm text-white/40">
            Already registered?{' '}
            <Link to="/login" className="text-white hover:text-white/80 transition-colors font-medium">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </main>
  )
}
