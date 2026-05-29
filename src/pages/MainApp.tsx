import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { MessageSquare, Users, Settings, Bell, Moon, Sun, Circle, Plus, Hash } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from 'sonner'
import MessageCard, { type Message } from '../components/chat/MessageCard'
import ChatInput from '../components/chat/ChatInput'
import ChatHeader from '../components/chat/ChatHeader'
import ContactList from '../components/chat/ContactList'
import { SearchBar, FilterBar } from '../components/chat/SearchBar'
import { TxStatusIndicator, type TxStatus } from '../components/chat/TxStatusIndicator'
import ComposeMessageModal from '../components/chat/ComposeMessageModal'
import ChannelPanel from '../components/chat/ChannelPanel'
import DAOChannelChat from '../components/chat/DAOChannelChat'
import ErrorBoundary from '../components/ErrorBoundary'
import SettingsPanel from '../components/settings/SettingsPanel'
import { useAppStore } from '../store/useAppStore'
import { useContactManager, type Contact } from '../hooks/useContactManager'
import { EncryptionManager } from '../lib/crypto'
import { pqEncryptionManager } from '../lib/pqCrypto'
import { x402Facilitator } from '../lib/x402'
import { ampMessenger } from '../lib/ampProtocol'
import { encryptedMempoolClient } from '../lib/encryptedMempool'
import { useInbox3 } from '../hooks/useInbox3'
import { useIrysStorage } from '../hooks/useIrysStorage'
import { useANS } from '../hooks/useANS'
import { AIAgent } from '../lib/aiAgent'
import type { Channel } from '../hooks/useTokenGatedChannels'

const encryptionManager = new EncryptionManager()


