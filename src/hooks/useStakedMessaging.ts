import { useState, useCallback } from 'react'

const STAKE_AMOUNT = 0.01
const STORAGE_KEY = 'inbox3_stake_config'

interface StakedMessageConfig {
  enabled: boolean
  minStake: number
}

interface SessionKey {
  publicKey: string
  createdAt: number
  label: string
}

export function useStakedMessaging() {
  const [config, setConfig] = useState<StakedMessageConfig>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : { enabled: false, minStake: STAKE_AMOUNT }
    } catch {
      return { enabled: false, minStake: STAKE_AMOUNT }
    }
  })
  const [sessionKeys, setSessionKeys] = useState<SessionKey[]>(() => {
    try {
      const raw = localStorage.getItem('inbox3_session_keys')
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  const updateConfig = useCallback((updates: Partial<StakedMessageConfig>) => {
    setConfig(prev => {
      const next = { ...prev, ...updates }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const generateSessionKey = useCallback(async (label: string): Promise<SessionKey | null> => {
    try {
      const nacl = await import('tweetnacl')
      const { encodeBase64 } = await import('tweetnacl-util')
      const keyPair = nacl.box.keyPair()
      const sessionKey: SessionKey = {
        publicKey: encodeBase64(keyPair.publicKey),
        createdAt: Date.now(),
        label,
      }
      setSessionKeys(prev => {
        const next = [...prev, sessionKey]
        localStorage.setItem('inbox3_session_keys', JSON.stringify(next))
        return next
      })
      return sessionKey
    } catch {
      return null
    }
  }, [])

  const revokeSessionKey = useCallback((publicKey: string) => {
    setSessionKeys(prev => {
      const next = prev.filter(k => k.publicKey !== publicKey)
      localStorage.setItem('inbox3_session_keys', JSON.stringify(next))
      return next
    })
  }, [])

  return {
    config,
    updateConfig,
    sessionKeys,
    generateSessionKey,
    revokeSessionKey,
    stakeAmount: STAKE_AMOUNT,
  }
}
