import { createContext, useContext } from 'react'
import type { KeylessAccount } from '../hooks/useKeylessAuth'

export interface User {
  id: string
  email?: string
  name?: string
  avatar?: string
  walletAddress?: string
  walletName?: string
  bio?: string
  createdAt: string
  authMethod?: 'wallet' | 'keyless' | 'passkey'
  keylessAccount?: KeylessAccount
}

export interface AuthContextType {
  user: User | null
  loading: boolean
  initialized: boolean
  step: 'signup' | 'login' | 'wallet' | 'profile' | 'keyless'
  setStep: (step: 'signup' | 'login' | 'wallet' | 'profile' | 'keyless') => void
  signupWithEmail: (email: string, password: string, name: string) => Promise<void>
  loginWithEmail: (email: string, password: string) => Promise<void>
  connectWithGoogle: () => Promise<void>
  connectWithGithub: () => Promise<void>
  connectWithApple: () => Promise<void>
  connectWithPasskey: () => Promise<void>
  connectWallet: (walletName: string, address: string) => Promise<void>
  connectKeyless: (account: KeylessAccount, provider: 'google' | 'apple' | 'passkey') => Promise<void>
  finalizeProfile: (data: { name: string; bio?: string; avatar?: string }) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
