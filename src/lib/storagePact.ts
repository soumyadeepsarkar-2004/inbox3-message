export interface StoragePact {
  id: string
  peerA: string
  peerB: string
  peerAStorage: StoredMessage[]
  peerBStorage: StoredMessage[]
  createdAt: number
  updatedAt: number
  status: 'active' | 'expired' | 'broken'
  expiresAt: number
}

export interface StoredMessage {
  id: string
  encryptedPayload: string
  storedBy: string
  storedAt: number
  sizeBytes: number
}

export interface StorageOffer {
  peerId: string
  availableSpace: number
  uptime: number
  reliability: number
}

const PACTS_KEY = 'inbox3_storage_pacts'
const OFFERS_KEY = 'inbox3_storage_offers'

export class StoragePactManager {
  private pacts: Map<string, StoragePact> = new Map()
  private offers: Map<string, StorageOffer> = new Map()

  constructor() {
    this.loadFromStorage()
  }

  proposePact(peerA: string, peerB: string, durationMs: number = 2592000000): StoragePact {
    const pact: StoragePact = {
      id: `pact_${Date.now()}_${crypto.randomUUID().slice(0, 6)}`,
      peerA,
      peerB,
      peerAStorage: [],
      peerBStorage: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: 'active',
      expiresAt: Date.now() + durationMs,
    }
    this.pacts.set(pact.id, pact)
    this.savePacts()
    return pact
  }

  storeMessage(pactId: string, storedBy: string, encryptedPayload: string): StoredMessage | null {
    const pact = this.pacts.get(pactId)
    if (!pact || pact.status !== 'active') return null

    const msg: StoredMessage = {
      id: `stored_${Date.now()}_${crypto.randomUUID().slice(0, 6)}`,
      encryptedPayload,
      storedBy,
      storedAt: Date.now(),
      sizeBytes: new TextEncoder().encode(encryptedPayload).length || encryptedPayload.length,
    }

    if (storedBy === pact.peerA) {
      pact.peerAStorage.push(msg)
    } else if (storedBy === pact.peerB) {
      pact.peerBStorage.push(msg)
    } else {
      return null
    }

    pact.updatedAt = Date.now()
    this.savePacts()
    return msg
  }

  getStoredMessages(pactId: string, peerId: string): StoredMessage[] {
    const pact = this.pacts.get(pactId)
    if (!pact) return []
    if (peerId === pact.peerA) return pact.peerAStorage
    if (peerId === pact.peerB) return pact.peerBStorage
    return []
  }

  breakPact(pactId: string): boolean {
    const pact = this.pacts.get(pactId)
    if (!pact) return false
    pact.status = 'broken'
    pact.updatedAt = Date.now()
    this.savePacts()
    return true
  }

  registerOffer(offer: StorageOffer): void {
    this.offers.set(offer.peerId, offer)
    localStorage.setItem(OFFERS_KEY, JSON.stringify(Array.from(this.offers.entries())))
  }

  getOffers(): StorageOffer[] {
    return Array.from(this.offers.values())
  }

  getActivePacts(): StoragePact[] {
    const now = Date.now()
    return Array.from(this.pacts.values()).filter(p => {
      if (p.status !== 'active') return false
      if (now > p.expiresAt) {
        p.status = 'expired'
        this.savePacts()
        return false
      }
      return true
    })
  }

  getStats(): { totalPacts: number; activePacts: number; totalStoredBytes: number } {
    const all = Array.from(this.pacts.values())
    const active = all.filter(p => p.status === 'active')
    const totalBytes = active.reduce((sum, p) => {
      const aBytes = p.peerAStorage.reduce((s, m) => s + m.sizeBytes, 0)
      const bBytes = p.peerBStorage.reduce((s, m) => s + m.sizeBytes, 0)
      return sum + aBytes + bBytes
    }, 0)
    return {
      totalPacts: all.length,
      activePacts: active.length,
      totalStoredBytes: totalBytes,
    }
  }

  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(PACTS_KEY)
      if (raw) {
        const entries: [string, StoragePact][] = JSON.parse(raw)
        this.pacts = new Map(entries)
      }
    } catch { /* corrupted data */ }
  }

  private savePacts(): void {
    localStorage.setItem(PACTS_KEY, JSON.stringify(Array.from(this.pacts.entries())))
  }
}

export const storagePactManager = new StoragePactManager()
