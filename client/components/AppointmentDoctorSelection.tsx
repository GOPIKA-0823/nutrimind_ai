'use client'

import { useState, useEffect } from 'react'
import { userAPI } from '@/lib/api'
import { User } from '@/lib/api'
import { UserCheck, Search, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react'

interface AppointmentDoctorSelectionProps {
  assignedDoctorId?: string
  selectedDoctor: User | null
  onDoctorSelect: (doctor: User | null) => void
}

export default function AppointmentDoctorSelection({
  assignedDoctorId,
  selectedDoctor,
  onDoctorSelect
}: AppointmentDoctorSelectionProps) {
  const [doctors, setDoctors] = useState<User[]>([])
  const [assignedDoctor, setAssignedDoctor] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    fetchDoctors()
  }, [])

  useEffect(() => {
    if (assignedDoctorId && doctors.length > 0) {
      const doctor = doctors.find(d => d._id === assignedDoctorId || d.id === assignedDoctorId)
      if (doctor) {
        setAssignedDoctor(doctor)
        if (!selectedDoctor) {
          onDoctorSelect(doctor)
        }
      }
    }
  }, [assignedDoctorId, doctors])

  const fetchDoctors = async () => {
    try {
      setLoading(true)
      const response = await userAPI.getDoctors()
      setDoctors(response.doctors || [])
    } catch (error: any) {
      console.error('Error fetching doctors:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (doctor.profile?.specialization || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDoctorSelect = (doctor: User) => {
    onDoctorSelect(doctor)
    setShowDropdown(false)
    setSearchTerm('')
  }

  const handleUseAssignedDoctor = () => {
    if (assignedDoctor) {
      onDoctorSelect(assignedDoctor)
      setShowDropdown(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4 border rounded-lg">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Selected Doctor Display */}
      <div
        className="p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary-300 transition-colors bg-white"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        {selectedDoctor ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold">
                  {selectedDoctor.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{selectedDoctor.name}</h3>
                {selectedDoctor.profile?.specialization && (
                  <p className="text-xs text-primary-600 mt-1">{selectedDoctor.profile.specialization}</p>
                )}
                {assignedDoctor && (selectedDoctor._id === assignedDoctor._id || selectedDoctor.id === assignedDoctor.id) && (
                  <span className="inline-flex items-center mt-1 text-xs text-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Your assigned doctor
                  </span>
                )}
              </div>
            </div>
            {showDropdown ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <UserCheck className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500">Select a doctor</p>
                {assignedDoctor && (
                  <p className="text-xs text-gray-400 mt-1">You have an assigned doctor</p>
                )}
              </div>
            </div>
            <ChevronDown className="h-5 w-5 text-gray-400" />
          </div>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-96 overflow-hidden">
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search doctors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                autoFocus
              />
            </div>
          </div>

          <div className="overflow-y-auto max-h-80">
            {/* Assigned Doctor Option */}
            {assignedDoctor && (
              <div className="border-b border-gray-200">
                <div
                  onClick={handleUseAssignedDoctor}
                  className="p-3 hover:bg-primary-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{assignedDoctor.name}</p>
                      {assignedDoctor.profile?.specialization && (
                        <p className="text-xs text-primary-600 mt-1">{assignedDoctor.profile.specialization}</p>
                      )}
                    </div>
                    <span className="text-xs text-green-600 font-medium">Assigned</span>
                  </div>
                </div>
              </div>
            )}

            {/* All Doctors List */}
            {filteredDoctors.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">
                {searchTerm ? 'No doctors found matching your search' : 'No doctors available'}
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredDoctors.map((doctor) => {
                  const isSelected = selectedDoctor && (
                    selectedDoctor._id === doctor._id ||
                    selectedDoctor.id === doctor.id
                  )
                  const isAssigned = assignedDoctor && (
                    assignedDoctor._id === doctor._id ||
                    assignedDoctor.id === doctor.id
                  )

                  return (
                    <div
                      key={doctor._id || doctor.id}
                      onClick={() => handleDoctorSelect(doctor)}
                      className={`p-3 cursor-pointer transition-colors ${isSelected
                          ? 'bg-primary-50 border-l-4 border-primary-500'
                          : 'hover:bg-gray-50'
                        }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm">
                            {doctor.name.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900 truncate">{doctor.name}</p>
                            {isAssigned && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                Assigned
                              </span>
                            )}
                            {isSelected && (
                              <CheckCircle className="h-4 w-4 text-primary-600 flex-shrink-0" />
                            )}
                          </div>
                          {doctor.profile?.specialization && (
                            <p className="text-xs text-primary-600 mt-1">{doctor.profile.specialization}</p>
                          )}
                          {doctor.profile?.bio && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{doctor.profile.bio}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  )
}

