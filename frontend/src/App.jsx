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
import { CompleteHospitalProfile } from './pages/CompleteHospitalProfile.jsx'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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
            {/* --- ADD THIS ROUTE --- */}
            <Route 
              path="/complete-hospital-profile" 
              element={
                <ProtectedRoute>
                  <CompleteHospitalProfile />
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