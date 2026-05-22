import { Suspense } from 'react'
import DoctorMessagesClient from '@/components/DoctorMessagesClient'

export const dynamic = 'force-dynamic'

export default function DoctorMessagesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading messages...</div>}>
      <DoctorMessagesClient />
    </Suspense>
  )
}
