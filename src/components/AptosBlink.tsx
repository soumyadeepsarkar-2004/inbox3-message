import { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { CheckCircle2, Coins, ArrowLeftRight } from 'lucide-react'
import { useWallet } from '../context/WalletProvider'

export interface BlinkAction {
  id: string
  label: string
  icon?: React.ReactNode
  type: 'transaction' | 'signature' | 'link'
  payload: Record<string, unknown>
}

export interface BlinkProps {
  title: string
  description: string
  image?: string
  source: string // e.g., 'Thala', 'Aries', 'Inbox3'
  actions: BlinkAction[]
  onExecute: (action: BlinkAction) => Promise<boolean>
}

/**
 * AptosBlink (Interactive Message Object)
 * Renders an executable "Blink" (Block-Link) directly in the chat stream.
 */
export default function AptosBlink({ title, description, image, source, actions, onExecute }: BlinkProps) {
  const [executing, setExecuting] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const { connected } = useWallet()

  const handleAction = async (action: BlinkAction) => {
    if (!connected) {
      toast.warning('Please connect your wallet first.')
      return
    }

    setExecuting(action.id)
    try {
      const result = await onExecute(action)
      if (result) {
        setSuccess(action.id)
      }
    } catch {
      toast.error(`Action "${action.label}" failed`)
    } finally {
      setExecuting(null)
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col bg-white border border-black/10 rounded-2xl overflow-hidden max-w-[340px] shadow-sm my-2"
    >
      {image && (
        <div className="w-full h-40 bg-[#F5F5F5] border-b border-black/5 overflow-hidden">
          <img src={image} alt={title} className="w-full h-full object-cover" />
        </div>
      )}
      
      <div className="p-4 flex flex-col gap-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-black/50 uppercase tracking-wide">
          <span className="w-4 h-4 bg-black/5 rounded flex items-center justify-center">
             {source === 'Thala' ? <ArrowLeftRight className="w-2.5 h-2.5 text-black" /> : <Coins className="w-2.5 h-2.5 text-black" />}
          </span>
          {source}
        </div>
        
        <h3 className="text-base font-semibold text-black tracking-tight leading-tight">{title}</h3>
        <p className="text-sm text-black/60 line-clamp-2 leading-relaxed">{description}</p>
        
        <div className="flex flex-col gap-2 mt-3">
          {actions.map((action) => {
            const isExecuting = executing === action.id
            const isSuccess = success === action.id

            return (
              <button
                key={action.id}
                onClick={() => handleAction(action)}
                disabled={isExecuting || isSuccess || executing !== null}
                className={`flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isSuccess 
                    ? 'bg-[#E8F5E9] text-[#2E7D32] border border-[#2E7D32]/20'
                    : 'bg-[#F5F5F5] hover:bg-black/5 text-black border border-black/5'
                }`}
              >
                {isExecuting ? (
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : isSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Completed
                  </>
                ) : (
                  <>
                    {action.icon}
                    {action.label}
                  </>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
