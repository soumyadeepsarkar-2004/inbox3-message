import { useState, useCallback, useEffect, useRef } from 'react'
import { MessageSquare, Users, Settings, Bell, Moon, Sun, LogOut, User, Shield, Key, Trash2, ChevronLeft, Plus, Circle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useWallet } from '../context/WalletProvider'
import { toast } from 'sonner'
import MessageCard, { type Message } from '../components/chat/MessageCard'
import ChatInput from '../components/chat/ChatInput'
import ChatHeader from '../components/chat/ChatHeader'
import ContactList from '../components/chat/ContactList'
import { SearchBar, FilterBar } from '../components/chat/SearchBar'
import { TxStatusIndicator, type TxStatus } from '../components/chat/TxStatusIndicator'
import ComposeMessageModal from '../components/chat/ComposeMessageModal'
import { useContactManager, type Contact } from '../hooks/useContactManager'
import { EncryptionManager } from '../lib/crypto'

const encryptionManager = new EncryptionManager()

const initialMessages: Record<string, Message[]> = {
  'welcome': [
    { id: 'w1', sender: 'Inbox3 Bot', senderAddress: '0x0000', content: 'Welcome to Inbox3! All messages are end-to-end encrypted.', timestamp: 'Just now', direction: 'received', status: 'confirmed' },
  ],
}

