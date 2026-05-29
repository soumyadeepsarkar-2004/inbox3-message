import { useState, useCallback } from 'react'
import { X, Send, ArrowRight, Zap, Eye, Loader, Bot } from 'lucide-react'
import { useANS } from '../../hooks/useANS'
import { useAnonymousMessaging } from '../../hooks/useAnonymousMessaging'
import { ampMessenger } from '../../lib/ampProtocol'
import { toast } from 'sonner'

interface ComposeMessageModalProps {
  open: boolean
  onClose: () => void
  onSend: (address: string, name: string, message: string, publicKey?: string) => void
}

export default function ComposeMessageModal({ open, onClose, onSend }: ComposeMessageModalProps) {
  const [address, setAddress] = useState('')
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [premium, setPremium] = useState(false)
  const [anonymous, setAnonymous] = useState(false)
  const [agentMode, setAgentMode] = useState(false)
  const [resolving, setResolving] = useState(false)
  const [resolvedName, setResolvedName] = useState<string | null>(null)

  const { resolveName } = useANS()
  const { generateEpochalKey } = useAnonymousMessaging()

  const isValidAddress = (addr: string) => /^0x[a-fA-F0-9]{1,64}$/.test(addr)
  const isANSName = (addr: string) => /\.apt$/i.test(addr)

  const handleAddressChange = useCallback(async (value: string) => {
    setAddress(value)
    setError('')
    setResolvedName(null)

    if (isANSName(value)) {
      setResolving(true)
      const result = await resolveName(value)
      setResolving(false)
      if (result.address) {
        setResolvedName(result.address)
      } else {
        setError('Could not resolve .apt name')
      }
    }
  }, [resolveName])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    let targetAddress = address.trim()

    if (!targetAddress) {
      setError('Wallet address or .apt name is required')
      return
    }

    if (isANSName(targetAddress)) {
      if (!resolvedName) {
        setError('Resolving .apt name...')
        return
      }
      targetAddress = resolvedName
    }

    if (!isValidAddress(targetAddress)) {
      setError('Invalid Aptos wallet address (must start with 0x)')
      return
    }

    if (!message.trim()) {
      setError('Message cannot be empty')
      return
    }

    let senderKey: string | undefined
    try { senderKey = localStorage.getItem('inbox3_public_key') || undefined } catch { /* storage unavailable */ }

    if (anonymous) {
      const epochal = await generateEpochalKey()
      if (epochal) {
        senderKey = epochal.publicKey
        toast.success('Anonymous mode: using ephemeral key')
      }
    }

    if (agentMode) {
      let userAddress = '0xuser'
      try { userAddress = localStorage.getItem('inbox3_wallet_address') || '0xuser' } catch { /* storage unavailable */ }
      const envelope = ampMessenger.createEnvelope(
        userAddress,
        'human',
        targetAddress,
        'agent',
        message.trim(),
        'text',
        'request',
        true,
      )
      try { localStorage.setItem(`inbox3_amp_envelope_${Date.now()}`, ampMessenger.serializeEnvelope(envelope)) } catch { /* storage full */ }
    }

    let finalMessage = message.trim()
    if (premium) {
      finalMessage = `[PREMIUM] ${finalMessage}`
    }
    if (anonymous) {
      finalMessage = `[ANON] ${finalMessage}`
    }
    if (agentMode) {
      finalMessage = `[AMP] ${finalMessage}`
    }

    const displayName = name.trim() || (resolvedName ? `${address.trim()}` : targetAddress.slice(0, 8))
    onSend(targetAddress, displayName, finalMessage, senderKey)
    setAddress('')
    setName('')
    setMessage('')
    setPremium(false)
    setAnonymous(false)
    setAgentMode(false)
    setResolvedName(null)
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#12121A] border border-white/[0.08] rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">New Message</h2>
          <button onClick={onClose} aria-label="Close modal" className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
            <X className="w-4 h-4 text-white/40" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-mono text-slate-400 mb-1.5 block">Recipient Address or .apt Name</label>
            <div className="relative">
              <input
                type="text"
                placeholder="0x1a2b...3c4d or alice.apt"
                value={address}
                onChange={e => handleAddressChange(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl h-10 px-4 text-sm text-white placeholder:text-slate-600 focus:ring-1 focus:ring-white/10 focus:outline-none transition-all font-mono pr-10"
              />
              {resolving && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader className="w-4 h-4 text-[#A855F7] animate-spin" />
                </div>
              )}
            </div>
            {resolvedName && (
              <p className="text-[10px] text-green-400 font-mono mt-1">
                → {resolvedName}
              </p>
            )}
          </div>

          <div>
            <label className="text-xs font-mono text-slate-400 mb-1.5 block">Display Name (optional)</label>
            <input
              type="text"
              placeholder="Alice"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl h-10 px-4 text-sm text-white placeholder:text-slate-600 focus:ring-1 focus:ring-white/10 focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-mono text-slate-400 mb-1.5 block">Message</label>
            <textarea
              placeholder="Type your encrypted message..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={4}
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-sm text-white placeholder:text-slate-600 focus:ring-1 focus:ring-white/10 focus:outline-none transition-all resize-none"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer group">
              <button
                type="button"
                onClick={() => setPremium(!premium)}
                role="switch"
                aria-checked={premium}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPremium(p => !p) } }}
                className={`relative w-8 h-4 rounded-full transition-colors ${
                  premium ? 'bg-[#FF6B35]' : 'bg-white/10'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${
                    premium ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </button>
              <span className="flex items-center gap-1 text-xs text-white/40 group-hover:text-white/60 transition-colors">
                <Zap className="w-3 h-3" />
                Premium (x402)
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer group">
              <button
                type="button"
                onClick={() => setAnonymous(!anonymous)}
                role="switch"
                aria-checked={anonymous}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setAnonymous(a => !a) } }}
                className={`relative w-8 h-4 rounded-full transition-colors ${
                  anonymous ? 'bg-[#A855F7]' : 'bg-white/10'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${
                    anonymous ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </button>
              <span className="flex items-center gap-1 text-xs text-white/40 group-hover:text-white/60 transition-colors">
                <Eye className="w-3 h-3" />
                Anonymous
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer group">
              <button
                type="button"
                onClick={() => setAgentMode(!agentMode)}
                role="switch"
                aria-checked={agentMode}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setAgentMode(a => !a) } }}
                className={`relative w-8 h-4 rounded-full transition-colors ${
                  agentMode ? 'bg-blue-500' : 'bg-white/10'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${
                    agentMode ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </button>
              <span className="flex items-center gap-1 text-xs text-white/40 group-hover:text-white/60 transition-colors">
                <Bot className="w-3 h-3" />
                Agent (AMP)
              </span>
            </label>
          </div>

          {error && (
            <p className="text-xs text-red-400 font-mono">{error}</p>
          )}

          <button
            type="submit"
            disabled={resolving}
            className="w-full h-11 bg-gradient-to-r from-[#A855F7] to-[#FF6B35] text-white font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 text-sm"
          >
            <Send className="w-3.5 h-3.5" />
            {agentMode ? 'Send to Agent' : anonymous ? 'Send Anonymously' : premium ? 'Send Premium' : 'Send Encrypted Message'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  )
}
