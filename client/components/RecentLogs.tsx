'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Heart, Moon, Activity, Utensils, TrendingUp } from 'lucide-react'
import { format, isToday, isYesterday, isValid, parseISO } from 'date-fns'
import { useLogs } from '@/contexts/LogContext'

interface LogEntry {
  id: string
  date: string
  mood?: {
    score?: number
    notes?: string
  }
  sleep?: {
    duration?: number
    quality?: number
  }
  activity?: {
    steps?: number
    exerciseCount?: number
  }
  food?: {
    entries?: number
    totalCalories?: number
  }
}

export default function RecentLogs() {
  const { logs, loading } = useLogs()

  const getMoodColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-100'
    if (score >= 6) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getMoodEmoji = (score: number) => {
    if (score >= 8) return '😊'
    if (score >= 6) return '😐'
    return '😔'
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ''

    // Try robust parsing: prefer ISO parsing, then Date fallback
    let date: Date
    try {
      // If string looks like YYYY-MM-DD, parseISO handles it best
      date = parseISO(dateString)
      if (!isValid(date)) {
        date = new Date(dateString)
      }
    } catch {
      date = new Date(dateString)
    }

    if (!isValid(date)) {
      // As a final fallback just return the raw value to avoid crashes
      return dateString
    }

    if (isToday(date)) return 'Today'
    if (isYesterday(date)) return 'Yesterday'
    return format(date, 'MMM d')
  }

  if (loading) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Recent Logs</h3>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Recent Logs</h3>
        <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {logs.map((log, index) => (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="font-medium text-gray-900">{formatDate(log.date)}</span>
              </div>
              {(() => {
                const rawScore = (log as any)?.mood?.score ?? (log as any)?.moodScore ?? (log as any)?.score
                const moodScore = Number(rawScore ?? 0) || 0
                return (
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getMoodColor(moodScore)}`}>
                    {getMoodEmoji(moodScore)} {moodScore}/10
                  </div>
                )
              })()}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <Moon className="h-4 w-4 text-indigo-500" />
                <div>
                  <p className="text-xs text-gray-500">Sleep</p>
                  <p className="text-sm font-medium">{(log.sleep?.duration ?? 0)}h</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-xs text-gray-500">Steps</p>
                  <p className="text-sm font-medium">{(log.activity?.steps ?? 0).toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Utensils className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-xs text-gray-500">Calories</p>
                  <p className="text-sm font-medium">
                    {(() => {
                      const calories = log.food?.totalCalories ?? 0;
                      console.log('RecentLogs - Displaying calories for log:', {
                        id: log.id,
                        food: log.food,
                        totalCalories: calories
                      });
                      return calories;
                    })()}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-xs text-gray-500">Exercise</p>
                  <p className="text-sm font-medium">{log.activity?.exerciseCount ?? 0} activities</p>
                </div>
              </div>
            </div>

            {log.mood?.notes && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-sm text-gray-600 italic">"{log.mood?.notes}"</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {logs.length === 0 && (
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No logs yet</h4>
          <p className="text-gray-500 mb-4">Start tracking your daily activities to see your progress here.</p>
          <button className="btn btn-primary">Log Today's Activities</button>
        </div>
      )}
    </div>
  )
}
