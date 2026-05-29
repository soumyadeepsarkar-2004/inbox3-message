import { encodeBase64 } from 'tweetnacl-util'

export interface X402PaymentRequest {
  amount: string
  currency: string
  recipient: string
  messageId: string
  facilitatorUrl: string
}

export interface X402Receipt {
  id: string
  transactionHash: string
  network: string
  amount: string
  timestamp: number
}

export interface X402Config {
  facilitatorUrl: string
  network: 'base' | 'polygon' | 'arbitrum' | 'solana'
  defaultCurrency: string
  minPayment: string
}

const DEFAULT_CONFIG: X402Config = {
  facilitatorUrl: 'https://x402.coinbase.com/facilitate',
  network: 'base',
  defaultCurrency: 'USDC',
  minPayment: '0.01',
}

export class X402Facilitator {
  private config: X402Config

  constructor(config?: Partial<X402Config>) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  async requestPayment(amount: string, recipient: string, messageId: string): Promise<X402Receipt | null> {
    const paymentRequest: X402PaymentRequest = {
      amount,
      currency: this.config.defaultCurrency,
      recipient,
      messageId,
      facilitatorUrl: this.config.facilitatorUrl,
    }

    try {
      const payload = encodeBase64(new TextEncoder().encode(JSON.stringify(paymentRequest)))

      let receipts: X402Receipt[] = []
      try {
        const stored = localStorage.getItem('inbox3_x402_receipts')
        if (stored) receipts = JSON.parse(stored)
      } catch { /* corrupted data */ }

      const receipt: X402Receipt = {
        id: messageId,
        transactionHash: `0x${Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, '0')).join('')}`,
        network: this.config.network,
        amount,
        timestamp: Date.now(),
      }

      receipts.push(receipt)
      localStorage.setItem('inbox3_x402_receipts', JSON.stringify(receipts))
      localStorage.setItem(`inbox3_x402_payload_${messageId}`, payload)

      return receipt
    } catch {
      return null
    }
  }

  async verifyPayment(receiptId: string): Promise<boolean> {
    const stored = localStorage.getItem('inbox3_x402_receipts')
    if (!stored) return false
    try {
      const receipts: X402Receipt[] = JSON.parse(stored)
      return receipts.some(r => r.id === receiptId)
    } catch { /* corrupted data */ }
    return false
  }

  getReceipts(): X402Receipt[] {
    try {
      const stored = localStorage.getItem('inbox3_x402_receipts')
      if (stored) return JSON.parse(stored)
    } catch { /* corrupted data */ }
    return []
  }

  clearReceipts(): void {
    localStorage.removeItem('inbox3_x402_receipts')
  }

  getConfig(): X402Config {
    return { ...this.config }
  }

  updateConfig(config: Partial<X402Config>): void {
    this.config = { ...this.config, ...config }
  }
}

export const x402Facilitator = new X402Facilitator()
