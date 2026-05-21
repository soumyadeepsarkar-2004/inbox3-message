import { useState } from 'react';
import { Wallet, Shield, Layers, ArrowRight, CheckCircle2, RefreshCw, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'social' | 'native'>('social');
  const [isInitializing, setIsInitializing] = useState(false);
  const [initStep, setInitStep] = useState(0);

  const initializationSteps = [
    "Verifying cryptographic identity proof...",
    "Allocating decentralized storage registers...",
    "Deploying on-chain mailbox structures to Aptos..."
  ];

  const handleAuthTransition = (target: string) => {
    setIsInitializing(true);
    setInitStep(0);
    const interval = setInterval(() => {
      setInitStep((prev) => {
        if (prev >= initializationSteps.length - 1) {
          clearInterval(interval);
          setTimeout(() => navigate(target), 800);
          return prev;
        }
        return prev + 1;
      });
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#0B0C0E] text-slate-100 font-sans relative overflow-hidden flex flex-col">
      
      {/* 1. Structural Global Header Line */}
      <header className="w-full border-b border-white/[0.05] bg-[#0B0C0E]/80 backdrop-blur-md z-50 sticky top-0">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-[#FF5A00] to-[#FF7A00] flex items-center justify-center font-mono font-bold text-black text-lg shadow-[0_0_20px_rgba(255,90,0,0.2)]">
              in3
            </div>
            <span className="font-mono tracking-wider text-lg font-bold uppercase bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Inbox3
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Aptos Testnet
            </span>
          </div>
        </div>
      </header>

      {/* Main Core Layout Split Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 grid lg:grid-cols-12 gap-12 items-center py-12 z-10">
        
        {/* Pane A: Pure Structural Brand Value Anchor */}
        <div className="lg:col-span-5 space-y-8 text-left">
          <div className="space-y-4">
            <span className="px-3 py-1 rounded-md bg-[#FF5A00]/10 border border-[#FF5A00]/20 text-[#FF5A00] font-mono text-xs uppercase tracking-widest font-semibold">
              Autonomous Communications
            </span>
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              The Sovereign Messaging Layer.
            </h1>
            <p className="text-slate-400 text-base leading-relaxed">
              Experience completely decentralized, end-to-end encrypted messaging running directly on the native framework layer of the Aptos blockchain network.
            </p>
          </div>

          <div className="space-y-4 border-t border-white/[0.05] pt-6">
            <div className="flex gap-4 items-start">
              <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.05] text-[#FF5A00] mt-0.5">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-200">Local Zero-Knowledge Encryption</h3>
                <p className="text-xs text-slate-400 mt-0.5">Payloads are entirely encrypted locally using peer public keys before transaction finalization.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.05] text-[#FF5A00] mt-0.5">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-200">SmartVector Indexing Structures</h3>
                <p className="text-xs text-slate-400 mt-0.5">Highly optimized on-chain data architecture maps gas fees to constant efficiency limits.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pane B: Clean Glassmorphic Interactive Interaction Block */}
        <div className="lg:col-span-7 flex justify-center lg:justify-end">
          <div className="w-full max-w-xl bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 lg:p-8 backdrop-blur-xl shadow-[0_24px_60px_rgba(0,0,0,0.8)] relative">
            
            {!isInitializing ? (
                <div className="space-y-6">
                  <div className="space-y-1.5">
                    <h2 className="text-xl font-bold text-white tracking-tight">Access Node Initialization</h2>
                    <p className="text-xs text-slate-400">Generate or authenticate your secure decentralized node interface mapping.</p>
                  </div>

                  <div className="grid grid-cols-2 p-1 bg-black/40 border border-white/[0.05] rounded-xl">
                    <button
                      onClick={() => setActiveTab('social')}
                      className={`py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                        activeTab === 'social' 
                          ? 'bg-gradient-to-r from-[#FF5A00] to-[#FF7A00] text-black shadow-lg font-bold' 
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Keyless Social Entry
                    </button>
                    <button
                      onClick={() => setActiveTab('native')}
                      className={`py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                        activeTab === 'native' 
                          ? 'bg-gradient-to-r from-[#FF5A00] to-[#FF7A00] text-black shadow-lg font-bold' 
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Hardware / Extension
                    </button>
                  </div>

                  <div className="min-h-[180px] flex flex-col justify-center">
                    {activeTab === 'social' ? (
                      <div className="space-y-3 w-full">
                        <button 
                          onClick={() => handleAuthTransition('/keyless')}
                          className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-[#FF5A00]/40 hover:bg-white/[0.05] transition-all duration-200 group text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-5 w-5 flex items-center justify-center font-bold text-sm border border-white/20 rounded-md bg-white/5 text-white">G</div>
                            <span className="text-sm font-medium text-slate-200">Continue via Google Authentication</span>
                          </div>
                          <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-[#FF5A00] transition-colors" />
                        </button>
                        
                        <button 
                          onClick={() => handleAuthTransition('/keyless')}
                          className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-[#FF5A00]/40 hover:bg-white/[0.05] transition-all duration-200 group text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-5 w-5 flex items-center justify-center font-bold text-sm border border-white/20 rounded-md bg-white/5 text-white">A</div>
                            <span className="text-sm font-medium text-slate-200">Continue via Apple Credentials</span>
                          </div>
                          <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-[#FF5A00] transition-colors" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3 w-full">
                        <button 
                          onClick={() => navigate('/wallet')}
                          className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-[#FF5A00]/40 hover:bg-[#FF5A00]/5 transition-all duration-200 group text-left"
                        >
                          <div className="flex items-center gap-3">
                            <Wallet className="h-5 w-5 text-slate-400 group-hover:text-[#FF5A00]" />
                            <span className="text-sm font-medium text-slate-200">Connect Petra Extension Wallet</span>
                          </div>
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400">Detected</span>
                        </button>
                        
                        <button 
                          onClick={() => navigate('/wallet')}
                          className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-[#FF5A00]/40 hover:bg-[#FF5A00]/5 transition-all duration-200 group text-left opacity-60"
                        >
                          <div className="flex items-center gap-3">
                            <Wallet className="h-5 w-5 text-slate-400" />
                            <span className="text-sm font-medium text-slate-200">Connect Martian Wallet Adapter</span>
                          </div>
                          <ArrowRight className="h-4 w-4 text-slate-600" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="text-center">
                    <p className="text-[11px] text-slate-500 font-mono">
                      By accessing this network registry node, you validate execution of distributed AIP specifications.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-6 space-y-8 flex flex-col items-center text-center">
                  <div className="relative flex items-center justify-center h-16 w-16">
                    <div className="absolute inset-0 rounded-full border-2 border-t-[#FF5A00] border-r-transparent border-b-transparent border-l-transparent animate-spin duration-700" />
                    <Shield className="h-6 w-6 text-[#FF5A00] animate-pulse" />
                  </div>

                  <div className="space-y-4 w-full max-w-sm">
                    <div className="space-y-1">
                      <h3 className="text-md font-semibold text-white">Generating Genesis Credentials</h3>
                      <p className="text-xs text-slate-400 font-mono tracking-tight">Initializing secure decentralized session context...</p>
                    </div>

                    <div className="space-y-2.5 text-left border border-white/[0.04] bg-black/30 rounded-xl p-4 font-mono text-[11px]">
                      {initializationSteps.map((step, idx) => (
                        <div key={idx} className="flex items-center gap-2.5">
                          {initStep > idx ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          ) : initStep === idx ? (
                            <RefreshCw className="h-3.5 w-3.5 text-[#FF5A00] animate-spin shrink-0" />
                          ) : (
                            <div className="h-3.5 w-3.5 rounded-full border border-white/20 shrink-0" />
                          )}
                          <span className={initStep === idx ? "text-[#FF5A00]" : initStep > idx ? "text-slate-300" : "text-slate-600"}>
                            {step}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

          </div>
        </div>
      </main>

      <footer className="w-full border-t border-white/[0.04] bg-black/20 py-4 z-10 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-[10px] text-slate-500">
          <div>© 2026 Inbox3 Protocol. All sovereign rights reserved.</div>
          <div className="flex gap-6">
            <a href="#explorer" className="hover:text-slate-300 transition-colors flex items-center gap-1">Contract Explorer <ExternalLink className="h-3 w-3" /></a>
            <a href="#docs" className="hover:text-slate-300 transition-colors">Technical Architecture Specification</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
