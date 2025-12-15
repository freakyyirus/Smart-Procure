import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  signup: (data: any) => api.post('/auth/signup', data),
  getMe: () => api.get('/auth/me'),
}

// Vendors API
export const vendorsApi = {
  getAll: () => api.get('/vendors'),
  getOne: (id: string) => api.get(`/vendors/${id}`),
  create: (data: any) => api.post('/vendors', data),
  update: (id: string, data: any) => api.patch(`/vendors/${id}`, data),
  delete: (id: string) => api.delete(`/vendors/${id}`),
}

// Items API
export const itemsApi = {
  getAll: () => api.get('/items'),
  getOne: (id: string) => api.get(`/items/${id}`),
  create: (data: any) => api.post('/items', data),
  update: (id: string, data: any) => api.patch(`/items/${id}`, data),
  delete: (id: string) => api.delete(`/items/${id}`),
}

// RFQs API
export const rfqsApi = {
  getAll: () => api.get('/rfqs'),
  getOne: (id: string) => api.get(`/rfqs/${id}`),
  create: (data: any) => api.post('/rfqs', data),
  send: (id: string, data: any) => api.post(`/rfqs/${id}/send`, data),
}

// Quotes API
export const quotesApi = {
  getAll: (rfqId?: string) => api.get('/quotes', { params: { rfqId } }),
  getOne: (id: string) => api.get(`/quotes/${id}`),
  create: (data: any) => api.post('/quotes', data),
  approve: (id: string) => api.patch(`/quotes/${id}/approve`, {}),
}

// Purchase Orders API
export const posApi = {
  getAll: () => api.get('/purchase-orders'),
  getOne: (id: string) => api.get(`/purchase-orders/${id}`),
  create: (data: any) => api.post('/purchase-orders', data),
  generatePdf: (id: string) => api.post(`/purchase-orders/${id}/generate-pdf`),
  send: (id: string) => api.post(`/purchase-orders/${id}/send`),
}

// Mandates API
export const mandatesApi = {
  getAll: () => api.get('/mandates'),
  getUpcoming: () => api.get('/mandates/upcoming'),
  getOne: (id: string) => api.get(`/mandates/${id}`),
  create: (data: any) => api.post('/mandates', data),
  signByVendor: (id: string, signature: string) =>
    api.patch(`/mandates/${id}/sign/vendor`, { signature }),
  signByCompany: (id: string, signature: string) =>
    api.patch(`/mandates/${id}/sign/company`, { signature }),
  execute: (id: string) => api.post(`/mandates/${id}/execute`),
}

// Marketplace API
export const marketplaceApi = {
  searchVendors: (params: any) => api.get('/marketplace/vendors', { params }),
  getFeatured: () => api.get('/marketplace/vendors/featured'),
  getCategories: () => api.get('/marketplace/categories'),
  getVendor: (id: string) => api.get(`/marketplace/vendors/${id}`),
  inviteVendor: (data: any) => api.post('/marketplace/invite', data),
  getInvitations: () => api.get('/marketplace/invitations'),
  createReview: (data: any) => api.post('/marketplace/reviews', data),
}

// Financing API
export const financingApi = {
  checkEligibility: (data: any) => api.post('/financing/check-eligibility', data),
  apply: (data: any) => api.post('/financing/apply', data),
  getApplications: () => api.get('/financing/applications'),
  getApplication: (id: string) => api.get(`/financing/applications/${id}`),
  getCreditLimit: () => api.get('/financing/credit-limit'),
  getUpcomingRepayments: () => api.get('/financing/repayments/upcoming'),
  recordRepayment: (data: any) => api.post('/financing/repayments/record', data),
}

