import { useState, useMemo } from 'react'
import { Zap, Key, Plus, Trash2, Shield, X, Check, Copy, DollarSign, ExternalLink } from 'lucide-react'
import { useStakedMessaging } from '../../hooks/useStakedMessaging'
import { toast } from 'sonner'

export default function PremiumMessagingPanel() {
  const { config, updateConfig, sessionKeys, generateSessionKey, revokeSessionKey, stakeAmount, getX402Receipts } = useStakedMessaging()
  const [showGenerate, setShowGenerate] = useState(false)
  const [keyLabel, setKeyLabel] = useState('')
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const receipts = getX402Receipts()
  const recentReceipts = useMemo(() => receipts.slice(-3).reverse(), [receipts])

  const handleToggleStake = () => {
    updateConfig({ enabled: !config.enabled })
    if (!config.enabled) {
      toast.success(`Staked messaging enabled (${stakeAmount} APT minimum)`)
    } else {
      toast.info('Staked messaging disabled')
    }
  }

  const handleToggleX402 = () => {
    updateConfig({ x402Enabled: !config.x402Enabled })
    if (!config.x402Enabled) {
      toast.success('x402 USDC payments enabled on Base')
    } else {
      toast.info('x402 payments disabled')
    }
  }

  const handleGenerate = async () => {
    if (!keyLabel.trim()) return
    const result = await generateSessionKey(keyLabel.trim())
    if (result) {
      toast.success('Session key generated')
      setKeyLabel('')
      setShowGenerate(false)
    } else {
      toast.error('Failed to generate session key')
    }
  }

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
    toast.success('Public key copied')
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-4 h-4 text-[#FF6B35]" />
        <h3 className="text-sm font-semibold text-white">x402 Premium Messaging</h3>
      </div>

      <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
        <div className="flex items-center gap-3">
          <Shield className={`w-4 h-4 ${config.enabled ? 'text-[#A855F7]' : 'text-white/20'}`} />
          <div>
            <p className="text-sm font-medium text-white">Staked Messaging</p>
            <p className="text-xs text-white/30">{stakeAmount} APT minimum stake from unknown senders</p>
          </div>
        </div>
        <button
          onClick={handleToggleStake}
          role="switch"
          aria-checked={config.enabled}
          className={`relative w-10 h-5 rounded-full transition-colors ${
            config.enabled ? 'bg-[#A855F7]' : 'bg-white/10'
          }`}
        >
          <span
            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
              config.enabled ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
        <div className="flex items-center gap-3">
          <DollarSign className={`w-4 h-4 ${config.x402Enabled ? 'text-green-400' : 'text-white/20'}`} />
          <div>
            <p className="text-sm font-medium text-white">x402 Pay-Per-Message</p>
            <p className="text-xs text-white/30">USDC on Base via Coinbase facilitator</p>
          </div>
        </div>
        <button
          onClick={handleToggleX402}
          role="switch"
          aria-checked={config.x402Enabled}
          className={`relative w-10 h-5 rounded-full transition-colors ${
            config.x402Enabled ? 'bg-green-500' : 'bg-white/10'
          }`}
        >
          <span
            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
              config.x402Enabled ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {receipts.length > 0 && (
        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <div className="flex items-center gap-2 mb-2">
            <ExternalLink className="w-3 h-3 text-white/40" />
            <p className="text-xs font-medium text-white/60">Recent x402 Payments</p>
          </div>
          <div className="space-y-1">
            {recentReceipts.map(r => (
              <div key={r.id} className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-white/40">{r.id.slice(0, 12)}...</span>
                <span className="text-green-400">{r.amount} USDC</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-3.5 h-3.5 text-white/40" />
            <p className="text-xs font-medium text-white/60">Session Keys</p>
          </div>
          <button
            onClick={() => setShowGenerate(true)}
            className="flex items-center gap-1 text-xs text-[#A855F7] hover:opacity-80 transition-opacity"
          >
            <Plus className="w-3 h-3" />
            Generate
          </button>
        </div>

        {showGenerate && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
            <input
              type="text"
              placeholder="Key label..."
              value={keyLabel}
              onChange={e => setKeyLabel(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleGenerate()}
              className="flex-1 bg-transparent text-xs text-white placeholder:text-white/20 outline-none"
            />
            <button onClick={handleGenerate} aria-label="Confirm generate key" className="p-1 rounded hover:bg-white/5 transition-colors">
              <Check className="w-3 h-3 text-green-400" />
            </button>
            <button onClick={() => { setShowGenerate(false); setKeyLabel('') }} aria-label="Cancel generate key" className="p-1 rounded hover:bg-white/5 transition-colors">
              <X className="w-3 h-3 text-white/40" />
            </button>
          </div>
        )}

        <div className="space-y-1 max-h-32 overflow-y-auto">
          {sessionKeys.length === 0 && (
            <p className="text-xs text-white/20 py-2 text-center">No session keys yet</p>
          )}
          {sessionKeys.map(key => (
            <div
              key={key.publicKey}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white truncate">{key.label}</p>
                <p className="text-[10px] text-white/20 font-mono truncate">
                  {key.publicKey.slice(0, 16)}...
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleCopyKey(key.publicKey)}
                  aria-label={copiedKey === key.publicKey ? 'Copied' : 'Copy session key'}
                  className="p-1 rounded hover:bg-white/5 transition-colors"
                >
                  {copiedKey === key.publicKey ? (
                    <Check className="w-3 h-3 text-green-400" />
                  ) : (
                    <Copy className="w-3 h-3 text-white/30" />
                  )}
                </button>
                <button
                  onClick={() => { revokeSessionKey(key.publicKey); toast.info('Session key revoked') }}
                  aria-label="Revoke session key"
                  className="p-1 rounded hover:bg-white/5 transition-colors"
                >
                  <Trash2 className="w-3 h-3 text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
