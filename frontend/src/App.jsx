import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup.jsx' 
import Dashboard from './pages/Dashboard'
import BookAppointment from './pages/BookAppointment'
import ProtectedRoute from './components/ProtectedRoute'
import CompleteProfile from './pages/CompleteProfile'
import { CompleteDoctorProfile } from './pages/CompleteDoctorProfile.jsx' 
// 1. IMPORT the setup function
import setupAxiosInterceptors from './utils/setupAxios';

// 2. CRITICAL FIX: CALL the setup function once before the component structure is rendered
setupAxiosInterceptors();

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
        <div style={{ minHeight: '100vh' }}>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/book-appointment" 
              element={
                <ProtectedRoute>
                  <BookAppointment />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/complete-profile" 
              element={
                <ProtectedRoute>
                  <CompleteProfile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/complete-doctor-profile" 
              element={
                <ProtectedRoute>
                  <CompleteDoctorProfile />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App