import { create } from 'zustand'

interface AppState {
  selectedContactId: string | null
  setSelectedContactId: (id: string | null) => void
  txStatus: 'idle' | 'signing' | 'submitting' | 'confirmed' | 'failed'
  setTxStatus: (status: 'idle' | 'signing' | 'submitting' | 'confirmed' | 'failed') => void
  txHash: string | null
  setTxHash: (hash: string | null) => void
}

export const useAppStore = create<AppState>((set) => ({
  selectedContactId: null,
  setSelectedContactId: (selectedContactId) => set({ selectedContactId }),
  txStatus: 'idle',
  setTxStatus: (txStatus) => set({ txStatus }),
  txHash: null,
  setTxHash: (txHash) => set({ txHash }),
}))
