'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Sparkles, ShoppingBag, ShoppingCart, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { getReferrer, clearReferrer } from '@/lib/referral'

interface Outfit {
  id: string
  name: string
  description: string
  price: number
  currency: string
  images: string[]
  has_3d_model: boolean
  tags: string[]
  occasion?: string
  style_type?: string
  skm_asset_key?: string
}

export default function ProductDetailPage({ params }: { params: { productId: string } }) {
  const { user } = useAuth()
  const router = useRouter()
  const [outfit, setOutfit] = useState<Outfit | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [purchaseSuccess, setPurchaseSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get<Outfit>(`/api/outfits/${params.productId}`)
      .then(res => setOutfit(res))
      .catch(err => console.error('Error loading outfit details:', err))
      .finally(() => setLoading(false))
  }, [params.productId])

  const handleBuy = async () => {
    if (!user) {
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname)
      return
    }
    setPurchasing(true)
    setError('')
    try {
      const referrer_id = getReferrer()
      await api.post('/api/orders', {
        items: [{ outfit_id: params.productId, quantity: 1 }],
        referrer_id: referrer_id || undefined
      })
      setPurchaseSuccess(true)
      clearReferrer()
    } catch (e: any) {
      setError(e.message || 'Purchase failed')
    } finally {
      setPurchasing(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
        <div className="bg-[#f4f4f2] aspect-[4/5] border border-black/5" />
        <div className="space-y-6 mt-8">
          <div className="h-6 w-32 bg-black/10" />
          <div className="h-10 w-3/4 bg-black/10" />
          <div className="h-8 w-24 bg-black/10" />
          <div className="h-32 bg-black/10 mt-8" />
        </div>
      </div>
    )
  }

  if (!outfit) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-serif font-bold text-black uppercase tracking-widest">Item Not Found</h2>
        <Link href="/markets" className="btn-primary inline-flex">Explore Catalog</Link>
      </div>
    )
  }

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency', currency: outfit.currency || 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(outfit.price)

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 space-y-8 page-enter bg-[#f8f7f5] min-h-screen">
      <Link href="/markets" className="inline-flex items-center gap-2 text-black/50 hover:text-black transition-colors text-xs uppercase tracking-widest font-semibold">
        <ArrowLeft className="w-4 h-4" /> Back to Collection
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-start">
        {/* Gallery */}
        <div className="bg-[#f4f4f2] flex items-center justify-center aspect-[4/5] relative border border-black/5 overflow-hidden shadow-sm">
          {outfit.images?.[0] ? (
            <img src={outfit.images[0]} alt={outfit.name} className="max-h-full max-w-full object-cover w-full h-full" />
          ) : (
            <ShoppingBag className="w-16 h-16 text-black/10 stroke-[1]" />
          )}

          {outfit.has_3d_model && (
            <div className="absolute top-4 left-4 badge-3d bg-white border-black/10">
              <Sparkles className="w-3 h-3 inline mr-1.5" /> 3D Try-On
            </div>
          )}
        </div>

        {/* Product specs / actions */}
        <div className="flex flex-col gap-8 md:mt-8">
          <div className="space-y-4 border-b border-black/10 pb-6">
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-black leading-tight tracking-widest uppercase">{outfit.name}</h1>
            <p className="text-lg md:text-xl font-medium text-black tracking-wide">{formattedPrice} {outfit.currency || 'USD'}</p>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-black uppercase tracking-[0.2em]">Details</h3>
            <p className="text-black/70 text-sm leading-relaxed max-w-prose">{outfit.description}</p>
          </div>

          {/* Tag specs */}
          <div className="flex flex-wrap gap-2 pt-2">
            {outfit.occasion && (
              <span className="tag border-black/20 bg-transparent text-black">Occasion: {outfit.occasion}</span>
            )}
            {outfit.style_type && (
              <span className="tag border-black/20 bg-transparent text-black">Style: {outfit.style_type}</span>
            )}
            {outfit.tags?.map(t => (
              <span key={t} className="tag border-black/20 bg-transparent text-black">{t}</span>
            ))}
          </div>

          {/* Referral message if applied */}
          {typeof window !== 'undefined' && getReferrer() && (
            <div className="border border-black/20 p-4 flex items-center gap-3 text-xs text-black font-medium uppercase tracking-widest bg-white">
              <ShieldCheck className="w-4 h-4 shrink-0 stroke-[1.5]" />
              Referral active
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col gap-4 pt-6 mt-4">
            {outfit.has_3d_model && (
              <button
                id="pdp-tryon-btn"
                onClick={() => router.push(`/studio?outfitId=${outfit.id}`)}
                className="btn-primary flex items-center justify-center gap-3 py-4 text-xs shadow-md"
              >
                <Sparkles className="w-4 h-4 text-white" /> Try On in 3D
              </button>
            )}

            {purchaseSuccess ? (
              <div className="border border-green-600 p-4 text-center space-y-3 bg-white">
                <p className="text-green-700 font-bold text-xs uppercase tracking-widest">Order Confirmed</p>
                <p className="text-black/60 text-sm">Item added to your wardrobe.</p>
                <Link href="/account/wardrobe" className="btn-ghost py-2 px-4 text-xs inline-flex w-full justify-center">View Wardrobe</Link>
              </div>
            ) : (
              <button
                id="pdp-buy-btn"
                onClick={handleBuy}
                disabled={purchasing}
                className="btn-ghost flex items-center justify-center gap-3 py-4 text-xs"
              >
                <ShoppingCart className="w-4 h-4 stroke-[1.5]" />
                {purchasing ? 'Processing...' : user ? 'Add to Wardrobe' : 'Sign In to Purchase'}
              </button>
            )}

            {error && <p className="text-red-500 text-xs font-semibold uppercase tracking-widest text-center mt-2">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
