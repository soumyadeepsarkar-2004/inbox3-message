import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, CheckCheck, AlertCircle, Eye, Sprout, Bot } from 'lucide-react'
import AptosBlink, { type BlinkProps } from '../AptosBlink'
import type { AITags } from '../../lib/aiAgent'

export interface Message {
  id: string
  sender: string
  senderAddress: string
  content: string
  timestamp: string
  direction: 'sent' | 'received'
  status: 'mempool' | 'confirmed' | 'failed'
  reactions?: { emoji: string; count: number; users: string[] }[]
  type?: 'text' | 'image' | 'voice' | 'blink'
  voiceUrl?: string
  voiceDuration?: number
  blinkData?: Record<string, unknown>
  isEphemeral?: boolean
  aiTags?: AITags
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
  const [isRevealed, setIsRevealed] = useState(!message.isEphemeral)
  const [burnTimer, setBurnTimer] = useState(10)
  const [isBurned, setIsBurned] = useState(false)
  const [yieldEarned, setYieldEarned] = useState(0)
  const reactionRef = useRef<HTMLDivElement>(null)
  const isSent = message.direction === 'sent'

  // Yield Simulation Logic
  useEffect(() => {
    if (message.direction === 'received' && !isRevealed && message.status === 'confirmed') {
      const interval = setInterval(() => {
        setYieldEarned(prev => prev + 0.0000001)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [message.direction, isRevealed, message.status])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (message.isEphemeral && isRevealed && burnTimer > 0) {
      interval = setInterval(() => {
        setBurnTimer((prev) => prev - 1)
      }, 1000)
    } else if (message.isEphemeral && isRevealed && burnTimer === 0) {
      setIsBurned(true)
    }
    return () => clearInterval(interval)
  }, [isRevealed, burnTimer, message.isEphemeral])

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
      className={`flex ${isSent ? 'justify-end' : 'justify-start'} mb-1 group`}
    >
      <div className={`flex items-end gap-2 max-w-[85%] ${isSent ? 'flex-row-reverse' : 'flex-row'}`}>
        {!isSent && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#A855F7] to-[#FF6B35] flex items-center justify-center flex-shrink-0 shadow-lg">
            <span className="text-xs font-bold text-white">{message.sender.charAt(0).toUpperCase()}</span>
          </div>
        )}

        <div className={`flex flex-col gap-1 ${isSent ? 'items-end' : 'items-start'}`}>
          <div className="flex items-center gap-2 px-1">
            <span className="text-xs font-medium text-white/60">{message.sender}</span>
            <span className="text-[10px] text-white/40">{message.timestamp}</span>
            {message.direction === 'received' && !isRevealed && message.status === 'confirmed' && (
              <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">
                <Sprout className="w-3 h-3" />
                +{yieldEarned.toFixed(7)} APT
              </span>
            )}
          </div>

          <div className="relative">
            <div
              className={`px-4 py-2.5 rounded-2xl ${
                isSent
                  ? 'bg-gradient-to-br from-[#FF5A00] to-[#FF7A00] text-white rounded-br-md'
                  : 'bg-[#1A1A1A] text-white rounded-bl-md border border-white/5'
              } ${message.status === 'failed' ? 'opacity-60' : ''}`}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {isBurned ? (
                <p className="text-sm italic text-white/50 flex items-center gap-2"><Eye className="w-4 h-4"/> Message burned</p>
              ) : message.isEphemeral && !isRevealed ? (
                 <button 
                   onClick={() => setIsRevealed(true)}
                   className="text-sm font-medium flex items-center gap-2 px-2 py-1 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                 >
                   <Eye className="w-4 h-4"/> Click to reveal ({burnTimer}s fuse)
                 </button>
              ) : message.type === 'voice' ? (
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
              ) : message.type === 'blink' && message.blinkData ? (
                <div className="text-black overflow-hidden rounded-xl">
                  <AptosBlink 
                    {...(message.blinkData as unknown as BlinkProps)} 
                    onExecute={async (_action) => {
                      return new Promise(resolve => setTimeout(() => resolve(true), 1500))
                    }}
                  />
                </div>
              ) : message.type === 'image' ? (
                <div className="rounded-lg overflow-hidden mb-1">
                  <img src={message.content} alt="Attachment" className="max-w-full h-auto" />
                </div>
              ) : (
                <div className="flex flex-col">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
                  
                  {message.isEphemeral && (
                     <span className="text-[10px] font-mono mt-2 text-white/80 bg-black/20 self-start px-2 py-0.5 rounded-full">
                       Burns in {burnTimer}s
                     </span>
                  )}
                  
                  {message.aiTags && message.direction === 'received' && (
                    <div className="mt-3 flex flex-col gap-1.5 p-2 bg-black/20 rounded-lg border border-white/5">
                      <div className="flex items-center gap-2">
                        <Bot className="w-3.5 h-3.5 text-[#A855F7]" />
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm ${
                          message.aiTags.category === 'Urgent' ? 'bg-red-500/20 text-red-400' :
                          message.aiTags.category === 'Opportunity' ? 'bg-emerald-500/20 text-emerald-400' :
                          message.aiTags.category === 'Spam' ? 'bg-orange-500/20 text-orange-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {message.aiTags.category} ({message.aiTags.priorityScore}/100)
                        </span>
                      </div>
                      <p className="text-xs text-white/70 italic line-clamp-2 leading-tight border-l-2 border-[#A855F7]/30 pl-2">
                        "{message.aiTags.summary}"
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className={`flex items-center gap-1 mt-1 ${isSent ? 'justify-end' : ''}`}>
                <span className="text-[10px] text-white/50">{message.timestamp}</span>
                {isSent && (
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
                {message.reactions.map((r) => (
                  <button
                    key={r.emoji}
                    onClick={() => onReact(message.id, r.emoji)}
                    className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-[#1A1A1A] border border-white/10 text-xs hover:bg-white/10 transition-colors"
                  >
                    <span>{r.emoji}</span>
                    <span className="text-white/60">{r.count}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <AnimatePresence>
          {showReactions && isLast && (
            <motion.div
              ref={reactionRef}
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className={`absolute ${isSent ? 'left-0' : 'right-0'} -top-10 z-10`}
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
