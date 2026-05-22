'use client'

import { useEffect, useMemo, useState } from 'react'
import { adminAPI } from '@/lib/api'
import LoadingSpinner from '@/components/LoadingSpinner'
import { CalendarDays, Filter, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

interface AdminAppointment {
  _id: string
  doctor?: { name: string; email: string }
  patient?: { name: string; email: string }
  scheduledAt: string
  type: string
  status: string
  createdAt?: string
}

const typeBadges: Record<string, string> = {
  chat: 'bg-blue-100 text-blue-700',
  video: 'bg-purple-100 text-purple-700',
  'in-person': 'bg-emerald-100 text-emerald-700'
}

const statusBadges: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-slate-200 text-slate-800',
  cancelled: 'bg-rose-100 text-rose-700',
  'in-progress': 'bg-amber-100 text-amber-700',
  'no-show': 'bg-gray-200 text-gray-600'
}

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<AdminAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all')

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getAppointments()
      setAppointments(response.appointments || [])
    } catch (err) {
      console.error('Failed to load appointments', err)
      toast.error('Unable to load appointments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  const filteredAppointments = useMemo(() => {
    if (filter === 'all') {
      return appointments
    }

    const now = new Date()
    return appointments.filter((appointment) => {
      const date = new Date(appointment.scheduledAt)
      if (filter === 'upcoming') {
        return date >= now
      }
      return date < now
    })
  }, [appointments, filter])

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary-100 p-3">
            <CalendarDays className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Appointment Management</h1>
            <p className="text-sm text-gray-500">View all appointments across doctors and patients</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAppointments}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </header>

      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Appointments ({filteredAppointments.length})
            </h2>
            <p className="text-sm text-gray-500">
              Filter, review, and monitor scheduling activity
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
            >
              <option value="all">All Appointments</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex min-h-[200px] items-center justify-center">
              <LoadingSpinner text="Loading appointments..." />
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="px-6 py-3">Patient</th>
                  <th className="px-6 py-3">Doctor</th>
                  <th className="px-6 py-3">Scheduled</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white text-sm text-gray-700">
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No appointments match the selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((appointment) => (
                    <tr key={appointment._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{appointment.patient?.name || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{appointment.patient?.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{appointment.doctor?.name || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{appointment.doctor?.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        {new Date(appointment.scheduledAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium capitalize ${
                          typeBadges[appointment.type] || 'bg-gray-200 text-gray-700'
                        }`}>
                          {appointment.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                          statusBadges[appointment.status] || 'bg-gray-200 text-gray-700'
                        }`}>
                          {appointment.status.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {appointment.createdAt ? new Date(appointment.createdAt).toLocaleString() : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  )
}

