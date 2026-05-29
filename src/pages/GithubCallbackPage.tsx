import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function GithubCallbackPage() {
  const [status, setStatus] = useState('Processing GitHub sign-in...')
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const state = params.get('state')
    const storedState = sessionStorage.getItem('github_oauth_state')
    const timers: ReturnType<typeof setTimeout>[] = []

    if (!code) {
      setStatus('No authorization code received. Redirecting...')
      timers.push(setTimeout(() => navigate('/signup'), 2000))
      return
    }

    if (state && state !== storedState) {
      setStatus('State mismatch. Please try again.')
      timers.push(setTimeout(() => navigate('/signup'), 2000))
      return
    }

    sessionStorage.removeItem('github_oauth_state')
    sessionStorage.setItem('github_oauth_code', code)

    setStatus('GitHub authentication successful! Redirecting...')
    timers.push(setTimeout(() => {
      navigate('/profile')
    }, 500))

    return () => timers.forEach(clearTimeout)
  }, [navigate])

  return (
    <main className="flex min-h-screen w-full bg-black items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-white/5 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
        <h1 className="text-xl font-medium text-white mb-2">Authenticating</h1>
        <p className="text-sm text-white/50">{status}</p>
      </div>
    </main>
  )
}
