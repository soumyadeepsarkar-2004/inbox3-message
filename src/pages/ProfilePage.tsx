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
    <main className="min-h-screen bg-black text-white selection:bg-white/30 p-4 lg:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-12"
        >
          <div className="flex items-center gap-2">
            <Circle className="fill-white text-white w-5 h-5" />
            <span className="text-lg font-semibold tracking-tight">Inbox3</span>
          </div>
          <div className="flex items-center gap-2 text-white/40 text-sm">
            <span>Step 3 of 3</span>
            <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="w-full h-full bg-gradient-brand rounded-full" />
            </div>
          </div>
        </motion.div>

        {/* Main Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-medium tracking-tight">Finalize Your Profile</h1>
            <p className="text-white/50">Complete your identity to start messaging</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center space-y-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative w-32 h-32 rounded-full bg-brand-gray flex items-center justify-center cursor-pointer overflow-hidden group"
                onClick={() => fileInputRef.current?.click()}
              >
                {avatar ? (
                  <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-white/30" />
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
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
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Display Name</label>
              <input
                type="text"
                placeholder={displayName}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-brand-gray border-none rounded-xl h-12 px-4 text-white placeholder:text-white/30 focus:ring-2 focus:ring-white/20 focus:outline-none transition-all duration-200"
                required
              />
            </div>

            {/* Bio Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Bio <span className="text-white/30">(optional)</span></label>
              <textarea
                placeholder="Tell others about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full bg-brand-gray border-none rounded-xl p-4 text-white placeholder:text-white/30 focus:ring-2 focus:ring-white/20 focus:outline-none transition-all duration-200 resize-none"
              />
              <p className="text-xs text-white/30">{bio.length}/160 characters</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !name}
              className="w-full h-14 bg-white text-black font-semibold rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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