export type AgentCapability = 'text' | 'code' | 'analyze' | 'translate' | 'search' | 'negotiate' | 'infer'

export interface AMPEnvelope {
  protocol: 'amp'
  version: string
  sender: {
    id: string
    type: 'human' | 'agent'
    name?: string
  }
  recipient: {
    id: string
    type: 'human' | 'agent'
    name?: string
  }
  message: {
    id: string
    type: 'request' | 'response' | 'notification' | 'negotiate'
    timestamp: number
    ttl?: number
    payload: string
    payloadType: 'text' | 'json' | 'encrypted'
    requiresHumanApproval: boolean
  }
  signature?: string
  trustAnnotations?: string[]
}

export interface AgentProfile {
  id: string
  name: string
  description: string
  capabilities: AgentCapability[]
  endpoint: string
  publicKey: string
}

export class AMPMessenger {
  private agents: Map<string, AgentProfile> = new Map()

  registerAgent(agent: AgentProfile): void {
    this.agents.set(agent.id, agent)
    const stored = this.getStoredAgents()
    stored.set(agent.id, agent)
    localStorage.setItem('inbox3_amp_agents', JSON.stringify(Array.from(stored.entries())))
  }

  unregisterAgent(agentId: string): void {
    this.agents.delete(agentId)
    const stored = this.getStoredAgents()
    stored.delete(agentId)
    localStorage.setItem('inbox3_amp_agents', JSON.stringify(Array.from(stored.entries())))
  }

  getAgents(): AgentProfile[] {
    return Array.from(this.getStoredAgents().values())
  }

  findAgentsByCapability(capability: AgentCapability): AgentProfile[] {
    return this.getAgents().filter(a => a.capabilities.includes(capability))
  }

  createEnvelope(
    senderId: string,
    senderType: 'human' | 'agent',
    recipientId: string,
    recipientType: 'human' | 'agent',
    payload: string,
    payloadType: 'text' | 'json' | 'encrypted',
    msgType: 'request' | 'response' | 'notification' | 'negotiate' = 'request',
    requiresHumanApproval = false,
  ): AMPEnvelope {
    return {
      protocol: 'amp',
      version: '1.0',
      sender: { id: senderId, type: senderType },
      recipient: { id: recipientId, type: recipientType },
      message: {
        id: `amp_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`,
        type: msgType,
        timestamp: Date.now(),
        payload,
        payloadType,
        requiresHumanApproval,
      },
      trustAnnotations: [],
    }
  }

  serializeEnvelope(envelope: AMPEnvelope): string {
    return JSON.stringify(envelope)
  }

  deserializeEnvelope(data: string): AMPEnvelope | null {
    try {
      const envelope = JSON.parse(data)
      if (envelope.protocol !== 'amp') return null
      return envelope as AMPEnvelope
    } catch {
      return null
    }
  }

  private getStoredAgents(): Map<string, AgentProfile> {
    try {
      const stored = localStorage.getItem('inbox3_amp_agents')
      if (stored) {
        return new Map(JSON.parse(stored) as [string, AgentProfile][])
      }
    } catch { /* corrupted data */ }
    return new Map()
  }
}

export const ampMessenger = new AMPMessenger()
