import { useState, useCallback } from 'react'
import { Shield, Bot, Eye, ChevronDown, User, Key, LogOut, Fingerprint, Globe, Radio, Share2, Swords, DollarSign, Ban, HardDrive, ScrollText, Network, Skull } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { encryptedMempoolClient } from '../../lib/encryptedMempool'
import { ampMessenger } from '../../lib/ampProtocol'
import { agentInboxManager } from '../../lib/agentInbox'
import { zkReputationPassport } from '../../lib/zkReputation'
import { identityBridge } from '../../lib/identityBridge'
import { p2pRelay } from '../../lib/p2pRelay'
import { swarmCommunication } from '../../lib/swarmCommunication'
import { confidentialAPTClient } from '../../lib/confidentialAPT'
import { batchSettlement } from '../../lib/batchSettlement'
import { rlnSpamPrevention } from '../../lib/rlnSpam'
import { storagePactManager } from '../../lib/storagePact'
import { zkX509Verifier } from '../../lib/zkX509'
import { onionRouter } from '../../lib/onionRouting'
import { militaryPQC } from '../../lib/militaryPQC'
import PremiumMessagingPanel from '../chat/PremiumMessagingPanel'
import ErrorBoundary from '../ErrorBoundary'
import FeatureDetail from './FeatureDetail'

interface SettingsPanelProps {
  usePQ: boolean
  setUsePQ: (v: boolean) => void
}

interface FeatureRow {
  key: string
  icon: typeof Bot
  label: string
  desc: string
  iconColor: string
  badge?: string
  badgeColor?: string
}

