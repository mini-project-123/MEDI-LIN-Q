import axios from 'axios'

// Set global axios base URL
axios.defaults.baseURL = 'http://127.0.0.1:8000'

// Base API URL
const API_BASE_URL = '/api'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling with token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          // Try to refresh the token
          const response = await axios.post('http://127.0.0.1:8000/api/login/refresh/', {
            refresh: refreshToken
          })
          
          const { access } = response.data
          localStorage.setItem('accessToken', access)
          
          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    // If refresh failed or other error, logout
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    
    return Promise.reject(error)
  }
)

// ==================== AUTH APIs ====================
export const authAPI = {
  login: (credentials) => api.post('/login/', credentials),
  register: (userData) => api.post('/register/', userData),
  refreshToken: (refreshToken) => api.post('/login/refresh/', { refresh: refreshToken }),
}

// ==================== PATIENT APIs ====================
export const patientAPI = {
  // Dashboard
  getDashboard: () => api.get('/dashboard/'),
  
  // Profile
  createProfile: (profileData) => api.post('/profile/patient/', profileData),
  updateProfile: (profileData) => api.patch('/dashboard/', profileData),
  
  // Appointments
  getAppointments: () => api.get('/dashboard/'),
  createAppointment: (appointmentData) => api.post('/booking/create/', appointmentData),
  updateAppointment: (id, data) => api.patch(`/appointments/${id}/manage/`, data),
  cancelAppointment: (id) => api.patch(`/appointments/${id}/manage/`, { status: 'cancelled' }),
  
  // Booking
  getDoctors: (params) => api.get('/booking/doctors/', { params }),
  getHospitals: (params) => api.get('/booking/hospitals/', { params }),
}

// ==================== DOCTOR APIs ====================
export const doctorAPI = {
  // Dashboard
  getDashboardSummary: () => api.get('/doctor/dashboard-summary/'),
  
  // Profile
  createProfile: (profileData) => api.post('/profile/doctor/', profileData),
  getProfile: () => api.get('/profile/doctor/manage/'),
  updateProfile: (profileData) => api.patch('/profile/doctor/manage/', profileData),
  
  // Patients
  getPatients: (params) => api.get('/doctor/patients/', { params }),
  getPatientDetail: (id) => api.get(`/doctor/patients/${id}/`),
  getPatientSummary: (id) => api.get(`/patients/${id}/summary/`),
  
  // Appointments
  getAppointments: (params) => api.get('/doctor/appointments/', { params }),
  
  // Prescriptions
  getPrescriptions: (params) => api.get('/doctor/prescriptions/', { params }),
  createPrescription: (prescriptionData) => api.post('/prescriptions/create/', prescriptionData),
}

// ==================== HOSPITAL APIs ====================
export const hospitalAPI = {
  // Dashboard
  getDashboardSummary: () => api.get('/hospital/dashboard-summary/'),
  
  // Profile
  createProfile: (profileData) => api.post('/profile/hospital/', profileData),
  getProfile: () => api.get('/hospital/profile/manage/'),
  updateProfile: (profileData) => api.patch('/hospital/profile/manage/', profileData),
  
  // Doctors
  getDoctors: (params) => api.get('/hospital/doctors/', { params }),
  
  // Staff
  getStaff: (params) => api.get('/hospital/staff/', { params }),
  createStaff: (staffData) => api.post('/hospital/staff/add/', staffData),
  updateStaff: (id, staffData) => api.patch(`/hospital/staff/${id}/manage/`, staffData),
  deleteStaff: (id) => api.delete(`/hospital/staff/${id}/manage/`),
  
  // Patients
  getPatients: (params) => api.get('/hospital/patients/', { params }),
  createPatient: (patientData) => api.post('/hospital/patients/add/', patientData),
  updatePatient: (id, patientData) => api.patch(`/hospital/patients/${id}/manage/`, patientData),
  deletePatient: (id) => api.delete(`/hospital/patients/${id}/manage/`),
  uploadPatientReport: (id, reportData) => api.post(`/hospital/patients/${id}/upload-report/`, reportData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // Wards
  getWards: (params) => api.get('/hospital/wards/', { params }),
  
  // Appointments
  getAppointments: (params) => api.get('/hospital/appointments/', { params }),
  
  // Analytics
  getAnalytics: () => api.get('/hospital/analytics/'),
}

// ==================== ARTICLE APIs ====================
export const articleAPI = {
  getArticles: (params) => api.get('/articles/', { params }),
  createArticle: (articleData) => api.post('/articles/', articleData),
}

// ==================== NOTIFICATION APIs ====================
export const notificationAPI = {
  getNotifications: (params) => api.get('/notifications/', { params }),
}

export default api
