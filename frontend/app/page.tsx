'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import SmartSearchBar from '@/components/SmartSearchBar'
import Link from 'next/link'
import { Sparkles, ArrowRight } from 'lucide-react'

interface Market {
  id: string
  name: string
  logo_url: string
  banner_url: string
  description: string
  _count?: { outfits: number }
}

export default function Home() {
  const [markets, setMarkets] = useState<Market[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<Market[]>('/api/markets')
      .then(res => setMarkets(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 space-y-24 page-enter bg-[#f8f7f5]">
      {/* Hero section */}
      <section className="relative text-center py-24 bg-white border border-black/10">
        <div className="max-w-3xl mx-auto space-y-8 px-6">
          <div className="inline-flex items-center gap-2 border border-black/10 px-4 py-1.5 uppercase tracking-widest">
            <Sparkles className="w-3 h-3 text-black" />
            <span className="text-xs font-semibold text-black">Powered by Unreal Engine 5 & AI</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-black uppercase">
            Step into the Metaverse of Fashion
          </h1>
          <p className="text-black/60 text-base md:text-lg max-w-xl mx-auto tracking-wide">
            Try on outfits instantly with your personal high-fidelity MetaHuman avatar streamed in real-time.
          </p>

          <div className="pt-6 max-w-xl mx-auto">
            <SmartSearchBar autoNavigate={true} />
          </div>
        </div>
      </section>

      {/* Featured markets */}
      <section className="space-y-10">
        <div className="flex items-end justify-between border-b border-black/10 pb-4">
          <div>
            <h2 className="text-2xl font-serif font-bold text-black uppercase tracking-widest">Explore Top Brands</h2>
          </div>
          <Link href="/markets" className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-black hover:text-black/60 transition-colors">
            Shop All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white border border-black/5 h-[28rem] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {markets.slice(0, 3).map(m => (
              <Link
                key={m.id}
                href={`/markets/${m.id}`}
                className="group relative flex flex-col h-[28rem] animate-fade-in bg-[#f4f4f2] overflow-hidden"
              >
                {/* Banner Image */}
                <div className="absolute inset-0">
                  {m.banner_url && (
                    <img
                      src={m.banner_url}
                      alt={m.name}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 opacity-90"
                    />
                  )}
                </div>
                
                {/* Overlay for readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />

                <div className="mt-auto p-6 relative z-20 space-y-3 bg-white/95 backdrop-blur-sm border-t border-black/10 m-4 shadow-sm group-hover:bg-white transition-colors duration-300">
                  <div className="flex items-center gap-4 border-b border-black/5 pb-3">
                    {m.logo_url && (
                      <div className="w-10 h-10 bg-white border border-black/10 flex items-center justify-center shrink-0">
                        <img src={m.logo_url} alt={m.name} className="object-contain max-h-8 max-w-[2rem]" />
                      </div>
                    )}
                    <h3 className="text-lg font-serif font-bold text-black uppercase tracking-widest">{m.name}</h3>
                  </div>
                  <p className="text-black/70 text-sm line-clamp-2 tracking-wide leading-relaxed">{m.description}</p>
                  <div className="flex items-center justify-between text-xs text-black font-semibold pt-2 uppercase tracking-widest">
                    <span>{m._count?.outfits || 0} Items</span>
                    <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform duration-300">
                      View Collection <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
