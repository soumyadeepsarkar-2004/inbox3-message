import { useState } from 'react'
import { motion } from 'framer-motion'
import { Circle, Eye, EyeOff, ArrowRight, Globe, Code } from 'lucide-react'
import { Link } from 'react-router-dom'

interface StepItemProps {
  number: number
  text: string
  active?: boolean
}

function StepItem({ number, text, active }: StepItemProps) {
  return (
    <div className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${active ? 'bg-white text-black border border-white' : 'bg-brand-gray text-white border-none'}`}>
      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium ${active ? 'bg-black text-white' : 'bg-white/10 text-white/40'}`}>
        {number}
      </span>
      <span className="text-sm font-medium">{text}</span>
    </div>
  )
}

interface SocialButtonProps {
  icon: React.ReactNode
  label: string
}

function SocialButton({ icon, label }: SocialButtonProps) {
  return (
    <button className="flex items-center justify-center gap-3 w-full h-12 bg-black border border-white/10 rounded-xl hover:bg-white/5 transition-colors duration-200">
      {icon}
      <span className="text-sm font-medium text-white/80">{label}</span>
    </button>
  )
}

interface InputGroupProps {
  label: string
  placeholder: string
  type?: string
  trailing?: React.ReactNode
}

function InputGroup({ label, placeholder, type = 'text', trailing }: InputGroupProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-white">{label}</label>
      <div className="relative">
        <input
          type={type}
          placeholder={placeholder}
          className="w-full bg-brand-gray border-none rounded-xl h-11 px-4 text-white placeholder:text-white/20 focus:ring-2 focus:ring-white/20 focus:outline-none transition-all duration-200"
        />
        {trailing && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {trailing}
          </div>
        )}
      </div>
    </div>
  )
}

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <main className="flex min-h-screen w-full bg-black selection:bg-white/30 p-2 transition-all duration-500 lg:h-screen lg:overflow-hidden lg:p-4">
      {/* Left Column - Hero */}
      <div className="hidden lg:flex w-[52%] relative flex-col items-center justify-end pb-32 px-12 rounded-3xl overflow-hidden shadow-2xl h-full">
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260506_081238_406ed0e3-5d83-436e-a512-0bbff7ec5b95.mp4" type="video/mp4" />
        </video>

        <motion.div
          className="z-10 w-full max-w-xs space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.15, delayChildren: 0.2 }}
        >
          <motion.div className="flex items-center gap-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Circle className="fill-white text-white w-6 h-6" />
            <span className="text-xl font-semibold tracking-tight text-white">Inbox3</span>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h2 className="text-4xl font-medium tracking-tight whitespace-nowrap text-white">Join Inbox3</h2>
            <p className="text-white/60 text-sm leading-relaxed px-4 mt-2">
              Follow these 3 quick phases to activate your decentralized identity.
            </p>
          </motion.div>

          <motion.div className="space-y-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <StepItem number={1} text="Register your identity" active />
            <StepItem number={2} text="Connect your wallet" />
            <StepItem number={3} text="Finalize your profile" />
          </motion.div>
        </motion.div>
      </div>

      {/* Right Column - Form */}
      <div className="flex-1 flex flex-col items-center justify-center py-12 lg:py-6 px-4 sm:px-12 lg:px-16 xl:px-24 overflow-y-auto lg:overflow-hidden">
        <motion.div
          className="w-full max-w-xl space-y-8 lg:space-y-6 sm:space-y-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div>
            <h1 className="text-3xl font-medium tracking-tight text-white">Create New Profile</h1>
            <p className="text-white/40 text-sm mt-1">Input your basic details to begin the journey.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <SocialButton icon={<Globe className="w-5 h-5 text-white/80" />} label="Google" />
            <SocialButton icon={<Code className="w-5 h-5 text-white/80" />} label="GitHub" />
          </div>

          <div className="relative flex items-center">
            <div className="flex-1 h-px bg-white/10" />
            <span className="bg-black px-4 text-xs font-medium text-white/40 uppercase tracking-widest">Or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InputGroup label="First Name" placeholder="John" />
              <InputGroup label="Last Name" placeholder="Doe" />
            </div>
            <InputGroup label="Email" placeholder="john@example.com" type="email" />
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full bg-brand-gray border-none rounded-xl h-11 px-4 pr-11 text-white placeholder:text-white/20 focus:ring-2 focus:ring-white/20 focus:outline-none transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-white/30">Requires at least 8 symbols.</p>
            </div>

            <button
              type="submit"
              className="w-full h-14 bg-white text-black font-semibold rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all duration-200 mt-4 flex items-center justify-center gap-2"
            >
              Create Account
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-sm text-white/40">
            Member of the team?{' '}
            <Link to="/app" className="text-white hover:text-white/80 transition-colors font-medium">
              Log in
            </Link>
          </p>
        </motion.div>
      </div>
    </main>
  )
}