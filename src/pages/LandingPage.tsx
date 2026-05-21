import { ArrowRight, Shield, Zap, Globe, Lock, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

function LogoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 256 256" className={`w-7 h-7 ${className || ''}`} fill="currentColor">
      <path d="M 128.005 191.173 C 128.448 156.208 156.93 128 192 128 L 192 64 L 128 64 C 128 99.346 99.346 128 64 128 L 64 192 L 128 192 Z M 192 256 L 64 256 C 28.654 256 0 227.346 0 192 L 0 64 L 64 64 L 64 0 L 192 0 C 227.346 0 256 28.654 256 64 L 256 192 L 192 192 Z" />
    </svg>
  )
}

const brands = [
  { name: 'Aptos', style: { fontFamily: 'Georgia, serif', fontWeight: 700, letterSpacing: '-0.02em', fontSize: '15px' } },
  { name: 'PETRA', style: { fontFamily: 'Arial, sans-serif', fontWeight: 900, letterSpacing: '0.08em', fontSize: '13px', textTransform: 'uppercase' as const } },
  { name: 'Pontem', style: { fontFamily: '"Trebuchet MS", sans-serif', fontWeight: 600, letterSpacing: '0.01em', fontSize: '15px', fontStyle: 'italic' as const } },
  { name: 'AARON', style: { fontFamily: '"Courier New", monospace', fontWeight: 700, letterSpacing: '0.12em', fontSize: '13px', textTransform: 'uppercase' as const } },
  { name: 'Liquidswap', style: { fontFamily: 'Palatino, "Book Antiqua", serif', fontWeight: 400, letterSpacing: '-0.01em', fontSize: '16px' } },
  { name: 'THALA', style: { fontFamily: 'Impact, "Arial Narrow", sans-serif', fontWeight: 400, letterSpacing: '0.04em', fontSize: '14px' } },
  { name: 'Echo', style: { fontFamily: 'Verdana, sans-serif', fontWeight: 700, letterSpacing: '-0.03em', fontSize: '13px' } },
]

const backers = [
  { name: 'Aptos Foundation', style: { fontFamily: 'Times New Roman, serif', fontWeight: 400, letterSpacing: '0.02em', fontSize: '14px' } },
  { name: 'PANIC', style: { fontFamily: '"Arial Black", sans-serif', fontWeight: 900, letterSpacing: '0.08em', fontSize: '16px' } },
  { name: 'NGC', style: { fontFamily: 'Impact, sans-serif', fontWeight: 700, letterSpacing: '0.05em', fontSize: '18px' } },
  { name: 'A16Z', style: { fontFamily: 'Georgia, serif', fontWeight: 600, letterSpacing: '-0.02em', fontSize: '17px' } },
  { name: 'Matter Labs', style: { fontFamily: 'Helvetica, sans-serif', fontWeight: 700, letterSpacing: '-0.01em', fontSize: '15px' } },
  { name: 'ECHO', style: { fontFamily: 'Verdana, sans-serif', fontWeight: 700, letterSpacing: '0.06em', fontSize: '14px', textTransform: 'uppercase' as const } },
  { name: 'PARAFI', style: { fontFamily: '"Courier New", monospace', fontWeight: 700, letterSpacing: '0.18em', fontSize: '14px' } },
  { name: 'Polychain', style: { fontFamily: 'Palatino, serif', fontWeight: 500, letterSpacing: '0.03em', fontSize: '15px' } },
]

