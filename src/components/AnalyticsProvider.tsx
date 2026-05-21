'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export function trackClick(target: string, metadata?: any) {
  const user = typeof window !== 'undefined' ? localStorage.getItem('wk_user') : null
  const userData = user ? JSON.parse(user) : null

  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'click',
      target,
      path: window.location.pathname,
      userId: userData?.email || userData?.phone || 'Guest',
      metadata
    })
  }).catch(() => {})
}

export default function AnalyticsProvider() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const user = localStorage.getItem('wk_user')
    const userData = user ? JSON.parse(user) : null

    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'visit',
        path: pathname + (searchParams.toString() ? '?' + searchParams.toString() : ''),
        userId: userData?.email || userData?.phone || 'Guest'
      })
    }).catch(() => {})
  }, [pathname, searchParams])

  return null
}
