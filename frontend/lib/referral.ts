export const getReferrer = (): string | null => {
  if (typeof window === 'undefined') return null
  return sessionStorage.getItem('referrer_id')
}

export const setReferrer = (id: string): void => {
  if (typeof window === 'undefined') return
  sessionStorage.setItem('referrer_id', id)
}

export const clearReferrer = (): void => {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem('referrer_id')
}
