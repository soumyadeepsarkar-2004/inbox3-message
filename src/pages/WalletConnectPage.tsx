import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Circle, ArrowRight, Wallet, Shield, Smartphone, Globe } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function generateMockAddress(): string {
  const part1 = Math.random().toString(16).slice(2, 10)
  const part2 = Math.random().toString(16).slice(2, 6)
  return `0x${part1}...${part2}`
}

const wallets = [
  { id: 'petra', name: 'Petra', icon: Wallet, description: 'Most popular Aptos wallet' },
  { id: 'martian', name: 'Martian', icon: Shield, description: 'Secure & feature-rich' },
  { id: 'pontem', name: 'Pontem', icon: Globe, description: 'Multi-chain support' },
  { id: 'fewcha', name: 'Fewcha', icon: Smartphone, description: 'Mobile-first design' },
  { id: 'rise', name: 'Rise', icon: Wallet, description: 'Next-gen wallet' },
  { id: 'okx', name: 'OKX', icon: Globe, description: 'Exchange integrated' },
]

export default function WalletConnectPage() {
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const { connectWallet, loading } = useAuth()
  const navigate = useNavigate()

  const handleConnect = async (id: string) => {
    setSelectedWallet(id)
    setConnecting(true)
    await new Promise(r => setTimeout(r, 2000))
    const mockAddress = generateMockAddress()
    await connectWallet(id.charAt(0).toUpperCase() + id.slice(1), mockAddress)
    setConnecting(false)
    navigate('/profile')
  }

  return (
    <main className="min-h-screen bg-black text-white selection:bg-white/30 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
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

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left - Info */}
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

          {/* Right - Wallet Grid */}
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
                    <p className="text-lg font-medium text-white">Connecting to {selectedWallet}</p>
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
                  {wallets.map((wallet, i) => (
                    <motion.button
                      key={wallet.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      onClick={() => handleConnect(wallet.id)}
                      disabled={loading}
                      className="group flex flex-col items-center gap-3 p-6 bg-brand-gray rounded-2xl hover:bg-white/10 transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-brand flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                        <wallet.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-white text-sm">{wallet.name}</p>
                        <p className="text-xs text-white/40 mt-1">{wallet.description}</p>
                      </div>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </main>
  )
}