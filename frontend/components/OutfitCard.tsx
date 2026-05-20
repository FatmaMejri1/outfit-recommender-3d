'use client'
import Link from 'next/link'
import { Sparkles, ShoppingBag } from 'lucide-react'

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

interface OutfitCardProps {
  outfit: Outfit
  onTryOn?: (outfit: Outfit) => void
  referrerId?: string
}

export default function OutfitCard({ outfit, onTryOn }: OutfitCardProps) {
  const displayPrice = new Intl.NumberFormat('en-US', {
    style: 'currency', currency: outfit.currency || 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(outfit.price)

  return (
    <div className="group relative flex flex-col animate-fade-in mb-8">
      {/* Image container - Light gray background, sharp edges */}
      <Link href={`/products/${outfit.id}`} className="block relative aspect-[4/5] bg-[#F4F4F2] mb-3 overflow-hidden cursor-pointer">
        {outfit.images?.[0] ? (
          <img
            src={outfit.images[0]}
            alt={outfit.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="w-8 h-8 text-black/10" />
          </div>
        )}

        {/* 3D badge */}
        {outfit.has_3d_model && (
          <div className="absolute top-3 left-3 badge-3d">
            <Sparkles className="w-3 h-3" /> 3D Try-On
          </div>
        )}

        {/* Hover action (Try On) */}
        {outfit.has_3d_model && onTryOn && (
          <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-center">
            <button
              id={`tryon-card-btn-${outfit.id}`}
              onClick={(e) => {
                e.preventDefault()
                onTryOn(outfit)
              }}
              className="w-full btn-primary text-xs py-3"
            >
              Try On in 3D
            </button>
          </div>
        )}
      </Link>

      {/* Content - Name (Left) & Price (Right) */}
      <div className="flex justify-between items-start gap-4">
        <h3 className="font-medium text-black text-xs md:text-sm tracking-wide capitalize truncate">
          {outfit.name.toLowerCase()}
        </h3>
        <p className="text-black text-xs md:text-sm font-medium tracking-wide shrink-0">
          {displayPrice} {outfit.currency || 'USD'}
        </p>
      </div>
    </div>
  )
}
