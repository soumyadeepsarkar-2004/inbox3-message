import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { useWallet } from '../context/WalletProvider'

export const CONTRACT_ADDRESS = '0xf91ca1a48cc5afee58b78ec7076966e07595f2e8dbaa249d91b139baafd011eb'
export const MODULE_NAME = 'attention_market'

import type { Aptos } from '@aptos-labs/ts-sdk'

let aptosInstance: Aptos | null = null
async function getAptos(): Promise<Aptos> {
  if (!aptosInstance) {
    const { Aptos, AptosConfig, Network } = await import('@aptos-labs/ts-sdk')
    const config = new AptosConfig({ network: Network.TESTNET })
    aptosInstance = new Aptos(config)
  }
  return aptosInstance
}

export function useInbox3() {
  const { signAndSubmit } = useWallet()
  const [loading, setLoading] = useState(false)

  // Send a message with a stake
  const sendMessage = useCallback(async (recipient: string, payloadUri: string, stakeAmount: number) => {
    setLoading(true)
    try {
      const hash = await signAndSubmit({
        function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::send_message`,
        typeArguments: [],
        functionArguments: [recipient, payloadUri, stakeAmount],
      })
      if (hash) {
        const aptos = await getAptos()
        await aptos.waitForTransaction({ transactionHash: hash })
        return hash
      }
      return null
    } catch {
      toast.error('Failed to send message')
      return null
    } finally {
      setLoading(false)
    }
  }, [signAndSubmit])

  // Accept a message (refunds stake to sender)
  const acceptMessage = useCallback(async (messageIndex: number) => {
    setLoading(true)
    try {
      const hash = await signAndSubmit({
        function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::accept_message`,
        typeArguments: [],
        functionArguments: [messageIndex],
      })
      if (hash) {
        const aptos = await getAptos()
        await aptos.waitForTransaction({ transactionHash: hash })
        return hash
      }
      return null
    } catch {
      toast.error('Failed to accept message')
      return null
    } finally {
      setLoading(false)
    }
  }, [signAndSubmit])

  // Report message as spam (slashes stake to recipient)
  const reportSpam = useCallback(async (messageIndex: number) => {
    setLoading(true)
    try {
      const hash = await signAndSubmit({
        function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::report_spam`,
        typeArguments: [],
        functionArguments: [messageIndex],
      })
      if (hash) {
        const aptos = await getAptos()
        await aptos.waitForTransaction({ transactionHash: hash })
        return hash
      }
      return null
    } catch {
      toast.error('Failed to report spam')
      return null
    } finally {
      setLoading(false)
    }
  }, [signAndSubmit])

  // Fetch real-time messages from Aptos Testnet Indexer GraphQL
  const fetchMessages = useCallback(async (accountAddress: string) => {
    const query = `
      query GetInbox3Messages($eventType: String) {
        events(
          where: { type: { _eq: $eventType } }
          order_by: { transaction_version: desc }
          limit: 100
        ) {
          data
          transaction_version
          transaction_block_height
        }
      }
    `
    const variables = {
      eventType: `${CONTRACT_ADDRESS}::${MODULE_NAME}::MessageSentEvent`
    }
    
    try {
      const response = await fetch('https://api.testnet.aptoslabs.com/v1/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables })
      })
      const result = await response.json()
      if (result.errors) {
        return []
      }
      
      const allEvents = result.data.events || []
      // Filter events where the connected account is either the sender or the recipient
      return allEvents
        .map((evt: { data: Record<string, string> }) => evt.data)
        .filter((data: Record<string, string>) => data.recipient === accountAddress || data.sender === accountAddress)
    } catch {
      return []
    }
  }, [])

  // Look up an Aptos Name Service (ANS) domain
  const resolveAptosName = useCallback(async (name: string): Promise<string | null> => {
    try {
      const aptos = await getAptos()
      const cleanName = name.replace(/\.apt$/i, '')
      const record = await aptos.getName({ name: cleanName })
      const addr = (record as { registered_address?: string }).registered_address || null
      return addr
    } catch {
      return null
    }
  }, [])

  return {
    sendMessage,
    acceptMessage,
    reportSpam,
    fetchMessages,
    resolveAptosName,
    loading
  }
}
