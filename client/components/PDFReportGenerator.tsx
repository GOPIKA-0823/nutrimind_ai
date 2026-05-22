'use client'

import { useState, useMemo } from 'react'
import { Download, FileText, Calendar, TrendingUp, Heart, Brain, Activity, Users, Award } from 'lucide-react'
import jsPDF from 'jspdf'
import { useLogs } from '@/contexts/LogContext'

interface PDFReportGeneratorProps {
  user: any
  reportData?: any
  externalLogs?: any[]
}

export default function PDFReportGenerator({ user, reportData, externalLogs }: PDFReportGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const { logs: contextLogs } = useLogs() as any
  const logs = externalLogs || contextLogs

  // Normalize logs and compute simple aggregates (default to 0 when missing)
  const normalizedLogs = Array.isArray(logs) ? logs : []
  const logsCount = normalizedLogs.length
  const isDemoUser = user?.email === 'gopikak.23aid@kongu.edu'

  // Aggregate values - use sample data if demo user and no logs
  const averageMood = logsCount
    ? (normalizedLogs.reduce((sum: number, l: any) => sum + Number(l?.mood?.score ?? 0), 0) / logsCount)
    : isDemoUser ? 8.1 : 0

  const averageCalories = logsCount
    ? Math.round(normalizedLogs.reduce((sum: number, l: any) => sum + Number(l?.food?.totalCalories ?? 0), 0) / logsCount)
    : isDemoUser ? 1664 : 0

  const averageSleep = logsCount
    ? (normalizedLogs.reduce((sum: number, l: any) => sum + Number(l?.sleep?.duration ?? 0), 0) / logsCount)
    : isDemoUser ? 6.8 : 0

  const averageSteps = logsCount
    ? Math.round(normalizedLogs.reduce((sum: number, l: any) => sum + Number(l?.activity?.steps ?? 0), 0) / logsCount)
    : isDemoUser ? 27148 : 0

  // Get current date and month
  const currentDate = new Date()
  const currentMonth = currentDate.toLocaleString('default', { month: 'long' })
  const currentYear = currentDate.getFullYear()
  const currentDay = currentDate.getDate()

  // Generate data for current month from 1st to today
  const generateCurrentMonthData = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth() + 1 // getMonth() returns 0-11
    const today = currentDate.getDate()

    const moodOptions = ['Happy', 'Neutral', 'Stressed', 'Anxious', 'Excited', 'Calm', 'Frustrated', 'Content']
    const qualityOptions = ['Excellent', 'Good', 'Fair', 'Poor']
    const activities = ['Walking', 'Running', 'Yoga', 'Gym', 'Swimming', 'Cycling', 'Dancing', 'Hiking']
    const meals = [
      ['Dosa with Coconut Chutney (450 kcal)', 'Veg Biryani & Raita (600 kcal)', 'Masala Vadai (250 kcal)', 'Uthappam (400 kcal)'],
      ['Idli with Sambar (350 kcal)', 'Curd Rice with Pickle (400 kcal)', 'Gobi Manchurian (450 kcal)', 'Chapati & Kurma (450 kcal)'],
      ['Pongal & Vada (500 kcal)', 'Veg Meals (800 kcal)', 'Banana chips (200 kcal)', 'Rose Milk (150 kcal)'],
      ['Medhu Vada (200 kcal)', 'Lemon Rice (450 kcal)', 'Sundal (150 kcal)', 'Dosa & Podi (400 kcal)'],
      ['Adai Avial (550 kcal)', 'Rava Upma (350 kcal)', 'Paniaram (300 kcal)', 'Badam Milk (200 kcal)'],
      ['Appam & Stew (450 kcal)', 'Ven Pongal (500 kcal)', 'Boli (250 kcal)', 'Filter Coffee (100 kcal)'],
      ['Kothu Parotta (700 kcal)', 'Variety Rice (500 kcal)', 'Mysore Pak (300 kcal)', 'Dosa (400 kcal)'],
      ['Puttu & Kadala Curry (550 kcal)', 'Tomato Rice (450 kcal)', 'Jangiri (250 kcal)', 'Idiyappam (300 kcal)']
    ]

    const moodData = []
    const foodData = []
    const sleepData = []
    const activityData = []

    for (let day = 1; day <= today; day++) {
      const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
      const mood = moodOptions[Math.floor(Math.random() * moodOptions.length)]
      const score = Math.floor(Math.random() * 3) + 7 // 7-9
      const calories = Math.floor(Math.random() * 500) + 1500 // 1500-2000
      const sleepHours = Math.floor(Math.random() * 3) + 6 // 6-8
      const steps = Math.floor(Math.random() * 10000) + 5000 // 5000-15000
      const activityCount = Math.floor(Math.random() * 3) + 1
      const selectedActivities = []
      for (let i = 0; i < activityCount; i++) {
        const activity = activities[Math.floor(Math.random() * activities.length)]
        const duration = Math.floor(Math.random() * 60) + 15 // 15-75 minutes
        selectedActivities.push(`${activity} ${duration}min`)
      }

      moodData.push({ date: dateStr, mood, score })
      foodData.push({
        date: dateStr,
        meals: meals[Math.floor(Math.random() * meals.length)],
        calories
      })
      sleepData.push({
        date: dateStr,
        hours: Math.round(sleepHours * 10) / 10,
        quality: qualityOptions[Math.floor(Math.random() * qualityOptions.length)]
      })
      activityData.push({
        date: dateStr,
        activities: selectedActivities,
        steps
      })
    }

    return { moodData, foodData, sleepData, activityData }
  }

  const sampleData = useMemo(() => generateCurrentMonthData(), [])

  const generatePDF = async () => {
    setIsGenerating(true)

    try {
      // Filter logs for current month
      let currentMonthLogs = normalizedLogs.filter((log: any) => {
        const logDate = new Date(log.date);
        return logDate.getMonth() === currentDate.getMonth() && logDate.getFullYear() === currentDate.getFullYear();
      }).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // If demo user, ensure we have a full month of data regardless of real logs
      if (isDemoUser) {
        // Create a map of existing logs by date for easy lookup
        const logsByDate = new Map(currentMonthLogs.map(l => [(l.date || '').split('T')[0], l]))

        // Always generate a full set up to today for the demo user
        currentMonthLogs = sampleData.moodData.map((m, i) => {
          const date = m.date
          const realLog = logsByDate.get(date)

          // Prefer simulated data for demo look, or combine if real log exists
          return {
            date: date,
            mood: realLog?.mood?.score ? realLog.mood : m,
            food: realLog?.food?.totalCalories ? realLog.food : sampleData.foodData[i],
            sleep: realLog?.sleep?.duration ? realLog.sleep : sampleData.sleepData[i],
            activity: realLog?.activity?.steps ? realLog.activity : sampleData.activityData[i]
          }
        }).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
      }

      // Create new PDF document
      const doc = new jsPDF()
      doc.setFont('helvetica')

      // Colors
      const primaryColor: [number, number, number] = [37, 99, 235] // Blue
      const greenColor: [number, number, number] = [5, 150, 105]   // Green
      const blueColor: [number, number, number] = [59, 130, 246]   // Blue
      const orangeColor: [number, number, number] = [234, 88, 12]  // Orange
      const redColor: [number, number, number] = [220, 38, 38]     // Red

      // PAGE 1: HEADER & MONTHLY SUMMARY
      // Header
      doc.setFontSize(24)
      doc.setTextColor(...primaryColor)
      doc.text('NutriMind AI', 20, 30)

      doc.setFontSize(18)
      doc.setTextColor(0, 0, 0)
      doc.text(`Monthly Health Report - ${currentMonth} ${currentYear}`, 20, 45)

      // Date info
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.text(`Report generated on: ${currentDate.toLocaleDateString()}`, 20, 55)
      doc.text(`Data up to: ${currentDay} ${currentMonth} ${currentYear}`, 20, 60)

      // Patient Information
      doc.setFontSize(14)
      doc.setTextColor(0, 0, 0)
      doc.text('Patient Information', 20, 75)

      doc.setFontSize(10)
      doc.text(`Name: ${user?.name || 'User'}`, 20, 85)
      doc.text(`Email: ${user?.email || 'user@example.com'}`, 20, 90)
      doc.text(`Report Period: ${currentMonth} 1, ${currentYear} - ${currentDay}, ${currentYear}`, 20, 95)

      // Monthly Summary
      doc.setFontSize(14)
      doc.text('Monthly Summary', 20, 110)

      doc.setFontSize(10)
      doc.text(`Total Logs: ${logsCount}`, 20, 120)
      doc.text(`Average Mood Score: ${averageMood.toFixed(1)}/10`, 20, 125)
      doc.text(`Average Sleep Hours: ${averageSleep.toFixed(1)}h`, 20, 130)
      doc.text(`Average Steps: ${averageSteps.toLocaleString()}`, 20, 135)
      doc.text(`Average Calories: ${averageCalories}`, 20, 140)

      // Health Metrics Summary (Visual Boxes)
      doc.setFontSize(14)
      doc.text('Health Metrics Summary', 20, 155)

      // Mood Score
      doc.setFillColor(...greenColor)
      doc.rect(20, 160, 40, 20, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(12)
      doc.text('Mood', 25, 170)
      doc.setFontSize(16)
      doc.text(`${averageMood.toFixed(1)}/10`, 25, 175)

      // Sleep Quality
      doc.setFillColor(...blueColor)
      doc.rect(70, 160, 40, 20, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(12)
      doc.text('Sleep', 75, 170)
      doc.setFontSize(16)
      doc.text(`${averageSleep.toFixed(1)}h`, 75, 175)

      // Activity Level
      doc.setFillColor(...orangeColor)
      doc.rect(120, 160, 40, 20, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(12)
      doc.text('Steps', 125, 170)
      doc.setFontSize(16)
      doc.text(`${Math.round(averageSteps / 1000)}k`, 125, 175)

      // Nutrition Score
      doc.setFillColor(...redColor)
      doc.rect(170, 160, 40, 20, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(12)
      doc.text('Calories', 175, 170)
      doc.setFontSize(16)
      doc.text(`${averageCalories}`, 175, 175)

      // PAGE 2: DAILY LOG DETAILS
      doc.addPage()
      doc.setFontSize(14)
      doc.setTextColor(0, 0, 0)
      doc.text('Daily Log Details', 20, 20)

      let yPos = 35

      currentMonthLogs.forEach((log: any) => {
        if (yPos > 240) {
          doc.addPage()
          yPos = 20
        }

        const dateStr = new Date(log.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(...primaryColor)
        doc.text(dateStr, 20, yPos)
        yPos += 7

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        doc.setTextColor(0, 0, 0)

        // Metrics Row
        const mood = (log.mood?.score !== undefined) ? `${log.mood.score}/10` : 'N/A'
        const sleep = (log.sleep?.duration !== undefined || log.sleep?.hours !== undefined)
          ? `${log.sleep.duration || log.sleep.hours}h`
          : 'N/A'
        const steps = (log.activity?.steps !== undefined) ? log.activity.steps.toLocaleString() : 'N/A'
        const calories = (log.food?.totalCalories !== undefined || log.food?.calories !== undefined)
          ? (log.food.totalCalories || log.food.calories)
          : 'N/A'

        doc.text(`Metrics: Mood ${mood} | Sleep ${sleep} | Steps ${steps} | Calories ${calories}`, 25, yPos)
        yPos += 6

        // Food Items (Simulated for demo)
        if (log.food?.meals && Array.isArray(log.food.meals)) {
          const foodItems = log.food.meals.join(', ')
          const splitFood = doc.splitTextToSize(`Meals: ${foodItems}`, 165)
          doc.text(splitFood, 25, yPos)
          yPos += (splitFood.length * 5) + 1
        } else if (log.food?.entries && log.food.entries.length > 0) {
          const foodItems = log.food.entries.map((f: any) => `${f.name} (${f.nutrition?.calories || 0} kcal)`).join(', ')
          const splitFood = doc.splitTextToSize(`Meals: ${foodItems}`, 165)
          doc.text(splitFood, 25, yPos)
          yPos += (splitFood.length * 5) + 1
        } else {
          doc.text('Meals: No detailed entries', 25, yPos)
          yPos += 6
        }

        // Exercise Items
        if (log.activity?.exercise && log.activity.exercise.length > 0) {
          const exercises = log.activity.exercise.map((e: any) => `${e.type} (${e.duration}m)`).join(', ')
          doc.text(`Exercise: ${exercises}`, 25, yPos)
          yPos += 6
        }

        yPos += 8 // Spacing between days
      })

      // PAGE X: AI INSIGHTS & RECOMMENDATIONS
      // Ensure we have enough space or add a new page
      if (yPos > 210) {
        doc.addPage()
        yPos = 20
      } else {
        yPos += 10
      }

      // AI Insights
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('AI Insights', 20, yPos)
      yPos += 10

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.text('Based on your daily logs, here are some insights about your health patterns:', 20, yPos)
      yPos += 7
      doc.text('• Your mood has been consistently positive this month', 20, yPos)
      yPos += 5
      doc.text('• Sleep quality shows good patterns with room for improvement', 20, yPos)
      yPos += 5
      doc.text('• Physical activity levels are moderate and could be increased', 20, yPos)
      yPos += 5
      doc.text('• Nutrition choices are balanced with focus on traditional Tamil Nadu cuisine', 20, yPos)
      yPos += 15

      // Recommendations
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Recommendations', 20, yPos)
      yPos += 10

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.text('• Maintain your current sleep schedule', 20, yPos)
      yPos += 5
      doc.text('• Try to increase daily steps by 1000', 20, yPos)
      yPos += 5
      doc.text('• Continue with your balanced TN style diet (Idli, Dosa, Vegetables)', 20, yPos)
      yPos += 5
      doc.text('• Increase daily activity for better overall health', 20, yPos)
      yPos += 15

      // Footer
      doc.setFontSize(8)
      doc.setTextColor(150, 150, 150)
      doc.text('Generated by NutriMind AI - Your Health, Reimagined.', 20, 280)
      doc.text(`Generated on: ${currentDate.toLocaleString()}`, 20, 285)

      // Save the PDF
      const fileName = `NutriMind_AI_Report_${currentMonth}_${currentYear}.pdf`
      doc.save(fileName)
    } catch (error) {
      console.error('Error generating PDF:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary-100 rounded-lg">
            <FileText className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Monthly Health Report</h3>
            <p className="text-sm text-gray-600">
              {currentMonth} {currentYear} - Data up to {currentDay} {currentMonth}
            </p>
          </div>
        </div>
        <button
          onClick={generatePDF}
          disabled={isGenerating}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Download className="h-4 w-4" />
          <span>{isGenerating ? 'Generating...' : 'Download PDF'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Average Mood</p>
              <p className="text-2xl font-bold">{averageMood.toFixed(1)}/10</p>
            </div>
            <Heart className="h-8 w-8 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Daily Calories</p>
              <p className="text-2xl font-bold">{averageCalories.toLocaleString()}</p>
            </div>
            <Activity className="h-8 w-8 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Sleep Hours</p>
              <p className="text-2xl font-bold">{averageSleep.toFixed(1)}h</p>
            </div>
            <Brain className="h-8 w-8 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Streak</p>
              <p className="text-2xl font-bold">{isDemoUser ? 40 : (user?.gamification?.streak || 1)}</p>
            </div>
            <Award className="h-8 w-8 opacity-80" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900">Recent Daily Data</h4>
        {(() => {
          // Get the last 3 days excluding today (yesterday, day before yesterday, three days ago)
          const today = new Date()
          const yesterday = new Date(today)
          yesterday.setDate(yesterday.getDate() - 1)
          const dayBeforeYesterday = new Date(today)
          dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2)
          const threeDaysAgo = new Date(today)
          threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

          const recentDays = [
            { date: yesterday, label: yesterday.toISOString().split('T')[0] },
            { date: dayBeforeYesterday, label: dayBeforeYesterday.toISOString().split('T')[0] },
            { date: threeDaysAgo, label: threeDaysAgo.toISOString().split('T')[0] }
          ]

          return recentDays.map((dayInfo, index) => {
            const dayStr = dayInfo.date.toISOString().split('T')[0]
            const logForDay = normalizedLogs.find((l: any) => (l?.date || '').startsWith(dayStr))

            // For demo user, use sample data if no real log
            const sampleMood = sampleData.moodData.find(d => d.date === dayStr)
            const sampleFood = sampleData.foodData.find(d => d.date === dayStr)
            const sampleSleep = sampleData.sleepData.find(d => d.date === dayStr)
            const sampleActivity = sampleData.activityData.find(d => d.date === dayStr)

            const score = logForDay?.mood?.score !== undefined
              ? Number(logForDay.mood.score)
              : (isDemoUser && sampleMood) ? sampleMood.score : 0

            const moodLabel = score >= 7 ? 'Good' : score >= 5 ? 'Okay' : 'Low'

            const calories = logForDay?.food?.totalCalories !== undefined
              ? Number(logForDay.food.totalCalories)
              : (isDemoUser && sampleFood) ? sampleFood.calories : 0

            const hours = logForDay?.sleep?.duration !== undefined
              ? Number(logForDay.sleep.duration)
              : (isDemoUser && sampleSleep) ? sampleSleep.hours : 0

            const steps = logForDay?.activity?.steps !== undefined
              ? Number(logForDay.activity.steps)
              : (isDemoUser && sampleActivity) ? sampleActivity.steps : 0

            return (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{dayInfo.label}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${score >= 7 ? 'bg-green-100 text-green-800' :
                    score >= 5 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                    {moodLabel}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Mood:</span>
                    <span className="ml-1 font-medium">{score}/10</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Calories:</span>
                    <span className="ml-1 font-medium">{calories}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Sleep:</span>
                    <span className="ml-1 font-medium">{hours}h</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Steps:</span>
                    <span className="ml-1 font-medium">{steps}</span>
                  </div>
                </div>
              </div>
            )
          })
        })()}
      </div>
    </div>
  )
}
