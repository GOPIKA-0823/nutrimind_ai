'use client'

import { useState, useRef, useEffect } from 'react'
import { Video, VideoOff, Mic, MicOff, Phone, Settings, Users, MessageCircle, ScreenShare, ScreenShareOff } from 'lucide-react'

interface VideoCallProps {
  isOpen: boolean
  onClose: (duration?: number) => void
  appointment: {
    id: number
    patientName: string
    patientEmail: string
    type: string
  }
  role?: 'doctor' | 'patient'
}

export default function VideoCall({ isOpen, onClose, appointment, role = 'doctor' }: VideoCallProps) {
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isAudioOn, setIsAudioOn] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [isConnecting, setIsConnecting] = useState(true)
  const [callDuration, setCallDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isPatientConnected, setIsPatientConnected] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [chatMessages, setChatMessages] = useState<Array<{ id: number, sender: string, message: string, timestamp: Date }>>([])
  const [newMessage, setNewMessage] = useState('')

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isOpen) {
      startCall()
    } else {
      endCall()
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isOpen])

  // Start timer when patient/doctor connects
  useEffect(() => {
    if (isPatientConnected) {
      startCallTimer()
    } else {
      // Stop timer if disconnected? Or just pause? Usually stop.
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPatientConnected])

  const startCall = async () => {
    try {
      setIsConnecting(true)

      // Get user media (camera and microphone)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })

      localStreamRef.current = stream

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      // Simulate patient connection after 2 seconds
      setTimeout(() => {
        setIsPatientConnected(true)
        setIsConnecting(false)
        // In a real implementation, you would establish WebRTC connection here
        simulatePatientVideo()
      }, 2000)

    } catch (error) {
      console.error('Error accessing media devices:', error)
      setIsConnecting(false)
    }
  }

  const simulatePatientVideo = () => {
    // Simulate patient video with a placeholder
    if (remoteVideoRef.current) {
      // Create a canvas with patient name
      const canvas = document.createElement('canvas')
      canvas.width = 640
      canvas.height = 480
      const ctx = canvas.getContext('2d')

      if (ctx) {
        // Background
        ctx.fillStyle = '#f3f4f6'
        ctx.fillRect(0, 0, 640, 480)

        // Patient name
        ctx.fillStyle = '#374151'
        ctx.font = '24px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(appointment.patientName, 320, 240)

        // Status
        ctx.fillStyle = '#10b981'
        ctx.font = '16px Arial'
        ctx.fillText('Connected', 320, 280)
      }

      const stream = canvas.captureStream(30)
      remoteVideoRef.current.srcObject = stream
    }
  }

  const startCallTimer = () => {
    intervalRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1)
    }, 1000)
  }

  const endCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop())
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    setIsPatientConnected(false)
    const finalDuration = callDuration
    setCallDuration(0)
    onClose(finalDuration)
  }

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoOn(videoTrack.enabled)
      }
    }
  }

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsAudioOn(audioTrack.enabled)
      }
    }
  }

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        })

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream
        }

        setIsScreenSharing(true)
      } else {
        if (localStreamRef.current && localVideoRef.current) {
          localVideoRef.current.srcObject = localStreamRef.current
        }
        setIsScreenSharing(false)
      }
    } catch (error) {
      console.error('Error sharing screen:', error)
    }
  }

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now(),
        sender: 'Doctor',
        message: newMessage.trim(),
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, message])
      setNewMessage('')
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
            <Video className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Video Call with {appointment.patientName}</h2>
            <p className="text-sm text-gray-300">
              {isConnecting
                ? 'Connecting...'
                : isPatientConnected
                  ? 'Connected'
                  : role === 'patient' ? 'Waiting for doctor...' : 'Waiting for patient...'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-sm">
            Duration: {formatDuration(callDuration)}
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-gray-700 rounded-lg"
          >
            <Settings className="h-5 w-5" />
          </button>
          <button
            onClick={() => setShowChat(!showChat)}
            className="p-2 hover:bg-gray-700 rounded-lg"
          >
            <MessageCircle className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Video Area */}
      <div className="flex-1 relative bg-gray-800">
        {/* Remote Video (Patient) */}
        <div className="absolute inset-0">
          {isConnecting ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-white text-lg">
                  Connecting to {role === 'patient' ? 'Doctor' : appointment.patientName}...
                </p>
              </div>
            </div>
          ) : (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Local Video (Doctor) */}
        <div className="absolute top-4 right-4 w-64 h-48 bg-gray-900 rounded-lg overflow-hidden">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        </div>

        {/* Connection Status */}
        {!isPatientConnected && !isConnecting && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-90">
            <div className="text-center text-white">
              <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">
                {role === 'patient' ? 'Waiting for Doctor' : 'Waiting for Patient'}
              </h3>
              <p className="text-gray-300">
                {role === 'patient'
                  ? 'The doctor will join shortly...'
                  : 'The patient will join shortly...'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-900 p-6">
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={toggleAudio}
            className={`p-3 rounded-full ${isAudioOn ? 'bg-gray-700 text-white' : 'bg-red-600 text-white'
              } hover:opacity-80`}
          >
            {isAudioOn ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
          </button>

          <button
            onClick={toggleVideo}
            className={`p-3 rounded-full ${isVideoOn ? 'bg-gray-700 text-white' : 'bg-red-600 text-white'
              } hover:opacity-80`}
          >
            {isVideoOn ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
          </button>

          <button
            onClick={toggleScreenShare}
            className={`p-3 rounded-full ${isScreenSharing ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white'
              } hover:opacity-80`}
          >
            {isScreenSharing ? <ScreenShareOff className="h-6 w-6" /> : <ScreenShare className="h-6 w-6" />}
          </button>

          <button
            onClick={endCall}
            className="p-3 rounded-full bg-red-600 text-white hover:bg-red-700"
          >
            <Phone className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Chat Sidebar */}
      {showChat && (
        <div className="absolute right-0 top-0 h-full w-80 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Chat</h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'Doctor' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs px-3 py-2 rounded-lg ${msg.sender === 'Doctor'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-900'
                  }`}>
                  <p className="text-sm">{msg.message}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {msg.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                onClick={sendMessage}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Sidebar */}
      {showSettings && (
        <div className="absolute right-0 top-0 h-full w-80 bg-white border-l border-gray-200 p-4">
          <h3 className="text-lg font-semibold mb-4">Call Settings</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Camera</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option>Default Camera</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Microphone</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option>Default Microphone</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Speaker</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option>Default Speaker</option>
              </select>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2">Call Quality</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Video Quality</span>
                  <span className="text-green-600">HD</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Audio Quality</span>
                  <span className="text-green-600">High</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Connection</span>
                  <span className="text-green-600">Stable</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
