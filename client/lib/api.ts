import axios, { AxiosResponse, AxiosError } from 'axios'

// API Configuration
const normalizeUrl = (url: string) => url.replace(/\/$/, '')

const resolveApiBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return normalizeUrl(process.env.NEXT_PUBLIC_API_URL)
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${normalizeUrl(window.location.origin)}/api`
  }

  if (process.env.API_URL) {
    return normalizeUrl(process.env.API_URL)
  }

  return 'http://localhost:5000/api'
}

const API_BASE_URL = resolveApiBaseUrl()

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/auth/login'
    }
    return Promise.reject(error)
  }
)

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface User {
  id?: string
  _id?: string
  name: string
  email: string
  role: 'user' | 'doctor'
  avatar?: string
  createdAt?: string
  updatedAt?: string
  isActive?: boolean
  profile?: Record<string, any>
  phone?: string
  specialization?: string
  experience?: string
  licenseNumber?: string
  hospital?: string
  address?: string
  bio?: string
  consultationFee?: string
  gamification?: {
    points: number
    badges: string[]
    streak: number
    level: number
  }
}

export interface AdminUser {
  id?: string
  _id?: string
  name: string
  email: string
  role: 'admin'
  lastLoginAt?: string
  createdAt?: string
  updatedAt?: string
}

export interface LoginResponse {
  token: string
  user: User
}

export interface AdminLoginResponse {
  token: string
  admin: AdminUser
}

export interface DailyLog {
  _id?: string
  id?: string
  userId: string
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
  createdAt?: string
  updatedAt?: string
}

export interface FoodEntry {
  _id?: string
  name: string
  calories: number
  protein?: number
  carbs?: number
  fat?: number
  fiber?: number
  sugar?: number
  sodium?: number
  quantity?: number
  unit?: string
}

export interface MonthlyReport {
  _id?: string
  userId: string
  month: number
  year: number
  insights: {
    mood: any
    sleep: any
    activity: any
    nutrition: any
  }
  recommendations: string[]
  doctorSuggestions?: any[]
  createdAt?: string
  updatedAt?: string
}

// Auth API Functions
export const authAPI = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', { email, password })
    return response.data
  },

  register: async (name: string, email: string, password: string, role: 'user' | 'doctor' = 'user'): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/register', { name, email, password, role })
    return response.data
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout')
  },

  refreshToken: async (): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/refresh')
    return response.data
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/forgot-password', { email })
    return response.data
  },

  resetPassword: async (token: string, password: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/reset-password', { token, password })
    return response.data
  }
}

export const adminAPI = {
  login: async (email: string, password: string): Promise<AdminLoginResponse> => {
    const response = await api.post<AdminLoginResponse>('/admin/auth/login', { email, password })
    return response.data
  },

  register: async (name: string, email: string, password: string): Promise<AdminLoginResponse> => {
    const response = await api.post<AdminLoginResponse>('/admin/auth/register', { name, email, password })
    return response.data
  },

  getProfile: async (): Promise<AdminUser> => {
    const response = await api.get<{ admin: AdminUser }>('/admin/me')
    return response.data.admin
  },

  getOverview: async (): Promise<{ summary: { doctors: number; patients: number; appointments: number }; recentAppointments: any[] }> => {
    const response = await api.get('/admin/overview')
    return response.data
  },

  getDoctors: async (): Promise<{ doctors: User[] }> => {
    const response = await api.get<{ doctors: User[] }>('/admin/doctors')
    return response.data
  },

  createDoctor: async (payload: { name: string; email: string; password: string }): Promise<{ message: string; doctor: User }> => {
    const response = await api.post<{ message: string; doctor: User }>('/admin/doctors', payload)
    return response.data
  },

  updateDoctorStatus: async (id: string, isActive: boolean): Promise<{ message: string; doctor: User }> => {
    const response = await api.patch<{ message: string; doctor: User }>(`/admin/doctors/${id}/status`, { isActive })
    return response.data
  },

  deleteDoctor: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/admin/doctors/${id}`)
    return response.data
  },

  getPatients: async (): Promise<{ patients: User[] }> => {
    const response = await api.get<{ patients: User[] }>('/admin/patients')
    return response.data
  },

  createPatient: async (payload: { name: string; email: string; password: string }): Promise<{ message: string; patient: User }> => {
    const response = await api.post<{ message: string; patient: User }>('/admin/patients', payload)
    return response.data
  },

  deletePatient: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/admin/patients/${id}`)
    return response.data
  },

  getAppointments: async (): Promise<{ appointments: any[] }> => {
    const response = await api.get<{ appointments: any[] }>('/admin/appointments')
    return response.data
  }
}

// User API Functions
export const userAPI = {
  getProfile: async (): Promise<User> => {
    const response = await api.get<{ user: User }>('/users/profile')
    return response.data.user
  },

  // Get list of active doctors (for users to choose/see)
  getDoctors: async (): Promise<{ doctors: User[] }> => {
    const response = await api.get<{ doctors: User[] }>('/users/doctors')
    return response.data
  },

  // Get doctor's patients (for doctor dashboard)
  getMyPatients: async (): Promise<{ patients: User[] }> => {
    const response = await api.get<{ patients: User[] }>('/users/patients')
    return response.data
  },

  updateProfile: async (updates: Partial<User>): Promise<User> => {
    const response = await api.put<{ user: User }>('/users/profile', updates)
    return response.data.user
  },

  uploadAvatar: async (file: File): Promise<{ avatar: string }> => {
    const formData = new FormData()
    formData.append('avatar', file)
    const response = await api.post<{ avatar: string }>('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  deleteAccount: async (): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>('/users/profile')
    return response.data
  }
}

// Daily Logs API Functions
export const logsAPI = {
  getLogs: async (page: number = 1, limit: number = 30, startDate?: string, endDate?: string): Promise<{ logs: DailyLog[] }> => {
    let url = `/logs?page=${page}&limit=${limit}`
    if (startDate) url += `&startDate=${startDate}`
    if (endDate) url += `&endDate=${endDate}`
    const response = await api.get<{ logs: DailyLog[] }>(url)
    return response.data
  },

  getLogByDate: async (date: string): Promise<DailyLog | null> => {
    try {
      const response = await api.get<{ log: DailyLog }>(`/logs/date/${date}`)
      return response.data.log
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null
      }
      throw error
    }
  },

  createLog: async (logData: Omit<DailyLog, '_id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<DailyLog> => {
    const response = await api.post<{ message: string, log: DailyLog }>('/logs', logData)
    return response.data.log
  },

  updateLog: async (logId: string, updates: Partial<DailyLog>): Promise<DailyLog> => {
    const response = await api.put<{ message: string, log: DailyLog }>(`/logs/${logId}`, updates)
    return response.data.log
  },

  deleteLog: async (logId: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/logs/${logId}`)
    return response.data
  },

  getStats: async (period: 'week' | 'month' | 'year' = 'month'): Promise<any> => {
    const response = await api.get<any>(`/logs/stats?period=${period}`)
    return response.data
  }
}

