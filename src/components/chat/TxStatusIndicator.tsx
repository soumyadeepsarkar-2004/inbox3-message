import { motion } from 'framer-motion'
import { Check, CheckCheck, Clock, AlertCircle } from 'lucide-react'

export type TxStatus = 'idle' | 'signing' | 'submitting' | 'confirmed' | 'failed'

interface TxStatusIndicatorProps {
  status: TxStatus
  hash?: string | null
}

const statusConfig: Record<TxStatus, { label: string; color: string; icon: React.ReactNode }> = {
  idle: { label: '', color: '', icon: null },
  signing: {
    label: 'Signing transaction...',
    color: 'text-yellow-400',
    icon: <Clock className="w-3 h-3 animate-pulse" />
  },
  submitting: {
    label: 'Submitting to Aptos Network...',
    color: 'text-blue-400',
    icon: <div className="w-3 h-3 border border-blue-400/50 border-t-blue-400 rounded-full animate-spin" />
  },
  confirmed: {
    label: 'Message delivered on-chain',
    color: 'text-green-400',
    icon: <CheckCheck className="w-3 h-3" />
  },
  failed: {
    label: 'Transaction failed',
    color: 'text-red-400',
    icon: <AlertCircle className="w-3 h-3" />
  }
}

export function TxStatusIndicator({ status, hash }: TxStatusIndicatorProps) {
  if (status === 'idle') return null

  const config = statusConfig[status]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`flex items-center gap-2 text-xs ${config.color} px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-sm`}
    >
      {config.icon}
      <span>{config.label}</span>
      {hash && status === 'confirmed' && (
        <a
          href={`https://explorer.aptoslabs.com/txn/${hash}?network=testnet`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:opacity-80"
        >
          View
        </a>
      )}
    </motion.div>
  )
}

interface MessageStatusIconProps {
  status: 'mempool' | 'confirmed' | 'failed'
}

export function MessageStatusIcon({ status }: MessageStatusIconProps) {
  if (status === 'mempool') {
    return <Check className="w-3 h-3 text-white/50" />
  }
  if (status === 'confirmed') {
    return <CheckCheck className="w-3 h-3 text-blue-400" />
  }
  return <AlertCircle className="w-3 h-3 text-red-400" />
}
