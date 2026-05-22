import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Smile, Paperclip, Mic, X, Image, FileText } from 'lucide-react'

interface ChatInputProps {
  onSend: (content: string, type: 'text' | 'image' | 'voice') => void
  disabled?: boolean
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('')
  const [showAttachments, setShowAttachments] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        onSend(url, 'voice')
        stream.getTracks().forEach(t => t.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000)
    } catch (err) {
      console.error('Failed to start recording:', err)
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

      <AnimatePresence>
        {showAttachments && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex gap-2 mb-3"
          >
            {[
              { icon: Image, label: 'Photo', color: 'bg-blue-500/20 text-blue-400' },
              { icon: FileText, label: 'Document', color: 'bg-purple-500/20 text-purple-400' },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => setShowAttachments(false)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl ${item.color} text-sm font-medium hover:opacity-80 transition-opacity`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowAttachments(!showAttachments)}
          className="p-2.5 rounded-xl bg-[#1A1A1A] hover:bg-white/10 transition-colors"
        >
          <Paperclip className="w-4 h-4 text-white/40" />
        </button>

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
          <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/10 transition-colors">
            <Smile className="w-4 h-4 text-white/40" />
          </button>
        </div>

        {message.trim() ? (
          <button
            onClick={handleSend}
            disabled={disabled}
            className="p-2.5 rounded-xl bg-[#FF5A00] hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        ) : (
          <button
            onClick={isRecording ? stopRecording : startRecording}
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
