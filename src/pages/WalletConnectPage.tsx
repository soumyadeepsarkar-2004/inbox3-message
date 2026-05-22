import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, ExternalLink } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useWallet } from '../context/WalletProvider'
import { toast } from 'sonner'
import {
  aptosStandardSupportedWalletList,
} from '@aptos-labs/wallet-adapter-react'

export default function WalletConnectPage() {
  const [connecting, setConnecting] = useState<string | null>(null)
  const { connectWallet, loading: authLoading } = useAuth()
  const { connect, connected, address } = useWallet()
  const navigate = useNavigate()

  const allWallets = aptosStandardSupportedWalletList.filter(
    (w) => !['Aptos Connect', 'Google', 'Apple'].includes(w.name)
  )

  useEffect(() => {
    if (connected && address) {
      toast.success('Wallet connected', { description: `${address.slice(0, 8)}...${address.slice(-6)}` })
    }
  }, [connected, address])

  const handleConnect = async (name: string) => {
    setConnecting(name)
    try {
      await connect()
      await connectWallet(name, address || '')
      toast.success('Connected successfully')
      navigate('/profile')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Connection failed'
      toast.error('Connection failed', { description: message })
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
            <div className="w-6 h-6 rounded bg-gradient-to-br from-[#A855F7] to-[#FF6B35] flex items-center justify-center text-xs font-bold text-black">i3</div>
            <span className="text-xl font-semibold tracking-tight text-white">Inbox3</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl font-medium tracking-tight whitespace-nowrap text-white">Connect Your Wallet</h2>
            <p className="text-white/60 text-sm leading-relaxed px-4 mt-2">
              Link your Aptos wallet to access your decentralized inbox.
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
              <span className="text-sm font-medium">Connect your wallet</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-gray text-white border-none">
              <div className="w-7 h-7 rounded-full bg-white/10 text-white/40 flex items-center justify-center text-sm font-medium">2</div>
              <span className="text-sm font-medium text-white/60">Verify your identity</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-gray text-white border-none">
              <div className="w-7 h-7 rounded-full bg-white/10 text-white/40 flex items-center justify-center text-sm font-medium">3</div>
              <span className="text-sm font-medium text-white/60">Start messaging</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Right Column — Wallet List */}
      <div className="flex-1 flex flex-col items-center justify-center py-12 lg:py-6 px-4 sm:px-12 lg:px-16 xl:px-24 overflow-y-auto lg:overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="w-full max-w-xl space-y-8 lg:space-y-6 sm:space-y-10"
        >
          <div className="space-y-2">
            <h1 className="text-3xl font-medium tracking-tight text-white">Select Wallet</h1>
            <p className="text-white/40 text-sm">Choose your preferred Aptos wallet extension.</p>
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
                  disabled={authLoading || connecting !== null}
                  className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl bg-black border border-white/10 hover:bg-white/5 transition-all duration-200 group disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#A855F7]/20 to-[#FF6B35]/20 border border-white/10 flex items-center justify-center">
                      <div className="w-4 h-4 flex items-center justify-center font-bold text-xs border border-white/20 rounded bg-white/5 text-white">{wallet.name.charAt(0)}</div>
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-medium text-white">{wallet.name}</span>
                      <p className="text-[10px] text-white/40 mt-0.5">
                        {installed ? 'Click to connect' : 'Installation required'}
                      </p>
                    </div>
                  </div>
                  {installed ? (
                    <ArrowRight className="h-4 w-4 text-white/30 group-hover:text-white transition-colors" />
                  ) : (
                    <ExternalLink className="h-4 w-4 text-white/30" />
                  )}
                </motion.button>
              )
            })}
          </div>

          <div className="text-center">
            <p className="text-sm text-white/40">
              Don't have a wallet?{' '}
              <a href="https://petra.app" target="_blank" rel="noopener noreferrer" className="text-white hover:text-white/80 transition-colors font-medium">
                Download Petra
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  )
}
