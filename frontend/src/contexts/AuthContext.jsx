import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initialize demo users - always ensure hospital user exists
    const demoUsers = [
      {
        id: 1,
        name: 'Dr. Sarah Johnson',
        email: 'doctor@medlinq.com',
        role: 'doctor',
        specialization: 'Cardiology',
        hospitalId: 'H001',
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        name: 'John Patient',
        email: 'patient@medlinq.com',
        role: 'patient',
        dateOfBirth: '1990-01-01',
        age: 34,
        emergencyContactName: 'Jane Patient',
        emergencyContactNumber: '+1234567890',
        allergies: 'None',
        createdAt: new Date().toISOString()
      },
      {
        id: 3,
        name: 'City General Hospital',
        email: 'hospital@medlinq.com',
        role: 'hospital',
        hospitalName: 'City General Hospital',
        createdAt: new Date().toISOString()
      }
    ]
    
    // Check if hospital user exists, if not, reinitialize
    const existingUsers = localStorage.getItem('mockUsers')
    if (!existingUsers) {
      localStorage.setItem('mockUsers', JSON.stringify(demoUsers))
    } else {
      const users = JSON.parse(existingUsers)
      const hasHospital = users.some(u => u.role === 'hospital')
      if (!hasHospital) {
        // Add hospital user to existing users
        const hospitalUser = demoUsers.find(u => u.role === 'hospital')
        users.push(hospitalUser)
        localStorage.setItem('mockUsers', JSON.stringify(users))
      }
    }

    // Remove auto-login - user must login manually
    setLoading(false)
  }, [])

  const fetchUser = async () => {
    try {
      // Mock API call - get user from localStorage
      const currentUser = localStorage.getItem('currentUser')
      if (currentUser) {
        setUser(JSON.parse(currentUser))
      } else {
        throw new Error('No user found')
      }
    } catch (error) {
      console.log('No user session found')
      localStorage.removeItem('token')
      localStorage.removeItem('currentUser')
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    try {
      // Mock API call - simulate backend response
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate network delay
      
      // Check if user exists in localStorage (mock database)
      const existingUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]')
      console.log('Existing users:', existingUsers)
      console.log('Login credentials:', credentials)
      
      const user = existingUsers.find(u => 
        u.email === credentials.email && 
        u.role === credentials.role
      )
      
      console.log('Found user:', user)
      
      if (!user) {
        return { 
          success: false, 
          error: 'Invalid credentials or user not found' 
        }
      }
      
      // Mock successful login
      const token = 'mock-jwt-token-' + Date.now()
      const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        specialization: user.specialization,
        hospitalId: user.hospitalId,
        hospitalName: user.hospitalName
      }
      
      localStorage.setItem('token', token)
      localStorage.setItem('currentUser', JSON.stringify(userData))
      setUser(userData)
      
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: 'Login failed' 
      }
    }
  }

  const signup = async (userData) => {
    try {
      // Mock API call - simulate backend response
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate network delay
      
      // Get existing users from localStorage (mock database)
      const existingUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]')
      
      // Check if user already exists
      const userExists = existingUsers.find(u => u.email === userData.email)
      if (userExists) {
        return { 
          success: false, 
          error: 'User with this email already exists' 
        }
      }
      
      // Create new user
      const newUser = {
        id: Date.now(),
        name: userData.name,
        email: userData.email,
        role: userData.role,
        dateOfBirth: userData.dateOfBirth,
        age: userData.age,
        specialization: userData.specialization,
        hospitalId: userData.hospitalId,
        hospitalName: userData.hospitalName,
        hospitalAddress: userData.hospitalAddress,
        emergencyContactName: userData.emergencyContactName,
        emergencyContactNumber: userData.emergencyContactNumber,
        allergies: userData.allergies,
        createdAt: new Date().toISOString()
      }
      
      // Save to mock database
      existingUsers.push(newUser)
      localStorage.setItem('mockUsers', JSON.stringify(existingUsers))
      
      // Mock successful signup
      const token = 'mock-jwt-token-' + Date.now()
      const userResponse = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        specialization: newUser.specialization,
        hospitalId: newUser.hospitalId
      }
      
      localStorage.setItem('token', token)
      localStorage.setItem('currentUser', JSON.stringify(userResponse))
      setUser(userResponse)
      
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: 'Signup failed' 
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('currentUser')
    setUser(null)
  }

  const value = {
    user,
    login,
    signup,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}