import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare, Users, Settings, Search, Send, Phone, Video, MoreVertical,
  ArrowLeft, Bell, Moon, Sun, LogOut, User, Shield, Key, Trash2,
  ChevronLeft, Smile, Paperclip, Mic, Check, CheckCheck, Circle
} from 'lucide-react'
import { Link } from 'react-router-dom'

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

interface Message {
  id: string
  sender: string
  content: string
  timestamp: string
  direction: 'sent' | 'received'
  status: 'sent' | 'delivered' | 'read'
}

const mockContacts: Contact[] = [
  { id: '1', address: '0x1a2b...3c4d', name: 'Alice Chen', avatar: 'AC', lastMessage: 'Hey! Did you see the new update?', timestamp: '2m', unread: 2, online: true },
  { id: '2', address: '0x5e6f...7g8h', name: 'Bob Smith', avatar: 'BS', lastMessage: 'The transaction went through ✅', timestamp: '15m', unread: 0, online: true },
  { id: '3', address: '0x9i0j...1k2l', name: 'Carol Davis', avatar: 'CD', lastMessage: 'Let me check and get back to you', timestamp: '1h', unread: 0, online: false },
  { id: '4', address: '0x3m4n...5o6p', name: 'David Kim', avatar: 'DK', lastMessage: 'Great, see you tomorrow!', timestamp: '3h', unread: 1, online: false },
  { id: '5', address: '0x7q8r...9s0t', name: 'Eve Wilson', avatar: 'EW', lastMessage: 'Thanks for the info 🙏', timestamp: '1d', unread: 0, online: true },
  { id: '6', address: '0x1u2v...3w4x', name: 'Frank Lee', avatar: 'FL', lastMessage: 'Can you review the contract?', timestamp: '2d', unread: 0, online: false },
]

const mockMessages: Record<string, Message[]> = {
  '1': [
    { id: '1', sender: 'Alice Chen', content: 'Hey! How are you?', timestamp: '10:30 AM', direction: 'received', status: 'read' },
    { id: '2', sender: 'You', content: 'Doing great! Just checking out Inbox3', timestamp: '10:32 AM', direction: 'sent', status: 'read' },
    { id: '3', sender: 'Alice Chen', content: 'It\'s amazing right? The encryption is top-notch 🔒', timestamp: '10:33 AM', direction: 'received', status: 'read' },
    { id: '4', sender: 'You', content: 'Yeah, finally a messaging app that respects privacy', timestamp: '10:35 AM', direction: 'sent', status: 'read' },
    { id: '5', sender: 'Alice Chen', content: 'Hey! Did you see the new update?', timestamp: '10:40 AM', direction: 'received', status: 'read' },
  ],
  '2': [
    { id: '1', sender: 'Bob Smith', content: 'Did you send the tokens?', timestamp: '9:00 AM', direction: 'received', status: 'read' },
    { id: '2', sender: 'You', content: 'Yes, just sent them via the smart contract', timestamp: '9:15 AM', direction: 'sent', status: 'read' },
    { id: '3', sender: 'Bob Smith', content: 'The transaction went through ✅', timestamp: '9:20 AM', direction: 'received', status: 'read' },
  ],
}

