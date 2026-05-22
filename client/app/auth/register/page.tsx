import { Suspense } from 'react'
import AuthRegisterClient from '@/components/AuthRegisterClient'

export const dynamic = 'force-dynamic'

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <AuthRegisterClient />
    </Suspense>
  )
}
