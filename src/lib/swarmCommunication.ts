export type NegotiationRole = 'proposer' | 'responder' | 'observer'
export type NegotiationStatus = 'pending' | 'active' | 'accepted' | 'rejected' | 'completed'

export interface SwarmAgent {
  id: string
  name: string
  capabilities: string[]
  address: string
  publicKey: string
}

export interface NegotiationProposal {
  id: string
  proposer: string
  title: string
  description: string
  requiredCapabilities: string[]
  invitees: string[]
  status: NegotiationStatus
  createdAt: number
  expiresAt: number
  responses: NegotiationResponse[]
}

export interface NegotiationResponse {
  agentId: string
  decision: 'accept' | 'reject' | 'counter'
  message: string
  timestamp: number
}

export interface SwarmSession {
  id: string
  proposalId: string
  agents: SwarmAgent[]
  startedAt: number
  messageCount: number
  status: 'active' | 'completed'
}

const SWARM_KEY = 'inbox3_swarm_sessions'
const NEGOTIATION_KEY = 'inbox3_negotiations'

export class SwarmCommunication {
  private sessions: Map<string, SwarmSession> = new Map()
  private negotiations: Map<string, NegotiationProposal> = new Map()

  constructor() {
    this.loadFromStorage()
  }

  createProposal(proposer: string, title: string, description: string, requiredCapabilities: string[], invitees: string[]): NegotiationProposal {
    const proposal: NegotiationProposal = {
      id: `neg_${Date.now()}_${crypto.randomUUID().slice(0, 6)}`,
      proposer,
      title,
      description,
      requiredCapabilities,
      invitees,
      status: 'pending',
      createdAt: Date.now(),
      expiresAt: Date.now() + 86400000,
      responses: [],
    }
    this.negotiations.set(proposal.id, proposal)
    this.saveNegotiations()
    return proposal
  }

  respondToProposal(proposalId: string, agentId: string, decision: 'accept' | 'reject' | 'counter', message: string): NegotiationProposal | null {
    const proposal = this.negotiations.get(proposalId)
    if (!proposal || proposal.status !== 'pending') return null
    proposal.responses.push({ agentId, decision, message, timestamp: Date.now() })
    const allResponded = proposal.invitees.every(i =>
      proposal.responses.some(r => r.agentId === i)
    )
    if (allResponded) {
      const allAccepted = proposal.responses.every(r => r.decision === 'accept')
      proposal.status = allAccepted ? 'accepted' : 'rejected'
      if (allAccepted) {
        this.createSession(proposal)
      }
    }
    this.saveNegotiations()
    return proposal
  }

  private createSession(proposal: NegotiationProposal): SwarmSession {
    const agents: SwarmAgent[] = proposal.invitees.map(id => ({
      id,
      name: `Agent-${id.slice(0, 6)}`,
      capabilities: proposal.requiredCapabilities,
      address: id,
      publicKey: '',
    }))
    const session: SwarmSession = {
      id: `swarm_${Date.now()}`,
      proposalId: proposal.id,
      agents: [{ id: proposal.proposer, name: 'Proposer', capabilities: [], address: proposal.proposer, publicKey: '' }, ...agents],
      startedAt: Date.now(),
      messageCount: 0,
      status: 'active',
    }
    this.sessions.set(session.id, session)
    this.saveSessions()
    return session
  }

  getActiveSessions(): SwarmSession[] {
    return Array.from(this.sessions.values()).filter(s => s.status === 'active')
  }

  getNegotiations(agentId: string): NegotiationProposal[] {
    return Array.from(this.negotiations.values()).filter(n =>
      n.proposer === agentId || n.invitees.includes(agentId)
    )
  }

  private loadFromStorage(): void {
    try {
      const sRaw = localStorage.getItem(SWARM_KEY)
      if (sRaw) this.sessions = new Map(JSON.parse(sRaw))
    } catch { /* corrupted data */ }
    try {
      const nRaw = localStorage.getItem(NEGOTIATION_KEY)
      if (nRaw) this.negotiations = new Map(JSON.parse(nRaw))
    } catch { /* corrupted data */ }
  }

  private saveSessions(): void {
    localStorage.setItem(SWARM_KEY, JSON.stringify(Array.from(this.sessions.entries())))
  }

  private saveNegotiations(): void {
    localStorage.setItem(NEGOTIATION_KEY, JSON.stringify(Array.from(this.negotiations.entries())))
  }
}

export const swarmCommunication = new SwarmCommunication()
