'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Heart,
  Moon,
  Utensils,
  Target,
  Award,
  Calendar as CalendarIcon
} from 'lucide-react'
import { useLogs } from '@/contexts/LogContext'

export default function StatsOverview() {
  const { logs, stats: contextStats, loading } = useLogs()
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Initialize dates to last 7 days on mount
  useEffect(() => {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - 7)

    setEndDate(end.toISOString().split('T')[0])
    setStartDate(start.toISOString().split('T')[0])
  }, [])

  // Calculate stats based on date range
  const displayStats = useMemo(() => {
    if (!startDate || !endDate || logs.length === 0) {
      return contextStats
    }

    if (!startDate || !endDate || logs.length === 0) {
      return contextStats
    }

    // Safely parse local dates from YYYY-MM-DD string
    const parseLocalDate = (dateStr: string, isEnd: boolean = false) => {
      const [y, m, d] = dateStr.split('-').map(Number)
      if (isEnd) return new Date(y, m - 1, d, 23, 59, 59, 999)
      return new Date(y, m - 1, d, 0, 0, 0, 0)
    }

    const start = parseLocalDate(startDate)
    const end = parseLocalDate(endDate, true)

    const filteredLogs = logs.filter(log => {
      const logDate = new Date(log.date)
      return logDate >= start && logDate <= end
    })

    if (filteredLogs.length === 0) {
      return {
        ...contextStats,
        mood: { current: 0, trend: 'stable', change: 0 },
        sleep: { current: 0, trend: 'stable', change: 0 },
        activity: { current: 0, trend: 'stable', change: 0 },
        nutrition: { current: 0, trend: 'stable', change: 0 },
        weeklyPoints: 0
      }
    }

    // Helper for summation
    const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0)
    const avg = (arr: number[]) => arr.length ? sum(arr) / arr.length : 0

    // Calculate Averages/Totals
    const moods = filteredLogs.map(l => Number(l.mood?.score || 0))
    const sleeps = filteredLogs.map(l => Number(l.sleep?.duration || 0))
    const steps = filteredLogs.map(l => Number(l.activity?.steps || 0))
    const calories = filteredLogs.map(l => Number(l.food?.totalCalories || 0))

    // Calculate Range Points
    const rangePoints = filteredLogs.reduce((total, log) => {
      const moodPts = (log.mood?.score || 0) * 2
      const sleepPts = (log.sleep?.quality || 0) * 2
      const activityPts = Math.floor((log.activity?.steps || 0) / 500)
      return total + moodPts + sleepPts + activityPts
    }, 0)

    return {
      mood: {
        current: avg(moods),
        trend: 'stable',
        change: 0
      },
      sleep: {
        current: avg(sleeps),
        trend: 'stable',
        change: 0
      },
      activity: {
        current: avg(steps), // Average daily steps
        trend: 'stable',
        change: 0
      },
      nutrition: {
        current: avg(calories), // Average daily calories
        trend: 'stable',
        change: 0
      },
      streak: contextStats?.streak || 0,
      points: contextStats?.points || 0,
      weeklyPoints: rangePoints, // Hijacking this field for "Range Points"
      level: contextStats?.level || 1
    }
  }, [startDate, endDate, logs, contextStats])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    )
  }

  if (!displayStats) return null

  const statCards = [
    {
      title: 'Avg Mood',
      value: displayStats.mood.current.toFixed(1),
      unit: '/10',
      trend: displayStats.mood.trend,
      change: displayStats.mood.change,
      icon: Heart,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100'
    },
    {
      title: 'Avg Sleep',
      value: displayStats.sleep.current.toFixed(1),
      unit: 'hrs',
      trend: displayStats.sleep.trend,
      change: displayStats.sleep.change,
      icon: Moon,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    },
    {
      title: 'Avg Daily Steps',
      value: Math.round(displayStats.activity.current).toLocaleString(),
      unit: '',
      trend: displayStats.activity.trend,
      change: displayStats.activity.change,
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Avg Calories',
      value: Math.round(displayStats.nutrition.current),
      unit: 'cal',
      trend: displayStats.nutrition.trend,
      change: displayStats.nutrition.change,
      icon: Utensils,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Date Filter & Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary-50 rounded-lg">
            <CalendarIcon className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Dashboard Overview</h3>
            <p className="text-xs text-gray-500">Stats for selected range</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="input py-1.5 text-sm w-full sm:w-auto"
          />
          <span className="text-gray-400">-</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="input py-1.5 text-sm w-full sm:w-auto"
          />
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          const isPositive = stat.trend === 'up' || (stat.trend === 'stable' && stat.change >= 0)

          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="card hover:shadow-soft transition-shadow duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <p className="ml-1 text-sm text-gray-500">{stat.unit}</p>
                  </div>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>

              <div className="mt-4 flex items-center">
                {/* Hiding trend for range view as it's complex to calculate vs previous range dynamically without more logic */}
                <span className="text-xs text-gray-400">
                  Average over selected period
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Gamification Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <Target className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Current Streak</p>
              <p className="text-2xl font-bold text-gray-900">{displayStats.streak}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <Award className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Wellness Points</p>
              <p className="text-2xl font-bold text-gray-900">{(displayStats.points || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="card border-2 border-primary-100 bg-primary-50/30">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-primary-100">
              <TrendingUp className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-bold text-primary-800">Range Points</p>
              <p className="text-2xl font-bold text-primary-900">{displayStats.weeklyPoints.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
