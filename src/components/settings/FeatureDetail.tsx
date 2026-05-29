import { useState } from 'react'
import { toast } from 'sonner'
import { ampMessenger, type AgentProfile } from '../../lib/ampProtocol'
import { agentInboxManager } from '../../lib/agentInbox'
import { zkReputationPassport, type ReputationClaimType, DEFAULT_REPUTATION_GATES } from '../../lib/zkReputation'
import { identityBridge, type IdentityProtocol } from '../../lib/identityBridge'
import { p2pRelay } from '../../lib/p2pRelay'
import { swarmCommunication } from '../../lib/swarmCommunication'
import { confidentialAPTClient } from '../../lib/confidentialAPT'
import { batchSettlement } from '../../lib/batchSettlement'
import { rlnSpamPrevention } from '../../lib/rlnSpam'
import { storagePactManager } from '../../lib/storagePact'
import { zkX509Verifier } from '../../lib/zkX509'
import { onionRouter } from '../../lib/onionRouting'
import { militaryPQC } from '../../lib/militaryPQC'
import { encryptedMempoolClient } from '../../lib/encryptedMempool'

function StatsBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
      <span className="text-xs text-white/40">{label}</span>
      <span className="text-xs font-mono text-white/80">{value}</span>
    </div>
  )
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-white/50 uppercase tracking-wider">{title}</p>
      {children}
    </div>
  )
}

export default function FeatureDetail({ feature }: { feature: string }) {
  switch (feature) {
    case 'encrypted-mempool': return <EncryptedMempoolDetail />
    case 'amp': return <AMPDetail />
    case 'agent-inboxes': return <AgentInboxDetail />
    case 'zk-reputation': return <ZKReputationDetail />
    case 'identity-bridge': return <IdentityBridgeDetail />
    case 'p2p-relay': return <P2PRelayDetail />
    case 'swarm': return <SwarmDetail />
    case 'confidential-apt': return <ConfidentialAPTDetail />
    case 'batch-settlement': return <BatchSettlementDetail />
    case 'rln-spam': return <RLNSpamDetail />
    case 'storage-pacts': return <StoragePactDetail />
    case 'zk-x509': return <ZKX509Detail />
    case 'onion-routing': return <OnionRoutingDetail />
    case 'military-pqc': return <MilitaryPQCDetail />
    default: return null
  }
}

function AMPDetail() {
  const [agents, setAgents] = useState(ampMessenger.getAgents())
  const [showRegister, setShowRegister] = useState(false)
  const [agentName, setAgentName] = useState('')
  const [agentDesc, setAgentDesc] = useState('')
  const [agentEndpoint, setAgentEndpoint] = useState('')

  const handleRegister = () => {
    if (!agentName.trim()) return
    const agent: AgentProfile = {
      id: `agent_${Date.now()}`,
      name: agentName.trim(),
      description: agentDesc.trim() || 'No description',
      capabilities: ['text'],
      endpoint: agentEndpoint.trim() || 'http://localhost:8080',
      publicKey: `pk_${crypto.randomUUID().slice(0, 16)}`,
    }
    ampMessenger.registerAgent(agent)
    setAgents(ampMessenger.getAgents())
    setAgentName('')
    setAgentDesc('')
    setAgentEndpoint('')
    setShowRegister(false)
    toast.success('Agent registered locally')
  }

  const handleUnregister = (id: string, name: string) => {
    ampMessenger.unregisterAgent(id)
    setAgents(ampMessenger.getAgents())
    toast.info(`Agent "${name}" removed`)
  }

  return (
    <div className="space-y-3">
      <DetailSection title="Registered Agents">
        <StatsBadge label="Total" value={String(agents.length)} />
        {agents.length === 0 ? (
          <p className="text-xs text-white/20 text-center py-3">No agents registered</p>
        ) : agents.map(a => (
          <div key={a.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-white truncate">{a.name}</p>
              <p className="text-[10px] text-white/30 font-mono truncate">{a.endpoint}</p>
            </div>
            <button onClick={() => handleUnregister(a.id, a.name)} className="text-[10px] text-red-400 hover:text-red-300 transition-colors shrink-0 ml-2">Remove</button>
          </div>
        ))}
      </DetailSection>

      {showRegister ? (
        <div className="space-y-2 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <input value={agentName} onChange={e => setAgentName(e.target.value)} placeholder="Agent name *" className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/20 outline-none" />
          <input value={agentDesc} onChange={e => setAgentDesc(e.target.value)} placeholder="Description (optional)" className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/20 outline-none" />
          <input value={agentEndpoint} onChange={e => setAgentEndpoint(e.target.value)} placeholder="Endpoint URL (optional)" className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/20 outline-none" />
          <div className="flex gap-2">
            <button onClick={handleRegister} className="flex-1 py-1.5 rounded-lg bg-[#A855F7] text-xs text-white font-medium hover:opacity-90 transition-opacity">Register</button>
            <button onClick={() => setShowRegister(false)} className="py-1.5 px-3 rounded-lg bg-white/5 text-xs text-white/40 hover:bg-white/10 transition-colors">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowRegister(true)} className="w-full py-2 rounded-lg border border-dashed border-white/10 text-xs text-white/40 hover:text-white/60 hover:border-white/20 transition-colors">
          + Register Agent
        </button>
      )}
    </div>
  )
}