export default function MainApp() {
  const { user, logout } = useAuth()
  const { signAndSubmit } = useWallet()
  const navigate = useNavigate()
  const { contacts, addContact, searchContacts, markRead, updateContact } = useContactManager()
  const [activeTab, setActiveTab] = useState<'messages' | 'contacts' | 'settings'>('messages')
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [darkMode, setDarkMode] = useState(true)
  const [showSidebar, setShowSidebar] = useState(true)
  const [txStatus, setTxStatus] = useState<TxStatus>('idle')
  const [showCompose, setShowCompose] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)



  useEffect(() => {
    if (!encryptionManager.loadKeys()) {
      encryptionManager.generateKeys()
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSelectContact = useCallback((contact: Contact) => {
    setSelectedContact(contact)
    const stored = localStorage.getItem(`inbox3_messages_${contact.id}`)
    setMessages(stored ? JSON.parse(stored) : initialMessages[contact.id] || [])
    setTxStatus('idle')
    markRead(contact.id)
  }, [markRead])

  const persistMessages = useCallback((contactId: string, msgs: Message[]) => {
    try {
      localStorage.setItem(`inbox3_messages_${contactId}`, JSON.stringify(msgs))
    } catch {
      // Storage not available
    }
  }, [])

  const handleSend = useCallback(async (content: string, type: 'text' | 'image' | 'voice') => {
    if (!selectedContact) return

    setTxStatus('signing')
    const tempId = Date.now().toString()
    const recipientKey = encryptionManager.getPublicKey()
    let encryptedContent = content

    if (type === 'text' && recipientKey) {
      try {
        encryptedContent = encryptionManager.encrypt(content, selectedContact.address)
      } catch {
        encryptedContent = content
      }
    }

    const tempMsg: Message = {
      id: tempId,
      sender: 'You',
      senderAddress: user?.walletAddress || '0xme',
      content: encryptedContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      direction: 'sent',
      status: 'mempool',
      type,
    }

    const updated = [...messages, tempMsg]
    setMessages(updated)
    persistMessages(selectedContact.id, updated)

    const toastId = toast.loading('Signing transaction...')

    try {
      setTxStatus('submitting')
      toast.loading('Submitting to Aptos testnet...', { id: toastId })
      const hash = await signAndSubmit({ content: encryptedContent, recipient: selectedContact.address })

      if (hash) {
        const confirmed = messages.map(m =>
          m.id === tempId ? { ...m, status: 'confirmed' as const } : m
        )
        setMessages(confirmed)
        persistMessages(selectedContact.id, confirmed)
        setTxStatus('confirmed')
        toast.success('Message sent on-chain', {
          id: toastId,
          description: `Tx: ${hash.slice(0, 10)}...${hash.slice(-6)}`,
        })
      } else {
        const failed = messages.map(m =>
          m.id === tempId ? { ...m, status: 'failed' as const } : m
        )
        setMessages(failed)
        persistMessages(selectedContact.id, failed)
        setTxStatus('failed')
        toast.error('Transaction failed', { id: toastId })
      }
    } catch (err) {
      const failed = messages.map(m =>
        m.id === tempId ? { ...m, status: 'failed' as const } : m
      )
      setMessages(failed)
      persistMessages(selectedContact.id, failed)
      setTxStatus('failed')
      const message = err instanceof Error ? err.message : 'Transaction rejected'
      toast.error('Transaction failed', { id: toastId, description: message })
    }

    setTimeout(() => setTxStatus('idle'), 3000)
  }, [selectedContact, messages, user, signAndSubmit, persistMessages])

  const handleComposeSend = useCallback((address: string, name: string, message: string) => {
    const contact = addContact(address, name)
    if (!contact) return

    const msg: Message = {
      id: Date.now().toString(),
      sender: 'You',
      senderAddress: user?.walletAddress || '0xme',
      content: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      direction: 'sent',
      status: 'confirmed',
    }

    updateContact(contact.id, { lastMessage: message, timestamp: 'Just now' })

    const existing = JSON.parse(localStorage.getItem(`inbox3_messages_${contact.id}`) || '[]')
    existing.push(msg)
    persistMessages(contact.id, existing)

    setSelectedContact(contact)
    setMessages(existing)
    setActiveTab('messages')
    setShowSidebar(false)

    toast.success(`Message sent to ${name || address.slice(0, 8)}`)
  }, [addContact, user, updateContact, persistMessages])

  const handleReact = useCallback((messageId: string, emoji: string) => {
    setMessages(prev => {
      const next = prev.map(m => {
        if (m.id !== messageId) return m
        const reactions = m.reactions || []
        const existing = reactions.find(r => r.emoji === emoji)
        if (existing) {
          return { ...m, reactions: reactions.map(r => r.emoji === emoji ? { ...r, count: r.count + 1 } : r) }
        }
        return { ...m, reactions: [...reactions, { emoji, count: 1, users: ['you'] }] }
      })
      if (selectedContact) persistMessages(selectedContact.id, next)
      return next
    })
  }, [selectedContact, persistMessages])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const filteredContacts = searchContacts(searchQuery)

  return (
    <div className="flex h-screen w-full bg-black/80 backdrop-blur-xl text-white overflow-hidden">
      <ComposeMessageModal open={showCompose} onClose={() => setShowCompose(false)} onSend={handleComposeSend} />

      <aside className={`${showSidebar || window.innerWidth >= 1024 ? 'flex' : 'hidden'} flex-col w-full lg:w-96 lg:min-w-96 border-r border-white/5 bg-black/50 backdrop-blur-xl relative z-10`}>
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Circle className="fill-white text-white w-5 h-5" />
              <span className="text-lg font-semibold tracking-tight">Inbox3</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                {darkMode ? <Sun className="w-4 h-4 text-white/60" /> : <Moon className="w-4 h-4 text-white/60" />}
              </button>
              <button className="p-2 rounded-lg hover:bg-white/5 transition-colors relative">
                <Bell className="w-4 h-4 text-white/60" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF6B35] rounded-full" />
              </button>
            </div>
          </div>

          <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search messages..." />
        </div>

        <div className="flex border-b border-white/5">
          {[
            { id: 'messages' as const, icon: MessageSquare, label: 'Messages' },
            { id: 'contacts' as const, icon: Users, label: 'Contacts' },
            { id: 'settings' as const, icon: Settings, label: 'Settings' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-white border-b-2 border-white'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        <FilterBar onFilter={() => {}} />

        <div className="flex-1 flex flex-col overflow-hidden">
          {activeTab === 'messages' && (
            <ContactList contacts={filteredContacts} onSelect={handleSelectContact} />
          )}

          {activeTab === 'contacts' && (
            <div className="p-4 space-y-2 overflow-y-auto flex-1">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-white/40">Your decentralized contacts</p>
                <button
                  onClick={() => setShowCompose(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF6B35] text-white text-xs font-medium hover:opacity-90 transition-all"
                >
                  <Plus className="w-3 h-3" />
                  Add Contact
                </button>
              </div>
              {contacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => handleSelectContact(contact)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#A855F7] to-[#FF6B35] flex items-center justify-center text-sm font-medium">
                    {contact.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{contact.name}</p>
                    <p className="text-xs text-white/30 font-mono truncate">{contact.address}</p>
                  </div>
                  <span className="w-2 h-2 bg-white/20 rounded-full" />
                </button>
              ))}
              {contacts.length === 0 && (
                <p className="text-center text-sm text-white/20 py-8">No contacts yet. Compose a new message to add one.</p>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="p-4 space-y-1 overflow-y-auto flex-1">
              {[
                { icon: User, label: 'Profile', desc: 'Edit your identity' },
                { icon: Bell, label: 'Notifications', desc: 'Manage alerts' },
                { icon: Shield, label: 'Privacy', desc: 'Encryption & security' },
                { icon: Key, label: 'Keys', desc: 'Manage encryption keys' },
                { icon: Trash2, label: 'Clear Data', desc: 'Remove local data' },
              ].map((item) => (
                <button
                  key={item.label}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-left"
                >
                  <item.icon className="w-4 h-4 text-white/40" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{item.label}</p>
                    <p className="text-xs text-white/30">{item.desc}</p>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-white/20 rotate-180" />
                </button>
              ))}
              <div className="pt-4 mt-4 border-t border-white/5">
                <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-left text-red-400">
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Disconnect</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#A855F7] to-[#FF6B35] flex items-center justify-center text-xs font-semibold">
                {(user?.name || 'ME').slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name || 'You'}</p>
              <p className="text-xs text-white/30 font-mono truncate">{user?.walletAddress || user?.email || '0x1a2b...3c4d'}</p>
            </div>
            <span className="w-2 h-2 bg-green-500 rounded-full" />
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col relative z-10 bg-black/30">
        {selectedContact ? (
          <>
            <ChatHeader contact={selectedContact} onBack={() => { setShowSidebar(true); setSelectedContact(null) }} />

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {messages.map((msg, i) => (
                <MessageCard
                  key={msg.id}
                  message={msg}
                  onReact={handleReact}
                  isLast={i === messages.length - 1}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>

            <TxStatusIndicator status={txStatus} />
            <ChatInput onSend={handleSend} disabled={txStatus === 'signing' || txStatus === 'submitting'} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-sm">
              <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-[#A855F7]/10 to-[#FF6B35]/10 flex items-center justify-center">
                <MessageSquare className="w-10 h-10 text-white/20" />
              </div>
              <h2 className="text-2xl font-medium text-white mb-2" style={{ letterSpacing: '-0.02em' }}>
                Your Messages
              </h2>
              <p className="text-white/40 text-sm leading-relaxed mb-6">
                Select a conversation from the sidebar or start a new one to begin your encrypted journey.
              </p>
              <button
                onClick={() => setShowCompose(true)}
                className="inline-flex items-center gap-2 bg-[#FF6B35] text-white text-sm font-medium px-6 py-2.5 rounded-full hover:opacity-90 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                New Message
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
