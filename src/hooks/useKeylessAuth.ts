import { useCallback } from 'react'
import { Aptos, AptosConfig, Network, NetworkToNetworkName, Ed25519PrivateKey, EphemeralKeyPair } from '@aptos-labs/ts-sdk'
import { toast } from 'sonner'

const APTOS_NETWORK: Network = NetworkToNetworkName[Network.TESTNET]
const aptosConfig = new AptosConfig({ network: APTOS_NETWORK })
const aptos = new Aptos(aptosConfig)

export interface KeylessAccount {
  address: string
  publicKey: string
  jwt: string
  expiresAt: number
}

const STORAGE_KEY = 'inbox3_keyless_account'

function saveKeylessAccount(account: KeylessAccount) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(account))
  } catch {
    // Storage not available
  }
}

function loadKeylessAccount(): KeylessAccount | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    const account: KeylessAccount = JSON.parse(stored)
    if (Date.now() > account.expiresAt) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return account
  } catch {
    return null
  }
}

export function useKeylessAuth() {
  const signInWithGoogle = useCallback(async () => {
    try {
      toast.loading('Redirecting to Google sign-in...')
      
      const jwt = await getGoogleJwt()
      const privateKey = Ed25519PrivateKey.generate()
      const ephemeralKeyPair = new EphemeralKeyPair({ privateKey })
      
      const keylessAccount = await aptos.deriveKeylessAccount({
        jwt,
        ephemeralKeyPair,
      })

      const account: KeylessAccount = {
        address: keylessAccount.accountAddress.toString(),
        publicKey: keylessAccount.publicKey.toString(),
        jwt: '',
        expiresAt: Date.now() + 3600000,
      }

      saveKeylessAccount(account)
      toast.dismiss()
      toast.success('Signed in with Google')

      return account
    } catch (err) {
      toast.dismiss()
      const message = err instanceof Error ? err.message : 'Google sign-in failed'
      toast.error('Authentication failed', { description: message })
      throw err
    }
  }, [])

  const signInWithApple = useCallback(async () => {
    try {
      toast.loading('Redirecting to Apple sign-in...')
      
      const jwt = await getAppleJwt()
      const privateKey = Ed25519PrivateKey.generate()
      const ephemeralKeyPair = new EphemeralKeyPair({ privateKey })
      
      const keylessAccount = await aptos.deriveKeylessAccount({
        jwt,
        ephemeralKeyPair,
      })

      const account: KeylessAccount = {
        address: keylessAccount.accountAddress.toString(),
        publicKey: keylessAccount.publicKey.toString(),
        jwt: '',
        expiresAt: Date.now() + 3600000,
      }

      saveKeylessAccount(account)
      toast.dismiss()
      toast.success('Signed in with Apple')

      return account
    } catch (err) {
      toast.dismiss()
      const message = err instanceof Error ? err.message : 'Apple sign-in failed'
      toast.error('Authentication failed', { description: message })
      throw err
    }
  }, [])

  const signInWithPasskey = useCallback(async () => {
    try {
      toast.loading('Creating passkey credential...')

      if (!window.PublicKeyCredential) {
        throw new Error('Passkeys are not supported on this device')
      }

      const challenge = new Uint8Array(32)
      crypto.getRandomValues(challenge)

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: {
            name: 'Inbox3',
            id: window.location.hostname || 'localhost',
          },
          user: {
            id: crypto.getRandomValues(new Uint8Array(16)),
            name: `inbox3-${Date.now()}`,
            displayName: 'Inbox3 User',
          },
          pubKeyCredParams: [
            { alg: -7, type: 'public-key' },
            { alg: -257, type: 'public-key' },
          ],
          authenticatorSelection: {
            residentKey: 'required',
            userVerification: 'required',
          },
          timeout: 60000,
        },
      }) as PublicKeyCredential

      if (!credential) {
        throw new Error('Passkey creation cancelled')
      }

      const account: KeylessAccount = {
        address: `0x${Buffer.from(credential.rawId).toString('hex').slice(0, 64)}`,
        publicKey: Buffer.from(credential.rawId).toString('hex'),
        jwt: '',
        expiresAt: Date.now() + 86400000 * 30,
      }

      saveKeylessAccount(account)
      toast.dismiss()
      toast.success('Passkey created successfully')

      return account
    } catch (err) {
      toast.dismiss()
      const message = err instanceof Error ? err.message : 'Passkey authentication failed'
      toast.error('Authentication failed', { description: message })
      throw err
    }
  }, [])

  const restoreSession = useCallback((): KeylessAccount | null => {
    return loadKeylessAccount()
  }, [])

  const signOut = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    toast.info('Signed out')
  }, [])

  return {
    signInWithGoogle,
    signInWithApple,
    signInWithPasskey,
    restoreSession,
    signOut,
  }
}

async function getGoogleJwt(): Promise<string> {
  return new Promise((resolve, reject) => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!clientId) {
      reject(new Error('Google Client ID not configured'))
      return
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => {
      const google = (window as unknown as Record<string, unknown>).google as Record<string, unknown> | undefined
      if (!google) {
        reject(new Error('Google SDK failed to load'))
        return
      }

      const accounts = google.accounts as Record<string, unknown> | undefined
      if (!accounts) {
        reject(new Error('Google accounts API not available'))
        return
      }

      const oauth2 = (accounts.oauth2 as Record<string, unknown>) || {}
      const initTokenClient = oauth2.initTokenClient as ((config: Record<string, unknown>) => void) | undefined

      if (!initTokenClient) {
        reject(new Error('Failed to initialize Google OAuth'))
        return
      }

      const tokenClient = initTokenClient({
        client_id: clientId,
        scope: 'openid profile email',
        callback: (response: Record<string, string | undefined>) => {
          if (response.access_token) {
            resolve(response.access_token)
          } else {
            reject(new Error('Google authentication failed'))
          }
        },
      })

      void tokenClient
    }
    script.onerror = () => reject(new Error('Failed to load Google SDK'))
    document.head.appendChild(script)
  })
}

async function getAppleJwt(): Promise<string> {
  return new Promise((resolve, reject) => {
    const clientId = import.meta.env.VITE_APPLE_CLIENT_ID
    if (!clientId) {
      reject(new Error('Apple Client ID not configured'))
      return
    }

    const script = document.createElement('script')
    script.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js'
    script.async = true
    script.defer = true
    script.onload = () => {
      const AppleID = (window as unknown as Record<string, unknown>).AppleID as Record<string, unknown> | undefined
      if (!AppleID) {
        reject(new Error('Apple SDK failed to load'))
        return
      }

      const auth = AppleID.auth as Record<string, () => Promise<Record<string, Record<string, string> | undefined>>> | undefined
      if (!auth) {
        reject(new Error('Apple auth not available'))
        return
      }

      auth.signIn()
        .then((result) => {
          const authorization = result.authorization
          if (authorization?.id_token) {
            resolve(authorization.id_token)
          } else {
            reject(new Error('Apple authentication failed'))
          }
        })
        .catch(() => reject(new Error('Apple sign-in cancelled')))
    }
    script.onerror = () => reject(new Error('Failed to load Apple SDK'))
    document.head.appendChild(script)
  })
}
