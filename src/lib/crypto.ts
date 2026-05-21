import nacl from 'tweetnacl'
import { encodeBase64, decodeBase64, encodeUTF8, decodeUTF8 } from 'tweetnacl-util'

export class EncryptionManager {
  private keyPair: nacl.BoxKeyPair | null = null

  generateKeys(): { publicKey: string; secretKey: string } {
    this.keyPair = nacl.box.keyPair()
    const publicKey = encodeBase64(this.keyPair.publicKey)
    const secretKey = encodeBase64(this.keyPair.secretKey)
    this.persistKeys(publicKey, secretKey)
    return { publicKey, secretKey }
  }

  loadKeys(): boolean {
    const publicKey = localStorage.getItem('inbox3_public_key')
    const secretKey = localStorage.getItem('inbox3_secret_key')
    if (publicKey && secretKey) {
      this.keyPair = {
        publicKey: decodeBase64(publicKey),
        secretKey: decodeBase64(secretKey)
      }
      return true
    }
    return false
  }

  encrypt(message: string, recipientPublicKey: string): string {
    if (!this.keyPair) throw new Error('Keys not loaded')
    const messageBytes = decodeUTF8(message)
    const recipientBytes = decodeBase64(recipientPublicKey)
    const nonce = nacl.randomBytes(nacl.box.nonceLength)
    const encrypted = nacl.box(messageBytes, nonce, recipientBytes, this.keyPair.secretKey)
    return encodeBase64(new Uint8Array([...nonce, ...encrypted]))
  }

  decrypt(encryptedData: string, senderPublicKey: string): string {
    if (!this.keyPair) throw new Error('Keys not loaded')
    const data = decodeBase64(encryptedData)
    const senderBytes = decodeBase64(senderPublicKey)
    const nonce = data.slice(0, nacl.box.nonceLength)
    const message = data.slice(nacl.box.nonceLength)
    const decrypted = nacl.box.open(message, nonce, senderBytes, this.keyPair.secretKey)
    if (!decrypted) throw new Error('Decryption failed')
    return encodeUTF8(decrypted)
  }

  private persistKeys(publicKey: string, secretKey: string): void {
    localStorage.setItem('inbox3_public_key', publicKey)
    localStorage.setItem('inbox3_secret_key', secretKey)
  }

  clearKeys(): void {
    this.keyPair = null
    localStorage.removeItem('inbox3_public_key')
    localStorage.removeItem('inbox3_secret_key')
  }

  getPublicKey(): string | null {
    return this.keyPair ? encodeBase64(this.keyPair.publicKey) : null
  }
}

export const encryptionManager = new EncryptionManager()