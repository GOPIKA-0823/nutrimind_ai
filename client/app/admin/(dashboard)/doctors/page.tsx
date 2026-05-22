'use client'

import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { adminAPI, User } from '@/lib/api'
import LoadingSpinner from '@/components/LoadingSpinner'
import { CheckCircle2, CircleSlash2, Loader2, ShieldPlus, Trash } from 'lucide-react'

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  const activeDoctors = useMemo(() => doctors.filter((doctor) => doctor.isActive !== false).length, [doctors])

  const fetchDoctors = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getDoctors()
      setDoctors(response.doctors)
    } catch (err) {
      console.error('Failed to fetch doctors', err)
      toast.error('Unable to load doctors')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDoctors()
  }, [])

  const handleCreateDoctor = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!form.name || !form.email || !form.password) {
      toast.error('All fields are required')
      return
    }

    try {
      setSubmitting(true)
      const response = await adminAPI.createDoctor(form)
      toast.success(response.message)
      setForm({ name: '', email: '', password: '' })
      fetchDoctors()
    } catch (err) {
      console.error('Failed to create doctor', err)
      toast.error('Failed to create doctor')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleDoctorStatus = async (doctor: User) => {
    try {
      const isActive = doctor.isActive !== false
      await adminAPI.updateDoctorStatus(doctor._id || doctor.id!, !isActive)
      toast.success(`Doctor ${!isActive ? 'activated' : 'deactivated'} successfully`)
      fetchDoctors()
    } catch (err) {
      console.error('Failed to update doctor status', err)
      toast.error('Unable to update doctor status')
    }
  }

  const removeDoctor = async (doctor: User) => {
    if (!confirm(`Remove Dr. ${doctor.name}?`)) {
      return
    }

    try {
      await adminAPI.deleteDoctor(doctor._id || doctor.id!)
      toast.success('Doctor removed')
      fetchDoctors()
    } catch (err) {
      console.error('Failed to remove doctor', err)
      toast.error('Unable to remove doctor')
    }
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[2fr,3fr]">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary-100 p-3">
              <ShieldPlus className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Add New Doctor</h2>
              <p className="text-sm text-gray-500">Create doctor accounts for platform access</p>
            </div>
          </div>

          <form onSubmit={handleCreateDoctor} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Dr. Jane Doe"
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="doctor@example.com"
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Temporary Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="Minimum 6 characters"
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating doctor...
                </>
              ) : (
                'Create Doctor'
              )}
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Doctor Summary</h3>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-gray-500">Total Doctors</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{doctors.length}</p>
            </div>
            <div className="rounded-xl bg-green-50 p-4">
              <p className="text-sm text-gray-500">Active Doctors</p>
              <p className="mt-2 text-3xl font-semibold text-green-700">{activeDoctors}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Doctor Directory</h2>
            <p className="text-sm text-gray-500">Manage doctor access and account status</p>
          </div>
        </header>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex min-h-[200px] items-center justify-center">
              <LoadingSpinner text="Loading doctors..." />
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="px-6 py-3 text-left">Name</th>
                  <th className="px-6 py-3 text-left">Email</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white text-sm">
                {doctors.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      No doctors found. Create a new doctor to get started.
                    </td>
                  </tr>
                ) : (
                  doctors.map((doctor) => {
                    const isActive = doctor.isActive !== false
                    return (
                      <tr key={doctor._id || doctor.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{doctor.name}</div>
                          <div className="text-xs text-gray-500">Created {doctor.createdAt ? new Date(doctor.createdAt).toLocaleDateString() : '—'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-700">{doctor.email}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                              isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {isActive ? 'Active' : 'Pending / Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-3">
                            <button
                              onClick={() => toggleDoctorStatus(doctor)}
                              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                                isActive
                                  ? 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                                  : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                              }`}
                            >
                              {isActive ? (
                                <>
                                  <CircleSlash2 className="h-4 w-4" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="h-4 w-4" />
                                  Approve
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => removeDoctor(doctor)}
                              className="inline-flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-100"
                            >
                              <Trash className="h-4 w-4" />
                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  )
}

