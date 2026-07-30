import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config: any) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res: any) => res,
  async (err: any) => {
    if (err.response?.status === 401 && localStorage.getItem('refresh_token')) {
      try {
        const refreshToken = localStorage.getItem('refresh_token')
        const res = await axios.post('/api/auth/refresh', { refresh_token: refreshToken })
        const { access_token, refresh_token } = res.data
        localStorage.setItem('access_token', access_token)
        if (refresh_token) localStorage.setItem('refresh_token', refresh_token)
        err.config.headers.Authorization = `Bearer ${access_token}`
        return api(err.config)
      } catch {
        localStorage.clear()
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default api

export interface User {
  id: string
  email: string
  username: string | null
  display_name: string | null
  role: string
  avatar_url: string | null
  is_verified: boolean
  theme: string
  language: string
  compact_mode: boolean
  accent_color: string
  membership_id: string | null
}

export interface Conversation {
  id: string
  title: string
  provider_id: string | null
  model_id: string | null
  mode_id: string | null
  workspace_id: string | null
  is_archived: boolean
  is_pinned: boolean
  is_favorite: boolean
  folder: string | null
  tags: string[]
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  role: string
  content: string
  attachments: any[]
  is_error: boolean
  is_edited: boolean
  model_used: string | null
  tokens_prompt: number
  tokens_completion: number
  cost: number
  latency_ms: number
  created_at: string
}

export const API = {
  auth: {
    login: (email: string, password: string) => api.post('/auth/login', { email, password }),
    signup: (email: string, password: string, name?: string) => api.post('/auth/signup', { email, password, name }),
    getMe: () => api.get('/auth/me'),
    updateMe: (data: any) => api.put('/auth/me', data),
    forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
    resetPassword: (token: string, new_password: string) => api.post('/auth/reset-password', { token, new_password }),
    changePassword: (current_password: string, new_password: string) => api.post('/auth/change-password', { current_password, new_password }),
    getSessions: () => api.get('/auth/sessions'),
    revokeSession: (id: string) => api.delete(`/auth/sessions/${id}`),
    revokeAllSessions: () => api.delete('/auth/sessions'),
  },
  chat: {
    listConversations: (params?: any) => api.get('/chat/conversations', { params }),
    createConversation: (title?: string) => api.post('/chat/conversations', { title }),
    getConversation: (id: string) => api.get(`/chat/conversations/${id}`),
    updateConversation: (id: string, data: any) => api.put(`/chat/conversations/${id}`, data),
    deleteConversation: (id: string) => api.delete(`/chat/conversations/${id}`),
    sendMessage: (id: string, data: any) => api.post(`/chat/conversations/${id}/messages`, data),
    editMessage: (id: string, content: string) => api.put(`/chat/messages/${id}`, { content }),
    deleteMessage: (id: string) => api.delete(`/chat/messages/${id}`),
  },
  providers: {
    list: () => api.get('/providers'),
    create: (data: any) => api.post('/providers', data),
    updateProvider: (id: string, data: any) => api.put(`/providers/${id}`, { data }),
    deleteProvider: (id: string) => api.delete(`/providers/${id}`),
    listModels: (id: string) => api.get(`/providers/${id}/models`),
    addModel: (id: string, data: any) => api.post(`/providers/${id}/models`, data),
    updateModel: (providerId: string, modelId: string, data: any) => api.put(`/providers/${providerId}/models/${modelId}`, { data }),
    deleteModel: (providerId: string, modelId: string) => api.delete(`/providers/${providerId}/models/${modelId}`),
    discoverModels: (id: string) => api.post(`/providers/${id}/discover-models`),
    listBaseUrls: (id: string) => api.get(`/providers/${id}/base-urls`),
    addBaseUrl: (id: string, data: any) => api.post(`/providers/${id}/base-urls`, data),
    addApiKey: (id: string, data: any) => api.post(`/providers/${id}/api-keys`, data),
    listApiKeys: (id: string) => api.get(`/providers/${id}/api-keys`),
    testConnection: (id: string, data?: any) => api.post(`/providers/${id}/test-connection`, data || {}),
    allModels: () => api.get('/providers/all-models'),
    listModes: () => api.get('/providers/modes'),
    createMode: (data: any) => api.post('/providers/modes', data),
    listUserProviders: () => api.get('/providers/user'),
    addUserProvider: (data: any) => api.post('/providers/user', data),
    updateUserProvider: (id: string, data: any) => api.put(`/providers/user/${id}`, { data }),
    deleteUserProvider: (id: string) => api.delete(`/providers/user/${id}`),
    discoverUserModels: (id: string) => api.post(`/providers/user/${id}/discover-models`),
  },
  admin: {
    getDashboard: () => api.get('/admin/dashboard'),
    listUsers: (params?: any) => api.get('/admin/users', { params }),
    updateUser: (id: string, data: any) => api.put(`/admin/users/${id}`, data),
    deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
    listRoles: () => api.get('/admin/roles'),
    createRole: (data: any) => api.post('/admin/roles', data),
    listMemberships: () => api.get('/admin/memberships'),
    createMembership: (data: any) => api.post('/admin/memberships', data),
    updateMembership: (id: string, data: any) => api.put(`/admin/memberships/${id}`, data),
    listAnnouncements: () => api.get('/admin/announcements'),
    createAnnouncement: (data: any) => api.post('/admin/announcements', data),
  },
  settings: {
    get: () => api.get('/settings'),
    update: (data: any) => api.put('/settings', data),
    getBranding: () => api.get('/settings/branding'),
    updateBranding: (data: any) => api.put('/settings/branding', data),
    listFeatures: () => api.get('/settings/features'),
    toggleFeature: (id: string, data: any) => api.put(`/settings/features/${id}`, data),
    getHomepage: () => api.get('/settings/homepage'),
    createHomepageSection: (data: any) => api.post('/settings/homepage', data),
    updateHomepageSection: (id: string, data: any) => api.put(`/settings/homepage/${id}`, data),
  },
  health: () => api.get('/health'),
}
