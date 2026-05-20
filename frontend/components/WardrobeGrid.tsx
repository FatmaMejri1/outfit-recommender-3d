'use client'
import Link from 'next/link'
import { ShoppingBag, Sparkles, Share2 } from 'lucide-react'

interface WardrobeItem {
  id: string
  outfit_id: string
  is_public: boolean
  outfit: {
    id: string
    name: string
    price: number
    currency: string
    images: string[]
    has_3d_model: boolean
    tags: string[]
  }
}

interface Props {
  items: WardrobeItem[]
  isOwner?: boolean
  onTryOn?: (outfitId: string) => void
}

export default function WardrobeGrid({ items, isOwner, onTryOn }: Props) {
  if (items.length === 0) {
    return (
      <div className="bg-white border border-black/10 p-16 text-center space-y-4 shadow-sm">
        <ShoppingBag className="w-12 h-12 text-black/10 mx-auto stroke-[1]" />
        <p className="text-black/50 uppercase tracking-widest text-xs">No items in this wardrobe yet.</p>
        {isOwner && (
          <Link href="/markets" className="btn-primary inline-flex text-xs py-2 px-6">Browse Markets</Link>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {items.map(item => (
        <div key={item.id} className="bg-white border border-black/10 group flex flex-col overflow-hidden animate-fade-in shadow-sm hover:border-black/30 transition-colors">
          <div className="relative h-48 bg-[#f4f4f2] overflow-hidden border-b border-black/5">
            {item.outfit.images?.[0] ? (
              <img src={item.outfit.images[0]} alt={item.outfit.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-black/10 stroke-[1]" />
              </div>
            )}
            {item.outfit.has_3d_model && (
              <div className="absolute top-2 left-2 badge-3d bg-white border-black/10 text-black">
                <Sparkles className="w-2.5 h-2.5 stroke-[1.5]" /> 3D
              </div>
            )}
          </div>
          <div className="p-4 space-y-3 flex-1 flex flex-col">
            <div className="space-y-1">
              <p className="text-xs font-bold text-black uppercase tracking-wide line-clamp-1">{item.outfit.name}</p>
              <p className="text-black text-sm tracking-widest font-medium">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: item.outfit.currency || 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(item.outfit.price)}
              </p>
            </div>
            <div className="flex gap-2 pt-2 mt-auto">
              {item.outfit.has_3d_model && onTryOn && (
                <button id={`wardrobe-tryon-${item.outfit_id}`}
                  onClick={() => onTryOn(item.outfit_id)}
                  className="flex-1 btn-primary text-[10px] py-2">
                  Try On
                </button>
              )}
              <Link href={`/products/${item.outfit_id}`}
                className="flex-1 btn-ghost text-[10px] py-2 text-center border-black/20 hover:border-black">View</Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
