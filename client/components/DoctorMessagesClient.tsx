'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import DoctorDashboardLayout from '@/components/DoctorDashboardLayout'
import LoadingSpinner from '@/components/LoadingSpinner'
import VideoCall from '@/components/VideoCall'
import PhoneCall from '@/components/PhoneCall'
import {
  Search,
  Bell,
  Menu,
  X,
  Calendar,
  Clock,
  ChevronRight,
  MoreVertical,
  Phone,
  Video,
  Mic,
  Image as ImageIcon,
  Send,
  Paperclip,
  CheckCircle,
  User,
  CheckCheck,
  MessageSquare
} from 'lucide-react'
import { userAPI, messagesAPI, ChatMessage } from '@/lib/api'

interface CallHistory {
  id: string
  type: 'video' | 'voice'
  patientName: string
  patientId: string
  duration: number
  timestamp: Date
  status: 'completed' | 'missed' | 'declined'
}

interface Message {
  id: string
  text: string
  sender: 'doctor' | 'patient' | 'system'
  timestamp: Date
  senderName: string
}

interface Patient {
  _id?: string
  id?: string
  name: string
  email: string
  phone?: string
  status?: 'online' | 'offline'
  lastSeen?: Date
}

export default function DoctorMessagesClient() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [newMessage, setNewMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isChatStarted, setIsChatStarted] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [suggestions, setSuggestions] = useState<Array<{
    _id: string
    report: { year: number; month: number }
    suggestions: Array<{ category: string; title: string; description: string; priority: string }>
    createdAt: string
  }>>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [isCalling, setIsCalling] = useState(false)
  const [callType, setCallType] = useState<'video' | 'voice' | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Patient[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [showVideoCall, setShowVideoCall] = useState(false)
  const [showPhoneCall, setShowPhoneCall] = useState(false)
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null)
  const [callHistory, setCallHistory] = useState<CallHistory[]>([])
  const [showCallHistory, setShowCallHistory] = useState(false)
  const [patients, setPatients] = useState<Patient[]>([])
  const [patientsLoading, setPatientsLoading] = useState(true)

  useEffect(() => {
    const loadPatients = async () => {
      try {
        setPatientsLoading(true)
        const { patients } = await userAPI.getMyPatients()
        const normalized = patients.map(p => ({
          ...p,
          id: (p as any)._id || p.id
        })) as Patient[]

        const uniquePatients: Patient[] = []
        const seenIds = new Set<string>()
        for (const patient of normalized) {
          const patientId = ((patient._id || patient.id) as string).toString()
          if (!seenIds.has(patientId)) {
            seenIds.add(patientId)
            uniquePatients.push(patient)
          }
        }

        setPatients(uniquePatients)
      } catch (e) {
        console.error('Failed to load patients', e)
      } finally {
        setPatientsLoading(false)
      }
    }

    if (user) {
      loadPatients()
    }
  }, [user])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  const urlPatientName = searchParams.get('patient')
  const urlPatientEmail = searchParams.get('email') || ''
  const urlPatientId = searchParams.get('id') || (patients[0]?._id || patients[0]?.id || '')

  const currentPatientData = useMemo(() => {
    if (!patients || patients.length === 0) return null
    const byId = patients.find(p => (p._id || p.id) === urlPatientId)
    return byId || patients[0]
  }, [patients, urlPatientId])

  const patientName = urlPatientName || (currentPatientData?.name || '')
  const patientEmail = urlPatientEmail || (currentPatientData?.email || '')
  const patientId = (currentPatientData?._id || currentPatientData?.id || '')

  const hasPatients = patients.length > 0

  useEffect(() => {
    const loadMessages = async () => {
      if (!patientId || !hasPatients) {
        setMessages([])
        setIsChatStarted(false)
        return
      }

      try {
        setLoadingMessages(true)
        const { messages: fetchedMessages } = await messagesAPI.getConversation(patientId)
        const formattedMessages: Message[] = fetchedMessages.map((msg: ChatMessage) => ({
          id: msg._id || msg.id || '',
          text: msg.message,
          sender: msg.type === 'system' ? 'system' : (msg.sender.role === 'doctor' ? 'doctor' : 'patient'),
          timestamp: new Date(msg.createdAt),
          senderName: msg.sender.name
        }))

        setMessages(formattedMessages)
        setIsChatStarted(formattedMessages.length > 0)
      } catch (error) {
        console.error('Error loading messages:', error)
        setMessages([])
        setIsChatStarted(false)
      } finally {
        setLoadingMessages(false)
      }
    }

    loadMessages()
    const interval = setInterval(loadMessages, 5000)
    return () => clearInterval(interval)
  }, [patientId, hasPatients])

  useEffect(() => {
    const loadSuggestions = async () => {
      if (!patientId || !hasPatients) {
        setSuggestions([])
        return
      }

      try {
        setLoadingSuggestions(true)
        const { suggestions: fetchedSuggestions } = await messagesAPI.getSuggestions(patientId)
        setSuggestions(fetchedSuggestions || [])
      } catch (error) {
        console.error('Error loading suggestions:', error)
        setSuggestions([])
      } finally {
        setLoadingSuggestions(false)
      }
    }

    loadSuggestions()
  }, [patientId, hasPatients])

  const displayPatientName = hasPatients ? patientName : 'No patient selected'
  const displayPatientEmail = hasPatients ? patientEmail : ''
  const displayPatientId = hasPatients ? (patientId || '—') : '—'

  useEffect(() => {
    if (!messages.length || !patientId) return

    const history: CallHistory[] = messages
      .filter(m => m.sender === 'system' && m.text.startsWith('📞'))
      .map(m => {
        const isVideo = m.text.includes('Video')
        const match = m.text.match(/\((\d+):(\d+)\)/)
        let duration = 0

        if (match) {
          duration = parseInt(match[1], 10) * 60 + parseInt(match[2], 10)
        }

        return {
          id: m.id,
          type: (isVideo ? 'video' : 'voice') as 'video' | 'voice',
          patientName: displayPatientName,
          patientId: patientId,
          duration,
          timestamp: m.timestamp,
          status: (m.text.includes('missed') ? 'missed' : 'completed') as 'completed' | 'missed'
        }
      })
      .reverse()

    setCallHistory(history)
  }, [messages, patientId, displayPatientName])

  const computeAppointmentId = (patient: Patient) => {
    const raw = (patient.id || patient._id || '').toString()
    const numeric = parseInt(raw.replace(/\D/g, ''), 10)
    return Number.isNaN(numeric) ? Date.now() : numeric
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim().length > 0) {
      const results = patients.filter(patient =>
        patient.name.toLowerCase().includes(query.toLowerCase()) ||
        (patient.id || '').toLowerCase().includes(query.toLowerCase()) ||
        patient.email.toLowerCase().includes(query.toLowerCase())
      )
      setSearchResults(results)
      setShowSearchResults(true)
    } else {
      setSearchResults([])
      setShowSearchResults(false)
    }
  }

  const handleSelectPatient = (patient: Patient) => {
    setSearchQuery('')
    setShowSearchResults(false)
    router.push(`/doctor/messages?patient=${encodeURIComponent(patient.name)}&email=${encodeURIComponent(patient.email)}&id=${encodeURIComponent((patient._id || patient.id) as string)}`)
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSearchResults([])
    setShowSearchResults(false)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.search-container')) {
        setShowSearchResults(false)
      }
    }

    if (showSearchResults) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSearchResults])

  if (loading || patientsLoading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return null
  }

  const handleStartChat = async () => {
    if (!hasPatients || !currentPatientData || !patientId) {
      alert('No patient selected. Assign a patient before starting a chat.')
      return
    }

    try {
      setSendingMessage(true)
      const welcomeText = `Hello! I've reviewed your health report and I'd like to discuss some recommendations with you. How are you feeling today?`
      await messagesAPI.sendMessage(patientId, welcomeText, 'text')
      setIsChatStarted(true)
    } catch (error) {
      console.error('Error starting chat:', error)
      alert('Failed to start chat. Please try again.')
    } finally {
      setSendingMessage(false)
    }
  }

  const handleVideoCall = () => {
    if (!isChatStarted) {
      alert('Please start a chat first before making a call.')
      return
    }
    if (!hasPatients || !currentPatientData) {
      alert('No patient selected. Assign a patient before starting a call.')
      return
    }

    const patientIdentifier = (currentPatientData._id || currentPatientData.id || patientId || Date.now().toString()).toString()
    const patient: Patient = {
      id: patientIdentifier,
      name: currentPatientData.name,
      email: currentPatientData.email,
      status: 'online'
    }
    setCurrentPatient(patient)
    setIsCalling(true)
    setCallType('video')
    setShowVideoCall(true)
  }

  const handleVoiceCall = () => {
    if (!isChatStarted) {
      alert('Please start a chat first before making a call.')
      return
    }
    if (!hasPatients || !currentPatientData) {
      alert('No patient selected. Assign a patient before starting a call.')
      return
    }

    const patientIdentifier = (currentPatientData._id || currentPatientData.id || patientId || Date.now().toString()).toString()
    const patient: Patient = {
      id: patientIdentifier,
      name: currentPatientData.name,
      email: currentPatientData.email,
      status: 'online'
    }
    setCurrentPatient(patient)
    setIsCalling(true)
    setCallType('voice')
    setShowPhoneCall(true)
  }

  const handleEndCall = (callType: 'video' | 'voice', duration: number = 0) => {
    setShowVideoCall(false)
    setShowPhoneCall(false)
    setIsCalling(false)
    setCallType(null)

    if (currentPatient) {
      const newCallHistory: CallHistory = {
        id: Date.now().toString(),
        type: callType,
        patientName: currentPatient.name,
        patientId: (currentPatient.id || currentPatient._id || '').toString(),
        duration,
        timestamp: new Date(),
        status: duration > 0 ? 'completed' : 'missed'
      }
      setCallHistory(prev => [newCallHistory, ...prev])

      const patientId = (currentPatient.id || currentPatient._id || '').toString()
      const callMessageText = `📞 ${callType === 'video' ? 'Video' : 'Voice'} call ${duration > 0 ? `completed (${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')})` : 'missed'}`
      messagesAPI.sendMessage(patientId, callMessageText, 'system').catch(err => console.error('Failed to log call message', err))

      const callMessage: Message = {
        id: Date.now().toString(),
        text: callMessageText,
        sender: 'system',
        timestamp: new Date(),
        senderName: 'System'
      }
      setMessages(prev => [...prev, callMessage])
    }
  }

  const handleSendMessage = async () => {
    if (!hasPatients || !isChatStarted || !patientId || !newMessage.trim()) {
      return
    }

    const messageText = newMessage.trim()
    setNewMessage('')

    try {
      setSendingMessage(true)
      await messagesAPI.sendMessage(patientId, messageText, 'text')
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message. Please try again.')
      setNewMessage(messageText)
    } finally {
      setSendingMessage(false)
    }
  }

  const handleSendSuggestion = async (suggestionId: string) => {
    if (!patientId || !hasPatients) {
      return
    }

    try {
      setSendingMessage(true)
      await messagesAPI.sendSuggestion(patientId, suggestionId)
    } catch (error) {
      console.error('Error sending suggestion:', error)
      alert('Failed to send suggestion. Please try again.')
    } finally {
      setSendingMessage(false)
    }
  }

  return (
    <DoctorDashboardLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4 lg:py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative search-container">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary-200" />
                  <input
                    type="text"
                    placeholder="Search patients by name, ID, or email..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 pr-10 py-2.5 border-0 bg-white/10 text-white placeholder-primary-200 rounded-lg focus:ring-2 focus:ring-white/30 focus:bg-white/20 w-80 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary-200 hover:text-white transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}

                  {showSearchResults && searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                      {searchResults.map((patient) => (
                        <div
                          key={patient.id}
                          className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          onClick={() => handleSelectPatient(patient)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                <User className="h-5 w-5 text-primary-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{patient.name}</p>
                                <p className="text-sm text-gray-600">{patient.id}</p>
                                <p className="text-xs text-gray-500">{patient.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${patient.status === 'online'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                              }`}>
                                {patient.status === 'online' ? 'Online' : 'Offline'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {showSearchResults && searchResults.length === 0 && searchQuery.trim().length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
                      <p className="text-gray-500 text-center">No patients found matching "{searchQuery}"</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row h-[calc(100vh-80px)]">
          <div className="w-full lg:w-80 bg-white border-b lg:border-b-0 lg:border-r border-gray-200 p-4 lg:p-6 space-y-6">
            <div className="border border-gray-200 rounded-xl p-3 shadow-sm">
              <div className="border-b border-gray-200 pb-2 mb-2">
                <h3 className="text-base font-bold text-gray-900 tracking-tight">Communication Tools</h3>
                <p className="text-[10px] text-gray-500 mt-0.5">Connect with your patient</p>
              </div>
              <div className="space-y-2">
                <button
                  onClick={handleStartChat}
                  disabled={!hasPatients || isChatStarted}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${isChatStarted
                    ? 'bg-green-50 text-green-700 border-2 border-green-200 cursor-default'
                    : 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                  } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                >
                  <MessageSquare className="h-5 w-5" />
                  {isChatStarted ? '✓ Chat Active' : 'Start Conversation'}
                </button>
                <button
                  onClick={handleVideoCall}
                  disabled={!hasPatients || isCalling || !isChatStarted}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${isCalling && callType === 'video'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg animate-pulse'
                    : 'bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-700 border-2 border-blue-200 hover:border-blue-300 transform hover:-translate-y-0.5'
                  } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                >
                  <Video className="h-5 w-5" />
                  {isCalling && callType === 'video' ? 'Connecting...' : 'Video Call'}
                </button>
                <button
                  onClick={handleVoiceCall}
                  disabled={!hasPatients || isCalling || !isChatStarted}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${isCalling && callType === 'voice'
                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg animate-pulse'
                    : 'bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 text-green-700 border-2 border-green-200 hover:border-green-300 transform hover:-translate-y-0.5'
                  } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                >
                  <Phone className="h-5 w-5" />
                  {isCalling && callType === 'voice' ? 'Connecting...' : 'Voice Call'}
                </button>
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl p-3 shadow-sm">
              <div className="border-b border-gray-200 pb-2 mb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Phone className="h-4 w-4 text-purple-700" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900 tracking-tight">Call History</h3>
                      <p className="text-[10px] text-gray-500">Recent patient calls</p>
                    </div>
                  </div>
                  {callHistory.length > 3 && (
                    <button
                      onClick={() => setShowCallHistory(!showCallHistory)}
                      className="text-xs text-purple-700 hover:text-purple-900 font-semibold transition-colors bg-purple-50 px-3 py-1.5 rounded-lg hover:bg-purple-100"
                    >
                      {showCallHistory ? 'Show Less' : 'View All'}
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                {callHistory.slice(0, showCallHistory ? callHistory.length : 3).map((call) => (
                  <div key={call.id} className="flex items-center justify-between p-2 bg-gradient-to-r from-purple-50 to-white rounded-lg hover:from-purple-100 hover:to-purple-50 transition-all duration-200 border border-purple-100 hover:border-purple-200 hover:shadow-sm">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2.5 rounded-xl shadow-sm ${call.type === 'video'
                        ? 'bg-gradient-to-br from-blue-100 to-blue-200'
                        : 'bg-gradient-to-br from-green-100 to-green-200'
                      }`}>
                        {call.type === 'video' ? (
                          <Video className="h-4 w-4 text-blue-700" />
                        ) : (
                          <Phone className="h-4 w-4 text-green-700" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{call.patientName}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          📅 {call.timestamp.toLocaleDateString()} • ⏰ {call.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {call.status === 'completed' ? (
                        <CheckCheck className="h-3 w-3 text-green-600 ml-auto" />
                      ) : (
                        <X className="h-3 w-3 text-red-500 ml-auto" />
                      )}
                      {call.duration > 0 && (
                        <p className="text-[10px] text-gray-600 font-medium mt-1">
                          {Math.floor(call.duration / 60)}:{(call.duration % 60).toString().padStart(2, '0')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                {callHistory.length === 0 && (
                  <div className="text-center py-8 text-gray-500 bg-purple-50 rounded-xl border-2 border-dashed border-purple-200">
                    <Phone className="h-10 w-10 mx-auto mb-3 text-purple-300" />
                    <p className="text-sm font-medium">No call history yet</p>
                    <p className="text-xs mt-1">Call logs will appear here</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Recent Contacts</h3>
              <div className="space-y-3">
                {patients.length === 0 ? (
                  <p className="text-sm text-gray-500">No patients assigned yet.</p>
                ) : patients.slice(0, 2).map((patient) => {
                  const isCurrentPatient = patient.name === patientName
                  return (
                    <div
                      key={(patient._id || patient.id) as string}
                      className={`flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer ${isCurrentPatient
                        ? 'bg-primary-50 border border-primary-200'
                        : 'bg-white border border-gray-200'
                      }`}
                      onClick={() => {
                        if (!isCurrentPatient) {
                          router.push(`/doctor/messages?patient=${encodeURIComponent(patient.name)}&email=${encodeURIComponent(patient.email)}&id=${encodeURIComponent((patient._id || patient.id) as string)}`)
                        }
                      }}
                    >
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{patient.name}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col bg-gray-50">
            <div className="bg-white border-b border-gray-200 px-6 py-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-white"></span>
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900">{displayPatientName}</h2>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-gray-600">ID: {displayPatientId}</p>
                      {displayPatientEmail && (
                        <>
                          <span className="text-gray-300">•</span>
                          <p className="text-xs text-gray-500">{displayPatientEmail}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                    <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                    Online
                  </span>
                  {currentPatientData?.phone && (
                    <button
                      onClick={() => window.open(`tel:${currentPatientData.phone}`)}
                      className="flex items-center gap-2 px-4 py-2 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 border border-green-200 transition-all font-medium"
                    >
                      <Phone className="h-4 w-4" />
                      <span>{currentPatientData.phone}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4" style={{ backgroundColor: '#E5DDD5' }}>
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,.03) 10px, rgba(0,0,0,.03) 20px)' }}></div>
              <div className="relative z-10">
                {loadingMessages ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Loading messages...</p>
                  </div>
                ) : !hasPatients ? (
                  <div className="text-center py-12">
                    <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No patients assigned</h3>
                    <p className="text-gray-600 mb-6">Assign patients to your profile to start messaging and calling.</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Messages Yet</h3>
                    <p className="text-gray-600 mb-6">Start a conversation with your patient to provide personalized guidance.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${message.sender === 'doctor'
                          ? 'justify-end'
                          : message.sender === 'system'
                            ? 'justify-center'
                            : 'justify-start'
                        }`}
                      >
                        {message.sender === 'patient' && (
                          <div className="flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center">
                              <User className="h-4 w-4 text-white" />
                            </div>
                          </div>
                        )}
                        <div
                          className={`max-w-md px-3 py-2 rounded-2xl shadow-sm ${message.sender === 'doctor'
                            ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-md'
                            : message.sender === 'system'
                              ? 'bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-900 border-2 border-amber-200 rounded-xl'
                              : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md shadow-md'
                          }`}
                        >
                          <p className="text-xs leading-relaxed whitespace-pre-wrap">{message.text}</p>
                          <div className="flex items-center justify-end gap-1 mt-1 select-none">
                            <span className={`text-[10px] ${message.sender === 'doctor'
                              ? 'text-blue-100'
                              : message.sender === 'system'
                                ? 'text-amber-600'
                                : 'text-gray-400'
                            }`}>
                              {message.timestamp.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            {message.sender === 'doctor' && (
                              <CheckCheck className="h-3 w-3 text-blue-200" />
                            )}
                          </div>
                        </div>
                        {message.sender === 'doctor' && (
                          <div className="flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                              <User className="h-4 w-4 text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white border-t border-gray-200 p-4 lg:p-6">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={isChatStarted ? 'Type your message...' : 'Start a chat to begin messaging...'}
                  className="input flex-1"
                  disabled={!isChatStarted}
                  onKeyDown={(e) => e.key === 'Enter' && isChatStarted && handleSendMessage()}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!isChatStarted || !newMessage.trim() || sendingMessage}
                  className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingMessage ? (
                    <span className="text-sm">Sending...</span>
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showVideoCall && currentPatient && (
        <VideoCall
          isOpen={showVideoCall}
          onClose={(duration) => handleEndCall('video', duration)}
          appointment={{
            id: Date.now(),
            patientName: currentPatient?.name || '',
            patientEmail: currentPatient?.email || '',
            type: 'video'
          }}
          role="doctor"
        />
      )}

      {showPhoneCall && currentPatient && (
        <PhoneCall
          isOpen={showPhoneCall}
          onClose={(duration) => handleEndCall('voice', duration)}
          appointment={{
            id: Date.now(),
            patientName: currentPatient?.name || '',
            patientEmail: currentPatient?.email || '',
            type: 'phone'
          }}
        />
      )}
    </DoctorDashboardLayout>
  )
}
