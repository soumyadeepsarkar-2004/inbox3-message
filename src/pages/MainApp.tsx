import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare, Users, Settings, Bell, Moon, Sun, LogOut, User, Shield, Key, Trash2,
  ChevronLeft, Plus, Circle
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useWallet } from '../context/WalletProvider'
import { useAppStore } from '../store/useAppStore'
import BackgroundCanvas from '../components/canvas/BackgroundCanvas'
import MessageCard, { type Message } from '../components/chat/MessageCard'
import ChatInput from '../components/chat/ChatInput'
import ChatHeader from '../components/chat/ChatHeader'
import ContactList from '../components/chat/ContactList'
import { SearchBar, FilterBar } from '../components/chat/SearchBar'
import { TxStatusIndicator, type TxStatus } from '../components/chat/TxStatusIndicator'

interface Contact {
  id: string
  address: string
  name: string
  avatar: string
  lastMessage: string
  timestamp: string
  unread: number
  online: boolean
}

const mockContacts: Contact[] = [
  { id: '1', address: '0x1a2b...3c4d', name: 'Alice Chen', avatar: 'AC', lastMessage: 'Hey! Did you see the new update?', timestamp: '2m', unread: 2, online: true },
  { id: '2', address: '0x5e6f...7g8h', name: 'Bob Smith', avatar: 'BS', lastMessage: 'The transaction went through', timestamp: '15m', unread: 0, online: true },
  { id: '3', address: '0x9i0j...1k2l', name: 'Carol Davis', avatar: 'CD', lastMessage: 'Let me check and get back to you', timestamp: '1h', unread: 0, online: false },
  { id: '4', address: '0x3m4n...5o6p', name: 'David Kim', avatar: 'DK', lastMessage: 'Great, see you tomorrow!', timestamp: '3h', unread: 1, online: false },
  { id: '5', address: '0x7q8r...9s0t', name: 'Eve Wilson', avatar: 'EW', lastMessage: 'Thanks for the info', timestamp: '1d', unread: 0, online: true },
  { id: '6', address: '0x1u2v...3w4x', name: 'Frank Lee', avatar: 'FL', lastMessage: 'Can you review the contract?', timestamp: '2d', unread: 0, online: false },
]

const mockMessages: Record<string, Message[]> = {
  '1': [
    { id: '1', sender: 'Alice Chen', senderAddress: '0x1a2b', content: 'Hey! How are you?', timestamp: '10:30 AM', direction: 'received', status: 'confirmed' },
    { id: '2', sender: 'You', senderAddress: '0xme', content: 'Doing great! Just checking out Inbox3', timestamp: '10:32 AM', direction: 'sent', status: 'confirmed' },
    { id: '3', sender: 'Alice Chen', senderAddress: '0x1a2b', content: 'It\'s amazing right? The encryption is top-notch', timestamp: '10:33 AM', direction: 'received', status: 'confirmed' },
    { id: '4', sender: 'You', senderAddress: '0xme', content: 'Yeah, finally a messaging app that respects privacy', timestamp: '10:35 AM', direction: 'sent', status: 'confirmed' },
    { id: '5', sender: 'Alice Chen', senderAddress: '0x1a2b', content: 'Hey! Did you see the new update?', timestamp: '10:40 AM', direction: 'received', status: 'confirmed' },
  ],
  '2': [
    { id: '1', sender: 'Bob Smith', senderAddress: '0x5e6f', content: 'Did you send the tokens?', timestamp: '9:00 AM', direction: 'received', status: 'confirmed' },
    { id: '2', sender: 'You', senderAddress: '0xme', content: 'Yes, just sent them via the smart contract', timestamp: '9:15 AM', direction: 'sent', status: 'confirmed' },
    { id: '3', sender: 'Bob Smith', senderAddress: '0x5e6f', content: 'The transaction went through', timestamp: '9:20 AM', direction: 'received', status: 'confirmed' },
  ],
}

