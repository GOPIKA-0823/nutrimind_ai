'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageSquare, Send, Brain, Mic, MicOff } from 'lucide-react'
import { aiAPI } from '@/lib/api'
import { motion } from 'framer-motion'

interface ChatMessage {
    role: 'user' | 'ai'
    message: string
}

// Web Speech API types
declare global {
    interface Window {
        SpeechRecognition?: any
        webkitSpeechRecognition?: any
    }
}

declare const SpeechRecognition: any

export default function AIAssistant() {
    const [chatInput, setChatInput] = useState('')
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
    const [isSending, setIsSending] = useState(false)
    const [isListening, setIsListening] = useState(false)
    const [speechSupported, setSpeechSupported] = useState(false)
    const recognitionRef = useRef<any>(null)
    const transcriptRef = useRef('')
    const listRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight
        }
    }, [chatHistory])

    // Check speech recognition support
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        setSpeechSupported(!!SpeechRecognition)
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort()
            }
        }
    }, [])

    const sendMessage = async (text: string) => {
        if (!text.trim()) return
        setIsSending(true)
        setChatHistory(prev => [...prev, { role: 'user', message: text }])
        setChatInput('')

        try {
            const apiResp = await aiAPI.chat(text, {})
            setChatHistory(prev => [...prev, { role: 'ai', message: apiResp.text }])
        } catch (e: any) {
            const errMsg = e?.response?.data?.response?.text || "I'm having trouble connecting right now. Please try again later."
            setChatHistory(prev => [...prev, { role: 'ai', message: errMsg }])
        } finally {
            setIsSending(false)
        }
    }

    const handleTapToSpeak = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        if (!SpeechRecognition) {
            alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.')
            return
        }
        if (isListening) {
            recognitionRef.current?.stop()
            setIsListening(false)
            return
        }
        transcriptRef.current = ''
        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = 'en-US'
        recognitionRef.current = recognition
        recognition.onresult = (event: any) => {
            let interimTranscript = ''
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript
                if (event.results[i].isFinal) {
                    transcriptRef.current += transcript
                } else {
                    interimTranscript += transcript
                }
            }
            setChatInput(transcriptRef.current + interimTranscript)
        }
        recognition.onend = () => {
            setIsListening(false)
            recognitionRef.current = null
            // Auto-send when speech ends: speech → text as prompt → medical output
            const text = transcriptRef.current?.trim()
            if (text) {
                sendMessage(text)
            }
        }
        recognition.onerror = (event: any) => {
            if (event.error !== 'aborted') {
                setIsListening(false)
                recognitionRef.current = null
            }
        }
        recognition.start()
        setIsListening(true)
    }

    const handleSend = () => {
        const trimmed = chatInput.trim()
        if (!trimmed) return
        sendMessage(trimmed)
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-white">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-primary-100">
                            <Brain className="h-6 w-6 text-primary-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Medical Assistant</h3>
                    </div>
                    <MessageSquare className="h-6 w-6 text-gray-400" />
                </div>

                <div className="p-6 bg-gray-50/50">
                    <div
                        ref={listRef}
                        className="bg-white border border-gray-200 rounded-xl p-6 h-[400px] overflow-y-auto shadow-inner"
                    >
                        {chatHistory.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                                <div className="p-4 bg-primary-50 rounded-full">
                                    <Brain className="h-12 w-12 text-primary-600 opacity-20" />
                                </div>
                                <p className="text-gray-500 max-w-sm">
                                    Describe your symptoms for a medical assessment. Type or tap the microphone to speak.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {chatHistory.map((m, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`px-4 py-3 rounded-2xl text-sm max-w-[80%] shadow-sm whitespace-pre-line ${m.role === 'user'
                                                    ? 'bg-primary-600 text-white rounded-br-none'
                                                    : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none'
                                                }`}
                                        >
                                            {m.message}
                                        </div>
                                    </motion.div>
                                ))}
                                {isSending && (
                                    <div className="flex justify-start">
                                        <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm space-x-1 flex">
                                            <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-75"></div>
                                            <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-150"></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Tap to Speak - Large button for elderly users */}
                    {speechSupported && (
                        <div className="mt-4 flex flex-col items-center">
                            <button
                                type="button"
                                onClick={handleTapToSpeak}
                                disabled={isSending}
                                className={`flex flex-col items-center justify-center w-20 h-20 rounded-full transition-all shadow-lg active:scale-95 disabled:opacity-50 ${
                                    isListening
                                        ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                                        : 'bg-primary-600 hover:bg-primary-700 text-white'
                                }`}
                                title={isListening ? 'Tap to stop listening' : 'Tap to speak your symptoms'}
                                aria-label={isListening ? 'Stop listening' : 'Tap to speak'}
                            >
                                {isListening ? (
                                    <MicOff className="h-10 w-10" />
                                ) : (
                                    <Mic className="h-10 w-10" />
                                )}
                            </button>
                            <span className="mt-2 text-sm font-medium text-gray-600">
                                {isListening ? 'Listening... Tap again to stop' : 'Tap to Speak'}
                            </span>
                            <p className="mt-1 text-xs text-gray-500 max-w-xs text-center">
                                Describe how you feel (e.g. &quot;I have headache and chest pain&quot;)
                            </p>
                        </div>
                    )}

                    <div className="mt-6 flex items-center space-x-3">
                        <div className="flex-1 relative">
                            <input
                                value={chatInput}
                                onChange={e => setChatInput(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault()
                                        handleSend()
                                    }
                                }}
                                placeholder="Type or speak your symptoms..."
                                className="w-full bg-white border border-gray-200 rounded-xl px-5 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm"
                            />
                        </div>
                        <button
                            onClick={handleSend}
                            disabled={isSending || !chatInput.trim()}
                            className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 transition-all shadow-md active:scale-95"
                        >
                            <Send className="h-5 w-5" />
                            <span>{isSending ? 'Sending...' : 'Send'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
