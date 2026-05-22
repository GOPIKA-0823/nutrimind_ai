'use client'

import { useAuth } from '@/contexts/AuthContext'
import LandingPage from '@/components/LandingPage'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function Home() {
  const { loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  return <LandingPage />
}
