// API service for connecting Vue frontend to Node.js backend
import axios from 'axios'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
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

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error.response?.data || error.message)
  }
)

// Authentication API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.get('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgotpassword', { email }),
  resetPassword: (token, password) => api.put(`/auth/resetpassword/${token}`, { password }),
  updateProfile: (userData) => api.put('/auth/updatedetails', userData),
  updatePassword: (passwords) => api.put('/auth/updatepassword', passwords)
}

// Booking API
export const bookingAPI = {
  create: (bookingData) => api.post('/bookings', bookingData),
  getAll: (params) => api.get('/bookings', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  update: (id, data) => api.put(`/bookings/${id}`, data),
  delete: (id) => api.delete(`/bookings/${id}`),
  getMyBookings: () => api.get('/bookings/my-bookings'),
  getStylistBookings: (params) => api.get('/bookings/stylist/my-bookings', { params }),
  checkAvailability: (params) => api.get('/bookings/availability', { params }),
  confirm: (id) => api.put(`/bookings/${id}/confirm`),
  cancel: (id, reason) => api.put(`/bookings/${id}/cancel`, { reason }),
  complete: (id) => api.put(`/bookings/${id}/complete`),
  addReview: (id, review) => api.put(`/bookings/${id}/review`, review)
}

// Service API
export const serviceAPI = {
  getAll: (params) => api.get('/services', { params }),
  getById: (id) => api.get(`/services/${id}`),
  getByCategory: (category) => api.get(`/services/category/${category}`),
  getPopular: (limit) => api.get('/services/popular', { params: { limit } }),
  search: (query) => api.get('/services/search', { params: { q: query } }),
  create: (serviceData) => api.post('/services', serviceData),
  update: (id, serviceData) => api.put(`/services/${id}`, serviceData),
  delete: (id) => api.delete(`/services/${id}`)
}

// Stylist API
export const stylistAPI = {
  getAll: (params) => api.get('/stylists', { params }),
  getById: (id) => api.get(`/stylists/${id}`),
  getAvailability: (id, date) => api.get(`/stylists/${id}/availability`, { params: { date } }),
  updateAvailability: (availability) => api.put('/stylists/availability', { availability }),
  getStats: () => api.get('/stylists/stats/my-stats'),
  approve: (id) => api.put(`/stylists/${id}/approve`),
  reject: (id, reason) => api.put(`/stylists/${id}/reject`, { reason })
}

// User API
export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (userData) => api.post('/users', userData),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
  uploadProfileImage: (formData) => api.post('/users/upload-profile-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getPendingBarbers: () => api.get('/users/pending-barbers'),
  getStats: () => api.get('/users/stats')
}

// Utility functions
export const formatError = (error) => {
  if (error.details && Array.isArray(error.details)) {
    return error.details.map(detail => detail.message).join(', ')
  }
  return error.error || error.message || 'An unexpected error occurred'
}

export const handleApiError = (error, defaultMessage = 'An error occurred') => {
  console.error('API Error:', error)
  return formatError(error) || defaultMessage
}

// Phone number validation
export const validatePhoneNumber = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone)
}

// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
  return emailRegex.test(email)
}

export default api
