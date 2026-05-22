'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import AdminDashboardLayout from '@/components/AdminDashboardLayout'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function AdminDashboardGroupLayout({ children }: { children: React.ReactNode }) {
  const { admin, loading } = useAdminAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !admin) {
      router.replace('/admin/login')
    }
  }, [admin, loading, router, pathname])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <LoadingSpinner text="Preparing admin console..." />
      </div>
    )
  }

  if (!admin) {
    return null
  }

  return <AdminDashboardLayout>{children}</AdminDashboardLayout>
}

