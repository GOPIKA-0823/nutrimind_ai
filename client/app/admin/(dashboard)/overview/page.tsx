'use client'

import { useEffect, useState } from 'react'
import { adminAPI } from '@/lib/api'
import LoadingSpinner from '@/components/LoadingSpinner'
import { CalendarDays, Stethoscope, Users } from 'lucide-react'

interface OverviewSummary {
  doctors: number
  patients: number
  appointments: number
}

interface RecentAppointment {
  _id: string
  doctor?: { name: string; email: string }
  patient?: { name: string; email: string }
  scheduledAt: string
  type: string
  status: string
}

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-slate-200 text-slate-700',
  cancelled: 'bg-rose-100 text-rose-700',
  'in-progress': 'bg-amber-100 text-amber-700',
  'no-show': 'bg-gray-200 text-gray-600'
}

export default function AdminOverviewPage() {
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<OverviewSummary>({ doctors: 0, patients: 0, appointments: 0 })
  const [appointments, setAppointments] = useState<RecentAppointment[]>([])

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const data = await adminAPI.getOverview()
        setSummary(data.summary)
        setAppointments(data.recentAppointments || [])
      } catch (err) {
        console.error('Failed to load admin overview', err)
      } finally {
        setLoading(false)
      }
    }

    fetchOverview()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner text="Loading overview..." />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        <SummaryCard
          title="Total Doctors"
          value={summary.doctors}
          icon={<Stethoscope className="h-10 w-10 text-primary-600" />}
          accent="from-primary-100 to-primary-50"
        />
        <SummaryCard
          title="Total Patients"
          value={summary.patients}
          icon={<Users className="h-10 w-10 text-emerald-600" />}
          accent="from-emerald-100 to-emerald-50"
        />
        <SummaryCard
          title="Total Appointments"
          value={summary.appointments}
          icon={<CalendarDays className="h-10 w-10 text-amber-600" />}
          accent="from-amber-100 to-amber-50"
        />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Appointments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                <th className="px-6 py-3">Patient</th>
                <th className="px-6 py-3">Doctor</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white text-sm text-gray-700">
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                    No appointments found yet.
                  </td>
                </tr>
              ) : (
                appointments.map((appointment) => (
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
                    <td className="px-6 py-4 capitalize">{appointment.type}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium capitalize ${
                        statusColors[appointment.status] || 'bg-gray-100 text-gray-600'
                      }`}>
                        {appointment.status.replace('-', ' ')}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function SummaryCard({
  title,
  value,
  icon,
  accent
}: {
  title: string
  value: number
  icon: React.ReactNode
  accent: string
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-70`} />
      <div className="relative p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
          </div>
          <div className="rounded-xl bg-white/80 p-3 shadow-inner">
            {icon}
          </div>
        </div>
      </div>
    </div>
  )
}

