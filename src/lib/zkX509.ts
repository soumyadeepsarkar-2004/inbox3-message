export interface X509Certificate {
  subject: string
  issuer: string
  serialNumber: string
  notBefore: string
  notAfter: string
  publicKey: string
  signature: string
  isCA: boolean
}

export interface ZKProof {
  id: string
  certificateHash: string
  proof: string
  revealedAttributes: string[]
  createdAt: number
  expiresAt: number
}

const CERT_KEY = 'inbox3_x509_certificates'
const PROOF_KEY = 'inbox3_zk_x509_proofs'

export class ZKX509Verifier {
  private certificates: X509Certificate[] = []
  private proofs: ZKProof[] = []

  constructor() {
    this.loadFromStorage()
  }

  importCertificate(cert: X509Certificate): void {
    this.certificates.push(cert)
    localStorage.setItem(CERT_KEY, JSON.stringify(this.certificates))
  }

  getCertificates(): X509Certificate[] {
    return [...this.certificates]
  }

  async createProof(certificateHash: string, revealAttributes: string[]): Promise<ZKProof> {
    const proof: ZKProof = {
      id: `zkx509_${Date.now()}_${crypto.randomUUID().slice(0, 6)}`,
      certificateHash,
      proof: `zk_proof_${certificateHash.slice(0, 8)}_${Date.now()}`,
      revealedAttributes: revealAttributes,
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000,
    }
    this.proofs.push(proof)
    this.saveProofs()
    return proof
  }

  verifyProof(proofId: string): boolean {
    const proof = this.proofs.find(p => p.id === proofId)
    if (!proof) return false
    if (Date.now() > proof.expiresAt) return false
    return proof.proof.startsWith('zk_proof_')
  }

  getProofs(): ZKProof[] {
    return [...this.proofs]
  }

  private loadFromStorage(): void {
    try {
      const cRaw = localStorage.getItem(CERT_KEY)
      if (cRaw) this.certificates = JSON.parse(cRaw)
    } catch { /* corrupted data */ }
    try {
      const pRaw = localStorage.getItem(PROOF_KEY)
      if (pRaw) this.proofs = JSON.parse(pRaw)
    } catch { /* corrupted data */ }
  }

  private saveProofs(): void {
    localStorage.setItem(PROOF_KEY, JSON.stringify(this.proofs))
  }
}

export const zkX509Verifier = new ZKX509Verifier()
