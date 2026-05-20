import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'FashionVerse — AI-Powered 3D Try-On Platform',
  description: 'Browse top fashion brands, try outfits on your personal 3D MetaHuman avatar powered by Unreal Engine 5 Pixel Streaming, and shop with confidence.',
  keywords: ['fashion', 'virtual try-on', '3D avatar', 'MetaHuman', 'Unreal Engine', 'Pixel Streaming'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#f8f7f5] text-[#111111]">
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}
