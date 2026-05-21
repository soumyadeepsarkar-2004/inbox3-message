/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { useAppStore } from '../store/useAppStore'
import type { TransactionPayload, WalletState } from './WalletTypes'

const WalletContext = createContext<WalletState | null>(null)

export function useWallet(): WalletState {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error('useWallet must be used within WalletProvider')
  return ctx
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [walletName, setWalletName] = useState<string | null>(null)
  const { setTxStatus, setTxHash } = useAppStore()

  const connect = useCallback(async () => {
    setTxStatus('signing')
    await new Promise(r => setTimeout(r, 1500))
    const mockAddress = `0x${Math.random().toString(16).slice(2, 42)}`
    setAddress(mockAddress)
    setWalletName('Petra')
    setConnected(true)
    setTxStatus('confirmed')
  }, [setTxStatus])

  const disconnect = useCallback(() => {
    setConnected(false)
    setAddress(null)
    setWalletName(null)
    setTxStatus('idle')
  }, [setTxStatus])

  const signAndSubmit = useCallback(async (_payload: TransactionPayload): Promise<string | null> => {
    setTxStatus('signing')
    await new Promise(r => setTimeout(r, 1000))
    setTxStatus('submitting')
    await new Promise(r => setTimeout(r, 2000))
    const hash = `0x${Math.random().toString(16).slice(2, 66)}`
    setTxHash(hash)
    setTxStatus('confirmed')
    return hash
  }, [setTxStatus, setTxHash])

  return (
    <WalletContext.Provider value={{ connected, address, walletName, connect, disconnect, signAndSubmit }}>
      {children}
    </WalletContext.Provider>
  )
}
