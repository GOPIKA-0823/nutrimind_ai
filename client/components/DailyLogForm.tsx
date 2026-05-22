'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Heart,
  Moon,
  Activity,
  Utensils,
  Camera,
  Mic,
  Plus,
  X,
  Save
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useLogs } from '@/contexts/LogContext'

interface LogData {
  mood: {
    score: number
    notes: string
    emotions: string[]
  }
  sleep: {
    duration: number
    quality: number
    notes: string
  }
  activity: {
    steps: number
    exercise: Array<{
      type: string
      duration: number
      intensity: string
    }>
    waterIntake: number
    notes: string
  }
  food: Array<{
    name: string
    calories: number
    mealType: string
    timestamp: string
  }>
  notes: string
}

// Indian/Tamil Nadu Food Database with Calories (per 100g)
const INDIAN_FOOD_DATABASE: Record<string, { calories: number; category: string }> = {
  // Rice & Grains
  'rice': { calories: 130, category: 'grains' },
  'white rice': { calories: 130, category: 'grains' },
  'brown rice': { calories: 111, category: 'grains' },
  'basmati rice': { calories: 130, category: 'grains' },
  'idli': { calories: 39, category: 'breakfast' },
  'dosa': { calories: 168, category: 'breakfast' },
  'pongal': { calories: 120, category: 'breakfast' },
  'upma': { calories: 100, category: 'breakfast' },
  'poha': { calories: 80, category: 'breakfast' },
  'biryani': { calories: 200, category: 'main' },
  'fried rice': { calories: 150, category: 'main' },
  'idli & sambar': { calories: 300, category: 'breakfast' },
  'dosa with coconut chutney': { calories: 450, category: 'breakfast' },
  'pongal & vada': { calories: 500, category: 'breakfast' },
  'poori masala': { calories: 550, category: 'breakfast' },
  'rava upma': { calories: 350, category: 'breakfast' },
  'rice, sambar, poriyal': { calories: 650, category: 'lunch' },
  'curd rice & pickle': { calories: 400, category: 'lunch' },
  'veg biryani & raita': { calories: 600, category: 'lunch' },
  'lemon rice & potato fry': { calories: 550, category: 'lunch' },
  'full meals (rice, kuzhambu, rasam)': { calories: 750, category: 'lunch' },
  'chapati & kurma': { calories: 450, category: 'dinner' },
  'idiyappam & coconut milk': { calories: 350, category: 'dinner' },
  'parotta & salna': { calories: 600, category: 'dinner' },
  'uthappam': { calories: 400, category: 'dinner' },
  'dosa & sambar': { calories: 400, category: 'dinner' },
  'medhu vada': { calories: 200, category: 'snack' },
  'masala vadai': { calories: 250, category: 'snack' },
  'filter coffee': { calories: 100, category: 'beverage' },
  'sundal': { calories: 150, category: 'snack' },

  // Breads & Rotis
  'chapati': { calories: 71, category: 'bread' },
  'roti': { calories: 71, category: 'bread' },
  'naan': { calories: 310, category: 'bread' },
  'paratha': { calories: 200, category: 'bread' },
  'poori': { calories: 150, category: 'bread' },
  'appam': { calories: 80, category: 'bread' },
  'puttu': { calories: 90, category: 'bread' },

  // Dal & Lentils
  'dal': { calories: 100, category: 'protein' },
  'sambar': { calories: 80, category: 'curry' },
  'rasam': { calories: 30, category: 'soup' },
  'coconut rice': { calories: 200, category: 'main' },
  'tamarind rice': { calories: 180, category: 'main' },
  'curd rice': { calories: 120, category: 'main' },
  'lemon rice': { calories: 150, category: 'main' },
  'vada': { calories: 200, category: 'snack' },
  'sambar vada': { calories: 250, category: 'snack' },
  'medu vada': { calories: 200, category: 'snack' },
  'masala vada': { calories: 180, category: 'snack' },
  'bajji': { calories: 150, category: 'snack' },
  'bondas': { calories: 200, category: 'snack' },

  // Snacks & Street Food
  'samosa': { calories: 200, category: 'snack' },
  'pakora': { calories: 150, category: 'snack' },
  'bhajji': { calories: 120, category: 'snack' },
  'vada pav': { calories: 300, category: 'snack' },
  'pav bhaji': { calories: 250, category: 'snack' },
  'bhel puri': { calories: 150, category: 'snack' },
  'pani puri': { calories: 100, category: 'snack' },
  'sev puri': { calories: 120, category: 'snack' },
  'dahi puri': { calories: 130, category: 'snack' },

  // Sweets & Desserts
  'gulab jamun': { calories: 150, category: 'dessert' },
  'rasgulla': { calories: 100, category: 'dessert' },
  'kheer': { calories: 120, category: 'dessert' },
  'payasam': { calories: 150, category: 'dessert' },
  'halwa': { calories: 200, category: 'dessert' },
  'ladoo': { calories: 180, category: 'dessert' },
  'barfi': { calories: 200, category: 'dessert' },
  'jalebi': { calories: 250, category: 'dessert' },
  'mysore pak': { calories: 300, category: 'dessert' },

  // Beverages
  'chai': { calories: 30, category: 'beverage' },
  'coffee': { calories: 20, category: 'beverage' },
  'lassi': { calories: 100, category: 'beverage' },
  'buttermilk': { calories: 20, category: 'beverage' },
  'coconut water': { calories: 20, category: 'beverage' },
  'fresh lime soda': { calories: 30, category: 'beverage' },

  // Fruits
  'mango': { calories: 60, category: 'fruit' },
  'banana': { calories: 90, category: 'fruit' },
  'apple': { calories: 50, category: 'fruit' },
  'orange': { calories: 50, category: 'fruit' },
  'papaya': { calories: 40, category: 'fruit' },
  'guava': { calories: 60, category: 'fruit' },
  'pomegranate': { calories: 80, category: 'fruit' },
  'grapes': { calories: 60, category: 'fruit' },

  // Dairy
  'milk': { calories: 60, category: 'dairy' },
  'curd': { calories: 60, category: 'dairy' },
  'paneer': { calories: 200, category: 'dairy' },
  'ghee': { calories: 900, category: 'fat' },
  'butter': { calories: 700, category: 'fat' },

  // Nuts & Seeds
  'almonds': { calories: 580, category: 'nuts' },
  'cashews': { calories: 550, category: 'nuts' },
  'peanuts': { calories: 570, category: 'nuts' },
  'walnuts': { calories: 650, category: 'nuts' },
  'pistachios': { calories: 560, category: 'nuts' }
}

