'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { adminAPI, AdminUser, handleApiError } from '@/lib/api'

interface AdminAuthContextType {
  admin: AdminUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  refreshAdmin: () => Promise<void>
  error: string | null
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const initialize = async () => {
      const storedAdmin = localStorage.getItem('admin')
      const token = localStorage.getItem('adminToken')

      if (storedAdmin && token) {
        try {
          const parsed = JSON.parse(storedAdmin) as AdminUser
          setAdmin(parsed)
          await refreshAdmin()
        } catch (err) {
          console.error('Failed to parse admin data from localStorage', err)
          localStorage.removeItem('admin')
          localStorage.removeItem('adminToken')
        }
      }

      setLoading(false)
    }

    initialize()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      const { token, admin: adminData } = await adminAPI.login(email, password)

      localStorage.setItem('adminToken', token)
      localStorage.setItem('token', token)
      localStorage.setItem('admin', JSON.stringify(adminData))

      setAdmin(adminData)
      toast.success(`Welcome back, ${adminData.name}!`)
      router.push('/admin/overview')
      return true
    } catch (err) {
      const message = handleApiError(err)
      setError(message)
      toast.error(message)
      console.error('Admin login error:', err)
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = async (): Promise<void> => {
    try {
      setLoading(true)
      localStorage.removeItem('adminToken')
      localStorage.removeItem('admin')
      localStorage.removeItem('token')
      setAdmin(null)
      setError(null)
      toast.success('Admin logged out')
      router.push('/admin/login')
    } finally {
      setLoading(false)
    }
  }

  const refreshAdmin = async (): Promise<void> => {
    try {
      const adminProfile = await adminAPI.getProfile()
      setAdmin(adminProfile)
      localStorage.setItem('admin', JSON.stringify(adminProfile))
    } catch (err: any) {
      console.error('Failed to refresh admin profile', err)
      if (err?.response?.status === 401) {
        await logout()
      }
    }
  }

  const value: AdminAuthContextType = {
    admin,
    loading,
    login,
    logout,
    refreshAdmin,
    error
  }

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
}

