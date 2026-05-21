import { aptos, CONTRACT_ADDRESS } from '../config'
import { encryptionManager } from './crypto'
import type { Message, ProcessedMessage } from '../types'

import type { InputTransactionData } from '@aptos-labs/wallet-adapter-react'

export async function createInbox(signAndSubmitTransaction: (args: InputTransactionData) => Promise<{ hash: string }>): Promise<boolean> {
  try {
    const response = await signAndSubmitTransaction({
      data: {
        function: `${CONTRACT_ADDRESS}::Inbox3::create_inbox`,
        typeArguments: [],
        functionArguments: []
      }
    })
    await aptos.waitForTransaction({ transactionHash: response.hash })
    return true
  } catch {
    return false
  }
}

export async function checkInboxExists(address: string): Promise<boolean> {
  try {
    const response = await aptos.view({
      payload: {
        function: `${CONTRACT_ADDRESS}::Inbox3::inbox_exists`,
        functionArguments: [address]
      }
    })
    return (response as unknown[])[0] as boolean
  } catch {
    return false
  }
}

export async function fetchMessages(address: string): Promise<ProcessedMessage[]> {
  try {
    const inboxRes = await aptos.view({
      payload: {
        function: `${CONTRACT_ADDRESS}::Inbox3::inbox_of`,
        functionArguments: [address]
      }
    })
    const messages = (inboxRes as unknown[])[0] as Message[]
    const processed: ProcessedMessage[] = []

    for (const msg of messages) {
      try {
        const content = await fetchFromIPFS(msg.cid)
        const decrypted = encryptionManager.decrypt(content, msg.sender)
        processed.push({
          ...msg,
          content: decrypted,
          type: 'text',
          direction: 'received'
        })
      } catch {
        processed.push({
          ...msg,
          content: 'Encrypted message',
          type: 'text',
          direction: 'received'
        })
      }
    }
    return processed
  } catch {
    return []
  }
}

export async function sendMessage(
  signAndSubmitTransaction: (args: InputTransactionData) => Promise<{ hash: string }>,
  recipient: string,
  content: string
): Promise<boolean> {
  try {
    const encrypted = encryptionManager.encrypt(content, recipient)
    const cid = await uploadToIPFS(encrypted)
    const response = await signAndSubmitTransaction({
      data: {
        function: `${CONTRACT_ADDRESS}::Inbox3::send_message`,
        typeArguments: [],
        functionArguments: [recipient, cid]
      }
    })
    await aptos.waitForTransaction({ transactionHash: response.hash })
    return true
  } catch {
    return false
  }
}

async function fetchFromIPFS(cid: string): Promise<string> {
  const gateway = import.meta.env.VITE_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs'
  const res = await fetch(`${gateway}/${cid}`)
  if (!res.ok) throw new Error('IPFS fetch failed')
  return res.text()
}

async function uploadToIPFS(data: string): Promise<string> {
  const apiKey = import.meta.env.VITE_PINATA_API_KEY || ''
  if (!apiKey) throw new Error('Pinata API key not configured')
  const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: { pinata_api_key: apiKey },
    body: JSON.stringify({ pinataContent: data })
  })
  if (!res.ok) throw new Error('IPFS upload failed')
  const json = await res.json()
  return json.IpfsHash
}