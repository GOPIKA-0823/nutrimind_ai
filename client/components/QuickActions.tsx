'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Plus,
  Camera,
  Mic,
  Heart,
  Utensils,
  Moon,
  Activity
} from 'lucide-react'

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  color: string
  bgColor: string
  action: () => void
}

export default function QuickActions() {
  const [completedActions, setCompletedActions] = useState<string[]>([])
  const router = useRouter()

  const quickActions: QuickAction[] = [
    {
      id: 'log-mood',
      title: 'Log Mood',
      description: 'How are you feeling?',
      icon: Heart,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
      action: () => {
        setCompletedActions(prev => [...prev, 'log-mood'])
        // Navigate to mood logging
      }
    },
    {
      id: 'log-food',
      title: 'Log Food',
      description: 'Track your meals',
      icon: Utensils,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      action: () => {
        setCompletedActions(prev => [...prev, 'log-food'])
        // Navigate to food logging
      }
    },
    {
      id: 'log-sleep',
      title: 'Log Sleep',
      description: 'Record sleep quality',
      icon: Moon,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      action: () => {
        setCompletedActions(prev => [...prev, 'log-sleep'])
        // Navigate to sleep logging
      }
    },
    {
      id: 'log-activity',
      title: 'Log Activity',
      description: 'Track your exercise',
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      action: () => {
        setCompletedActions(prev => [...prev, 'log-activity'])
        // Navigate to activity logging
      }
    },
    {
      id: 'photo-food',
      title: 'Photo Food',
      description: 'AI food recognition',
      icon: Camera,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      action: () => {
        setCompletedActions(prev => [...prev, 'photo-food'])
        // Open camera for food recognition
      }
    },
    {
      id: 'voice-note',
      title: 'Voice Note',
      description: 'Quick voice logging',
      icon: Mic,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      action: () => {
        setCompletedActions(prev => [...prev, 'voice-note'])
        // Open voice recording
      }
    }
  ]


  const isCompleted = (actionId: string) => completedActions.includes(actionId)

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>

      {/* Primary Actions */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Daily Tracking</h4>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            const completed = isCompleted(action.id)

            return (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                onClick={action.action}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${completed
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200 bg-white hover:border-primary-200 hover:bg-primary-50'
                  }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${completed ? 'bg-green-100' : action.bgColor
                    }`}>
                    <Icon className={`h-5 w-5 ${completed ? 'text-green-600' : action.color
                      }`} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`text-sm font-medium ${completed ? 'text-green-800' : 'text-gray-900'
                      }`}>
                      {action.title}
                    </p>
                    <p className={`text-xs ${completed ? 'text-green-600' : 'text-gray-500'
                      }`}>
                      {action.description}
                    </p>
                  </div>
                  {completed && (
                    <div className="text-green-600">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>


      {/* Progress Indicator */}
      {completedActions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg"
        >
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-sm font-medium text-green-800">
              Great job! You've completed {completedActions.length} action{completedActions.length !== 1 ? 's' : ''} today.
            </p>
          </div>
          <div className="mt-2">
            <div className="flex justify-between text-xs text-green-600 mb-1">
              <span>Daily Progress</span>
              <span>{Math.round((completedActions.length / quickActions.length) * 100)}%</span>
            </div>
            <div className="w-full bg-green-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(completedActions.length / quickActions.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
