'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { appointmentsAPI } from '@/lib/api'
import { useRouter } from 'next/navigation'
import DoctorDashboardLayout from '@/components/DoctorDashboardLayout'
import LoadingSpinner from '@/components/LoadingSpinner'
import VideoCall from '@/components/VideoCall'
import PhoneCall from '@/components/PhoneCall'
import {
  Calendar,
  Clock,
  Video,
  Phone,
  User,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Bell,
  Eye,
  Calendar as CalendarIcon,
  List,
  BarChart3,
  RefreshCw,
  MessageSquare
} from 'lucide-react'

interface Appointment {
  id: number
  patientName: string
  patientEmail: string
  date: string
  time: string
  type: string
  status: string
  duration: number
  notes: string
  requestedBy: 'patient' | 'doctor'
  requestDate: string
  doctorNotes?: string
  patientMessage?: string
  patientPhone?: string
  reason?: string
  priority?: 'low' | 'medium' | 'high'
  urgency?: 'routine' | 'urgent' | 'emergency'
}

export default function DoctorAppointments() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showNewAppointment, setShowNewAppointment] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedPatient, setSelectedPatient] = useState('')
  const [appointmentType, setAppointmentType] = useState('video')
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<Appointment | null>(null)
  const [filterView, setFilterView] = useState<'all' | 'requests' | 'scheduled'>('all')
  const [showPendingRequests, setShowPendingRequests] = useState(false)
  const [pendingRequests, setPendingRequests] = useState<Appointment[]>([])
  const [showAcceptModal, setShowAcceptModal] = useState(false)
  const [appointmentToAccept, setAppointmentToAccept] = useState<Appointment | null>(null)
  const [doctorResponse, setDoctorResponse] = useState('')
  const [showVideoCall, setShowVideoCall] = useState(false)
  const [showPhoneCall, setShowPhoneCall] = useState(false)
  const [currentCallAppointment, setCurrentCallAppointment] = useState<Appointment | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    // Fetch appointments from API
    const fetchAppointments = async () => {
      try {
        const response = await appointmentsAPI.getAppointments()
        // Map API response to component state shape if needed, or ensure backend matches
        // For now assuming backend returns compatible shape or simple adaptation
        if (response && response.appointments) {
          setAppointments(response.appointments)
        }
      } catch (error) {
        console.error('Failed to fetch appointments:', error)
      }
    }

    fetchAppointments()

    // Set up polling interval for real-time updates
    const interval = setInterval(fetchAppointments, 30000)

    return () => clearInterval(interval)
  }, [])

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = (appointment.patientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (appointment.patientEmail || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || appointment.status === filterStatus

    // Filter by view type
    let matchesView = true
    if (filterView === 'requests') {
      matchesView = appointment.status === 'pending_approval'
    } else if (filterView === 'scheduled') {
      matchesView = appointment.status === 'scheduled' || appointment.status === 'completed'
    }

    return matchesSearch && matchesFilter && matchesView
  })

  const handleCreateAppointment = () => {
    if (selectedDate && selectedTime && selectedPatient) {
      const newAppointment = {
        id: appointments.length + 1,
        patientName: selectedPatient,
        patientEmail: `${selectedPatient.toLowerCase().replace(' ', '.')}@example.com`,
        date: selectedDate,
        time: selectedTime,
        type: appointmentType,
        status: 'scheduled',
        duration: 30,
        notes: 'New appointment',
        requestedBy: 'doctor' as const,
        requestDate: new Date().toISOString().split('T')[0]
      }
      setAppointments([...appointments, newAppointment])
      setShowNewAppointment(false)
      setSelectedDate('')
      setSelectedTime('')
      setSelectedPatient('')
    }
  }

  const handleStatusChange = (appointmentId: number, newStatus: string) => {
    setAppointments(appointments.map(apt =>
      apt.id === appointmentId ? { ...apt, status: newStatus } : apt
    ))
  }

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment)
    setShowEditModal(true)
  }

  const handleUpdateAppointment = () => {
    if (editingAppointment) {
      setAppointments(appointments.map(apt =>
        apt.id === editingAppointment.id ? editingAppointment : apt
      ))
      setShowEditModal(false)
      setEditingAppointment(null)
    }
  }

  const handleDeleteAppointment = (appointmentId: number) => {
    if (confirm('Are you sure you want to delete this appointment?')) {
      setAppointments(appointments.filter(apt => apt.id !== appointmentId))
    }
  }

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setShowDetailsModal(true)
  }

  const handleRescheduleAppointment = (appointmentId: number, newDate: string, newTime: string) => {
    setAppointments(appointments.map(apt =>
      apt.id === appointmentId ? { ...apt, date: newDate, time: newTime } : apt
    ))
  }

  const getTodaysAppointments = () => {
    const today = new Date().toISOString().split('T')[0]
    return appointments.filter(apt => apt.date === today)
  }

  const getUpcomingAppointments = () => {
    const today = new Date().toISOString().split('T')[0]
    return appointments.filter(apt => apt.date >= today && apt.status !== 'cancelled')
  }

  const handleAcceptAppointment = (appointmentId: number) => {
    setAppointments(appointments.map(apt =>
      apt.id === appointmentId ? { ...apt, status: 'scheduled' } : apt
    ))
    setShowAcceptModal(false)
    setAppointmentToAccept(null)
    setDoctorResponse('')
  }

  const handleRejectAppointment = (appointmentId: number) => {
    setAppointments(appointments.map(apt =>
      apt.id === appointmentId ? { ...apt, status: 'rejected' } : apt
    ))
  }

  const handleRescheduleRequest = (appointmentId: number, newDate: string, newTime: string) => {
    setAppointments(appointments.map(apt =>
      apt.id === appointmentId ? { ...apt, date: newDate, time: newTime, status: 'scheduled' } : apt
    ))
  }

  const getPendingRequests = () => {
    return appointments.filter(apt => apt.status === 'pending_approval')
  }

  const getUrgentRequests = () => {
    return appointments.filter(apt => apt.status === 'pending_approval' && apt.urgency === 'emergency')
  }

  const handleAcceptAppointmentModal = (appointment: Appointment) => {
    setAppointmentToAccept(appointment)
    setShowAcceptModal(true)
  }

  const handleConfirmAccept = () => {
    if (appointmentToAccept) {
      // Move from pending requests to scheduled appointments
      const acceptedAppointment = {
        ...appointmentToAccept,
        status: 'scheduled',
        doctorNotes: doctorResponse,
        notes: appointmentToAccept.notes + (doctorResponse ? ` | Doctor Notes: ${doctorResponse}` : '')
      }

      setAppointments([...appointments, acceptedAppointment])
      setPendingRequests(pendingRequests.filter(req => req.id !== appointmentToAccept.id))
      setShowAcceptModal(false)
      setAppointmentToAccept(null)
      setDoctorResponse('')
    }
  }

  const handleStartMeeting = (appointment: Appointment) => {
    setCurrentCallAppointment(appointment)
    if (appointment.type === 'video') {
      setShowVideoCall(true)
    } else {
      setShowPhoneCall(true)
    }
  }

  const handleEndCall = () => {
    setShowVideoCall(false)
    setShowPhoneCall(false)
    setCurrentCallAppointment(null)
    // Mark appointment as completed
    if (currentCallAppointment) {
      handleStatusChange(currentCallAppointment.id, 'completed')
    }
  }



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'pending_approval': return 'bg-orange-100 text-orange-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    return type === 'video' ? <Video className="h-4 w-4" /> : <Phone className="h-4 w-4" />
  }

  if (loading) {
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
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                Appointment Management 📅
              </h1>
              <p className="text-primary-100">
                Schedule and manage patient consultations and monthly checkups.
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowPendingRequests(true)}
                className="px-3 py-2 rounded-lg flex items-center space-x-2 bg-orange-500 bg-opacity-20 hover:bg-opacity-30"
              >
                <Bell className="h-4 w-4" />
                <span>Pending Requests ({pendingRequests.length})</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded-lg flex items-center space-x-2 ${viewMode === 'list' ? 'bg-white bg-opacity-20' : 'bg-white bg-opacity-10 hover:bg-opacity-20'
                  }`}
              >
                <List className="h-4 w-4" />
                <span>List</span>
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-2 rounded-lg flex items-center space-x-2 ${viewMode === 'calendar' ? 'bg-white bg-opacity-20' : 'bg-white bg-opacity-10 hover:bg-opacity-20'
                  }`}
              >
                <CalendarIcon className="h-4 w-4" />
                <span>Calendar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Appointment Requests Alert */}
        {getPendingRequests().length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-orange-600 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-orange-800">
                    {getPendingRequests().length} Appointment Request{getPendingRequests().length > 1 ? 's' : ''} Pending Approval
                  </h3>
                  <p className="text-sm text-orange-700">
                    {getUrgentRequests().length > 0 && `${getUrgentRequests().length} urgent request${getUrgentRequests().length > 1 ? 's' : ''} require immediate attention`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFilterView('requests')}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-medium"
              >
                Review Requests
              </button>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Appointments</p>
                <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {appointments.filter(apt => apt.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold text-gray-900">
                  {appointments.filter(apt => apt.status === 'scheduled').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cancelled</p>
                <p className="text-2xl font-bold text-gray-900">
                  {appointments.filter(apt => apt.status === 'cancelled').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                <p className="text-2xl font-bold text-gray-900">
                  {getPendingRequests().length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search appointments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex gap-1">
                <button
                  onClick={() => setFilterView('all')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${filterView === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterView('requests')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${filterView === 'requests' ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  Requests ({getPendingRequests().length})
                </button>
                <button
                  onClick={() => setFilterView('scheduled')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${filterView === 'scheduled' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  Scheduled
                </button>
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
                <option value="pending_approval">Pending Approval</option>
                <option value="rejected">Rejected</option>
              </select>
              <button
                onClick={() => setShowNewAppointment(true)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Appointment
              </button>
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Appointments ({filteredAppointments.length})</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {filteredAppointments.map((appointment) => (
              <div key={appointment.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{appointment.patientName}</h4>
                      <p className="text-sm text-gray-600">Patient ID: PAT-{(appointment.id || '').toString().padStart(3, '0')}</p>
                      <p className="text-sm text-gray-500">{appointment.date} at {appointment.time}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Status</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                    </div>

                    <div className="flex space-x-2">
                      {appointment.status === 'pending_approval' && (
                        <>
                          <button
                            onClick={() => handleAcceptAppointmentModal(appointment)}
                            className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Accept
                          </button>
                          <button
                            onClick={() => handleRejectAppointment(appointment.id)}
                            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </button>
                        </>
                      )}

                      {appointment.status === 'scheduled' && (
                        <>
                          <button
                            onClick={() => handleStartMeeting(appointment)}
                            className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                          >
                            <Video className="h-4 w-4 mr-2" />
                            Start Meeting
                          </button>
                          <button
                            onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Cancel Meeting
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* New Appointment Modal */}
        {showNewAppointment && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Schedule New Appointment</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
                  <input
                    type="text"
                    value={selectedPatient}
                    onChange={(e) => setSelectedPatient(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter patient name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={appointmentType}
                    onChange={(e) => setAppointmentType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="video">Video Call</option>
                    <option value="phone">Phone Call</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowNewAppointment(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateAppointment}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Schedule
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Details Modal */}
        {showDetailsModal && selectedAppointment && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
              <h3 className="text-lg font-semibold mb-4">Appointment Details</h3>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{selectedAppointment.patientName}</h4>
                    <p className="text-sm text-gray-600">{selectedAppointment.patientEmail}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <p className="text-sm text-gray-900">{selectedAppointment.date}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Time</label>
                    <p className="text-sm text-gray-900">{selectedAppointment.time}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <p className="text-sm text-gray-900 capitalize">{selectedAppointment.type} call</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Duration</label>
                    <p className="text-sm text-gray-900">{selectedAppointment.duration} minutes</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedAppointment.status)}`}>
                      {selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1)}
                    </span>
                  </div>
                </div>

                {selectedAppointment.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedAppointment.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowDetailsModal(false)
                    handleEditAppointment(selectedAppointment)
                  }}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Edit Appointment
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Appointment Modal */}
        {showEditModal && editingAppointment && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Edit Appointment</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
                  <input
                    type="text"
                    value={editingAppointment.patientName}
                    onChange={(e) => setEditingAppointment({ ...editingAppointment, patientName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Patient Email</label>
                  <input
                    type="email"
                    value={editingAppointment.patientEmail}
                    onChange={(e) => setEditingAppointment({ ...editingAppointment, patientEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={editingAppointment.date}
                    onChange={(e) => setEditingAppointment({ ...editingAppointment, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="time"
                    value={editingAppointment.time}
                    onChange={(e) => setEditingAppointment({ ...editingAppointment, time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={editingAppointment.type}
                    onChange={(e) => setEditingAppointment({ ...editingAppointment, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="video">Video Call</option>
                    <option value="phone">Phone Call</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={editingAppointment.status}
                    onChange={(e) => setEditingAppointment({ ...editingAppointment, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    value={editingAppointment.duration}
                    onChange={(e) => setEditingAppointment({ ...editingAppointment, duration: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={editingAppointment.notes}
                    onChange={(e) => setEditingAppointment({ ...editingAppointment, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateAppointment}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Update Appointment
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pending Requests Modal */}
        {showPendingRequests && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Pending Appointment Requests ({pendingRequests.length})</h3>
                <button
                  onClick={() => setShowPendingRequests(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{request.patientName}</h4>
                          <p className="text-sm text-gray-600">{request.patientEmail}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="h-4 w-4 mr-1" />
                              {request.date}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Clock className="h-4 w-4 mr-1" />
                              {request.time}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              {getTypeIcon(request.type)}
                              <span className="ml-1 capitalize">{request.type} call</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <span>Requested: {request.requestDate}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAcceptAppointmentModal(request)}
                          className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 flex items-center"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Accept
                        </button>
                        <button
                          onClick={() => handleRejectAppointment(request.id)}
                          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 flex items-center"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </button>
                        <button
                          onClick={() => handleViewDetails(request)}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </button>
                      </div>
                    </div>

                    {request.patientMessage && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-900 mb-1">Patient Message:</p>
                        <p className="text-sm text-blue-800">{request.patientMessage}</p>
                      </div>
                    )}

                    {request.notes && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{request.notes}</p>
                      </div>
                    )}
                  </div>
                ))}

                {pendingRequests.length === 0 && (
                  <div className="text-center py-8">
                    <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Requests</h3>
                    <p className="text-gray-600">All appointment requests have been processed.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Accept Appointment Modal */}
        {showAcceptModal && appointmentToAccept && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Accept Appointment Request</h3>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{appointmentToAccept.patientName}</h4>
                    <p className="text-sm text-gray-600">{appointmentToAccept.patientEmail}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <p className="text-sm text-gray-900">{appointmentToAccept.date}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Time</label>
                    <p className="text-sm text-gray-900">{appointmentToAccept.time}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <p className="text-sm text-gray-900 capitalize">{appointmentToAccept.type} call</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Duration</label>
                    <p className="text-sm text-gray-900">{appointmentToAccept.duration} minutes</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Doctor Notes (Optional)</label>
                  <textarea
                    value={doctorResponse}
                    onChange={(e) => setDoctorResponse(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Add any notes or instructions for the patient..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAcceptModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAccept}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Accept Appointment
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Accept Appointment Modal */}
        {showAcceptModal && appointmentToAccept && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
              <h3 className="text-lg font-semibold mb-4">Accept Appointment Request</h3>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{appointmentToAccept.patientName}</h4>
                    <p className="text-sm text-gray-600">{appointmentToAccept.patientEmail}</p>
                    {appointmentToAccept.patientPhone && (
                      <p className="text-sm text-gray-500">{appointmentToAccept.patientPhone}</p>
                    )}
                  </div>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h5 className="font-medium text-orange-800 mb-2">Patient Request Details</h5>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Reason:</span> {appointmentToAccept.reason}
                    </div>
                    <div>
                      <span className="font-medium">Priority:</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${appointmentToAccept.priority === 'high' ? 'bg-red-100 text-red-800' :
                        appointmentToAccept.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                        {appointmentToAccept.priority?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Urgency:</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${appointmentToAccept.urgency === 'emergency' ? 'bg-red-100 text-red-800' :
                        appointmentToAccept.urgency === 'urgent' ? 'bg-orange-100 text-orange-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                        {appointmentToAccept.urgency?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {appointmentToAccept.patientMessage && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Patient Message</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{appointmentToAccept.patientMessage}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Requested Date</label>
                    <p className="text-sm text-gray-900">{appointmentToAccept.date}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Requested Time</label>
                    <p className="text-sm text-gray-900">{appointmentToAccept.time}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Doctor Response (Optional)</label>
                  <textarea
                    value={doctorResponse}
                    onChange={(e) => setDoctorResponse(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Add any notes or instructions for the patient..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowAcceptModal(false)
                    setAppointmentToAccept(null)
                    setDoctorResponse('')
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRejectAppointment(appointmentToAccept.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleAcceptAppointment(appointmentToAccept.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Accept Appointment
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Video Call Component */}
        {showVideoCall && currentCallAppointment && (
          <VideoCall
            isOpen={showVideoCall}
            onClose={handleEndCall}
            appointment={currentCallAppointment}
            role="doctor"
          />
        )}

        {/* Phone Call Component */}
        {showPhoneCall && currentCallAppointment && (
          <PhoneCall
            isOpen={showPhoneCall}
            onClose={handleEndCall}
            appointment={currentCallAppointment}
          />
        )}

      </div>
    </DoctorDashboardLayout>
  )
}