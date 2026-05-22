'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  CalendarDays,
  LogOut,
  Menu,
  X,
  ShieldCheck
} from 'lucide-react'
import { useAdminAuth } from '@/contexts/AdminAuthContext'

interface AdminDashboardLayoutProps {
  children: React.ReactNode
}

const navigation = [
  { name: 'Overview', href: '/admin/overview', icon: LayoutDashboard },
  { name: 'Doctors', href: '/admin/doctors', icon: Stethoscope },
  { name: 'Patients', href: '/admin/patients', icon: Users },
  { name: 'Appointments', href: '/admin/appointments', icon: CalendarDays }
]

export default function AdminDashboardLayout({ children }: AdminDashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { admin, logout } = useAdminAuth()

  const isActive = (href: string) => pathname.startsWith(href)

  const NavigationLinks = () => (
    <nav className="mt-8 space-y-1">
      {navigation.map((item) => {
        const Icon = item.icon
        const active = isActive(item.href)
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={() => setSidebarOpen(false)}
            className={`group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <Icon className={`mr-3 h-5 w-5 ${active ? 'text-primary-700' : 'text-gray-400 group-hover:text-gray-500'}`} />
            {item.name}
          </Link>
        )
      })}
    </nav>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600/70" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-7 w-7 text-primary-600" />
              <span className="text-lg font-semibold text-gray-900">Admin Console</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-md p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4">
            <NavigationLinks />
          </div>
          <div className="border-t border-gray-200 p-4">
            <button
              onClick={logout}
              className="flex w-full items-center justify-center space-x-2 rounded-md bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col lg:border-r lg:border-gray-200 lg:bg-white">
        <div className="flex h-16 shrink-0 items-center gap-x-3 border-b border-gray-200 px-6">
          <ShieldCheck className="h-7 w-7 text-primary-600" />
          <div>
            <p className="text-base font-semibold text-gray-900">Admin Console</p>
            <p className="text-xs text-gray-500">NutriMind AI Platform</p>
          </div>
        </div>
        <div className="flex flex-1 flex-col overflow-y-auto px-6 pb-6 pt-4">
          <NavigationLinks />
          <div className="mt-auto rounded-lg bg-slate-100 p-4">
            <p className="text-sm font-semibold text-gray-800">{admin?.name || 'Administrator'}</p>
            <p className="text-xs text-gray-500">{admin?.email}</p>
            <button
              onClick={logout}
              className="mt-4 inline-flex w-full items-center justify-center space-x-2 rounded-md bg-red-500 px-3 py-2 text-sm font-medium text-white hover:bg-red-600"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Content area */}
      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-600 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="h-6 w-px bg-gray-200 lg:hidden" />
          <div className="flex flex-1 items-center justify-between">
            <h1 className="text-lg font-semibold text-gray-900 capitalize">
              {navigation.find((item) => pathname.startsWith(item.href))?.name || 'Dashboard'}
            </h1>
            <div className="hidden items-center gap-3 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 sm:flex">
              <ShieldCheck className="h-4 w-4 text-primary-600" />
              <span>Secure Admin Access</span>
            </div>
          </div>
        </header>
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

