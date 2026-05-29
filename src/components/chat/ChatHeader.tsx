import { Phone, Video, MoreVertical, ArrowLeft } from 'lucide-react'
import type { Contact } from '../../hooks/useContactManager'
import { toast } from 'sonner'

interface ChatHeaderProps {
  contact: Contact
  onBack: () => void
}

export default function ChatHeader({ contact, onBack }: ChatHeaderProps) {
  const displayName = contact.name.endsWith('.apt') ? contact.name.replace(/\.apt$/i, '') : contact.name
  const isAName = contact.name.endsWith('.apt')

  return (
    <div className="flex items-center justify-between p-4 border-b border-white/5 bg-black/50 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          data-testid="back-button"
          className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-white/60" />
        </button>

        <div className="relative">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FF5A00] to-[#FF7A00] flex items-center justify-center text-xs font-semibold text-white">
            {contact.avatar}
          </div>
          {contact.online && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-black" />
          )}
        </div>

        <div>
          <p className="text-sm font-medium text-white">
            {displayName}
            {isAName && (
              <span className="ml-1.5 px-1 py-0.5 bg-[#FF6B35]/20 text-[#FF6B35] text-[9px] font-mono rounded">ANS</span>
            )}
          </p>
          <p className="text-xs text-white/30 font-mono">
            {contact.online ? 'Online' : 'Last seen recently'}
            <span className="ml-2 text-white/20">{contact.address.slice(0, 8)}...{contact.address.slice(-4)}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button type="button" aria-label="Voice call" onClick={() => toast.info('Voice calls coming soon')} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
          <Phone className="w-4 h-4 text-white/60" />
        </button>
        <button type="button" aria-label="Video call" onClick={() => toast.info('Video calls coming soon')} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
          <Video className="w-4 h-4 text-white/60" />
        </button>
        <button type="button" aria-label="More options" onClick={() => toast.info('More options coming soon')} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
          <MoreVertical className="w-4 h-4 text-white/60" />
        </button>
      </div>
    </div>
  )
}
