import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode' // We just installed this

const AuthContext = createContext()

// --- 1. CREATE THE CENTRAL API CLIENT ---
// This instance will be used by our entire application to talk to the backend.
// Your vite.config.js file correctly proxies '/api' to 'http://localhost:8000/api'
const apiClient = axios.create({
  baseURL: '/api' // Uses the proxy
});

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true) // Keep loading true on init

  useEffect(() => {
    // --- 2. CHECK FOR A REAL TOKEN ON APP LOAD ---
    // This replaces your mock user logic.
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (token) {
        // We found a token! Let's decode it to get user info.
        const decodedToken = jwtDecode(token);
        
        // Check if token is expired (exp is in seconds, Date.now() in ms)
        const isExpired = decodedToken.exp * 1000 < Date.now();
        
        if (isExpired) {
          // If token is expired, throw an error to be caught below
          throw new Error("Token expired");
        }

        // --- 3. SET THE USER STATE FROM THE TOKEN ---
        // This data comes from our MyTokenObtainPairSerializer in Django
        setUser({
          // The token from our backend has 'first_name', not 'name'
          name: decodedToken.first_name, 
          role: decodedToken.role,
          profile_complete: decodedToken.profile_complete,
        });

        // --- 4. TELL AXIOS TO USE THIS TOKEN FOR ALL FUTURE REQUESTS ---
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
      } else {
        throw new Error("No token found");
      }
    } catch (error) {
      // No valid token, so user is logged out.
      setUser(null)
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      delete apiClient.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false)
    }
  }, []) // This empty array means it only runs once when the app loads

  const login = async (credentials) => {
    // --- 5. CONNECT THE REAL LOGIN FUNCTION ---
    try {
      // Make the API call to our Django backend's /api/login/
      const response = await apiClient.post('/login/', {
        // Note: Our backend login view expects 'username', not 'email'
        // But our UserCreationSerializer sets username = email, so this is correct.
        username: credentials.email, 
        password: credentials.password
      });

      // Get the tokens from the response
      const { access, refresh } = response.data;

      // Save tokens to localStorage
      localStorage.setItem('token', access);
      localStorage.setItem('refreshToken', refresh);

      // Decode the new token to get user data
      const decodedToken = jwtDecode(access);
      
      // Set the user state
      setUser({
        name: decodedToken.first_name,
        role: decodedToken.role,
        profile_complete: decodedToken.profile_complete,
      });

      // Set the default Authorization header for all future requests
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      
      return { success: true, role: decodedToken.role, profile_complete: decodedToken.profile_complete };

    } catch (error) {
      console.error('Login failed:', error.response?.data);
      // Return a user-friendly error
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Invalid credentials or server error.' 
      };
    }
  }

  const signup = async (userData) => {
    // --- 6. CONNECT THE REAL SIGNUP FUNCTION ---
    try {
      // Prepare the data for the backend serializer
      // This maps the frontend form fields (from Signup.jsx) to the backend (auth_serializers.py)
      const dataToSubmit = {
        email: userData.email,
        password: userData.password,
        password2: userData.confirmPassword,
        role: userData.role,
        
        // Frontend sends 'firstName', backend expects 'first_name'
        first_name: userData.firstName || '', 
        
        // Frontend sends 'lastName', backend expects 'last_name'
        last_name: userData.lastName || '',
        
        // Frontend sends 'hospitalName', backend expects 'hospital_name'
        hospital_name: userData.hospitalName || ''
      };

      // Make the API call to our Django backend's /api/register/
      await apiClient.post('/register/', dataToSubmit);

      // If signup is successful, automatically log the user in
      // (This is a great user experience)
      return await login({ 
        email: userData.email, 
        password: userData.password 
      });

    } catch (error) {
      console.error('Signup failed:', error.response?.data);
      // Format the error from the backend serializer
      let formattedError = 'Signup failed. Please try again.';
      if (error.response?.data) {
        // Get the first error message from the backend
        const errorKey = Object.keys(error.response.data)[0];
        formattedError = error.response.data[errorKey][0];
      }
      return { 
        success: false, 
        error: formattedError
      };
    }
  }

  const logout = () => {
    // --- 7. UPDATE LOGOUT ---
    // This logic removes the token from storage AND from the axios client
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    setUser(null)
    delete apiClient.defaults.headers.common['Authorization'];
  }

  const value = {
    user,
    login,
    signup,
    logout,
    loading,
    apiClient // --- 8. PROVIDE THE API CLIENT TO THE APP ---
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}