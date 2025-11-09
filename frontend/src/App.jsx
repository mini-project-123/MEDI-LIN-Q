import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
// 1. THIS IS THE FIX: Removed the {} braces to use the default import
import Signup from './pages/Signup.jsx' 
import Dashboard from './pages/Dashboard'
import BookAppointment from './pages/BookAppointment'
import ProtectedRoute from './components/ProtectedRoute'
import CompleteProfile from './pages/CompleteProfile'
// 2. This one correctly uses a named import (with braces)
import { CompleteDoctorProfile } from './pages/CompleteDoctorProfile.jsx' 

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
            {/* 3. Use the default component */}
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
            {/* 4. Use the named component */}
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