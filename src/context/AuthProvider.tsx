import { useState, useCallback } from 'react'
import { AuthContext } from './AuthTypes'
import type { AuthContextType, User } from './AuthTypes'
import type { ReactNode } from 'react'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<AuthContextType['step']>('signup')
  const [pendingUser, setPendingUser] = useState<Partial<User>>({})

  const signupWithEmail = useCallback(async (email: string, _password: string, name: string) => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 1500))
    setPendingUser({ email, name })
    setStep('profile')
    setLoading(false)
  }, [])

  const loginWithEmail = useCallback(async (email: string, _password: string) => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 1500))
    setUser({
      id: crypto.randomUUID(),
      email,
      name: email.split('@')[0],
      createdAt: new Date().toISOString()
    })
    setLoading(false)
  }, [])

  const connectWithGoogle = useCallback(async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 1500))
    setPendingUser({ email: 'user@gmail.com', name: 'Google User' })
    setStep('profile')
    setLoading(false)
  }, [])

  const connectWithGithub = useCallback(async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 1500))
    setPendingUser({ email: 'user@github.com', name: 'GitHub User' })
    setStep('profile')
    setLoading(false)
  }, [])

  const connectWallet = useCallback(async (walletName: string, address: string) => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 2000))
    setPendingUser({ walletAddress: address, walletName, name: address.slice(0, 8) })
    setStep('profile')
    setLoading(false)
  }, [])

  const finalizeProfile = useCallback(async (data: { name: string; bio?: string; avatar?: string }) => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    setUser({
      id: crypto.randomUUID(),
      ...pendingUser,
      ...data,
      createdAt: new Date().toISOString()
    })
    setLoading(false)
  }, [pendingUser])

  const logout = useCallback(() => {
    setUser(null)
    setPendingUser({})
    setStep('signup')
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, step, setStep, signupWithEmail, loginWithEmail, connectWithGoogle, connectWithGithub, connectWallet, finalizeProfile, logout }}>
      {children}
    </AuthContext.Provider>
  )
}