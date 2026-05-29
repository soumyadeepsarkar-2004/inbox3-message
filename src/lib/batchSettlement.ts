export interface Microtip {
  id: string
  from: string
  to: string
  amount: string
  currency: string
  messageId: string
  timestamp: number
}

export interface SettlementBatch {
  id: string
  microtips: Microtip[]
  totalAmount: string
  currency: string
  status: 'pending' | 'settled' | 'failed'
  transactionHash: string | null
  createdAt: number
  settledAt: number | null
}

const BATCH_KEY = 'inbox3_settlement_batches'
const MICROTIP_KEY = 'inbox3_microtips'

export class BatchSettlement {
  private batches: SettlementBatch[] = []
  private pendingMicrotips: Microtip[] = []

  constructor() {
    this.loadFromStorage()
  }

  addMicrotip(from: string, to: string, amount: string, currency: string, messageId: string): Microtip {
    const tip: Microtip = {
      id: `tip_${Date.now()}_${crypto.randomUUID().slice(0, 6)}`,
      from,
      to,
      amount,
      currency,
      messageId,
      timestamp: Date.now(),
    }
    this.pendingMicrotips.push(tip)
    localStorage.setItem(MICROTIP_KEY, JSON.stringify(this.pendingMicrotips))
    return tip
  }

  createBatch(): SettlementBatch | null {
    if (this.pendingMicrotips.length === 0) return null
    const total = this.pendingMicrotips.reduce((sum, t) => sum + parseFloat(t.amount), 0)
    const batch: SettlementBatch = {
      id: `batch_${Date.now()}`,
      microtips: [...this.pendingMicrotips],
      totalAmount: total.toFixed(6),
      currency: this.pendingMicrotips[0].currency,
      status: 'pending',
      transactionHash: null,
      createdAt: Date.now(),
      settledAt: null,
    }
    this.pendingMicrotips = []
    localStorage.setItem(MICROTIP_KEY, JSON.stringify([]))
    this.batches.push(batch)
    this.saveBatches()
    return batch
  }

  settleBatch(batchId: string): SettlementBatch | null {
    const batch = this.batches.find(b => b.id === batchId)
    if (!batch || batch.status !== 'pending') return null
    batch.status = 'settled'
    batch.settledAt = Date.now()
    batch.transactionHash = `0x${Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, '0')).join('')}`
    this.saveBatches()
    return batch
  }

  getPendingMicrotips(): Microtip[] {
    return [...this.pendingMicrotips]
  }

  getBatches(): SettlementBatch[] {
    return [...this.batches]
  }

  getPendingBatches(): SettlementBatch[] {
    return this.batches.filter(b => b.status === 'pending')
  }

  getStats(): { pendingTips: number; totalBatches: number; settledBatches: number; totalSettled: string } {
    const settled = this.batches.filter(b => b.status === 'settled')
    const totalSettled = settled.reduce((sum, b) => sum + parseFloat(b.totalAmount), 0)
    return {
      pendingTips: this.pendingMicrotips.length,
      totalBatches: this.batches.length,
      settledBatches: settled.length,
      totalSettled: totalSettled.toFixed(6),
    }
  }

  private loadFromStorage(): void {
    try {
      const bRaw = localStorage.getItem(BATCH_KEY)
      if (bRaw) this.batches = JSON.parse(bRaw)
    } catch { /* corrupted data */ }
    try {
      const mRaw = localStorage.getItem(MICROTIP_KEY)
      if (mRaw) this.pendingMicrotips = JSON.parse(mRaw)
    } catch { /* corrupted data */ }
  }

  private saveBatches(): void {
    localStorage.setItem(BATCH_KEY, JSON.stringify(this.batches))
  }
}

export const batchSettlement = new BatchSettlement()
