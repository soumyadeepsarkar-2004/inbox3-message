import { motion } from 'framer-motion'
import { ArrowLeft, KeyRound } from 'lucide-react'
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
    <main className="min-h-screen bg-black text-white selection:bg-white/30 p-4 lg:p-8">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-12"
        >
          <Link to="/login" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back
          </Link>
          <span className="text-lg font-semibold tracking-tight">Inbox3</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-medium tracking-tight">Passwordless Sign In</h1>
            <p className="text-white/60">
              Use your existing Google or Apple account, or create a secure passkey
            </p>
          </div>

          <div className="space-y-3">
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              onClick={handleGoogle}
              disabled={loading}
              className="w-full flex items-center gap-4 p-4 bg-brand-gray rounded-xl hover:bg-white/10 transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
            >
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                <GoogleIcon />
              </div>
              <div className="text-left">
                <p className="font-medium text-white">Continue with Google</p>
                <p className="text-xs text-white/50">Aptos Keyless authentication</p>
              </div>
            </motion.button>

            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              onClick={handleApple}
              disabled={loading}
              className="w-full flex items-center gap-4 p-4 bg-brand-gray rounded-xl hover:bg-white/10 transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
            >
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                <AppleIcon />
              </div>
              <div className="text-left">
                <p className="font-medium text-white">Continue with Apple</p>
                <p className="text-xs text-white/50">Aptos Keyless authentication</p>
              </div>
            </motion.button>

            <motion.div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-black px-2 text-white/40">or</span>
              </div>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              onClick={handlePasskey}
              disabled={loading}
              className="w-full flex items-center gap-4 p-4 bg-brand-gray rounded-xl hover:bg-white/10 transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-brand flex items-center justify-center">
                <KeyRound className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-medium text-white">Create Passkey</p>
                <p className="text-xs text-white/50">WebAuthn biometric authentication</p>
              </div>
            </motion.button>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="p-4 bg-white/5 rounded-xl border border-white/10"
          >
            <p className="text-xs text-white/50 leading-relaxed">
              <span className="text-white font-medium">Aptos Keyless</span> lets you sign in with your Google or Apple account without managing private keys. Your identity is cryptographically derived from your OAuth token and mapped to an Aptos address.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </main>
  )
}
