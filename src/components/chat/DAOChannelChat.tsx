import { useState, useEffect, useCallback } from 'react'
import { Hash, Users, ArrowLeft, Lock, Send, Plus } from 'lucide-react'
import { type Channel } from '../../hooks/useTokenGatedChannels'
import type { Message } from './MessageCard'
import MessageCard from './MessageCard'
import { toast } from 'sonner'

const STORAGE_PREFIX = 'inbox3_channel_messages_'

interface DAOChannelChatProps {
  channel: Channel
  onBack: () => void
}

function loadMessages(channelId: string): Message[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${channelId}`)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveMessages(channelId: string, messages: Message[]) {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${channelId}`, JSON.stringify(messages))
  } catch {
    toast.warning('Could not save channel messages locally')
  }
}

export default function DAOChannelChat({ channel, onBack }: DAOChannelChatProps) {
  const [messages, setMessages] = useState<Message[]>(() => {
    const stored = loadMessages(channel.id)
    if (stored.length > 0) return stored
    // Welcome message on first visit
    const welcome: Message = {
      id: `dao-welcome-${channel.id}`,
      sender: 'System',
      senderAddress: '0x000',
      content: `Welcome to the ${channel.name} channel. This channel is token-gated by ${channel.tokenAddress || 'an arbitrary contract'}. Only holders can view or send messages here.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      direction: 'received',
      status: 'confirmed',
      type: 'text'
    }
    saveMessages(channel.id, [welcome])
    return [welcome]
  })
  const [input, setInput] = useState('')

  useEffect(() => {
    setMessages(loadMessages(channel.id))
  }, [channel.id])

  const persist = useCallback((msgs: Message[]) => {
    setMessages(msgs)
    saveMessages(channel.id, msgs)
  }, [channel.id])

  const handleSend = () => {
    if (!input.trim()) return
    const newMsg: Message = {
      id: Date.now().toString(),
      sender: 'You',
      senderAddress: '0xme',
      content: input.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      direction: 'sent',
      status: 'confirmed',
      type: 'text'
    }
    persist([...messages, newMsg])
    setInput('')
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#12121A]/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button onClick={onBack} aria-label="Back" className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
            <Hash className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              {channel.name}
              {channel.tokenAddress && <Lock className="w-3 h-3 text-[#FF6B35]" />}
            </h2>
            <p className="text-[10px] text-white/40 flex items-center gap-1">
              <Users className="w-3 h-3" /> {channel.memberCount} members (Token-Gated)
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg, i) => (
          <MessageCard
            key={msg.id}
            message={msg}
            onReact={() => {}}
            isLast={i === messages.length - 1}
          />
        ))}
      </div>

      <div className="p-4 border-t border-white/5 bg-[#12121A]/80">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => toast.info('Attach file coming soon')}
            aria-label="Attach file"
            className="p-2.5 rounded-xl bg-[#1A1A1A] hover:bg-white/10 transition-colors"
          >
            <Plus className="w-4 h-4 text-white/40" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={`Message ${channel.name}...`}
            className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-xl h-11 px-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-white/10"
          />
          <button
            onClick={handleSend}
            aria-label="Send message"
            className="p-3 rounded-xl bg-[#A855F7] text-white hover:opacity-90 transition-opacity"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
