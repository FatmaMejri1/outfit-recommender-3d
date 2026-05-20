'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import WardrobeGrid from '@/components/WardrobeGrid'
import TryOnPopup from '@/components/TryOnPopup'
import { setReferrer } from '@/lib/referral'
import { Sparkles, Share2, Copy } from 'lucide-react'

interface PublicWardrobeResponse {
  user: {
    id: string
    display_name: string
  }
  items: any[]
}

export default function PublicWardrobePage({ params }: { params: { userId: string } }) {
  const [data, setData] = useState<PublicWardrobeResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [tryOnOutfit, setTryOnOutfit] = useState<any | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Record referral entry immediately on mount
    setReferrer(params.userId)

    api.get<PublicWardrobeResponse>(`/api/wardrobe/${params.userId}`)
      .then(res => {
        setData(res)
      })
      .catch(err => console.error('Error loading public wardrobe:', err))
      .finally(() => setLoading(false))
  }, [params.userId])

  const copyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-6 animate-pulse">
        <div className="h-40 glass rounded-3xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="glass h-64 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-white/40">
        Public wardrobe not found. Make sure the link is correct!
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-8 page-enter">
      {/* Header Banner */}
      <div className="glass p-8 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-white/5 bg-gradient-to-r from-brand-500/10 to-transparent shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-brand-500/20 border border-brand-400/30 px-3 py-1 rounded-full text-xs text-brand-300 font-medium">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Social Showcase
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            {data.user.display_name}'s Wardrobe
          </h1>
          <p className="text-white/50 text-sm">
            Browse through items selected and styled by {data.user.display_name}. Buy any to add to your collection!
          </p>
        </div>

        <button
          onClick={copyLink}
          className="btn-ghost flex items-center gap-2 text-sm shrink-0"
        >
          {copied ? (
            <>Copied link!</>
          ) : (
            <>
              <Share2 className="w-4 h-4 text-brand-300" /> Share Wardrobe
            </>
          )}
        </button>
      </div>

      {/* Wardrobe item grid */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white">Showcased Collection</h2>
          <p className="text-sm text-white/40">Direct outfit try-ons supported on high fidelity 3D stream</p>
        </div>

        <WardrobeGrid
          items={data.items}
          isOwner={false}
          onTryOn={id => {
            const matched = data.items.find(i => i.outfit_id === id)
            if (matched) setTryOnOutfit(matched.outfit)
          }}
        />
      </div>

      {tryOnOutfit && (
        <TryOnPopup outfit={tryOnOutfit} onClose={() => setTryOnOutfit(null)} />
      )}
    </div>
  )
}