export default function MainApp() {
  const [activeTab, setActiveTab] = useState<'messages' | 'contacts' | 'settings'>('messages')
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [darkMode, setDarkMode] = useState(true)
  const [showSidebar, setShowSidebar] = useState(true)

  const handleSelectContact = useCallback((contact: Contact) => {
    setSelectedContact(contact)
    setMessages(mockMessages[contact.id] || [])
    setShowSidebar(false)
  }, [])

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedContact) return
    const msg: Message = {
      id: Date.now().toString(),
      sender: 'You',
      content: newMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      direction: 'sent',
      status: 'sent'
    }
    setMessages(prev => [...prev, msg])
    setNewMessage('')
    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: 'delivered' } : m))
    }, 1000)
  }

  const filteredContacts = mockContacts.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.address.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex h-screen w-full bg-black text-white overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence>
        {(showSidebar || window.innerWidth >= 1024) && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`${selectedContact && window.innerWidth < 1024 ? 'hidden' : 'flex'} flex-col w-full lg:w-96 lg:min-w-96 border-r border-white/5 bg-black`}
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
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gradient-brand rounded-full" />
                  </button>
                </div>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-brand-gray rounded-xl h-10 pl-10 pr-4 text-sm text-white placeholder:text-white/20 focus:ring-2 focus:ring-white/10 focus:outline-none"
                />
              </div>
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

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'messages' && (
                <div className="p-2">
                  {filteredContacts.map((contact, i) => (
                    <motion.button
                      key={contact.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => handleSelectContact(contact)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${
                        selectedContact?.id === contact.id ? 'bg-white/5' : 'hover:bg-white/5'
                      }`}
                    >
                      <div className="relative">
                        <div className="w-11 h-11 rounded-full bg-gradient-brand flex items-center justify-center text-sm font-semibold">
                          {contact.avatar}
                        </div>
                        {contact.online && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-white truncate">{contact.name}</span>
                          <span className="text-xs text-white/30 ml-2">{contact.timestamp}</span>
                        </div>
                        <div className="flex items-center justify-between mt-0.5">
                          <p className="text-xs text-white/40 truncate">{contact.lastMessage}</p>
                          {contact.unread > 0 && (
                            <span className="ml-2 w-5 h-5 bg-gradient-brand rounded-full flex items-center justify-center text-[10px] font-semibold">
                              {contact.unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}

              {activeTab === 'contacts' && (
                <div className="p-4">
                  <p className="text-sm text-white/40 mb-4">Your decentralized contacts</p>
                  {mockContacts.map((contact, i) => (
                    <motion.div
                      key={contact.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors mb-1"
                    >
                      <div className="w-10 h-10 rounded-full bg-brand-gray flex items-center justify-center text-sm font-medium">
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
                <div className="p-4 space-y-1">
                  {[
                    { icon: User, label: 'Profile', desc: 'Edit your identity' },
                    { icon: Bell, label: 'Notifications', desc: 'Manage alerts' },
                    { icon: Shield, label: 'Privacy', desc: 'Encryption & security' },
                    { icon: Key, label: 'Keys', desc: 'Manage encryption keys' },
                    { icon: Trash2, label: 'Clear Data', desc: 'Remove local data' },
                  ].map((item, i) => (
                    <motion.button
                      key={item.label}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
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
                    <Link to="/login" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-left text-red-400">
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm font-medium">Disconnect</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="p-4 border-t border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-brand flex items-center justify-center text-xs font-semibold">
                  ME
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">You</p>
                  <p className="text-xs text-white/30 font-mono truncate">0x1a2b...3c4d</p>
                </div>
                <span className="w-2 h-2 bg-green-500 rounded-full" />
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setShowSidebar(true); setSelectedContact(null) }}
                  className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-gradient-brand flex items-center justify-center text-xs font-semibold">
                    {selectedContact.avatar}
                  </div>
                  {selectedContact.online && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-black" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{selectedContact.name}</p>
                  <p className="text-xs text-white/30">
                    {selectedContact.online ? 'Online' : 'Last seen recently'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                  <Phone className="w-4 h-4 text-white/60" />
                </button>
                <button className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                  <Video className="w-4 h-4 text-white/60" />
                </button>
                <button className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                  <MoreVertical className="w-4 h-4 text-white/60" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex ${msg.direction === 'sent' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${
                    msg.direction === 'sent'
                      ? 'bg-gradient-brand text-white rounded-br-md'
                      : 'bg-brand-gray text-white rounded-bl-md'
                  }`}>
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    <div className={`flex items-center gap-1 mt-1 ${msg.direction === 'sent' ? 'justify-end' : ''}`}>
                      <span className="text-[10px] text-white/50">{msg.timestamp}</span>
                      {msg.direction === 'sent' && (
                        msg.status === 'read' ? (
                          <CheckCheck className="w-3 h-3 text-white/70" />
                        ) : (
                          <Check className="w-3 h-3 text-white/50" />
                        )
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-white/5">
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                  <Paperclip className="w-4 h-4 text-white/40" />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="w-full bg-brand-gray rounded-xl h-11 px-4 pr-10 text-sm text-white placeholder:text-white/20 focus:ring-2 focus:ring-white/10 focus:outline-none"
                  />
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/10 transition-colors">
                    <Smile className="w-4 h-4 text-white/40" />
                  </button>
                </div>
                {newMessage.trim() ? (
                  <button
                    onClick={handleSendMessage}
                    className="p-2.5 rounded-xl bg-gradient-brand hover:opacity-90 transition-all active:scale-95"
                  >
                    <Send className="w-4 h-4 text-white" />
                  </button>
                ) : (
                  <button className="p-2.5 rounded-xl bg-brand-gray hover:bg-white/10 transition-colors">
                    <Mic className="w-4 h-4 text-white/40" />
                  </button>
                )}
              </div>
              <p className="text-[10px] text-white/20 text-center mt-2 flex items-center justify-center gap-1">
                <Shield className="w-3 h-3" />
                End-to-end encrypted. Only you and {selectedContact.name} can read this.
              </p>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center max-w-sm"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-brand/10 flex items-center justify-center">
                <MessageSquare className="w-10 h-10 text-white/20" />
              </div>
              <h2 className="text-2xl font-medium text-white mb-2" style={{ letterSpacing: '-0.02em' }}>
                Your Messages
              </h2>
              <p className="text-white/40 text-sm leading-relaxed mb-6">
                Select a conversation from the sidebar or start a new one to begin your encrypted journey.
              </p>
              <button className="inline-flex items-center gap-2 bg-gradient-brand text-white text-sm font-medium px-6 py-2.5 rounded-full hover:opacity-90 transition-all active:scale-95">
                <Send className="w-4 h-4" />
                New Message
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}