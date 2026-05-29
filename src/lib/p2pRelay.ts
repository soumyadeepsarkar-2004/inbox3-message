import nacl from 'tweetnacl'
import { encodeBase64, decodeBase64, decodeUTF8 } from 'tweetnacl-util'

export interface PeerNode {
  id: string
  address: string
  publicKey: string
  lastSeen: number
  latency: number
  relayScore: number
}

export interface RelayMessage {
  id: string
  from: string
  to: string
  ciphertext: string
  nonce: string
  hops: number
  ttl: number
  timestamp: number
}

const PEERS_KEY = 'inbox3_p2p_peers'
const RELAY_QUEUE_KEY = 'inbox3_relay_queue'

export class P2PRelay {
  private peers: Map<string, PeerNode> = new Map()
  private messageQueue: RelayMessage[] = []

  constructor() {
    this.loadFromStorage()
  }

  registerPeer(peer: Omit<PeerNode, 'lastSeen' | 'latency' | 'relayScore'>): PeerNode {
    const full: PeerNode = {
      ...peer,
      lastSeen: Date.now(),
      latency: Math.floor(Math.random() * 200) + 10,
      relayScore: 100,
    }
    this.peers.set(peer.id, full)
    this.savePeers()
    return full
  }

  unregisterPeer(peerId: string): void {
    this.peers.delete(peerId)
    this.savePeers()
  }

  getPeers(): PeerNode[] {
    return Array.from(this.peers.values())
      .sort((a, b) => b.relayScore - a.relayScore)
  }

  findPeerByAddress(address: string): PeerNode | undefined {
    return Array.from(this.peers.values()).find(p => p.address === address)
  }

  async encryptForRelay(message: string, recipientPublicKey: string): Promise<{ ciphertext: string; nonce: string; senderPublicKey: string }> {
    const nonce = nacl.randomBytes(nacl.box.nonceLength)
    const messageBytes = decodeUTF8(message)
    const recipientBytes = decodeBase64(recipientPublicKey)
    const ephemeralKey = nacl.box.keyPair()
    const encrypted = nacl.box(messageBytes, nonce, recipientBytes, ephemeralKey.secretKey)
    return {
      ciphertext: encodeBase64(encrypted),
      nonce: encodeBase64(nonce),
      senderPublicKey: encodeBase64(ephemeralKey.publicKey),
    }
  }

  createRelayMessage(from: string, to: string, ciphertext: string, nonce: string): RelayMessage {
    const msg: RelayMessage = {
      id: `relay_${Date.now()}_${crypto.randomUUID().slice(0, 6)}`,
      from,
      to,
      ciphertext,
      nonce,
      hops: 0,
      ttl: 5,
      timestamp: Date.now(),
    }
    return msg
  }

  queueMessage(msg: RelayMessage): void {
    this.messageQueue.push(msg)
    localStorage.setItem(RELAY_QUEUE_KEY, JSON.stringify(this.messageQueue))
  }

  relayMessage(msg: RelayMessage): RelayMessage | null {
    if (msg.ttl <= 0) return null
    const nextPeer = this.getPeers().find(p => p.address !== msg.from)
    if (!nextPeer) return null
    msg.hops++
    msg.ttl--
    return msg
  }

  getQueue(): RelayMessage[] {
    const raw = localStorage.getItem(RELAY_QUEUE_KEY)
    return raw ? JSON.parse(raw) : []
  }

  clearQueue(): void {
    this.messageQueue = []
    localStorage.removeItem(RELAY_QUEUE_KEY)
  }

  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(PEERS_KEY)
      if (raw) {
        const entries: [string, PeerNode][] = JSON.parse(raw)
        this.peers = new Map(entries)
      }
    } catch { /* corrupted data */ }
  }

  private savePeers(): void {
    localStorage.setItem(PEERS_KEY, JSON.stringify(Array.from(this.peers.entries())))
  }

  getStats(): { peerCount: number; queueLength: number; avgLatency: number } {
    const peers = this.getPeers()
    return {
      peerCount: peers.length,
      queueLength: this.getQueue().length,
      avgLatency: peers.length > 0
        ? peers.reduce((s, p) => s + p.latency, 0) / peers.length
        : 0,
    }
  }
}

export const p2pRelay = new P2PRelay()
