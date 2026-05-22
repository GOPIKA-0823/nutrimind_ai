'use client'

import { Brain } from 'lucide-react'
import { useLogs } from '@/contexts/LogContext'
import { aiAPI } from '@/lib/api'

export default function AIInsights() {
  const { logs } = useLogs() as any

  // Compute simple insights from saved logs
  const now = new Date()
  const toDate = (s: any) => new Date(s)
  const normalized = Array.isArray(logs)
    ? logs
      .map((l: any) => ({ ...l, _date: toDate(l?.date || l?.createdAt || now) }))
      .filter((l: any) => !isNaN(l._date.getTime()))
    : []

  const isSameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const startOfWeek = (d: Date) => {
    const x = new Date(d)
    x.setHours(0, 0, 0, 0)
    const diff = (x.getDay() + 6) % 7
    x.setDate(x.getDate() - diff)
    return x
  }
  const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1)

  const pick = (period: 'today' | 'week' | 'month') => {
    if (period === 'today') return normalized.filter((l: any) => isSameDay(l._date, now))
    if (period === 'week') {
      const s = startOfWeek(now)
      return normalized.filter((l: any) => l._date >= s && l._date <= now)
    }
    const s = startOfMonth(now)
    return normalized.filter((l: any) => l._date >= s && l._date <= now)
  }

  const calc = (items: any[]) => {
    const n = items.length || 0
    if (!n) return { mood: 0, sleep: 0, steps: 0, calories: 0 }
    const t = items.reduce(
      (acc: any, l: any) => ({
        mood: acc.mood + Number(l?.mood?.score ?? 0),
        sleep: acc.sleep + Number(l?.sleep?.duration ?? 0),
        steps: acc.steps + Number(l?.activity?.steps ?? 0),
        calories: acc.calories + Number(l?.food?.totalCalories ?? 0)
      }),
      { mood: 0, sleep: 0, steps: 0, calories: 0 }
    )
    return {
      mood: t.mood / n,
      sleep: t.sleep / n,
      steps: Math.round(t.steps / n),
      calories: Math.round(t.calories / n)
    }
  }

  const today = calc(pick('today'))
  const week = calc(pick('week'))
  const month = calc(pick('month'))


  return (
    <div className="space-y-6">
      {/* AI Insights from Logs - styled cards */}
      <div className="space-y-4">
        {/* Section header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-primary-100">
              <Brain className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">AI Insights</h3>
              <p className="text-sm text-gray-600">Personalized recommendations based on your data</p>
            </div>
          </div>
        </div>

        {(() => {
          // Helper: last 7 vs previous 7 days
          const dayMs = 24 * 60 * 60 * 1000
          const start = new Date(now.getTime() - 13 * dayMs) // 14 days window
          const last14 = normalized.filter((l: any) => l._date >= start && l._date <= now)

          const recent7 = last14.filter((l: any) => l._date >= new Date(now.getTime() - 6 * dayMs))
          const prev7 = last14.filter((l: any) => l._date < new Date(now.getTime() - 6 * dayMs))

          const avgOf = (items: any[], pick: (l: any) => number) => {
            if (!items.length) return 0
            const sum = items.reduce((s, l) => s + pick(l), 0)
            return sum / items.length
          }

          const moodCurr = avgOf(recent7, l => Number(l?.mood?.score ?? 0))
          const moodPrev = avgOf(prev7, l => Number(l?.mood?.score ?? 0))
          const moodChange = moodPrev === 0 ? (moodCurr > 0 ? 100 : 0) : ((moodCurr - moodPrev) / Math.max(1, moodPrev)) * 100

          const sleepCurr = avgOf(recent7, l => Number(l?.sleep?.duration ?? 0))
          const sleepPrev = avgOf(prev7, l => Number(l?.sleep?.duration ?? 0))
          const sleepChange = sleepPrev === 0 ? (sleepCurr > 0 ? 100 : 0) : ((sleepCurr - sleepPrev) / Math.max(0.1, sleepPrev)) * 100

          const avgCaloriesWeek = Math.round(avgOf(recent7, l => Number(l?.food?.totalCalories ?? 0)))
          const targetCalories = 1800 // generic target band center

          const activeDays = new Set(
            recent7.filter((l: any) => Number(l?.activity?.steps ?? 0) >= 5000).map((l: any) => l._date.toISOString().slice(0, 10))
          ).size

          const impactBadge = (pct: number) => {
            const abs = Math.abs(pct)
            const label = abs >= 10 ? 'high impact' : abs >= 5 ? 'medium impact' : 'low impact'
            const cls = abs >= 10 ? 'bg-red-100 text-red-700' : abs >= 5 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'
            return <span className={`px-2 py-0.5 rounded-full text-xs ${cls}`}>{label}</span>
          }

          return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Mood Trend */}
              <div className={`rounded-lg p-5 border ${moodChange >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-lg">{moodChange >= 0 ? 'Mood Improvement Trend' : 'Mood Decline Trend'}</p>
                  {impactBadge(moodChange)}
                </div>
                <p className="mt-2 text-sm text-gray-700">
                  {moodChange >= 0
                    ? 'Your mood has been consistently improving over the past week. Great job!'
                    : 'Mood is trending down this week. Consider small boosts like a short walk or earlier sleep.'}
                </p>
                <p className="mt-3 text-sm text-gray-700">
                  Trend: <span className="font-semibold">{(moodChange || 0).toFixed(0)}%</span>
                  <span className="ml-4">Period: <span className="font-semibold">7</span></span>
                </p>
              </div>

              {/* Calories Optimization */}
              <div className="rounded-lg p-5 border bg-blue-50 border-blue-200">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-lg">Calorie Intake Optimization</p>
                  <span className="px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700">medium impact</span>
                </div>
                <p className="mt-2 text-sm text-gray-700">
                  Balance your meals to support stable energy. Aim for a daily average near the target range.
                </p>
                <p className="mt-3 text-sm text-gray-700">
                  Current: <span className="font-semibold">{avgCaloriesWeek || 0}</span>
                  <span className="ml-4">Recommended: <span className="font-semibold">{targetCalories - 200}-{targetCalories + 200}</span></span>
                </p>
              </div>

              {/* Sleep Quality */}
              <div className={`rounded-lg p-5 border ${sleepChange >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-lg">{sleepChange >= 0 ? 'Sleep Quality Improvement' : 'Sleep Quality Decline'}</p>
                  {impactBadge(sleepChange)}
                </div>
                <p className="mt-2 text-sm text-gray-700">
                  {sleepChange >= 0
                    ? 'Sleep duration improved this week.'
                    : 'Your sleep duration decreased this week. Consider reviewing your bedtime routine.'}
                </p>
                <p className="mt-3 text-sm text-gray-700">
                  {sleepChange >= 0 ? 'Increase' : 'Decline'}: <span className="font-semibold">{(sleepChange || 0).toFixed(0)}%</span>
                  <span className="ml-4">Period: <span className="font-semibold">7</span></span>
                </p>
              </div>

              {/* Exercise Consistency */}
              <div className="rounded-lg p-5 border bg-blue-50 border-blue-200">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-lg">Exercise Consistency</p>
                  <span className="px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700">medium impact</span>
                </div>
                <p className="mt-2 text-sm text-gray-700">
                  You're doing {activeDays >= 5 ? 'great' : 'well'} with activity! Try to maintain {activeDays >= 5 ? 'this' : 'or increase to a'} consistent routine.
                </p>
                <p className="mt-3 text-sm text-gray-700">
                  Frequency: <span className="font-semibold">{activeDays}/week</span>
                  <span className="ml-4">Target: <span className="font-semibold">5–7/week</span></span>
                </p>
              </div>
            </div>
          )
        })()}
      </div>

    </div>
  )
}
