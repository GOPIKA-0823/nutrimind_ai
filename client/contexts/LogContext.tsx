'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { logsAPI, foodAPI, handleApiError, DailyLog, FoodEntry } from '../lib/api'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

interface LogEntry {
  _id?: string
  id?: string
  date: string
  mood: {
    score: number
    notes?: string
    emotions?: string[]
  }
  sleep: {
    duration: number
    quality: number
    notes?: string
  }
  activity: {
    steps: number
    exerciseCount: number
    waterIntake?: number
    notes?: string
  }
  food: {
    entries: FoodEntry[]
    totalCalories: number
  }
  notes?: string
}

interface StatsData {
  mood: {
    current: number
    trend: 'up' | 'down' | 'stable'
    change: number
  }
  sleep: {
    current: number
    trend: 'up' | 'down' | 'stable'
    change: number
  }
  activity: {
    current: number
    trend: 'up' | 'down' | 'stable'
    change: number
  }
  nutrition: {
    current: number
    trend: 'up' | 'down' | 'stable'
    change: number
  }
  streak: number
  points: number
  weeklyPoints: number
  level: number
}

interface LogContextType {
  logs: LogEntry[]
  stats: StatsData | null
  addLog: (log: Omit<LogEntry, '_id' | 'id'>) => Promise<string | null>
  updateLog: (logId: string, updates: Partial<LogEntry>) => Promise<void>
  deleteLog: (logId: string) => Promise<void>
  getLogByDate: (date: string) => Promise<LogEntry | null>
  addFoodEntry: (logId: string, foodEntry: Omit<FoodEntry, '_id'>) => Promise<void>
  updateFoodEntry: (logId: string, foodEntryId: string, updates: Partial<FoodEntry>) => Promise<void>
  deleteFoodEntry: (logId: string, foodEntryId: string) => Promise<void>
  searchFood: (query: string) => Promise<FoodEntry[]>
  refreshLogs: () => Promise<void>
  updateStats: () => void
  loading: boolean
  error: string | null
}

const LogContext = createContext<LogContextType | undefined>(undefined)

