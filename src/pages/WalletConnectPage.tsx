import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Circle, Shield, Zap, Globe, ChevronRight, ExternalLink } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

interface WalletOption {
  name: string
  icon: string
  description: string
  color: string
  popular?: boolean
}

const wallets: WalletOption[] = [
  { name: 'Petra', icon: '🦎', description: 'Most popular Aptos wallet', color: '#5375F3', popular: true },
  { name: 'Martian', icon: '🔴', description: 'Multi-chain wallet', color: '#E53E3E' },
  { name: 'Pontem', icon: '🌉', description: 'DeFi-focused wallet', color: '#805AD5' },
  { name: 'Rise', icon: '📈', description: 'Beginner-friendly', color: '#38A169' },
  { name: 'OKX', icon: '🔷', description: 'Exchange wallet', color: '#3182CE' },
  { name: 'Fewcha', icon: '💎', description: 'Lightweight wallet', color: '#D69E2E' },
]

export default function WalletConnectPage() {
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [connected, setConnected] = useState(false)
  const navigate = useNavigate()

  const handleConnect = (walletName: string) => {
    setSelectedWallet(walletName)
    setConnecting(true)
    setTimeout(() => {
      setConnecting(false)
      setConnected(true)
      setTimeout(() => navigate('/app'), 800)
    }, 2000)
  }

  return (
    <main className="flex min-h-screen w-full bg-black selection:bg-white/30 p-2 transition-all duration-500 lg:h-screen lg:overflow-hidden lg:p-4">
      {/* Left Column - Hero */}
      <div className="hidden lg:flex w-[52%] relative flex-col items-center justify-end pb-32 px-12 rounded-3xl overflow-hidden shadow-2xl h-full">
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260506_081238_406ed0e3-5d83-436e-a512-0bbff7ec5b95.mp4" type="video/mp4" />
        </video>

        <motion.div
          className="z-10 w-full max-w-xs space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.15, delayChildren: 0.2 }}
        >
          <motion.div className="flex items-center gap-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Circle className="fill-white text-white w-6 h-6" />
            <span className="text-xl font-semibold tracking-tight text-white">Inbox3</span>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h2 className="text-4xl font-medium tracking-tight whitespace-nowrap text-white">Connect Wallet</h2>
            <p className="text-white/60 text-sm leading-relaxed px-4 mt-2">
              Your wallet is your identity. Connect to unlock encrypted messaging on-chain.
            </p>
          </motion.div>

          <motion.div className="space-y-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {[
              { icon: Shield, text: 'Self-custodied & encrypted' },
              { icon: Zap, text: 'Instant on-chain verification' },
              { icon: Globe, text: 'Works across all Aptos wallets' },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-3 text-white/60 text-sm"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <item.icon className="w-4 h-4 text-white/40" />
                {item.text}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Right Column - Wallet Selection */}
      <div className="flex-1 flex flex-col items-center justify-center py-12 lg:py-6 px-4 sm:px-12 lg:px-16 xl:px-24 overflow-y-auto lg:overflow-hidden">
        <motion.div
          className="w-full max-w-xl space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div>
            <h1 className="text-3xl font-medium tracking-tight text-white">Choose Your Wallet</h1>
            <p className="text-white/40 text-sm mt-1">Select an Aptos-compatible wallet to continue.</p>
          </div>

          <AnimatePresence mode="wait">
            {!connected ? (
              <motion.div
                key="wallet-list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-3"
              >
                {wallets.map((wallet, i) => (
                  <motion.button
                    key={wallet.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => handleConnect(wallet.name)}
                    disabled={connecting}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200 group ${
                      selectedWallet === wallet.name
                        ? 'bg-white/10 border-white/30'
                        : 'bg-brand-gray border-white/5 hover:bg-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{wallet.icon}</span>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{wallet.name}</span>
                          {wallet.popular && (
                            <span className="text-[10px] font-medium uppercase tracking-wider text-white/40 bg-white/10 px-2 py-0.5 rounded-full">
                              Popular
                            </span>
                          )}
                        </div>
                        <p className="text-white/40 text-xs mt-0.5">{wallet.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {connecting && selectedWallet === wallet.name ? (
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white/60 transition-colors" />
                      )}
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="connected"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-12 space-y-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="w-16 h-16 rounded-full bg-gradient-brand flex items-center justify-center"
                >
                  <Shield className="w-8 h-8 text-white" />
                </motion.div>
                <div className="text-center">
                  <h2 className="text-2xl font-medium text-white">Connected</h2>
                  <p className="text-white/40 text-sm mt-1">Redirecting to your inbox...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative flex items-center">
            <div className="flex-1 h-px bg-white/10" />
            <span className="bg-black px-4 text-xs font-medium text-white/40 uppercase tracking-widest">New here?</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-white/40">
            <span>Don't have a wallet?</span>
            <a
              href="https://petra.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-white/80 transition-colors font-medium inline-flex items-center gap-1"
            >
              Get Petra
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <p className="text-center text-sm text-white/40">
            Prefer email?{' '}
            <Link to="/login" className="text-white hover:text-white/80 transition-colors font-medium">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </main>
  )
}