export default function DailyLogForm() {
  const { addLog, addFoodEntry: createFoodEntry, updateLog, refreshLogs } = useLogs() as any
  const [activeTab, setActiveTab] = useState('mood')
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState<{ [key: number]: boolean }>({})
  const [logData, setLogData] = useState<LogData>({
    mood: { score: 0, notes: '', emotions: [] },
    sleep: { duration: 0, quality: 7, notes: '' },
    activity: { steps: 0, exercise: [], waterIntake: 0, notes: '' },
    food: [],
    notes: ''
  })

  // Function to calculate calories based on food name
  const calculateCalories = (foodName: string): number => {
    if (!foodName || foodName.trim() === '') return 0

    const normalizedName = foodName.toLowerCase().trim()

    // Direct match
    if (INDIAN_FOOD_DATABASE[normalizedName]) {
      return INDIAN_FOOD_DATABASE[normalizedName].calories
    }

    // Partial match for common variations
    for (const [key, value] of Object.entries(INDIAN_FOOD_DATABASE)) {
      if (normalizedName.includes(key) || key.includes(normalizedName)) {
        return value.calories
      }
    }

    // Default calories for unknown foods
    return 0
  }

  // Helper to check if food is available
  const isFoodAvailable = (name: string): boolean => {
    if (!name || name.trim() === '') return true
    const normalizedName = name.toLowerCase().trim()

    // Check direct match
    if (INDIAN_FOOD_DATABASE[normalizedName]) return true

    // Check partial match
    return Object.keys(INDIAN_FOOD_DATABASE).some(key =>
      normalizedName.includes(key) || key.includes(normalizedName)
    )
  }

  // Function to get food suggestions based on input
  const getFoodSuggestions = (input: string): string[] => {
    if (!input || input.trim().length < 2) return []

    const normalizedInput = input.toLowerCase().trim()
    const suggestions: string[] = []

    for (const [foodName, data] of Object.entries(INDIAN_FOOD_DATABASE)) {
      if (foodName.includes(normalizedInput) || normalizedInput.includes(foodName)) {
        suggestions.push(foodName)
      }
    }

    return suggestions.slice(0, 5) // Limit to 5 suggestions
  }

  const tabs = [
    { id: 'mood', label: 'Mood', icon: Heart },
    { id: 'food', label: 'Food', icon: Utensils },
    { id: 'sleep', label: 'Sleep', icon: Moon },
    { id: 'activity', label: 'Activity', icon: Activity }
  ]

  const tabIds = tabs.map(t => t.id)
  const goNextTab = () => {
    const idx = tabIds.indexOf(activeTab)
    if (idx < tabIds.length - 1) setActiveTab(tabIds[idx + 1])
  }
  const goPrevTab = () => {
    const idx = tabIds.indexOf(activeTab)
    if (idx > 0) setActiveTab(tabIds[idx - 1])
  }

  const emotions = [
    'Happy', 'Sad', 'Anxious', 'Excited', 'Stressed', 'Calm',
    'Energetic', 'Tired', 'Focused', 'Confused', 'Grateful', 'Frustrated'
  ]

  const exerciseTypes = ['Walking', 'Running', 'Cycling', 'Swimming', 'Yoga', 'Weight Training', 'Dancing', 'Other']
  const intensities = ['Low', 'Moderate', 'High']

  const handleMoodChange = (score: number) => {
    setLogData(prev => ({
      ...prev,
      mood: { ...prev.mood, score }
    }))
  }

  const handleEmotionToggle = (emotion: string) => {
    setLogData(prev => ({
      ...prev,
      mood: {
        ...prev.mood,
        emotions: prev.mood.emotions.includes(emotion)
          ? prev.mood.emotions.filter(e => e !== emotion)
          : [...prev.mood.emotions, emotion]
      }
    }))
  }

  const addFoodEntry = () => {
    setLogData(prev => ({
      ...prev,
      food: [...prev.food, {
        name: '',
        calories: 0,
        mealType: 'breakfast',
        timestamp: new Date().toISOString()
      }]
    }))
  }

  // Calculate total calories for display
  const totalCalories = logData.food.reduce((total, food) => total + food.calories, 0)

  const updateFoodEntry = (index: number, field: string, value: any) => {
    setLogData(prev => ({
      ...prev,
      food: prev.food.map((food, i) => {
        if (i === index) {
          const updatedFood = { ...food, [field]: value }

          // Auto-calculate calories when food name changes
          if (field === 'name' && value) {
            const calculatedCalories = calculateCalories(value)
            updatedFood.calories = calculatedCalories
          }

          return updatedFood
        }
        return food
      })
    }))
  }

  const removeFoodEntry = (index: number) => {
    setLogData(prev => ({
      ...prev,
      food: prev.food.filter((_, i) => i !== index)
    }))
  }

  const addExercise = () => {
    setLogData(prev => ({
      ...prev,
      activity: {
        ...prev.activity,
        exercise: [...prev.activity.exercise, {
          type: 'Walking',
          duration: 30,
          intensity: 'Moderate'
        }]
      }
    }))
  }

  const updateExercise = (index: number, field: string, value: any) => {
    setLogData(prev => ({
      ...prev,
      activity: {
        ...prev.activity,
        exercise: prev.activity.exercise.map((ex, i) =>
          i === index ? { ...ex, [field]: value } : ex
        )
      }
    }))
  }

  const removeExercise = (index: number) => {
    setLogData(prev => ({
      ...prev,
      activity: {
        ...prev.activity,
        exercise: prev.activity.exercise.filter((_, i) => i !== index)
      }
    }))
  }

  const handleSubmit = async () => {
    // Validate food entries before submitting
    const invalidFood = logData.food.some(f => f.name && !isFoodAvailable(f.name))
    if (invalidFood) {
      toast.error('Food item not recognized. Please check the spelling or enter a valid name.')
      setActiveTab('food')
      return
    }

    setLoading(true)
    try {
      // Calculate total calories from food entries
      const totalCalories = logData.food.reduce((total, food) => total + food.calories, 0)


      // Create log entry without food data first
      const logEntry = {
        date: new Date().toISOString(),
        mood: {
          score: logData.mood.score,
          notes: logData.mood.notes,
          emotions: logData.mood.emotions
        },
        sleep: {
          duration: logData.sleep.duration,
          quality: logData.sleep.quality,
          notes: logData.sleep.notes
        },
        activity: {
          steps: logData.activity.steps,
          exercise: logData.activity.exercise,
          waterIntake: logData.activity.waterIntake,
          notes: logData.activity.notes
        },
        notes: logData.notes
      }

      // Add log and get id
      const logId = await addLog(logEntry)

      // Persist food entries if any
      if (logId && logData.food.length > 0) {
        for (const food of logData.food) {
          if (food.name && food.name.trim() !== '') {
            const foodEntryData = {
              name: food.name,
              mealType: food.mealType || 'snack',
              timestamp: food.timestamp || new Date().toISOString(),
              calories: food.calories || 0
            }
            await createFoodEntry(logId, foodEntryData as any)
          }
        }
      }

      // Small delay to ensure server has processed all food entries
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Refresh logs to update recent logs display
      console.log('Refreshing logs after submission...')
      await refreshLogs()
      console.log('Logs refreshed successfully')

      toast.success('Daily log saved successfully!')

      // Reset form
      setLogData({
        mood: { score: 5, notes: '', emotions: [] },
        sleep: { duration: 8, quality: 7, notes: '' },
        activity: { steps: 0, exercise: [], waterIntake: 0, notes: '' },
        food: [],
        notes: ''
      })
    } catch (error) {
      console.error('Submit error:', error)
      toast.error('Failed to save log. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Mood Tab */}
        {activeTab === 'mood' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">How are you feeling today?</h3>

              {/* Mood Slider */}
              <div className="mb-6">
                <label className="label">Mood Score (1-10)</label>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">😔</span>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={logData.mood.score}
                    onChange={(e) => handleMoodChange(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-sm text-gray-500">😊</span>
                </div>
                <div className="text-center mt-2">
                  <span className="text-2xl font-bold text-primary-600">
                    {logData.mood.score}/10
                  </span>
                </div>
              </div>

              {/* Emotions */}
              <div className="mb-6">
                <label className="label">Select emotions you're feeling:</label>
                <div className="flex flex-wrap gap-2">
                  {emotions.map((emotion) => (
                    <button
                      key={emotion}
                      onClick={() => handleEmotionToggle(emotion)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${logData.mood.emotions.includes(emotion)
                        ? 'bg-primary-100 text-primary-700 border border-primary-200'
                        : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                        }`}
                    >
                      {emotion}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mood Notes */}
              <div>
                <label className="label">Additional notes about your mood:</label>
                <textarea
                  value={logData.mood.notes}
                  onChange={(e) => setLogData(prev => ({
                    ...prev,
                    mood: { ...prev.mood, notes: e.target.value }
                  }))}
                  className="input h-24 resize-none"
                  placeholder="What's contributing to your mood today?"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Food Tab */}
        {activeTab === 'food' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Food & Nutrition</h3>
                <div className="flex space-x-2">
                  <button className="btn btn-outline btn-sm">
                    <Camera className="h-4 w-4 mr-1" />
                    Photo
                  </button>
                  <button className="btn btn-outline btn-sm">
                    <Mic className="h-4 w-4 mr-1" />
                    Voice
                  </button>
                </div>
              </div>

              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Utensils className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-800">
                        <strong>Smart Calorie Detection:</strong> Just type the food name and calories will be automatically calculated for Indian/Tamil Nadu foods!
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-800">
                      {totalCalories} cal
                    </div>
                    <div className="text-xs text-blue-600">Total Calories</div>
                  </div>
                </div>
              </div>

              {/* Food Entries */}
              <div className="space-y-4">
                {logData.food.map((food, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Food Entry {index + 1}</h4>
                      <button
                        onClick={() => removeFoodEntry(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="label">Food Name</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={food.name}
                            onChange={(e) => {
                              updateFoodEntry(index, 'name', e.target.value)
                              setShowSuggestions(prev => ({ ...prev, [index]: e.target.value.length > 1 }))
                            }}
                            onFocus={() => setShowSuggestions(prev => ({ ...prev, [index]: true }))}
                            onBlur={() => {
                              if (food.name && !isFoodAvailable(food.name)) {
                                toast.error('Food item not recognized. Please check the spelling or enter a valid name.')
                              }
                              setTimeout(() => setShowSuggestions(prev => ({ ...prev, [index]: false })), 200)
                            }}
                            className="input"
                            placeholder="e.g., Dosa, Biryani, Sambar, Idli"
                          />
                          {showSuggestions[index] && getFoodSuggestions(food.name).length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                              {getFoodSuggestions(food.name).map((suggestion, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => {
                                    updateFoodEntry(index, 'name', suggestion)
                                    setShowSuggestions(prev => ({ ...prev, [index]: false }))
                                  }}
                                  className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm"
                                >
                                  <div className="flex justify-between items-center">
                                    <span className="capitalize">{suggestion}</span>
                                    <span className="text-xs text-gray-500">
                                      {INDIAN_FOOD_DATABASE[suggestion]?.calories} cal
                                    </span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="label">Calories (Auto-calculated)</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={food.calories}
                            onChange={(e) => updateFoodEntry(index, 'calories', parseInt(e.target.value) || 0)}
                            className="input pr-8"
                            placeholder="Auto-calculated"
                          />
                          {food.calories > 0 ? (
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                              <span className="text-xs text-green-600 font-medium">✓</span>
                            </div>
                          ) : (
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                              <span className="text-xs text-gray-400">0</span>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Calories are automatically calculated for Indian foods
                        </p>
                      </div>
                      <div>
                        <label className="label">Meal Type</label>
                        <select
                          value={food.mealType}
                          onChange={(e) => updateFoodEntry(index, 'mealType', e.target.value)}
                          className="input"
                        >
                          <option value="breakfast">Breakfast</option>
                          <option value="lunch">Lunch</option>
                          <option value="dinner">Dinner</option>
                          <option value="snack">Snack</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={addFoodEntry}
                className="btn btn-outline w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Food Entry
              </button>

              {/* Food Summary */}
              {logData.food.length > 0 && (
                <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Food Summary</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Total Food Items</p>
                      <p className="text-lg font-semibold text-gray-900">{logData.food.length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Calories</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {totalCalories} cal
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Sleep Tab */}
        {activeTab === 'sleep' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Sleep Quality</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label">Sleep Duration (hours)</label>
                  <input
                    type="number"
                    min="0"
                    max="24"
                    step="0.5"
                    value={logData.sleep.duration}
                    onChange={(e) => setLogData(prev => ({
                      ...prev,
                      sleep: { ...prev.sleep, duration: parseFloat(e.target.value) || 0 }
                    }))}
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">Sleep Quality (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={logData.sleep.quality}
                    onChange={(e) => setLogData(prev => ({
                      ...prev,
                      sleep: { ...prev.sleep, quality: parseInt(e.target.value) || 1 }
                    }))}
                    className="input"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="label">Sleep Notes</label>
                <textarea
                  value={logData.sleep.notes}
                  onChange={(e) => setLogData(prev => ({
                    ...prev,
                    sleep: { ...prev.sleep, notes: e.target.value }
                  }))}
                  className="input h-24 resize-none"
                  placeholder="Any sleep disturbances, dreams, or observations?"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Physical Activity</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="label">Daily Steps</label>
                  <input
                    type="number"
                    value={logData.activity.steps}
                    onChange={(e) => setLogData(prev => ({
                      ...prev,
                      activity: { ...prev.activity, steps: parseInt(e.target.value) || 0 }
                    }))}
                    className="input"
                    placeholder="8500"
                  />
                </div>

                <div>
                  <label className="label">Water Intake (ml)</label>
                  <input
                    type="number"
                    value={logData.activity.waterIntake}
                    onChange={(e) => setLogData(prev => ({
                      ...prev,
                      activity: { ...prev.activity, waterIntake: parseInt(e.target.value) || 0 }
                    }))}
                    className="input"
                    placeholder="2000"
                  />
                </div>
              </div>

              {/* Exercise Entries */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">Exercise Activities</h4>
                  <button
                    onClick={addExercise}
                    className="btn btn-outline btn-sm"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Exercise
                  </button>
                </div>

                <div className="space-y-4">
                  {logData.activity.exercise.map((exercise, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-medium">Exercise {index + 1}</h5>
                        <button
                          onClick={() => removeExercise(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="label">Type</label>
                          <select
                            value={exercise.type}
                            onChange={(e) => updateExercise(index, 'type', e.target.value)}
                            className="input"
                          >
                            {exerciseTypes.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="label">Duration (minutes)</label>
                          <input
                            type="number"
                            value={exercise.duration}
                            onChange={(e) => updateExercise(index, 'duration', parseInt(e.target.value) || 0)}
                            className="input"
                          />
                        </div>
                        <div>
                          <label className="label">Intensity</label>
                          <select
                            value={exercise.intensity}
                            onChange={(e) => updateExercise(index, 'intensity', e.target.value)}
                            className="input"
                          >
                            {intensities.map(intensity => (
                              <option key={intensity} value={intensity}>{intensity}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Activity Notes</label>
                <textarea
                  value={logData.activity.notes}
                  onChange={(e) => setLogData(prev => ({
                    ...prev,
                    activity: { ...prev.activity, notes: e.target.value }
                  }))}
                  className="input h-24 resize-none"
                  placeholder="How did you feel during your activities?"
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* General Notes */}
      <div className="card">
        <label className="label">General Notes</label>
        <textarea
          value={logData.notes}
          onChange={(e) => setLogData(prev => ({ ...prev, notes: e.target.value }))}
          className="input h-24 resize-none"
          placeholder="Any additional thoughts or observations about your day?"
        />
      </div>

      {/* Navigation / Submit */}
      <div className="flex items-center justify-between">
        <button
          onClick={goPrevTab}
          disabled={loading || activeTab === tabIds[0]}
          className={`btn btn-outline px-6 py-3 ${activeTab === tabIds[0] ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Back
        </button>

        {activeTab !== 'activity' ? (
          <button
            onClick={goNextTab}
            disabled={loading}
            className="btn btn-primary px-8 py-3"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn btn-primary px-8 py-3"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="loading-spinner h-5 w-5 mr-2"></div>
                Saving...
              </div>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Save Daily Log
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
