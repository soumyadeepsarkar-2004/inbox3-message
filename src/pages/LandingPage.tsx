import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronDown, Menu, X } from 'lucide-react'
import { CDN_URLS } from '../constants'

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
      <button type="button" onClick={() => setOpen(!open)} className="flex items-center gap-1 text-base text-gray-700 hover:text-black font-medium transition-colors duration-200">
        {label}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 rounded-xl bg-white border border-black/5 shadow-lg shadow-black/5 overflow-hidden">
          {items.map((item) =>
            item.href ? (
              item.href.startsWith('/') ? (
                <Link key={item.label} to={item.href} className="block px-4 py-2.5 text-sm text-gray-700 hover:text-black hover:bg-black/5 transition-colors duration-200">
                  {item.label}
                </Link>
              ) : (
                <a key={item.label} href={item.href} className="block px-4 py-2.5 text-sm text-gray-700 hover:text-black hover:bg-black/5 transition-colors duration-200">
                  {item.label}
                </a>
              )
            ) : (
              <span key={item.label} className="block px-4 py-2.5 text-sm text-gray-500 cursor-default">
                {item.label}
              </span>
            )
          )}
        </div>
      )}
    </div>
  )
}

const brandLogos = [
  { name: 'APTOS', style: { fontFamily: 'Inter, sans-serif', fontWeight: 800, letterSpacing: '0.05em', fontSize: '15px' } },
  { name: 'PETRA', style: { fontFamily: 'Inter, sans-serif', fontWeight: 700, letterSpacing: '0.08em', fontSize: '14px' } },
  { name: 'PONTEM', style: { fontFamily: 'Inter, sans-serif', fontWeight: 600, letterSpacing: '0.05em', fontSize: '14px' } },
  { name: 'THALA', style: { fontFamily: 'Inter, sans-serif', fontWeight: 800, letterSpacing: '0.1em', fontSize: '13px' } },
  { name: 'ARIES', style: { fontFamily: 'Inter, sans-serif', fontWeight: 700, letterSpacing: '0.02em', fontSize: '15px' } },
  { name: 'ECONIA', style: { fontFamily: 'Inter, sans-serif', fontWeight: 600, letterSpacing: '0.12em', fontSize: '14px' } },
  { name: 'MARTIAN', style: { fontFamily: 'Inter, sans-serif', fontWeight: 700, letterSpacing: '0.04em', fontSize: '14px' } },
]

