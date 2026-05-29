import nacl from 'tweetnacl'
import { encodeBase64, decodeBase64, decodeUTF8 } from 'tweetnacl-util'

export interface EncryptedPayload {
  version: number
  ciphertext: string
  nonce: string
  ephemeralPublicKey: string
}

export interface MempoolSubmission {
  encryptedPayload: string
  commitment: string
  recipient: string
  timestamp: number
}

const MEMPOOL_QUEUE_KEY = 'inbox3_mempool_queue'

export class EncryptedMempoolClient {
  private thresholdPublicKey: Uint8Array | null = null

  async initialize(thresholdPublicKeyHex?: string): Promise<void> {
    if (thresholdPublicKeyHex) {
      this.thresholdPublicKey = new Uint8Array(
        thresholdPublicKeyHex.match(/.{1,2}/g)!.map(b => parseInt(b, 16))
      )
    }
  }

  async encryptForMempool(
    message: string,
    recipientPublicKey: string,
  ): Promise<EncryptedPayload> {
    const ephemeralKeyPair = nacl.box.keyPair()
    const recipientBytes = decodeBase64(recipientPublicKey)
    const messageBytes = decodeUTF8(message)

    const nonce = nacl.randomBytes(nacl.box.nonceLength)
    const encrypted = nacl.box(messageBytes, nonce, recipientBytes, ephemeralKeyPair.secretKey)

    return {
      version: 1,
      ciphertext: encodeBase64(encrypted),
      nonce: encodeBase64(nonce),
      ephemeralPublicKey: encodeBase64(ephemeralKeyPair.publicKey),
    }
  }

  async createMempoolSubmission(
    encryptedPayload: EncryptedPayload,
    recipient: string,
  ): Promise<MempoolSubmission> {
    const payloadStr = JSON.stringify(encryptedPayload)
    const payloadBytes = decodeUTF8(payloadStr)

    const commitment = encodeBase64(nacl.hash(payloadBytes).slice(0, 16))

    return {
      encryptedPayload: payloadStr,
      commitment,
      recipient,
      timestamp: Date.now(),
    }
  }

  queueSubmission(submission: MempoolSubmission): void {
    let queue: MempoolSubmission[] = []
    try {
      const stored = localStorage.getItem(MEMPOOL_QUEUE_KEY)
      if (stored) queue = JSON.parse(stored)
    } catch { /* corrupted data */ }
    queue.push(submission)
    localStorage.setItem(MEMPOOL_QUEUE_KEY, JSON.stringify(queue))
  }

  getQueuedSubmissions(): MempoolSubmission[] {
    try {
      const stored = localStorage.getItem(MEMPOOL_QUEUE_KEY)
      if (stored) return JSON.parse(stored)
    } catch { /* corrupted data */ }
    return []
  }

  clearQueue(): void {
    localStorage.removeItem(MEMPOOL_QUEUE_KEY)
  }

  isInitialized(): boolean {
    return this.thresholdPublicKey !== null
  }
}

export const encryptedMempoolClient = new EncryptedMempoolClient()
