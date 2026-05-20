'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import OutfitCard from '@/components/OutfitCard'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ShoppingBag } from 'lucide-react'
import Link from 'next/link'

interface Market {
  id: string
  name: string
  logo_url: string
  banner_url: string
  description: string
}

interface Outfit {
  id: string
  name: string
  price: number
  currency: string
  images: string[]
  has_3d_model: boolean
  tags: string[]
  occasion?: string
  style_type?: string
}

export default function MarketDetailPage({ params }: { params: { marketId: string } }) {
  const router = useRouter()
  const [market, setMarket] = useState<Market | null>(null)
  const [outfits, setOutfits] = useState<Outfit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const marketsList = await api.get<Market[]>('/api/markets')
        const currentMarket = marketsList.find(m => m.id === params.marketId)
        if (currentMarket) setMarket(currentMarket)

        const outfitsList = await api.get<Outfit[]>(`/api/markets/${params.marketId}/outfits`)
        setOutfits(outfitsList)
      } catch (err) {
        console.error('Error loading market detail:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [params.marketId])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-8 animate-pulse">
        <div className="h-64 glass rounded-3xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="glass h-80 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!market) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Market Not Found</h2>
        <Link href="/markets" className="btn-primary inline-flex">Back to Markets</Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-8 page-enter">
      {/* Back button */}
      <Link href="/markets" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Brands
      </Link>

      {/* Hero Banner */}
      <div className="glass overflow-hidden relative flex flex-col justify-end min-h-[250px] p-8 md:p-12 shadow-2xl rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent z-10" />
        <div className="absolute inset-0 bg-surface-700">
          {market.banner_url && (
            <img src={market.banner_url} alt={market.name} className="w-full h-full object-cover" />
          )}
        </div>

        <div className="relative z-20 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {market.logo_url && (
                <div className="w-16 h-16 rounded-2xl bg-white p-2.5 flex items-center justify-center shadow-xl">
                  <img src={market.logo_url} alt={market.name} className="object-contain max-h-full max-w-full" />
                </div>
              )}
              <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">{market.name}</h1>
            </div>
            <p className="text-white/70 max-w-xl text-sm md:text-base leading-relaxed">{market.description}</p>
          </div>
          <div className="badge-3d px-4 py-2 text-sm">
            <ShoppingBag className="w-4 h-4 inline mr-1.5" />
            {outfits.length} items listed
          </div>
        </div>
      </div>

      {/* Outfits listing */}
      <div className="space-y-6">
        {/* Collection Header */}
        <div>
          <h2 className="text-2xl font-bold text-white">Collection Catalog</h2>
          <p className="text-sm text-white/40">Try on supported items instantly with our high-fidelity 3D stream</p>
        </div>

        {outfits.length === 0 ? (
          <div className="glass rounded-2xl p-16 text-center text-white/40">
            No active outfits available for try-on in this brand catalog. Check back later!
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {outfits.map(o => (
              <OutfitCard
                key={o.id}
                outfit={o}
                onTryOn={() => router.push(`/studio?outfitId=${o.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