function AgentInboxDetail() {
  const [inboxes, setInboxes] = useState(agentInboxManager.getAllInboxes())
  const [pending, setPending] = useState(agentInboxManager.getPendingApprovals())
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [slug, setSlug] = useState('')

  const refresh = () => {
    setInboxes(agentInboxManager.getAllInboxes())
    setPending(agentInboxManager.getPendingApprovals())
  }

  const handleCreate = () => {
    if (!slug.trim() || !name.trim()) return
    agentInboxManager.registerInbox({
      slug: slug.trim().toLowerCase().replace(/\s+/g, '-'),
      name: name.trim(),
      description: desc.trim() || 'No description',
      capabilities: ['text'],
      publicKey: `pk_${crypto.randomUUID().slice(0, 16)}`,
      owner: 'local',
      isHumanInLoop: true,
    })
    setSlug('')
    setName('')
    setDesc('')
    setShowCreate(false)
    refresh()
    toast.success('Inbox created')
  }

  const handleApprove = (msgId: string) => {
    agentInboxManager.approveMessage(msgId)
    refresh()
    toast.success('Message approved')
  }

  const handleReject = (msgId: string) => {
    agentInboxManager.rejectMessage(msgId)
    refresh()
    toast.info('Message rejected')
  }

  return (
    <div className="space-y-3">
      <DetailSection title="Inboxes">
        <StatsBadge label="Total" value={String(inboxes.length)} />
        {inboxes.length === 0 ? (
          <p className="text-xs text-white/20 text-center py-3">No inboxes</p>
        ) : inboxes.map(i => (
          <div key={i.slug} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-white truncate">{i.name}</p>
              <p className="text-[10px] text-white/30 font-mono">{i.slug}</p>
            </div>
            <button onClick={() => { agentInboxManager.unregisterInbox(i.slug); refresh() }} className="text-[10px] text-red-400 hover:text-red-300 shrink-0 ml-2">Delete</button>
          </div>
        ))}
      </DetailSection>

      {pending.length > 0 && (
        <DetailSection title={`Pending Approvals (${pending.length})`}>
          {pending.map(m => (
            <div key={m.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-white truncate">{m.content.slice(0, 40)}</p>
                <p className="text-[10px] text-white/30">from {m.from.slice(0, 10)}...</p>
              </div>
              <div className="flex gap-1 shrink-0 ml-2">
                <button onClick={() => handleApprove(m.id)} className="px-2 py-0.5 rounded text-[10px] bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors">Approve</button>
                <button onClick={() => handleReject(m.id)} className="px-2 py-0.5 rounded text-[10px] bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors">Reject</button>
              </div>
            </div>
          ))}
        </DetailSection>
      )}

      {showCreate ? (
        <div className="space-y-2 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <input value={slug} onChange={e => setSlug(e.target.value)} placeholder="Slug * (e.g. my-agent)" className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/20 outline-none" />
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Display name *" className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/20 outline-none" />
          <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description" className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/20 outline-none" />
          <div className="flex gap-2">
            <button onClick={handleCreate} className="flex-1 py-1.5 rounded-lg bg-[#A855F7] text-xs text-white font-medium hover:opacity-90 transition-opacity">Create</button>
            <button onClick={() => setShowCreate(false)} className="py-1.5 px-3 rounded-lg bg-white/5 text-xs text-white/40 hover:bg-white/10 transition-colors">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowCreate(true)} className="w-full py-2 rounded-lg border border-dashed border-white/10 text-xs text-white/40 hover:text-white/60 hover:border-white/20 transition-colors">
          + Create Inbox
        </button>
      )}
    </div>
  )
}

