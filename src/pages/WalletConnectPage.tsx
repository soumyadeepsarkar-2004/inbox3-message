import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Circle, ArrowRight, Wallet, ExternalLink } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useWallet } from '../context/WalletProvider'
import { toast } from 'sonner'
import {
  aptosStandardSupportedWalletList,
} from '@aptos-labs/wallet-adapter-react'

const walletDescriptions: Record<string, string> = {
  'Petra': 'Most popular Aptos wallet',
  'Martian': 'Secure & feature-rich',
  'Pontem': 'Multi-chain support',
  'Rise': 'Next-gen wallet',
  'Fewcha': 'Mobile-first design',
  'OKX Wallet': 'Exchange integrated',
}

export default function WalletConnectPage() {
  const [connecting, setConnecting] = useState<string | null>(null)
  const { connectWallet, loading: authLoading } = useAuth()
  const { connect, connected, address } = useWallet()
  const navigate = useNavigate()

  const allWallets = aptosStandardSupportedWalletList.filter(
    (w) => !['Aptos Connect', 'Google', 'Apple'].includes(w.name)
  ) as Array<{ name: string; readyState: string; url?: string; icon?: string }>

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
    } finally {
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
    <main className="min-h-screen bg-black text-white selection:bg-white/30 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-12"
        >
          <Link to="/login" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
            <ArrowRight className="w-5 h-5 rotate-180" />
            Back to login
          </Link>
          <div className="flex items-center gap-2">
            <Circle className="fill-white text-white w-5 h-5" />
            <span className="text-lg font-semibold tracking-tight">Inbox3</span>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div>
              <h1 className="text-4xl font-medium tracking-tight mb-4">Connect Your Wallet</h1>
              <p className="text-white/60 text-lg leading-relaxed">
                Link your Aptos wallet to access your decentralized inbox. Your wallet address becomes your unique identity.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { title: 'Secure Identity', desc: 'Your wallet address is your username' },
                { title: 'E2E Encrypted', desc: 'Messages encrypted with your keys' },
                { title: 'On-Chain Storage', desc: 'Messages stored on Aptos blockchain' },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-start gap-4 p-4 bg-brand-gray rounded-xl"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-brand flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">{i + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{item.title}</h3>
                    <p className="text-sm text-white/50 mt-1">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <AnimatePresence mode="wait">
              {connecting ? (
                <motion.div
                  key="connecting"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-brand-gray rounded-2xl p-8 text-center space-y-6"
                >
                  <div className="w-16 h-16 mx-auto border-4 border-white/10 border-t-white rounded-full animate-spin" />
                  <div>
                    <p className="text-lg font-medium text-white">Connecting to {connecting}</p>
                    <p className="text-sm text-white/50 mt-2">Approve the connection in your wallet extension</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-2 gap-3"
                >
                  {allWallets.map((wallet, i) => {
                    const installed = String(wallet.readyState) === 'Installed'
                    const Icon = Wallet
                    const description = walletDescriptions[wallet.name] || 'Aptos wallet'

                    return (
                      <motion.button
                        key={wallet.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        onClick={() => installed ? handleConnect(wallet.name) : handleInstall(wallet.name)}
                        disabled={authLoading}
                        className="group relative flex flex-col items-center gap-3 p-6 bg-brand-gray rounded-2xl hover:bg-white/10 transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
                      >
                        {!installed && (
                          <div className="absolute top-2 right-2">
                            <ExternalLink className="w-3 h-3 text-white/40" />
                          </div>
                        )}
                        <div className="w-12 h-12 rounded-xl bg-gradient-brand flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-center">
                          <p className="font-medium text-white text-sm">{wallet.name}</p>
                          <p className="text-xs text-white/40 mt-1">{description}</p>
                          <p className="text-[10px] mt-1 text-white/30">
                            {installed ? 'Click to connect' : 'Install required'}
                          </p>
                        </div>
                      </motion.button>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </main>
  )
}
