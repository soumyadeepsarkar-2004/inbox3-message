import { useState, useCallback } from 'react'

interface ANSResult {
  address: string | null
  primaryName: string | null
  loading: boolean
  error: string | null
}

interface NameRecord {
  expiration: { vec: [string] | [] }
  target: { vec: [`0x${string}`] | [] }
}

export function useANS() {
  const [resolving, setResolving] = useState(false)

  const resolveName = useCallback(async (name: string): Promise<ANSResult> => {
    setResolving(true)
    try {
      const { Aptos, AptosConfig, Network } = await import('@aptos-labs/ts-sdk')
      const envNetwork = (import.meta.env.VITE_APTOS_NETWORK as string) || 'testnet'
      const network = envNetwork === 'mainnet' ? Network.MAINNET : Network.TESTNET
      const config = new AptosConfig({ network })
      const aptos = new Aptos(config)

      const nameClean = name.replace(/\.apt$/i, '')
      const record = await aptos.getName({ name: nameClean }) as NameRecord
      const addr = record.target?.vec?.[0] || null
      return {
        address: addr || null,
        primaryName: nameClean,
        loading: false,
        error: null,
      }
    } catch {
      return { address: null, primaryName: null, loading: false, error: 'Could not resolve .apt name' }
    } finally {
      setResolving(false)
    }
  }, [])

  const reverseResolve = useCallback(async (address: string): Promise<ANSResult> => {
    try {
      const { Aptos, AptosConfig, Network } = await import('@aptos-labs/ts-sdk')
      const envNetwork = (import.meta.env.VITE_APTOS_NETWORK as string) || 'testnet'
      const network = envNetwork === 'mainnet' ? Network.MAINNET : Network.TESTNET
      const config = new AptosConfig({ network })
      const aptos = new Aptos(config)

      const primaryName = await aptos.getPrimaryName({ address }) as string | null
      return {
        address,
        primaryName: primaryName || null,
        loading: false,
        error: null,
      }
    } catch {
      return { address, primaryName: null, loading: false, error: null }
    }
  }, [])

  return { resolving, resolveName, reverseResolve }
}
