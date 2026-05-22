import { create } from 'zustand'
import type { User } from '../context/AuthTypes'

interface AppState {
  user: User | null
  setUser: (user: User | null) => void
  activeTab: 'messages' | 'contacts' | 'settings'
  setActiveTab: (tab: 'messages' | 'contacts' | 'settings') => void
  selectedContactId: string | null
  setSelectedContactId: (id: string | null) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  showComposeModal: boolean
  setShowComposeModal: (show: boolean) => void
  txStatus: 'idle' | 'signing' | 'submitting' | 'confirmed' | 'failed'
  setTxStatus: (status: 'idle' | 'signing' | 'submitting' | 'confirmed' | 'failed') => void
  txHash: string | null
  setTxHash: (hash: string | null) => void
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  activeTab: 'messages',
  setActiveTab: (activeTab) => set({ activeTab }),
  selectedContactId: null,
  setSelectedContactId: (selectedContactId) => set({ selectedContactId }),
  searchQuery: '',
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  showComposeModal: false,
  setShowComposeModal: (showComposeModal) => set({ showComposeModal }),
  txStatus: 'idle',
  setTxStatus: (txStatus) => set({ txStatus }),
  txHash: null,
  setTxHash: (txHash) => set({ txHash }),
}))