const backers = [
  { name: 'Aptos Foundation', style: { fontFamily: 'Inter, sans-serif', fontWeight: 600, letterSpacing: '0.02em', fontSize: '15px' } },
  { name: 'Binance Labs', style: { fontFamily: 'Inter, sans-serif', fontWeight: 700, letterSpacing: '0.05em', fontSize: '15px' } },
  { name: 'Multicoin Capital', style: { fontFamily: 'Inter, sans-serif', fontWeight: 700, letterSpacing: '0.02em', fontSize: '15px' } },
  { name: 'Jump Crypto', style: { fontFamily: 'Inter, sans-serif', fontWeight: 600, letterSpacing: '0.05em', fontSize: '16px' } },
  { name: 'Dragonfly', style: { fontFamily: 'Inter, sans-serif', fontWeight: 700, letterSpacing: '0.01em', fontSize: '15px' } },
  { name: 'a16z crypto', style: { fontFamily: 'Inter, sans-serif', fontWeight: 800, letterSpacing: '-0.02em', fontSize: '15px' } },
  { name: 'ParaFi', style: { fontFamily: 'Inter, sans-serif', fontWeight: 700, letterSpacing: '0.04em', fontSize: '15px' } },
  { name: 'Circle Ventures', style: { fontFamily: 'Inter, sans-serif', fontWeight: 600, letterSpacing: '0.02em', fontSize: '14px' } },
]

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileMenuOpen])

  const mobileNavItems = [
    { label: 'Network', items: ['Explorer', 'Bridge', 'Staking', 'Nodes'] },
    { label: 'Ecosystem', items: ['DApps', 'Developers', 'Integrations', 'Partners'] },
    { label: 'Rewards', items: ['Staking Rewards', 'Airdrops', 'Referral Program'] },
    { label: 'Help', items: ['Documentation', 'FAQ', 'Support', 'Community'] },
  ]

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
                { label: 'Explorer', href: '/docs' },
                { label: 'Bridge', href: '' },
                { label: 'Staking', href: '/docs#staking' },
                { label: 'Nodes', href: '/docs#nodes' },
              ]} />
              <NavDropdown label="Ecosystem" items={[
                { label: 'DApps', href: '' },
                { label: 'Developers', href: '/docs#sdk' },
                { label: 'Integrations', href: '' },
                { label: 'Partners', href: '' },
              ]} />
              <NavDropdown label="Rewards" items={[
                { label: 'Staking Rewards', href: '/docs#rewards' },
                { label: 'Airdrops', href: '' },
                { label: 'Referral Program', href: '' },
              ]} />
              <NavDropdown label="Help" items={[
                { label: 'Documentation', href: '/docs' },
                { label: 'FAQ', href: '/docs#faq' },
                { label: 'Support', href: 'mailto:support@inbox3.io' },
                { label: 'Community', href: '' },
              ]} />
              <span className="text-base text-gray-700 font-medium cursor-default">News</span>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/signup" className="hidden md:inline-flex bg-black text-white text-base font-medium px-7 py-2.5 rounded-full hover:bg-gray-800 transition-colors duration-200">
                Open Wallet
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open menu"
                className="md:hidden p-2 rounded-lg hover:bg-black/5 transition-colors"
              >
                <Menu className="w-6 h-6 text-black" />
              </button>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <div className="flex-1 px-6 pt-20 pb-6 flex items-end">
          <div className="relative w-full rounded-2xl overflow-hidden" style={{ height: 'calc(100vh - 96px)' }}>
            <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
              <source src={CDN_URLS.landingHeroVideo} type="video/mp4" />
            </video>

            <div className="relative z-10 flex flex-col items-start justify-start h-full p-12 pt-36">
              <h1 className="text-black text-5xl md:text-6xl font-medium leading-tight max-w-xl mb-4" style={{ letterSpacing: '-0.04em' }}>
                Your Messages<br />Stay Yours
              </h1>
              <p className="text-black/70 text-base md:text-lg max-w-md mb-8 leading-relaxed" style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>
                An automated, reward-powered decentralized messaging platform built for native privacy and effortless connection into Web3.
              </p>
              <Link to="/signup" className="inline-flex items-center gap-3 bg-black text-white text-base md:text-lg font-medium pl-8 pr-2 py-2 rounded-full hover:bg-gray-800 transition-colors duration-200">
                Join us
                <span className="bg-white rounded-full p-2">
                  <ArrowRight className="w-5 h-5 text-black" />
                </span>
              </Link>

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
            <div className="lg:col-span-2 rounded-2xl p-7 min-h-80 flex flex-col justify-between" style={{ backgroundImage: `url(${CDN_URLS.landingBgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
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
              <source src={CDN_URLS.landingUseCasesVideo} type="video/mp4" />
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
      <footer className="bg-black text-white px-6 py-20 mt-12 rounded-t-[3rem] mx-2">
        <div className="max-w-[88rem] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-16 mb-24">
            <div className="max-w-sm">
              <div className="flex items-center gap-2 mb-6">
                <LogoIcon className="w-8 h-8 text-white" />
                <span className="text-3xl font-medium tracking-tight text-white">Inbox3</span>
              </div>
              <p className="text-white/60 text-lg leading-relaxed mb-8">
                The ultimate decentralized messaging protocol. Built natively on Aptos for uncompromising privacy and seamless Web3 connection.
              </p>
              <div className="flex items-center gap-4">
                <a href="#" className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.004 3.916H5.078z"/></svg>
                </a>
                <a href="#" className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"/></svg>
                </a>
                <a href="#" className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a5.96 5.96 0 0 0-1.5 1.678c-.28.455-.497.962-.638 1.488-.14.525-.213 1.071-.213 1.624v.21h-2.1v2.1h2.1v3.36h-2.1v2.1h2.1v4.62h2.1v-4.62h2.52v-2.1h-2.52v-3.36h3.78l1.05-2.1h-4.83v-.21c0-.42.073-.82.21-1.19.14-.37.33-.7.56-1.002.23-.298.513-.56.84-.77.315-.228.67-.402 1.05-.515.385-.115.8-.175 1.225-.175h2.1V1.26h-2.52c-.665 0-1.312.087-1.942.245a5.81 5.81 0 0 0-1.663.665z"/></svg>
                </a>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-12 lg:gap-24">
              <div>
                <h4 className="text-white text-lg font-medium mb-6 tracking-tight">Platform</h4>
                <ul className="space-y-4">
                  <li><Link to="/login" className="text-white/50 hover:text-white transition-colors text-base">Messaging App</Link></li>
                  <li><a href="#" className="text-white/50 hover:text-white transition-colors text-base">Keyless Login</a></li>
                  <li><a href="#" className="text-white/50 hover:text-white transition-colors text-base">Encryption</a></li>
                  <li><a href="#" className="text-white/50 hover:text-white transition-colors text-base">Staking</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white text-lg font-medium mb-6 tracking-tight">Developers</h4>
                <ul className="space-y-4">
                  <li><Link to="/docs" className="text-white/50 hover:text-white transition-colors text-base">Documentation</Link></li>
                  <li><a href="https://github.com/soumyadeepsarkar-2004/inbox3-message" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white transition-colors text-base">GitHub</a></li>
                  <li><Link to="/docs#sdk" className="text-white/50 hover:text-white transition-colors text-base">SDK</Link></li>
                  <li><a href="https://aptosfoundation.org/grants" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white transition-colors text-base">Grants</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white text-lg font-medium mb-6 tracking-tight">Ecosystem</h4>
                <ul className="space-y-4">
                  <li><a href="#" className="text-white/50 hover:text-white transition-colors text-base">Partners</a></li>
                  <li><a href="#" className="text-white/50 hover:text-white transition-colors text-base">Aptos Foundation</a></li>
                  <li><a href="#" className="text-white/50 hover:text-white transition-colors text-base">Wallets</a></li>
                  <li><a href="#" className="text-white/50 hover:text-white transition-colors text-base">Explorers</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/10 gap-4">
            <p className="text-sm text-white/40">&copy; {new Date().getFullYear()} Inbox3. All rights reserved.</p>
            <div className="flex items-center gap-8">
              <Link to="/privacy" className="text-sm text-white/40 hover:text-white transition-colors">Privacy</Link>
              <Link to="/terms" className="text-sm text-white/40 hover:text-white transition-colors">Terms</Link>
              <Link to="/docs#security" className="text-sm text-white/40 hover:text-white transition-colors">Security</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute top-0 right-0 bottom-0 w-72 max-w-[80vw] bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-5 border-b border-black/5">
              <div className="flex items-center gap-2">
                <LogoIcon className="w-6 h-6 text-black" />
                <span className="text-lg font-medium tracking-tight text-black">Inbox3</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
                className="p-1.5 rounded-lg hover:bg-black/5 transition-colors"
              >
                <X className="w-5 h-5 text-black" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
              {mobileNavItems.map((cat) => (
                <div key={cat.label}>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2 font-medium">{cat.label}</p>
                  <div className="space-y-1">
                    {cat.items.map((item) => (
                      <Link
                        key={item}
                        to={`/${cat.label === 'Help' && item === 'Documentation' ? 'docs' : cat.label === 'Help' && item === 'FAQ' ? 'docs#faq' : '#'}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-2 text-sm text-gray-700 hover:text-black hover:bg-black/5 rounded-lg transition-colors"
                      >
                        {item}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
              <hr className="border-black/5" />
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center bg-black text-white text-sm font-medium px-6 py-3 rounded-full hover:bg-gray-800 transition-colors"
              >
                Open Wallet
              </Link>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center text-sm font-medium px-6 py-3 rounded-full border border-black/10 hover:bg-black/5 transition-colors text-gray-700"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
