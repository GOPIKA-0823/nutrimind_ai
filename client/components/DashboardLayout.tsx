'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import {
  Heart,
  Home,
  Calendar,
  BarChart3,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  Bell,
  Target,
  Clock,
  Bot
} from 'lucide-react'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const pathname = usePathname()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Daily Logs', href: '/dashboard/logs', icon: Calendar },
    { name: 'Goals', href: '/dashboard/goals', icon: Target },
    { name: 'Appointments', href: '/dashboard/appointments', icon: Clock },
    { name: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
    { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
    { name: 'AI Assistant', href: '/dashboard/ai-assistant', icon: Bot },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ]

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gradient">NutriMind AI</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive(item.href)
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
          <div className="flex-shrink-0 border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                  {user?.name ? (
                    <span className="text-sm font-semibold text-primary-600">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  ) : (
                    <User className="h-5 w-5 text-primary-600" />
                  )}
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-700">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role || 'user'}</p>
              </div>
              <button
                onClick={() => {
                  logout()
                  setSidebarOpen(false)
                }}
                className="ml-2 text-gray-400 hover:text-gray-600"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gradient">NutriMind AI</span>
            </div>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive(item.href)
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
          <div className="flex-shrink-0 border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                  {user?.name ? (
                    <span className="text-sm font-semibold text-primary-600">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  ) : (
                    <User className="h-5 w-5 text-primary-600" />
                  )}
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-700">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role || 'user'}</p>
              </div>
              <button
                onClick={logout}
                className="ml-2 text-gray-400 hover:text-gray-600"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Separator */}
          <div className="h-6 w-px bg-gray-200 lg:hidden" />

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="relative flex flex-1 items-center">
              {/* Search removed */}
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <button
                type="button"
                className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
              >
                <Bell className="h-6 w-6" />
              </button>

              {/* Separator */}
              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />

              {/* Profile dropdown */}
              <div className="relative">
                <button className="-m-1.5 flex items-center p-1.5 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                    {user?.email ? (
                      <span className="text-sm font-semibold text-primary-600">
                        {user.email.charAt(0).toUpperCase()}
                      </span>
                    ) : (
                      <User className="h-5 w-5 text-primary-600" />
                    )}
                  </div>
                  <span className="hidden lg:flex lg:items-center">
                    <span className="ml-4 text-sm font-semibold leading-6 text-gray-900" aria-hidden="true">
                      {user?.name || 'User'}
                    </span>
                    {user?.role && (
                      <span className="ml-2 text-xs text-gray-500 capitalize">
                        ({user.role})
                      </span>
                    )}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
