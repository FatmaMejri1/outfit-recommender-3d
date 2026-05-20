'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { ShoppingBag, User, Search, Wallet, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'

export default function Navbar() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const navLinks = [
    { href: '/', label: 'Shop All' },
    { href: '/markets', label: 'Markets' },
    { href: '/models', label: 'Models' },
    { href: '/search', label: 'Search' },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-black/10 px-4 md:px-8">
      <div className="max-w-7xl mx-auto h-16 grid grid-cols-3 items-center">
        {/* Left: Mobile hamburger or Links */}
        <div className="flex items-center gap-4">
          <button
            className="p-2 text-black hover:text-gray-600 transition-colors"
            onClick={() => setMobileOpen(o => !o)}
          >
            {mobileOpen ? <X className="w-5 h-5 stroke-[1.5]" /> : <Menu className="w-5 h-5 stroke-[1.5]" />}
          </button>
          
          <div className="hidden md:flex items-center gap-6">
            {navLinks.slice(0, 2).map(l => (
              <Link
                key={l.href}
                href={l.href}
                className={clsx(
                  'text-sm font-medium tracking-wide uppercase transition-all duration-200 hover:opacity-50',
                  pathname === l.href ? 'text-black' : 'text-black/80'
                )}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Center: Logo */}
        <div className="flex justify-center">
          <Link href="/" className="flex items-center">
            <span className="font-serif font-bold text-xl md:text-2xl tracking-widest text-black uppercase">
              FashionVerse
            </span>
          </Link>
        </div>

        {/* Right side: Icons */}
        <div className="flex items-center justify-end gap-4 md:gap-6">
          <Link href="/search" className="text-black hover:text-gray-600 transition-colors">
            <Search className="w-5 h-5 stroke-[1.5]" />
          </Link>

          {user ? (
            <div className="relative">
              <button
                id="profile-menu-btn"
                onClick={() => setProfileOpen(o => !o)}
                className="text-black hover:text-gray-600 transition-colors flex items-center gap-2"
              >
                <User className="w-5 h-5 stroke-[1.5]" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-12 w-56 bg-white border border-black/10 p-2 shadow-sm z-50 animate-fade-in">
                  <div className="px-3 py-3 border-b border-black/5 mb-1">
                    <p className="text-xs uppercase tracking-widest text-black/50 mb-1">Wallet</p>
                    <p className="font-semibold text-black flex items-center gap-2">
                      <Wallet className="w-4 h-4 stroke-[1.5]" /> ${(user.wallet_balance ?? 0).toFixed(2)}
                    </p>
                  </div>
                  <Link
                    href="/account/wardrobe"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-sm text-black hover:bg-gray-50 transition-all uppercase tracking-wide"
                  >
                    <ShoppingBag className="w-4 h-4 stroke-[1.5]" /> My Wardrobe
                  </Link>
                  <Link
                    href="/account/avatar"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-sm text-black hover:bg-gray-50 transition-all uppercase tracking-wide"
                  >
                    <User className="w-4 h-4 stroke-[1.5]" /> My Avatar
                  </Link>
                  <button
                    id="logout-btn"
                    onClick={() => { logout(); setProfileOpen(false) }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-black hover:bg-gray-50 transition-all uppercase tracking-wide mt-1 border-t border-black/5 pt-3"
                  >
                    <LogOut className="w-4 h-4 stroke-[1.5]" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="text-black hover:text-gray-600 transition-colors">
              <User className="w-5 h-5 stroke-[1.5]" />
            </Link>
          )}

          <Link href="/account/wardrobe" className="text-black hover:text-gray-600 transition-colors">
            <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
          </Link>
        </div>
      </div>

      {/* Mobile/Desktop expanded menu */}
      {mobileOpen && (
        <div className="border-t border-black/10 py-4 flex flex-col gap-2 animate-fade-in bg-white absolute left-0 w-full px-4 shadow-sm">
          {navLinks.map(l => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className={clsx(
                'px-2 py-3 text-sm font-medium tracking-widest uppercase transition-all',
                pathname === l.href ? 'text-black' : 'text-black/60 hover:text-black hover:bg-gray-50'
              )}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