function ZKReputationDetail() {
  const [claims, setClaims] = useState(zkReputationPassport.getAllClaims())
  const [showIssue, setShowIssue] = useState(false)
  const [claimType, setClaimType] = useState<ReputationClaimType>('github_stars')
  const [claimValue, setClaimValue] = useState('')
  const [claimIssuer, setClaimIssuer] = useState('self')

  const refresh = () => setClaims(zkReputationPassport.getAllClaims())

  const handleIssue = () => {
    if (!claimValue.trim()) return
    zkReputationPassport.issueClaim(claimType, claimValue.trim(), claimIssuer.trim())
    setClaimValue('')
    setShowIssue(false)
    refresh()
    toast.success('Reputation claim issued')
  }

  const handleClear = () => {
    zkReputationPassport.clearClaims()
    refresh()
    toast.info('All claims cleared')
  }

  return (
    <div className="space-y-3">
      <DetailSection title="Reputation Claims">
        <StatsBadge label="Total" value={String(claims.length)} />
        {DEFAULT_REPUTATION_GATES.map(g => (
          <div key={g.claimType} className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <span className="text-xs text-white/60">{g.description}</span>
            <span className={`text-xs font-mono ${zkReputationPassport.meetsGate(g) ? 'text-green-400' : 'text-white/20'}`}>
              {zkReputationPassport.meetsGate(g) ? 'Pass' : '—'}
            </span>
          </div>
        ))}
        {claims.map(c => (
          <div key={c.id} className="px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white">{c.type}</span>
              <span className="text-[10px] font-mono text-green-400">{c.value}</span>
            </div>
            <p className="text-[10px] text-white/20 font-mono truncate mt-0.5">{c.proof.slice(0, 24)}...</p>
          </div>
        ))}
      </DetailSection>

      {showIssue ? (
        <div className="space-y-2 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <select value={claimType} onChange={e => setClaimType(e.target.value as ReputationClaimType)} className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-white outline-none appearance-none cursor-pointer">
            <option value="github_stars">GitHub Stars</option>
            <option value="wallet_age">Wallet Age (days)</option>
            <option value="aptos_balance">Aptos Balance (APT)</option>
            <option value="nft_holder">NFT Holder</option>
            <option value="kyc_verified">KYC Verified</option>
            <option value="over_18">Over 18</option>
          </select>
          <input value={claimValue} onChange={e => setClaimValue(e.target.value)} placeholder="Value *" className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/20 outline-none" />
          <input value={claimIssuer} onChange={e => setClaimIssuer(e.target.value)} placeholder="Issuer" className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/20 outline-none" />
          <div className="flex gap-2">
            <button onClick={handleIssue} className="flex-1 py-1.5 rounded-lg bg-[#A855F7] text-xs text-white font-medium hover:opacity-90">Issue</button>
            <button onClick={() => setShowIssue(false)} className="py-1.5 px-3 rounded-lg bg-white/5 text-xs text-white/40">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button onClick={() => setShowIssue(true)} className="flex-1 py-2 rounded-lg border border-dashed border-white/10 text-xs text-white/40 hover:text-white/60">+ Issue Claim</button>
          {claims.length > 0 && <button onClick={handleClear} className="py-2 px-3 rounded-lg border border-dashed border-red-500/20 text-xs text-red-400 hover:text-red-300">Clear All</button>}
        </div>
      )}
    </div>
  )
}

