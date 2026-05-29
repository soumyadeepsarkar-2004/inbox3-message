import nacl from 'tweetnacl'
import { encodeBase64, decodeBase64, decodeUTF8 } from 'tweetnacl-util'

export interface ConfidentialTransfer {
  id: string
  from: string
  to: string
  encryptedAmount: string
  commitment: string
  timestamp: number
  status: 'pending' | 'confirmed' | 'failed'
}

export interface ConfidentialBalance {
  encryptedBalance: string
  lastUpdated: number
}

const CONF_KEY = 'inbox3_confidential_apt'

export class ConfidentialAPTClient {
  private keyPair: nacl.BoxKeyPair | null = null

  async initialize(): Promise<void> {
    try {
      const stored = localStorage.getItem(`${CONF_KEY}_keypair`)
      if (stored) {
        const parsed = JSON.parse(stored)
        this.keyPair = {
          publicKey: decodeBase64(parsed.publicKey),
          secretKey: decodeBase64(parsed.secretKey),
        }
      } else {
        this.keyPair = nacl.box.keyPair()
        localStorage.setItem(`${CONF_KEY}_keypair`, JSON.stringify({
          publicKey: encodeBase64(this.keyPair.publicKey),
          secretKey: encodeBase64(this.keyPair.secretKey),
        }))
      }
    } catch {
      this.keyPair = nacl.box.keyPair()
    }
  }

  async encryptTransferAmount(amount: number, recipientPublicKey: string): Promise<{ encryptedAmount: string; commitment: string }> {
    if (!this.keyPair) await this.initialize()
    const amountStr = amount.toString()
    const amountBytes = decodeUTF8(amountStr)
    const recipientBytes = decodeBase64(recipientPublicKey)
    const nonce = nacl.randomBytes(nacl.box.nonceLength)
    const encrypted = nacl.box(amountBytes, nonce, recipientBytes, this.keyPair!.secretKey)
    const encryptedAmount = encodeBase64(new Uint8Array([...nonce, ...encrypted]))

    const commitmentBytes = nacl.hash(decodeUTF8(encryptedAmount)).slice(0, 16)
    const commitment = encodeBase64(commitmentBytes)

    return { encryptedAmount, commitment }
  }

  async decryptTransferAmount(encryptedAmount: string, senderPublicKey: string): Promise<number> {
    if (!this.keyPair) await this.initialize()
    const data = decodeBase64(encryptedAmount)
    const nonce = data.slice(0, nacl.box.nonceLength)
    const ciphertext = data.slice(nacl.box.nonceLength)
    const senderBytes = decodeBase64(senderPublicKey)
    const decrypted = nacl.box.open(ciphertext, nonce, senderBytes, this.keyPair!.secretKey)
    if (!decrypted) throw new Error('Failed to decrypt transfer amount')
    return parseFloat(new TextDecoder().decode(decrypted))
  }

  isReady(): boolean {
    return this.keyPair !== null
  }
}

export const confidentialAPTClient = new ConfidentialAPTClient()
