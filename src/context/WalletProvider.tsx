/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useCallback, type ReactNode } from 'react'
import {
  useWallet as useWalletAdapter,
  AptosWalletAdapterProvider,
  aptosStandardSupportedWalletList,
  type InputTransactionData,
} from '@aptos-labs/wallet-adapter-react'
import { useAppStore } from '../store/useAppStore'
import type { TransactionPayload, WalletState } from './WalletTypes'

const WalletContext = createContext<WalletState | null>(null)

export function useWallet(): WalletState {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error('useWallet must be used within WalletProvider')
  return ctx
}

function WalletAdapterBridge({ children }: { children: ReactNode }) {
  const adapter = useWalletAdapter()
  const { setTxStatus, setTxHash } = useAppStore()

  const connect = useCallback(async () => {
    setTxStatus('signing')
    try {
      const availableWallets = aptosStandardSupportedWalletList.filter(
        (w) => String(w.readyState) === 'Installed'
      )
      if (availableWallets.length === 0) {
        setTxStatus('failed')
        throw new Error('No Aptos wallet detected. Please install Petra or another supported wallet.')
      }
      if (adapter.connect) {
        await adapter.connect(availableWallets[0].name)
      }
      setTxStatus('confirmed')
    } catch (err) {
      setTxStatus('failed')
      const message = err instanceof Error ? err.message : 'Connection rejected'
      throw new Error(message, { cause: err })
    }
  }, [adapter, setTxStatus])

  const disconnect = useCallback(async () => {
    if (adapter.disconnect) {
      await adapter.disconnect()
    }
    setTxStatus('idle')
  }, [adapter, setTxStatus])

  const signAndSubmit = useCallback(async (payload: TransactionPayload): Promise<string | null> => {
    if (!adapter.signAndSubmitTransaction || !adapter.account) return null

    setTxStatus('signing')
    try {
      const txData: InputTransactionData = {
        data: {
          function: (payload.function || 'inbox3_addr::inbox3::send_message') as `${string}::${string}::${string}`,
          typeArguments: [],
          functionArguments: [payload.content ?? '', payload.recipient ?? ''] as const,
        },
      }

      const response = await adapter.signAndSubmitTransaction(txData)

      setTxStatus('submitting')
      const hash = response.hash || ''
      setTxHash(hash)
      setTxStatus('confirmed')
      return hash
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Transaction rejected by user'
      setTxStatus('failed')
      throw new Error(message, { cause: err })
    }
  }, [adapter, setTxStatus, setTxHash])

  return (
    <WalletContext.Provider
      value={{
        connected: adapter.connected,
        address: adapter.account?.address.toString() || null,
        walletName: adapter.wallet?.name || null,
        connect,
        disconnect,
        signAndSubmit,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function Inbox3WalletProvider({ children }: { children: ReactNode }) {
  return (
    <AptosWalletAdapterProvider
      autoConnect={false}
      dappConfig={{ network: 'testnet' as never }}
      onError={(error) => {
        console.error('Wallet adapter error:', error)
      }}
    >
      <WalletAdapterBridge>{children}</WalletAdapterBridge>
    </AptosWalletAdapterProvider>
  )
}
