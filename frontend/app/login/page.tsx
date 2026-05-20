'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import { Sparkles, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    setError('')
    setLoading(true)
    try {
      const data: any = await api.post('/api/auth/login', { email, password })
      login(data.token, data.user)
      router.push(redirect)
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleBypassLogin = async (bypassEmail: string) => {
    setError('')
    setLoading(true)
    try {
      const data: any = await api.post('/api/auth/login', { email: bypassEmail, password: 'demo1234' })
      login(data.token, data.user)
      router.push(redirect)
    } catch (err: any) {
      setError(err.message || 'Bypass login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 page-enter bg-[#f8f7f5]">
      <div className="bg-white w-full max-w-md p-10 space-y-8 border border-black/10 shadow-sm">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 bg-black flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6 text-white stroke-[1.5]" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-black uppercase tracking-widest mt-4">Welcome Back</h1>
          <p className="text-xs text-black/60 tracking-wide uppercase">Sign in to manage your wardrobe</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-black uppercase tracking-widest">Email Address</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="e.g. ali@demo.com"
              className="input-field bg-[#f4f4f2] border-black/10 focus:border-black"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-black uppercase tracking-widest">Password</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-field bg-[#f4f4f2] border-black/10 focus:border-black"
              required
            />
          </div>

          {error && <p className="text-red-500 text-xs font-semibold uppercase tracking-widest text-center pt-2">{error}</p>}

          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-xs font-bold uppercase tracking-widest mt-6"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
          </button>
        </form>

        {/* Quick Test Login Bypass for Models */}
        <div className="border-t border-black/10 pt-6 space-y-4">
          <div className="text-center">
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/40 block">
              Test Model Bypass Shortcuts
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { name: 'Ali', email: 'ali@demo.com' },
              { name: 'Sara', email: 'sara@demo.com' },
              { name: 'Lina', email: 'lina@demo.com' },
            ].map(m => (
              <button
                key={m.email}
                type="button"
                onClick={() => handleBypassLogin(m.email)}
                disabled={loading}
                className="bg-[#f8f7f5] border border-black/5 hover:border-black/30 py-3 text-[10px] font-bold uppercase tracking-widest text-black/70 hover:text-black text-center transition-colors"
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>

        <div className="text-center text-[10px] text-black/40 space-y-2 uppercase tracking-widest pt-4">
          <p>
            Don't have an account? <Link href="/register" className="text-black font-bold hover:underline">Register now</Link>
          </p>
          <p className="text-black/30">Demo account: ali@demo.com • Password: demo1234</p>
        </div>
      </div>
    </div>
  )
}
