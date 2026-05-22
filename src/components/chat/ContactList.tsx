import { motion } from 'framer-motion'
import { useAppStore } from '../../store/useAppStore'
import type { Contact } from '../../hooks/useContactManager'

interface ContactListProps {
  contacts: Contact[]
  onSelect: (contact: Contact) => void
}

export default function ContactList({ contacts, onSelect }: ContactListProps) {
  const { selectedContactId } = useAppStore()

  return (
    <div className="p-2 space-y-1 overflow-y-auto flex-1">
      {contacts.map((contact, i) => (
        <motion.button
          key={contact.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.03, type: 'spring', stiffness: 300, damping: 30 }}
          onClick={() => onSelect(contact)}
          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${
            selectedContactId === contact.id
              ? 'bg-white/5 border border-white/5'
              : 'hover:bg-white/5 border border-transparent'
          }`}
        >
          <div className="relative flex-shrink-0">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#FF5A00] to-[#FF7A00] flex items-center justify-center text-sm font-semibold text-white">
              {contact.avatar}
            </div>
            {contact.online && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white truncate">{contact.name}</span>
              <span className="text-xs text-white/30 ml-2 flex-shrink-0">{contact.timestamp}</span>
            </div>
            <div className="flex items-center justify-between mt-0.5">
              <p className="text-xs text-white/40 truncate">{contact.lastMessage}</p>
              {contact.unread > 0 && (
                <span className="ml-2 w-5 h-5 bg-[#FF5A00] rounded-full flex items-center justify-center text-[10px] font-semibold text-white flex-shrink-0">
                  {contact.unread}
                </span>
              )}
            </div>
          </div>
        </motion.button>
      ))}

      {contacts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-white/30 text-sm">No conversations found</p>
        </div>
      )}
    </div>
  )
}
