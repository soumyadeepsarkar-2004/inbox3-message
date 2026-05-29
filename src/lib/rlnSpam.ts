import nacl from 'tweetnacl'
import { encodeBase64, decodeUTF8 } from 'tweetnacl-util'

export interface RLNNullifier {
  id: string
  value: string
  createdAt: number
  epoch: number
  senderAddress: string
}

export interface SpamScore {
  address: string
  score: number
  lastMessage: number
  flaggedAt: number | null
}

const NULLIFIER_KEY = 'inbox3_rln_nullifiers'
const SPAM_SCORES_KEY = 'inbox3_spam_scores'

const MAX_MESSAGES_PER_EPOCH = 10
const EPOCH_DURATION_MS = 3600000
const SPAM_THRESHOLD = 0.7

export class RLNSpamPrevention {
  private nullifiers: RLNNullifier[] = []
  private spamScores: Map<string, SpamScore> = new Map()

  constructor() {
    this.loadFromStorage()
  }

  private getCurrentEpoch(): number {
    return Math.floor(Date.now() / EPOCH_DURATION_MS)
  }

  generateNullifier(senderAddress: string, messageContent: string): RLNNullifier {
    const epoch = this.getCurrentEpoch()
    const data = `${senderAddress}:${messageContent}:${epoch}`
    const hash = nacl.hash(decodeUTF8(data))
    const nullifier: RLNNullifier = {
      id: `rln_${Date.now()}_${crypto.randomUUID().slice(0, 6)}`,
      value: encodeBase64(hash.slice(0, 16)),
      createdAt: Date.now(),
      epoch,
      senderAddress,
    }
    this.nullifiers.push(nullifier)
    this.cleanOldNullifiers()
    this.saveNullifiers()
    return nullifier
  }

  isDuplicate(nullifierValue: string): boolean {
    return this.nullifiers.some(n => n.value === nullifierValue)
  }

  canSend(senderAddress: string): boolean {
    const epoch = this.getCurrentEpoch()
    const epochMessages = this.nullifiers.filter(
      n => n.epoch === epoch && this.getAddressFromNullifier(n) === senderAddress
    )
    return epochMessages.length < MAX_MESSAGES_PER_EPOCH
  }

  getRemainingCapacity(senderAddress: string): number {
    const epoch = this.getCurrentEpoch()
    const count = this.nullifiers.filter(
      n => n.epoch === epoch && this.getAddressFromNullifier(n) === senderAddress
    ).length
    return Math.max(0, MAX_MESSAGES_PER_EPOCH - count)
  }

  private getAddressFromNullifier(nullifier: RLNNullifier): string {
    return nullifier.senderAddress || 'unknown'
  }

  updateSpamScore(address: string, isSpam: boolean): void {
    const current = this.spamScores.get(address) || {
      address,
      score: 0,
      lastMessage: 0,
      flaggedAt: null,
    }
    current.score = isSpam
      ? Math.min(1, current.score + 0.2)
      : Math.max(0, current.score - 0.05)
    current.lastMessage = Date.now()
    if (current.score >= SPAM_THRESHOLD) {
      current.flaggedAt = Date.now()
    } else {
      current.flaggedAt = null
    }
    this.spamScores.set(address, current)
    this.saveScores()
  }

  isFlagged(address: string): boolean {
    const score = this.spamScores.get(address)
    return score ? (score.score >= SPAM_THRESHOLD) : false
  }

  getSpamScore(address: string): number {
    return this.spamScores.get(address)?.score ?? 0
  }

  private cleanOldNullifiers(): void {
    const cutoff = Date.now() - EPOCH_DURATION_MS * 2
    this.nullifiers = this.nullifiers.filter(n => n.createdAt > cutoff)
  }

  getStats(): { totalNullifiers: number; flaggedAddresses: number; avgScore: number } {
    const scores = Array.from(this.spamScores.values())
    return {
      totalNullifiers: this.nullifiers.length,
      flaggedAddresses: scores.filter(s => s.flaggedAt !== null).length,
      avgScore: scores.length > 0
        ? scores.reduce((s, sc) => s + sc.score, 0) / scores.length
        : 0,
    }
  }

  private loadFromStorage(): void {
    try {
      const nRaw = localStorage.getItem(NULLIFIER_KEY)
      if (nRaw) this.nullifiers = JSON.parse(nRaw)
    } catch { /* corrupted data */ }
    try {
      const sRaw = localStorage.getItem(SPAM_SCORES_KEY)
      if (sRaw) {
        const entries: [string, SpamScore][] = JSON.parse(sRaw)
        this.spamScores = new Map(entries)
      }
    } catch { /* corrupted data */ }
  }

  private saveNullifiers(): void {
    localStorage.setItem(NULLIFIER_KEY, JSON.stringify(this.nullifiers))
  }

  private saveScores(): void {
    localStorage.setItem(SPAM_SCORES_KEY, JSON.stringify(Array.from(this.spamScores.entries())))
  }
}

export const rlnSpamPrevention = new RLNSpamPrevention()
