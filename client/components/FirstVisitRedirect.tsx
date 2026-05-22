'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

export default function FirstVisitRedirect() {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!pathname) return
    if (pathname === '/') return

    const key = 'visitedHome'
    const hasVisited = sessionStorage.getItem(key)

    if (!hasVisited) {
      sessionStorage.setItem(key, 'true')
      router.replace('/')
    }
  }, [pathname, router])

  return null
}