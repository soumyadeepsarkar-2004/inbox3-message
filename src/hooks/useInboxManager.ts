import { useCallback } from 'react'
import { Aptos, AptosConfig, Network, NetworkToNetworkName } from '@aptos-labs/ts-sdk'
import { toast } from 'sonner'

const APTOS_NETWORK: Network = NetworkToNetworkName[Network.TESTNET]
const aptosConfig = new AptosConfig({ network: APTOS_NETWORK })
const aptos = new Aptos(aptosConfig)

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0x1'

export interface InboxStatus {
  initialized: boolean
  messageCount: number
  publicKey: string | null
  hasEscrow: boolean
  escrowCount: number
}

export function useInboxManager() {
  const checkInboxStatus = useCallback(async (address: string): Promise<InboxStatus | null> => {
    try {
      const [initialized, messageCount, hasEscrow, escrowCountResult] = await Promise.allSettled([
        aptos.view({
          payload: {
            function: `${CONTRACT_ADDRESS}::inbox3::is_inbox_initialized`,
            typeArguments: [],
            functionArguments: [address],
          },
        }),
        aptos.view({
          payload: {
            function: `${CONTRACT_ADDRESS}::inbox3::get_message_count`,
            typeArguments: [],
            functionArguments: [address],
          },
        }),
        aptos.view({
          payload: {
            function: `${CONTRACT_ADDRESS}::inbox3::has_escrow`,
            typeArguments: [],
            functionArguments: [address],
          },
        }),
        aptos.view({
          payload: {
            function: `${CONTRACT_ADDRESS}::inbox3::get_escrow_count`,
            typeArguments: [],
            functionArguments: [address],
          },
        }),
      ])

      const isInboxInitialized = initialized.status === 'fulfilled' && (initialized.value as boolean[])[0] === true
      const count = messageCount.status === 'fulfilled' ? Number((messageCount.value as bigint[])[0]) : 0
      const escrowExists = hasEscrow.status === 'fulfilled' && (hasEscrow.value as boolean[])[0] === true
      const escrowCount = escrowCountResult.status === 'fulfilled' && Array.isArray(escrowCountResult.value)
        ? Number(escrowCountResult.value[0] as bigint)
        : 0

      let publicKey: string | null = null
      if (isInboxInitialized) {
        try {
          const pubKeyResult = await aptos.view({
            payload: {
              function: `${CONTRACT_ADDRESS}::inbox3::get_public_key`,
              typeArguments: [],
              functionArguments: [address],
            },
          })
          publicKey = Buffer.from(pubKeyResult as number[]).toString('hex')
        } catch {
          // Public key not available
        }
      }

      return {
        initialized: isInboxInitialized,
        messageCount: count,
        publicKey,
        hasEscrow: escrowExists,
        escrowCount: escrowCount,
      }
    } catch {
      return null
    }
  }, [])

  const initializeInbox = useCallback(async (
    signAndSubmit: (payload: { function: string; functionArguments: unknown[] }) => Promise<string | null>,
    publicKey: string,
  ) => {
    const toastId = toast.loading('Initializing your inbox on-chain...')

    try {
      const hash = await signAndSubmit({
        function: `${CONTRACT_ADDRESS}::inbox3::initialize_inbox`,
        functionArguments: [publicKey],
      })

      if (hash) {
        toast.success('Inbox initialized', {
          id: toastId,
          description: `Tx: ${hash.slice(0, 10)}...${hash.slice(-6)}`,
        })
        return hash
      }

      toast.error('Initialization failed', { id: toastId })
      return null
    } catch (err) {
      toast.dismiss(toastId)
      const message = err instanceof Error ? err.message : 'Transaction rejected'
      toast.error('Initialization failed', { description: message })
      throw err
    }
  }, [])

  const claimEscrowMessages = useCallback(async (
    signAndSubmit: (payload: { function: string; functionArguments: unknown[] }) => Promise<string | null>,
    publicKey: string,
  ) => {
    const toastId = toast.loading('Claiming escrowed messages...')

    try {
      const hash = await signAndSubmit({
        function: `${CONTRACT_ADDRESS}::inbox3::claim_escrow_messages`,
        functionArguments: [publicKey],
      })

      if (hash) {
        toast.success('Escrow messages claimed', {
          id: toastId,
          description: `Tx: ${hash.slice(0, 10)}...${hash.slice(-6)}`,
        })
        return hash
      }

      toast.error('Claim failed', { id: toastId })
      return null
    } catch (err) {
      toast.dismiss(toastId)
      const message = err instanceof Error ? err.message : 'Transaction rejected'
      toast.error('Claim failed', { description: message })
      throw err
    }
  }, [])

  const sendMessage = useCallback(async (
    signAndSubmit: (payload: { function: string; functionArguments: unknown[] }) => Promise<string | null>,
    recipient: string,
    encryptedPayload: string,
  ) => {
    const toastId = toast.loading('Sending encrypted message...')

    try {
      const hash = await signAndSubmit({
        function: `${CONTRACT_ADDRESS}::inbox3::send_message`,
        functionArguments: [recipient, encryptedPayload],
      })

      if (hash) {
        toast.success('Message sent on-chain', {
          id: toastId,
          description: `Tx: ${hash.slice(0, 10)}...${hash.slice(-6)}`,
        })
        return hash
      }

      toast.error('Message send failed', { id: toastId })
      return null
    } catch (err) {
      toast.dismiss(toastId)
      const message = err instanceof Error ? err.message : 'Transaction rejected'
      toast.error('Message send failed', { description: message })
      throw err
    }
  }, [])

  return {
    checkInboxStatus,
    initializeInbox,
    claimEscrowMessages,
    sendMessage,
  }
}
