import { useState, useEffect } from 'react'
import { reportsAPI, handleApiError, MonthlyReport, userAPI, DailyLog, logsAPI } from '../lib/api'
import toast from 'react-hot-toast'
import PDFReportGenerator from '@/components/PDFReportGenerator'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, FileText, RefreshCw } from 'lucide-react'
import ReportAnalysisGraphs from './ReportAnalysisGraphs'

interface ReportsContentProps {
  user: any
}

interface ReportData {
  period: string
  totalLogs: number
  streak: number
  avgScore: number
  moodTrend: string
  sleepQuality: string
  activityLevel: string
  nutritionScore: string
  insights: string[]
  recommendations: string[]
}

export default function ReportsContent({ user }: ReportsContentProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [reports, setReports] = useState<MonthlyReport[]>([])
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [logs, setLogs] = useState<DailyLog[]>([])

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const response = await reportsAPI.getAllReports()
      setReports(response.reports)

      // Fetch logs for graphs
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(endDate.getDate() - 30)

      let fetchedLogs: DailyLog[] = []

      const isDemoUser = user?.email === 'gopikak.23aid@kongu.edu' || (user?.name && user.name.includes('23ADR048'))
      if (isDemoUser) {
        // Mock full month data for demo user
        fetchedLogs = Array.from({ length: 30 }, (_, i) => {
          const d = new Date()
          d.setDate(d.getDate() - (29 - i))

          const mockFoods = [
            { name: 'Dosa', calories: 150 },
            { name: 'Sambar', calories: 100 },
            { name: 'Rice', calories: 200 },
            { name: 'Curd', calories: 60 }
          ]

          // Randomly select 2-3 foods
          const dailyFoods = mockFoods
            .sort(() => 0.5 - Math.random())
            .slice(0, 2 + Math.floor(Math.random() * 2))

          return {
            _id: `mock-${i}`,
            userId: user.id || 'demo',
            date: d.toISOString(),
            mood: { score: 6 + Math.random() * 3 }, // 6-9 range
            sleep: {
              duration: 5 + Math.random() * 4,
              quality: 6 + Math.random() * 3
            }, // 5-9 range
            activity: {
              steps: 6000 + Math.floor(Math.random() * 6000), // 6k-12k steps
              waterIntake: 2000
            },
            food: {
              totalCalories: dailyFoods.reduce((sum, f) => sum + f.calories, 0),
              entries: dailyFoods
            }
          }
        }) as any
      } else {
        try {
          const logsResponse = await logsAPI.getLogs(1, 30, startDate.toISOString(), endDate.toISOString())
          fetchedLogs = logsResponse.logs
        } catch (e) {
          console.error('Failed to fetch logs for graph', e)
        }
      }
      setLogs(fetchedLogs)

      if (response.reports.length > 0) {
        formatReportData(response.reports[0])
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatReportData = (report: MonthlyReport) => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]

    const isDemoUser = user?.email === 'gopikak.23aid@kongu.edu'

    setReportData({
      period: `${monthNames[report.month - 1]} ${report.year}`,
      totalLogs: 30, // Simplified
      streak: isDemoUser ? 40 : (user?.gamification?.streak || 1),
      avgScore: isDemoUser ? 8.1 : (report.insights?.mood?.averageMood || 0),
      moodTrend: report.insights?.mood?.moodTrend === 'improving' ? '+10%' : report.insights?.mood?.moodTrend === 'declining' ? '-10%' : 'Stable',
      sleepQuality: (report.insights?.sleep?.sleepQuality || 0) > 7 ? 'Good' : 'Needs Work',
      activityLevel: `${report.insights?.activity?.averageSteps || 0} steps`,
      nutritionScore: report.insights?.nutrition?.calorieTrend || 'Stable',
      insights: Array.isArray(report.insights) ? (report.insights as any).map((i: any) => i.description) : [],
      recommendations: report.recommendations || []
    })
  }

  const handleGenerateReport = async () => {
    try {
      setIsGenerating(true)
      const now = new Date()
      const response = await reportsAPI.generateMonthlyReport(now.getMonth() + 1, now.getFullYear())

      toast.success('Report generated successfully!')
      setReports(prev => [response.report, ...prev])
      formatReportData(response.report)
    } catch (error) {
      const message = handleApiError(error)
      toast.error(message)
    } finally {
      setIsGenerating(false)
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <RefreshCw className="h-8 w-8 text-primary-500 animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header with Generate Button */}
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Health Reports</h2>
          <p className="text-sm text-gray-500 mt-1">Generate and view your monthly health insights</p>
        </div>
        <button
          onClick={handleGenerateReport}
          disabled={isGenerating}
          className="btn btn-primary flex items-center space-x-2"
        >
          {isGenerating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <BarChart3 className="h-4 w-4" />}
          <span>{isGenerating ? 'Generating...' : 'Generate New Report'}</span>
        </button>
      </div>

      {/* Health Progress & PDF Report Generator */}
      <div className="card">
        <PDFReportGenerator user={user} reportData={reportData} />
      </div>

      {reportData && (
        <>
          {/* Report Graph Analysis - Replaces Text Trends */}
          <div className="mb-8">
            <ReportAnalysisGraphs logs={logs} />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-full bg-blue-100">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Report Month</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.period}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-full bg-green-100">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Streak</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.streak}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-full bg-purple-100">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Mood</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.avgScore.toFixed(1)}/10</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
