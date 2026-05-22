import { useState, useRef, useEffect } from 'react'
import { ArrowRight, ChevronDown } from 'lucide-react'

function LogoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M 128.005 191.173 C 128.448 156.208 156.93 128 192 128 L 192 64 L 128 64 C 128 99.346 99.346 128 64 128 L 64 192 L 128 192 Z M 192 256 L 64 256 C 28.654 256 0 227.346 0 192 L 0 64 L 64 64 L 64 0 L 192 0 C 227.346 0 256 28.654 256 64 L 256 192 L 192 192 Z" fill="currentColor" />
    </svg>
  )
}

function NavDropdown({ label, items }: { label: string; items: { label: string; href: string }[] }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button className="flex items-center gap-1 text-base text-gray-700 hover:text-black font-medium transition-colors duration-200">
        {label}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 rounded-xl bg-white border border-black/5 shadow-lg shadow-black/5 overflow-hidden">
          {items.map((item) => (
            <a key={item.label} href={item.href} className="block px-4 py-2.5 text-sm text-gray-700 hover:text-black hover:bg-black/5 transition-colors duration-200">
              {item.label}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

const brandLogos = [
  { name: 'Stripe', style: { fontFamily: 'Georgia, serif', fontWeight: 700, letterSpacing: '-0.02em', fontSize: '15px' } },
  { name: 'COINBASE', style: { fontFamily: 'Arial, sans', fontWeight: 900, letterSpacing: '0.08em', fontSize: '12px' } },
  { name: 'Uniswap', style: { fontFamily: '"Trebuchet MS", sans', fontWeight: 600, letterSpacing: '0.01em', fontSize: '15px', fontStyle: 'italic' } },
  { name: 'AAVE', style: { fontFamily: '"Courier New", monospace', fontWeight: 700, letterSpacing: '0.12em', fontSize: '12px' } },
  { name: 'Compound', style: { fontFamily: 'Palatino, "Book Antiqua", serif', fontWeight: 400, letterSpacing: '-0.01em', fontSize: '16px' } },
  { name: 'MakerDAO', style: { fontFamily: 'Impact, "Arial Narrow", sans', fontWeight: 400, letterSpacing: '0.04em', fontSize: '15px' } },
  { name: 'Chainlink', style: { fontFamily: 'Verdana, sans', fontWeight: 700, letterSpacing: '-0.03em', fontSize: '14px' } },
]

const backers = [
  { name: 'Fundamental Labs', style: { fontFamily: '"Times New Roman", serif', fontWeight: 400, letterSpacing: '0.02em', fontSize: '14px' } },
  { name: 'KUCOIN', style: { fontFamily: '"Arial Black", sans', fontWeight: 900, letterSpacing: '0.12em', fontSize: '16px' } },
  { name: 'NGC', style: { fontFamily: 'Impact, sans', fontWeight: 700, letterSpacing: '0.05em', fontSize: '17px' } },
  { name: 'NxGen', style: { fontFamily: 'Georgia, serif', fontWeight: 600, letterSpacing: '-0.02em', fontSize: '16px' } },
  { name: 'Matter Labs', style: { fontFamily: 'Helvetica, sans', fontWeight: 700, letterSpacing: '-0.01em', fontSize: '15px' } },
  { name: 'DEXTOOLS', style: { fontFamily: 'Verdana, sans', fontWeight: 700, letterSpacing: '0.06em', fontSize: '13px' } },
  { name: 'NGRAVE', style: { fontFamily: '"Courier New", monospace', fontWeight: 700, letterSpacing: '0.18em', fontSize: '14px' } },
  { name: 'Polychain', style: { fontFamily: 'Palatino, serif', fontWeight: 500, letterSpacing: '0.03em', fontSize: '15px' } },
]

export default function LandingPage() {
  return (
    <div className="flex flex-col bg-[#F5F5F5]">
      {/* ═══ HERO WRAPPER ═══ */}
      <div className="h-screen flex flex-col overflow-hidden relative">
        {/* Navbar */}
        <nav className="absolute top-0 left-0 right-0 z-20 px-6 py-5">
          <div className="max-w-[88rem] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LogoIcon className="w-7 h-7 text-black" />
              <span className="text-2xl font-medium tracking-tight text-black">Inbox3</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <NavDropdown label="Network" items={[
                { label: 'Explorer', href: '#' },
                { label: 'Bridge', href: '#' },
                { label: 'Staking', href: '#' },
                { label: 'Nodes', href: '#' },
              ]} />
              <NavDropdown label="Ecosystem" items={[
                { label: 'DApps', href: '#' },
                { label: 'Developers', href: '#' },
                { label: 'Integrations', href: '#' },
                { label: 'Partners', href: '#' },
              ]} />
              <NavDropdown label="Rewards" items={[
                { label: 'Staking Rewards', href: '#' },
                { label: 'Airdrops', href: '#' },
                { label: 'Referral Program', href: '#' },
              ]} />
              <NavDropdown label="Help" items={[
                { label: 'Documentation', href: '#' },
                { label: 'FAQ', href: '#' },
                { label: 'Support', href: '#' },
                { label: 'Community', href: '#' },
              ]} />
              <a href="#" className="text-base text-gray-700 hover:text-black font-medium transition-colors duration-200">News</a>
            </div>
            <a href="/signup" className="bg-black text-white text-base font-medium px-7 py-2.5 rounded-full hover:bg-gray-800 transition-colors duration-200">
              Open Wallet
            </a>
          </div>
        </nav>

        {/* Hero */}
        <div className="flex-1 px-6 pt-20 pb-6 flex items-end">
          <div className="relative w-full rounded-2xl overflow-hidden" style={{ height: 'calc(100vh - 96px)' }}>
            <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
              <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260423_161253_c72b1869-400f-45ed-ac0c-52f68c2ed5bd.mp4" type="video/mp4" />
            </video>

            <div className="relative z-10 flex flex-col items-start justify-start h-full p-12 pt-36">
              <h1 className="text-black text-5xl md:text-6xl font-medium leading-tight max-w-xl mb-4" style={{ letterSpacing: '-0.04em' }}>
                Your Messages<br />Stay Yours
              </h1>
              <p className="text-black/70 text-base md:text-lg max-w-md mb-8 leading-relaxed" style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>
                An automated, reward-powered decentralized messaging platform built for native privacy and effortless connection into Web3.
              </p>
              <a href="/signup" className="inline-flex items-center gap-3 bg-black text-white text-base md:text-lg font-medium pl-8 pr-2 py-2 rounded-full hover:bg-gray-800 transition-colors duration-200">
                Join us
                <span className="bg-white rounded-full p-2">
                  <ArrowRight className="w-5 h-5 text-black" />
                </span>
              </a>

              {/* Brand Marquee */}
              <div className="mt-24 w-full max-w-md overflow-hidden">
                <style>{`
                  @keyframes landing-marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
                  .landing-marquee-track { display: flex; width: max-content; animation: landing-marquee 22s linear infinite; }
                `}</style>
                <div className="landing-marquee-track">
                  {[...brandLogos, ...brandLogos].map((brand, i) => (
                    <span key={i} className="mx-7 shrink-0 text-black/60 whitespace-nowrap" style={brand.style}>{brand.name}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ INFO SECTION ═══ */}
      <section className="bg-[#F5F5F5] px-6 py-24">
        <div className="max-w-[88rem] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 items-start">
            <div>
              <h2 className="text-black text-4xl md:text-5xl font-medium leading-tight mb-8" style={{ letterSpacing: '-0.03em' }}>Meet Inbox3.</h2>
              <a href="/signup" className="inline-flex items-center gap-3 bg-black text-white text-base font-medium pl-8 pr-2 py-2 rounded-full hover:bg-gray-800 transition-colors duration-200">
                Discover it
                <span className="bg-white rounded-full p-2"><ArrowRight className="w-4 h-4 text-black" /></span>
              </a>
            </div>
            <p className="text-black/70 text-2xl md:text-3xl leading-relaxed">
              Inbox3 is a reward-earning, privacy-first messaging protocol that lets you communicate securely while building your on-chain reputation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2 rounded-2xl p-7 min-h-80 flex flex-col justify-between" style={{ backgroundImage: 'url(https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260423_164207_f243351d-ed59-48ec-83a0-a5e996bdbe3c.png&w=1280&q=85)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <h3 className="text-black text-2xl font-medium leading-snug" style={{ letterSpacing: '-0.02em' }}>Privacy that blooms</h3>
              <p className="text-black/70 text-base max-w-xs">End-to-end encryption ensures every message stays between you and your recipient.</p>
            </div>
            <div className="rounded-2xl p-7 min-h-80 flex flex-col justify-between" style={{ backgroundColor: '#2B2644' }}>
              <h3 className="text-white text-2xl font-medium leading-snug" style={{ whiteSpace: 'pre-line', letterSpacing: '-0.02em' }}>Always fluid,{'\n'}always private.</h3>
              <p className="text-white/60 text-base">Keep full control of your conversations with on-demand key management and zero lock-ins.</p>
            </div>
            <div className="rounded-2xl p-7 min-h-80 flex flex-col justify-between" style={{ backgroundColor: '#2B2644' }}>
              <h3 className="text-white text-2xl font-medium leading-snug" style={{ whiteSpace: 'pre-line', letterSpacing: '-0.02em' }}>Fully{'\n'}automated</h3>
              <p className="text-white/60 text-base">Skip the setup. Inbox3 handles encryption, delivery, and rewards running in the background for you.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ BACKED BY SECTION ═══ */}
      <section className="bg-[#F5F5F5] px-6">
        <div className="max-w-[88rem] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 items-center">
          <p className="text-black/70 text-base leading-relaxed" style={{ whiteSpace: 'pre-line' }}>
            Funded by premier partners{'\n'}and forward-thinking leaders.
          </p>
          <div className="md:col-span-3 overflow-hidden">
            <style>{`
              .backers-marquee-track { display: flex; width: max-content; animation: backers-marquee 30s linear infinite; }
            `}</style>
            <div className="backers-marquee-track">
              {[...backers, ...backers].map((b, i) => (
                <span key={i} className="mx-10 shrink-0 text-black/50 whitespace-nowrap" style={b.style}>{b.name}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ USE CASES SECTION ═══ */}
      <section className="bg-[#F5F5F5] px-6 py-24">
        <div className="max-w-[88rem] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="md:pr-12 md:pt-2">
            <p className="text-black/60 text-sm mb-2">Inbox3 in Practice</p>
            <h2 className="text-5xl md:text-6xl font-medium leading-none mb-6" style={{ letterSpacing: '-0.04em' }}>Use modes</h2>
            <p className="text-black/60 text-base leading-relaxed max-w-sm">
              Inbox3 powers a wide range of communication modes for DAOs, builders, and communities wanting secure and rewarding messaging with Web3-native privacy.
            </p>
          </div>
          <div className="relative rounded-3xl overflow-hidden min-h-[720px]">
            <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
              <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260423_183428_ab5e672a-f608-4dcb-b319-f3e040f02e2d.mp4" type="video/mp4" />
            </video>
            <div className="relative z-10 p-10 md:p-12">
              <h3 className="text-4xl md:text-5xl font-medium leading-tight mb-5" style={{ letterSpacing: '-0.03em' }}>Commerce</h3>
              <p className="text-black/70 text-base max-w-md mb-8 leading-relaxed">
                Boost customer engagement by integrating Inbox3 encrypted messaging, letting your patrons communicate securely with zero effort on your platform.
              </p>
              <button className="inline-flex items-center gap-2 group">
                <span className="text-black/70 text-base font-medium group-hover:text-black transition-colors duration-200">Know more</span>
                <span className="w-9 h-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center group-hover:bg-white transition-colors duration-200">
                  <ArrowRight className="w-4 h-4 text-black" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="bg-[#F5F5F5] px-6 pb-8 pt-16 border-t border-black/5">
        <div className="max-w-[88rem] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <LogoIcon className="w-6 h-6 text-black" />
                <span className="text-xl font-medium tracking-tight text-black">Inbox3</span>
              </div>
              <p className="text-black/50 text-sm leading-relaxed max-w-xs">
                Inbox3 — a decentralized messaging protocol built on Aptos. Secure, private, and rewarding.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-black mb-4">Product</h4>
              <ul className="space-y-2.5">
                <li><a href="#" className="text-sm text-black/50 hover:text-black transition-colors">Messaging</a></li>
                <li><a href="#" className="text-sm text-black/50 hover:text-black transition-colors">Rewards</a></li>
                <li><a href="#" className="text-sm text-black/50 hover:text-black transition-colors">Encryption</a></li>
                <li><a href="#" className="text-sm text-black/50 hover:text-black transition-colors">Bridge</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-black mb-4">Resources</h4>
              <ul className="space-y-2.5">
                <li><a href="#" className="text-sm text-black/50 hover:text-black transition-colors">Documentation</a></li>
                <li><a href="#" className="text-sm text-black/50 hover:text-black transition-colors">GitHub</a></li>
                <li><a href="#" className="text-sm text-black/50 hover:text-black transition-colors">Audits</a></li>
                <li><a href="#" className="text-sm text-black/50 hover:text-black transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-black mb-4">Connect</h4>
              <ul className="space-y-2.5">
                <li><a href="#" className="text-sm text-black/50 hover:text-black transition-colors">Twitter / X</a></li>
                <li><a href="#" className="text-sm text-black/50 hover:text-black transition-colors">Discord</a></li>
                <li><a href="#" className="text-sm text-black/50 hover:text-black transition-colors">Telegram</a></li>
                <li><a href="#" className="text-sm text-black/50 hover:text-black transition-colors">Blog</a></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-black/5 gap-4">
            <p className="text-xs text-black/40">&copy; {new Date().getFullYear()} Inbox3. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-xs text-black/40 hover:text-black transition-colors">Privacy Policy</a>
              <a href="#" className="text-xs text-black/40 hover:text-black transition-colors">Terms of Service</a>
              <a href="#" className="text-xs text-black/40 hover:text-black transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
