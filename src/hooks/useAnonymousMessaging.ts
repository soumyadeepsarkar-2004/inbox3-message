import { useState, useCallback } from 'react'
import nacl from 'tweetnacl'
import { encodeBase64 } from 'tweetnacl-util'

interface EpochalKey {
  publicKey: string
  secretKey: string
  createdAt: number
  commitment: string
}

export function useAnonymousMessaging() {
  const [anonymousEnabled, setAnonymousEnabled] = useState(false)
  const [epochalKeys, setEpochalKeys] = useState<EpochalKey[]>(() => {
    try {
      const raw = localStorage.getItem('inbox3_epochal_keys')
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  const generateEpochalKey = useCallback(async (): Promise<EpochalKey | null> => {
    try {
      const keyPair = nacl.box.keyPair()
      const hashBytes = nacl.hash(keyPair.publicKey)
      const commitment = encodeBase64(hashBytes.slice(0, 16))

      const epochal: EpochalKey = {
        publicKey: encodeBase64(keyPair.publicKey),
        secretKey: encodeBase64(keyPair.secretKey),
        createdAt: Date.now(),
        commitment,
      }

      setEpochalKeys(prev => {
        const next = [epochal, ...prev].slice(0, 10)
        localStorage.setItem('inbox3_epochal_keys', JSON.stringify(next))
        return next
      })
      return epochal
    } catch {
      return null
    }
  }, [])

  const toggleAnonymous = useCallback(() => {
    setAnonymousEnabled(prev => !prev)
  }, [])

  return {
    anonymousEnabled,
    toggleAnonymous,
    epochalKeys,
    generateEpochalKey,
  }
}
