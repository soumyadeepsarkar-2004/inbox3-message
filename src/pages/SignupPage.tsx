import { useState, type ReactNode, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { CDN_URLS } from '../constants'

function StepItem({ number, text, active }: { number: number; text: string; active?: boolean }) {
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
        active
          ? 'bg-black text-white shadow-md'
          : 'bg-white text-black/60 border border-black/5'
      }`}
    >
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium ${
          active ? 'bg-white text-black' : 'bg-black/5 text-black/40'
        }`}
      >
        {number}
      </div>
      <span className="text-sm font-medium">{text}</span>
    </div>
  )
}

function SocialButton({ icon, label, onClick, disabled }: { icon: ReactNode; label: string; onClick?: () => void; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white border border-black/10 hover:bg-black/5 transition-all duration-200 shadow-sm disabled:opacity-50 text-black">
      {icon}
      <span className="text-sm font-medium text-black">{label}</span>
    </button>
  )
}

function InputGroup({
  label, placeholder, type, value, onChange, error
}: {
  label: string
  placeholder: string
  type: string
  value: string
  onChange: (v: string) => void
  error?: string
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-black/80">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white border border-black/10 rounded-xl h-11 px-4 text-black placeholder:text-black/30 focus:ring-2 focus:ring-black/10 focus:border-black/20 focus:outline-none transition-all duration-200 shadow-sm"
      />
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  )
}

export default function SignupPage() {
  const navigate = useNavigate()
  const { signupWithEmail, connectWithGoogle, connectWithGithub, loading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!firstName.trim()) errs.firstName = 'First name is required'
    if (!lastName.trim()) errs.lastName = 'Last name is required'
    if (!email.trim()) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Invalid email format'
    if (!password) errs.password = 'Password is required'
    else if (password.length < 8) errs.password = 'At least 8 characters required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    await signupWithEmail(email, password, `${firstName} ${lastName}`)
    navigate('/profile')
  }

  const handleGoogle = async () => {
    await connectWithGoogle()
    navigate('/profile')
  }

  const handleGithub = async () => {
    await connectWithGithub()
  }

  return (
    <main className="flex min-h-screen w-full bg-[#F5F5F5] selection:bg-black/10 p-2 transition-all duration-500 lg:h-screen lg:overflow-hidden lg:p-4">
      {/* Left Column — Hero */}
      <div className="hidden lg:flex relative flex-col items-center justify-end pb-32 px-12 rounded-[2rem] overflow-hidden shadow-xl h-full w-[52%]">
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
          <source
            src={CDN_URLS.heroVideo}
            type="video/mp4"
          />
        </video>

        <motion.div
          className="relative z-10 w-full max-w-xs space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.15, delayChildren: 0.2 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2"
          >
            <div className="w-6 h-6 rounded bg-black flex items-center justify-center text-xs font-bold text-white shadow-md">i3</div>
            <span className="text-xl font-semibold tracking-tight text-white drop-shadow-md">Inbox3</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl font-medium tracking-tight whitespace-nowrap text-white drop-shadow-md">Join Inbox3</h2>
            <p className="text-white/80 text-sm leading-relaxed px-4 mt-2 drop-shadow">
              Follow these 3 quick phases to activate your space.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20"
          >
            <StepItem number={1} text="Register your identity" active />
            <StepItem number={2} text="Configure your studio" />
            <StepItem number={3} text="Finalize your profile" />
          </motion.div>
        </motion.div>
      </div>

      {/* Right Column — Form */}
      <div className="flex-1 flex flex-col items-center justify-center py-12 lg:py-6 px-4 sm:px-12 lg:px-16 xl:px-24 overflow-y-auto lg:overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="w-full max-w-xl space-y-8 lg:space-y-6 sm:space-y-10"
        >
          <div className="space-y-2">
            <h1 className="text-3xl font-medium tracking-tight text-black">Create New Profile</h1>
            <p className="text-black/50 text-sm">Input your basic details to begin the journey.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <SocialButton icon={<span className="w-4 h-4 flex items-center justify-center font-bold text-xs border border-black/20 rounded bg-black/5 text-black">G</span>} label="Google" onClick={handleGoogle} disabled={loading} />
            <SocialButton icon={<span className="w-4 h-4 flex items-center justify-center font-bold text-xs border border-black/20 rounded bg-black/5 text-black">GH</span>} label="Github" onClick={handleGithub} disabled={loading} />
          </div>

          <div className="relative flex items-center">
            <div className="flex-1 h-px bg-black/10" />
            <span className="bg-[#F5F5F5] px-4 text-xs font-semibold text-black/40 uppercase tracking-widest">Or</span>
            <div className="flex-1 h-px bg-black/10" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputGroup label="First Name" placeholder="First name" type="text" value={firstName} onChange={setFirstName} error={errors.firstName} />
              <InputGroup label="Last Name" placeholder="Last name" type="text" value={lastName} onChange={setLastName} error={errors.lastName} />
            </div>
            <InputGroup label="Email" placeholder="Email" type="email" value={email} onChange={setEmail} error={errors.email} />

            <div className="space-y-2">
              <label className="text-sm font-medium text-black/80">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-black/10 rounded-xl h-11 px-4 pr-11 text-black placeholder:text-black/30 focus:ring-2 focus:ring-black/10 focus:border-black/20 focus:outline-none transition-all duration-200 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black/80 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-0.5">{errors.password}</p>}
              {!errors.password && <p className="text-xs text-black/40 mt-1">Requires at least 8 symbols.</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-black text-white font-semibold rounded-xl hover:bg-black/90 active:scale-[0.98] transition-all duration-200 mt-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-black/50">
            Member of the team?{' '}
            <Link to="/login" className="text-black hover:text-black/80 transition-colors font-medium">
              Log in
            </Link>
          </p>
        </motion.div>
      </div>
    </main>
  )
}
