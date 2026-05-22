'use client'

import { useState, useEffect } from 'react'
import { userAPI } from '@/lib/api'
import { User } from '@/lib/api'
import { Users, Search, UserPlus, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface UserSelectionProps {
  onUserSelected?: (user: User) => void
}

export default function UserSelection({ onUserSelected }: UserSelectionProps) {
  const [users, setUsers] = useState<User[]>([])
  const [assignedUsers, setAssignedUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [assigning, setAssigning] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
    fetchAssignedUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await userAPI.getMyPatients()
      // Also fetch all users to allow selection
      const allUsersResponse = await fetch('/api/users/all', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (allUsersResponse.ok) {
        const allUsersData = await allUsersResponse.json()
        setUsers(allUsersData.users || [])
      } else {
        setUsers(response.patients || [])
      }
    } catch (error: any) {
      console.error('Error fetching users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const fetchAssignedUsers = async () => {
    try {
      const response = await userAPI.getMyPatients()
      setAssignedUsers(response.patients || [])
    } catch (error: any) {
      console.error('Error fetching assigned users:', error)
    }
  }

  const handleAssignUser = async (user: User) => {
    try {
      setAssigning(user._id || user.id || '')
      const userId = user._id || user.id
      if (!userId) {
        toast.error('Invalid user ID')
        return
      }

      // Call API to assign user to doctor
      const response = await fetch('/api/users/assign-patient', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ userId })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to assign user')
      }

      const data = await response.json()
      toast.success('User assigned successfully!')

      // Refresh assigned users
      await fetchAssignedUsers()

      if (onUserSelected) {
        onUserSelected(user)
      }
    } catch (error: any) {
      console.error('Error assigning user:', error)
      toast.error(error.message || 'Failed to assign user')
    } finally {
      setAssigning(null)
    }
  }

  const handleRemoveUser = async (user: User) => {
    try {
      setAssigning(user._id || user.id || '')
      const userId = user._id || user.id
      if (!userId) {
        toast.error('Invalid user ID')
        return
      }

      const response = await fetch('/api/users/remove-patient', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ userId })
      })

      if (!response.ok) {
        throw new Error('Failed to remove user')
      }

      toast.success('User removed successfully!')
      await fetchAssignedUsers()
    } catch (error: any) {
      console.error('Error removing user:', error)
      toast.error(error.message || 'Failed to remove user')
    } finally {
      setAssigning(null)
    }
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const isAssigned = (user: User) => {
    return assignedUsers.some(
      assigned => (assigned._id === user._id || assigned.id === user.id)
    )
  }

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
    <div className="space-y-6">
      {/* Assigned Users */}
      {assignedUsers.length > 0 && (
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <Users className="h-5 w-5 text-primary-600" />
            <h3 className="text-lg font-semibold">My Patients ({assignedUsers.length})</h3>
          </div>
          <div className="space-y-2">
            {assignedUsers.map((user) => (
              <div
                key={user._id || user.id}
                className="p-4 border border-green-200 bg-green-50 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{user.name}</h4>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveUser(user)}
                    disabled={assigning === (user._id || user.id)}
                    className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Selection */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-4">
          <UserPlus className="h-5 w-5 text-primary-600" />
          <h3 className="text-lg font-semibold">Select Patients</h3>
        </div>

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No users found matching your search' : 'No users available'}
            </div>
          ) : (
            filteredUsers
              .filter(user => user.role === 'user')
              .map((user) => {
                const assigned = isAssigned(user)

                return (
                  <div
                    key={user._id || user.id}
                    className={`p-4 border rounded-lg transition-colors ${assigned
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{user.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{user.email}</p>
                      </div>
                      <button
                        onClick={() => assigned ? handleRemoveUser(user) : handleAssignUser(user)}
                        disabled={assigning === (user._id || user.id)}
                        className={`ml-4 px-4 py-2 rounded-md text-sm font-medium transition-colors ${assigned
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50'
                          }`}
                      >
                        {assigning === (user._id || user.id) ? 'Processing...' : assigned ? 'Remove' : 'Assign'}
                      </button>
                    </div>
                  </div>
                )
              })
          )}
        </div>
      </div>
    </div>
  )
}

