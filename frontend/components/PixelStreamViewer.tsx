'use client'
import { useRef, useEffect } from 'react'
import { Maximize2 } from 'lucide-react'
import { emitUIInteraction, switchOutfitViaApi } from '@/lib/psClient'

interface PixelStreamViewerProps {
  streamUrl: string
  metahumanId: string
  currentOutfitId?: string
  skmAssetKey?: string
}

export default function PixelStreamViewer({
  streamUrl,
  metahumanId,
  skmAssetKey,
}: PixelStreamViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const triggerDirectSwitch = () => {
    if (skmAssetKey) {
      console.log(`[PixelStreaming] Direct WebRTC Switch: ${skmAssetKey} on ${metahumanId}`)
      emitUIInteraction(iframeRef, {
        action: 'SWITCH_OUTFIT',
        metahuman_id: metahumanId,
        skm_asset_key: skmAssetKey,
      })
    }
  }

  // Listen for PS ready signal
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      // Epic Games Cirrus player page triggers "ps_ready" or "video_play" when connected
      if (event.data?.type === 'ps_ready' || event.data?.type === 'video_play') {
        console.log('[PixelStreaming] Player ready signal received!')
        triggerDirectSwitch()
      }
    }
    window.addEventListener('message', handler)

    // Fallback Timer: If "ps_ready" is not posted by the custom html,
    // trigger direct switch 3.5 seconds after iframe loads to ensure outfit swaps.
    const fallbackTimer = setTimeout(() => {
      console.log('[PixelStreaming] Fallback load timer reached — triggering direct switch')
      triggerDirectSwitch()
    }, 3500)

    return () => {
      window.removeEventListener('message', handler)
      clearTimeout(fallbackTimer)
    }
  }, [metahumanId, skmAssetKey])

  const handleFullscreen = () => {
    iframeRef.current?.requestFullscreen?.()
  }

  return (
    <div className="relative w-full h-full min-h-[400px] rounded-2xl overflow-hidden bg-black group">
      <iframe
        ref={iframeRef}
        id="ps-iframe"
        src={streamUrl}
        className="w-full h-full border-0"
        allow="camera; microphone; autoplay; fullscreen"
        title="Pixel Streaming — 3D Avatar Try-On"
      />

      {/* Fullscreen button */}
      <button
        id="ps-fullscreen-btn"
        onClick={handleFullscreen}
        className="absolute top-3 right-3 p-2 glass rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        title="Fullscreen"
      >
        <Maximize2 className="w-4 h-4 text-white" />
      </button>

      {/* Metahuman label */}
      <div className="absolute bottom-3 left-3 glass px-3 py-1.5 rounded-lg text-xs text-white/60">
        Avatar: <span className="text-brand-300 font-medium">{metahumanId}</span>
      </div>
    </div>
  )
}

// Exposed helper so parent can trigger an outfit switch on the already-loaded stream
export async function switchLiveOutfit(outfitId: string, metahumanId: string) {
  await switchOutfitViaApi(outfitId, metahumanId)
}

