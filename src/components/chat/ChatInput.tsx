import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Smile, Paperclip, Mic, X, Image, FileText, Zap } from 'lucide-react'
import { toast } from 'sonner'

interface ChatInputProps {
  onSend: (content: string, type: 'text' | 'image' | 'voice' | 'blink',   blinkData?: Record<string, unknown>) => void
  disabled?: boolean
  isEphemeral?: boolean
  onToggleEphemeral?: () => void
}

export default function ChatInput({ onSend, disabled, isEphemeral, onToggleEphemeral }: ChatInputProps) {
  const [message, setMessage] = useState('')
  const [showAttachments, setShowAttachments] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const emojiPickerRef = useRef<HTMLDivElement>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const insertEmoji = (emoji: string) => {
    const el = inputRef.current
    if (el) {
      const start = el.selectionStart ?? message.length
      const end = el.selectionEnd ?? message.length
      const newVal = message.slice(0, start) + emoji + message.slice(end)
      setMessage(newVal)
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = start + emoji.length
        el.focus()
      })
    }
    setShowEmojiPicker(false)
  }

  const EMOJI_CATEGORIES: { name: string; items: string[] }[] = [
    { name: 'Smileys', items: ['😀','😃','😄','😁','😆','😂','🤣','😊','😇','🙂','😉','😌','😍','🥰','😘','😋','😎','🤩','🥳','😏','😬','🤔','🤗','🤭','🫡','😢','😭','😱','🤯','🥶','🥵','💀'] },
    { name: 'Gestures', items: ['👍','👎','👌','✌️','🤞','🤟','🤘','👋','✊','🤝','🙏','💪'] },
    { name: 'Hearts', items: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💕','💗','💖'] },
    { name: 'Symbols', items: ['🔥','💯','✅','❌','⭐','✨','🎉','🎊','🎁','🏆','🚀','💎','👑','🎯','🧠','👀','💡'] },
  ]

  const handleSend = () => {
    if (!message.trim() || disabled) return
    onSend(message.trim(), 'text')
    setMessage('')
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStreamRef.current = stream
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const reader = new FileReader()
        reader.onload = () => {
          onSend(reader.result as string, 'voice')
        }
        reader.readAsDataURL(blob)
        stream.getTracks().forEach(t => t.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000)
    } catch {
      toast.error('Microphone access denied')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    if (timerRef.current) clearInterval(timerRef.current)
    setIsRecording(false)
    setRecordingTime(0)
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop())
        mediaStreamRef.current = null
      }
    }
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="p-4 border-t border-white/5">
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-between mb-3 px-2 py-2 rounded-xl bg-red-500/10 border border-red-500/20"
          >
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm text-red-400 font-mono">{formatTime(recordingTime)}</span>
            </div>
            <button
              onClick={stopRecording}
              className="px-4 py-1.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
            >
              Stop
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-2 relative">
        <div className="relative">
          <button
            onClick={() => setShowAttachments(!showAttachments)}
            className="p-2.5 rounded-xl bg-[#1A1A1A] hover:bg-white/10 transition-colors"
            aria-label="Attach file"
          >
            <Paperclip className="w-4 h-4 text-white/40" />
          </button>
          <AnimatePresence>
            {showAttachments && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute bottom-full left-0 mb-3 w-48 bg-[#1A1A1A] border border-white/10 rounded-2xl p-2 shadow-xl z-10"
              >
                <label className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors text-white text-sm">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <Image className="w-4 h-4" />
                  </div>
                  Photo & Video
                  <input
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        if (file.size > 10 * 1024 * 1024) {
                          toast.error('File too large (max 10 MB)')
                          return
                        }
                        setUploadProgress(0)
                        const reader = new FileReader()
                        reader.onprogress = (ev) => {
                          if (ev.lengthComputable) setUploadProgress(Math.round((ev.loaded / ev.total) * 100))
                        }
                        reader.onload = () => {
                          setUploadProgress(null)
                          onSend(reader.result as string, 'image')
                        }
                        reader.onerror = () => {
                          setUploadProgress(null)
                          toast.error('Image upload failed')
                        }
                        reader.readAsDataURL(file)
                      }
                      setShowAttachments(false)
                      e.target.value = ''
                    }}
                  />
                </label>
                <label className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors text-white text-sm mt-1 cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  Document
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        if (file.size > 10 * 1024 * 1024) {
                          toast.error('File too large (max 10 MB)')
                          return
                        }
                        setUploadProgress(0)
                        const reader = new FileReader()
                        reader.onprogress = (ev) => {
                          if (ev.lengthComputable) {
                            setUploadProgress(Math.round((ev.loaded / ev.total) * 100))
                          }
                        }
                        reader.onload = () => {
                          setUploadProgress(null)
                          onSend(reader.result as string, 'text')
                        }
                        reader.onerror = () => {
                          setUploadProgress(null)
                          toast.error('File upload failed')
                        }
                        reader.readAsDataURL(file)
                      }
                      setShowAttachments(false)
                      e.target.value = ''
                    }}
                  />
                </label>
                <button 
                  onClick={() => {
                    const blinkData = {
                      title: "Payment Request",
                      description: "Send 5 APT to settle the bill.",
                      source: "Inbox3",
                      actions: [{ id: "pay_5_apt", label: "Pay 5 APT", type: "transaction", payload: { amount: 5 } }]
                    }
                    onSend(JSON.stringify(blinkData), 'blink', blinkData)
                    setShowAttachments(false)
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors text-white text-sm mt-1"
                >
                  <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400">
                    <Zap className="w-4 h-4" />
                  </div>
                  Smart Action
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {onToggleEphemeral && (
          <button
            onClick={onToggleEphemeral}
            role="switch"
            aria-checked={isEphemeral}
            aria-label="Toggle ephemeral mode"
            className={`p-2.5 rounded-xl transition-colors ${
              isEphemeral ? 'bg-[#FF5A00]/20 border border-[#FF5A00]/50' : 'bg-[#1A1A1A] hover:bg-white/10'
            }`}
          >
            <span className={isEphemeral ? 'text-[#FF5A00]' : 'text-white/40'}>👻</span>
          </button>
        )}

        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || isRecording}
            className="w-full bg-[#1A1A1A] rounded-xl h-11 px-4 pr-10 text-sm text-white placeholder:text-white/20 focus:ring-2 focus:ring-white/10 focus:outline-none disabled:opacity-50"
          />
          <div ref={emojiPickerRef} className="absolute right-2 top-1/2 -translate-y-1/2">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              aria-label="Emoji picker"
              className="p-1 rounded hover:bg-white/10 transition-colors"
            >
              <Smile className="w-4 h-4 text-white/40" />
            </button>
            <AnimatePresence>
              {showEmojiPicker && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute bottom-full right-0 mb-2 w-[312px] max-h-72 overflow-y-auto bg-[#1A1A1A] border border-white/10 rounded-2xl p-3 shadow-xl z-10"
                >
                  {EMOJI_CATEGORIES.map((cat) => (
                    <div key={cat.name} className="mb-2 last:mb-0">
                      <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1.5 px-1">{cat.name}</p>
                      <div className="grid grid-cols-8 gap-0.5">
                        {cat.items.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => insertEmoji(emoji)}
                            className="w-8 h-8 flex items-center justify-center text-lg hover:bg-white/10 rounded-lg transition-colors"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {uploadProgress !== null && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#FF6B35] rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
              </div>
              <span className="text-[10px] text-white/40 font-mono">{uploadProgress}%</span>
            </div>
          )}
        </div>

        {message.trim() ? (
          <button
            onClick={handleSend}
            disabled={disabled}
            aria-label="Send message"
            className="p-2.5 rounded-xl bg-[#FF5A00] hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        ) : (
          <button
            onClick={isRecording ? stopRecording : startRecording}
            aria-label={isRecording ? 'Stop recording' : 'Start recording'}
            className={`p-2.5 rounded-xl transition-all active:scale-95 ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                : 'bg-[#1A1A1A] hover:bg-white/10'
            }`}
          >
            {isRecording ? (
              <X className="w-4 h-4 text-white" />
            ) : (
              <Mic className="w-4 h-4 text-white/40" />
            )}
          </button>
        )}
      </div>

      <p className="text-[10px] text-white/20 text-center mt-2 flex items-center justify-center gap-1">
        End-to-end encrypted. Messages stored on Aptos blockchain.
      </p>
    </div>
  )
}
