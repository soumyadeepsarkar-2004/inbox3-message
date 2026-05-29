import { useState, useCallback } from 'react'
import { x402Facilitator, type X402Receipt } from '../lib/x402'
import nacl from 'tweetnacl'
import { encodeBase64 } from 'tweetnacl-util'

const STAKE_AMOUNT = 0.01
const X402_MIN_PAYMENT = '0.01'
const STORAGE_KEY = 'inbox3_stake_config'

interface StakedMessageConfig {
  enabled: boolean
  minStake: number
  x402Enabled: boolean
  x402Currency: string
}

interface SessionKey {
  publicKey: string
  secretKey: string
  createdAt: number
  label: string
}

export function useStakedMessaging() {
  const [config, setConfig] = useState<StakedMessageConfig>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : { enabled: false, minStake: STAKE_AMOUNT, x402Enabled: false, x402Currency: 'USDC' }
    } catch {
      return { enabled: false, minStake: STAKE_AMOUNT, x402Enabled: false, x402Currency: 'USDC' }
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
      const keyPair = nacl.box.keyPair()
      const sessionKey: SessionKey = {
        publicKey: encodeBase64(keyPair.publicKey),
        secretKey: encodeBase64(keyPair.secretKey),
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

  const processX402Payment = useCallback(async (messageId: string, recipient: string): Promise<X402Receipt | null> => {
    return x402Facilitator.requestPayment(X402_MIN_PAYMENT, recipient, messageId)
  }, [])

  const getX402Receipts = useCallback((): X402Receipt[] => {
    return x402Facilitator.getReceipts()
  }, [])

  return {
    config,
    updateConfig,
    sessionKeys,
    generateSessionKey,
    revokeSessionKey,
    stakeAmount: STAKE_AMOUNT,
    processX402Payment,
    getX402Receipts,
  }
}
