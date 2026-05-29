import { useState } from 'react'
import { Hash, Plus, Check, Lock, Users, Trash2 } from 'lucide-react'
import { useTokenGatedChannels, type Channel } from '../../hooks/useTokenGatedChannels'
import { toast } from 'sonner'

export default function ChannelPanel({ onSelectChannel }: { onSelectChannel: (c: Channel) => void }) {
  const { channels, createChannel, removeChannel } = useTokenGatedChannels()
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [tokenAddress, setTokenAddress] = useState('')
  const [minBalance, setMinBalance] = useState('')

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error('Channel name is required')
      return
    }
    createChannel({
      name: name.trim(),
      description: description.trim(),
      tokenAddress: tokenAddress.trim() || undefined,
      minBalance: minBalance ? Number(minBalance) : undefined,
      createdBy: 'you',
    })
    setName('')
    setDescription('')
    setTokenAddress('')
    setMinBalance('')
    setShowCreate(false)
    toast.success(`Channel "${name.trim()}" created`)
  }

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Hash className="w-4 h-4 text-[#A855F7]" />
          <h3 className="text-sm font-semibold text-white">Token-Gated Channels</h3>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#A855F7] text-white text-xs font-medium hover:opacity-90 transition-all"
        >
          <Plus className="w-3 h-3" />
          Create
        </button>
      </div>

      {showCreate && (
        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-3">
          <input
            type="text"
            placeholder="Channel name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg h-9 px-3 text-xs text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg h-9 px-3 text-xs text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
          />
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Token address (optional)"
              value={tokenAddress}
              onChange={e => setTokenAddress(e.target.value)}
              className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-lg h-9 px-3 text-xs text-white placeholder:text-white/20 font-mono focus:outline-none focus:ring-1 focus:ring-white/10"
            />
            <input
              type="number"
              placeholder="Min balance"
              value={minBalance}
              onChange={e => setMinBalance(e.target.value)}
              className="w-24 bg-white/[0.03] border border-white/[0.06] rounded-lg h-9 px-3 text-xs text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
            />
          </div>
          {tokenAddress && (
            <p className="text-[10px] text-white/30 flex items-center gap-1">
              <Lock className="w-2.5 h-2.5" />
              Members must hold at least {minBalance || 'any'} tokens at this address
            </p>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCreate}
              className="flex-1 h-8 rounded-lg bg-gradient-to-r from-[#A855F7] to-[#FF6B35] text-white text-xs font-medium hover:opacity-90 transition-all flex items-center justify-center gap-1"
            >
              <Check className="w-3 h-3" />
              Create Channel
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="h-8 px-3 rounded-lg bg-white/[0.03] text-white/40 text-xs hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {channels.length === 0 && (
          <div className="text-center py-6">
            <Hash className="w-6 h-6 text-white/10 mx-auto mb-2" />
            <p className="text-xs text-white/20">No channels yet</p>
            <p className="text-[10px] text-white/10 mt-1">Create a token-gated channel to get started</p>
          </div>
        )}
        {channels.map((channel: Channel) => (
          <div
            key={channel.id}
            onClick={() => onSelectChannel(channel)}
            className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white truncate">{channel.name}</span>
                  {channel.tokenAddress && (
                    <Lock className="w-3 h-3 text-[#FF6B35] shrink-0" />
                  )}
                </div>
                {channel.description && (
                  <p className="text-xs text-white/30 mt-0.5 truncate">{channel.description}</p>
                )}
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] text-white/20 flex items-center gap-1">
                    <Users className="w-2.5 h-2.5" />
                    {channel.memberCount} member{channel.memberCount !== 1 ? 's' : ''}
                  </span>
                  {channel.tokenAddress && (
                    <span className="text-[10px] text-white/20 font-mono truncate max-w-32">
                      {channel.tokenAddress.slice(0, 8)}...
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); removeChannel(channel.id); toast.info('Channel removed') }}
                aria-label="Remove channel"
                className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
              >
                <Trash2 className="w-3 h-3 text-white/20 hover:text-red-400 transition-colors" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
