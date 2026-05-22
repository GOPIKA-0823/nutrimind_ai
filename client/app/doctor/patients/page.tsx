'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import DoctorDashboardLayout from '@/components/DoctorDashboardLayout'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Users, Search, ChevronDown, ChevronUp, Calendar, Activity, Heart, Utensils, Moon, X } from 'lucide-react'
import { userAPI, doctorAPI, DailyLog } from '@/lib/api'
import { User } from '@/lib/api'
import toast from 'react-hot-toast'

export default function DoctorPatients() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [patients, setPatients] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loadingPatients, setLoadingPatients] = useState(true)
  const [expandedPatient, setExpandedPatient] = useState<string | null>(null)
  const [patientDetails, setPatientDetails] = useState<any>(null)
  const [patientLogs, setPatientLogs] = useState<DailyLog[]>([])
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [loadingLogs, setLoadingLogs] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoadingPatients(true)
        // Fetch all patients assigned to this doctor
        const response = await userAPI.getMyPatients()
        setPatients(response.patients || [])
      } catch (error: any) {
        console.error('Error fetching patients:', error)
        toast.error('Failed to load patients')
        setPatients([])
      } finally {
        setLoadingPatients(false)
      }
    }

    if (user) {
      fetchPatients()
    }
  }, [user])

  const filteredPatients = patients.filter(patient => {
    const patientId = (patient._id || patient.id || '').toString()
    return (patient.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      patientId.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const handlePatientClick = async (patientId: string) => {
    if (expandedPatient === patientId) {
      setExpandedPatient(null)
      setPatientDetails(null)
      setPatientLogs([])
      return
    }

    setExpandedPatient(patientId)
    setLoadingDetails(true)
    setLoadingLogs(true)

    try {
      // Fetch patient details and logs in parallel
      const [detailsResponse, logsResponse] = await Promise.all([
        doctorAPI.getPatientDetails(patientId),
        doctorAPI.getPatientLogs(patientId, { limit: 30 })
      ])

      setPatientDetails(detailsResponse.patient)
      setPatientLogs(logsResponse.logs || [])
    } catch (error: any) {
      console.error('Error fetching patient details:', error)
      toast.error('Failed to load patient details')
      setPatientDetails(null)
      setPatientLogs([])
    } finally {
      setLoadingDetails(false)
      setLoadingLogs(false)
    }
  }

  if (loading || loadingPatients) {
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
          <h1 className="text-2xl font-bold mb-2 flex items-center">
            <Users className="h-8 w-8 mr-3" />
            Patients List
          </h1>
          <p className="text-primary-100">
            View all patient names and contact information.
          </p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search patients by name, email, or patient ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Patients List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Patients ({filteredPatients.length})</h3>
          </div>
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {filteredPatients.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-sm">
                  {searchTerm ? 'No patients found matching your search' : 'No patients assigned yet'}
                </p>
              </div>
            ) : (
              filteredPatients.map((patient) => {
                const patientId = (patient._id || patient.id || '').toString()
                const isExpanded = expandedPatient === patientId
                return (
                  <div key={patientId} className="border-b border-gray-200 last:border-b-0">
                    <div
                      className="p-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handlePatientClick(patientId)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-primary-600 font-semibold text-sm">
                              {patient.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h4 className="text-lg font-medium text-gray-900">{patient.name}</h4>
                            <p className="text-sm text-gray-600">{patient.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-sm font-medium text-primary-600">
                              {patientId.substring(0, 8)}...
                            </p>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Patient Details */}
                    {isExpanded && (
                      <div className="bg-gray-50 p-6 border-t border-gray-200">
                        {loadingDetails || loadingLogs ? (
                          <div className="text-center py-8">
                            <LoadingSpinner />
                          </div>
                        ) : (
                          <div className="space-y-6">
                            {/* Patient Details */}
                            {patientDetails && (
                              <div className="bg-white rounded-lg p-6 shadow-sm">
                                <h3 className="text-lg font-semibold mb-4 text-gray-900">Patient Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm text-gray-600">Age</p>
                                    <p className="text-base font-medium">{patientDetails.profile?.age || 'Not provided'}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-600">Gender</p>
                                    <p className="text-base font-medium">{patientDetails.profile?.gender || 'Not provided'}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-600">Height</p>
                                    <p className="text-base font-medium">{patientDetails.profile?.height ? `${patientDetails.profile.height} cm` : 'Not provided'}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-600">Weight</p>
                                    <p className="text-base font-medium">{patientDetails.profile?.weight ? `${patientDetails.profile.weight} kg` : 'Not provided'}</p>
                                  </div>

                                  {patientDetails.profile?.medicalConditions?.length > 0 && (
                                    <div>
                                      <p className="text-sm text-gray-600">Medical Conditions</p>
                                      <p className="text-base font-medium">{patientDetails.profile.medicalConditions.join(', ')}</p>
                                    </div>
                                  )}
                                  {patientDetails.profile?.medications?.length > 0 && (
                                    <div>
                                      <p className="text-sm text-gray-600">Medications</p>
                                      <p className="text-base font-medium">{patientDetails.profile.medications.join(', ')}</p>
                                    </div>
                                  )}
                                  {patientDetails.profile?.allergies?.length > 0 && (
                                    <div>
                                      <p className="text-sm text-gray-600">Allergies</p>
                                      <p className="text-base font-medium">{patientDetails.profile.allergies.join(', ')}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}


                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </DoctorDashboardLayout>
  )
}
