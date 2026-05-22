'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import DailyLogForm from '@/components/DailyLogForm'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function LogsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">
            Daily Logs 📝
          </h1>
          <p className="text-primary-100">
            Track your daily activities, mood, and health metrics.
          </p>
        </div>

        {/* Content */}
        <div>
          <DailyLogForm />
        </div>
      </div>
    </DashboardLayout>
  )
}
