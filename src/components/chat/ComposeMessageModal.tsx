import { useState } from 'react'
import { X, Send, ArrowRight } from 'lucide-react'

interface ComposeMessageModalProps {
  open: boolean
  onClose: () => void
  onSend: (address: string, name: string, message: string) => void
}

export default function ComposeMessageModal({ open, onClose, onSend }: ComposeMessageModalProps) {
  const [address, setAddress] = useState('')
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  if (!open) return null

  const isValidAddress = (addr: string) => /^0x[a-fA-F0-9]{1,64}$/.test(addr)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!address.trim()) {
      setError('Wallet address is required')
      return
    }

    if (!isValidAddress(address.trim())) {
      setError('Invalid Aptos wallet address (must start with 0x)')
      return
    }

    if (!message.trim()) {
      setError('Message cannot be empty')
      return
    }

    onSend(address.trim(), name.trim() || address.trim().slice(0, 8), message.trim())
    setAddress('')
    setName('')
    setMessage('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#12121A] border border-white/[0.08] rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">New Message</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
            <X className="w-4 h-4 text-white/40" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-mono text-slate-400 mb-1.5 block">Recipient Aptos Address</label>
            <input
              type="text"
              placeholder="0x1a2b...3c4d"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl h-10 px-4 text-sm text-white placeholder:text-slate-600 focus:ring-1 focus:ring-[#FF5A00]/30 focus:border-[#FF5A00]/40 focus:outline-none transition-all font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-mono text-slate-400 mb-1.5 block">Display Name (optional)</label>
            <input
              type="text"
              placeholder="Alice"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl h-10 px-4 text-sm text-white placeholder:text-slate-600 focus:ring-1 focus:ring-[#FF5A00]/30 focus:border-[#FF5A00]/40 focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-mono text-slate-400 mb-1.5 block">Message</label>
            <textarea
              placeholder="Type your encrypted message..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={4}
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-sm text-white placeholder:text-slate-600 focus:ring-1 focus:ring-[#FF5A00]/30 focus:border-[#FF5A00]/40 focus:outline-none transition-all resize-none"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 font-mono">{error}</p>
          )}

          <button
            type="submit"
            className="w-full h-11 bg-gradient-to-r from-[#FF5A00] to-[#FF7A00] text-black font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 text-sm"
          >
            <Send className="w-3.5 h-3.5" />
            Send Encrypted Message
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  )
}
