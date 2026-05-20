'use client'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Sparkles, X, Tag, Zap } from 'lucide-react'
import { api } from '@/lib/api'

interface SearchResult {
  id: string
  name: string
  price: number
  currency: string
  images?: string[]
  has_3d_model: boolean
  tags: string[]
  occasion?: string
  style_type?: string
}

interface SearchResponse {
  intent: { occasion: string | null; style_type: string | null; keywords: string[] }
  results: SearchResult[]
}

interface Props {
  onResults?: (data: any) => void
  autoNavigate?: boolean
}

export default function SmartSearchBar({ onResults, autoNavigate = false }: Props) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<SearchResponse | null>(null)
  const router = useRouter()

  const handleSearch = useCallback(async (q = query) => {
    if (!q.trim()) return
    if (autoNavigate) {
      router.push(`/search?q=${encodeURIComponent(q)}`)
      return
    }
    setLoading(true)
    try {
      const data = await api.post<SearchResponse>('/api/search', { query: q })
      setResults(data)
      onResults?.(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [query, autoNavigate, router, onResults])

  const suggestions = [
    'something fancy for a wedding',
    'sporty streetwear look',
    'luxury casual outfit',
  ]

  return (
    <div className="w-full space-y-4">
      <div className="relative flex items-center">
        <div className="absolute left-4 flex items-center pointer-events-none">
          {loading
            ? <Sparkles className="w-5 h-5 text-black animate-pulse" />
            : <Search className="w-5 h-5 text-black/40 stroke-[1.5]" />}
        </div>
        <input
          id="smart-search-input"
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder='Try "something fancy for a wedding"...'
          className="input-field pl-12 pr-28 py-4 text-base bg-white"
        />
        {query && (
          <button onClick={() => { setQuery(''); setResults(null) }}
            className="absolute right-[6.5rem] text-black/40 hover:text-black transition-colors">
            <X className="w-4 h-4 stroke-[1.5]" />
          </button>
        )}
        <button id="smart-search-btn" onClick={() => handleSearch()} disabled={loading}
          className="absolute right-2 btn-primary py-2 px-6 text-xs bg-black text-white hover:bg-gray-800 tracking-widest uppercase">
          Search
        </button>
      </div>

      {!results && (
        <div className="flex flex-wrap gap-2 justify-center">
          {suggestions.map(s => (
            <button key={s} onClick={() => { setQuery(s); handleSearch(s) }}
              className="tag hover:bg-gray-100 hover:border-black/20 hover:text-black transition-all cursor-pointer text-xs px-3 py-1.5 uppercase tracking-widest bg-transparent text-black/70 border-black/10">
              <Zap className="w-3 h-3 inline mr-1 stroke-[1.5]" />{s}
            </button>
          ))}
        </div>
      )}

      {results?.intent && (
        <div className="flex flex-wrap gap-2 animate-fade-in justify-center mt-4">
          {results.intent.occasion && (
            <span className="badge-3d bg-white border-black/20 text-black uppercase tracking-widest px-3"><Tag className="w-3 h-3 stroke-[1.5]" /> {results.intent.occasion}</span>
          )}
          {results.intent.style_type && (
            <span className="badge-3d bg-white border-black/20 text-black uppercase tracking-widest px-3"><Tag className="w-3 h-3 stroke-[1.5]" /> {results.intent.style_type}</span>
          )}
          {results.intent.keywords?.map((kw: string) => (
            <span key={kw} className="tag text-xs uppercase tracking-widest px-3 border-black/10 bg-transparent text-black/70">{kw}</span>
          ))}
          <span className="text-black/50 text-xs self-center uppercase tracking-widest ml-2">{results.results.length} items</span>
        </div>
      )}
    </div>
  )
}
