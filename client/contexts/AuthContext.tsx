'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { authAPI, userAPI, handleApiError, User } from '../lib/api'
import toast from 'react-hot-toast'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string, role: 'user' | 'doctor') => Promise<boolean>
  logout: () => Promise<void>
  updateUser: (updates: Partial<User>) => Promise<void>
  refreshProfile: () => Promise<void>
  isDoctor: boolean
  isUser: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in on mount and validate token
    const initializeAuth = async () => {
      const token = localStorage.getItem('token')
      const userData = localStorage.getItem('user')

      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData)
          setUser(parsedUser)

          // Validate token by fetching fresh profile data
          try {
            const freshProfile = await userAPI.getProfile()
            setUser(freshProfile)
            localStorage.setItem('user', JSON.stringify(freshProfile))
          } catch (error) {
            // Token might be invalid, clear auth data
            console.error('Token validation failed:', error)
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            setUser(null)
          }
        } catch (error) {
          console.error('Error parsing user data:', error)
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setUser(null)
        }
      }

      setLoading(false)
    }

    initializeAuth()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      const response = await authAPI.login(email, password)
      const { token, user: userData } = response

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)

      toast.success(`Welcome back, ${userData.name}!`)

      // Redirect based on role
      if (userData.role === 'doctor') {
        router.push('/doctor/dashboard')
      } else {
        router.push('/dashboard')
      }

      return true
    } catch (error) {
      const errorMessage = handleApiError(error)
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('Login error:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string, role: 'user' | 'doctor'): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      const response = await authAPI.register(name, email, password, role)
      const { token, user: userData } = response

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)

      toast.success(`Welcome to Health Tracker, ${userData.name}!`)

      // Redirect based on role
      if (userData.role === 'doctor') {
        router.push('/doctor/dashboard')
      } else {
        router.push('/dashboard')
      }

      return true
    } catch (error) {
      const errorMessage = handleApiError(error)
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('Registration error:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = async (): Promise<void> => {
    try {
      setLoading(true)

      // Call backend logout endpoint
      await authAPI.logout()

      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setUser(null)
      setError(null)

      toast.success('Logged out successfully')
      router.push('/')
    } catch (error) {
      // Even if backend logout fails, clear local data
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setUser(null)
      setError(null)
      router.push('/')
      console.error('Logout error:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateUser = async (updates: Partial<User>): Promise<void> => {
    try {
      setError(null)

      const updatedUser = await userAPI.updateProfile(updates)
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))

      toast.success('Profile updated successfully')
    } catch (error) {
      const errorMessage = handleApiError(error)
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('Update user error:', error)
      throw error
    }
  }

  const refreshProfile = async (): Promise<void> => {
    try {
      const freshProfile = await userAPI.getProfile()
      setUser(freshProfile)
      localStorage.setItem('user', JSON.stringify(freshProfile))
    } catch (error) {
      console.error('Refresh profile error:', error)
      // If refresh fails, user might need to re-login
      if (error && typeof error === 'object' && 'response' in error &&
        (error as any).response?.status === 401) {
        await logout()
      }
    }
  }

  const isDoctor = user?.role === 'doctor'
  const isUser = user?.role === 'user'

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    refreshProfile,
    isDoctor,
    isUser,
    error,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}