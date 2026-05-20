'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { getReferrer, clearReferrer } from '@/lib/referral'
import { Sparkles, ShoppingBag, ShoppingCart, ArrowLeft, Tag, ShieldCheck, CheckCircle, Heart } from 'lucide-react'
import Link from 'next/link'

interface Outfit {
  id: string
  name: string
  description: string
  price: number
  currency: string
  images: string[]
  has_3d_model: boolean
  skm_asset_key?: string
  tags: string[]
  occasion?: string
  style_type?: string
  market?: { id: string; name: string }
}

function StudioContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()

  const [outfits, setOutfits] = useState<Outfit[]>([])
  const [activeOutfit, setActiveOutfit] = useState<Outfit | null>(null)
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<string[]>(['[System] Studio initialized on port 90'])
  const [myWishlist, setMyWishlist] = useState<string[]>([])

  // Checkout states
  const [purchasing, setPurchasing] = useState(false)
  const [purchaseSuccess, setPurchaseSuccess] = useState(false)
  const [error, setError] = useState('')

  const streamUrl = process.env.NEXT_PUBLIC_PS_STREAM_URL || 'http://localhost:90'

  // Fetch user's wishlist
  useEffect(() => {
    if (user) {
      api.get<any[]>('/api/wardrobe/me')
        .then(res => {
          setMyWishlist(res.map(item => item.outfit_id))
        })
        .catch(err => console.error('Error fetching user wishlist:', err))
    }
  }, [user])

  const handleWishlistToggle = async () => {
    if (!activeOutfit) return
    if (!user) {
      router.push(`/login?redirect=/studio?outfitId=${activeOutfit.id}`)
      return
    }

    const isInWishlist = myWishlist.includes(activeOutfit.id)
    try {
      if (isInWishlist) {
        await api.delete(`/api/wardrobe/items/${activeOutfit.id}`)
        setMyWishlist(prev => prev.filter(id => id !== activeOutfit.id))
      } else {
        await api.post('/api/wardrobe/items', { outfit_id: activeOutfit.id })
        setMyWishlist(prev => [...prev, activeOutfit.id])
      }
    } catch (e: any) {
      console.error('Error toggling wishlist:', e)
    }
  }

  // Fetch all 3D supported outfits
  useEffect(() => {
    api.get<Outfit[]>('/api/outfits')
      .then(res => {
        const supported = res.filter(o => o.has_3d_model)
        setOutfits(supported)

        // Select initial outfit based on query parameter or fallback to first item
        const initialId = searchParams.get('outfitId')
        const found = supported.find(o => o.id === initialId) || supported[0]
        if (found) {
          setActiveOutfit(found)
        }
      })
      .catch(err => console.error('Error fetching outfits in studio:', err))
      .finally(() => setLoading(false))
  }, [searchParams])

  // Direct switch logic matching avatarfit-web
  const switchOutfit = (outfit: Outfit) => {
    setActiveOutfit(outfit)
    setPurchaseSuccess(false)
    setError('')

    const logMsg = `[WebRTC] Sent ID: "${outfit.id}"`
    console.log(`[PixelStreaming] Direct WebRTC Switch: ${outfit.id}`)
    setLogs(prev => [...prev, logMsg])

    const iframe = document.querySelector('iframe')
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage({
        type: 'ui_interaction',
        descriptor: outfit.id
      }, '*')
      console.log('[PixelStreaming] postMessage sent successfully ✅')
    } else {
      console.error('[PixelStreaming] Stream iframe not found ❌')
      setLogs(prev => [...prev, '[Error] Stream iframe not found ❌'])
    }
  }

  // Trigger default switch on stream page load (3.5s delay to allow player ready state)
  useEffect(() => {
    if (activeOutfit) {
      const timer = setTimeout(() => {
        switchOutfit(activeOutfit)
      }, 3500)
      return () => clearTimeout(timer)
    }
  }, [activeOutfit?.id])

  const handleBuy = async () => {
    if (!activeOutfit) return
    if (!user) {
      router.push(`/login?redirect=/studio?outfitId=${activeOutfit.id}`)
      return
    }

    setPurchasing(true)
    setError('')
    try {
      const referrer_id = getReferrer()
      await api.post('/api/orders', {
        items: [{ outfit_id: activeOutfit.id, quantity: 1 }],
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
      <div className="flex h-screen bg-[#f8f7f5] text-black flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-black/10 border-t-black rounded-full animate-spin" />
        <h2 className="text-sm font-bold tracking-widest uppercase animate-pulse">BOOTING 3D STUDIO...</h2>
      </div>
    )
  }

  return (
    <main className="h-screen bg-[#f8f7f5] text-black flex overflow-hidden">
      {/* Sidebar - Outfits Catalog */}
      <aside className="w-80 border-r border-black/10 flex flex-col bg-white z-20 shrink-0">
        <div className="p-6 border-b border-black/10 space-y-4">
          <Link href="/markets" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-black/50 hover:text-black transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Brands
          </Link>
          <div>
            <h1 className="text-lg font-serif font-bold tracking-widest text-black uppercase flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-black stroke-[1.5]" />
              FashionStudio
            </h1>
            <p className="text-xs text-black/50 mt-2 tracking-wide uppercase">Try on products live</p>
          </div>
        </div>

        {/* Scrollable Outfits List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f8f7f5]">
          {outfits.map(o => {
            const isActive = activeOutfit?.id === o.id
            return (
              <div
                key={o.id}
                onClick={() => switchOutfit(o)}
                className={`bg-white p-3 cursor-pointer border transition-all duration-300 ${
                  isActive ? 'border-black shadow-sm' : 'border-black/5 hover:border-black/30'
                }`}
              >
                <div className="aspect-square overflow-hidden mb-3 relative bg-[#f4f4f2]">
                  {o.images?.[0] ? (
                    <img src={o.images[0]} alt={o.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="w-8 h-8 text-black/10 stroke-[1]" />
                    </div>
                  )}
                  {isActive && (
                    <div className="absolute top-2 left-2 badge-3d bg-white border-black">
                      Active
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 px-2 py-1 bg-white border border-black/10 text-xs font-bold text-black tracking-widest uppercase">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency', currency: o.currency || 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0
                    }).format(o.price)}
                  </div>
                </div>
                <h4 className="text-xs font-semibold text-black truncate tracking-wide uppercase">{o.name}</h4>
                <p className="text-[10px] text-black/50 mt-1 uppercase tracking-widest">{o.market?.name || 'Global Collection'}</p>
              </div>
            )
          })}
        </div>
      </aside>

      {/* Main Viewport - Unreal Engine 5 Stream */}
      <section className="flex-1 relative bg-[#e5e5e5] overflow-hidden flex items-center justify-center">
        <div className="absolute inset-4 bg-white border border-black/10 overflow-hidden shadow-sm">
          <iframe
            src={`${streamUrl}${streamUrl.includes('?') ? '&' : '?'}AutoConnect=true&AutoPlayVideo=true&StartVideoMuted=true&unattended=true`}
            className="w-full h-full border-none"
            title="UE5 Pixel Stream"
            allow="autoplay; fullscreen"
          />
        </div>

        {/* Floating Debug Console Log Overlay */}
        <div className="absolute bottom-10 left-10 max-w-sm w-[300px] bg-white p-4 border border-black/10 shadow-sm space-y-2 pointer-events-none z-30 opacity-80">
          <div className="flex items-center justify-between border-b border-black/10 pb-2">
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-black flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" /> Live stream console
            </span>
            <span className="text-[8px] text-black/40 font-mono tracking-widest">POST_MESSAGE</span>
          </div>
          <div className="font-mono text-[9px] text-black/70 space-y-1 max-h-[85px] overflow-y-auto pt-1">
            {logs.slice(-4).map((log, index) => (
              <div key={index} className="truncate select-all pointer-events-auto hover:text-black transition-colors">
                {log}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Right Sidebar - Active Outfit Details & Checkout */}
      <aside className="w-80 border-l border-black/10 flex flex-col bg-white z-20 shrink-0 p-6">
        {activeOutfit ? (
          <div className="flex flex-col h-full space-y-6">
            <div className="pb-4 border-b border-black/10">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/50">Current Try-On</span>
              <h2 className="text-lg font-serif font-bold text-black tracking-widest uppercase mt-2 leading-snug">{activeOutfit.name}</h2>
              <p className="text-lg font-medium text-black mt-2 tracking-wide">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency', currency: activeOutfit.currency || 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0
                }).format(activeOutfit.price)}
              </p>
            </div>

            <div className="bg-[#f8f7f5] p-4 border border-black/5">
              <span className="text-[9px] font-bold text-black uppercase tracking-[0.2em] block mb-2">Occasion</span>
              <p className="text-black/80 text-xs tracking-wide">{activeOutfit.occasion || 'Everyday wear'}</p>
            </div>

            <div className="bg-[#f8f7f5] p-4 border border-black/5 flex-1 overflow-y-auto">
              <span className="text-[9px] font-bold text-black uppercase tracking-[0.2em] block mb-2">Description</span>
              <p className="text-black/70 text-xs leading-relaxed tracking-wide">{activeOutfit.description}</p>

              {activeOutfit.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-4">
                  {activeOutfit.tags.map(t => (
                    <span key={t} className="text-[9px] uppercase tracking-widest py-1 px-2 flex items-center gap-1 border border-black/10 text-black/70 bg-white">
                      <Tag className="w-2.5 h-2.5 stroke-[1.5]" /> {t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Checkout Area */}
            <div className="space-y-4 pt-6 border-t border-black/10 mt-auto shrink-0">
              {typeof window !== 'undefined' && getReferrer() && (
                <div className="border border-black/20 p-3 flex items-center gap-2 text-[10px] text-black font-medium uppercase tracking-widest">
                  <ShieldCheck className="w-4 h-4 stroke-[1.5] shrink-0" />
                  Referral active
                </div>
              )}

              {purchaseSuccess ? (
                <div className="border border-green-600 bg-white p-4 text-center space-y-3">
                  <CheckCircle className="w-6 h-6 text-green-700 mx-auto stroke-[1.5]" />
                  <p className="text-green-800 font-bold text-xs uppercase tracking-widest">Purchase Complete</p>
                  <p className="text-black/50 text-[10px] tracking-wide uppercase">Added to wardrobe</p>
                  <Link href="/account/wardrobe" className="btn-ghost py-2 px-3 text-[10px] w-full block">
                    View Wardrobe
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={handleBuy}
                    disabled={purchasing}
                    className="btn-primary w-full flex items-center justify-center gap-3 py-4 text-xs shadow-sm"
                  >
                    <ShoppingCart className="w-4 h-4 stroke-[1.5]" />
                    {purchasing ? 'Processing...' : user ? 'Buy Item' : 'Sign in to Buy'}
                  </button>
                  <button
                    onClick={handleWishlistToggle}
                    disabled={myWishlist.includes(activeOutfit.id)}
                    className={`w-full py-4 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 border transition-all duration-200 ${
                      myWishlist.includes(activeOutfit.id)
                        ? 'bg-green-50/50 border-green-200 text-green-700 cursor-not-allowed opacity-90'
                        : 'bg-white border-black/20 hover:border-black text-black'
                    }`}
                  >
                    {myWishlist.includes(activeOutfit.id) ? (
                      <>
                        <CheckCircle className="w-4 h-4 stroke-[1.5]" />
                        In Wardrobe
                      </>
                    ) : (
                      <>
                        <Heart className="w-4 h-4 stroke-[1.5]" />
                        Add to Wardrobe
                      </>
                    )}
                  </button>
                </div>
              )}

              {error && <p className="text-red-500 text-xs font-semibold uppercase tracking-widest text-center mt-2">{error}</p>}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-black/30 space-y-4">
            <ShoppingBag className="w-10 h-10 stroke-[1]" />
            <p className="text-xs text-center uppercase tracking-widest max-w-[200px] leading-relaxed">Select an item from the catalog</p>
          </div>
        )}
      </aside>
    </main>
  )
}

export default function StudioPage() {
  return (
    <Suspense fallback={<div className="flex h-screen bg-[#f8f7f5] text-black flex-col items-center justify-center text-sm font-bold tracking-widest uppercase">Loading Studio...</div>}>
      <StudioContent />
    </Suspense>
  )
}
