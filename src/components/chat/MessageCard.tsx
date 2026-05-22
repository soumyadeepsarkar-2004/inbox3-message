import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, CheckCheck, AlertCircle } from 'lucide-react'

export interface Message {
  id: string
  sender: string
  senderAddress: string
  content: string
  timestamp: string
  direction: 'sent' | 'received'
  status: 'mempool' | 'confirmed' | 'failed'
  reactions?: { emoji: string; count: number; users: string[] }[]
  type?: 'text' | 'image' | 'voice'
  voiceUrl?: string
  voiceDuration?: number
}

const EMOJI_REACTIONS = ['❤️', '👍', '😂', '😮', '😢', '🔥']

interface MessageCardProps {
  message: Message
  onReact: (messageId: string, emoji: string) => void
  isLast: boolean
}

export default function MessageCard({ message, onReact, isLast }: MessageCardProps) {
  const [showReactions, setShowReactions] = useState(false)
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null)
  const reactionRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = () => {
    const timer = setTimeout(() => setShowReactions(true), 500)
    setLongPressTimer(timer)
  }

  const handleMouseUp = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      setLongPressTimer(null)
    }
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (reactionRef.current && !reactionRef.current.contains(e.target as Node)) {
        setShowReactions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const voiceBars = useMemo(() => 
    Array.from({ length: 20 }).map((_, i) => ({
      height: Math.random() * 12 + 4,
      key: i,
    })),
    []
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`flex ${message.direction === 'sent' ? 'justify-end' : 'justify-start'} mb-1 group`}
    >
      <div className="relative max-w-[70%]">
        <div
          className={`px-4 py-2.5 rounded-2xl ${
            message.direction === 'sent'
              ? 'bg-gradient-to-br from-[#FF5A00] to-[#FF7A00] text-white rounded-br-md'
              : 'bg-[#1A1A1A] text-white rounded-bl-md border border-white/5'
          } ${message.status === 'failed' ? 'opacity-60' : ''}`}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {message.type === 'voice' ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-sm" />
              </div>
              <div className="flex items-center gap-0.5">
                {voiceBars.map((bar) => (
                  <div
                    key={bar.key}
                    className="w-0.5 bg-white/60 rounded-full"
                    style={{ height: `${bar.height}px` }}
                  />
                ))}
              </div>
              <span className="text-xs text-white/60 ml-1">{message.voiceDuration}s</span>
            </div>
          ) : message.type === 'image' ? (
            <div className="rounded-lg overflow-hidden mb-1">
              <img src={message.content} alt="Attachment" className="max-w-full h-auto" />
            </div>
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
          )}

          <div className={`flex items-center gap-1 mt-1 ${message.direction === 'sent' ? 'justify-end' : ''}`}>
            <span className="text-[10px] text-white/50">{message.timestamp}</span>
            {message.direction === 'sent' && (
              message.status === 'confirmed' ? (
                <CheckCheck className="w-3 h-3 text-blue-300" />
              ) : message.status === 'mempool' ? (
                <Check className="w-3 h-3 text-white/50" />
              ) : (
                <AlertCircle className="w-3 h-3 text-red-300" />
              )
            )}
          </div>
        </div>

        {message.reactions && message.reactions.length > 0 && (
          <div className="flex gap-1 mt-1">
            {message.reactions.map((r, i) => (
              <button
                key={i}
                onClick={() => onReact(message.id, r.emoji)}
                className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-[#1A1A1A] border border-white/10 text-xs hover:bg-white/10 transition-colors"
              >
                <span>{r.emoji}</span>
                <span className="text-white/60">{r.count}</span>
              </button>
            ))}
          </div>
        )}

        <AnimatePresence>
          {showReactions && isLast && (
            <motion.div
              ref={reactionRef}
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className={`absolute ${message.direction === 'sent' ? 'left-0' : 'right-0'} -top-10 z-10`}
            >
              <div className="flex gap-1 px-2 py-1.5 rounded-full bg-[#1A1A1A] border border-white/10 shadow-xl backdrop-blur-xl">
                {EMOJI_REACTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      onReact(message.id, emoji)
                      setShowReactions(false)
                    }}
                    className="text-lg hover:scale-125 transition-transform p-0.5"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
