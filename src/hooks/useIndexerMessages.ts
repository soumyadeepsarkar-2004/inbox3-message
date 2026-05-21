import { useState, useEffect, useCallback } from 'react'

const INDEXER_URL = 'https://indexer.testnet.aptoslabs.com/v1/graphql'

interface IndexerEventData {
  sender?: string
  recipient?: string
  message_hash?: string
  timestamp?: string
}

interface IndexerEvent {
  indexed_type: string
  account_address: string
  creation_number: number
  sequence_number: number
  block_height: number
  transaction_version: number
  data: IndexerEventData
}

interface IndexerMessage {
  id: string
  sender: string
  recipient: string
  message_hash: string
  timestamp: string
  transaction_version: number
}

interface UseIndexerMessagesOptions {
  address: string
  limit?: number
  enabled?: boolean
}

interface UseIndexerMessagesReturn {
  messages: IndexerMessage[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useIndexerMessages({ address, limit = 50, enabled = true }: UseIndexerMessagesOptions): UseIndexerMessagesReturn {
  const [messages, setMessages] = useState<IndexerMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMessages = useCallback(async () => {
    if (!enabled || !address) return

    setLoading(true)
    setError(null)

    try {
      const query = `
        query GetMessages($address: String!, $limit: Int!) {
          user_events(
            where: {
              indexed_type: { _eq: "inbox3_addr::inbox3::MessageSentEvent" }
              _or: [
                { data: { _contains: { sender: $address } } }
                { data: { _contains: { recipient: $address } } }
              ]
            }
            order_by: { sequence_number: desc }
            limit: $limit
          ) {
            indexed_type
            account_address
            creation_number
            sequence_number
            block_height
            transaction_version
            data
          }
        }
      `

      const response = await fetch(INDEXER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          variables: { address, limit },
        }),
      })

      if (!response.ok) throw new Error('Indexer query failed')

      const result = await response.json()
      const events: IndexerEvent[] = result.data?.user_events || []

      const parsed: IndexerMessage[] = events.map((e) => ({
        id: `${e.transaction_version}-${e.sequence_number}`,
        sender: e.data?.sender || '',
        recipient: e.data?.recipient || '',
        message_hash: e.data?.message_hash || '',
        timestamp: e.data?.timestamp || '',
        transaction_version: e.transaction_version,
      }))

      setMessages(parsed)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [address, limit, enabled])

  useEffect(() => {
    let mounted = true
    const fetchData = async () => {
      if (mounted) {
        await fetchMessages()
      }
    }
    fetchData()
    return () => { mounted = false }
  }, [fetchMessages])

  return { messages, loading, error, refetch: fetchMessages }
}

export async function checkInboxInitialized(address: string): Promise<boolean> {
  const query = `
    query CheckInbox($address: String!) {
      current_fungible_asset_balances(
        where: { owner_address: { _eq: $address } }
        limit: 1
      ) {
        owner_address
      }
    }
  `

  try {
    const response = await fetch(INDEXER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { address } }),
    })
    const result = await response.json()
    return result.data?.current_fungible_asset_balances?.length > 0 || false
  } catch {
    return false
  }
}
