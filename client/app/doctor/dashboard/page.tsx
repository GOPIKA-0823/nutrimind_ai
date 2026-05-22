'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import DoctorDashboardLayout from '@/components/DoctorDashboardLayout'
import LoadingSpinner from '@/components/LoadingSpinner'
import { 
  Users, 
  FileText, 
  MessageSquare, 
  Calendar, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock,
  Star
} from 'lucide-react'
import UserSelection from '@/components/UserSelection'
import DoctorEarnings from '@/components/DoctorEarnings'
import { doctorAPI } from '@/lib/api'

export default function DoctorDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalPatients: 0,
    pendingReports: 0,
    monthlyConsultations: 0,
    avgPatientScore: 0
  })
  const [recentPatients, setRecentPatients] = useState<Array<{ id: string; name: string; lastReport: string | null; score: number; status: string }>>([])
  const [upcomingConsultations, setUpcomingConsultations] = useState<Array<{ id: string; patient: string; date: string; time: string; type: string }>>([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    // Fetch doctor dashboard data
    const fetchDashboardData = async () => {
      try {
        setLoadingData(true)
        
        // Fetch stats, recent patients, and upcoming consultations in parallel
        const [statsData, patientsData, consultationsData] = await Promise.all([
          doctorAPI.getStats(),
          doctorAPI.getRecentPatients(10),
          doctorAPI.getUpcomingConsultations(10)
        ])

        setStats(statsData)
        setRecentPatients(patientsData.patients)
        setUpcomingConsultations(consultationsData.consultations)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        // Set default values on error
        setStats({
          totalPatients: 0,
          pendingReports: 0,
          monthlyConsultations: 0,
          avgPatientScore: 0
        })
        setRecentPatients([])
        setUpcomingConsultations([])
      } finally {
        setLoadingData(false)
      }
    }

    if (user) {
      fetchDashboardData()
    }
  }, [user])

  if (loading || loadingData) {
    return <LoadingSpinner />
  }

  if (!user) {
    return null
  }

  return (
    <DoctorDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">
            Doctor Dashboard 👨‍⚕️
          </h1>
          <p className="text-primary-100">
            Welcome back, Dr. {user?.name}. Review patient reports and manage consultations.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPatients}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Reports</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingReports}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Consultations</p>
                <p className="text-2xl font-bold text-gray-900">{stats.monthlyConsultations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Patient Score</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgPatientScore}/10</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Patients */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Patients</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {recentPatients.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No patients assigned yet</p>
                </div>
              ) : (
                recentPatients.map((patient) => (
                  <div key={patient.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <Users className="h-5 w-5 text-gray-500" />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{patient.name}</p>
                          <p className="text-sm text-gray-500">
                            {patient.lastReport 
                              ? `Last report: ${new Date(patient.lastReport).toLocaleDateString()}`
                              : 'No reports yet'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400" />
                          <span className="ml-1 text-sm font-medium text-gray-900">{patient.score.toFixed(1)}</span>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          patient.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {patient.status === 'active' ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <Clock className="h-3 w-3 mr-1" />
                          )}
                          {patient.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Consultations */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Upcoming Consultations</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {upcomingConsultations.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No upcoming consultations</p>
                </div>
              ) : (
                upcomingConsultations.map((consultation) => (
                  <div key={consultation.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <MessageSquare className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{consultation.patient}</p>
                          <p className="text-sm text-gray-500">{consultation.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(consultation.date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500">{consultation.time}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* User Selection Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Manage Patients</h3>
          </div>
          <div className="p-6">
            <UserSelection />
          </div>
        </div>

        {/* Earnings Section */}
        <DoctorEarnings />

      </div>
    </DoctorDashboardLayout>
  )
}