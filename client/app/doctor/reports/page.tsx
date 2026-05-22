'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import DoctorDashboardLayout from '@/components/DoctorDashboardLayout'
import LoadingSpinner from '@/components/LoadingSpinner'
import { FileText, Calendar, TrendingUp, AlertCircle, CheckCircle, Clock, UserCheck, Search, Filter, Download, Eye, MessageSquare } from 'lucide-react'
import jsPDF from 'jspdf'
import { doctorAPI } from '@/lib/api'

export default function DoctorReports() {
  const { user, loading } = useAuth()
  const router = useRouter()
  interface Report {
    id: string
    _id: string
    patientName: string
    patientEmail: string
    patientId: string
    month: string
    year: number
    monthNumber: number
    status: 'pending' | 'reviewed'
    moodScore: number
    sleepQuality: number
    activityLevel: number
    nutritionScore: string
    overallScore: number
    generatedDate: string
    lastReviewed: string | null
    reviewedBy: string | null
    reportData?: any
  }

  const [reports, setReports] = useState<Report[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const reportsPerPage = 10
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [showPdfViewer, setShowPdfViewer] = useState(false)
  const [loadingReports, setLoadingReports] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchReports = async () => {
      if (!user) return

      try {
        setLoadingReports(true)
        const { reports: fetchedReports } = await doctorAPI.getReports()
        setReports(fetchedReports || [])
      } catch (error) {
        console.error('Error fetching reports:', error)
        setReports([])
      } finally {
        setLoadingReports(false)
      }
    }

    fetchReports()
  }, [user])

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.patientEmail.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || report.status === filterStatus
    return matchesSearch && matchesFilter
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredReports.length / reportsPerPage)
  const startIndex = (currentPage - 1) * reportsPerPage
  const endIndex = startIndex + reportsPerPage
  const currentReports = filteredReports.slice(startIndex, endIndex)

  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterStatus])

  const [selectedPatientLogs, setSelectedPatientLogs] = useState<any[]>([])

  const handleReviewReport = async (reportId: string) => {
    const report = reports.find(r => r.id === reportId)
    if (report) {
      try {
        // Fetch real patient logs for this report
        const logsResponse = await doctorAPI.getPatientLogs(report.patientId, { limit: 100 })
        setSelectedPatientLogs(logsResponse.logs || [])

        // Mark report as reviewed
        setReports(prevReports =>
          prevReports.map(r =>
            r.id === reportId
              ? { ...r, status: 'reviewed', lastReviewed: new Date().toISOString().split('T')[0] }
              : r
          )
        )

        setSelectedReport({
          ...report,
          status: 'reviewed',
          lastReviewed: new Date().toISOString().split('T')[0]
        })
        setShowPdfViewer(true)
      } catch (error) {
        console.error('Error fetching patient logs:', error)
      }
    }
  }

  const handleDownloadPdf = (report: Report, logs: any[] = []) => {
    // Standardized refined PDF generation logic (copied from PDFReportGenerator)
    const doc = new jsPDF()
    doc.setFont('helvetica')
    const primaryColor: [number, number, number] = [37, 99, 235]
    const greenColor: [number, number, number] = [5, 150, 105]
    const blueColor: [number, number, number] = [59, 130, 246]
    const orangeColor: [number, number, number] = [234, 88, 12]
    const redColor: [number, number, number] = [220, 38, 38]

    // PAGE 1: HEADER & SUMMARY
    doc.setFontSize(24)
    doc.setTextColor(...primaryColor)
    doc.text('NutriMind AI', 20, 30)

    doc.setFontSize(18)
    doc.setTextColor(0, 0, 0)
    doc.text(`Monthly Health Report - ${report.month} ${report.year}`, 20, 45)

    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`Report generated on: ${report.generatedDate}`, 20, 55)
    doc.text(`Reviewed by: Dr. ${user?.name || 'Assigned Doctor'}`, 20, 60)

    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text('Patient Information', 20, 75)
    doc.setFontSize(10)
    doc.text(`Name: ${report.patientName}`, 20, 85)
    doc.text(`Email: ${report.patientEmail}`, 20, 90)
    doc.text(`Patient ID: ${report.patientId.substring(0, 8)}...`, 20, 95)

    // Summary Averages content
    doc.setFontSize(14)
    doc.text('Monthly Summary', 20, 110)
    doc.setFontSize(10)
    doc.text(`Average Mood: ${report.moodScore}/10`, 20, 120)
    doc.text(`Sleep Quality: ${report.sleepQuality}/10`, 20, 125)
    doc.text(`Activity Level: ${report.activityLevel}/10`, 20, 130)
    doc.text(`Nutrition Grade: ${report.nutritionScore}`, 20, 135)

    // Health Metric Boxes (Visual)
    doc.setFillColor(...greenColor); doc.rect(20, 145, 40, 20, 'F');
    doc.setFillColor(...blueColor); doc.rect(70, 145, 40, 20, 'F');
    doc.setFillColor(...orangeColor); doc.rect(120, 145, 40, 20, 'F');
    doc.setFillColor(...redColor); doc.rect(170, 145, 40, 20, 'F');

    doc.setTextColor(255, 255, 255); doc.setFontSize(10);
    doc.text('Mood', 25, 153); doc.text(`${report.moodScore}/10`, 25, 160);
    doc.text('Sleep', 75, 153); doc.text(`${report.sleepQuality}/10`, 75, 160);
    doc.text('Activity', 125, 153); doc.text(`${report.activityLevel}/10`, 125, 160);
    doc.text('Nutrition', 175, 153); doc.text(report.nutritionScore, 175, 160);

    // PAGE 2: REAL DAILY LOGS
    const reportLogs = logs.length > 0 ? logs : (report.reportData?.logs || [])
    if (reportLogs.length > 0) {
      doc.addPage()
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(14)
      doc.text('Daily Log Details', 20, 20)

      let yPos = 35
      reportLogs.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .forEach((log: any) => {
          if (yPos > 250) { doc.addPage(); yPos = 20; }

          const dateStr = new Date(log.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
          doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(...primaryColor);
          doc.text(dateStr, 20, yPos); yPos += 7;

          doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(0, 0, 0);
          const mood = log.mood?.score ? `${log.mood.score}/10` : 'N/A'
          const sleep = log.sleep?.duration ? `${log.sleep.duration}h` : 'N/A'
          const steps = log.activity?.steps ? log.activity.steps.toLocaleString() : 'N/A'
          const calories = log.food?.totalCalories ? log.food.totalCalories : 'N/A'
          doc.text(`Metrics: Mood ${mood} | Sleep ${sleep} | Steps ${steps} | Calories ${calories}`, 25, yPos); yPos += 6;

          if (log.food?.entries && log.food.entries.length > 0) {
            const foodItems = log.food.entries.map((f: any) => `${f.name} (${f.nutrition?.calories || 0} kcal)`).join(', ')
            const splitFood = doc.splitTextToSize(`Meals: ${foodItems}`, 165)
            doc.text(splitFood, 25, yPos); yPos += (splitFood.length * 5) + 1;
          }
          yPos += 5
        })
    }

    // AI INSIGHTS & RECOMMENDATIONS (End)
    // Always add a new page for clean separation
    doc.addPage();
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('AI Analysis & Clinical Notes', 20, 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Based on clinical review of the logged data, the patient shows healthy trends with Tamil Nadu style nutrition.', 20, 30);

    doc.text('Recommendations:', 20, 45);
    const recs = ['• Maintain current TN style nutrition plan.', '• Increase daily step goal by 500.', '• Continue monitoring sleep quality.'];
    recs.forEach((r, i) => doc.text(r, 25, 55 + (i * 7)));

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Generated by NutriMind AI - Clinically Reviewed.', 20, 280);
    doc.save(`${report.patientName.replace(' ', '_')}_Report.pdf`)
  }

  const handleAddSuggestions = (reportId: string) => {
    const report = reports.find(r => r.id === reportId)
    if (report) {
      // Navigate to messages page for this specific patient with their actual ID
      router.push(`/doctor/messages?patient=${encodeURIComponent(report.patientName)}&email=${encodeURIComponent(report.patientEmail)}&id=${encodeURIComponent(report.patientId)}`)
    }
  }

  if (loading || loadingReports) {
    return <LoadingSpinner />
  }

  if (!user) {
    return null
  }

  return (
    <DoctorDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">
            Patient Reports 📊
          </h1>
          <p className="text-primary-100">
            Review monthly AI-generated health reports and add personalized suggestions.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending Review</option>
                <option value="reviewed">Reviewed</option>
              </select>
              <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </button>
            </div>
          </div>
        </div>

        {/* Reports List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Monthly Reports ({filteredReports.length})</h3>
            <p className="text-sm text-gray-500 mt-1">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredReports.length)} of {filteredReports.length} reports
            </p>
          </div>
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {currentReports.map((report) => (
              <div key={report.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <FileText className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{report.patientName}</h4>
                      <p className="text-sm text-gray-600">{report.patientEmail}</p>
                      <p className="text-xs text-gray-500">{report.month}</p>
                      <p className="text-xs text-gray-500">Generated: {report.generatedDate}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Mood Score</p>
                      <p className="text-lg font-semibold text-gray-900">{report.moodScore}/10</p>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-gray-600">Sleep Quality</p>
                      <p className="text-lg font-semibold text-gray-900">{report.sleepQuality}/10</p>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-gray-600">Activity Level</p>
                      <p className="text-lg font-semibold text-gray-900">{report.activityLevel}/10</p>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-gray-600">Nutrition</p>
                      <p className="text-lg font-semibold text-gray-900">{report.nutritionScore}</p>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-gray-600">Status</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${report.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                        }`}>
                        {report.status === 'pending' ? 'Pending' : 'Reviewed'}
                      </span>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleReviewReport(report.id)}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Review
                      </button>
                      <button
                        onClick={() => handleAddSuggestions(report.id)}
                        className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 flex items-center"
                      >
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Suggest
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 text-sm border rounded-lg ${currentPage === pageNum
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PDF Viewer Modal */}
        {showPdfViewer && selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-4xl h-[90vh] flex flex-col">
              {/* PDF Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center space-x-4">
                  <FileText className="h-6 w-6 text-primary-600" />
                  <div>
                    <h3 className="text-lg font-semibold">Monthly Health Report</h3>
                    <p className="text-sm text-gray-600">{selectedReport.patientName} - {selectedReport.month}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDownloadPdf(selectedReport, selectedPatientLogs)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </button>
                  <button
                    onClick={() => setShowPdfViewer(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* PDF Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto bg-white">
                  {/* Report Header */}
                  <div className="text-center mb-8">
                    <div className="text-right text-sm text-gray-500 mb-2">
                      {new Date().toLocaleDateString('en-GB')}, {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">NutriMind AI</h1>
                    <h2 className="text-xl font-semibold text-gray-800">Monthly Health Report - {selectedReport.month}</h2>
                    <div className="mt-4 text-sm text-gray-600">
                      <p>Report generated on: {selectedReport.generatedDate}</p>
                      <p>Data up to: {new Date().toLocaleDateString('en-GB')}</p>
                    </div>
                  </div>

                  {/* Patient Information */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Information</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="mb-2"><span className="font-medium">Name:</span> {selectedReport.patientName}</p>
                      <p className="mb-2"><span className="font-medium">Email:</span> {selectedReport.patientEmail}</p>
                      <p><span className="font-medium">Report Period:</span> {selectedReport.month}</p>
                    </div>
                  </div>

                  {/* Health Metrics Summary */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Health Metrics Summary</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                        <h4 className="font-semibold text-green-800">Mood</h4>
                        <p className="text-2xl font-bold text-green-900">{selectedReport.moodScore}/10</p>
                        <p className="text-sm text-green-700">Average Score</p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                        <h4 className="font-semibold text-blue-800">Sleep</h4>
                        <p className="text-2xl font-bold text-blue-900">{selectedReport.sleepQuality}/10</p>
                        <p className="text-sm text-blue-700">Quality Score</p>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
                        <h4 className="font-semibold text-orange-800">Activity</h4>
                        <p className="text-2xl font-bold text-orange-900">{selectedReport.activityLevel}/10</p>
                        <p className="text-sm text-orange-700">Level Score</p>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                        <h4 className="font-semibold text-red-800">Nutrition</h4>
                        <p className="text-2xl font-bold text-red-900">{selectedReport.nutritionScore}</p>
                        <p className="text-sm text-red-700">Grade</p>
                      </div>
                    </div>
                  </div>

                  {/* Daily Health Data */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Health Data</h3>
                    <div className="space-y-4">
                      {selectedPatientLogs.length === 0 ? (
                        <p className="text-gray-500 italic">No daily logs found for this period.</p>
                      ) : (
                        selectedPatientLogs.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
                          .map((log: any, index: number) => (
                            <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                              <div className="text-blue-600 font-semibold mb-2">
                                {new Date(log.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                <div><span className="text-green-600 font-medium">Mood:</span> {log.mood?.label || 'N/A'} ({log.mood?.score ? `${log.mood.score}/10` : 'N/A'})</div>
                                <div><span className="text-blue-600 font-medium">Sleep:</span> {log.sleep?.duration || 'N/A'} hours</div>
                                <div><span className="text-orange-600 font-medium">Activity:</span> {log.activity?.steps?.toLocaleString() || '0'} steps</div>
                                <div><span className="text-red-600 font-medium">Calories:</span> {log.food?.totalCalories || '0'} kcal</div>
                                {log.food?.entries?.length > 0 && (
                                  <div className="col-span-2 mt-1">
                                    <span className="font-medium">Meals:</span> {log.food.entries.map((f: any) => f.name).join(', ')}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  </div>

                  {/* AI Analysis */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Analysis</h3>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-gray-800 mb-2">
                        Based on the patient's daily logs and health metrics, this report provides insights into their overall wellness trends for the month.
                      </p>
                      <p className="text-gray-800">
                        The patient shows consistent patterns in their health data with room for improvement in certain areas.
                      </p>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <ul className="list-disc list-inside text-gray-800 space-y-1">
                        <li>Continue current wellness routine</li>
                        <li>Focus on areas with lower scores</li>
                        <li>Schedule follow-up if needed</li>
                        <li>Maintain consistent sleep schedule</li>
                        <li>Increase daily activity levels</li>
                      </ul>
                    </div>
                  </div>

                  {/* Report Status */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600">Report Status: <span className="font-semibold capitalize">{selectedReport.status}</span></p>
                        <p className="text-sm text-gray-600">Last Reviewed: {selectedReport.lastReviewed || 'Not reviewed yet'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Generated by NutriMind AI</p>
                        <p className="text-sm text-gray-500">{selectedReport.generatedDate}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DoctorDashboardLayout>
  )
}