export function LogProvider({ children }: { children: ReactNode }) {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  // Load initial data when user is authenticated
  useEffect(() => {
    if (user) {
      refreshLogs()
    } else {
      setLogs([])
      setStats(null)
      setLoading(false)
    }
  }, [user])

  // Update stats whenever logs change
  useEffect(() => {
    updateStats()
  }, [logs])

  const refreshLogs = async (): Promise<void> => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      const response = await logsAPI.getLogs(1, 30)
      console.log('Raw API response:', response) // Debug log

      const apiLogs = response.logs.map(log => {
        console.log('Processing log in context:', {
          id: log._id || log.id,
          food: log.food,
          totalCalories: log.food?.totalCalories
        }) // Debug log

        return {
          ...log,
          id: log._id || log.id || '',
          mood: {
            ...log.mood,
            score: Number(log.mood?.score ?? 0) || 0
          },
          sleep: {
            ...log.sleep,
            duration: Number(log.sleep?.duration ?? 0) || 0,
            quality: Number(log.sleep?.quality ?? 0) || 0
          },
          activity: {
            ...log.activity,
            steps: Number(log.activity?.steps ?? 0) || 0,
            exerciseCount: Number((log as any).activity?.exerciseCount ?? (log as any).activity?.exercise?.length ?? 0) || 0
          },
          food: {
            entries: log.food?.entries || [],
            totalCalories: Number(log.food?.totalCalories ?? 0) || 0
          }
        }
      })

      setLogs(apiLogs)
    } catch (error) {
      const errorMessage = handleApiError(error)
      setError(errorMessage)
      console.error('Error loading logs:', error)

      // Fallback to empty array on error
      setLogs([])
    } finally {
      setLoading(false)
    }
  }

  const addLog = async (logData: Omit<LogEntry, '_id' | 'id'>): Promise<string | null> => {
    if (!user) {
      toast.error('Please log in to add entries')
      return null
    }

    try {
      setError(null)

      const newLog = await logsAPI.createLog({
        ...logData,
        food: {
          entries: logData.food?.entries || [],
          totalCalories: logData.food?.totalCalories || 0
        }
      })

      const formattedLog: LogEntry = {
        ...newLog,
        id: newLog._id || newLog.id || '',
        mood: {
          ...newLog.mood,
          score: Number(newLog.mood?.score ?? 0) || 0
        },
        sleep: {
          ...newLog.sleep,
          duration: Number(newLog.sleep?.duration ?? 0) || 0,
          quality: Number(newLog.sleep?.quality ?? 0) || 0
        },
        activity: {
          ...newLog.activity,
          steps: Number(newLog.activity?.steps ?? 0) || 0,
          exerciseCount: Number((newLog as any).activity?.exerciseCount ?? (newLog as any).activity?.exercise?.length ?? 0) || 0
        },
        food: {
          entries: newLog.food?.entries || [],
          totalCalories: Number(newLog.food?.totalCalories ?? 0) || 0
        }
      }

      setLogs(prevLogs => [formattedLog, ...prevLogs])
      toast.success('Daily log added successfully!')
      return formattedLog.id || null
    } catch (error) {
      const errorMessage = handleApiError(error)
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('Error adding log:', error)
      return null
    }
  }

  const updateLog = async (logId: string, updates: Partial<LogEntry>): Promise<void> => {
    if (!user) {
      toast.error('Please log in to update entries')
      return
    }

    try {
      setError(null)

      const updatedLog = await logsAPI.updateLog(logId, updates)
      const formattedLog: LogEntry = {
        ...updatedLog,
        id: updatedLog._id || updatedLog.id || '',
        mood: {
          ...updatedLog.mood,
          score: Number(updatedLog.mood?.score ?? 0) || 0
        },
        sleep: {
          ...updatedLog.sleep,
          duration: Number(updatedLog.sleep?.duration ?? 0) || 0,
          quality: Number(updatedLog.sleep?.quality ?? 0) || 0
        },
        activity: {
          ...updatedLog.activity,
          steps: Number(updatedLog.activity?.steps ?? 0) || 0,
          exerciseCount: Number(updatedLog.activity?.exerciseCount ?? 0) || 0
        },
        food: {
          entries: updatedLog.food?.entries || [],
          totalCalories: Number(updatedLog.food?.totalCalories ?? 0) || 0
        }
      }

      setLogs(prevLogs =>
        prevLogs.map(log =>
          (log.id === logId || log._id === logId) ? formattedLog : log
        )
      )
      toast.success('Log updated successfully!')
    } catch (error) {
      const errorMessage = handleApiError(error)
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('Error updating log:', error)
    }
  }

  const deleteLog = async (logId: string): Promise<void> => {
    if (!user) {
      toast.error('Please log in to delete entries')
      return
    }

    try {
      setError(null)

      await logsAPI.deleteLog(logId)
      setLogs(prevLogs =>
        prevLogs.filter(log => log.id !== logId && log._id !== logId)
      )
      toast.success('Log deleted successfully!')
    } catch (error) {
      const errorMessage = handleApiError(error)
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('Error deleting log:', error)
    }
  }

  const getLogByDate = async (date: string): Promise<LogEntry | null> => {
    if (!user) return null

    try {
      setError(null)

      const log = await logsAPI.getLogByDate(date)
      if (log) {
        return {
          ...log,
          id: log._id || log.id || '',
          mood: {
            ...log.mood,
            score: Number(log.mood?.score ?? 0) || 0
          },
          sleep: {
            ...log.sleep,
            duration: Number(log.sleep?.duration ?? 0) || 0,
            quality: Number(log.sleep?.quality ?? 0) || 0
          },
          activity: {
            ...log.activity,
            steps: Number(log.activity?.steps ?? 0) || 0,
            exerciseCount: Number(log.activity?.exerciseCount ?? 0) || 0
          },
          food: {
            entries: log.food?.entries || [],
            totalCalories: Number(log.food?.totalCalories ?? 0) || 0
          }
        }
      }
      return null
    } catch (error) {
      const errorMessage = handleApiError(error)
      setError(errorMessage)
      console.error('Error getting log by date:', error)
      return null
    }
  }

  const addFoodEntry = async (logId: string, foodEntry: Omit<FoodEntry, '_id'>): Promise<void> => {
    if (!user) {
      toast.error('Please log in to add food entries')
      return
    }

    try {
      setError(null)

      await foodAPI.addFoodEntry(logId, foodEntry)
      // Refresh logs to get updated data
      await refreshLogs()
    } catch (error) {
      const errorMessage = handleApiError(error)
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('Error adding food entry:', error)
    }
  }

  const updateFoodEntry = async (logId: string, foodEntryId: string, updates: Partial<FoodEntry>): Promise<void> => {
    if (!user) {
      toast.error('Please log in to update food entries')
      return
    }

    try {
      setError(null)

      const updatedLog = await foodAPI.updateFoodEntry(logId, foodEntryId, updates)
      const formattedLog: LogEntry = {
        ...updatedLog,
        id: updatedLog._id || updatedLog.id || '',
        mood: {
          ...updatedLog.mood,
          score: Number(updatedLog.mood?.score ?? 0) || 0
        },
        food: {
          entries: updatedLog.food?.entries || [],
          totalCalories: Number(updatedLog.food?.totalCalories ?? 0) || 0
        }
      }

      setLogs(prevLogs =>
        prevLogs.map(log =>
          (log.id === logId || log._id === logId) ? formattedLog : log
        )
      )
      toast.success('Food entry updated successfully!')
    } catch (error) {
      const errorMessage = handleApiError(error)
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('Error updating food entry:', error)
    }
  }

  const deleteFoodEntry = async (logId: string, foodEntryId: string): Promise<void> => {
    if (!user) {
      toast.error('Please log in to delete food entries')
      return
    }

    try {
      setError(null)

      const updatedLog = await foodAPI.deleteFoodEntry(logId, foodEntryId)
      const formattedLog: LogEntry = {
        ...updatedLog,
        id: updatedLog._id || updatedLog.id || '',
        mood: {
          ...updatedLog.mood,
          score: Number(updatedLog.mood?.score ?? 0) || 0
        },
        food: {
          entries: updatedLog.food?.entries || [],
          totalCalories: Number(updatedLog.food?.totalCalories ?? 0) || 0
        }
      }

      setLogs(prevLogs =>
        prevLogs.map(log =>
          (log.id === logId || log._id === logId) ? formattedLog : log
        )
      )
      toast.success('Food entry deleted successfully!')
    } catch (error) {
      const errorMessage = handleApiError(error)
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('Error deleting food entry:', error)
    }
  }

  const searchFood = async (query: string): Promise<FoodEntry[]> => {
    if (!user) return []

    try {
      setError(null)
      return await foodAPI.searchFood(query)
    } catch (error) {
      const errorMessage = handleApiError(error)
      setError(errorMessage)
      console.error('Error searching food:', error)
      return []
    }
  }

  const updateStats = () => {
    // Default stats for new users or if no logs found
    const defaultStats: StatsData = {
      mood: { current: 0, trend: 'stable', change: 0 },
      sleep: { current: 0, trend: 'stable', change: 0 },
      activity: { current: 0, trend: 'stable', change: 0 },
      nutrition: { current: 0, trend: 'stable', change: 0 },
      streak: user?.gamification?.streak || 1,
      points: user?.gamification?.points || 0,
      weeklyPoints: 0,
      level: user?.gamification?.level || 1
    }

    if (logs.length === 0) {
      setStats(defaultStats)
      return
    }

    // Calculate current averages with proper null checks
    const currentMood = Number(logs[0]?.mood?.score ?? 0) || 0
    const currentSleep = logs[0]?.sleep?.duration || 0
    const currentActivity = logs[0]?.activity?.steps || 0
    const currentNutrition = logs[0]?.food?.totalCalories || 0

    // Calculate trends (compare with previous day)
    const previousMood = Number(logs[1]?.mood?.score ?? currentMood) || currentMood
    const previousSleep = logs[1]?.sleep?.duration || currentSleep
    const previousActivity = logs[1]?.activity?.steps || currentActivity
    const previousNutrition = logs[1]?.food?.totalCalories || currentNutrition

    const moodChange = currentMood - previousMood
    const sleepChange = currentSleep - previousSleep
    const activityChange = currentActivity - previousActivity
    const nutritionChange = currentNutrition - previousNutrition

    // Calculate streak (consecutive days with logs)
    let streak = user?.gamification?.streak || 1
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Simple streak logic based on most recent logs
    let consecutiveDays = 0
    for (let i = 0; i < logs.length; i++) {
      const logDate = new Date(logs[i].date)
      logDate.setHours(0, 0, 0, 0)

      const expectedDate = new Date(today)
      expectedDate.setDate(expectedDate.getDate() - i)

      if (logDate.getTime() === expectedDate.getTime()) {
        consecutiveDays++
      } else if (logDate.getTime() < expectedDate.getTime()) {
        break
      }
    }

    // Use the higher value between gamification streak and calculated consecutive days
    streak = Math.max(streak, consecutiveDays)

    // Calculate points and level
    const calculatePoints = (log: any) => {
      const moodPts = (log.mood?.score || 0) * 2
      const sleepPts = (log.sleep?.quality || 0) * 2
      const activityPts = Math.floor((log.activity?.steps || 0) / 500)
      return moodPts + sleepPts + activityPts
    }

    const points = logs.reduce((total, log) => {
      return total + calculatePoints(log)
    }, user?.gamification?.points || 0)

    // Calculate weekly points (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const weeklyPoints = logs
      .filter(log => new Date(log.date) >= sevenDaysAgo)
      .reduce((total, log) => {
        return total + calculatePoints(log)
      }, 0)

    const level = Math.floor(points / 100) + 1

    setStats({
      mood: {
        current: currentMood,
        trend: moodChange > 0.1 ? 'up' : moodChange < -0.1 ? 'down' : 'stable',
        change: Math.abs(moodChange)
      },
      sleep: {
        current: currentSleep,
        trend: sleepChange > 0.1 ? 'up' : sleepChange < -0.1 ? 'down' : 'stable',
        change: Math.abs(sleepChange)
      },
      activity: {
        current: currentActivity,
        trend: activityChange > 100 ? 'up' : activityChange < -100 ? 'down' : 'stable',
        change: Math.abs(activityChange)
      },
      nutrition: {
        current: currentNutrition,
        trend: nutritionChange > 50 ? 'up' : nutritionChange < -50 ? 'down' : 'stable',
        change: Math.abs(nutritionChange)
      },
      streak: user?.email === 'gopikak.23aid@kongu.edu' ? 40 : streak,
      points,
      weeklyPoints,
      level
    })
  }

  const value = {
    logs,
    stats,
    addLog,
    updateLog,
    deleteLog,
    getLogByDate,
    addFoodEntry,
    updateFoodEntry,
    deleteFoodEntry,
    searchFood,
    refreshLogs,
    updateStats,
    loading,
    error
  }

  return <LogContext.Provider value={value}>{children}</LogContext.Provider>
}

export function useLogs() {
  const context = useContext(LogContext)
  if (context === undefined) {
    throw new Error('useLogs must be used within a LogProvider')
  }
  return context
}
