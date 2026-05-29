import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, ExternalLink } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useWallet } from '../context/WalletProvider'
import { toast } from 'sonner'
import {
  aptosStandardSupportedWalletList,
} from '@aptos-labs/wallet-adapter-react'
import { CDN_URLS } from '../constants'

export default function WalletConnectPage() {
  const [connecting, setConnecting] = useState<string | null>(null)
  const { connectWallet, loading: authLoading } = useAuth()
  const { connect, connected, address } = useWallet()
  const addressRef = useRef(address)
  const navigate = useNavigate()

  useEffect(() => {
    addressRef.current = address
  }, [address])

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
      await connect(name)
      await connectWallet(name, addressRef.current || '')
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
            <h2 className="text-4xl font-medium tracking-tight whitespace-nowrap text-white drop-shadow-md">Connect Wallet</h2>
            <p className="text-white/80 text-sm leading-relaxed px-4 mt-2 drop-shadow">
              Link your Aptos wallet to access your decentralized inbox.
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
              <span className="text-sm font-medium">Connect your wallet</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10 text-white border border-white/10">
              <div className="w-7 h-7 rounded-full bg-white/20 text-white flex items-center justify-center text-sm font-medium">2</div>
              <span className="text-sm font-medium text-white/80">Verify your identity</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10 text-white border border-white/10">
              <div className="w-7 h-7 rounded-full bg-white/20 text-white flex items-center justify-center text-sm font-medium">3</div>
              <span className="text-sm font-medium text-white/80">Start messaging</span>
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
            <h1 className="text-3xl font-medium tracking-tight text-black">Select Wallet</h1>
            <p className="text-black/50 text-sm">Choose your preferred Aptos wallet extension.</p>
          </div>

          <div className="space-y-3">
            {allWallets.length === 0 ? (
              <div className="text-center py-8 text-black/40 text-sm">
                <p>No wallet extensions detected.</p>
                <p className="mt-1">Install the Petra wallet extension to get started.</p>
              </div>
            ) : allWallets.map((wallet, i) => {
              const installed = String(wallet.readyState) === 'Installed'
              return (
                <motion.button
                  key={wallet.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => installed ? handleConnect(wallet.name) : handleInstall(wallet.name)}
                  disabled={authLoading || connecting !== null}
                  className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl bg-white border border-black/10 hover:bg-black/5 transition-all duration-200 group disabled:opacity-50 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-black/5 border border-black/10 flex items-center justify-center">
                      <div className="w-4 h-4 flex items-center justify-center font-bold text-xs border border-black/20 rounded bg-black/5 text-black">{wallet.name.charAt(0)}</div>
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-medium text-black">{wallet.name}</span>
                      <p className="text-[10px] text-black/40 mt-0.5">
                        {installed ? 'Click to connect' : 'Installation required'}
                      </p>
                    </div>
                  </div>
                  {installed ? (
                    <ArrowRight className="h-4 w-4 text-black/30 group-hover:text-black transition-colors" />
                  ) : (
                    <ExternalLink className="h-4 w-4 text-black/30" />
                  )}
                </motion.button>
              )
            })}
          </div>

          <div className="text-center">
            <p className="text-sm text-black/50">
              Don't have a wallet?{' '}
              <a href="https://petra.app" target="_blank" rel="noopener noreferrer" className="text-black hover:text-black/80 transition-colors font-medium">
                Download Petra
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  )
}
