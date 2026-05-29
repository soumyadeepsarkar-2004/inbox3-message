import nacl from 'tweetnacl'
import { encodeBase64, decodeBase64, decodeUTF8, encodeUTF8 } from 'tweetnacl-util'

export interface OnionLayer {
  recipient: string
  ciphertext: string
  nonce: string
  senderPublicKey: string
}

export interface OnionMessage {
  id: string
  layers: OnionLayer[]
  hopCount: number
  createdAt: number
}

const ONION_KEY = 'inbox3_onion_routes'

export class OnionRouter {
  private routes: Map<string, string[]> = new Map()

  constructor() {
    this.loadFromStorage()
  }

  addRoute(address: string, hops: string[]): void {
    this.routes.set(address, hops)
    localStorage.setItem(ONION_KEY, JSON.stringify(Array.from(this.routes.entries())))
  }

  getRoute(address: string): string[] {
    return this.routes.get(address) || []
  }

  async encryptLayer(message: string, hopPublicKey: string): Promise<{ ciphertext: string; nonce: string; senderPublicKey: string }> {
    const nonce = nacl.randomBytes(nacl.box.nonceLength)
    const messageBytes = decodeUTF8(message)
    const hopKeyBytes = decodeBase64(hopPublicKey)
    const ephemeralKey = nacl.box.keyPair()
    const encrypted = nacl.box(messageBytes, nonce, hopKeyBytes, ephemeralKey.secretKey)
    return {
      ciphertext: encodeBase64(encrypted),
      nonce: encodeBase64(nonce),
      senderPublicKey: encodeBase64(ephemeralKey.publicKey),
    }
  }

  async buildOnion(message: string, hops: string[], finalRecipient: string): Promise<OnionMessage> {
    let currentPayload = JSON.stringify({ message, finalRecipient })
    const layers: OnionLayer[] = []

    for (let i = hops.length - 1; i >= 0; i--) {
      const hop = hops[i]
      const { ciphertext, nonce, senderPublicKey } = await this.encryptLayer(currentPayload, hop)
      layers.unshift({ recipient: hop, ciphertext, nonce, senderPublicKey })
      currentPayload = JSON.stringify({ nextHop: hop, layer: ciphertext })
    }

    return {
      id: `onion_${Date.now()}_${crypto.randomUUID().slice(0, 6)}`,
      layers,
      hopCount: hops.length,
      createdAt: Date.now(),
    }
  }

  peelLayer(encryptedData: string, secretKey: string, senderPublicKey: string): { payload: string; nextHop?: string } | null {
    try {
      const data = decodeBase64(encryptedData)
      const nonce = data.slice(0, nacl.box.nonceLength)
      const ciphertext = data.slice(nacl.box.nonceLength)
      const secretBytes = decodeBase64(secretKey)
      const senderBytes = decodeBase64(senderPublicKey)

      const decrypted = nacl.box.open(ciphertext, nonce, senderBytes, secretBytes)
      if (!decrypted) return null

      const payload = encodeUTF8(decrypted)
      const parsed = JSON.parse(payload)
      return { payload, nextHop: parsed.nextHop }
    } catch {
      return null
    }
  }

  getStats(): { routeCount: number; avgHopCount: number } {
    const routes = Array.from(this.routes.values())
    return {
      routeCount: this.routes.size,
      avgHopCount: routes.length > 0
        ? routes.reduce((s, r) => s + r.length, 0) / routes.length
        : 0,
    }
  }

  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(ONION_KEY)
      if (raw) {
        const entries: [string, string[]][] = JSON.parse(raw)
        this.routes = new Map(entries)
      }
    } catch { /* corrupted data */ }
  }
}

export const onionRouter = new OnionRouter()
