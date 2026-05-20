'use client'

import { useState, useEffect, Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { setReferrer } from '@/lib/referral'
import {
  Sparkles,
  ShoppingBag,
  ShoppingCart,
  ArrowLeft,
  Tag,
  ShieldCheck,
  CheckCircle,
  Compass,
  Shirt,
  User,
  Heart,
  Plus,
  X
} from 'lucide-react'
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

interface ModelProfile {
  id: string
  display_name: string
  photo: string | null
  bodyDescription: string | null
  clothesTaste: string | null
  avatar?: {
    metahuman_id: string
  }
}

function ModelWardrobeContent() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const modelId = params.modelId as string

  const [model, setModel] = useState<ModelProfile | null>(null)
  const [outfits, setOutfits] = useState<Outfit[]>([])
  const [activeOutfit, setActiveOutfit] = useState<Outfit | null>(null)
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<string[]>(['[System] Model Wardrobe Studio initialized'])
  const [myWishlist, setMyWishlist] = useState<string[]>([])

  // Creator Dashboard States
  const isOwner = user?.id === modelId
  const [showAddModal, setShowAddModal] = useState(false)
  const [catalogOutfits, setCatalogOutfits] = useState<Outfit[]>([])

  // Checkout states
  const [purchasing, setPurchasing] = useState(false)
  const [purchaseSuccess, setPurchaseSuccess] = useState(false)
  const [error, setError] = useState('')

  const streamUrl = process.env.NEXT_PUBLIC_PS_STREAM_URL || 'http://localhost:90'

  // Fetch model profile and curated public wardrobe items
  useEffect(() => {
    if (!modelId) return

    // Set model as affiliate/referrer so purchases grant them commission automatically!
    setReferrer(modelId)

    api.get<any>(`/api/wardrobe/${modelId}`)
      .then(res => {
        const profile: ModelProfile = {
          id: res.user.id,
          display_name: res.user.display_name,
          photo: res.user.photo || null,
          bodyDescription: res.user.bodyDescription || null,
          clothesTaste: res.user.clothesTaste || null,
          avatar: res.user.avatar || undefined
        }
        setModel(profile)

        // Map wardrobe items to outfits array
        const wardrobeOutfits = res.items.map((item: any) => item.outfit)
        setOutfits(wardrobeOutfits)

        if (wardrobeOutfits.length > 0) {
          setActiveOutfit(wardrobeOutfits[0])
        }
      })
      .catch(err => console.error('Error loading model wardrobe:', err))
      .finally(() => setLoading(false))
  }, [modelId])

  // Fetch logged-in user's own wishlist
  useEffect(() => {
    if (user) {
      api.get<any[]>('/api/wardrobe/me')
        .then(res => {
          setMyWishlist(res.map(item => item.outfit_id))
        })
        .catch(err => console.error('Error loading user wishlist:', err))
    }
  }, [user])

  // Fetch all available 3D outfits for creator catalog management
  useEffect(() => {
    if (isOwner) {
      api.get<Outfit[]>('/api/outfits')
        .then(res => {
          setCatalogOutfits(res.filter(o => o.has_3d_model))
        })
        .catch(err => console.error('Error fetching catalog outfits:', err))
    }
  }, [isOwner])

  // Direct switch logic passing plain ID to Epic's postMessage bridge
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

  // Trigger default switch on stream boot (3.5s delay for engine ready state)
  useEffect(() => {
    if (activeOutfit) {
      const timer = setTimeout(() => {
        switchOutfit(activeOutfit)
      }, 3500)
      return () => clearTimeout(timer)
    }
  }, [activeOutfit?.id])

  const handleWishlistToggle = async () => {
    if (!activeOutfit) return
    if (!user) {
      router.push(`/login?redirect=/models/${modelId}`)
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

  const handleRemoveFromWardrobe = async (outfitId: string) => {
    try {
      await api.delete(`/api/wardrobe/items/${outfitId}`)
      setOutfits(prev => prev.filter(o => o.id !== outfitId))
      
      // If active outfit was removed, auto-switch to another remaining outfit
      if (activeOutfit?.id === outfitId) {
        const remaining = outfits.filter(o => o.id !== outfitId)
        if (remaining.length > 0) {
          setActiveOutfit(remaining[0])
        } else {
          setActiveOutfit(null)
        }
      }
    } catch (err) {
      console.error('Error removing outfit from wardrobe:', err)
    }
  }

  const handleBuy = async () => {
    if (!activeOutfit) return
    if (!user) {
      router.push(`/login?redirect=/models/${modelId}`)
      return
    }

    setPurchasing(true)
    setError('')
    try {
      // Create order with affiliate modelId as referrer automatically
      await api.post('/api/orders', {
        items: [{ outfit_id: activeOutfit.id, quantity: 1 }],
        referrer_id: modelId
      })
      setPurchaseSuccess(true)
    } catch (e: any) {
      setError(e.message || 'Purchase failed')
    } finally {
      setPurchasing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-[#050505] text-white flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <h2 className="text-lg font-bold tracking-wider animate-pulse">CONNECTING TO MODEL STUDIO...</h2>
      </div>
    )
  }

  if (!model) {
    return (
      <div className="flex h-screen bg-[#050505] text-white flex-col items-center justify-center space-y-4">
        <h2 className="text-lg font-bold text-red-400">MODEL PROFILE NOT FOUND</h2>
        <Link href="/models" className="btn-primary py-2 px-4 rounded-xl">Back to Models</Link>
      </div>
    )
  }

  return (
    <main className="h-screen bg-[#06070d] text-white flex overflow-hidden relative">
      {/* Left Sidebar - Model Wardrobe Curated List */}
      <aside className="w-80 border-r border-white/10 flex flex-col bg-surface-900/40 backdrop-blur-md z-20 shrink-0">
        <div className="p-5 border-b border-white/10 space-y-4">
          <Link href="/models" className="inline-flex items-center gap-2 text-[10px] text-white/50 hover:text-white transition-colors uppercase font-bold tracking-wider">
            <ArrowLeft className="w-3 h-3" /> Back to Models
          </Link>
          
          {/* Model Showcase Card header */}
          <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5">
            {model.photo ? (
              <img src={model.photo} alt={model.display_name} className="w-12 h-12 rounded-xl object-cover shrink-0 border border-white/10" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center shrink-0 border border-white/5">
                <User className="w-5 h-5 text-brand-400" />
              </div>
            )}
            <div className="overflow-hidden">
              <h1 className="text-sm font-bold text-white truncate">{model.display_name}</h1>
              <span className="text-[9px] font-black uppercase tracking-widest text-brand-400 block mt-0.5">
                Model Wardrobe
              </span>
            </div>
          </div>
        </div>

        {/* Creator Dashboard Header controls */}
        {isOwner && (
          <div className="p-4 border-b border-white/10 bg-brand-500/5 space-y-3">
            <div className="bg-brand-500/10 border border-brand-400/20 p-3 rounded-xl text-[10px] text-brand-300 leading-normal">
              👋 <strong>Welcome back, {model.display_name}!</strong> Curate your public wardrobe to display to your followers.
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full btn-primary py-2 px-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-extrabold uppercase tracking-wider border border-brand-400/20 shadow-lg shadow-brand-500/10 transition-all duration-300"
            >
              <Plus className="w-3.5 h-3.5" /> Add Outfits to Wardrobe
            </button>
          </div>
        )}

        {/* Curated Favorites List */}
        <div className="p-4 border-b border-white/5 bg-brand-500/5">
          <span className="text-[9px] font-black uppercase tracking-widest text-brand-300 block">Curated Favorites</span>
          <p className="text-[10px] text-white/40 mt-0.5">Click an item below to dress the model's 3D avatar live</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {outfits.length === 0 ? (
            <div className="text-center py-12 text-white/20 text-xs">
              This wardrobe is empty. Curate looks to showcase your styles!
            </div>
          ) : (
            outfits.map(o => {
              const isActive = activeOutfit?.id === o.id
              return (
                <div
                  key={o.id}
                  onClick={() => switchOutfit(o)}
                  className={`glass p-3 rounded-2xl cursor-pointer border transition-all duration-300 relative ${
                    isActive ? 'border-brand-500 bg-brand-500/5 glow-brand' : 'border-white/5 hover:border-white/20'
                  }`}
                >
                  {/* Remove button visible only to model owner */}
                  {isOwner && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveFromWardrobe(o.id)
                      }}
                      className="absolute top-5 right-5 p-1.5 bg-red-500 hover:bg-red-600 rounded-lg text-white z-30 transition-all duration-200 shadow-md"
                      title="Remove from Wardrobe"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}

                  <div className="aspect-square rounded-xl overflow-hidden mb-2.5 relative bg-surface-800">
                    {o.images?.[0] ? (
                      <img src={o.images[0]} alt={o.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-8 h-8 text-white/10" />
                      </div>
                    )}
                    {isActive && (
                      <div className="absolute top-2 left-2 badge-3d">
                        Active
                      </div>
                    )}
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-xs font-bold text-brand-300">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency', currency: o.currency || 'USD'
                      }).format(o.price)}
                    </div>
                  </div>
                  <h4 className="text-xs font-semibold text-white/90 truncate">{o.name}</h4>
                  <p className="text-[10px] text-white/40 mt-0.5">{o.market?.name || 'Global Collection'}</p>
                </div>
              )
            })
          )}
        </div>
      </aside>

      {/* Center Viewport - Unreal Engine 5 Stream */}
      <section className="flex-1 relative bg-black overflow-hidden">
        <iframe
          src={`${streamUrl}${streamUrl.includes('?') ? '&' : '?'}AutoConnect=true&AutoPlayVideo=true&StartVideoMuted=true&unattended=true`}
          className="absolute inset-y-0 -left-[120px] w-[calc(100%+120px)] h-full border-none"
          title="UE5 Pixel Stream"
          allow="autoplay; fullscreen"
        />

        {/* Model's MetaHuman Avatar Identifier HUD Overlay */}
        <div className="absolute top-6 left-6 glass px-3.5 py-2.5 rounded-2xl border-white/10 backdrop-blur-md shadow-2xl flex items-center gap-2.5 z-30">
          <div className="w-2.5 h-2.5 bg-brand-500 rounded-full animate-ping shrink-0" />
          <div className="text-[10px]">
            <span className="text-white/40 block text-[8px] uppercase tracking-wider font-extrabold">Active 3D Avatar</span>
            <span className="text-white font-bold tracking-tight uppercase">
              {model.avatar?.metahuman_id || 'BP_Avatar_01'} ({model.display_name})
            </span>
          </div>
        </div>

        {/* Floating Debug Console Log Overlay */}
        <div className="absolute bottom-6 left-6 max-w-sm w-[300px] glass p-3.5 rounded-2xl border-white/10 backdrop-blur-md shadow-2xl space-y-2 pointer-events-none z-30">
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-brand-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Live stream console
            </span>
            <span className="text-[8px] text-white/30 font-mono">POST_MESSAGE</span>
          </div>
          <div className="font-mono text-[9px] text-white/70 space-y-1 max-h-[85px] overflow-y-auto">
            {logs.slice(-4).map((log, index) => (
              <div key={index} className="truncate select-all pointer-events-auto hover:text-white transition-colors">
                {log}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Right Sidebar - Active Outfit Details & Affiliate Checkout */}
      <aside className="w-80 border-l border-white/10 flex flex-col bg-surface-900/40 backdrop-blur-md z-20 shrink-0 p-6">
        {activeOutfit ? (
          <div className="flex flex-col h-full space-y-6">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-400">Curated Choice</span>
              <h2 className="text-lg font-bold text-white tracking-tight mt-1 leading-snug">{activeOutfit.name}</h2>
              <p className="text-xl font-black text-brand-300 mt-2">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency', currency: activeOutfit.currency || 'USD'
                }).format(activeOutfit.price)}
              </p>
            </div>

            <div className="glass p-4 rounded-2xl space-y-2 border-white/5">
              <span className="text-[9px] font-semibold text-white/40 uppercase tracking-wider block">Occasion</span>
              <p className="text-white/80 text-xs">{activeOutfit.occasion || 'Everyday wear'}</p>
            </div>

            <div className="glass p-4 rounded-2xl space-y-2.5 border-white/5 flex-1 overflow-y-auto">
              <span className="text-[9px] font-semibold text-white/40 uppercase tracking-wider block">Description</span>
              <p className="text-white/70 text-xs leading-relaxed">{activeOutfit.description}</p>

              {activeOutfit.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-2">
                  {activeOutfit.tags.map(t => (
                    <span key={t} className="tag text-[9px] py-1 px-2 flex items-center gap-1">
                      <Tag className="w-2.5 h-2.5" /> {t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Affiliate Commission & Checkout Area */}
            <div className="space-y-3 pt-4 border-t border-white/10 mt-auto shrink-0">
              {/* Affiliate Warning Banner */}
              <div className="bg-brand-500/10 border border-brand-400/20 p-3 rounded-xl flex items-center gap-2 text-[10px] text-brand-300">
                <ShieldCheck className="w-4.5 h-4.5 text-brand-400 shrink-0 animate-pulse" />
                <div>
                  <span className="font-bold block">10% Model Commission Active</span>
                  Support {model.display_name} by buying this look directly.
                </div>
              </div>

              {purchaseSuccess ? (
                <div className="glass border-green-500/30 bg-green-500/5 p-4 rounded-2xl text-center space-y-2">
                  <CheckCircle className="w-8 h-8 text-green-400 mx-auto animate-bounce" />
                  <p className="text-green-400 font-bold text-xs">Purchase Complete!</p>
                  <p className="text-white/50 text-[10px]">Successfully added to your private wardrobe.</p>
                  <Link href="/account/wardrobe" className="btn-ghost py-1.5 px-3 text-[10px] w-full block rounded-xl">
                    Go to Wardrobe
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={handleBuy}
                    disabled={purchasing}
                    className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 shadow-xl shadow-brand-500/20 rounded-2xl text-xs font-bold uppercase tracking-wider"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {purchasing ? 'Processing...' : user ? 'Buy Outfit' : 'Sign in to Buy'}
                  </button>
                  <button
                    onClick={handleWishlistToggle}
                    disabled={myWishlist.includes(activeOutfit.id)}
                    className={`w-full py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border transition-all duration-300 ${
                      myWishlist.includes(activeOutfit.id)
                        ? 'bg-green-500/10 border-green-500/30 text-green-400 cursor-not-allowed opacity-80'
                        : 'glass border-white/10 hover:border-brand-500/30 text-white/80 hover:text-white'
                    }`}
                  >
                    {myWishlist.includes(activeOutfit.id) ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        In My Wardrobe
                      </>
                    ) : (
                      <>
                        <Heart className="w-4 h-4" />
                        Add to My Wardrobe
                      </>
                    )}
                  </button>
                </div>
              )}

              {error && <p className="text-red-400 text-xs text-center">{error}</p>}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-white/30 space-y-3">
            <ShoppingBag className="w-10 h-10" />
            <p className="text-xs text-center">Select an outfit from the catalog to load details</p>
          </div>
        )}
      </aside>

      {/* Creator Dashboard Modal Overlay */}
      {isOwner && showAddModal && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass w-full max-w-lg p-6 rounded-3xl border-white/10 space-y-6 shadow-2xl relative max-h-[85vh] flex flex-col">
            {/* Close Button */}
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-brand-400">Creator Panel</span>
              <h3 className="text-lg font-bold text-white tracking-tight mt-0.5">Manage Your Wardrobe Catalog</h3>
              <p className="text-xs text-white/50">Click on any outfit below to add it to your 3D public wardrobe list</p>
            </div>

            {/* Catalog list inside Modal */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {catalogOutfits.map(o => {
                const isCurated = outfits.some(item => item.id === o.id)
                return (
                  <div
                    key={o.id}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all duration-300 ${
                      isCurated ? 'border-brand-500/30 bg-brand-500/5' : 'border-white/5 bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {o.images?.[0] ? (
                        <img src={o.images[0]} alt={o.name} className="w-10 h-10 rounded-lg object-cover bg-surface-800 shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-surface-800 flex items-center justify-center shrink-0">
                          <ShoppingBag className="w-4 h-4 text-white/20" />
                        </div>
                      )}
                      <div>
                        <h4 className="text-xs font-bold text-white leading-tight">{o.name}</h4>
                        <span className="text-[10px] text-brand-300 font-semibold mt-0.5 block">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency', currency: o.currency || 'USD'
                          }).format(o.price)}
                        </span>
                      </div>
                    </div>

                    {/* Toggle Heart button */}
                    <button
                      onClick={async () => {
                        try {
                          if (isCurated) {
                            await api.delete(`/api/wardrobe/items/${o.id}`)
                            setOutfits(prev => prev.filter(item => item.id !== o.id))
                          } else {
                            await api.post('/api/wardrobe/items', { outfit_id: o.id })
                            setOutfits(prev => [...prev, o])
                          }
                        } catch (err) {
                          console.error('Error toggling wardrobe item:', err)
                        }
                      }}
                      className={`p-2.5 rounded-xl border transition-all duration-300 ${
                        isCurated
                          ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                          : 'glass border-white/5 text-white/40 hover:text-rose-400 hover:border-rose-500/30'
                      }`}
                      title={isCurated ? 'Remove from Wardrobe' : 'Add to Wardrobe'}
                    >
                      <Heart className={`w-4 h-4 ${isCurated ? 'fill-rose-400' : ''}`} />
                    </button>
                  </div>
                )
              })}
            </div>

            {/* Footer */}
            <button
              onClick={() => setShowAddModal(false)}
              className="w-full btn-primary py-3 rounded-2xl text-xs font-bold uppercase tracking-wider"
            >
              Save & Done
            </button>
          </div>
        </div>
      )}
    </main>
  )
}

export default function ModelWardrobePage() {
  return (
    <Suspense fallback={<div className="flex h-screen bg-[#050505] text-white flex-col items-center justify-center">Loading Model Studio...</div>}>
      <ModelWardrobeContent />
    </Suspense>
  )
}
