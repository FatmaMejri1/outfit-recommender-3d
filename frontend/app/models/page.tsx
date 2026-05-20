'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import Link from 'next/link'
import { Sparkles, User, Shirt, Compass, ArrowRight } from 'lucide-react'

interface Model {
  id: string
  display_name: string
  photo: string | null
  bodyDescription: string | null
  clothesTaste: string | null
}

interface Outfit {
  id: string
  name: string
  style_type: string
}

export default function ModelsPage() {
  const [models, setModels] = useState<Model[]>([])
  const [outfits, setOutfits] = useState<Outfit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Parallel fetch models and outfits to dynamically resolve style matching
    Promise.all([
      api.get<Model[]>('/api/models'),
      api.get<Outfit[]>('/api/outfits')
    ])
      .then(([modelsRes, outfitsRes]) => {
        setModels(modelsRes)
        setOutfits(outfitsRes)
      })
      .catch(err => console.error('Error loading models catalog:', err))
      .finally(() => setLoading(false))
  }, [])

  // Dynamic style matching helper linking model DNA to catalog products
  const getOutfitIdForModel = (modelName: string): string | null => {
    if (!outfits.length) return null
    
    const name = modelName.toLowerCase()
    if (name.includes('ali')) {
      // Ali Ben Salah -> Nike Tech Fleece (Streetwear)
      const found = outfits.find(o => o.style_type?.toLowerCase() === 'streetwear')
      return found ? found.id : outfits[0].id
    }
    if (name.includes('sara')) {
      // Sara Mansour -> Evening Gown (Formal / Classic)
      const found = outfits.find(o => o.name.toLowerCase().includes('gown'))
      return found ? found.id : outfits[0].id
    }
    if (name.includes('lina')) {
      // Lina Bouaziz -> Zara Denim Jacket (Casual / Classic)
      const found = outfits.find(o => o.name.toLowerCase().includes('jacket'))
      return found ? found.id : outfits[0].id
    }
    return outfits[0].id
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-12 page-enter">
      {/* Title Header Section */}
      <div className="text-center md:text-left space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-500/10 border border-brand-500/20 rounded-full text-xs font-bold uppercase tracking-wider text-brand-300">
          <Sparkles className="w-3.5 h-3.5" /> Elite Digital Avatars
        </div>
        <h1 className="text-4xl font-extrabold text-white tracking-tight">
          Models Directory & <span className="text-gradient bg-gradient-to-r from-brand-400 to-indigo-400">Style DNA</span>
        </h1>
        <p className="text-white/60 max-w-2xl text-base leading-relaxed">
          Meet our digital models, discover their anatomical body genetics, and instantly test their personalized style catalogs inside our real-time 3D Virtual Try-On cockpit.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass h-[450px] animate-pulse rounded-3xl" />
          ))}
        </div>
      ) : models.length === 0 ? (
        <div className="text-center py-16 glass rounded-3xl border border-white/5 space-y-4">
          <User className="w-12 h-12 text-white/10 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Models Registered</h3>
          <p className="text-sm text-white/40 max-w-xs mx-auto">Models will appear here once users are flagged as models inside the database schema.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {models.map(model => {
            const wardrobeLink = `/models/${model.id}`
            
            return (
              <div
                key={model.id}
                className="glass border border-white/5 hover:border-brand-500/30 rounded-3xl overflow-hidden flex flex-col h-[480px] group transition-all duration-300 hover:shadow-[0_0_30px_rgba(139,92,246,0.08)] animate-fade-in"
              >
                {/* Photo Header container */}
                <div className="h-52 w-full overflow-hidden relative bg-surface-800">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d0e15] via-transparent to-black/30 z-10" />
                  
                  {model.photo ? (
                    <img
                      src={model.photo}
                      alt={model.display_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-brand-500/5">
                      <User className="w-16 h-16 text-brand-300/10" />
                    </div>
                  )}

                  {/* Brand Tag badge */}
                  <div className="absolute top-4 left-4 z-20 badge-3d">
                    Model Active
                  </div>
                </div>

                {/* Model Profiles Info */}
                <div className="p-6 flex flex-col flex-1 justify-between space-y-4">
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-white tracking-tight">{model.display_name}</h3>
                    
                    {/* Anatomical stats */}
                    <div className="space-y-1">
                      <span className="text-[9px] font-black uppercase tracking-widest text-brand-400 flex items-center gap-1">
                        <Compass className="w-3 h-3" /> Body Fit genetics
                      </span>
                      <p className="text-xs text-white/70 leading-relaxed font-medium bg-white/5 px-3 py-2 rounded-xl border border-white/5">
                        {model.bodyDescription || 'Standard athletic metahuman sizing'}
                      </p>
                    </div>

                    {/* Clothes Taste Preference */}
                    <div className="space-y-1">
                      <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-1">
                        <Shirt className="w-3 h-3" /> Wardrobe aesthetics
                      </span>
                      <p className="text-xs text-white/50 leading-relaxed line-clamp-3">
                        {model.clothesTaste || 'Flexible catalog fits & contemporary sportswear.'}
                      </p>
                    </div>
                  </div>

                  {/* Deep link studio button */}
                  <Link
                    href={wardrobeLink}
                    className="w-full btn-primary py-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold tracking-wider uppercase transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                  >
                    View Curated Wardrobe
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
