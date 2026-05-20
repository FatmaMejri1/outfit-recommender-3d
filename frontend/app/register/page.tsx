'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import { Sparkles, Loader2 } from 'lucide-react'

export default function RegisterPage() {
  const { login } = useAuth()
  const router = useRouter()

  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!displayName || !email || !password) return
    setError('')
    setLoading(true)
    try {
      const data: any = await api.post('/api/auth/register', {
        display_name: displayName,
        email,
        password
      })
      login(data.token, data.user)
      router.push('/')
    } catch (err: any) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 page-enter">
      <div className="glass w-full max-w-md p-8 rounded-3xl space-y-6 shadow-2xl border-white/5 glow-brand">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center mx-auto">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Create Account</h1>
          <p className="text-sm text-white/40">Step into the future of fashion virtual try-ons</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-white/50">Display Name</label>
            <input
              id="register-name"
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="e.g. Ali Salah"
              className="input-field"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-white/50">Email Address</label>
            <input
              id="register-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="e.g. ali@demo.com"
              className="input-field"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-white/50">Password</label>
            <input
              id="register-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              className="input-field"
              required
            />
          </div>

          {error && <p className="text-red-400 text-xs text-center">{error}</p>}

          <button
            id="register-submit"
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Register Now'}
          </button>
        </form>

        <div className="text-center text-xs text-white/30">
          Already have an account? <Link href="/login" className="text-brand-400 hover:underline">Sign in</Link>
        </div>
      </div>
    </div>
  )
}
