'use client'

import { useState, useEffect } from 'react'
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, Clock, User } from 'lucide-react'

interface PhoneCallProps {
  isOpen: boolean
  onClose: (duration?: number) => void
  appointment: {
    id: number
    patientName: string
    patientEmail: string
    type: string
  }
}

export default function PhoneCall({ isOpen, onClose, appointment }: PhoneCallProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isSpeakerOn, setIsSpeakerOn] = useState(true)
  const [callDuration, setCallDuration] = useState(0)
  const [isConnecting, setIsConnecting] = useState(true)

  useEffect(() => {
    if (isOpen) {
      startCall()
    } else {
      endCall()
    }
  }, [isOpen])

  // Start timer when connected
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isConnected) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1)
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isConnected])

  const startCall = () => {
    setIsConnecting(true)

    // Simulate call connection
    setTimeout(() => {
      setIsConnecting(false)
      setIsConnected(true)
    }, 2000)
  }



  const endCall = () => {
    setIsConnected(false)
    const finalDuration = callDuration
    setCallDuration(0)
    onClose(finalDuration)
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md text-center">
        {/* Patient Info */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-12 w-12 text-primary-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">{appointment.patientName}</h2>
        </div>

        {/* Call Status */}
        <div className="mb-8">
          {isConnecting ? (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-lg text-gray-600">Connecting...</p>
            </div>
          ) : isConnected ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2 text-green-600">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-lg font-medium">Connected</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-gray-600">
                <Clock className="h-5 w-5" />
                <span className="text-lg">{formatDuration(callDuration)}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <PhoneOff className="h-6 w-6 text-red-600" />
              </div>
              <p className="text-lg text-gray-600">Call Ended</p>
            </div>
          )}
        </div>

        {/* Call Controls */}
        <div className="flex items-center justify-center space-x-6">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-4 rounded-full ${isMuted ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
              } hover:opacity-80`}
          >
            {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </button>

          <button
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            className={`p-4 rounded-full ${isSpeakerOn ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
              } hover:opacity-80`}
          >
            {isSpeakerOn ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
          </button>

          <button
            onClick={endCall}
            className="p-4 rounded-full bg-red-600 text-white hover:bg-red-700"
          >
            <PhoneOff className="h-6 w-6" />
          </button>
        </div>

        {/* Call Info */}
        <div className="mt-8 text-sm text-gray-500">
          <p>Phone Call - {appointment.type}</p>
          <p className="mt-1">
            {isConnected ? 'Call in progress...' : 'Preparing call...'}
          </p>
        </div>
      </div>
    </div>
  )
}
