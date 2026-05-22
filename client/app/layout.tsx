import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { LogProvider } from '@/contexts/LogContext'
import { Toaster } from 'react-hot-toast'
import FirstVisitRedirect from '@/components/FirstVisitRedirect'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NutriMind AI - Health & Wellness Tracker',
  description: 'AI-powered health and wellness tracking with doctor integration',
  keywords: ['health', 'wellness', 'tracking', 'nutrition', 'mood', 'AI', 'NutriMind'],
  authors: [{ name: 'NutriMind AI Team' }],
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <FirstVisitRedirect />
        <AuthProvider>
          <LogProvider>
            {children}
            <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          </LogProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
