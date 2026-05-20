'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import SmartSearchBar from '@/components/SmartSearchBar'
import OutfitCard from '@/components/OutfitCard'
import { api } from '@/lib/api'
import { Search } from 'lucide-react'

interface SearchResult {
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

interface SearchResponse {
  intent: { occasion: string | null; style_type: string | null; keywords: string[] }
  results: SearchResult[]
}

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get('q') || ''
  const [results, setResults] = useState<SearchResponse | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (initialQuery) {
      setLoading(true)
      api.post<SearchResponse>('/api/search', { query: initialQuery })
        .then(res => setResults(res))
        .catch(err => console.error(err))
        .finally(() => setLoading(false))
    }
  }, [initialQuery])

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 space-y-12 page-enter bg-[#f8f7f5] min-h-screen">
      <div className="max-w-2xl mx-auto text-center space-y-4">
        <h1 className="text-3xl font-serif font-bold text-black uppercase tracking-widest">Smart Assistant</h1>
        <p className="text-black/60 text-sm tracking-wide">Ask in plain words for outfits tailored to a theme or event.</p>
        <div className="pt-4 text-left">
          <SmartSearchBar
            onResults={data => setResults(data)}
            autoNavigate={false}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-[#f4f4f2] h-80 border border-black/5 animate-pulse" />
          ))}
        </div>
      ) : results ? (
        <div className="space-y-8 pt-8 border-t border-black/10">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-serif font-bold text-black uppercase tracking-widest">Matching Outfits</h2>
            <p className="text-sm text-black/50 tracking-wide">Highly correlated outfits based on search criteria</p>
          </div>

          {results.results.length === 0 ? (
            <div className="bg-white border border-black/10 p-16 text-center text-black/50 uppercase tracking-widest text-sm shadow-sm">
              No matching pieces found. Try a different query.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {results.results.map(o => (
                <OutfitCard
                  key={o.id}
                  outfit={o}
                  onTryOn={() => router.push(`/studio?outfitId=${o.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white p-16 text-center space-y-6 max-w-2xl mx-auto border border-black/10 shadow-sm mt-12">
          <Search className="w-12 h-12 text-black/10 mx-auto stroke-[1]" />
          <p className="text-black/50 text-sm tracking-wide uppercase leading-relaxed max-w-md mx-auto">
            Enter a search query or click one of the preset shortcuts above to discover amazing outfit fits!
          </p>
        </div>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-20 text-center text-black/40 uppercase tracking-widest text-sm">Loading smart assistant...</div>}>
      <SearchContent />
    </Suspense>
  )
}
