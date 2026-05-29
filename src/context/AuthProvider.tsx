import { useState, useCallback, useEffect } from 'react'
import { AuthContext } from './AuthTypes'
import type { AuthContextType, User } from './AuthTypes'
import type { ReactNode } from 'react'
import { useKeylessAuth, type KeylessAccount } from '../hooks/useKeylessAuth'

const GITHUB_AUTH_KEY = 'github_auth_completed'
const AUTH_USER_KEY = 'inbox3_auth_user'

function saveUser(user: User) {
  try {
    const serializable = { ...user, keylessAccount: undefined }
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(serializable))
  } catch { /* storage full */ }
}

function loadUser(): User | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function clearUser() {
  try { localStorage.removeItem(AUTH_USER_KEY) } catch { /* ignore */ }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadUser)
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [step, setStep] = useState<AuthContextType['step']>('signup')
  const [pendingUser, setPendingUser] = useState<Partial<User>>({})

  useEffect(() => {
    try {
      const stored = localStorage.getItem(GITHUB_AUTH_KEY)
      if (stored) {
        localStorage.removeItem(GITHUB_AUTH_KEY)
        setPendingUser({
          authMethod: 'keyless',
        })
        setStep('profile')
      }
    } catch {
      localStorage.removeItem(GITHUB_AUTH_KEY)
    }
    setInitialized(true)
  }, [])
  const { signInWithGoogle, signInWithApple, signInWithGithub, signInWithPasskey } = useKeylessAuth()

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
        name: account.address.slice(0, 8),
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
    try {
      await signInWithGithub()
    } catch {
      setStep('signup')
    } finally {
      setLoading(false)
    }
  }, [signInWithGithub])

  const connectWithApple = useCallback(async () => {
    setLoading(true)
    try {
      const account = await signInWithApple()
      setPendingUser({
        name: account.address.slice(0, 8),
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
    const newUser: User = {
      id: crypto.randomUUID(),
      ...pendingUser,
      ...data,
      createdAt: new Date().toISOString()
    }
    setUser(newUser)
    saveUser(newUser)
    setLoading(false)
  }, [pendingUser])

  const logout = useCallback(() => {
    setUser(null)
    clearUser()
    setPendingUser({})
    setStep('signup')
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      initialized,
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
