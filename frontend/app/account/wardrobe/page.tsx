'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import WardrobeGrid from '@/components/WardrobeGrid'
import TryOnPopup from '@/components/TryOnPopup'
import { useAuth } from '@/lib/auth-context'
import {
  Sparkles,
  Share2,
  Wallet,
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  CheckCircle,
  HelpCircle,
  Clock,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'

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

interface Transaction {
  id: string
  type: 'COMMISSION' | 'PAYOUT' | 'PURCHASE'
  amount: number
  currency: string
  description: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
  created_at: string
}

export default function MyWardrobePage() {
  const { user } = useAuth()
  const [items, setItems] = useState<WardrobeItem[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [txLoading, setTxLoading] = useState(true)
  const [tryOnOutfit, setTryOnOutfit] = useState<any | null>(null)
  const [copied, setCopied] = useState(false)

  // Fetch own wardrobe
  useEffect(() => {
    if (user) {
      api.get<WardrobeItem[]>('/api/wardrobe/me')
        .then(res => setItems(res))
        .catch(err => console.error('Error fetching own wardrobe:', err))
        .finally(() => setLoading(false))
    }
  }, [user])

  // Fetch own financial transactions
  useEffect(() => {
    if (user) {
      api.get<Transaction[]>('/api/transactions/me')
        .then(res => setTransactions(res))
        .catch(err => console.error('Error fetching transactions:', err))
        .finally(() => setTxLoading(false))
    }
  }, [user])

  const copyShareLink = () => {
    if (typeof window !== 'undefined' && user) {
      const link = `${window.location.origin}/wardrobe/${user.id}`
      navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-black uppercase tracking-widest">Please sign in to view your wardrobe</h2>
        <Link href="/login" className="btn-primary inline-flex">Sign In</Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 space-y-16 page-enter bg-[#f8f7f5] min-h-screen">
      {/* Page Header */}
      <div className="border-b border-black/10 pb-6 text-center">
        <h1 className="text-3xl font-serif font-bold text-black uppercase tracking-widest">My Creator Dashboard</h1>
        <p className="text-sm text-black/60 mt-3 tracking-wide">Manage your wardrobe collection, view referrals, and track financial earnings.</p>
      </div>

      {/* Wallet / Commission metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 flex items-center justify-between border border-black/10 shadow-sm">
          <div className="space-y-2">
            <p className="text-xs font-bold text-black uppercase tracking-[0.2em]">Wallet Balance</p>
            <p className="text-3xl font-serif font-black text-black tracking-widest">${(user.wallet_balance ?? 0).toFixed(2)}</p>
          </div>
          <div className="p-3">
            <Wallet className="w-8 h-8 text-black stroke-[1]" />
          </div>
        </div>

        <div className="bg-white p-8 flex items-center justify-between border border-black/10 shadow-sm">
          <div className="space-y-2">
            <p className="text-xs font-bold text-black uppercase tracking-[0.2em]">Social Referrals</p>
            <p className="text-3xl font-serif font-black text-black tracking-widest">10%</p>
            <p className="text-[10px] uppercase text-black/50 tracking-widest">Commission Rate</p>
          </div>
          <div className="p-3">
            <Coins className="w-8 h-8 text-black stroke-[1]" />
          </div>
        </div>

        <div className="bg-[#f4f4f2] p-8 flex flex-col justify-center gap-4 border border-black/10">
          <p className="text-xs font-bold text-black uppercase tracking-[0.2em]">Share & Earn</p>
          <button
            onClick={copyShareLink}
            className="btn-primary py-3 px-6 text-xs flex items-center justify-center gap-3 w-full font-bold uppercase tracking-widest shadow-md"
          >
            <Share2 className="w-4 h-4" /> {copied ? 'Copied link!' : 'Copy Referral Link'}
          </button>
        </div>
      </div>

      {/* Wardrobe listing */}
      <div className="space-y-8">
        <div className="border-b border-black/10 pb-4">
          <h2 className="text-xl font-serif font-bold text-black uppercase tracking-widest">Curated Wardrobe</h2>
          <p className="text-xs text-black/50 mt-2 uppercase tracking-wide">Manage your purchased items and try-ons</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white border border-black/5 h-80 animate-pulse shadow-sm" />
            ))}
          </div>
        ) : (
          <WardrobeGrid
            items={items}
            isOwner={true}
            onTryOn={id => {
              const matched = items.find(i => i.outfit_id === id)
              if (matched) setTryOnOutfit(matched.outfit)
            }}
          />
        )}
      </div>

      {/* Financial Ledger & Commissions Workflow Table */}
      <div className="space-y-8">
        <div className="border-b border-black/10 pb-4">
          <h2 className="text-xl font-serif font-bold text-black uppercase tracking-widest">Financial Ledger</h2>
          <p className="text-xs text-black/50 mt-2 uppercase tracking-wide">Real-time breakdown of affiliate commissions and purchases</p>
        </div>

        {txLoading ? (
          <div className="bg-white p-8 border border-black/5 animate-pulse space-y-6">
            <div className="h-6 bg-black/5 w-1/3" />
            <div className="h-24 bg-black/5" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="bg-white p-16 text-center border border-black/10 shadow-sm space-y-4">
            <Coins className="w-10 h-10 mx-auto text-black/20 stroke-[1]" />
            <p className="text-xs uppercase tracking-widest text-black/50 max-w-md mx-auto leading-relaxed">No transactions recorded yet. Share your profile link to earn commissions!</p>
          </div>
        ) : (
          <div className="bg-white border border-black/10 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-black/10 bg-[#f4f4f2]">
                    <th className="px-6 py-5 text-[10px] font-bold text-black uppercase tracking-[0.2em]">Date</th>
                    <th className="px-6 py-5 text-[10px] font-bold text-black uppercase tracking-[0.2em]">Type</th>
                    <th className="px-6 py-5 text-[10px] font-bold text-black uppercase tracking-[0.2em]">Description</th>
                    <th className="px-6 py-5 text-[10px] font-bold text-black uppercase tracking-[0.2em]">Amount</th>
                    <th className="px-6 py-5 text-[10px] font-bold text-black uppercase tracking-[0.2em]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {transactions.map(tx => {
                    const isEarning = tx.type === 'COMMISSION'
                    const isPurchase = tx.type === 'PURCHASE'
                    return (
                      <tr key={tx.id} className="hover:bg-gray-50 transition-all">
                        {/* Date */}
                        <td className="px-6 py-5 whitespace-nowrap text-xs text-black/80 font-medium tracking-wide">
                          <span className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-black/30 stroke-[1.5]" />
                            {new Date(tx.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            }).toUpperCase()}
                          </span>
                        </td>

                        {/* Type Badge */}
                        <td className="px-6 py-5 whitespace-nowrap">
                          {tx.type === 'COMMISSION' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] border border-green-600 text-green-700 bg-white">
                              <ArrowUpRight className="w-3 h-3 stroke-[2]" /> COMMISSION
                            </span>
                          )}
                          {tx.type === 'PURCHASE' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] border border-black/20 text-black bg-white">
                              <ArrowDownLeft className="w-3 h-3 stroke-[2]" /> PURCHASE
                            </span>
                          )}
                          {tx.type === 'PAYOUT' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] border border-black text-black bg-black/5">
                              <Coins className="w-3 h-3 stroke-[2]" /> PAYOUT
                            </span>
                          )}
                        </td>

                        {/* Description */}
                        <td className="px-6 py-5 text-xs text-black/70 max-w-xs md:max-w-md truncate tracking-wide">
                          {tx.description}
                        </td>

                        {/* Amount */}
                        <td className={`px-6 py-5 whitespace-nowrap text-sm font-bold tracking-widest`}>
                          <span className={isEarning ? 'text-green-700' : isPurchase ? 'text-black' : 'text-black'}>
                            {isEarning ? '+' : ''}
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: tx.currency
                            }).format(tx.amount)}
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td className="px-6 py-5 whitespace-nowrap">
                          {tx.status === 'COMPLETED' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-green-700">
                              <CheckCircle className="w-3 h-3 stroke-[2]" /> DONE
                            </span>
                          )}
                          {tx.status === 'PENDING' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-orange-600">
                              <Clock className="w-3 h-3 animate-spin stroke-[2]" /> PENDING
                            </span>
                          )}
                          {tx.status === 'FAILED' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-red-600">
                              <AlertTriangle className="w-3 h-3 stroke-[2]" /> FAILED
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {tryOnOutfit && (
        <TryOnPopup outfit={tryOnOutfit} onClose={() => setTryOnOutfit(null)} />
      )}
    </div>
  )
}
