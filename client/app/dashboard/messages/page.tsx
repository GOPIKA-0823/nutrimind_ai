'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import LoadingSpinner from '@/components/LoadingSpinner'
import VideoCall from '@/components/VideoCall'
import PhoneCall from '@/components/PhoneCall'
import { Send, Phone, Video, Image as ImageIcon, Mic, Paperclip, MoreVertical, CheckCheck, MessageSquare, Bell, User, X } from 'lucide-react'
import { userAPI, messagesAPI, ChatMessage } from '@/lib/api'

interface CallHistory {
  id: string
  type: 'video' | 'voice'
  doctorName: string
  doctorId: string
  duration: number
  timestamp: Date
  status: 'completed' | 'missed' | 'declined'
}

interface Message {
  id: string
  text: string
  sender: 'user' | 'doctor' | 'system'
  timestamp: Date
  senderName: string
}

export default function MessagesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [newMessage, setNewMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isChatStarted, setIsChatStarted] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [isCalling, setIsCalling] = useState(false)
  const [callType, setCallType] = useState<'video' | 'voice' | null>(null)
  const [showVideoCall, setShowVideoCall] = useState(false)
  const [showPhoneCall, setShowPhoneCall] = useState(false)
  const [callHistory, setCallHistory] = useState<CallHistory[]>([])
  const [showCallHistory, setShowCallHistory] = useState(false)

  // Resolve assigned doctor from DB via profile.doctorId
  const [doctor, setDoctor] = useState<{ id: string; name: string; email: string; phone?: string } | null>(null)
  const [doctorLoading, setDoctorLoading] = useState(true)

  useEffect(() => {
    const loadDoctor = async () => {
      try {
        setDoctorLoading(true)
        const profile = await userAPI.getProfile()
        const doctorId = (profile as any).profile?.doctorId
        if (!doctorId) {
          setDoctor(null)
          return
        }
        // Fetch available doctors and match by id
        const { doctors } = await userAPI.getDoctors()
        const match = doctors.find(d => (d._id || d.id) === doctorId)
        if (match) {
          setDoctor({
            id: (match as any)._id || (match as any).id,
            name: match.name,
            email: match.email,
            phone: (match as any).phone
          })
        } else {
          setDoctor(null)
        }
      } catch (e) {
        console.error('Failed to load assigned doctor', e)
        setDoctor(null)
      } finally {
        setDoctorLoading(false)
      }
    }
    loadDoctor()
  }, [])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  // Fetch messages when doctor is available
  useEffect(() => {
    const loadMessages = async () => {
      if (!doctor || !doctor.id) {
        setMessages([])
        setIsChatStarted(false)
        return
      }

      try {
        setLoadingMessages(true)
        const { messages: fetchedMessages } = await messagesAPI.getConversation(doctor.id)

        // Convert ChatMessage to Message format
        const formattedMessages: Message[] = fetchedMessages.map((msg: ChatMessage) => ({
          id: msg._id || msg.id || '',
          text: msg.message,
          sender: msg.type === 'system' ? 'system' : (msg.sender.role === 'doctor' ? 'doctor' : 'user'),
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

    // Set up polling to refresh messages every 5 seconds
    const interval = setInterval(loadMessages, 5000)
    return () => clearInterval(interval)
  }, [doctor])

  // Parse messages to populate call history
  useEffect(() => {
    if (!messages.length || !doctor) return

    const history: CallHistory[] = messages
      .filter(m => m.sender === 'system' && m.text.startsWith('📞'))
      .map(m => {
        const isVideo = m.text.includes('Video')
        const isMissed = m.text.includes('missed')
        let duration = 0

        if (!isMissed) {
          const match = m.text.match(/\((\d+):(\d+)\)/)
          if (match) {
            duration = parseInt(match[1]) * 60 + parseInt(match[2])
          }
        }

        return {
          id: m.id,
          type: (isVideo ? 'video' : 'voice') as 'video' | 'voice',
          doctorName: doctor.name,
          doctorId: doctor.id,
          duration,
          timestamp: m.timestamp,
          status: (isMissed ? 'missed' : 'completed') as 'completed' | 'missed'
        }
      })
      .reverse()

    setCallHistory(history)
  }, [messages, doctor])

  if (loading || doctorLoading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return null
  }

  const hasDoctor = Boolean(doctor)

  const handleStartChat = async () => {
    if (!hasDoctor || !doctor) {
      alert('You have no assigned doctor yet. Please connect with a doctor to start messaging.')
      return
    }

    // Chat is automatically started when messages exist, so we just need to send a message
    // The doctor should initiate, but if user wants to start, we can send a greeting
    try {
      setSendingMessage(true)
      const greetingText = `Hello! I'd like to start a conversation about my health.`
      await messagesAPI.sendMessage(doctor.id, greetingText, 'text')
      setIsChatStarted(true)
      // Messages will be refreshed by the useEffect
    } catch (error) {
      console.error('Error starting chat:', error)
      alert('Failed to start chat. Please try again.')
    } finally {
      setSendingMessage(false)
    }
  }

  const handleVideoCall = () => {
    if (!hasDoctor) {
      alert('You have no assigned doctor yet.')
      return
    }
    if (!isChatStarted) {
      alert('Please start a chat first before making a call.')
      return
    }

    setIsCalling(true)
    setCallType('video')
    setShowVideoCall(true)
  }

  const handleVoiceCall = () => {
    if (!hasDoctor) {
      alert('You have no assigned doctor yet.')
      return
    }
    if (!isChatStarted) {
      alert('Please start a chat first before making a call.')
      return
    }

    setIsCalling(true)
    setCallType('voice')
    setShowPhoneCall(true)
  }

  const handleEndCall = (callType: 'video' | 'voice', duration: number = 0) => {
    setShowVideoCall(false)
    setShowPhoneCall(false)
    setIsCalling(false)
    setCallType(null)

    // Add to call history
    if (doctor) {
      const newCallHistory: CallHistory = {
        id: Date.now().toString(),
        type: callType,
        doctorName: doctor.name,
        doctorId: doctor.id,
        duration: duration,
        timestamp: new Date(),
        status: duration > 0 ? 'completed' : 'missed'
      }
      setCallHistory(prev => [newCallHistory, ...prev])

      // Persist call log as a system message
      const callMessageText = `📞 ${callType === 'video' ? 'Video' : 'Voice'} call ${duration > 0 ? `completed (${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')})` : 'missed'}`

      // Send to API (fire and forget, allow polling to update or local state to show immediately)
      messagesAPI.sendMessage(doctor.id, callMessageText, 'system').catch(err => console.error('Failed to log call message', err))

      // Add call message to chat locally for immediate feedback
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
    if (!hasDoctor || !isChatStarted || !doctor || !newMessage.trim()) {
      return
    }

    const messageText = newMessage.trim()
    setNewMessage('')

    try {
      setSendingMessage(true)
      await messagesAPI.sendMessage(doctor.id, messageText, 'text')
      // Messages will be refreshed by the useEffect polling
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message. Please try again.')
      setNewMessage(messageText) // Restore message on error
    } finally {
      setSendingMessage(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4 lg:py-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">
                  Messages
                </h1>
                <p className="text-primary-100 text-sm font-medium">
                  Secure communication with your healthcare provider
                </p>
              </div>
              <button className="relative rounded-lg p-2 hover:bg-white/10 transition-all duration-200 group">
                <Bell className="h-5 w-5 lg:h-6 lg:w-6 text-white group-hover:scale-110 transition-transform" />
                <span className="absolute top-1 right-1 inline-flex h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white shadow-sm"></span>
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row h-[calc(100vh-140px)]">
          {/* Left Sidebar */}
          <div className="w-full lg:w-80 bg-white border-b lg:border-b-0 lg:border-r border-gray-200 p-4 lg:p-6 space-y-6 overflow-y-auto">
            {/* Communication Tools */}
            <div className="border border-gray-200 rounded-xl p-3 shadow-sm">
              <div className="border-b border-gray-200 pb-2 mb-2">
                <h3 className="text-base font-bold text-gray-900 tracking-tight">Communication Tools</h3>
                <p className="text-[10px] text-gray-500 mt-0.5">Connect with your doctor</p>
              </div>
              <div className="space-y-2">
                {!hasDoctor && (
                  <div className="text-xs text-blue-700 bg-blue-50 border border-blue-200 p-3 rounded-lg mb-2">
                    <p className="font-medium">Awaiting doctor assignment</p>
                  </div>
                )}
                <button
                  onClick={handleStartChat}
                  disabled={!hasDoctor || isChatStarted}
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
                  disabled={!hasDoctor || isCalling || !isChatStarted}
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
                  disabled={!hasDoctor || isCalling || !isChatStarted}
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

            {/* Call History */}
            <div className="border border-gray-200 rounded-xl p-3 shadow-sm">
              <div className="border-b border-gray-200 pb-2 mb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Phone className="h-4 w-4 text-blue-700" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900 tracking-tight">Call History</h3>
                      <p className="text-[10px] text-gray-500">Recent communications</p>
                    </div>
                  </div>
                  {callHistory.length > 3 && (
                    <button
                      onClick={() => setShowCallHistory(!showCallHistory)}
                      className="text-xs text-blue-700 hover:text-blue-900 font-semibold transition-colors bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100"
                    >
                      {showCallHistory ? 'Show Less' : 'View All'}
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                {callHistory.slice(0, showCallHistory ? callHistory.length : 3).map((call) => (
                  <div key={call.id} className="flex items-center justify-between p-2 bg-gradient-to-r from-gray-50 to-white rounded-lg hover:from-gray-100 hover:to-gray-50 transition-all duration-200 border border-gray-100 hover:border-gray-200 hover:shadow-sm">
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
                        <p className="text-sm font-semibold text-gray-900">{call.doctorName}</p>
                        <p className="text-[10px] text-gray-500 flex items-center gap-1">
                          {call.timestamp.toLocaleDateString()} • {call.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                  <p className="text-xs text-gray-400 text-center py-2">No calls yet</p>
                )}
              </div>
            </div>

            {/* Your Doctor */}
            <div className="border border-gray-200 rounded-xl p-3 shadow-sm">
              <div className="border-b border-gray-200 pb-2 mb-2">
                <h3 className="text-base font-bold text-gray-900 tracking-tight">Your Doctor</h3>
                <p className="text-[10px] text-gray-500 mt-0.5">Assigned provider</p>
              </div>
              <div className="space-y-2">
                {doctor ? (
                  <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{doctor.name}</p>
                      {doctor.phone && <p className="text-xs text-gray-500">{doctor.phone}</p>}
                      <div className="flex items-center mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-800">
                          Available
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">No doctor assigned yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col bg-white">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                  {doctor ? <User className="h-5 w-5 text-primary-600" /> : <MessageSquare className="h-5 w-5 text-gray-400" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {doctor?.name || 'No Doctor Assigned'}
                  </h3>
                  {doctor && (
                    <div className="flex items-center gap-1.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      <span className="text-xs text-green-600 font-medium">Online</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <Phone className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <Video className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Messages List - Fixed Height Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <LoadingSpinner />
                </div>
              ) : !hasDoctor ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 text-gray-500">
                  <MessageSquare className="h-12 w-12 text-gray-300 mb-4" />
                  <p>No doctor assigned yet</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 text-gray-500">
                  <MessageSquare className="h-12 w-12 text-gray-300 mb-4" />
                  <p>Start a conversation with your doctor</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-2 ${message.sender === 'user'
                      ? 'justify-end'
                      : message.sender === 'system'
                        ? 'justify-center'
                        : 'justify-start'
                      }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-3 py-2 rounded-2xl shadow-sm ${message.sender === 'user'
                        ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-br-md'
                        : message.sender === 'system'
                          ? 'bg-gradient-to-r from-yellow-50 to-amber-50 text-amber-900 border-2 border-amber-200 rounded-xl'
                          : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md shadow-md'
                        }`}
                    >
                      <p className="text-xs leading-relaxed whitespace-pre-wrap">{message.text}</p>
                      <div className="flex items-center justify-end gap-1 mt-1 select-none">
                        <span className={`text-[10px] ${message.sender === 'user'
                          ? 'text-white/80'
                          : message.sender === 'system'
                            ? 'text-amber-600'
                            : 'text-gray-400'
                          }`}>
                          {message.timestamp.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        {message.sender === 'user' && (
                          <CheckCheck className="h-3 w-3 text-white/70" />
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                  <Paperclip className="h-5 w-5" />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={
                      !hasDoctor
                        ? 'Connect with a doctor...'
                        : isChatStarted
                          ? 'Type your message...'
                          : 'Start a chat...'
                    }
                    className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    disabled={!hasDoctor || !isChatStarted}
                    onKeyDown={(e) => e.key === 'Enter' && isChatStarted && handleSendMessage()}
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full">
                      <ImageIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {newMessage.trim() ? (
                  <button
                    onClick={handleSendMessage}
                    disabled={!hasDoctor || !isChatStarted || !newMessage.trim() || sendingMessage}
                    className="p-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
                  >
                    {sendingMessage ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </button>
                ) : (
                  <button className="p-3 bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200 transition-colors">
                    <Mic className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Call Component */}
      {showVideoCall && (
        <VideoCall
          isOpen={showVideoCall}
          onClose={(duration) => handleEndCall('video', duration)}
          appointment={{
            id: Date.now(),
            patientName: doctor?.name || '',
            patientEmail: doctor?.email || '',
            type: 'video'
          }}
          role="patient"
        />
      )}

      {/* Phone Call Component */}
      {showPhoneCall && (
        <PhoneCall
          isOpen={showPhoneCall}
          onClose={(duration) => handleEndCall('voice', duration)}
          appointment={{
            id: Date.now(),
            patientName: doctor?.name || '',
            patientEmail: doctor?.email || '',
            type: 'phone'
          }}
        />
      )}
    </DashboardLayout>
  )
}
