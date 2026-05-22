'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import StatsOverview from '@/components/StatsOverview'
import QuickActions from '@/components/QuickActions'
import AIInsights from '@/components/AIInsights'
import LoadingSpinner from '@/components/LoadingSpinner'
import RangeWellnessTracker from '@/components/RangeWellnessTracker'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    } else if (!loading && user && user.role === 'doctor') {
      router.push('/doctor/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return null
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'insights', label: 'AI Insights', icon: '🤖' },
    { id: 'wellness', label: 'Wellness Range', icon: '📅' }
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">
            Welcome back, {user.name}! 👋
          </h1>
          <p className="text-primary-100">
            Ready to continue your wellness journey? Let's track your progress today.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <StatsOverview />
                <QuickActions />
              </div>
            )}

            {activeTab === 'insights' && (
              <AIInsights />
            )}

            {activeTab === 'wellness' && (
              <RangeWellnessTracker />
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
