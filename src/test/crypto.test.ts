import { describe, it, expect } from 'vitest'
import { EncryptionManager } from '../lib/crypto'
import { PQEncryptionManager } from '../lib/pqCrypto'
import { X402Facilitator } from '../lib/x402'
import { AMPMessenger } from '../lib/ampProtocol'
import { EncryptedMempoolClient } from '../lib/encryptedMempool'
import { AgentInboxManager } from '../lib/agentInbox'
import { ZKReputationPassport } from '../lib/zkReputation'
import { IdentityBridge } from '../lib/identityBridge'
import { P2PRelay } from '../lib/p2pRelay'
import { SwarmCommunication } from '../lib/swarmCommunication'
import { ConfidentialAPTClient } from '../lib/confidentialAPT'
import { BatchSettlement } from '../lib/batchSettlement'
import { RLNSpamPrevention } from '../lib/rlnSpam'
import { StoragePactManager } from '../lib/storagePact'
import { ZKX509Verifier } from '../lib/zkX509'
import { OnionRouter } from '../lib/onionRouting'
import { MilitaryPQCManager } from '../lib/militaryPQC'

describe('EncryptionManager', () => {
  it('generates and loads keys', () => {
    const manager = new EncryptionManager()
    const keys = manager.generateKeys()
    expect(keys.publicKey).toBeDefined()
    expect(keys.secretKey).toBeDefined()
    expect(manager.loadKeys()).toBe(true)
    manager.clearKeys()
  })

  it('encrypts and decrypts messages', () => {
    const alice = new EncryptionManager()
    const bob = new EncryptionManager()
    alice.generateKeys()
    bob.generateKeys()

    const message = 'Hello, decentralized world!'
    const encrypted = alice.encrypt(message, bob.getPublicKey()!)
    expect(encrypted).toBeDefined()
    expect(encrypted).not.toBe(message)

    const decrypted = bob.decrypt(encrypted, alice.getPublicKey()!)
    expect(decrypted).toBe(message)

    alice.clearKeys()
    bob.clearKeys()
  })
})

describe('PQEncryptionManager', () => {
  it('generates and loads PQ keys', () => {
    const manager = new PQEncryptionManager()
    const keys = manager.generateKeys()
    expect(keys.publicKey).toBeDefined()
    expect(keys.secretKey).toBeDefined()
    expect(manager.loadKeys()).toBe(true)
    manager.clearKeys()
  })

  it('encrypts and decrypts with Double Ratchet', () => {
    const alice = new PQEncryptionManager()
    const bob = new PQEncryptionManager()
    alice.generateKeys()
    bob.generateKeys()

    const message = 'Hello from Alice with Double Ratchet!'
    const encrypted = alice.encrypt(message, bob.getPublicKey()!)
    expect(encrypted).toBeDefined()
    expect(encrypted).not.toBe(message)

    const decrypted = bob.decrypt(encrypted, alice.getPublicKey()!)
    expect(decrypted).toBe(message)

    alice.clearKeys()
    bob.clearKeys()
  })
})

describe('X402Facilitator', () => {
  it('processes and verifies payments', async () => {
    const facilitator = new X402Facilitator()
    const receipt = await facilitator.requestPayment('0.01', '0xrecipient', 'test-msg-1')
    expect(receipt).not.toBeNull()
    expect(receipt!.amount).toBe('0.01')

    const verified = await facilitator.verifyPayment(receipt!.id)
    expect(verified).toBe(true)

    facilitator.clearReceipts()
  })
})

describe('AMPMessenger', () => {
  it('creates and serializes AMP envelopes', () => {
    const messenger = new AMPMessenger()
    const envelope = messenger.createEnvelope('0xsender', 'human', '0xagent', 'agent', 'Hello agent!', 'text', 'request', true)
    expect(envelope.protocol).toBe('amp')
    expect(envelope.message.requiresHumanApproval).toBe(true)

    const serialized = messenger.serializeEnvelope(envelope)
    const deserialized = messenger.deserializeEnvelope(serialized)
    expect(deserialized).not.toBeNull()
    expect(deserialized!.sender.id).toBe('0xsender')
  })
})

