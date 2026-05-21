import { useState, useCallback } from 'react'
import { AuthContext } from './AuthTypes'
import type { AuthContextType, User } from './AuthTypes'
import type { ReactNode } from 'react'
import { useKeylessAuth, type KeylessAccount } from '../hooks/useKeylessAuth'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<AuthContextType['step']>('signup')
  const [pendingUser, setPendingUser] = useState<Partial<User>>({})
  const { signInWithGoogle, signInWithApple, signInWithPasskey } = useKeylessAuth()

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
    try {
      const account = await signInWithGoogle()
      setPendingUser({
        email: 'user@gmail.com',
        name: 'Google User',
        keylessAccount: account,
        authMethod: 'keyless',
      })
      setStep('profile')
    } catch {
      setStep('signup')
    } finally {
      setLoading(false)
    }
  }, [signInWithGoogle])

  const connectWithGithub = useCallback(async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 1500))
    setPendingUser({ email: 'user@github.com', name: 'GitHub User' })
    setStep('profile')
    setLoading(false)
  }, [])

  const connectWithApple = useCallback(async () => {
    setLoading(true)
    try {
      const account = await signInWithApple()
      setPendingUser({
        email: 'user@icloud.com',
        name: 'Apple User',
        keylessAccount: account,
        authMethod: 'keyless',
      })
      setStep('profile')
    } catch {
      setStep('signup')
    } finally {
      setLoading(false)
    }
  }, [signInWithApple])

  const connectWithPasskey = useCallback(async () => {
    setLoading(true)
    try {
      const account = await signInWithPasskey()
      setPendingUser({
        name: 'Passkey User',
        keylessAccount: account,
        authMethod: 'passkey',
      })
      setStep('profile')
    } catch {
      setStep('signup')
    } finally {
      setLoading(false)
    }
  }, [signInWithPasskey])

  const connectWallet = useCallback(async (walletName: string, address: string) => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 2000))
    setPendingUser({ walletAddress: address, walletName, name: address.slice(0, 8) })
    setStep('profile')
    setLoading(false)
  }, [])

  const connectKeyless = useCallback(async (account: KeylessAccount, provider: 'google' | 'apple' | 'passkey') => {
    setLoading(true)
    setPendingUser({
      walletAddress: account.address,
      name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
      keylessAccount: account,
      authMethod: provider === 'passkey' ? 'passkey' : 'keyless',
    })
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
    <AuthContext.Provider value={{
      user,
      loading,
      step,
      setStep,
      signupWithEmail,
      loginWithEmail,
      connectWithGoogle,
      connectWithGithub,
      connectWithApple,
      connectWithPasskey,
      connectWallet,
      connectKeyless,
      finalizeProfile,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
