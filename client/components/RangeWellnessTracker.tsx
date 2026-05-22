'use client'

import { useState, useEffect, useMemo } from 'react'
import { logsAPI, DailyLog } from '@/lib/api'
import { Calendar, TrendingUp, Activity, Moon, Sun, ChevronRight, BarChart2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts'

export default function RangeWellnessTracker() {
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [logs, setLogs] = useState<DailyLog[]>([])
    const [loading, setLoading] = useState(false)
    const [totalPoints, setTotalPoints] = useState(0)

    useEffect(() => {
        // Set default range to last 14 days for a better initial view
        const end = new Date()
        const start = new Date()
        start.setDate(start.getDate() - 14)

        setEndDate(end.toISOString().split('T')[0])
        setStartDate(start.toISOString().split('T')[0])
    }, [])

    const calculateDayPoints = (log: any) => {
        const moodScore = typeof log.mood === 'object' ? (log.mood?.score || 0) : (Number(log.mood) || 0)
        const sleepQuality = typeof log.sleep === 'object' ? (log.sleep?.quality || 0) : 0
        const steps = typeof log.activity === 'object' ? (log.activity?.steps || 0) : (Number(log.steps) || 0)

        return (moodScore * 2) + (sleepQuality * 2) + Math.floor(steps / 500)
    }

    useEffect(() => {
        const fetchLogs = async () => {
            if (!startDate || !endDate) return

            try {
                setLoading(true)
                const { logs } = await logsAPI.getLogs(1, 100, startDate, endDate)

                // Sort logs by date ascending for the chart
                const sortedLogs = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                setLogs(sortedLogs)

                const points = sortedLogs.reduce((acc, log) => acc + calculateDayPoints(log), 0)
                setTotalPoints(points)
            } catch (error) {
                console.error('Failed to fetch logs range:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchLogs()
    }, [startDate, endDate])

    const chartData = useMemo(() => {
        return logs.map(log => ({
            date: new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            points: calculateDayPoints(log),
            rawDate: log.date
        }))
    }, [logs])

    return (
        <div className="space-y-6">
            {/* Header & Stats Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary-50 rounded-xl">
                            <TrendingUp className="h-6 w-6 text-primary-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Range Wellness Analysis</h2>
                            <p className="text-sm text-gray-500">Insights for your selected period</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 px-6 py-3 bg-gray-50 rounded-2xl">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-primary-600">
                                {loading ? '...' : totalPoints}
                            </div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Points</div>
                        </div>
                        <div className="w-px h-8 bg-gray-200" />
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">
                                {loading ? '...' : logs.length}
                            </div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Days Logged</div>
                        </div>
                    </div>
                </div>

                {/* Date Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400 uppercase ml-1">Start Date</label>
                        <div className="relative group">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="pl-10 w-full h-11 bg-gray-50 border-transparent rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:bg-white focus:border-primary-500 transition-all text-sm font-medium"
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400 uppercase ml-1">End Date</label>
                        <div className="relative group">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="pl-10 w-full h-11 bg-gray-50 border-transparent rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:bg-white focus:border-primary-500 transition-all text-sm font-medium"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Chart Card */}
            {logs.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <BarChart2 className="h-5 w-5 text-gray-400" />
                        <h3 className="font-bold text-gray-900">Points Progression</h3>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 500 }}
                                    dy={10}
                                />
                                <YAxis hide domain={[0, 'auto']} />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: 'none',
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                        padding: '8px 12px'
                                    }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 600, color: '#0ea5e9' }}
                                    labelStyle={{ fontSize: '10px', color: '#64748b', marginBottom: '4px' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="points"
                                    stroke="#0ea5e9"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorPoints)"
                                    animationDuration={1500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            )}

            {/* Daily Logs Table/List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="font-bold text-gray-900">Activity History</h3>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{logs.length} entries FOUND</span>
                </div>

                <div className="space-y-3">
                    <AnimatePresence mode="popLayout">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12 space-y-3 bg-white rounded-2xl border border-gray-100">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
                                <p className="text-sm text-gray-500 font-medium">Analyzing your data...</p>
                            </div>
                        ) : logs.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center py-16 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200"
                            >
                                <Calendar className="h-10 w-10 text-gray-300 mb-3" />
                                <p className="text-sm text-gray-500 font-medium">No activity recorded for this period</p>
                            </motion.div>
                        ) : (
                            logs.map((log, idx) => {
                                const dayPoints = calculateDayPoints(log)
                                const moodScore = typeof log.mood === 'object' ? (log.mood?.score || 0) : (Number(log.mood) || 0)

                                return (
                                    <motion.div
                                        key={log._id || log.id || log.date}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="group bg-white p-4 rounded-2xl border border-gray-100 hover:border-primary-100 hover:shadow-md hover:shadow-primary-500/5 transition-all flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col items-center justify-center min-w-[52px] h-[52px] bg-gray-50 rounded-xl group-hover:bg-primary-50 transition-colors">
                                                <span className="text-[10px] font-bold text-gray-400 group-hover:text-primary-400 uppercase">
                                                    {new Date(log.date).toLocaleDateString('en-US', { month: 'short' })}
                                                </span>
                                                <span className="text-lg font-bold text-gray-700 group-hover:text-primary-700 leading-none mt-0.5">
                                                    {new Date(log.date).getDate()}
                                                </span>
                                            </div>

                                            <div className="space-y-1">
                                                <div className="flex items-center gap-3">
                                                    <span className="flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">
                                                        <Sun className="h-3 w-3 text-yellow-500" /> {moodScore}/10
                                                    </span>
                                                    <span className="flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">
                                                        <Moon className="h-3 w-3 text-indigo-500" /> {log.sleep?.duration || 0}h
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-400 font-medium line-clamp-1 max-w-[200px]">
                                                    {log.notes || 'No notes for this entry'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <div className="text-sm font-bold text-gray-900">+{dayPoints}</div>
                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Points</div>
                                            </div>
                                            <div className="p-2 text-gray-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all">
                                                <ChevronRight className="h-4 w-4" />
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            }).reverse() // Most recent first in list
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}