export default function MainApp() {
  const { user, logout } = useAuth()
  const { signAndSubmit } = useWallet()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'messages' | 'contacts' | 'settings'>('messages')
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [darkMode, setDarkMode] = useState(true)
  const [showSidebar, setShowSidebar] = useState(true)
  const [txStatus, setTxStatus] = useState<TxStatus>('idle')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { performanceMode, togglePerformanceMode } = useAppStore()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSelectContact = useCallback((contact: Contact) => {
    setSelectedContact(contact)
    setMessages(mockMessages[contact.id] || [])
    setShowSidebar(false)
    setTxStatus('idle')
  }, [])

  const handleSend = useCallback(async (content: string, type: 'text' | 'image' | 'voice') => {
    if (!selectedContact) return

    setTxStatus('signing')
    const tempId = Date.now().toString()
    const tempMsg: Message = {
      id: tempId,
      sender: 'You',
      senderAddress: user?.walletAddress || '0xme',
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      direction: 'sent',
      status: 'mempool',
      type,
    }
    setMessages(prev => [...prev, tempMsg])

    setTxStatus('submitting')
    const hash = await signAndSubmit({ content, recipient: selectedContact.address })

    setMessages(prev => prev.map(m =>
      m.id === tempId ? { ...m, status: hash ? 'confirmed' : 'failed' } : m
    ))
    setTxStatus(hash ? 'confirmed' : 'failed')

    setTimeout(() => setTxStatus('idle'), 3000)
  }, [selectedContact, user, signAndSubmit])

  const handleReact = useCallback((messageId: string, emoji: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id !== messageId) return m
      const reactions = m.reactions || []
      const existing = reactions.find(r => r.emoji === emoji)
      if (existing) {
        return { ...m, reactions: reactions.map(r => r.emoji === emoji ? { ...r, count: r.count + 1 } : r) }
      }
      return { ...m, reactions: [...reactions, { emoji, count: 1, users: ['you'] }] }
    }))
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const filteredContacts = mockContacts.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.address.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex h-screen w-full bg-black/80 backdrop-blur-xl text-white overflow-hidden">
      <BackgroundCanvas />

      {/* Sidebar */}
      <AnimatePresence>
        {(showSidebar || window.innerWidth >= 1024) && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`${selectedContact && window.innerWidth < 1024 ? 'hidden' : 'flex'} flex-col w-full lg:w-96 lg:min-w-96 border-r border-white/5 bg-black/50 backdrop-blur-xl relative z-10`}
          >
            {/* Header */}
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
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gradient-to-r from-[#A855F7] to-[#FF6B35] rounded-full" />
                  </button>
                </div>
              </div>

              <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search messages..." />
            </div>

            {/* Tabs */}
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

            {/* Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {activeTab === 'messages' && (
                <ContactList contacts={filteredContacts} onSelect={handleSelectContact} />
              )}

              {activeTab === 'contacts' && (
                <div className="p-4 space-y-2 overflow-y-auto flex-1">
                  <p className="text-sm text-white/40 mb-4">Your decentralized contacts</p>
                  {mockContacts.map((contact, i) => (
                    <motion.div
                      key={contact.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center text-sm font-medium">
                        {contact.avatar}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{contact.name}</p>
                        <p className="text-xs text-white/30 font-mono">{contact.address}</p>
                      </div>
                      {contact.online && <span className="w-2 h-2 bg-green-500 rounded-full" />}
                    </motion.div>
                  ))}
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="p-4 space-y-1 overflow-y-auto flex-1">
                  {[
                    { icon: User, label: 'Profile', desc: 'Edit your identity' },
                    { icon: Bell, label: 'Notifications', desc: 'Manage alerts' },
                    { icon: Shield, label: 'Privacy', desc: 'Encryption & security' },
                    { icon: Key, label: 'Keys', desc: 'Manage encryption keys' },
                    { icon: performanceMode ? Sun : Moon, label: performanceMode ? 'Performance Mode' : 'Standard Mode', desc: performanceMode ? '3D effects disabled' : 'Full animations enabled', action: togglePerformanceMode },
                    { icon: Trash2, label: 'Clear Data', desc: 'Remove local data' },
                  ].map((item, i) => (
                    <motion.button
                      key={item.label}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={item.action}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-left"
                    >
                      <item.icon className="w-4 h-4 text-white/40" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{item.label}</p>
                        <p className="text-xs text-white/30">{item.desc}</p>
                      </div>
                      <ChevronLeft className="w-4 h-4 text-white/20 rotate-180" />
                    </motion.button>
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

            {/* User Profile */}
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
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
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
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center max-w-sm"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-[#A855F7]/10 to-[#FF6B35]/10 flex items-center justify-center">
                <MessageSquare className="w-10 h-10 text-white/20" />
              </div>
              <h2 className="text-2xl font-medium text-white mb-2" style={{ letterSpacing: '-0.02em' }}>
                Your Messages
              </h2>
              <p className="text-white/40 text-sm leading-relaxed mb-6">
                Select a conversation from the sidebar or start a new one to begin your encrypted journey.
              </p>
              <button className="inline-flex items-center gap-2 bg-gradient-to-r from-[#A855F7] to-[#FF6B35] text-white text-sm font-medium px-6 py-2.5 rounded-full hover:opacity-90 transition-all active:scale-95">
                <Plus className="w-4 h-4" />
                New Message
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
