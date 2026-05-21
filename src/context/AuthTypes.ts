import { createContext, useContext } from 'react'

export interface User {
  id: string
  email?: string
  name?: string
  avatar?: string
  walletAddress?: string
  walletName?: string
  bio?: string
  createdAt: string
}

export interface AuthContextType {
  user: User | null
  loading: boolean
  step: 'signup' | 'login' | 'wallet' | 'profile'
  setStep: (step: 'signup' | 'login' | 'wallet' | 'profile') => void
  signupWithEmail: (email: string, password: string, name: string) => Promise<void>
  loginWithEmail: (email: string, password: string) => Promise<void>
  connectWithGoogle: () => Promise<void>
  connectWithGithub: () => Promise<void>
  connectWallet: (walletName: string, address: string) => Promise<void>
  finalizeProfile: (data: { name: string; bio?: string; avatar?: string }) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}