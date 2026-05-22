'use client'

import { useState, useEffect } from 'react'
import { DollarSign, TrendingUp, Calendar, Video, Phone } from 'lucide-react'
import toast from 'react-hot-toast'

interface EarningsData {
  totalEarnings: number
  totalAppointments: number
  earningsByType: {
    video: number
    phone: number
  }
  appointments: Array<{
    id: string
    amount: number
    currency: string
    type: string
    scheduledAt: string
    paidAt: string
  }>
}

export default function DoctorEarnings() {
  const [earnings, setEarnings] = useState<EarningsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('month')

  useEffect(() => {
    fetchEarnings()
  }, [period])

  const fetchEarnings = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')

      let url = '/api/appointments/payments/earnings'
      const params = new URLSearchParams()

      if (period === 'week') {
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        params.append('startDate', weekAgo.toISOString())
      } else if (period === 'month') {
        const monthAgo = new Date()
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        params.append('startDate', monthAgo.toISOString())
      }

      if (params.toString()) {
        url += '?' + params.toString()
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch earnings')
      }

      const data = await response.json()
      setEarnings(data)
    } catch (error: any) {
      console.error('Error fetching earnings:', error)
      toast.error('Failed to load earnings')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (!earnings) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">No earnings data available</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Earnings</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setPeriod('week')}
              className={`px-3 py-1 text-xs rounded-md ${period === 'week'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Week
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`px-3 py-1 text-xs rounded-md ${period === 'month'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Month
            </button>
            <button
              onClick={() => setPeriod('all')}
              className={`px-3 py-1 text-xs rounded-md ${period === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              All Time
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Total Earnings */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Earnings</p>
              <p className="text-3xl font-bold text-gray-900">
                ₹{earnings.totalEarnings.toFixed(2)}
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            From {earnings.totalAppointments} paid appointment{earnings.totalAppointments !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Earnings by Type */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Video className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-medium text-gray-600">Video Call</span>
            </div>
            <p className="text-lg font-bold text-gray-900">
              ₹{earnings.earningsByType.video.toFixed(2)}
            </p>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Phone className="h-4 w-4 text-green-600" />
              <span className="text-xs font-medium text-gray-600">Phone Call</span>
            </div>
            <p className="text-lg font-bold text-gray-900">
              ₹{earnings.earningsByType.phone.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Recent Payments */}
        {earnings.appointments.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Recent Payments</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {earnings.appointments.slice(0, 10).map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <DollarSign className="h-4 w-4 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        ₹{apt.amount.toFixed(2)} - {apt.type.charAt(0).toUpperCase() + apt.type.slice(1)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(apt.paidAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Paid
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {earnings.appointments.length === 0 && (
          <div className="text-center py-8">
            <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No payments received yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

