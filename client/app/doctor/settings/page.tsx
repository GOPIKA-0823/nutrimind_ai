'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import DoctorDashboardLayout from '@/components/DoctorDashboardLayout'
import LoadingSpinner from '@/components/LoadingSpinner'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Bell, 
  Save, 
  Camera,
  Edit,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

export default function DoctorSettings() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [profileLoaded, setProfileLoaded] = useState(false)
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    experience: '',
    licenseNumber: '',
    hospital: '',
    address: '',
    bio: '',
    consultationFee: '',
    availability: {
      monday: { start: '09:00', end: '17:00', available: true },
      tuesday: { start: '09:00', end: '17:00', available: true },
      wednesday: { start: '09:00', end: '17:00', available: true },
      thursday: { start: '09:00', end: '17:00', available: true },
      friday: { start: '09:00', end: '17:00', available: true },
      saturday: { start: '10:00', end: '14:00', available: true },
      sunday: { start: '10:00', end: '14:00', available: false }
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: true,
      appointmentReminders: true,
      patientMessages: true,
      reportAlerts: true
    }
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    } else if (user) {
      // Extract name from email if no display name is available
      const emailName = user.email ? user.email.split('@')[0].replace(/[._]/g, ' ') : ''
      const displayName = user.name || `Dr. ${emailName.charAt(0).toUpperCase() + emailName.slice(1)}`
      
      setProfileData(prev => ({
        ...prev,
        name: displayName,
        email: user.email || '',
        phone: user.phone || '',
        specialization: user.specialization || 'General Medicine',
        experience: user.experience || '5',
        licenseNumber: user.licenseNumber || `MD-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
        hospital: user.hospital || 'Medical Center',
        address: user.address || '',
        bio: user.bio || `Dr. ${emailName.charAt(0).toUpperCase() + emailName.slice(1)} is a dedicated healthcare professional committed to providing quality medical care.`,
        consultationFee: user.consultationFee || '150'
      }))
      setProfileLoaded(true)
    }
  }, [user, loading, router])

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAvailabilityChange = (day: string, field: string, value: string | boolean) => {
    setProfileData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: {
          ...prev.availability[day as keyof typeof prev.availability],
          [field]: value
        }
      }
    }))
  }

  const handleNotificationChange = (field: string, value: boolean) => {
    setProfileData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value
      }
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setShowSuccess(true)
      setIsEditing(false)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setIsSaving(false)
    }
  }


  if (loading || !profileLoaded) {
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
            Doctor Settings ⚙️
          </h1>
          <p className="text-primary-100">
            Manage your profile, availability, and notification preferences.
          </p>
          <div className="mt-3 flex items-center text-sm text-primary-200">
            <Mail className="h-4 w-4 mr-2" />
            <span>Signed in as: {user.email}</span>
          </div>
        </div>

        {showSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            Profile updated successfully!
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Profile Information</h3>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50 flex items-center"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-1" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                    <input
                      type="text"
                      value={profileData.specialization}
                      onChange={(e) => handleInputChange('specialization', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                    <input
                      type="number"
                      value={profileData.experience}
                      onChange={(e) => handleInputChange('experience', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                    <input
                      type="text"
                      value={profileData.licenseNumber}
                      onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hospital/Clinic</label>
                  <input
                    type="text"
                    value={profileData.hospital}
                    onChange={(e) => handleInputChange('hospital', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    value={profileData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Tell patients about your expertise and approach..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Fee (per hour)</label>
                  <input
                    type="number"
                    value={profileData.consultationFee}
                    onChange={(e) => handleInputChange('consultationFee', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Availability */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Availability</h3>
              <div className="space-y-3">
                {Object.entries(profileData.availability).map(([day, schedule]) => (
                  <div key={day} className="flex items-center space-x-4">
                    <div className="w-20">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={schedule.available}
                          onChange={(e) => handleAvailabilityChange(day, 'available', e.target.checked)}
                          className="mr-2"
                        />
                        <span className="capitalize text-sm font-medium">{day}</span>
                      </label>
                    </div>
                    {schedule.available && (
                      <div className="flex items-center space-x-2">
                        <input
                          type="time"
                          value={schedule.start}
                          onChange={(e) => handleAvailabilityChange(day, 'start', e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                        <span className="text-gray-500">to</span>
                        <input
                          type="time"
                          value={schedule.end}
                          onChange={(e) => handleAvailabilityChange(day, 'end', e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Notifications */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Notifications</h3>
              <div className="space-y-3">
                {Object.entries(profileData.notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </span>
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => handleNotificationChange(key, e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                  </div>
                ))}
              </div>
            </div>


          </div>
        </div>
      </div>
    </DoctorDashboardLayout>
  )
}