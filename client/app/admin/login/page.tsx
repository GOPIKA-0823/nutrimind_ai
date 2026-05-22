'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { ShieldCheck, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { admin, login, loading } = useAdminAuth()
  const router = useRouter()

  useEffect(() => {
    if (admin) {
      router.replace('/admin/overview')
    }
  }, [admin, router])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    await login(email, password)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white/5 p-8 shadow-xl backdrop-blur">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-500/10">
            <ShieldCheck className="h-8 w-8 text-primary-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">Admin Portal</h1>
          <p className="mt-2 text-sm text-slate-300">
            Sign in with your administrator credentials
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-200">
              Email Address
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-transparent bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-400 shadow-inner focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-400/40"
                placeholder="admin@example.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-200">
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-transparent bg-white/5 py-3 pl-10 pr-12 text-sm text-white placeholder-slate-400 shadow-inner focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-400/40"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-lg bg-primary-500 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-400">
          <p>
            Need help? Contact{' '}
            <Link href="mailto:support@nutrimind.ai" className="text-primary-300 hover:text-primary-200">
              support@nutrimind.ai
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