export default function MainApp() {
  const { user, initialized } = useAuth()
  const { sendMessage, fetchMessages } = useInbox3()
  const { uploadPayload, ephemeralMode, setEphemeralMode } = useIrysStorage()
  const { reverseResolve } = useANS()
  const navigate = useNavigate()
  const { contacts, addContact, searchContacts, markRead, updateContact, exportContacts, importContacts } = useContactManager()
  const [activeTab, setActiveTab] = useState<'messages' | 'contacts' | 'channels' | 'settings'>('messages')
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [darkMode, setDarkMode] = useState(true)
  const [showSidebar, setShowSidebar] = useState(true)
  const [txStatus, setTxStatus] = useState<TxStatus>('idle')
  const [showCompose, setShowCompose] = useState(false)
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null)
  const [usePQ, setUsePQ] = useState(false)
  const [syncLoading, setSyncLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  const discoveredRef = useRef<Set<string>>(new Set())
  const warnedRef = useRef<Set<string>>(new Set())
  const warnOnce = (key: string, message: string) => {
    if (!warnedRef.current.has(key)) { warnedRef.current.add(key); toast.warning(message) }
  }

  // Redirect to login if not authenticated
  useEffect(() => {
    if (initialized && !user) navigate('/login')
  }, [user, initialized, navigate])

  // Load persisted messages when selecting a contact
  const contactId = selectedContact?.id
  useEffect(() => {
    if (contactId) {
      try {
        const stored = localStorage.getItem(`inbox3_messages_${contactId}`)
        if (stored) {
          const parsed = JSON.parse(stored) as Message[]
          setMessages(parsed)
        } else {
          setMessages([])
        }
      } catch {
        setMessages([])
      }
    } else {
      setMessages([])
    }
  }, [contactId])

  // Initialize encryption keys on mount
  useEffect(() => {
    try {
      if (!encryptionManager.loadKeys()) {
        encryptionManager.generateKeys()
      }
    } catch {
      toast.error('Failed to initialize encryption')
    }
  }, [])

  // Real-time synchronization
  useEffect(() => {
    let mounted = true
    const address = user?.walletAddress
    if (!address) return

    const syncMessages = async () => {
      if (!mounted) return
      const onchainEvents = await fetchMessages(address)
      
      interface OnchainEvent {
        sender: string; recipient: string; payload_uri: string; timestamp: string
      }
      const parsedMessages = await Promise.all(onchainEvents.map(async (evt: OnchainEvent, i: number) => {
        const isSent = evt.sender === user.walletAddress
        
        // Phase 1: Dynamic Contact Sync
        const otherAddress = isSent ? evt.recipient : evt.sender
        if (otherAddress && otherAddress !== user.walletAddress && !discoveredRef.current.has(otherAddress)) {
          discoveredRef.current.add(otherAddress)
          if (!mounted) return
          const ansResult = await reverseResolve(otherAddress)
          const displayName = ansResult.primaryName ? `${ansResult.primaryName}.apt` : undefined
          addContact(otherAddress, displayName)
        }

        let finalContent = `[Encrypted Payload: ${evt.payload_uri.slice(0, 10)}]`
        let isEphemeral = false
        let msgType: 'text' | 'image' | 'voice' | 'blink' = 'text'
        let blinkData: Record<string, unknown> | undefined = undefined

        // Phase 2: Live Irys Payload Fetching & Decryption
        try {
           const res = await fetch(`https://gateway.irys.xyz/${evt.payload_uri}`)
           if (res.ok) {
             const rawEncryptedText = await res.text()
             const otherPartyPubKey = contacts.find(c => c.address === otherAddress)?.publicKey
             
              const localPubKey = encryptionManager.getPublicKey()
              const resolvedKey = otherPartyPubKey || localPubKey
              if (resolvedKey) {
                 try {
                   let decryptedText: string
                   if (usePQ && pqEncryptionManager.getPublicKey()) {
                     decryptedText = encryptionManager.decryptHybrid(rawEncryptedText, resolvedKey)
                   } else {
                     decryptedText = encryptionManager.decrypt(rawEncryptedText, resolvedKey)
                   }
                   
                   try {
                     const json = JSON.parse(decryptedText)
                     if (json.content !== undefined) {
                         finalContent = json.content
                         isEphemeral = !!json.isEphemeral
                         try {
                            const innerJson = JSON.parse(finalContent)
                            if (innerJson.type === 'blink' || innerJson.actions) {
                                msgType = 'blink'
                                blinkData = innerJson
                            }
                           } catch {
                              warnOnce(evt.payload_uri, 'Failed to parse blink data from message')
                           }
                      } else {
                          finalContent = decryptedText
                      }
                    } catch {
                       warnOnce(evt.payload_uri, 'Failed to parse decrypted message, showing raw')
                       finalContent = decryptedText
                    }
                  } catch {
                     warnOnce(evt.payload_uri, 'Failed to decrypt message payload')
                     finalContent = `[Encrypted]`
                  }
               } else {
                 finalContent = `[Encrypted - Missing Key]`
              }
             }
          } catch {
             warnOnce(evt.payload_uri, 'Failed to fetch payload from storage')
             finalContent = `[Storage Fetch Failed]`
         }

        return {
          id: `onchain-${evt.payload_uri || `${i}-${evt.timestamp}`}`,
          sender: isSent ? user.name || 'You' : (contacts.find(c => c.address === evt.sender)?.name || 'Unknown'),
          senderAddress: evt.sender,
          content: finalContent,
          timestamp: new Date(Number(evt.timestamp) / 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          direction: isSent ? 'sent' : 'received',
          status: 'confirmed',
          isEphemeral,
          type: msgType,
          blinkData,
          aiTags: (!isSent && msgType === 'text') ? AIAgent.analyzeMessage(finalContent) : undefined
        } as Message
      }))

      if (!mounted) return
      setMessages(prev => {
        const existingIds = new Set(prev.map(m => m.id))
        const merged = [...prev]
        for (const msg of parsedMessages.reverse()) {
          if (!existingIds.has(msg.id)) {
            merged.push(msg)
            existingIds.add(msg.id)
          }
        }
        return merged
      })
    }

    const intervalId = setInterval(syncMessages, 5000)
    syncMessages().finally(() => { if (mounted) setSyncLoading(false) })

    return () => { mounted = false; clearInterval(intervalId) }
  }, [user, fetchMessages, usePQ, reverseResolve, addContact, contacts])

  const { setSelectedContactId } = useAppStore()

  const handleContactSelect = useCallback((contact: Contact) => {
    setSelectedContact(contact)
    setSelectedContactId(contact.id)
    markRead(contact.id)
    if (window.innerWidth < 768) setShowSidebar(false)
  }, [markRead, setSelectedContactId])

  const handleSelectContact = useCallback((contact: Contact) => {
    handleContactSelect(contact)
  }, [handleContactSelect])

  const persistMessages = useCallback((contactId: string, msgs: Message[]) => {
    try {
      localStorage.setItem(`inbox3_messages_${contactId}`, JSON.stringify(msgs))
    } catch {
      toast.warning('Could not save messages locally')
    }
  }, [])

  const handleSend = useCallback(async (content: string, type: 'text' | 'image' | 'voice' | 'blink', blinkData?: Record<string, unknown>) => {
    if (!selectedContact) return

    setTxStatus('signing')
    const tempId = Date.now().toString()
    const recipientPubKey = selectedContact.publicKey || encryptionManager.getPublicKey()
    
    const payloadObj = { content, isEphemeral: ephemeralMode }
    const rawPayload = JSON.stringify(payloadObj)
    let encryptedContent = rawPayload

    if (type === 'text' && recipientPubKey) {
      try {
        if (usePQ && pqEncryptionManager.getPublicKey()) {
          encryptedContent = encryptionManager.encryptHybrid(rawPayload, recipientPubKey)
        } else {
          encryptedContent = encryptionManager.encrypt(rawPayload, recipientPubKey)
        }
      } catch {
        toast.warning('Encryption failed, sending raw payload')
        encryptedContent = rawPayload
      }
    }

    const tempMsg: Message = {
      id: tempId,
      sender: 'You',
      senderAddress: user?.walletAddress || '0xme',
      content: content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      direction: 'sent',
      status: 'mempool',
      type,
      isEphemeral: ephemeralMode,
      blinkData
    }

    const updated = [...messages, tempMsg]
    setMessages(updated)
    persistMessages(selectedContact.id, updated)

    const toastId = toast.loading(ephemeralMode ? 'Uploading ephemeral key & payload...' : 'Signing transaction...')

    try {
      setTxStatus('submitting')
      
      toast.loading(ephemeralMode ? 'Generating Burnable Key...' : 'Uploading payload to Irys...', { id: toastId })
      const irysReceiptId = await uploadPayload(encryptedContent)
      
      if (!irysReceiptId) {
        throw new Error('Irys upload failed')
      }

      let x402Config = { x402Enabled: false }
      try {
        x402Config = JSON.parse(localStorage.getItem('inbox3_stake_config') || '{}')
      } catch { /* invalid config, defaults to disabled */ }
      if (x402Config.x402Enabled) {
        await x402Facilitator.requestPayment('0.01', selectedContact.address, tempId)
      }

      if (content.startsWith('[AMP]')) {
        const userAddress = user?.walletAddress || '0xuser'
        const envelope = ampMessenger.createEnvelope(
          userAddress, 'human',
          selectedContact.address, 'agent',
          content.replace('[AMP] ', ''),
          'text', 'request', true,
        )
        try { localStorage.setItem(`inbox3_amp_sent_${tempId}`, ampMessenger.serializeEnvelope(envelope)) } catch { /* storage full */ }
      }

      if (encryptedMempoolClient.isInitialized()) {
        const mempoolPayload = await encryptedMempoolClient.encryptForMempool(
          encryptedContent,
          selectedContact.publicKey || encryptionManager.getPublicKey() || '',
        )
        const submission = await encryptedMempoolClient.createMempoolSubmission(
          mempoolPayload,
          selectedContact.address,
        )
        encryptedMempoolClient.queueSubmission(submission)
      }

      toast.loading(`Awaiting signature (Stake: 100 APT)...`, { id: toastId })
      const hash = await sendMessage(selectedContact.address, irysReceiptId, 100)

      if (hash) {
        const confirmed = messages.map(m =>
          m.id === tempId ? { ...m, status: 'confirmed' as const } : m
        )
        setMessages(confirmed)
        persistMessages(selectedContact.id, confirmed)
        setTxStatus('confirmed')
        toast.success(ephemeralMode ? 'Ephemeral Message sent on-chain' : 'Message sent on-chain', {
          id: toastId,
          description: `Tx: ${hash.slice(0, 10)}...${hash.slice(-6)} | Irys: ${irysReceiptId.slice(0,10)}...`,
        })
      } else {
        throw new Error('Transaction rejected or failed')
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
  }, [selectedContact, messages, user, sendMessage, persistMessages, usePQ, uploadPayload, ephemeralMode])

  const handleComposeSend = useCallback((address: string, name: string, message: string, publicKey?: string) => {
    const contact = addContact(address, name)
    if (!contact) return

    if (publicKey && !contact.publicKey) {
      updateContact(contact.id, { publicKey })
    }

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

    let existing: Message[] = []
    try {
      existing = JSON.parse(localStorage.getItem(`inbox3_messages_${contact.id}`) || '[]')
    } catch { /* corrupted data, start fresh */ }
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

  const filteredContacts = useMemo(() => searchContacts(searchQuery), [searchContacts, searchQuery])

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
              <button onClick={() => setDarkMode(!darkMode)} aria-label="Toggle dark mode" className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                {darkMode ? <Sun className="w-4 h-4 text-white/60" /> : <Moon className="w-4 h-4 text-white/60" />}
              </button>
              <button type="button" aria-label="Notifications" onClick={() => toast.info('Notifications coming soon')} className="p-2 rounded-lg hover:bg-white/5 transition-colors relative">
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
            { id: 'channels' as const, icon: Hash, label: 'Channels' },
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

        <FilterBar onFilter={(filter) => {
          if (filter === 'all') setSearchQuery('')
        }} />

        <div className="flex-1 flex flex-col overflow-hidden">
          {activeTab === 'messages' && (
            <ContactList contacts={filteredContacts} onSelect={handleSelectContact} />
          )}

          {activeTab === 'contacts' && (
            <div className="p-4 space-y-2 overflow-y-auto flex-1">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-white/40">Your decentralized contacts</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const json = exportContacts()
                      const blob = new Blob([json], { type: 'application/json' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `inbox3-contacts-${Date.now()}.json`
                      a.click()
                      URL.revokeObjectURL(url)
                      toast.success('Contacts exported')
                    }}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 text-white/60 text-xs font-medium hover:bg-white/10 transition-all"
                    title="Export contacts"
                  >
                    ↥
                  </button>
                  <label className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 text-white/60 text-xs font-medium hover:bg-white/10 transition-all cursor-pointer" title="Import contacts">
                    ↧
                    <input
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        const reader = new FileReader()
                        reader.onload = () => {
                          const result = importContacts(reader.result as string)
                          if (result.imported > 0) {
                            toast.success(`Imported ${result.imported} contact(s)`)
                          }
                          if (result.skipped > 0) {
                            toast.info(`${result.skipped} duplicate(s) skipped`)
                          }
                          if (result.imported === 0 && result.skipped === 0) {
                            toast.error('Invalid contact file')
                          }
                        }
                        reader.readAsText(file)
                        e.target.value = ''
                      }}
                    />
                  </label>
                  <button
                    onClick={() => setShowCompose(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF6B35] text-white text-xs font-medium hover:opacity-90 transition-all"
                  >
                    <Plus className="w-3 h-3" />
                    Add Contact
                  </button>
                </div>
              </div>
              {contacts.map((contact) => {
                const isAName = contact.name.endsWith('.apt')
                return (
                  <button
                    key={contact.id}
                    onClick={() => handleSelectContact(contact)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#A855F7] to-[#FF6B35] flex items-center justify-center text-sm font-medium">
                      {contact.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium text-white truncate">{contact.name}</p>
                        {isAName && (
                          <span className="px-1 py-0.5 bg-[#FF6B35]/20 text-[#FF6B35] text-[8px] font-mono rounded flex-shrink-0">ANS</span>
                        )}
                      </div>
                      <p className="text-xs text-white/30 font-mono truncate">{contact.address}</p>
                    </div>
                    <span className="w-2 h-2 bg-white/20 rounded-full" />
                  </button>
                )
              })}
              {contacts.length === 0 && (
                <p className="text-center text-sm text-white/20 py-8">No contacts yet. Compose a new message to add one.</p>
              )}
            </div>
          )}

          {activeTab === 'channels' && (
            <div className="overflow-y-auto flex-1">
              <ErrorBoundary fallback={<div className="p-4 text-sm text-white/40">Channel panel unavailable</div>}>
                <ChannelPanel onSelectChannel={(c) => {
                  setSelectedChannel(c)
                  setSelectedContact(null)
                  setShowSidebar(false)
                }} />
              </ErrorBoundary>
            </div>
          )}

          {activeTab === 'settings' && (
            <ErrorBoundary fallback={<div className="p-4 text-sm text-white/40">Settings unavailable</div>}>
              <SettingsPanel usePQ={usePQ} setUsePQ={setUsePQ} />
            </ErrorBoundary>
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
        {selectedChannel ? (
          <ErrorBoundary fallback={<div className="flex-1 flex items-center justify-center p-8 text-white/40">Channel chat unavailable</div>}>
            <DAOChannelChat 
              channel={selectedChannel} 
              onBack={() => { setShowSidebar(true); setSelectedChannel(null) }} 
            />
          </ErrorBoundary>
        ) : selectedContact ? (
          <ErrorBoundary fallback={<div className="flex-1 flex items-center justify-center p-8 text-white/40">Conversation unavailable</div>}>
            <ChatHeader contact={selectedContact} onBack={() => { setShowSidebar(true); setSelectedContact(null) }} />

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {syncLoading && messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-white/20 border-t-[#FF6B35] rounded-full animate-spin" />
                    <p className="text-sm text-white/40">Loading messages...</p>
                  </div>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <MessageCard
                    key={msg.id}
                    message={msg}
                    onReact={handleReact}
                    isLast={i === messages.length - 1}
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <TxStatusIndicator status={txStatus} />
            <ChatInput 
              onSend={handleSend} 
              disabled={txStatus === 'signing' || txStatus === 'submitting'} 
              isEphemeral={ephemeralMode}
              onToggleEphemeral={() => setEphemeralMode(!ephemeralMode)}
            />
          </ErrorBoundary>
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