function IdentityBridgeDetail() {
  const [profiles, setProfiles] = useState(identityBridge.getAllProfiles())

  const handleBridge = (protocol: IdentityProtocol) => {
    const p = profiles[0]
    const address = p?.localAddress || `0x${crypto.randomUUID().slice(0, 16)}`
    if (protocol === 'farcaster') {
      identityBridge.bridgeFarcaster(`fid_${Date.now()}`, address)
    } else if (protocol === 'lens') {
      identityBridge.bridgeLens(`lens_${Date.now()}`, address)
    }
    setProfiles(identityBridge.getAllProfiles())
    toast.success(`Bridged to ${protocol}`)
  }

  return (
    <div className="space-y-3">
      <DetailSection title="Bridged Identities">
        <StatsBadge label="Profiles" value={String(profiles.length)} />
        {profiles.length === 0 ? (
          <p className="text-xs text-white/20 text-center py-3">No bridged identities</p>
        ) : profiles.flatMap(p => p.bridgedIdentities).map(i => (
          <div key={`${i.protocol}-${i.id}`} className="px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white capitalize">{i.protocol}</span>
              <span className="text-[10px] text-white/30 font-mono">{i.displayName}</span>
            </div>
          </div>
        ))}
      </DetailSection>

      <div className="flex gap-2">
        {(['farcaster', 'lens', 'ens', 'aptos'] as IdentityProtocol[]).map(p => (
          <button key={p} onClick={() => handleBridge(p)} className="flex-1 py-2 rounded-lg border border-dashed border-white/10 text-xs text-white/40 capitalize hover:text-white/60 hover:border-white/20 transition-colors">
            + {p}
          </button>
        ))}
      </div>
    </div>
  )
}

function P2PRelayDetail() {
  const stats = p2pRelay.getStats()
  return (
    <div className="space-y-3">
      <DetailSection title="Relay Stats">
        <StatsBadge label="Peers" value={String(stats.peerCount)} />
        <StatsBadge label="Queue" value={String(stats.queueLength)} />
        <StatsBadge label="Avg Latency" value={`${stats.avgLatency.toFixed(0)}ms`} />
      </DetailSection>
    </div>
  )
}

function SwarmDetail() {
  const sessions = swarmCommunication.getActiveSessions()
  return (
    <div className="space-y-3">
      <DetailSection title="Active Sessions">
        <StatsBadge label="Active" value={String(sessions.length)} />
        {sessions.length === 0 ? (
          <p className="text-xs text-white/20 text-center py-3">No active swarm sessions</p>
        ) : sessions.map(s => (
          <div key={s.id} className="px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <p className="text-xs text-white truncate">{s.id}</p>
            <p className="text-[10px] text-white/30">{s.messageCount} messages · {s.agents.length} agents</p>
          </div>
        ))}
      </DetailSection>
    </div>
  )
}

function ConfidentialAPTDetail() {
  const ready = confidentialAPTClient.isReady()
  return (
    <div className="space-y-3">
      <DetailSection title="Status">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
          <div className={`w-2 h-2 rounded-full ${ready ? 'bg-green-500' : 'bg-white/20'}`} />
          <span className="text-xs text-white/80">{ready ? 'Encrypted balance ready' : 'Not initialized'}</span>
        </div>
        {!ready && (
          <button onClick={() => { confidentialAPTClient.initialize(); toast.success('Confidential APT initialized') }} className="w-full py-2 rounded-lg bg-[#A855F7]/20 text-xs text-[#A855F7] font-medium hover:bg-[#A855F7]/30 transition-colors">
            Initialize
          </button>
        )}
      </DetailSection>
    </div>
  )
}

function BatchSettlementDetail() {
  const stats = batchSettlement.getStats()
  const pending = batchSettlement.getPendingBatches()
  return (
    <div className="space-y-3">
      <DetailSection title="Settlement Stats">
        <StatsBadge label="Pending Tips" value={String(stats.pendingTips)} />
        <StatsBadge label="Total Batches" value={String(stats.totalBatches)} />
        <StatsBadge label="Settled" value={String(stats.settledBatches)} />
        <StatsBadge label="Total Settled" value={`${stats.totalSettled} APT`} />
      </DetailSection>
      {pending.length > 0 && (
        <DetailSection title="Pending Batches">
          {pending.map(b => (
            <div key={b.id} className="px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
              <p className="text-xs text-white font-mono">{b.id.slice(0, 16)}...</p>
              <p className="text-[10px] text-white/30">{b.microtips.length} tips · {b.totalAmount} APT</p>
            </div>
          ))}
        </DetailSection>
      )}
    </div>
  )
}

