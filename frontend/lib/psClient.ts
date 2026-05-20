/**
 * emitUIInteraction helper — sends a JSON command to the Pixel Streaming
 * player embedded in an <iframe>. The PS frontend JS picks it up and
 * forwards it to UE via the data channel.
 *
 * Implements the high-performance 'ui_interaction' direct postMessage interface
 * used in avatarfit-web to bypass backend bridge redirects.
 */
export function emitUIInteraction(
  iframeRef: React.RefObject<HTMLIFrameElement>,
  payload: Record<string, unknown>
): void {
  const iframe = iframeRef.current
  if (!iframe || !iframe.contentWindow) {
    console.warn('[PixelStreaming] iframe not ready')
    return
  }

  const jsonString = JSON.stringify(payload)
  console.log(`[PixelStreaming] Sending UI interaction direct:`, payload)

  // 1. Direct player interface (supported natively by Cirrus player page)
  iframe.contentWindow.postMessage(
    {
      type: 'ui_interaction',
      descriptor: jsonString
    },
    '*'
  )

  // 2. Alternative fallback interface
  iframe.contentWindow.postMessage(
    {
      type: 'emitUIInteraction',
      payload
    },
    '*'
  )
}

/**
 * Direct PS client: POST to the backend tryon/switch endpoint,
 * which relays to UE via the WS bridge as a fallback.
 */
export async function switchOutfitViaApi(
  outfitId: string,
  metahumanId: string
): Promise<void> {
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  await fetch(`${API}/api/tryon/switch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ outfit_id: outfitId, metahuman_id: metahumanId }),
  })
}

