import { ArrowLeft, Book, Code, Shield } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8 lg:p-24 selection:bg-[#FF6B35]/30">
      <Link to="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-12">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>
      
      <div className="max-w-4xl mx-auto space-y-16">
        <div>
          <h1 className="text-4xl lg:text-6xl font-semibold tracking-tighter mb-6">Documentation</h1>
          <p className="text-xl text-white/60 leading-relaxed">
            Everything you need to integrate, build, and deploy with the Inbox3 protocol.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05]">
            <Book className="w-8 h-8 text-[#A855F7] mb-6" />
            <h3 className="text-xl font-medium mb-4">Protocol Overview</h3>
            <p className="text-white/50 leading-relaxed mb-6">
              Learn how Inbox3 combines Aptos identity, Irys decentralized storage, and local NaCl encryption to create a permissionless messaging layer.
            </p>
            <a href="https://github.com/soumyadeepsarkar-2004/inbox3-message" target="_blank" rel="noopener noreferrer" className="text-[#FF6B35] font-medium hover:underline">Read the Architecture Spec &rarr;</a>
          </div>

          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05]" id="sdk">
            <Code className="w-8 h-8 text-[#FF6B35] mb-6" />
            <h3 className="text-xl font-medium mb-4">SDK Integration</h3>
            <p className="text-white/50 leading-relaxed mb-6">
              Drop the Inbox3 client into your Dapp in minutes. Support for Aptos Wallet Adapter and Keyless authentication out of the box.
            </p>
            <code className="block p-4 rounded-xl bg-black text-sm text-white/80 font-mono mb-4">
              npm install @inbox3/sdk
            </code>
          </div>

          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05]" id="security">
            <Shield className="w-8 h-8 text-emerald-400 mb-6" />
            <h3 className="text-xl font-medium mb-4">Security Model</h3>
            <p className="text-white/50 leading-relaxed mb-6">
              Our end-to-end encryption uses `tweetnacl` for curve25519-xsalsa20-poly1305. Payloads are stored on Arweave via Irys, completely unreadable to anyone without the private key.
            </p>
            <a href="https://github.com/soumyadeepsarkar-2004/inbox3-message/blob/main/src/lib/crypto.ts" target="_blank" rel="noopener noreferrer" className="text-emerald-400 font-medium hover:underline">View Crypto Library &rarr;</a>
          </div>
        </div>
      </div>
    </div>
  )
}
