import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Circle, Wallet, ArrowRight, CheckCircle2, RefreshCw, ExternalLink } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useWallet } from '../context/WalletProvider'
import { toast } from 'sonner'
import { aptosStandardSupportedWalletList } from '@aptos-labs/wallet-adapter-react'

export default function WalletConnectPage() {
  const [connecting, setConnecting] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)
  const [initStep, setInitStep] = useState(0)
  const { connectWallet, loading: authLoading } = useAuth()
  const { connect, connected, address } = useWallet()
  const navigate = useNavigate()

  const allWallets = aptosStandardSupportedWalletList.filter(
    (w) => !['Aptos Connect', 'Google', 'Apple'].includes(w.name)
  )

  const initializationSteps = [
    'Establishing secure channel...',
    'Verifying cryptographic signatures...',
    'Mapping wallet identity...'
  ]

  useEffect(() => {
    if (connected && address) {
      toast.success('Wallet connected', { description: `${address.slice(0, 8)}...${address.slice(-6)}` })
    }
  }, [connected, address])

  const handleConnect = async (name: string) => {
    setConnecting(name)
    setIsInitializing(true)
    setInitStep(0)
    try {
      await connect()
      await connectWallet(name, address || '')
      toast.success('Connected successfully')
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
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Connection failed'
      toast.error('Connection failed', { description: message })
      setIsInitializing(false)
      setConnecting(null)
    }
  }

  const handleInstall = (walletName: string) => {
    const wallet = allWallets.find((w) => w.name === walletName)
    if (wallet?.url) {
      window.open(wallet.url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <main className="flex min-h-screen w-full bg-black selection:bg-white/30 p-2 transition-all duration-500 lg:h-screen lg:overflow-hidden lg:p-4">
      {/* Left Column */}
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
            <span className="text-xl font-semibold tracking-tight">Inbox3</span>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h2 className="text-4xl font-medium tracking-tight whitespace-nowrap">Connect Wallet</h2>
            <p className="text-white/60 text-sm leading-relaxed px-4 mt-2">
              Follow these 3 quick phases to activate your space.
            </p>
          </motion.div>

          <motion.div className="space-y-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <StepItem number={1} text="Register your identity" />
            <StepItem number={2} text="Configure your studio" active />
            <StepItem number={3} text="Finalize your profile" />
          </motion.div>
        </motion.div>
      </div>

      {/* Right Column */}
      <div className="flex-1 flex flex-col items-center justify-center py-12 lg:py-6 px-4 sm:px-12 lg:px-16 xl:px-24 overflow-y-auto lg:overflow-hidden">
        <motion.div
          className="w-full max-w-xl space-y-8 lg:space-y-6 sm:space-y-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div>
            <h1 className="text-3xl font-medium tracking-tight">Connect Your Wallet</h1>
            <p className="text-white/40 text-sm mt-1">Link your Aptos wallet to access your decentralized inbox.</p>
          </div>

          <div className="w-full relative">
            <AnimatePresence mode="wait">
              {isInitializing ? (
                <motion.div
                  key="initializing"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="py-6 space-y-8 flex flex-col items-center text-center"
                >
                  <div className="relative flex items-center justify-center h-16 w-16">
                    <div className="absolute inset-0 rounded-full border-2 border-t-white border-r-transparent border-b-transparent border-l-transparent animate-spin duration-700" />
                    <Wallet className="h-6 w-6 text-white animate-pulse" />
                  </div>

                  <div className="space-y-4 w-full max-w-sm">
                    <div className="space-y-1">
                      <h3 className="text-md font-semibold text-white">Connecting to {connecting}</h3>
                      <p className="text-xs text-white/40 font-mono tracking-tight">Please approve in extension...</p>
                    </div>

                    <div className="space-y-2.5 text-left bg-[#1A1A1A] rounded-xl p-4 font-mono text-[11px]">
                      {initializationSteps.map((step, idx) => (
                        <div key={idx} className="flex items-center gap-2.5">
                          {initStep > idx ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          ) : initStep === idx ? (
                            <RefreshCw className="h-3.5 w-3.5 text-white animate-spin shrink-0" />
                          ) : (
                            <div className="h-3.5 w-3.5 rounded-full border border-white/20 shrink-0" />
                          )}
                          <span className={initStep === idx ? 'text-white' : initStep > idx ? 'text-white/80' : 'text-white/40'}>
                            {step}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="wallet-list"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  {allWallets.map((wallet, i) => {
                    const installed = String(wallet.readyState) === 'Installed'

                    return (
                      <motion.button
                        key={wallet.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        onClick={() => installed ? handleConnect(wallet.name) : handleInstall(wallet.name)}
                        disabled={authLoading}
                        className="w-full flex items-center justify-between px-4 py-4 rounded-xl bg-[#1A1A1A] border-none hover:bg-white/10 transition-all duration-200 group disabled:opacity-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-black flex items-center justify-center">
                            <Wallet className="h-5 w-5 text-white" />
                          </div>
                          <div className="text-left">
                            <span className="text-sm font-medium text-white">{wallet.name}</span>
                            <p className="text-xs text-white/40 mt-0.5">
                              {installed ? 'Click to connect' : 'Installation required'}
                            </p>
                          </div>
                        </div>
                        {installed ? (
                          <ArrowRight className="h-5 w-5 text-white/40 group-hover:text-white transition-colors" />
                        ) : (
                          <ExternalLink className="h-5 w-5 text-white/40" />
                        )}
                      </motion.button>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {!isInitializing && (
            <p className="text-center text-sm text-white/40">
              Back to{' '}
              <Link to="/signup" className="text-white hover:text-white/80 transition-colors font-medium">
                Signup
              </Link>
            </p>
          )}
        </motion.div>
      </div>
    </main>
  )
}

function StepItem({ number, text, active }: { number: number; text: string; active?: boolean }) {
  return (
    <div className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${active ? 'bg-white text-black border border-white' : 'bg-brand-gray text-white border-none'}`}>
      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium ${active ? 'bg-black text-white' : 'bg-white/10 text-white/40'}`}>
        {number}
      </span>
      <span className="text-sm font-medium">{text}</span>
    </div>
  )
}
