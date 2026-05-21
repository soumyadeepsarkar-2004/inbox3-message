export interface Message {
  id: number
  sender: string
  cid: string
  timestamp: number
  read: boolean
}

export interface ProcessedMessage extends Message {
  content: string
  type: 'text' | 'audio' | 'file'
  direction: 'sent' | 'received'
  plain?: string
}

export interface Contact {
  address: string
  lastMessage?: string
  timestamp?: number
  unread: number
}

export interface UserProfile {
  username: string
  avatar?: string
  bio?: string
}

export type AppView = 'inbox' | 'chat' | 'contacts' | 'settings'