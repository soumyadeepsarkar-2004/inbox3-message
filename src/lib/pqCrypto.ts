import nacl from 'tweetnacl'
import { encodeBase64, decodeBase64, encodeUTF8, decodeUTF8 } from 'tweetnacl-util'

const RATCHET_STORAGE_KEY = 'inbox3_ratchet_state'
const PQ_KEY_STORAGE_KEY = 'inbox3_pq_keypair'
const PQ_SESSION_KEY = 'inbox3_pq_session'

export interface HybridCiphertext {
  version: number
  kemCiphertext: string
  nonce: string
  ciphertext: string
  senderPublicKey: string
}

export interface PQKeyPair {
  publicKey: string
  secretKey: string
}

export interface RatchetState {
  chainKey: string
  ratchetKeyPrivate: string
  ratchetKeyPublic: string
  remoteRatchetPublic: string | null
  messageCount: number
}

export class PQEncryptionManager {
  private keyPair: PQKeyPair | null = null
  private ratchetState: RatchetState | null = null

  generateKeys(): PQKeyPair {
    const naclKeys = nacl.box.keyPair()
    this.keyPair = {
      publicKey: encodeBase64(naclKeys.publicKey),
      secretKey: encodeBase64(naclKeys.secretKey),
    }
    localStorage.setItem(PQ_KEY_STORAGE_KEY, JSON.stringify(this.keyPair))
    return this.keyPair
  }

  loadKeys(): boolean {
    const stored = localStorage.getItem(PQ_KEY_STORAGE_KEY)
    if (stored) {
      this.keyPair = JSON.parse(stored)
      return true
    }
    return false
  }

  getPublicKey(): string | null {
    return this.keyPair?.publicKey ?? null
  }

  clearKeys(): void {
    this.keyPair = null
    this.ratchetState = null
    localStorage.removeItem(PQ_KEY_STORAGE_KEY)
    localStorage.removeItem(RATCHET_STORAGE_KEY)
    localStorage.removeItem(PQ_SESSION_KEY)
  }

  initRatchet(remotePublicKey: string): void {
    if (!this.keyPair) throw new Error('Keys not loaded')

    const remoteBytes = decodeBase64(remotePublicKey)
    const selfSecretBytes = decodeBase64(this.keyPair.secretKey)
    const selfPublicBytes = decodeBase64(this.keyPair.publicKey)

    const sharedSecret = nacl.box.before(remoteBytes, selfSecretBytes)
    const chainKey = encodeBase64(new Uint8Array([...sharedSecret, ...selfPublicBytes]).slice(0, 32))

    const ratchetKeyPair = nacl.box.keyPair()

    this.ratchetState = {
      chainKey,
      ratchetKeyPrivate: encodeBase64(ratchetKeyPair.secretKey),
      ratchetKeyPublic: encodeBase64(ratchetKeyPair.publicKey),
      remoteRatchetPublic: remotePublicKey,
      messageCount: 0,
    }

    localStorage.setItem(RATCHET_STORAGE_KEY, JSON.stringify(this.ratchetState))
    localStorage.setItem(PQ_SESSION_KEY, JSON.stringify({ remotePublicKey, createdAt: Date.now() }))
  }

  private deriveMessageKey(chainKey: string): { messageKey: Uint8Array; nextChainKey: string } {
    const chainBytes = decodeBase64(chainKey)
    const hash = nacl.hash(chainBytes)
    const messageKey = hash.slice(0, 32)
    const nextChain = hash.slice(32, 64)
    return {
      messageKey,
      nextChainKey: encodeBase64(nextChain),
    }
  }

  encryptWithRatchet(message: string, remotePublicKey: string): string {
    if (!this.keyPair) throw new Error('Keys not loaded')
    if (!this.ratchetState) {
      this.initRatchet(remotePublicKey)
    }

    const state = this.ratchetState!
    const { messageKey, nextChainKey } = this.deriveMessageKey(state.chainKey)

    const messageBytes = decodeUTF8(message)
    const nonce = nacl.randomBytes(nacl.box.nonceLength)

    const encrypted = nacl.secretbox(messageBytes, nonce, messageKey)

    state.chainKey = nextChainKey
    state.messageCount++
    localStorage.setItem(RATCHET_STORAGE_KEY, JSON.stringify(state))

    const hybrid: HybridCiphertext = {
      version: 1,
      kemCiphertext: state.ratchetKeyPublic,
      nonce: encodeBase64(nonce),
      ciphertext: encodeBase64(encrypted),
      senderPublicKey: this.keyPair.publicKey,
    }

    return encodeBase64(new TextEncoder().encode(JSON.stringify(hybrid)))
  }

  decryptWithRatchet(encryptedData: string, senderPublicKey: string): string {
    if (!this.keyPair) throw new Error('Keys not loaded')

    const hybrid: HybridCiphertext = JSON.parse(new TextDecoder().decode(decodeBase64(encryptedData)))

    const senderBytes = decodeBase64(senderPublicKey)
    const selfSecretBytes = decodeBase64(this.keyPair.secretKey)

    const sharedSecret = nacl.box.before(senderBytes, selfSecretBytes)
    const chainKey = encodeBase64(new Uint8Array([...sharedSecret, ...decodeBase64(this.keyPair.publicKey)]).slice(0, 32))

    const { messageKey } = this.deriveMessageKey(chainKey)

    const nonce = decodeBase64(hybrid.nonce)
    const ciphertext = decodeBase64(hybrid.ciphertext)

    const decrypted = nacl.secretbox.open(ciphertext, nonce, messageKey)
    if (!decrypted) throw new Error('Decryption failed')

    return encodeUTF8(decrypted)
  }

  encrypt(message: string, recipientPublicKey: string): string {
    return this.encryptWithRatchet(message, recipientPublicKey)
  }

  decrypt(encryptedData: string, senderPublicKey: string): string {
    return this.decryptWithRatchet(encryptedData, senderPublicKey)
  }

  getRatchetState(): RatchetState | null {
    return this.ratchetState
  }

  hasRatchet(): boolean {
    return this.ratchetState !== null
  }

  getMessageCount(): number {
    return this.ratchetState?.messageCount ?? 0
  }
}

export const pqEncryptionManager = new PQEncryptionManager()
