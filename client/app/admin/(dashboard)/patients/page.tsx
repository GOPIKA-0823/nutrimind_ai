'use client'

import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { adminAPI, User } from '@/lib/api'
import LoadingSpinner from '@/components/LoadingSpinner'
import { HeartHandshake, Loader2, Plus, Trash } from 'lucide-react'

export default function AdminPatientsPage() {
  const [patients, setPatients] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  const fetchPatients = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getPatients()
      setPatients(response.patients)
    } catch (err) {
      console.error('Failed to load patients', err)
      toast.error('Unable to load patients right now')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPatients()
  }, [])

  const totalActive = useMemo(() => patients.filter((patient) => patient.isActive !== false).length, [patients])

  const handleCreatePatient = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!form.name || !form.email || !form.password) {
      toast.error('Please complete all fields')
      return
    }

    try {
      setSubmitting(true)
      const response = await adminAPI.createPatient(form)
      toast.success(response.message)
      setForm({ name: '', email: '', password: '' })
      fetchPatients()
    } catch (err) {
      console.error('Failed to create patient', err)
      toast.error('Unable to create patient')
    } finally {
      setSubmitting(false)
    }
  }

  const removePatient = async (patient: User) => {
    if (!confirm(`Remove patient ${patient.name}? This action is irreversible.`)) {
      return
    }

    try {
      await adminAPI.deletePatient(patient._id || patient.id!)
      toast.success('Patient removed successfully')
      fetchPatients()
    } catch (err) {
      console.error('Failed to remove patient', err)
      toast.error('Unable to remove patient')
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-secondary-100 p-3">
            <HeartHandshake className="h-6 w-6 text-secondary-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Patient Insights</h2>
            <p className="text-sm text-gray-500">Overview of registered patients in the system</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Patients" value={patients.length} />
          <StatCard label="Active Patients" value={totalActive} trend={`${Math.round((totalActive / Math.max(patients.length, 1)) * 100)}% active`} />
          <StatCard label="New this Month" value={patients.filter((patient) => {
            if (!patient.createdAt) return false
            const created = new Date(patient.createdAt)
            const now = new Date()
            return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
          }).length} />
          <StatCard label="Inactive Accounts" value={patients.length - totalActive} />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr,3fr]">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Register Patient</h3>
          <p className="mt-1 text-sm text-gray-500">Create a patient account with an initial password.</p>

          <form onSubmit={handleCreatePatient} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-secondary-500 focus:outline-none focus:ring-2 focus:ring-secondary-200"
                placeholder="John Smith"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-secondary-500 focus:outline-none focus:ring-2 focus:ring-secondary-200"
                placeholder="patient@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Temporary Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-secondary-500 focus:outline-none focus:ring-2 focus:ring-secondary-200"
                placeholder="Minimum 6 characters"
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center rounded-lg bg-secondary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating patient...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Patient
                </>
              )}
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Patient Directory</h3>
              <p className="text-sm text-gray-500">Manage patient accounts and access</p>
            </div>
          </header>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex min-h-[200px] items-center justify-center">
                <LoadingSpinner text="Loading patients..." />
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white text-sm">
                  {patients.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                        No patients found. Register a patient to populate this list.
                      </td>
                    </tr>
                  ) : (
                    patients.map((patient) => {
                      const isActive = patient.isActive !== false
                      return (
                        <tr key={patient._id || patient.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">{patient.name}</div>
                            <div className="text-xs text-gray-500">
                              Joined {patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : '—'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-gray-700">{patient.email}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                                isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'
                              }`}
                            >
                              {isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-end">
                              <button
                                onClick={() => removePatient(patient)}
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
        </div>
      </section>
    </div>
  )
}

function StatCard({ label, value, trend }: { label: string; value: number; trend?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
      {trend && <p className="mt-1 text-xs text-gray-500">{trend}</p>}
    </div>
  )
}

