import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8 lg:p-24 selection:bg-[#FF6B35]/30">
      <Link to="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-12">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>
      
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl lg:text-5xl font-semibold tracking-tighter mb-4">Privacy Policy</h1>
          <p className="text-white/50">Last updated: May 2026</p>
        </div>

        <div className="space-y-6 text-white/70 leading-relaxed">
          <section>
            <h2 className="text-2xl font-medium text-white mb-3">1. Decentralized By Design</h2>
            <p>
              Inbox3 is a decentralized application (Dapp). We do not run centralized servers that store your plaintext messages. All message payloads are encrypted locally on your device using NaCl curve25519-xsalsa20-poly1305 before being permanently uploaded to decentralized storage networks (Irys/Arweave). 
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-white mb-3">2. What We Can't See</h2>
            <p>
              We cannot see the content of your messages, your attachments, or your smart actions. The private key used to decrypt these payloads never leaves your local browser storage. If you lose access to your wallet or your local cache, we cannot recover your messages for you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-white mb-3">3. Public Blockchain Data</h2>
            <p>
              By utilizing the Aptos blockchain, the metadata of your transactions (sender address, receiver address, timestamp, and the pointer to the encrypted Irys payload) are recorded on a public ledger. This information is visible to anyone analyzing the blockchain. We do not control this public data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-white mb-3">4. Ephemeral Mode</h2>
            <p>
              Messages sent using "Ephemeral Mode" generate a one-time use keypair that is securely distributed. While the encrypted payload remains on-chain permanently, the key used to decrypt it is destroyed from your local device after the specified duration, rendering the message unreadable forever.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