// Food API Functions
// Reports API Functions
export const reportsAPI = {
  getMonthlyReport: async (month: number, year: number): Promise<MonthlyReport | null> => {
    try {
      const response = await api.get<MonthlyReport>(`/reports/monthly/${year}/${month}`)
      return response.data
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null
      }
      throw error
    }
  },

  generateMonthlyReport: async (month: number, year: number): Promise<{ message: string; report: MonthlyReport }> => {
    const response = await api.post<{ message: string; report: MonthlyReport }>('/reports/generate', { month, year })
    return response.data
  },

  getAllReports: async (year?: number, month?: number): Promise<{ reports: MonthlyReport[] }> => {
    const query = new URLSearchParams()
    if (year) query.append('year', year.toString())
    if (month) query.append('month', month.toString())
    const queryString = query.toString() ? `?${query.toString()}` : ''
    const response = await api.get<{ reports: MonthlyReport[] }>(`/reports${queryString}`)
    return response.data
  }
}

// Food API Functions
export const foodAPI = {
  // New generic search for global database
  search: async (query: string): Promise<any[]> => {
    const response = await api.get<any[]>(`/foods/search?query=${encodeURIComponent(query)}`)
    return response.data
  },

  // New generic add for global database
  add: async (data: any): Promise<any> => {
    const response = await api.post<any>('/foods', data)
    return response.data
  },

  // Legacy/Specific Logs Food Methods
  searchFood: async (query: string): Promise<FoodEntry[]> => {
    const response = await api.get<FoodEntry[]>(`/logs/food/search?q=${encodeURIComponent(query)}`)
    return response.data
  },

  addFoodEntry: async (logId: string, foodEntry: Omit<FoodEntry, '_id'>): Promise<DailyLog> => {
    const payload: any = {
      name: foodEntry.name,
      mealType: (foodEntry as any).mealType || 'snack',
      timestamp: (foodEntry as any).timestamp || new Date().toISOString(),
      nutrition: { calories: Number(foodEntry.calories ?? 0) || 0 }
    }
    const response = await api.post<{ message: string; foodEntry: any }>(`/logs/${logId}/food`, payload)
    const updated = await api.get<DailyLog>(`/logs/${logId}` as any)
    return (updated as any).data || (response as any).data
  },

  updateFoodEntry: async (logId: string, foodEntryId: string, updates: Partial<FoodEntry>): Promise<DailyLog> => {
    const response = await api.put<DailyLog>(`/logs/${logId}/food/${foodEntryId}`, updates)
    return response.data
  },

  deleteFoodEntry: async (logId: string, foodEntryId: string): Promise<DailyLog> => {
    const response = await api.delete<DailyLog>(`/logs/${logId}/food/${foodEntryId}`)
    return response.data
  },

  recognizeFood: async (imageFile: File): Promise<{ predictions: any[], confidence: number }> => {
    const formData = new FormData()
    formData.append('image', imageFile)
    const response = await api.post<{ predictions: any[], confidence: number }>('/ai/food-recognition', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }
}

// AI API Functions
export const aiAPI = {
  getInsights: async (period: 'week' | 'month' = 'month'): Promise<any> => {
    const response = await api.get<any>(`/ai/insights?period=${period}`)
    return response.data
  },

  getMoodCorrelation: async (): Promise<any> => {
    const response = await api.get<any>('/ai/mood-correlation')
    return response.data
  },

  getRecommendations: async (): Promise<string[]> => {
    const response = await api.get<string[]>('/ai/recommendations')
    return response.data
  },

  analyzeVoiceNote: async (audioFile: File): Promise<{ text: string, sentiment: any }> => {
    const formData = new FormData()
    formData.append('audio', audioFile)
    const response = await api.post<{ text: string, sentiment: any }>('/ai/voice-analysis', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // New: chat assistant invoking backend AI route
  chat: async (message: string, context: Record<string, any> = {}): Promise<{ text: string; suggestions: string[] }> => {
    const response = await api.post<{ message: string; response: { text: string; suggestions: string[] } }>(
      '/ai/chat',
      { message, context }
    )
    return response.data.response
  },

  // New: generate higher-level insights
  generateInsights: async (category?: 'nutrition' | 'mood' | 'activity', timeframe: 'week' | 'month' = 'week'): Promise<any> => {
    const response = await api.post<any>('/ai/generate-insights', { category, timeframe })
    return response.data
  }
}

// Appointments API Functions (for doctor integration)
export const appointmentsAPI = {
  getAppointments: async (params?: { status?: string; type?: string; upcoming?: boolean }): Promise<{ appointments: any[] }> => {
    const query = new URLSearchParams()
    if (params?.status) query.append('status', params.status)
    if (params?.type) query.append('type', params.type)
    if (typeof params?.upcoming !== 'undefined') query.append('upcoming', String(params.upcoming))

    const queryString = query.toString() ? `?${query.toString()}` : ''
    const response = await api.get<{ appointments: any[] }>(`/appointments${queryString}`)
    return response.data
  },

  bookAppointment: async (patientId: string, doctorId: string, date: string, type: 'video' | 'phone'): Promise<any> => {
    const response = await api.post<any>('/appointments', {
      patient: patientId,
      doctor: doctorId,
      type,
      scheduledAt: date,
      duration: 30,
      agenda: ['General consultation']
    })
    return response.data
  },

  bookAppointmentWithPayment: async (
    patientId: string,
    doctorId: string,
    date: string,
    type: 'video' | 'phone',
    payment: { paymentMethod: string; amount: number; currency: string; transactionId?: string }
  ): Promise<any> => {
    const response = await api.post<any>('/appointments', {
      patient: patientId,
      doctor: doctorId,
      type,
      scheduledAt: date,
      duration: 30,
      agenda: ['General consultation'],
      billing: {
        amount: payment.amount,
        currency: payment.currency,
        status: 'paid',
        paymentMethod: payment.paymentMethod,
        paidAt: new Date().toISOString()
      },
      transactionId: payment.transactionId
    })
    return response.data
  },

  cancelAppointment: async (appointmentId: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/appointments/${appointmentId}`)
    return response.data
  },

  updateAppointment: async (appointmentId: string, updates: Record<string, any>): Promise<{ message: string; appointment: any }> => {
    const response = await api.put<{ message: string; appointment: any }>(`/appointments/${appointmentId}`, updates)
    return response.data
  }
}

// Doctor API Functions
export const doctorAPI = {
  getStats: async (): Promise<{ totalPatients: number; pendingReports: number; monthlyConsultations: number; avgPatientScore: number }> => {
    const response = await api.get<{ totalPatients: number; pendingReports: number; monthlyConsultations: number; avgPatientScore: number }>('/doctors/stats')
    return response.data
  },

  getRecentPatients: async (limit?: number): Promise<{ patients: Array<{ id: string; _id: string; name: string; email: string; lastReport: string | null; score: number; status: string }> }> => {
    const params = limit ? `?limit=${limit}` : ''
    const response = await api.get<{ patients: Array<{ id: string; _id: string; name: string; email: string; lastReport: string | null; score: number; status: string }> }>(`/doctors/recent-patients${params}`)
    return response.data
  },

  getUpcomingConsultations: async (limit?: number): Promise<{ consultations: Array<{ id: string; patient: string; patientId: string; date: string; time: string; type: string; appointmentId: string }> }> => {
    const params = limit ? `?limit=${limit}` : ''
    const response = await api.get<{ consultations: Array<{ id: string; patient: string; patientId: string; date: string; time: string; type: string; appointmentId: string }> }>(`/doctors/upcoming-consultations${params}`)
    return response.data
  },

  getReports: async (): Promise<{
    reports: Array<{
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
      reportData: any
    }>
  }> => {
    const response = await api.get<{
      reports: Array<{
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
        reportData: any
      }>
    }>('/doctors/reports')
    return response.data
  },

  getPatientDetails: async (patientId: string): Promise<{
    patient: {
      id: string
      _id: string
      name: string
      email: string
      profile: {
        age?: number
        gender?: string
        height?: number
        weight?: number
        medicalConditions: string[]
        medications: string[]
        allergies: string[]
        fitnessLevel?: string
        goals: string[]
      }
      gamification: any
      createdAt: string
      updatedAt: string
    }
  }> => {
    const response = await api.get<{
      patient: {
        id: string
        _id: string
        name: string
        email: string
        profile: {
          age?: number
          gender?: string
          height?: number
          weight?: number
          medicalConditions: string[]
          medications: string[]
          allergies: string[]
          fitnessLevel?: string
          goals: string[]
        }
        gamification: any
        createdAt: string
        updatedAt: string
      }
    }>(`/doctors/patients/${patientId}`)
    return response.data
  },

  getPatientLogs: async (patientId: string, params?: { startDate?: string; endDate?: string; limit?: number }): Promise<{ logs: DailyLog[] }> => {
    const queryParams = new URLSearchParams()
    if (params?.startDate) queryParams.append('startDate', params.startDate)
    if (params?.endDate) queryParams.append('endDate', params.endDate)
    if (params?.limit) queryParams.append('limit', params.limit.toString())

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ''
    const response = await api.get<{ logs: DailyLog[] }>(`/doctors/patients/${patientId}/logs${queryString}`)
    return response.data
  }
}

// Messages API Functions
export interface ChatMessage {
  _id?: string
  id?: string
  conversationId: string
  sender: {
    _id: string
    name: string
    email: string
    role: string
  }
  receiver: {
    _id: string
    name: string
    email: string
    role: string
  }
  message: string
  type: 'text' | 'suggestion' | 'system'
  suggestionId?: string
  isRead: boolean
  readAt?: string
  createdAt: string
  updatedAt: string
}

export const messagesAPI = {
  getConversation: async (participantId: string): Promise<{ messages: ChatMessage[] }> => {
    const response = await api.get<{ messages: ChatMessage[] }>(`/messages/conversation/${participantId}`)
    return response.data
  },

  sendMessage: async (receiverId: string, message: string, type: 'text' | 'suggestion' | 'system' = 'text', suggestionId?: string): Promise<{ message: ChatMessage }> => {
    const response = await api.post<{ message: ChatMessage }>('/messages', {
      receiverId,
      message,
      type,
      suggestionId
    })
    return response.data
  },

  getConversations: async (): Promise<{
    conversations: Array<{
      participant: { id: string; name: string; email: string }
      lastMessage: { message: string; sender: string; timestamp: string } | null
      unreadCount: number
    }>
  }> => {
    const response = await api.get<{
      conversations: Array<{
        participant: { id: string; name: string; email: string }
        lastMessage: { message: string; sender: string; timestamp: string } | null
        unreadCount: number
      }>
    }>('/messages/conversations')
    return response.data
  },

  sendSuggestion: async (patientId: string, suggestionId: string): Promise<{ message: ChatMessage }> => {
    const response = await api.post<{ message: ChatMessage }>('/messages/suggestion', {
      patientId,
      suggestionId
    })
    return response.data
  },

  getSuggestions: async (patientId: string): Promise<{
    suggestions: Array<{
      _id: string
      report: { year: number; month: number }
      suggestions: Array<{
        category: string
        title: string
        description: string
        priority: string
      }>
      createdAt: string
    }>
  }> => {
    const response = await api.get<{
      suggestions: Array<{
        _id: string
        report: { year: number; month: number }
        suggestions: Array<{
          category: string
          title: string
          description: string
          priority: string
        }>
        createdAt: string
      }>
    }>(`/messages/suggestions/${patientId}`)
    return response.data
  }
}

// Utility function to handle API errors
export const handleApiError = (error: any): string => {
  // Handle express-validator style errors
  if (error.response?.data?.errors && Array.isArray(error.response.data.errors) && error.response.data.errors.length > 0) {
    return error.response.data.errors[0].msg
  }

  if (error.response?.data?.message) {
    return error.response.data.message
  }
  if (error.message) {
    return error.message
  }
  return 'An unexpected error occurred'
}

// Export the configured axios instance for custom requests
export { api }
export default api
