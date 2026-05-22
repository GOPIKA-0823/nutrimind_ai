'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import LoadingSpinner from '@/components/LoadingSpinner'
import { ArrowLeft, ChevronLeft, ChevronRight, Sun, Star, Check, Calendar, Clock, User, Video, Phone } from 'lucide-react'
import { appointmentsAPI, handleApiError, userAPI } from '@/lib/api'
import AppointmentDoctorSelection from '@/components/AppointmentDoctorSelection'
import PaymentForm, { PaymentData } from '@/components/PaymentForm'
import { User as UserType } from '@/lib/api'
import toast from 'react-hot-toast'

interface TimeSlot {
  id: string
  time: string
  available: boolean
}

interface DaySlot {
  date: string
  day: string
  month: string
  slots: TimeSlot[]
}

interface Appointment {
  _id: string
  patient: {
    _id: string
    name: string
    email: string
  }
  doctor: {
    _id: string
    name: string
    email: string
  }
  type: 'chat' | 'video' | 'in-person'
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show'
  scheduledAt: string
  duration: number
  location?: string
  meetingLink?: string
  agenda?: string[]
  notes?: string
  createdAt: string
  updatedAt: string
}

export default function ScheduleAppointmentPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [consultationType, setConsultationType] = useState<'online' | 'hospital'>('online')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loadingAppointments, setLoadingAppointments] = useState(false)
  const [showMyAppointments, setShowMyAppointments] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<UserType | null>(null)
  const [showPayment, setShowPayment] = useState(false)
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  // Load appointments from API
  useEffect(() => {
    if (user) {
      fetchAppointments()
    }
  }, [user])

  const fetchAppointments = async () => {
    try {
      setLoadingAppointments(true)
      const response = await appointmentsAPI.getAppointments()
      setAppointments(response.appointments || [])
    } catch (error: any) {
      console.error('Error fetching appointments:', error)
      toast.error(handleApiError(error))
    } finally {
      setLoadingAppointments(false)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return null
  }

  // Generate dates for the current month
  const generateDates = () => {
    const dates: DaySlot[] = []
    const today = new Date()
    const currentMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    const currentMonthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)

      const timeSlots: TimeSlot[] = [
        { id: '1', time: '09:00 AM', available: true },
        { id: '2', time: '10:30 AM', available: true },
        { id: '3', time: '02:00 PM', available: true },
        { id: '4', time: '03:30 PM', available: true },
        { id: '5', time: '07:45 PM', available: true },
      ]

      dates.push({
        date: date.toISOString().split('T')[0],
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        slots: timeSlots
      })
    }

    return dates
  }

  const dates = generateDates()
  const selectedDayData = dates.find(d => d.date === selectedDate)

  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
    setSelectedTime('')
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
  }

  const handleContinue = () => {
    if (!selectedDate || !selectedTime) {
      toast.error('Please select a date and time')
      return
    }

    if (!selectedDoctor) {
      toast.error('Please select a doctor')
      return
    }

    // Show payment form
    setShowPayment(true)
  }

  const handlePaymentSuccess = async (payment: PaymentData) => {
    setPaymentData(payment)

    try {
      setIsCreating(true)

      // Parse the selected time and create a proper datetime
      const [time, period] = selectedTime.split(' ')
      const [hours, minutes] = time.split(':')
      let hour24 = parseInt(hours, 10)

      // Convert to 24-hour format
      if (period === 'PM' && hour24 !== 12) {
        hour24 += 12
      } else if (period === 'AM' && hour24 === 12) {
        hour24 = 0
      }

      // Create the appointment datetime
      const appointmentDate = new Date(selectedDate)
      appointmentDate.setHours(hour24, parseInt(minutes, 10), 0, 0)

      const patientId = user?.id || user?._id
      const doctorId = selectedDoctor?._id || selectedDoctor?.id

      if (!patientId || !doctorId || !selectedDoctor) {
        toast.error('Invalid user or doctor ID')
        return
      }

      await appointmentsAPI.bookAppointmentWithPayment(
        patientId,
        doctorId,
        appointmentDate.toISOString(),
        consultationType === 'online' ? 'video' : 'phone',
        payment
      )

      await fetchAppointments()

      toast.success(`Appointment scheduled successfully for ${selectedDayData?.day} ${selectedDayData?.month} at ${selectedTime}`)

      setSelectedDate('')
      setSelectedTime('')
      setSelectedDoctor(null)
      setShowPayment(false)
      setPaymentData(null)
      setShowMyAppointments(true)
    } catch (error: any) {
      const message = handleApiError(error)
      toast.error(message)
      console.error('Appointment booking failed:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handlePaymentCancel = () => {
    setShowPayment(false)
    setPaymentData(null)
  }

  const getConsultationPrice = () => {
    return consultationType === 'online' ? 150 : 200
  }

  const getConsultationPriceFormatted = () => {
    const price = getConsultationPrice()
    return `₹${price}`
  }

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
      return
    }

    try {
      await appointmentsAPI.cancelAppointment(appointmentId)
      await fetchAppointments()
      toast.success('Appointment cancelled successfully')
    } catch (error: any) {
      console.error('Error cancelling appointment:', error)
      toast.error(handleApiError(error))
    }
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-md mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => router.back()}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <ArrowLeft className="h-6 w-6 text-gray-600" />
                </button>
                <h1 className="text-lg font-semibold text-gray-900 ml-4">Schedule Appointment</h1>
              </div>
              <button
                onClick={() => setShowMyAppointments(!showMyAppointments)}
                className="flex items-center space-x-2 px-3 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors"
              >
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">My Appointments</span>
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-md mx-auto bg-white min-h-screen">
          {/* My Appointments Section */}
          {showMyAppointments && (
            <div className="p-6 border-b bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">My Appointments</h2>
                <button
                  onClick={() => setShowMyAppointments(false)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Close
                </button>
              </div>

              {loadingAppointments ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No appointments scheduled</p>
                  <p className="text-sm text-gray-400 mt-1">Schedule your first appointment below</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {appointments.map((appointment) => (
                    <div key={appointment._id} className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="flex items-center space-x-1">
                              {appointment.type === 'video' ? <Video className="h-4 w-4 text-blue-500" /> : <Phone className="h-4 w-4 text-green-500" />}
                              <span className="text-sm font-medium text-gray-900">
                                {appointment.type === 'video' ? 'Video Call' : 'Phone Call'}
                              </span>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                              appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                appointment.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                                  appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                              }`}>
                              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1).replace('-', ' ')}
                            </span>
                          </div>

                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{new Date(appointment.scheduledAt).toLocaleDateString()} at {new Date(appointment.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <User className="h-4 w-4" />
                              <span>Dr. {appointment.doctor.name}</span>
                            </div>
                          </div>
                          {(appointment as any).billing && (
                            <div className="mt-2 flex items-center space-x-2">
                              <span className="text-xs text-gray-500">Payment:</span>
                              <span className={`text-xs font-medium ${(appointment as any).billing.status === 'paid'
                                ? 'text-green-600'
                                : (appointment as any).billing.status === 'pending'
                                  ? 'text-yellow-600'
                                  : 'text-red-600'
                                }`}>
                                {(appointment as any).billing.status === 'paid'
                                  ? `Paid - ₹${(appointment as any).billing.amount || 0}`
                                  : (appointment as any).billing.status === 'pending'
                                    ? `Pending - ₹${(appointment as any).billing.amount || 0}`
                                    : 'Cancelled'}
                              </span>
                            </div>
                          )}

                          {appointment.notes && (
                            <p className="text-sm text-gray-500 mt-2">{appointment.notes}</p>
                          )}
                        </div>

                        {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
                          <button
                            onClick={() => handleCancelAppointment(appointment._id)}
                            className="text-xs text-red-600 hover:text-red-800 font-medium"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Doctor Selection - Only show when not viewing appointments */}
          {!showMyAppointments && (
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Doctor</h3>
              <AppointmentDoctorSelection
                assignedDoctorId={user?.profile?.doctorId}
                selectedDoctor={selectedDoctor}
                onDoctorSelect={setSelectedDoctor}
              />
              {selectedDoctor && (
                <div className="mt-4 p-3 bg-primary-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold">
                        {selectedDoctor.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold text-gray-900">{selectedDoctor.name}</h2>
                      {selectedDoctor.profile?.specialization && (
                        <p className="text-sm text-primary-600 mt-1">{selectedDoctor.profile.specialization}</p>
                      )}
                      {selectedDoctor.profile?.bio && (
                        <p className="text-xs text-gray-500 mt-1">{selectedDoctor.profile.bio}</p>
                      )}
                      {selectedDoctor.profile?.experience && (
                        <p className="text-xs text-gray-600 mt-1">{selectedDoctor.profile.experience} years of experience</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Consultation Type Selection - Only show when not viewing appointments */}
          {!showMyAppointments && (
            <div className="p-6 border-b">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setConsultationType('online')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${consultationType === 'online'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  ONLINE CONSULT
                </button>
                <button
                  onClick={() => setConsultationType('hospital' as any)}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${consultationType === ('hospital' as any)
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  PHONE CALL
                </button>
              </div>
            </div>
          )}

          {/* Date Selection - Only show when not viewing appointments */}
          {!showMyAppointments && (
            <div className="p-6 border-b">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Select Date</h3>
                <div className="flex items-center space-x-2">
                  <button className="p-1 hover:bg-gray-100 rounded-full">
                    <ChevronLeft className="h-5 w-5 text-gray-600" />
                  </button>
                  <button className="p-1 hover:bg-gray-100 rounded-full">
                    <ChevronRight className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="flex space-x-3 overflow-x-auto pb-2">
                {dates.map((day) => (
                  <button
                    key={day.date}
                    onClick={() => handleDateSelect(day.date)}
                    className={`flex-shrink-0 flex flex-col items-center p-3 rounded-lg border-2 transition-all ${selectedDate === day.date
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-primary-200'
                      }`}
                  >
                    <span className="text-xs font-medium">{day.day}</span>
                    <span className="text-sm font-semibold">{day.date.split('-')[2]}</span>
                    <span className="text-xs">{day.month}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Time Slot Selection - Only show when not viewing appointments */}
          {!showMyAppointments && selectedDate && (
            <div className="p-6 border-b">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Sun className="h-5 w-5 text-amber-500 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Available Slots</h3>
                </div>
                <span className="text-sm text-gray-500">
                  {selectedDayData?.slots.filter(slot => slot.available).length} SLOTS
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {selectedDayData?.slots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => handleTimeSelect(slot.time)}
                    disabled={!slot.available}
                    className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${selectedTime === slot.time
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : slot.available
                        ? 'border-gray-200 bg-white text-gray-700 hover:border-primary-200'
                        : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                      }`}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Payment Section - Only show when not viewing appointments */}
          {!showMyAppointments && showPayment && (
            <div className="p-6 border-t bg-white">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment</h3>
                <p className="text-sm text-gray-600">
                  Complete payment to confirm your appointment with {selectedDoctor?.name}
                </p>
              </div>
              <PaymentForm
                amount={getConsultationPrice()}
                currency="INR"
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentCancel={handlePaymentCancel}
              />
            </div>
          )}

          {/* Footer - Only show when not viewing appointments and not showing payment */}
          {!showMyAppointments && !showPayment && (
            <div className="p-6 bg-white border-t">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-gray-900">{getConsultationPriceFormatted()}</span>
                  <span className="text-sm text-gray-500 ml-1">per consultation</span>
                </div>
                <button
                  onClick={handleContinue}
                  disabled={!selectedDate || !selectedTime || !selectedDoctor || isCreating}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${selectedDate && selectedTime && selectedDoctor && !isCreating
                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                  {isCreating ? 'Scheduling...' : 'Continue to Payment'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
