import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Circle, Camera, Upload, User, Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProfilePage() {
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [avatar, setAvatar] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { finalizeProfile, loading, user } = useAuth()
  const navigate = useNavigate()

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => setAvatar(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) return
    await finalizeProfile({ name, bio: bio || undefined, avatar: avatar || undefined })
    navigate('/app')
  }

  const displayName = user?.name || user?.email?.split('@')[0] || 'User'

  return (
    <main className="flex min-h-screen w-full bg-black selection:bg-white/30 p-2 transition-all duration-500 lg:h-screen lg:overflow-hidden lg:p-4">
      {/* Left Column */}
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
            <span className="text-xl font-semibold tracking-tight">Inbox3</span>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h2 className="text-4xl font-medium tracking-tight whitespace-nowrap">Almost There</h2>
            <p className="text-white/60 text-sm leading-relaxed px-4 mt-2">
              Follow these 3 quick phases to activate your space.
            </p>
          </motion.div>

          <motion.div className="space-y-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <StepItem number={1} text="Register your identity" />
            <StepItem number={2} text="Configure your studio" />
            <StepItem number={3} text="Finalize your profile" active />
          </motion.div>
        </motion.div>
      </div>

      {/* Right Column */}
      <div className="flex-1 flex flex-col items-center justify-center py-12 lg:py-6 px-4 sm:px-12 lg:px-16 xl:px-24 overflow-y-auto lg:overflow-hidden">
        <motion.div
          className="w-full max-w-xl space-y-8 lg:space-y-6 sm:space-y-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className="text-left space-y-1">
            <h1 className="text-3xl font-medium tracking-tight">Finalize Your Profile</h1>
            <p className="text-white/40 text-sm mt-1">Complete your identity to start messaging</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 w-full relative">
            {/* Avatar Upload */}
            <div className="flex flex-col items-start space-y-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer overflow-hidden group"
                onClick={() => fileInputRef.current?.click()}
              >
                {avatar ? (
                  <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-white/30" />
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              </motion.div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
              >
                <Upload className="w-4 h-4" />
                Upload Avatar
              </button>
            </div>

            {/* Name Input */}
            <div className="space-y-2 w-full">
              <label className="text-sm font-medium text-white">Display Name</label>
              <input
                type="text"
                placeholder={displayName}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#1A1A1A] border-none rounded-xl h-12 px-4 text-white placeholder:text-white/30 focus:ring-2 focus:ring-white/20 focus:outline-none transition-all duration-200"
                required
              />
            </div>

            {/* Bio Input */}
            <div className="space-y-2 w-full">
              <label className="text-sm font-medium text-white">Bio <span className="text-white/30">(optional)</span></label>
              <textarea
                placeholder="Tell others about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full bg-[#1A1A1A] border-none rounded-xl p-4 text-white placeholder:text-white/30 focus:ring-2 focus:ring-white/20 focus:outline-none transition-all duration-200 resize-none"
              />
              <p className="text-xs text-white/30">{bio.length}/160 characters</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !name}
              className="w-full h-14 bg-white text-black font-semibold rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  Complete Setup
                  <Check className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Skip Link */}
            <button
              type="button"
              onClick={() => navigate('/app')}
              className="w-full text-center text-sm text-white/40 hover:text-white/60 transition-colors"
            >
              Skip for now
            </button>
          </form>
        </motion.div>
      </div>
    </main>
  )
}

function StepItem({ number, text, active }: { number: number; text: string; active?: boolean }) {
  return (
    <div className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${active ? 'bg-white text-black border border-white' : 'bg-brand-gray text-white border-none'}`}>
      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium ${active ? 'bg-black text-white' : 'bg-white/10 text-white/40'}`}>
        {number}
      </span>
      <span className="text-sm font-medium">{text}</span>
    </div>
  )
}