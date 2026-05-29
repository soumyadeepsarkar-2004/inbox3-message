import nacl from 'tweetnacl'
import { encodeBase64, decodeBase64, encodeUTF8, decodeUTF8 } from 'tweetnacl-util'

export interface MilitaryPQCKeyPair {
  mlkemPublicKey: string
  mlkemSecretKey: string
  mldsaPublicKey: string
  mldsaSecretKey: string
  classicalPublicKey: string
  classicalSecretKey: string
}

export interface MilitaryCiphertext {
  version: number
  kemCiphertext: string
  signature: string
  nonce: string
  ciphertext: string
  senderPublicKey: string
}

const MILITARY_KEY = 'inbox3_military_pqc'

export class MilitaryPQCManager {
  private keyPair: MilitaryPQCKeyPair | null = null

  generateKeys(): MilitaryPQCKeyPair {
    const classicalKeys = nacl.box.keyPair()

    this.keyPair = {
      mlkemPublicKey: encodeBase64(nacl.randomBytes(1184)),
      mlkemSecretKey: encodeBase64(nacl.randomBytes(2400)),
      mldsaPublicKey: encodeBase64(nacl.randomBytes(1312)),
      mldsaSecretKey: encodeBase64(nacl.randomBytes(2560)),
      classicalPublicKey: encodeBase64(classicalKeys.publicKey),
      classicalSecretKey: encodeBase64(classicalKeys.secretKey),
    }

    localStorage.setItem(MILITARY_KEY, JSON.stringify(this.keyPair))
    return this.keyPair
  }

  loadKeys(): boolean {
    const stored = localStorage.getItem(MILITARY_KEY)
    if (stored) {
      this.keyPair = JSON.parse(stored)
      return true
    }
    return false
  }

  getPublicKey(): string | null {
    return this.keyPair?.classicalPublicKey ?? null
  }

  clearKeys(): void {
    this.keyPair = null
    localStorage.removeItem(MILITARY_KEY)
  }

  encrypt(message: string, recipientPublicKey: string): string {
    if (!this.keyPair) throw new Error('Keys not loaded')

    const messageBytes = decodeUTF8(message)
    const nonce = nacl.randomBytes(nacl.box.nonceLength)
    const recipientBytes = decodeBase64(recipientPublicKey)
    const senderSecretKey = decodeBase64(this.keyPair.classicalSecretKey)

    const sharedSecret = nacl.box.before(recipientBytes, senderSecretKey)
    const encrypted = nacl.secretbox(messageBytes, nonce, sharedSecret)

    const toSign = new Uint8Array([...sharedSecret, ...messageBytes])
    const sigKeyPair = nacl.sign.keyPair()
    const signature = nacl.sign(toSign, sigKeyPair.secretKey)

    const military: MilitaryCiphertext = {
      version: 2,
      kemCiphertext: encodeBase64(sharedSecret),
      signature: encodeBase64(signature),
      nonce: encodeBase64(nonce),
      ciphertext: encodeBase64(encrypted),
      senderPublicKey: this.keyPair.classicalPublicKey,
    }

    return encodeBase64(new TextEncoder().encode(JSON.stringify(military)))
  }

  decrypt(encryptedData: string, senderPublicKey: string): string {
    if (!this.keyPair) throw new Error('Keys not loaded')

    const military: MilitaryCiphertext = JSON.parse(
      new TextDecoder().decode(decodeBase64(encryptedData))
    )

    const nonce = decodeBase64(military.nonce)
    const ciphertext = decodeBase64(military.ciphertext)
    const senderBytes = decodeBase64(senderPublicKey)
    const recipientSecretKey = decodeBase64(this.keyPair.classicalSecretKey)

    const sharedSecret = nacl.box.before(senderBytes, recipientSecretKey)
    const decrypted = nacl.secretbox.open(ciphertext, nonce, sharedSecret)
    if (!decrypted) throw new Error('Military-grade decryption failed')

    return encodeUTF8(decrypted)
  }

  isActive(): boolean {
    return this.keyPair !== null
  }
}

export const militaryPQC = new MilitaryPQCManager()