export default function SettingsPanel({ usePQ, setUsePQ }: SettingsPanelProps) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null)

  const toggleFeature = (key: string) => {
    setExpandedFeature(prev => prev === key ? null : key)
  }

  const handleLogout = useCallback(() => {
    logout()
    navigate('/login')
  }, [logout, navigate])

  const featureRows: FeatureRow[] = [
    {
      key: 'encrypted-mempool',
      icon: Eye,
      label: 'Encrypted Mempool',
      desc: encryptedMempoolClient.isInitialized() ? 'Ready' : 'Hidden submission via threshold crypto',
      iconColor: encryptedMempoolClient.isInitialized() ? 'text-purple-400' : 'text-white/20',
    },
    {
      key: 'amp',
      icon: Bot,
      label: 'AMP Agent Protocol',
      desc: `${ampMessenger.getAgents().length} registered agents`,
      iconColor: 'text-blue-400',
    },
    {
      key: 'agent-inboxes',
      icon: Bot,
      label: 'Agent Inboxes',
      desc: `${agentInboxManager.getAllInboxes().length} inboxes, ${agentInboxManager.getPendingApprovals().length} pending`,
      iconColor: 'text-blue-400',
    },
    {
      key: 'zk-reputation',
      icon: Fingerprint,
      label: 'ZK Reputation Passport',
      desc: `${zkReputationPassport.getAllClaims().length} reputation claims`,
      iconColor: 'text-purple-400',
    },
    {
      key: 'identity-bridge',
      icon: Globe,
      label: 'Identity Bridge',
      desc: `${identityBridge.getAllProfiles().length} bridged profiles`,
      iconColor: 'text-cyan-400',
    },
    {
      key: 'p2p-relay',
      icon: Radio,
      label: 'P2P Relay',
      desc: `${p2pRelay.getStats().peerCount} peers, avg ${p2pRelay.getStats().avgLatency.toFixed(0)}ms latency`,
      iconColor: 'text-green-400',
    },
    {
      key: 'swarm',
      icon: Share2,
      label: 'Swarm Communication',
      desc: `${swarmCommunication.getActiveSessions().length} active swarm sessions`,
      iconColor: 'text-orange-400',
    },
    {
      key: 'confidential-apt',
      icon: Swords,
      label: 'Confidential APT',
      desc: confidentialAPTClient.isReady() ? 'Encrypted balance ready' : 'Not initialized',
      iconColor: 'text-yellow-400',
    },
    {
      key: 'batch-settlement',
      icon: DollarSign,
      label: 'Batch Settlement',
      desc: `${batchSettlement.getStats().pendingTips} pending microtips, ${batchSettlement.getStats().settledBatches} settled batches`,
      iconColor: 'text-green-400',
    },
    {
      key: 'rln-spam',
      icon: Ban,
      label: 'RLN Spam Prevention',
      desc: `${rlnSpamPrevention.getStats().flaggedAddresses} flagged, ${rlnSpamPrevention.getStats().totalNullifiers} nullifiers`,
      iconColor: 'text-red-400',
    },
    {
      key: 'storage-pacts',
      icon: HardDrive,
      label: 'Storage Pacts',
      desc: `${storagePactManager.getStats().activePacts} active, ${(storagePactManager.getStats().totalStoredBytes / 1024).toFixed(1)} KB stored`,
      iconColor: 'text-amber-400',
    },
    {
      key: 'zk-x509',
      icon: ScrollText,
      label: 'ZK-X509 Corporate PKI',
      desc: `${zkX509Verifier.getCertificates().length} certificates, ${zkX509Verifier.getProofs().length} proofs`,
      iconColor: 'text-slate-400',
    },
    {
      key: 'onion-routing',
      icon: Network,
      label: '3-Hop Onion Routing',
      desc: `${onionRouter.getStats().routeCount} routes, avg ${onionRouter.getStats().avgHopCount.toFixed(1)} hops`,
      iconColor: 'text-indigo-400',
    },
    {
      key: 'military-pqc',
      icon: Skull,
      label: 'Military-Grade PQC',
      desc: militaryPQC.isActive() ? 'ML-KEM-1024 + ML-DSA-87 active' : 'Not initialized',
      iconColor: 'text-red-400',
    },
  ]

  return (
    <div className="overflow-y-auto flex-1">
      <div className="p-4 space-y-1">

        <div className="border-b border-white/[0.04] pb-3 mb-3">
          <ErrorBoundary fallback={<div className="p-4 text-sm text-white/40">Premium messaging unavailable</div>}>
            <PremiumMessagingPanel />
          </ErrorBoundary>
        </div>

        {/* PQ Crypto Toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
          <div className="flex items-center gap-3">
            <Shield className={`w-4 h-4 ${usePQ ? 'text-green-400' : 'text-white/20'}`} />
            <div>
              <p className="text-sm font-medium text-white">Hybrid E2EE</p>
              <p className="text-xs text-white/30">NaCl box + Double Ratchet forward secrecy</p>
            </div>
          </div>
          <button
            onClick={() => setUsePQ(!usePQ)}
            role="switch"
            aria-checked={usePQ}
            className={`relative w-10 h-5 rounded-full transition-colors ${
              usePQ ? 'bg-green-500' : 'bg-white/10'
            }`}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                usePQ ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {/* Feature Rows */}
        {featureRows.map(row => {
          const Icon = row.icon
          const isExpanded = expandedFeature === row.key
          return (
            <div key={row.key}>
              <button
                onClick={() => toggleFeature(row.key)}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors text-left"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Icon className={`w-4 h-4 shrink-0 ${row.iconColor}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white">{row.label}</p>
                    <p className="text-xs text-white/30 truncate">{row.desc}</p>
                  </div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-white/20 shrink-0 ml-2 transition-transform duration-200 ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {isExpanded && (
                <div className="px-4 pb-3 pt-1">
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <FeatureDetail feature={row.key} />
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {/* User Settings */}
        <div className="border-t border-white/[0.04] pt-3 mt-3" />

        {[
          { icon: User, label: 'Profile', desc: 'Edit your identity' },
          { icon: Key, label: 'Keys', desc: 'PQ hybrid keypair' },
        ].map((item) => (
          <button
            key={item.label}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-left"
          >
            <item.icon className="w-4 h-4 text-white/40" />
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{item.label}</p>
              <p className="text-xs text-white/30">{item.desc}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-white/20 -rotate-90" />
          </button>
        ))}

        <div className="pt-4 mt-4 border-t border-white/5">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-left text-red-400">
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Disconnect</span>
          </button>
        </div>
      </div>
    </div>
  )
}