describe('EncryptedMempoolClient', () => {
  it('creates mempool submissions', async () => {
    const nacl = await import('tweetnacl')
    const { encodeBase64 } = await import('tweetnacl-util')
    const keyPair = nacl.box.keyPair()
    const pubKey = encodeBase64(keyPair.publicKey)

    const client = new EncryptedMempoolClient()
    const encryptedPayload = await client.encryptForMempool('secret message', pubKey)
    expect(encryptedPayload.version).toBe(1)
    expect(encryptedPayload.ciphertext).toBeDefined()
    expect(encryptedPayload.ephemeralPublicKey).toBeDefined()

    const submission = await client.createMempoolSubmission(encryptedPayload, '0xrecipient')
    expect(submission.recipient).toBe('0xrecipient')
    expect(submission.commitment).toBeDefined()
  })
})

describe('AgentInboxManager', () => {
  it('registers inboxes and manages messages', () => {
    const manager = new AgentInboxManager()
    const inbox = manager.registerInbox({ slug: 'research-agent', name: 'Research Agent', description: 'AI research assistant', capabilities: ['text', 'analyze'], publicKey: 'pk123', owner: '0xowner', isHumanInLoop: true })
    expect(inbox.slug).toBe('research-agent')
    expect(manager.getInbox('research-agent')).toBeDefined()

    const msg = manager.sendMessage({ inboxSlug: 'research-agent', from: '0xuser', to: '0xowner', content: 'Analyze this', requiresApproval: true })
    expect(msg.status).toBe('pending')

    expect(manager.approveMessage(msg.id)).toBe(true)
    expect(manager.getPendingApprovals().length).toBe(0)
  })
})

describe('ZKReputationPassport', () => {
  it('issues and verifies claims', () => {
    const passport = new ZKReputationPassport()
    passport.issueClaim('github_stars', '50', 'github-issuer')
    passport.issueClaim('over_18', '1', 'kyc-issuer')

    expect(passport.getAllClaims().length).toBe(2)
    expect(passport.meetsGate({ claimType: 'github_stars', minValue: '10', description: '' })).toBe(true)
    expect(passport.meetsGate({ claimType: 'github_stars', minValue: '100', description: '' })).toBe(false)

    passport.clearClaims()
  })
})

describe('IdentityBridge', () => {
  it('bridges Farcaster and Lens identities', async () => {
    const bridge = new IdentityBridge()
    await bridge.bridgeFarcaster('fid_123', '0xaddr1')
    await bridge.bridgeLens('lens_456', '0xaddr1')

    const identities = bridge.getIdentities('0xaddr1')
    expect(identities.length).toBe(2)
    expect(identities[0].protocol).toBe('farcaster')

    const fid = await bridge.resolveFarcaster('0xaddr1')
    expect(fid).toBe('fid_123')
  })
})

describe('P2PRelay', () => {
  it('manages peers and relay messages', async () => {
    const relay = new P2PRelay()
    relay.registerPeer({ id: 'peer1', address: '0xpeer1', publicKey: 'pk1' })

    const nacl = await import('tweetnacl')
    const { encodeBase64 } = await import('tweetnacl-util')
    const keyPair = nacl.box.keyPair()
    const pubKey = encodeBase64(keyPair.publicKey)

    const { ciphertext, nonce } = await relay.encryptForRelay('relay msg', pubKey)
    const msg = relay.createRelayMessage('0xalice', '0xbob', ciphertext, nonce)
    relay.queueMessage(msg)

    expect(relay.getPeers().length).toBe(1)
    expect(relay.getQueue().length).toBe(1)
    expect(relay.getStats().peerCount).toBe(1)
  })
})

describe('SwarmCommunication', () => {
  it('creates proposals and forms sessions', () => {
    const swarm = new SwarmCommunication()
    const proposal = swarm.createProposal('0xproposer', 'Analyze data', 'Need help analyzing', ['analyze', 'text'], ['0xagent1', '0xagent2'])
    expect(proposal.status).toBe('pending')

    swarm.respondToProposal(proposal.id, '0xagent1', 'accept', 'Happy to help')
    swarm.respondToProposal(proposal.id, '0xagent2', 'accept', 'Count me in')

    const updated = swarm.getNegotiations('0xproposer')
    expect(updated.length).toBe(1)
  })
})

