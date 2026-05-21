import { useState, useEffect } from 'react'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './components/ui/button'
import { Card } from './components/ui/card'
import { Input } from './components/ui/input'
import { encryptionManager } from './lib/crypto'
import { createInbox, checkInboxExists, fetchMessages, sendMessage } from './lib/aptos'
import { formatAddress, formatTimestamp } from './lib/utils'
import type { ProcessedMessage } from './types'

function App() {
  const { account, connected, connect, disconnect, wallets, signAndSubmitTransaction } = useWallet()
  const [hasInbox, setHasInbox] = useState(false)
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<ProcessedMessage[]>([])
  const [selectedContact, setSelectedContact] = useState('')
  const [newMessage, setNewMessage] = useState('')
  const [showWalletModal, setShowWalletModal] = useState(false)

  useEffect(() => {
    if (connected && account) {
      if (!encryptionManager.loadKeys()) {
        encryptionManager.generateKeys()
      }
      checkInboxExists(account.address.toString()).then(setHasInbox)
    }
  }, [connected, account])

  const handleCreateInbox = async () => {
    if (!signAndSubmitTransaction) return
    setLoading(true)
    const success = await createInbox(signAndSubmitTransaction)
    if (success) setHasInbox(true)
    setLoading(false)
  }

  const handleRefreshMessages = async () => {
    if (!account) return
    const msgs = await fetchMessages(account.address.toString())
    setMessages(msgs)
  }

  const handleSendMessage = async () => {
    if (!signAndSubmitTransaction || !selectedContact || !newMessage.trim()) return
    setLoading(true)
    const success = await sendMessage(signAndSubmitTransaction, selectedContact, newMessage.trim())
    if (success) {
      setNewMessage('')
      handleRefreshMessages()
    }
    setLoading(false)
  }

  if (!connected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <Card className="relative z-10 max-w-md w-full p-8 text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gradient">Inbox3</h1>
            <p className="text-text-secondary">Secure, decentralized messaging on Aptos</p>
          </div>

          <div className="space-y-3">
            <Button onClick={() => setShowWalletModal(true)} size="lg" className="w-full">
              Connect Wallet
            </Button>
          </div>

          <AnimatePresence>
            {showWalletModal && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="space-y-2"
              >
                {wallets.map((wallet) => (
                  <Button
                    key={wallet.name}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => { connect(wallet.name); setShowWalletModal(false) }}
                  >
                    <img src={wallet.icon} alt="" className="h-5 w-5 mr-2" />
                    {wallet.name}
                  </Button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>
    )
  }

  if (!hasInbox) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="max-w-md w-full p-8 text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary-muted flex items-center justify-center">
            <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-text-primary">Setup Required</h2>
            <p className="text-text-secondary">Create your decentralized inbox to start messaging</p>
          </div>
          <Button onClick={handleCreateInbox} loading={loading} size="lg" className="w-full">
            Initialize Inbox
          </Button>
          <Button variant="ghost" onClick={disconnect} className="w-full">
            Disconnect
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gradient">Inbox3</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-text-muted font-mono">{formatAddress(account?.address.toString() || '')}</span>
            <Button variant="ghost" size="sm" onClick={disconnect}>Disconnect</Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <Card className="p-4">
              <h3 className="text-sm font-semibold text-text-secondary mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full" onClick={handleRefreshMessages}>
                  Refresh Messages
                </Button>
                <Input
                  placeholder="Recipient address..."
                  value={selectedContact}
                  onChange={(e) => setSelectedContact(e.target.value)}
                />
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="text-sm font-semibold text-text-secondary mb-3">Messages ({messages.length})</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {messages.length === 0 ? (
                  <p className="text-sm text-text-muted text-center py-4">No messages yet</p>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className="p-3 rounded-xl bg-surface-elevated hover:border-border-hover border border-transparent transition-colors cursor-pointer"
                      onClick={() => setSelectedContact(msg.sender)}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-medium text-text-primary truncate">
                          {formatAddress(msg.sender)}
                        </span>
                        <span className="text-xs text-text-muted">{formatTimestamp(msg.timestamp)}</span>
                      </div>
                      <p className="text-xs text-text-secondary truncate mt-1">{msg.content}</p>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              {selectedContact ? (
                <>
                  <div className="p-4 border-b border-border">
                    <h3 className="text-sm font-semibold text-text-primary">
                      Chat with {formatAddress(selectedContact)}
                    </h3>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages
                      .filter((m) => m.sender === selectedContact)
                      .map((msg) => (
                        <div
                          key={msg.id}
                          className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.direction === 'sent' ? 'ml-auto bg-gradient-brand text-white' : 'bg-surface-elevated text-text-primary'}`}
                        >
                          <p>{msg.content}</p>
                          <p className="text-xs opacity-60 mt-1">{formatTimestamp(msg.timestamp)}</p>
                        </div>
                      ))}
                  </div>
                  <div className="p-4 border-t border-border flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage} loading={loading} disabled={!newMessage.trim()}>
                      Send
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-text-muted">
                  <div className="text-center">
                    <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="text-sm">Select a contact to start chatting</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App