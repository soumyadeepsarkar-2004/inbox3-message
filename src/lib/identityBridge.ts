export type IdentityProtocol = 'farcaster' | 'lens' | 'ens' | 'aptos'

export interface BridgedIdentity {
  protocol: IdentityProtocol
  id: string
  displayName: string
  avatar: string | null
  address: string
  verifiedAt: number
}

export interface IdentityProfile {
  localAddress: string
  bridgedIdentities: BridgedIdentity[]
}

const STORAGE_KEY = 'inbox3_bridged_identities'

export class IdentityBridge {
  private profiles: Map<string, IdentityProfile> = new Map()

  constructor() {
    this.loadFromStorage()
  }

  async bridgeFarcaster(fid: string, address: string): Promise<BridgedIdentity> {
    const identity: BridgedIdentity = {
      protocol: 'farcaster',
      id: fid,
      displayName: `Farcaster:${fid.slice(0, 6)}`,
      avatar: null,
      address,
      verifiedAt: Date.now(),
    }
    this.addIdentity(address, identity)
    return identity
  }

  async bridgeLens(profileId: string, address: string): Promise<BridgedIdentity> {
    const identity: BridgedIdentity = {
      protocol: 'lens',
      id: profileId,
      displayName: `Lens:${profileId.slice(0, 6)}`,
      avatar: null,
      address,
      verifiedAt: Date.now(),
    }
    this.addIdentity(address, identity)
    return identity
  }

  async resolveFarcaster(address: string): Promise<string | null> {
    const profile = this.profiles.get(address)
    if (!profile) return null
    const fc = profile.bridgedIdentities.find(i => i.protocol === 'farcaster')
    return fc?.id || null
  }

  async resolveLens(address: string): Promise<string | null> {
    const profile = this.profiles.get(address)
    if (!profile) return null
    const lens = profile.bridgedIdentities.find(i => i.protocol === 'lens')
    return lens?.id || null
  }

  getIdentities(address: string): BridgedIdentity[] {
    return this.profiles.get(address)?.bridgedIdentities || []
  }

  getAllProfiles(): IdentityProfile[] {
    return Array.from(this.profiles.values())
  }

  private addIdentity(address: string, identity: BridgedIdentity): void {
    const existing = this.profiles.get(address) || { localAddress: address, bridgedIdentities: [] }
    const exists = existing.bridgedIdentities.find(i => i.protocol === identity.protocol && i.id === identity.id)
    if (!exists) {
      existing.bridgedIdentities.push(identity)
      this.profiles.set(address, existing)
      this.saveToStorage()
    }
  }

  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const entries: [string, IdentityProfile][] = JSON.parse(raw)
        this.profiles = new Map(entries)
      }
    } catch { /* corrupted data */ }
  }

  private saveToStorage(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(this.profiles.entries())))
  }
}

export const identityBridge = new IdentityBridge()