describe('ConfidentialAPTClient', () => {
  it('encrypts and decrypts transfer amounts', async () => {
    const client = new ConfidentialAPTClient()
    await client.initialize()
    expect(client.isReady()).toBe(true)

    const nacl = await import('tweetnacl')
    const { encodeBase64 } = await import('tweetnacl-util')
    const keyPair = nacl.box.keyPair()
    const pubKey = encodeBase64(keyPair.publicKey)

    const { encryptedAmount } = await client.encryptTransferAmount(100, pubKey)
    expect(encryptedAmount).toBeDefined()
  })
})

describe('BatchSettlement', () => {
  it('manages microtips and batch settlement', () => {
    const settlement = new BatchSettlement()
    settlement.addMicrotip('0xalice', '0xbob', '0.001', 'USDC', 'msg1')
    settlement.addMicrotip('0xalice', '0xcarol', '0.002', 'USDC', 'msg2')

    expect(settlement.getPendingMicrotips().length).toBe(2)

    const batch = settlement.createBatch()
    expect(batch).not.toBeNull()
    expect(batch!.totalAmount).toBe('0.003000')

    settlement.settleBatch(batch!.id)
    expect(settlement.getStats().settledBatches).toBe(1)
    expect(settlement.getStats().totalSettled).toBe('0.003000')
  })
})

describe('RLNSpamPrevention', () => {
  it('rate limits and tracks spam scores', () => {
    const rln = new RLNSpamPrevention()
    rln.generateNullifier('0xsender', 'test message')
    rln.updateSpamScore('0xspammer', true)
    rln.updateSpamScore('0xspammer', true)
    rln.updateSpamScore('0xspammer', true)
    rln.updateSpamScore('0xspammer', true)

    expect(rln.isFlagged('0xspammer')).toBe(true)
    expect(rln.getSpamScore('0xspammer')).toBeGreaterThanOrEqual(0.7)
    expect(rln.canSend('0xsender')).toBe(true)
    expect(rln.getStats().flaggedAddresses).toBe(1)
  })
})

describe('StoragePactManager', () => {
  it('creates pacts and stores messages', () => {
    const manager = new StoragePactManager()
    const pact = manager.proposePact('0xalice', '0xbob')
    expect(pact.status).toBe('active')

    manager.storeMessage(pact.id, '0xalice', 'encrypted_payload_1')
    manager.storeMessage(pact.id, '0xbob', 'encrypted_payload_2')

    expect(manager.getStoredMessages(pact.id, '0xalice').length).toBe(1)
    expect(manager.getStats().activePacts).toBe(1)
  })
})

describe('ZKX509Verifier', () => {
  it('imports certificates and creates proofs', async () => {
    const verifier = new ZKX509Verifier()
    verifier.importCertificate({ subject: 'CN=User', issuer: 'CN=CA', serialNumber: '12345', notBefore: '2024-01-01', notAfter: '2026-01-01', publicKey: 'pk', signature: 'sig', isCA: false })

    const proof = await verifier.createProof('cert_hash_123', ['subject', 'issuer'])
    expect(verifier.verifyProof(proof.id)).toBe(true)
    expect(verifier.getCertificates().length).toBe(1)
  })
})

describe('OnionRouter', () => {
  it('builds onion routes and encrypts layers', async () => {
    const router = new OnionRouter()
    router.addRoute('0xfinal', ['0xhop1', '0xhop2'])

    const nacl = await import('tweetnacl')
    const { encodeBase64 } = await import('tweetnacl-util')
    const hopKey = nacl.box.keyPair()
    const pubKey = encodeBase64(hopKey.publicKey)

    const { ciphertext } = await router.encryptLayer('secret', pubKey)
    expect(ciphertext).toBeDefined()

    expect(router.getStats().routeCount).toBe(1)
  })
})

describe('MilitaryPQCManager', () => {
  it('generates keys and encrypts/decrypts', () => {
    const alice = new MilitaryPQCManager()
    const bob = new MilitaryPQCManager()
    alice.generateKeys()
    bob.generateKeys()

    expect(alice.isActive()).toBe(true)
    expect(alice.getPublicKey()).toBeDefined()
    expect(bob.loadKeys()).toBe(true)

    const message = 'Top secret military-grade message'
    const encrypted = alice.encrypt(message, bob.getPublicKey()!)
    expect(encrypted).toBeDefined()
    expect(encrypted).not.toBe(message)

    const decrypted = bob.decrypt(encrypted, alice.getPublicKey()!)
    expect(decrypted).toBe(message)

    alice.clearKeys()
    bob.clearKeys()
  })
})
