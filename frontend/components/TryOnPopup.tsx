'use client'
import { useState } from 'react'
import { X, Sparkles, User, ArrowRight, Loader2 } from 'lucide-react'
import PixelStreamViewer from './PixelStreamViewer'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

interface Outfit {
  id: string
  name: string
  has_3d_model: boolean
  skm_asset_key?: string
}

interface TryOnResult {
  mode: '2d' | '3d'
  stream_url?: string
  metahuman_id?: string
  images?: string[]
}

interface Props {
  outfit: Outfit
  onClose: () => void
}

type FlowState = 'ask' | 'loading' | 'streaming' | '2d_fallback' | 'error'

export default function TryOnPopup({ outfit, onClose }: Props) {
  const { user } = useAuth()
  const [flow, setFlow] = useState<FlowState>('ask')
  const [result, setResult] = useState<TryOnResult | null>(null)
  const [error, setError] = useState('')

  const startTryOn = async (useDefault: boolean) => {
    setFlow('loading')
    try {
      const body: Record<string, unknown> = { outfit_id: outfit.id, use_default: useDefault }
      if (!useDefault && user) body.avatar_id = user.id
      const data = await api.post<TryOnResult>('/api/tryon', body)
      setResult(data)
      setFlow(data.mode === '3d' ? 'streaming' : '2d_fallback')
    } catch (e: any) {
      setError(e.message)
      setFlow('error')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="glass w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl glow-brand animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-400" />
            <span className="font-semibold text-white">3D Try-On</span>
            <span className="text-white/40 text-sm">— {outfit.name}</span>
          </div>
          <button id="tryon-close-btn" onClick={onClose}
            className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {flow === 'ask' && (
            <div className="space-y-6 animate-fade-in">
              <p className="text-white/70 text-center">
                Want to try <span className="text-white font-medium">{outfit.name}</span> on a 3D avatar?
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {user && (
                  <button id="tryon-my-avatar-btn" onClick={() => startTryOn(false)}
                    className="btn-primary flex items-center justify-center gap-2 py-4">
                    <User className="w-5 h-5" /> Use My Avatar
                  </button>
                )}
                <button id="tryon-default-btn" onClick={() => startTryOn(true)}
                  className={`btn-ghost flex items-center justify-center gap-2 py-4 ${!user ? 'col-span-2' : ''}`}>
                  <ArrowRight className="w-5 h-5" /> Use Default Avatar
                </button>
              </div>
              {!user && (
                <p className="text-center text-xs text-white/30">
                  <a href="/login" className="text-brand-400 hover:underline">Sign in</a> to use your personal MetaHuman avatar
                </p>
              )}
            </div>
          )}

          {flow === 'loading' && (
            <div className="flex flex-col items-center gap-4 py-12 animate-fade-in">
              <Loader2 className="w-10 h-10 text-brand-400 animate-spin" />
              <p className="text-white/60">Launching 3D stream...</p>
            </div>
          )}

          {flow === 'streaming' && result?.stream_url && (
            <div className="h-[420px] animate-fade-in">
              <PixelStreamViewer
                streamUrl={result.stream_url}
                metahumanId={result.metahuman_id || 'BP_Avatar_01'}
                currentOutfitId={outfit.id}
                skmAssetKey={outfit.skm_asset_key}
              />
            </div>
          )}

          {flow === '2d_fallback' && (
            <div className="space-y-4 animate-fade-in">
              <p className="text-white/60 text-sm text-center">This outfit doesn't have a 3D model yet — showing 2D preview.</p>
              {result?.images && result.images.length > 0
                ? <img src={result.images[0]} alt={outfit.name} className="w-full rounded-xl object-cover max-h-80" />
                : <div className="h-40 bg-surface-700 rounded-xl flex items-center justify-center text-white/20">No image available</div>}
            </div>
          )}

          {flow === 'error' && (
            <div className="text-center py-8 space-y-3 animate-fade-in">
              <p className="text-red-400">{error}</p>
              <button onClick={() => setFlow('ask')} className="btn-ghost text-sm">Try Again</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
