import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wallet, Shield, ArrowRight, CheckCircle2, RefreshCw, ExternalLink } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useWallet } from '../context/WalletProvider'
import { toast } from 'sonner'
import {
  aptosStandardSupportedWalletList,
} from '@aptos-labs/wallet-adapter-react'

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
    'Establishing secure channel with extension...',
    'Verifying cryptographic signatures...',
    'Mapping wallet identity to Aptos address...'
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
    <div className="min-h-screen bg-[#0B0C0E] text-slate-100 font-sans relative overflow-hidden flex flex-col">

      {/* Global Header Line */}
      <header className="w-full border-b border-white/[0.05] bg-[#0B0C0E]/80 backdrop-blur-md z-50 sticky top-0">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/login" className="flex items-center gap-3">
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

      {/* Main Core Layout Split Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 grid lg:grid-cols-12 gap-12 items-center py-12 z-10">

        {/* Pane A: Brand Value Anchor */}
        <div className="lg:col-span-5 space-y-8 text-left">
          <div className="space-y-4">
            <span className="px-3 py-1 rounded-md bg-[#FF5A00]/10 border border-[#FF5A00]/20 text-[#FF5A00] font-mono text-xs uppercase tracking-widest font-semibold">
              Hardware Node Link
            </span>
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              Connect Your Wallet.
            </h1>
            <p className="text-slate-400 text-base leading-relaxed">
              Link your Aptos wallet to access your decentralized inbox. Your wallet address becomes your unique identity on the sovereign messaging layer.
            </p>
          </div>

          <div className="space-y-4 border-t border-white/[0.05] pt-6">
            <div className="flex gap-4 items-start">
              <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.05] text-[#FF5A00] mt-0.5">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-200">Secure Identity Mapping</h3>
                <p className="text-xs text-slate-400 mt-0.5">Your wallet address is your username—no passwords, no email verification.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.05] text-[#FF6B35] mt-0.5">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-200">On-Chain Message Storage</h3>
                <p className="text-xs text-slate-400 mt-0.5">All messages encrypted with your keys and stored on Aptos blockchain.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pane B: Clean Glassmorphic Wallet Grid */}
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
                    <Wallet className="h-6 w-6 text-[#FF5A00] animate-pulse" />
                  </div>

                  <div className="space-y-4 w-full max-w-sm">
                    <div className="space-y-1">
                      <h3 className="text-md font-semibold text-white">Connecting to {connecting}</h3>
                      <p className="text-xs text-slate-400 font-mono tracking-tight">Establishing secure channel with wallet extension...</p>
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
                          <span className={initStep === idx ? 'text-[#A855F7]' : initStep > idx ? 'text-slate-300' : 'text-slate-600'}>
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
                    <h2 className="text-xl font-bold text-white tracking-tight">Select Wallet Extension</h2>
                    <p className="text-xs text-slate-400">Choose your preferred Aptos wallet to establish the secure connection.</p>
                  </div>

                  <div className="space-y-3">
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
                          className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-[#A855F7]/40 hover:bg-white/[0.05] transition-all duration-200 group disabled:opacity-50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-[#FF5A00]/20 to-[#FF7A00]/20 border border-white/[0.05] flex items-center justify-center">
                              <Wallet className="h-4 w-4 text-[#FF5A00]" />
                            </div>
                            <div className="text-left">
                              <span className="text-sm font-medium text-slate-200">{wallet.name}</span>
                              <p className="text-[10px] text-slate-500 mt-0.5">
                                {installed ? 'Click to connect' : 'Installation required'}
                              </p>
                            </div>
                          </div>
                          {installed ? (
                            <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-[#A855F7] transition-colors" />
                          ) : (
                            <ExternalLink className="h-4 w-4 text-slate-600" />
                          )}
                        </motion.button>
                      )
                    })}
                  </div>

                  <div className="text-center">
                    <p className="text-[11px] text-slate-500 font-mono">
                      Don't have a wallet?{' '}
                      <a href="https://petra.app" target="_blank" rel="noopener noreferrer" className="text-[#A855F7] hover:text-[#FF6B35] transition-colors font-medium">
                        Download Petra
                      </a>
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
