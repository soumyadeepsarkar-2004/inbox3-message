export interface AgentInbox {
  slug: string
  name: string
  description: string
  capabilities: string[]
  publicKey: string
  owner: string
  isHumanInLoop: boolean
  createdAt: number
}

export interface AgentMessage {
  id: string
  inboxSlug: string
  from: string
  to: string
  content: string
  timestamp: number
  requiresApproval: boolean
  status: 'pending' | 'approved' | 'rejected' | 'delivered'
}

const INBOXES_KEY = 'inbox3_agent_inboxes'
const AGENT_MESSAGES_KEY = 'inbox3_agent_messages'

export class AgentInboxManager {
  private inboxes: Map<string, AgentInbox> = new Map()

  constructor() {
    this.loadFromStorage()
  }

  registerInbox(inbox: Omit<AgentInbox, 'createdAt'>): AgentInbox {
    const full: AgentInbox = { ...inbox, createdAt: Date.now() }
    this.inboxes.set(full.slug, full)
    this.saveToStorage()
    return full
  }

  unregisterInbox(slug: string): void {
    this.inboxes.delete(slug)
    this.saveToStorage()
  }

  getInbox(slug: string): AgentInbox | undefined {
    return this.inboxes.get(slug)
  }

  getAllInboxes(): AgentInbox[] {
    return Array.from(this.inboxes.values())
  }

  findInboxesByCapability(capability: string): AgentInbox[] {
    return this.getAllInboxes().filter(i => i.capabilities.includes(capability))
  }

  sendMessage(msg: Omit<AgentMessage, 'id' | 'timestamp' | 'status'>): AgentMessage {
    const full: AgentMessage = {
      ...msg,
      id: `agent_msg_${Date.now()}_${crypto.randomUUID().slice(0, 6)}`,
      timestamp: Date.now(),
      status: msg.requiresApproval ? 'pending' : 'delivered',
    }
    const stored = this.getStoredMessages()
    stored.push(full)
    localStorage.setItem(AGENT_MESSAGES_KEY, JSON.stringify(stored))
    return full
  }

  approveMessage(msgId: string): boolean {
    const stored = this.getStoredMessages()
    const idx = stored.findIndex(m => m.id === msgId)
    if (idx === -1) return false
    stored[idx].status = 'approved'
    localStorage.setItem(AGENT_MESSAGES_KEY, JSON.stringify(stored))
    return true
  }

  rejectMessage(msgId: string): boolean {
    const stored = this.getStoredMessages()
    const idx = stored.findIndex(m => m.id === msgId)
    if (idx === -1) return false
    stored[idx].status = 'rejected'
    localStorage.setItem(AGENT_MESSAGES_KEY, JSON.stringify(stored))
    return true
  }

  getMessagesForInbox(slug: string): AgentMessage[] {
    return this.getStoredMessages().filter(m => m.inboxSlug === slug)
  }

  getPendingApprovals(): AgentMessage[] {
    return this.getStoredMessages().filter(m => m.status === 'pending' && m.requiresApproval)
  }

  private getStoredMessages(): AgentMessage[] {
    const raw = localStorage.getItem(AGENT_MESSAGES_KEY)
    return raw ? JSON.parse(raw) : []
  }

  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(INBOXES_KEY)
      if (raw) {
        const entries: [string, AgentInbox][] = JSON.parse(raw)
        this.inboxes = new Map(entries)
      }
    } catch { /* corrupted data */ }
  }

  private saveToStorage(): void {
    localStorage.setItem(INBOXES_KEY, JSON.stringify(Array.from(this.inboxes.entries())))
  }
}

export const agentInboxManager = new AgentInboxManager()
