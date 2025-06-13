import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para adicionar token de autenticação
api.interceptors.request.use((config) => {
  console.log('🔍 axios interceptor request:', config.url)
  console.log('🔍 axios interceptor: método:', config.method?.toUpperCase())
  
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('admin_token')
    console.log('🔍 axios interceptor: token encontrado:', !!token)
    console.log('🔍 axios interceptor: token valor:', token ? token.substring(0, 20) + '...' : 'null')
    console.log('🔍 axios interceptor: token completo:', token)
    console.log('🔍 axios interceptor: localStorage completo:', {
      admin_token: !!localStorage.getItem('admin_token'),
      admin_data: !!localStorage.getItem('admin_data')
    })
    
    if (token) {
      // Remover aspas extras se existirem
      const cleanToken = token.replace(/^"|"$/g, '')
      config.headers.Authorization = `Bearer ${cleanToken}`
      console.log('🔍 axios interceptor: Authorization header adicionado')
      console.log('🔍 axios interceptor: token limpo:', cleanToken.substring(0, 20) + '...')
      console.log('🔍 axios interceptor: headers finais:', config.headers)
    } else {
      console.log('🔍 axios interceptor: nenhum token encontrado, requisição sem Authorization')
    }
  } else {
    console.log('🔍 axios interceptor: window não disponível (SSR)')
  }
  return config
})

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => {
    console.log('axios interceptor response:', response.status, response.config.url)
    return response
  },
  (error) => {
    console.log('axios interceptor error:', error.response?.status, error.config?.url)
    // Comentando o redirecionamento automático para evitar loops
    // if (error.response?.status === 401 && typeof window !== 'undefined') {
    //   console.log('axios interceptor: erro 401 detectado')
    //   // Não fazer redirecionamento automático aqui, deixar para o componente
    //   // localStorage.removeItem('admin_token')
    //   // localStorage.removeItem('admin_data')
    //   // window.location.href = '/login'
    // }
    return Promise.reject(error)
  }
)

// Tipos para as respostas da API
export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message?: string
  error?: string
}

// Tipos para usuários
export interface User {
  id: string
  name: string
  email: string
  password?: string
  avatarUrl?: string | null
  isActive: boolean
  emailVerified?: boolean
  phoneNumber?: string | null
  timezone?: string
  language?: string
  preferences?: Record<string, any>
  planId?: string
  plan?: Plan
  createdAt: string
  updatedAt: string
  lastLoginAt?: string | null
  babies?: Baby[]
  gamification?: {
    id: string
    userId: string
    points: number
    level: number
    badges: any[]
    streaks: Record<string, any>
    achievements: any[]
    createdAt: string
    updatedAt: string
  }
  subscription?: any | null
}

// Tipos para planos
export interface Plan {
  id: string
  name: string
  price: number
  yearlyPrice?: number
  features: string[]
  userLimit: number
  memoryLimit?: number
  photoQuality?: string
  familySharing?: number
  exportFeatures?: boolean
  prioritySupport?: boolean
  aiFeatures?: boolean
  offlineMode?: boolean
  stripePriceId: string
  stripeYearlyPriceId?: string | null
  isActive: boolean
  sortOrder?: number
  createdAt: string
  updatedAt: string
}

