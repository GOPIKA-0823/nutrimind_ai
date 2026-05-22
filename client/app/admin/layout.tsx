import type { Metadata } from 'next'
import { AdminAuthProvider } from '@/contexts/AdminAuthContext'

export const metadata: Metadata = {
  title: 'Admin | NutriMind AI',
  description: 'Administrative console for NutriMind AI platform',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      {children}
    </AdminAuthProvider>
  )
}

