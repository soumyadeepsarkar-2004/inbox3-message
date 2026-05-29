import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Camera, Upload, User, Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from 'sonner'

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
    try {
      await finalizeProfile({ name, bio: bio || undefined, avatar: avatar || undefined })
      navigate('/app')
    } catch {
      toast.error('Failed to save profile')
    }
  }

  const displayName = user?.name || user?.email?.split('@')[0] || 'User'

  return (
    <main className="min-h-screen bg-[#F5F5F5] text-black selection:bg-black/10 p-4 lg:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-12"
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-black flex items-center justify-center text-xs font-bold text-white shadow-sm">i3</div>
            <span className="text-lg font-semibold tracking-tight text-black">Inbox3</span>
          </div>
          <div className="flex items-center gap-2 text-black/40 text-sm">
            <span>Step 3 of 3</span>
            <div className="w-16 h-1 bg-black/10 rounded-full overflow-hidden">
              <div className="w-full h-full bg-black rounded-full" />
            </div>
          </div>
        </motion.div>

        {/* Main Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8 bg-white p-8 sm:p-12 rounded-[2rem] shadow-sm border border-black/5"
        >
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-medium tracking-tight">Finalize Your Profile</h1>
            <p className="text-black/50">Complete your identity to start messaging</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center space-y-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative w-32 h-32 rounded-full bg-[#F5F5F5] border border-black/10 flex items-center justify-center cursor-pointer overflow-hidden group shadow-sm"
                onClick={() => fileInputRef.current?.click()}
              >
                {avatar ? (
                  <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-black/20" />
                )}
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-6 h-6 text-black/50" />
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
                className="flex items-center gap-2 text-sm text-black/50 hover:text-black transition-colors"
              >
                <Upload className="w-4 h-4" />
                Upload Avatar
              </button>
            </div>

            {/* Name Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-black/80">Display Name</label>
              <input
                type="text"
                placeholder={displayName}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#F5F5F5] border border-black/5 rounded-xl h-12 px-4 text-black placeholder:text-black/30 focus:ring-2 focus:ring-black/10 focus:border-black/20 focus:outline-none transition-all duration-200"
                required
              />
            </div>

            {/* Bio Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-black/80">Bio <span className="text-black/30">(optional)</span></label>
              <textarea
                placeholder="Tell others about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full bg-[#F5F5F5] border border-black/5 rounded-xl p-4 text-black placeholder:text-black/30 focus:ring-2 focus:ring-black/10 focus:border-black/20 focus:outline-none transition-all duration-200 resize-none"
              />
              <p className="text-xs text-black/40">{bio.length}/160 characters</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !name}
              className="w-full h-14 bg-black text-white font-semibold rounded-xl hover:bg-black/90 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
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
              className="w-full text-center text-sm text-black/40 hover:text-black/60 transition-colors"
            >
              Skip for now
            </button>
          </form>
        </motion.div>
      </div>
    </main>
  )
}