// Tipos para bebês
export interface Baby {
  id: string
  name: string
  gender: 'male' | 'female'
  birthDate: string
  photoUrl?: string
  userId: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Tipos para gamificação
export interface GamificationRule {
  id: string
  name: string
  description: string
  points: number
  condition: string
  badgeIcon?: string
  category?: string
  isActive: boolean
  sortOrder?: number
  createdAt: string
  updatedAt: string
}

// Tipos para templates de notificação
export interface NotificationTemplate {
  id: string
  name: string
  subject: string
  body: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Tipos para landing page - CORRIGIDO
export interface LandingPageContent {
  id: number
  heroTitle: string
  heroSubtitle: string
  heroImage?: string
  features: Array<{
    title: string
    description: string
    icon?: string
  }>
  testimonials: Array<{
    name: string
    text: string
    rating: number
    avatar?: string
  }>
  faq: Array<{
    question: string
    answer: string
  }>
  stats: Array<{
    label: string
    value: string
    description: string
  }>
  ctaText?: string
  ctaButtonText?: string
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string
  updatedAt: string
}

// Tipos para analytics
export interface AnalyticsData {
  totalUsers: number
  activeUsers: number
  newUsers: number
  totalRevenue: number
  monthlyRevenue: number
  subscriptionStats: {
    basic: number
    premium: number
    family: number
  }
  engagementStats: {
    dailyActive: number
    weeklyActive: number
    monthlyActive: number
  }
}

// Tipo para a resposta real da API do dashboard
export interface DashboardApiResponse {
  users: {
    total: number
    newThisMonth: number
  }
  plans: {
    total: number
    activeSubscriptions: number
  }
  revenue: {
    total: number
    monthly: number
  }
}

// Funções da API
export const adminApi = {
  // Autenticação
  login: async (email: string, password: string) => {
    console.log('adminApi.login: iniciando login com:', email)
    try {
      const response = await api.post<ApiResponse<{ token: string; user: any }>>('/api/auth/admin/login', {
        email,
        password,
      })
      console.log('adminApi.login: resposta recebida:', response.data)
      return response.data
    } catch (error) {
      console.error('adminApi.login: erro na requisição:', error)
      throw error
    }
  },

  // Dashboard
  getDashboard: async () => {
    const response = await api.get<ApiResponse<DashboardApiResponse>>('/api/admin/dashboard')
    return response.data
  },

  // Teste de autenticação
  testAuth: async () => {
    console.log('adminApi.testAuth: testando autenticação')
    try {
      const response = await api.get<ApiResponse<any>>('/api/admin/test-auth')
      console.log('adminApi.testAuth: resposta recebida:', response.data)
      return response.data
    } catch (error) {
      console.error('adminApi.testAuth: erro na requisição:', error)
      throw error
    }
  },

  getEngagementAnalytics: async () => {
    const response = await api.get<ApiResponse<any>>('/api/admin/analytics/engagement')
    return response.data
  },

  getSubscriptionAnalytics: async () => {
    const response = await api.get<ApiResponse<any>>('/api/admin/analytics/subscriptions')
    return response.data
  },

  // Usuários
  getUsers: async (params?: { page?: number; limit?: number; search?: string }) => {
    const response = await api.get<ApiResponse<{ users: User[] }>>('/api/admin/users', { params })
    return response.data
  },

  updateUserStatus: async (userId: string, isActive: boolean) => {
    const response = await api.put<ApiResponse<User>>(`/api/admin/users/${userId}/status`, { isActive })
    return response.data
  },

  resetUserGamification: async (userId: string) => {
    const response = await api.post<ApiResponse>(`/api/admin/users/${userId}/reset-gamification`)
    return response.data
  },

  resetUserPassword: async (userId: string, newPassword: string) => {
    const response = await api.post<ApiResponse>(`/api/admin/users/${userId}/reset-password`, { newPassword })
    return response.data
  },

  assignUserPlan: async (userId: string, planId: string) => {
    const response = await api.put<ApiResponse<User>>(`/api/admin/users/${userId}/assign-plan`, { planId })
    return response.data
  },

  // Planos
  getPlans: async () => {
    const response = await api.get<ApiResponse<Plan[]>>('/api/admin/plans')
    return response.data
  },

  createPlan: async (planData: Omit<Plan, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await api.post<ApiResponse<Plan>>('/api/admin/plans', planData)
    return response.data
  },

  updatePlan: async (planId: string, planData: Partial<Plan>) => {
    const response = await api.put<ApiResponse<Plan>>(`/api/admin/plans/${planId}`, planData)
    return response.data
  },

  deletePlan: async (planId: string) => {
    const response = await api.delete<ApiResponse>(`/api/admin/plans/${planId}`)
    return response.data
  },

  updatePlanStatus: async (planId: string, isActive: boolean) => {
    const response = await api.put<ApiResponse<Plan>>(`/api/admin/plans/${planId}/status`, { isActive })
    return response.data
  },

  // Gamificação
  getGamificationRules: async () => {
    const response = await api.get<ApiResponse<GamificationRule[]>>('/api/admin/gamification-rules')
    return response.data
  },

  createGamificationRule: async (ruleData: Omit<GamificationRule, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await api.post<ApiResponse<GamificationRule>>('/api/admin/gamification-rules', ruleData)
    return response.data
  },

  updateGamificationRule: async (ruleId: string, ruleData: Partial<GamificationRule>) => {
    const response = await api.put<ApiResponse<GamificationRule>>(`/api/admin/gamification-rules/${ruleId}`, ruleData)
    return response.data
  },

  deleteGamificationRule: async (ruleId: string) => {
    const response = await api.delete<ApiResponse>(`/api/admin/gamification-rules/${ruleId}`)
    return response.data
  },

  // Templates de notificação
  getNotificationTemplates: async () => {
    const response = await api.get<ApiResponse<NotificationTemplate[]>>('/api/admin/notification-templates')
    return response.data
  },

  updateNotificationTemplate: async (templateId: string, templateData: Partial<NotificationTemplate>) => {
    const response = await api.put<ApiResponse<NotificationTemplate>>(`/api/admin/notification-templates/${templateId}`, templateData)
    return response.data
  },

  // Landing Page
  getLandingPageContent: async () => {
    const response = await api.get<ApiResponse<LandingPageContent>>('/api/admin/landing-page')
    return response.data
  },

  updateLandingPageContent: async (content: Partial<LandingPageContent>) => {
    const response = await api.put<ApiResponse<LandingPageContent>>('/api/admin/landing-page', content)
    return response.data
  },
} 