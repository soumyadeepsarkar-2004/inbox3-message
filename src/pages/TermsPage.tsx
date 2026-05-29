import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8 lg:p-24 selection:bg-[#FF6B35]/30">
      <Link to="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-12">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>
      
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl lg:text-5xl font-semibold tracking-tighter mb-4">Terms of Service</h1>
          <p className="text-white/50">Last updated: May 2026</p>
        </div>

        <div className="space-y-6 text-white/70 leading-relaxed">
          <section>
            <h2 className="text-2xl font-medium text-white mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the Inbox3 protocol, smart contracts, or front-end client, you agree to be bound by these Terms of Service. Inbox3 is experimental software provided "as is" and "as available".
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-white mb-3">2. Non-Custodial Nature</h2>
            <p>
              Inbox3 is a non-custodial protocol. You remain fully responsible for the security of your wallet, private keys, and local application state. We have no ability to reverse transactions, recover lost funds, or retrieve encrypted messages.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-white mb-3">3. Anti-Spam Mechanics (Yield Simulation)</h2>
            <p>
              To message users who do not follow you back, you must stake APT tokens as a "Time Tribute" spam prevention mechanism. Inbox3 simulates the generation of yield on these staked tokens via decentralized finance integration. You agree to the risks associated with smart contract interactions and DeFi protocols.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-white mb-3">4. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Inbox3 and its contributors shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages resulting from your use of the protocol, including but not limited to loss of funds, data, or cryptographic keys.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
