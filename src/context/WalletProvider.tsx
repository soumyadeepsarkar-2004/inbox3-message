/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useCallback, type ReactNode } from 'react'
import {
  useWallet as useWalletAdapter,
  AptosWalletAdapterProvider,
  aptosStandardSupportedWalletList,
  type InputTransactionData,
} from '@aptos-labs/wallet-adapter-react'
import { Network } from '@aptos-labs/ts-sdk'
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

  const connect = useCallback(async (walletName?: string) => {
    setTxStatus('signing')
    try {
      if (adapter.connect) {
        const walletNameFromList = walletName || (adapter.wallet as { name?: string })?.name
        if (walletNameFromList) {
          await adapter.connect(walletNameFromList)
        } else {
          const availableWallets = aptosStandardSupportedWalletList.filter(
            (w) => String(w.readyState) === 'Installed'
          )
          if (availableWallets.length === 0) {
            setTxStatus('failed')
            throw new Error('No Aptos wallet detected. Please install Petra or another supported wallet.')
          }
          await adapter.connect(availableWallets[0].name)
        }
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
          typeArguments: payload.typeArguments ?? [],
          functionArguments: payload.functionArguments as never[],
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
        walletName: (adapter.wallet as { name?: string })?.name || null,
        connect,
        disconnect,
        signAndSubmit,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

const getAppNetworkName = (): Network => {
  const envNetwork = import.meta.env.VITE_APTOS_NETWORK

  if (!envNetwork) {
    return Network.TESTNET
  }

  const normalized = envNetwork.trim().toLowerCase()

  switch (normalized) {
    case 'mainnet':
      return Network.MAINNET
    case 'testnet':
      return Network.TESTNET
    case 'devnet':
      return Network.DEVNET
    case 'local':
    case 'localhost':
      return Network.LOCAL
    default:
      return Network.TESTNET
  }
}

export function Inbox3WalletProvider({ children }: { children: ReactNode }) {
  return (
    <AptosWalletAdapterProvider
      autoConnect={false}
      dappConfig={{ network: getAppNetworkName() }}
      onError={() => {}}
    >
      <WalletAdapterBridge>{children}</WalletAdapterBridge>
    </AptosWalletAdapterProvider>
  )
}
