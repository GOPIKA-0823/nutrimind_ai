'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Target, Plus, Edit2, Trash2, CheckCircle, Circle, Calendar, TrendingUp, Bell, BellOff, Clock } from 'lucide-react'

interface Goal {
  id: string
  text: string
  createdAt: Date
  completed: boolean
  completedAt?: Date
  reminder?: {
    enabled: boolean
    time: string // HH:MM (24h)
    lastRemindedOn?: string // YYYY-MM-DD to avoid duplicate reminds per day
  }
}

export default function GoalsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [goals, setGoals] = useState<Goal[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [newGoal, setNewGoal] = useState('')
  const [showReminderModal, setShowReminderModal] = useState(false)
  const [reminderTime, setReminderTime] = useState<string>('09:00')
  const [reminderTargetGoal, setReminderTargetGoal] = useState<Goal | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  // Load goals from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedGoals = localStorage.getItem('wellness-goals')
      if (savedGoals) {
        try {
          const parsed: any[] = JSON.parse(savedGoals)
          const revived: Goal[] = parsed.map((g) => ({
            ...g,
            createdAt: new Date(g.createdAt),
            completedAt: g.completedAt ? new Date(g.completedAt) : undefined,
          }))
          setGoals(revived)
        } catch (e) {
          console.error('Failed to parse saved goals', e)
        }
      }
    }
  }, [])

  // Save goals to localStorage whenever goals change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('wellness-goals', JSON.stringify(goals))
    }
  }, [goals])

  // Reminders checker (runs every 30s)
  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = new Date()
      const hh = String(now.getHours()).padStart(2, '0')
      const mm = String(now.getMinutes()).padStart(2, '0')
      const today = now.toISOString().split('T')[0]

      setGoals((prev) =>
        prev.map((goal) => {
          if (!goal.completed && goal.reminder?.enabled && goal.reminder.time === `${hh}:${mm}`) {
            if (goal.reminder.lastRemindedOn !== today) {
              try {
                if ('Notification' in window) {
                  if (Notification.permission === 'granted') {
                    new Notification('Goal Reminder', { body: goal.text })
                  } else if (Notification.permission !== 'denied') {
                    Notification.requestPermission()
                  }
                }
              } catch {}
              // Fallback alert
              // eslint-disable-next-line no-alert
              alert(`Reminder: ${goal.text}`)
              return {
                ...goal,
                reminder: { ...goal.reminder, enabled: goal.reminder.enabled, time: goal.reminder.time, lastRemindedOn: today }
              }
            }
          }
          return goal
        })
      )
    }, 30000)

    return () => clearInterval(intervalId)
  }, [])

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return null
  }

  const handleAddGoal = () => {
    if (newGoal.trim()) {
      const goal: Goal = {
        id: Date.now().toString(),
        text: newGoal.trim(),
        createdAt: new Date(),
        completed: false
      }
      setGoals(prev => [...prev, goal])
      setNewGoal('')
      setShowAddModal(false)
    }
  }

  const handleEditGoal = () => {
    if (editingGoal && newGoal.trim()) {
      setGoals(prev => prev.map(goal => 
        goal.id === editingGoal.id 
          ? { ...goal, text: newGoal.trim() }
          : goal
      ))
      setNewGoal('')
      setEditingGoal(null)
      setShowEditModal(false)
    }
  }

  const handleToggleComplete = (goalId: string) => {
    setGoals(prev => prev.map(goal => 
      goal.id === goalId 
        ? { 
            ...goal, 
            completed: !goal.completed,
            completedAt: !goal.completed ? new Date() : undefined
          }
        : goal
    ))
  }

  const handleDeleteGoal = (goalId: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== goalId))
  }

  const handleEditClick = (goal: Goal) => {
    setEditingGoal(goal)
    setNewGoal(goal.text)
    setShowEditModal(true)
  }

  const openReminderModal = (goal: Goal) => {
    setReminderTargetGoal(goal)
    setReminderTime(goal.reminder?.time || '09:00')
    setShowReminderModal(true)
  }

  const saveReminder = () => {
    if (!reminderTargetGoal) return
    setGoals((prev) =>
      prev.map((g) =>
        g.id === reminderTargetGoal.id
          ? { ...g, reminder: { enabled: true, time: reminderTime, lastRemindedOn: g.reminder?.lastRemindedOn } }
          : g
      )
    )
    setShowReminderModal(false)
    setReminderTargetGoal(null)
  }

  const toggleReminderEnabled = (goal: Goal) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === goal.id
          ? { ...g, reminder: { enabled: !g.reminder?.enabled, time: g.reminder?.time || '09:00', lastRemindedOn: g.reminder?.lastRemindedOn } }
          : g
      )
    )
  }

  const completedGoals = goals.filter(goal => goal.completed)
  const activeGoals = goals.filter(goal => !goal.completed)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-800 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2 flex items-center">
                <Target className="h-8 w-8 mr-3" />
                Wellness Goals
              </h1>
              <p className="text-amber-100">
                Set and track your personal wellness objectives.
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200"
            >
              <Plus className="h-5 w-5" />
              <span>Add Goal</span>
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Goals</p>
                <p className="text-2xl font-bold text-gray-900">{goals.length}</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{completedGoals.length}</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-amber-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-amber-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {goals.length > 0 ? Math.round((completedGoals.length / goals.length) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Active Goals */}
        {activeGoals.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Circle className="h-5 w-5 mr-2 text-amber-600" />
              Active Goals ({activeGoals.length})
            </h3>
            <div className="space-y-3">
              {activeGoals.map((goal) => (
                <div key={goal.id} className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleToggleComplete(goal.id)}
                      className="p-1 hover:bg-amber-200 rounded-full transition-colors"
                    >
                      <Circle className="h-5 w-5 text-amber-600" />
                    </button>
                    <div>
                      <p className="text-gray-900 font-medium">{goal.text}</p>
                      <p className="text-sm text-gray-500 flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Created {goal.createdAt.toLocaleDateString()}
                        {goal.reminder?.enabled && (
                          <span className="ml-3 inline-flex items-center text-amber-700">
                            <Clock className="h-4 w-4 mr-1" /> {goal.reminder.time}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleReminderEnabled(goal)}
                      title={goal.reminder?.enabled ? 'Disable reminder' : 'Enable reminder'}
                      className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-100 rounded-lg transition-colors"
                    >
                      {goal.reminder?.enabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => openReminderModal(goal)}
                      className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-100 rounded-lg transition-colors"
                      title="Set reminder time"
                    >
                      <Clock className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEditClick(goal)}
                      className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-100 rounded-lg transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              Completed Goals ({completedGoals.length})
            </h3>
            <div className="space-y-3">
              {completedGoals.map((goal) => (
                <div key={goal.id} className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleToggleComplete(goal.id)}
                      className="p-1 hover:bg-green-200 rounded-full transition-colors"
                    >
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </button>
                    <div>
                      <p className="text-gray-900 font-medium line-through">{goal.text}</p>
                      <p className="text-sm text-gray-500 flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Completed {goal.completedAt?.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditClick(goal)}
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {goals.length === 0 && (
          <div className="card text-center py-12">
            <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Goals Set Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start your wellness journey by setting your first goal.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Goal
            </button>
          </div>
        )}

        {/* Add Goal Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex items-center space-x-2 mb-4">
                <Target className="h-6 w-6 text-amber-600" />
                <h3 className="text-lg font-semibold text-gray-900">Add New Goal</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                What wellness goal would you like to work on?
              </p>
              <textarea
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                placeholder="e.g., Drink 8 glasses of water daily, Walk 10,000 steps, Get 8 hours of sleep..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none h-20 text-sm"
                maxLength={200}
              />
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setNewGoal('')
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddGoal}
                  disabled={!newGoal.trim()}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Goal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Goal Modal */}
        {showEditModal && editingGoal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex items-center space-x-2 mb-4">
                <Edit2 className="h-6 w-6 text-amber-600" />
                <h3 className="text-lg font-semibold text-gray-900">Edit Goal</h3>
              </div>
              <textarea
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                placeholder="Enter your goal..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none h-20 text-sm"
                maxLength={200}
              />
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingGoal(null)
                    setNewGoal('')
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditGoal}
                  disabled={!newGoal.trim()}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Update Goal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reminder Modal */}
        {showReminderModal && reminderTargetGoal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex items-center space-x-2 mb-4">
                <Bell className="h-6 w-6 text-amber-600" />
                <h3 className="text-lg font-semibold text-gray-900">Set Reminder</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">Choose the time you'd like to be reminded every day for this goal.</p>
              <div className="flex items-center space-x-3">
                <label className="text-sm text-gray-700">Reminder time</label>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowReminderModal(false)
                    setReminderTargetGoal(null)
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={saveReminder}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-700"
                >
                  Save Reminder
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
