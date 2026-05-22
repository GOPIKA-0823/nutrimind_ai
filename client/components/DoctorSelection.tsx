'use client'

import { useState, useEffect } from 'react'
import { userAPI } from '@/lib/api'
import { User } from '@/lib/api'
import { UserCheck, Search, CheckCircle, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface DoctorSelectionProps {
  currentDoctorId?: string
  onDoctorSelected?: (doctor: User) => void
}

export default function DoctorSelection({ currentDoctorId, onDoctorSelected }: DoctorSelectionProps) {
  const [doctors, setDoctors] = useState<User[]>([])
  const [selectedDoctor, setSelectedDoctor] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [assigning, setAssigning] = useState(false)

  useEffect(() => {
    fetchDoctors()
  }, [])

  useEffect(() => {
    if (currentDoctorId && doctors.length > 0) {
      const doctor = doctors.find(d => d._id === currentDoctorId || d.id === currentDoctorId)
      if (doctor) {
        setSelectedDoctor(doctor)
      }
    }
  }, [currentDoctorId, doctors])

  const fetchDoctors = async () => {
    try {
      setLoading(true)
      const response = await userAPI.getDoctors()
      setDoctors(response.doctors || [])
    } catch (error: any) {
      console.error('Error fetching doctors:', error)
      toast.error('Failed to load doctors')
    } finally {
      setLoading(false)
    }
  }

  const handleAssignDoctor = async (doctor: User) => {
    try {
      setAssigning(true)
      const doctorId = doctor._id || doctor.id
      if (!doctorId) {
        toast.error('Invalid doctor ID')
        return
      }

      // Call API to assign doctor
      const response = await fetch('/api/users/assign-doctor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ doctorId })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to assign doctor')
      }

      const data = await response.json()
      setSelectedDoctor(doctor)
      toast.success('Doctor assigned successfully!')

      if (onDoctorSelected) {
        onDoctorSelected(doctor)
      }
    } catch (error: any) {
      console.error('Error assigning doctor:', error)
      toast.error(error.message || 'Failed to assign doctor')
    } finally {
      setAssigning(false)
    }
  }

  const handleRemoveDoctor = async () => {
    try {
      setAssigning(true)
      // Call API to remove doctor assignment
      const response = await fetch('/api/users/assign-doctor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ doctorId: null })
      })

      if (!response.ok) {
        throw new Error('Failed to remove doctor')
      }

      setSelectedDoctor(null)
      toast.success('Doctor removed successfully!')

      if (onDoctorSelected) {
        onDoctorSelected(null as any)
      }
    } catch (error: any) {
      console.error('Error removing doctor:', error)
      toast.error(error.message || 'Failed to remove doctor')
    } finally {
      setAssigning(false)
    }
  }

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (doctor.profile?.specialization || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center space-x-3 mb-4">
        <UserCheck className="h-5 w-5 text-primary-600" />
        <h3 className="text-lg font-semibold">Select Your Doctor</h3>
      </div>

      {selectedDoctor && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-gray-900">{selectedDoctor.name}</p>
                {selectedDoctor.profile?.specialization && (
                  <p className="text-sm text-gray-500">{selectedDoctor.profile.specialization}</p>
                )}
              </div>
            </div>
            <button
              onClick={handleRemoveDoctor}
              disabled={assigning}
              className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search doctors by name, email, or specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredDoctors.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? 'No doctors found matching your search' : 'No doctors available'}
          </div>
        ) : (
          filteredDoctors.map((doctor) => {
            const isSelected = selectedDoctor && (
              selectedDoctor._id === doctor._id ||
              selectedDoctor.id === doctor.id
            )

            return (
              <div
                key={doctor._id || doctor.id}
                className={`p-4 border rounded-lg transition-colors ${isSelected
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900">{doctor.name}</h4>
                      {isSelected && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    {doctor.profile?.specialization && (
                      <p className="text-sm text-primary-600 mt-1">
                        {doctor.profile.specialization}
                      </p>
                    )}
                    {doctor.profile?.bio && (
                      <p className="text-sm text-gray-500 mt-1">{doctor.profile.bio}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleAssignDoctor(doctor)}
                    disabled={isSelected || assigning}
                    className={`ml-4 px-4 py-2 rounded-md text-sm font-medium transition-colors ${isSelected
                        ? 'bg-green-100 text-green-700 cursor-not-allowed'
                        : 'bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50'
                      }`}
                  >
                    {isSelected ? 'Selected' : 'Select'}
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

