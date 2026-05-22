'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Settings, User, Bell, Shield, Key, Save, Eye, EyeOff } from 'lucide-react'
import DoctorSelection from '@/components/DoctorSelection'

export default function SettingsPage() {
  const { user, loading, updateUser } = useAuth()
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }))
    }
  }, [user, loading, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSaveProfile = () => {
    // Update user profile
    updateUser({
      name: formData.name,
      email: formData.email
    })
    
    // Show success message
    alert('Profile updated successfully!')
  }

  const handleChangePassword = () => {
    if (formData.newPassword !== formData.confirmPassword) {
      alert('Passwords do not match')
      return
    }
    // Handle password change
    console.log('Changing password')
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">
            Settings ⚙️
          </h1>
          <p className="text-primary-100">
            Manage your account preferences and privacy settings.
          </p>
        </div>

        {/* Settings Content */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Profile Settings */}
          <div className="card">
            <div className="flex items-center space-x-3 mb-4">
              <User className="h-5 w-5 text-primary-600" />
              <h3 className="text-lg font-semibold">Profile Settings</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input"
                />
              </div>
              <button onClick={handleSaveProfile} className="btn btn-primary">
                <Save className="h-4 w-4 mr-2" />
                Update Profile
              </button>
            </div>
          </div>

          {/* Notifications */}
          <div className="card">
            <div className="flex items-center space-x-3 mb-4">
              <Bell className="h-5 w-5 text-primary-600" />
              <h3 className="text-lg font-semibold">Notifications</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Email Notifications</span>
                <input type="checkbox" className="toggle" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Push Notifications</span>
                <input type="checkbox" className="toggle" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Reminder Alerts</span>
                <input type="checkbox" className="toggle" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Weekly Reports</span>
                <input type="checkbox" className="toggle" defaultChecked />
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="card">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="h-5 w-5 text-primary-600" />
              <h3 className="text-lg font-semibold">Privacy</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Share Data with Doctor</span>
                <input type="checkbox" className="toggle" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Anonymous Participation</span>
                <input type="checkbox" className="toggle" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Data Analytics</span>
                <input type="checkbox" className="toggle" defaultChecked />
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="card">
            <div className="flex items-center space-x-3 mb-4">
              <Key className="h-5 w-5 text-primary-600" />
              <h3 className="text-lg font-semibold">Security</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Current Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    className="input pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="label">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="input"
                />
              </div>
              <button onClick={handleChangePassword} className="btn btn-outline w-full">
                Change Password
              </button>
            </div>
          </div>
        </div>

        {/* Doctor Selection */}
        <DoctorSelection 
          currentDoctorId={user?.profile?.doctorId}
          onDoctorSelected={(doctor) => {
            if (updateUser && doctor) {
              updateUser({ profile: { ...user?.profile, doctorId: doctor._id || doctor.id } })
            }
          }}
        />

        {/* Account Actions */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Account Actions</h3>
          
            <button className="btn btn-outline text-red-600 hover:bg-red-50">
              Delete Account
            </button>
          
        </div>
      </div>
    </DashboardLayout>
  )
}
