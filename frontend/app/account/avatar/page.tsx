'use client'

import { useEffect, useState, useRef } from 'react'
import { api } from '@/lib/api'
import AvatarCreationForm from '@/components/AvatarCreationForm'
import { useAuth } from '@/lib/auth-context'
import { Sparkles, Clock, CheckCircle2, Ruler, ShieldAlert, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface AvatarStatus {
  id?: string
  status: 'NONE' | 'PENDING' | 'PROCESSING' | 'READY' | 'FAILED'
  metahuman_id?: string
  photos_urls?: string[]
  body_height?: number
  body_weight?: number
  body_chest?: number
  body_waist?: number
  body_hips?: number
  estimated_ready?: string
}

export default function AvatarPage() {
  const { user } = useAuth()
  const [avatar, setAvatar] = useState<AvatarStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)

  const fetchAvatar = async () => {
    try {
      const data = await api.get<AvatarStatus>('/api/avatars/me')
      setAvatar(data)

      if (data.status === 'PENDING' || data.status === 'PROCESSING') {
        if (!pollingRef.current) {
          pollingRef.current = setInterval(fetchAvatar, 5000)
        }
      } else {
        if (pollingRef.current) {
          clearInterval(pollingRef.current)
          pollingRef.current = null
        }
      }
    } catch (err) {
      console.error('Error fetching avatar status:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchAvatar()
    }
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
    }
  }, [user])

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Please sign in to view your avatar</h2>
        <Link href="/login" className="btn-primary inline-flex">Sign In</Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 flex justify-center items-center">
        <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-12 space-y-8 page-enter">
      <div>
        <h1 className="text-3xl font-bold text-white">3D Avatar Pipeline</h1>
        <p className="text-white/40">Manage your personalized Unreal Engine 5 MetaHuman try-on character</p>
      </div>

      {(!avatar || avatar.status === 'NONE') && (
        <div className="space-y-6">
          <div className="glass p-6 border-white/5 space-y-2">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-400" /> Let's create your personal MetaHuman!
            </h3>
            <p className="text-sm text-white/60 leading-relaxed">
              Submit exactly 6 photos of your face taken from different angles along with your chest, waist, and hip parameters. Our high-fidelity pipeline will automatically model and rig a customized 3D character inside Unreal Engine.
            </p>
          </div>
          <AvatarCreationForm onComplete={status => setAvatar(status as any)} />
        </div>
      )}

      {avatar && (avatar.status === 'PENDING' || avatar.status === 'PROCESSING') && (
        <div className="glass p-8 text-center space-y-6 border-white/5 glow-brand">
          <div className="w-16 h-16 bg-brand-500/10 rounded-full flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8 text-brand-400 animate-pulse-slow" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">Rigging Your 3D MetaHuman...</h2>
            <p className="text-sm text-white/50 max-w-md mx-auto">
              Our automated Unreal Pipeline is processing your photos. Status updates automatically.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 bg-brand-500/20 border border-brand-400/30 px-3.5 py-1.5 rounded-full text-xs font-semibold text-brand-300">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Status: {avatar.status}
          </div>
        </div>
      )}

      {avatar && avatar.status === 'READY' && (
        <div className="glass p-8 space-y-8 border-white/5 glow-brand">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">MetaHuman Ready!</h2>
                <p className="text-xs text-white/40">Active profile: {avatar.metahuman_id}</p>
              </div>
            </div>
            <button
              onClick={() => setAvatar({ status: 'NONE' })}
              className="btn-ghost py-2 px-4 text-xs font-semibold"
            >
              Recreate Avatar
            </button>
          </div>

          {/* Measurements */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white flex items-center gap-2 text-sm uppercase tracking-wider text-white/40">
              <Ruler className="w-4 h-4 text-brand-400" /> Parameters fitted
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: 'Height', val: avatar.body_height || 180, unit: 'cm' },
                { label: 'Weight', val: avatar.body_weight || 75, unit: 'kg' },
                { label: 'Chest',  val: avatar.body_chest || 96, unit: 'cm' },
                { label: 'Waist',  val: avatar.body_waist || 78, unit: 'cm' },
                { label: 'Hips',   val: avatar.body_hips || 92, unit: 'cm' },
              ].map(({ label, val, unit }) => (
                <div key={label} className="glass p-4 text-center border-white/5">
                  <p className="text-xs text-white/40 font-semibold">{label}</p>
                  <p className="text-lg font-black text-white mt-1">{val} <span className="text-xs text-white/30 font-medium">{unit}</span></p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {avatar && avatar.status === 'FAILED' && (
        <div className="glass p-8 text-center space-y-4 border-red-500/10 bg-red-500/[0.02]">
          <ShieldAlert className="w-12 h-12 text-red-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Avatar Rigging Failed</h2>
          <p className="text-sm text-white/50 max-w-sm mx-auto">
            An error occurred during facial photo calibration. Please try again with clear photos.
          </p>
          <button onClick={() => setAvatar({ status: 'NONE' })} className="btn-primary py-2 px-4 text-xs font-semibold mt-2">
            Try Again
          </button>
        </div>
      )}
    </div>
  )
}
