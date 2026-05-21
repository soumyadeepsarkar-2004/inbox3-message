import { describe, it, expect } from 'vitest'
import { EncryptionManager } from '../lib/crypto'

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