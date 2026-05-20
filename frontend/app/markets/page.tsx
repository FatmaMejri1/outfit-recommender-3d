'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import Link from 'next/link'
import { ArrowRight, ShoppingBag } from 'lucide-react'

interface Market {
  id: string
  name: string
  logo_url: string
  banner_url: string
  description: string
  _count?: { outfits: number }
}

export default function MarketsPage() {
  const [markets, setMarkets] = useState<Market[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<Market[]>('/api/markets')
      .then(res => setMarkets(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-8 page-enter">
      <div>
        <h1 className="text-3xl font-bold text-white">All Brands & Markets</h1>
        <p className="text-white/40">Browse curated fashion items directly from top global markets</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="glass h-64 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {markets.map(m => (
            <Link
              key={m.id}
              href={`/markets/${m.id}`}
              className="glass glass-hover group overflow-hidden relative flex flex-col h-64 animate-fade-in"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent z-10" />
              <div className="absolute inset-0 bg-surface-700">
                {m.banner_url && (
                  <img
                    src={m.banner_url}
                    alt={m.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
              </div>

              <div className="mt-auto p-6 relative z-20 space-y-2">
                <div className="flex items-center gap-3">
                  {m.logo_url && (
                    <div className="w-10 h-10 rounded-xl bg-white p-1.5 flex items-center justify-center shrink-0">
                      <img src={m.logo_url} alt={m.name} className="object-contain max-h-full max-w-full" />
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-white">{m.name}</h3>
                </div>
                <p className="text-white/60 text-sm line-clamp-2">{m.description}</p>
                <div className="flex items-center justify-between text-xs text-brand-300 font-semibold pt-1">
                  <span>{m._count?.outfits || 0} Outfits available</span>
                  <span className="group-hover:translate-x-1 transition-transform duration-200 flex items-center gap-1">
                    Shop Brand <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
