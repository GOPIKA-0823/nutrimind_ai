import { Suspense } from 'react'
import AuthLoginClient from '@/components/AuthLoginClient'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <AuthLoginClient />
    </Suspense>
  )
}