function RLNSpamDetail() {
  const stats = rlnSpamPrevention.getStats()
  return (
    <div className="space-y-3">
      <DetailSection title="Spam Stats">
        <StatsBadge label="Nullifiers" value={String(stats.totalNullifiers)} />
        <StatsBadge label="Flagged" value={String(stats.flaggedAddresses)} />
        <StatsBadge label="Avg Score" value={stats.avgScore.toFixed(1)} />
      </DetailSection>
    </div>
  )
}

function StoragePactDetail() {
  const stats = storagePactManager.getStats()
  return (
    <div className="space-y-3">
      <DetailSection title="Pact Stats">
        <StatsBadge label="Total" value={String(stats.totalPacts)} />
        <StatsBadge label="Active" value={String(stats.activePacts)} />
        <StatsBadge label="Stored" value={`${(stats.totalStoredBytes / 1024).toFixed(1)} KB`} />
      </DetailSection>
    </div>
  )
}

function ZKX509Detail() {
  const certs = zkX509Verifier.getCertificates()
  const proofs = zkX509Verifier.getProofs()
  return (
    <div className="space-y-3">
      <DetailSection title="PKI Store">
        <StatsBadge label="Certificates" value={String(certs.length)} />
        <StatsBadge label="Proofs" value={String(proofs.length)} />
      </DetailSection>
    </div>
  )
}

function OnionRoutingDetail() {
  const stats = onionRouter.getStats()
  return (
    <div className="space-y-3">
      <DetailSection title="Route Stats">
        <StatsBadge label="Routes" value={String(stats.routeCount)} />
        <StatsBadge label="Avg Hops" value={stats.avgHopCount.toFixed(1)} />
      </DetailSection>
    </div>
  )
}

function MilitaryPQCDetail() {
  const active = militaryPQC.isActive()
  return (
    <div className="space-y-3">
      <DetailSection title="Status">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
          <div className={`w-2 h-2 rounded-full ${active ? 'bg-green-500' : 'bg-white/20'}`} />
          <span className="text-xs text-white/80">{active ? 'ML-KEM-1024 + ML-DSA-87 active' : 'Not initialized'}</span>
        </div>
        {!active && (
          <button onClick={() => { militaryPQC.generateKeys(); toast.success('Military-grade PQC initialized') }} className="w-full py-2 rounded-lg bg-[#A855F7]/20 text-xs text-[#A855F7] font-medium hover:bg-[#A855F7]/30 transition-colors">
            Initialize
          </button>
        )}
        {active && (
          <button onClick={() => { militaryPQC.clearKeys(); toast.info('PQC keys cleared') }} className="w-full py-2 rounded-lg border border-dashed border-red-500/20 text-xs text-red-400 hover:text-red-300 transition-colors">
            Clear Keys
          </button>
        )}
      </DetailSection>
    </div>
  )
}

function EncryptedMempoolDetail() {
  const initialized = encryptedMempoolClient.isInitialized()
  const queue = encryptedMempoolClient.getQueuedSubmissions()
  return (
    <div className="space-y-3">
      <DetailSection title="Status">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
          <div className={`w-2 h-2 rounded-full ${initialized ? 'bg-green-500' : 'bg-white/20'}`} />
          <span className="text-xs text-white/80">{initialized ? 'Threshold crypto ready' : 'Not initialized'}</span>
        </div>
      </DetailSection>
      <DetailSection title="Queue">
        <StatsBadge label="Queued Submissions" value={String(queue.length)} />
        {queue.length > 0 && (
          <button onClick={() => { encryptedMempoolClient.clearQueue(); toast.info('Queue cleared') }} className="w-full py-2 rounded-lg border border-dashed border-red-500/20 text-xs text-red-400 hover:text-red-300 transition-colors">
            Clear Queue
          </button>
        )}
      </DetailSection>
    </div>
  )
}
