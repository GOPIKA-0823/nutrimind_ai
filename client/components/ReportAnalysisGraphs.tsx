'use client'

import React from 'react'
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    AreaChart,
    Area
} from 'recharts'
import { motion } from 'framer-motion'
import { Activity, Heart, Moon, TrendingUp } from 'lucide-react'

// Updated interface to match the structure from ReportsContent.tsx
interface DailyLog {
    date: string
    mood: { score: number }
    sleep: { duration: number }
    activity: { steps: number }
    food?: {
        totalCalories: number
        entries: Array<{ name: string; calories: number }>
    }
}

interface ReportAnalysisGraphsProps {
    logs: any[] // Using any to be flexible with the incoming data structure
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload
        return (
            <div className="bg-white p-4 border border-gray-100 shadow-lg rounded-xl text-sm z-50">
                <p className="font-semibold text-gray-900 mb-2">{`Day ${data.formattedDate}`}</p>
                <div className="space-y-2">
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center space-x-2">
                            <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-gray-600 capitalize">
                                {entry.name === 'calories' ? 'Calories' : entry.name}:
                            </span>
                            <span className="font-medium text-gray-900">
                                {typeof entry.value === 'number' ? entry.value.toFixed(0) : entry.value}
                            </span>
                        </div>
                    ))}

                    {/* Show Food Breakdown if available */}
                    {data.food && data.food.entries && data.food.entries.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="font-semibold text-xs text-gray-500 mb-1">FOOD LOGS</p>
                            <div className="space-y-1 max-h-40 overflow-y-auto">
                                {data.food.entries.map((f: any, i: number) => (
                                    <div key={i} className="flex justify-between text-xs">
                                        <span className="text-gray-600 mr-2">{f.name}</span>
                                        <span className="text-gray-400">{f.calories}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )
    }
    return null
}

export default function ReportAnalysisGraphs({ logs }: ReportAnalysisGraphsProps) {
    // Sort logs by date to ensure correct order
    const sortedLogs = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Format date for x-axis and flatten data structure for Recharts
    // This step is CRITICAL to fix the "Objects are not valid as React child" error
    const dataObject = sortedLogs.map(log => ({
        ...log,
        formattedDate: new Date(log.date).getDate().toString(), // Show day number
        moodScore: typeof log.mood === 'object' ? log.mood.score : log.mood, // Handle object or number
        sleepDuration: typeof log.sleep === 'object' ? log.sleep.duration : log.sleep, // Handle object or number
        steps: typeof log.activity === 'object' ? log.activity.steps : (log.steps || 0), // Handle nested or flat steps
        calories: log.food?.totalCalories || log.calories || 0 // Handle nested or flat calories
    }))

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-6 w-6 text-primary-600" />
                <h3 className="text-xl font-bold text-gray-900">Report Analysis</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Mood Analysis */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-2">
                            <div className="p-2 bg-pink-100 rounded-lg">
                                <Heart className="h-5 w-5 text-pink-600" />
                            </div>
                            <h4 className="font-semibold text-gray-900">Mood Trends</h4>
                        </div>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Monthly</span>
                    </div>

                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dataObject}>
                                <defs>
                                    <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ec4899" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="formattedDate"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                    interval={4}
                                />
                                <YAxis
                                    hide
                                    domain={[0, 10]}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    labelStyle={{ color: '#6b7280' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="moodScore"
                                    name="Mood Score"
                                    stroke="#ec4899"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorMood)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Sleep Analysis */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-2">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <Moon className="h-5 w-5 text-indigo-600" />
                            </div>
                            <h4 className="font-semibold text-gray-900">Sleep Patterns</h4>
                        </div>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Hours</span>
                    </div>

                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dataObject}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="formattedDate"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                    interval={4}
                                />
                                <YAxis
                                    hide
                                    domain={[0, 12]}
                                />
                                <Tooltip
                                    cursor={{ fill: '#e0e7ff', opacity: 0.4 }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: any) => [`${value} hrs`, 'Duration']}
                                />
                                <Bar
                                    dataKey="sleepDuration"
                                    name="Sleep Duration"
                                    fill="#6366f1"
                                    radius={[4, 4, 0, 0]}
                                    barSize={8}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Activity Analysis */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-2">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Activity className="h-5 w-5 text-green-600" />
                            </div>
                            <h4 className="font-semibold text-gray-900">Activity & Nutrition</h4>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                <span>Steps</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <div className="w-3 h-3 rounded-full bg-orange-400"></div>
                                <span>Calories</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dataObject}>
                                <defs>
                                    <linearGradient id="colorSteps" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="formattedDate"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                    interval={2}
                                />
                                <YAxis
                                    yAxisId="left"
                                    orientation="left"
                                    stroke="#22c55e"
                                    hide
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    stroke="#fb923c"
                                    hide
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="steps"
                                    name="Steps"
                                    stroke="#22c55e"
                                    fill="url(#colorSteps)"
                                    strokeWidth={2}
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="calories"
                                    name="Calories"
                                    stroke="#fb923c"
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    dot={false}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