export default function LandingPage() {
  return (
    <div className="flex flex-col bg-[#F5F5F5]">
      {/* Hero Wrapper */}
      <div className="h-screen flex flex-col overflow-hidden">
        {/* Navbar */}
        <nav className="absolute top-0 left-0 right-0 z-20 px-6 py-5">
          <div className="max-w-[88rem] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LogoIcon className="text-black" />
              <span className="text-2xl font-medium tracking-tight text-black">Inbox3</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              {['Network', 'Ecosystem', 'Rewards', 'Help', 'News'].map((item) => (
                <a key={item} href="#" className="text-base text-gray-700 hover:text-black font-medium transition-colors duration-200">
                  {item}
                </a>
              ))}
            </div>
            <Link to="/signup" className="bg-black text-white text-base font-medium px-7 py-2.5 rounded-full hover:bg-gray-800 transition-colors duration-200">
              Get Started
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="flex-1 px-6 pt-20 pb-6 flex items-end">
          <div className="max-w-[88rem] mx-auto w-full relative rounded-2xl overflow-hidden" style={{ height: 'calc(100vh - 96px)' }}>
            <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
              <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260423_161253_c72b1869-400f-45ed-ac0c-52f68c2ed5bd.mp4" type="video/mp4" />
            </video>
            <div className="relative z-10 flex flex-col items-start justify-start h-full p-12 pt-36">
              <h1 className="text-black text-5xl md:text-6xl font-medium leading-tight max-w-xl mb-4" style={{ letterSpacing: '-0.04em' }}>
                Your Messages<br />Stay Yours
              </h1>
              <p className="text-black/70 text-base md:text-lg max-w-md mb-8 leading-relaxed" style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>
                A decentralized, E2E-encrypted messaging platform built for native privacy, reward-powered engagement, and effortless blockchain integration.
              </p>
              <Link to="/signup" className="inline-flex items-center gap-3 bg-black text-white text-base md:text-lg font-medium pl-8 pr-2 py-2 rounded-full hover:bg-gray-800 transition-colors duration-200">
                Join us
                <span className="bg-white rounded-full p-2">
                  <ArrowRight className="w-5 h-5 text-black" />
                </span>
              </Link>

              {/* Brand Marquee */}
              <div className="mt-24 w-full max-w-md overflow-hidden">
                <div className="marquee-track">
                  {[...brands, ...brands].map((brand, i) => (
                    <span key={i} className="mx-7 shrink-0 text-black/60 whitespace-nowrap" style={brand.style}>
                      {brand.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <section className="bg-[#F5F5F5] px-6 py-24">
        <div className="max-w-[88rem] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 items-start">
            <div>
              <h2 className="text-black text-4xl md:text-5xl font-medium leading-tight mb-8" style={{ letterSpacing: '-0.03em' }}>
                Meet Inbox3.
              </h2>
              <Link to="/signup" className="inline-flex items-center gap-3 bg-black text-white text-base font-medium pl-8 pr-2 py-2 rounded-full hover:bg-gray-800 transition-colors duration-200">
                Discover it
                <span className="bg-white rounded-full p-2">
                  <ArrowRight className="w-5 h-5 text-black" />
                </span>
              </Link>
            </div>
            <p className="text-black/70 text-2xl md:text-3xl leading-relaxed">
              Inbox3 is a reward-earning messaging platform that lets your conversations stay private while growing your on-chain reputation.
            </p>
          </div>

          {/* Card Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2 rounded-2xl overflow-hidden" style={{ backgroundImage: 'url(https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260423_164207_f243351d-ed59-48ec-83a0-a5e996bdbe3c.png&w=1280&q=85)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <div className="p-7 min-h-80 flex flex-col justify-between">
                <h3 className="text-black text-2xl font-medium leading-snug" style={{ letterSpacing: '-0.02em' }}>
                  Privacy that blooms
                </h3>
                <p className="text-black/70 text-base max-w-xs">
                  Gain steady trust as your encrypted messages are routed through top-performing decentralized networks.
                </p>
              </div>
            </div>
            <div className="rounded-2xl p-7 min-h-80 flex flex-col justify-between" style={{ backgroundColor: '#2B2644' }}>
              <h3 className="text-white text-2xl font-medium leading-snug" style={{ letterSpacing: '-0.02em' }}>
                Always fluid,<br />always private.
              </h3>
              <p className="text-white/60 text-base">
                Keep fully encrypted with on-demand access to your messages — no lockups or waits.
              </p>
            </div>
            <div className="rounded-2xl p-7 min-h-80 flex flex-col justify-between" style={{ backgroundColor: '#2B2644' }}>
              <h3 className="text-white text-2xl font-medium leading-snug" style={{ letterSpacing: '-0.02em' }}>
                Fully<br />automated
              </h3>
              <p className="text-white/60 text-base">
                Skip the task of managing keys yourself. Inbox3 runs in the background for you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Backed By Section */}
      <section className="bg-[#F5F5F5] px-6 py-16">
        <div className="max-w-[88rem] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 items-center">
          <div className="text-black/70 text-base leading-relaxed">
            Funded by premier partners<br />and forward-thinking leaders.
          </div>
          <div className="md:col-span-3 overflow-hidden">
            <div className="backers-track">
              {[...backers, ...backers].map((backer, i) => (
                <span key={i} className="mx-10 shrink-0 text-black/50 whitespace-nowrap" style={backer.style}>
                  {backer.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="bg-[#F5F5F5] px-6 py-24">
        <div className="max-w-[88rem] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="md:pr-12 md:pt-2">
            <p className="text-black/60 text-sm mb-2">Inbox3 in Practice</p>
            <h2 className="text-5xl md:text-6xl font-medium leading-none mb-6" style={{ letterSpacing: '-0.04em' }}>
              Use modes
            </h2>
            <p className="text-black/60 text-base leading-relaxed max-w-sm">
              Inbox3 powers a wide range of modes for builders, companies and communities wanting safe and rewarding decentralized messaging integrations.
            </p>
          </div>
          <div className="relative rounded-3xl overflow-hidden min-h-[720px]">
            <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
              <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260423_183428_ab5e672a-f608-4dcb-b319-f3e040f02e2d.mp4" type="video/mp4" />
            </video>
            <div className="relative z-10 p-10 md:p-12">
              <h3 className="text-4xl md:text-5xl font-medium leading-tight mb-5" style={{ letterSpacing: '-0.03em' }}>
                Commerce
              </h3>
              <p className="text-black/70 text-base max-w-md mb-8">
                Lift customer retention by offering Inbox3, a trusted decentralized messaging platform with strong privacy, letting your patrons communicate with zero effort on your platform.
              </p>
              <Link to="/signup" className="inline-flex items-center gap-3 group">
                <span className="text-black font-medium">Know more</span>
                <span className="w-9 h-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center group-hover:bg-white transition-colors">
                  <ArrowRight className="w-4 h-4 text-black" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-[#F5F5F5] px-6 py-24">
        <div className="max-w-[88rem] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-black text-4xl md:text-5xl font-medium leading-tight mb-4" style={{ letterSpacing: '-0.03em' }}>
              Built for the future
            </h2>
            <p className="text-black/60 text-lg max-w-2xl mx-auto">
              Every feature designed with privacy, performance, and decentralization at its core.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: 'E2E Encrypted', desc: 'Only you and your recipient can read messages. Not even we can.' },
              { icon: Zap, title: 'Reward-Powered', desc: 'Earn on-chain rewards for active, meaningful conversations.' },
              { icon: Globe, title: 'Decentralized', desc: 'Built on Aptos blockchain. No central point of failure.' },
              { icon: Lock, title: 'Self-Custody', desc: 'Your keys, your messages. Full control over your data.' },
              { icon: Users, title: 'Groups & Communities', desc: 'Create decentralized groups with on-chain governance.' },
              { icon: Globe, title: 'Cross-Platform', desc: 'Access from any device. Your messages follow you everywhere.' },
            ].map((feature, i) => (
              <div key={i} className="rounded-2xl p-8 bg-white/50 hover:bg-white transition-colors duration-300">
                <feature.icon className="w-8 h-8 text-black mb-4" />
                <h3 className="text-black text-xl font-medium mb-2" style={{ letterSpacing: '-0.02em' }}>{feature.title}</h3>
                <p className="text-black/60 text-base leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#F5F5F5] px-6 py-24">
        <div className="max-w-[88rem] mx-auto">
          <div className="rounded-3xl bg-black p-12 md:p-20 text-center">
            <h2 className="text-white text-4xl md:text-6xl font-medium leading-tight mb-6" style={{ letterSpacing: '-0.03em' }}>
              Ready to take back<br />your privacy?
            </h2>
            <p className="text-white/60 text-lg max-w-xl mx-auto mb-10">
              Join thousands who've already switched to decentralized, encrypted messaging.
            </p>
            <Link to="/signup" className="inline-flex items-center gap-3 bg-white text-black text-lg font-medium pl-8 pr-2 py-2 rounded-full hover:bg-white/90 transition-colors duration-200">
              Get started free
              <span className="bg-black rounded-full p-2">
                <ArrowRight className="w-5 h-5 text-white" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#F5F5F5] px-6 py-12 border-t border-black/10">
        <div className="max-w-[88rem] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <LogoIcon className="text-black" />
            <span className="text-lg font-medium tracking-tight text-black">Inbox3</span>
          </div>
          <div className="flex items-center gap-8">
            {['Privacy', 'Terms', 'Docs', 'GitHub'].map((item) => (
              <a key={item} href="#" className="text-sm text-black/60 hover:text-black transition-colors duration-200">{item}</a>
            ))}
          </div>
          <p className="text-sm text-black/40">© 2026 Inbox3. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}