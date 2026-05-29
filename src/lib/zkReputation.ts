export type ReputationClaimType =
  | 'github_stars'
  | 'wallet_age'
  | 'aptos_balance'
  | 'nft_holder'
  | 'kyc_verified'
  | 'over_18'

export interface ReputationClaim {
  id: string
  type: ReputationClaimType
  value: string
  proof: string
  issuer: string
  issuedAt: number
  expiresAt: number | null
}

export interface ReputationGate {
  claimType: ReputationClaimType
  minValue: string
  description: string
}

const CLAIMS_KEY = 'inbox3_zk_claims'

export class ZKReputationPassport {
  private claims: ReputationClaim[] = []

  constructor() {
    this.loadFromStorage()
  }

  issueClaim(type: ReputationClaimType, value: string, issuer: string, expiresAt: number | null = null): ReputationClaim {
    const issuedAt = Date.now()
    const claimData = `${type}:${value}:${issuer}:${issuedAt}`
    const proof = Array.from(new TextEncoder().encode(claimData))
      .map(b => b.toString(16).padStart(2, '0')).join('')

    const claim: ReputationClaim = {
      id: `zk_${issuedAt}_${crypto.randomUUID().slice(0, 6)}`,
      type,
      value,
      proof,
      issuer,
      issuedAt,
      expiresAt,
    }

    this.claims.push(claim)
    this.saveToStorage()
    return claim
  }

  verifyClaim(claim: ReputationClaim): boolean {
    if (claim.expiresAt && Date.now() > claim.expiresAt) return false
    try {
      const claimData = `${claim.type}:${claim.value}:${claim.issuer}:${claim.issuedAt}`
      const expectedProof = Array.from(new TextEncoder().encode(claimData))
        .map(b => b.toString(16).padStart(2, '0')).join('')
      return claim.proof === expectedProof
    } catch {
      return false
    }
  }

  getClaimsByType(type: ReputationClaimType): ReputationClaim[] {
    return this.claims.filter(c => c.type === type)
  }

  meetsGate(gate: ReputationGate): boolean {
    const matching = this.getClaimsByType(gate.claimType)
    if (matching.length === 0) return false
    const valid = matching.filter(c => this.verifyClaim(c))
    if (valid.length === 0) return false
    return parseFloat(valid[0].value) >= parseFloat(gate.minValue)
  }

  getAllClaims(): ReputationClaim[] {
    return [...this.claims]
  }

  clearClaims(): void {
    this.claims = []
    localStorage.removeItem(CLAIMS_KEY)
  }

  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(CLAIMS_KEY)
      if (raw) this.claims = JSON.parse(raw)
    } catch { /* corrupted data */ }
  }

  private saveToStorage(): void {
    localStorage.setItem(CLAIMS_KEY, JSON.stringify(this.claims))
  }
}

export const zkReputationPassport = new ZKReputationPassport()

export const DEFAULT_REPUTATION_GATES: ReputationGate[] = [
  { claimType: 'github_stars', minValue: '10', description: '10+ GitHub stars' },
  { claimType: 'wallet_age', minValue: '30', description: 'Wallet at least 30 days old' },
  { claimType: 'over_18', minValue: '1', description: 'Verified over 18' },
  { claimType: 'kyc_verified', minValue: '1', description: 'KYC verified' },
]
