import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

// Create Context
export const AuthContext = createContext()

// AuthProvider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] =useState(null)
  const [loading, setLoading] = useState(true) // Start loading by default

  useEffect(() => {
    // This effect runs when the app first loads
    // It tries to set the user if a token is present
    const token = localStorage.getItem('accessToken')
    if (token) {
      try {
        decodeAndSetUser(token)
      } catch (error) {
        console.error("Invalid token on load", error)
        localStorage.removeItem('accessToken')
      }
    }
    setLoading(false)
  }, [])

  // NEW HELPER FUNCTION
  // This decodes the JWT token to get the user's info
  const decodeAndSetUser = (token) => {
    try {
      const payloadBase64 = token.split('.')[1]
      const decodedPayload = atob(payloadBase64)
      const decodedUser = JSON.parse(decodedPayload)
      
      // The backend token payload contains role, email, etc.
      setUser({
        id: decodedUser.user_id,
        email: decodedUser.email,
        role: decodedUser.role,
        profile_complete: decodedUser.profile_complete,
        // We'll add name later by fetching from a profile endpoint
      });
    } catch (error) {
      console.error("Failed to decode token", error)
      setUser(null)
      localStorage.removeItem('accessToken')
    }
  }


  // --- NEW login FUNCTION (Handles authentication and token storage) ---
  const login = async (credentials) => {
    try {
      // 1. Prepare data for the backend.
      const postData = {
        username: credentials.email,
        password: credentials.password
      };

      // 2. Make the API call
      const response = await axios.post('/api/login/', postData);
      
      const { access, refresh } = response.data;

      // 3. Save tokens and set user
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      
      decodeAndSetUser(access); 
      
      return { success: true };

    } catch (error) {
      // Handle failed login
      let errorMessage = "Invalid credentials. Please try again.";
      if (error.response && error.response.data && error.response.data.detail) {
        errorMessage = error.response.data.detail;
      }
      return { 
        success: false, 
        error: errorMessage
      };
    }
  }
  // --- END OF NEW login FUNCTION ---


  // --- MODIFIED signup FUNCTION WITH ALL FIXES ---
  const signup = async (userData) => {
    try {
      // 1. Prepare the data for the backend
      const postData = {
        first_name: userData.firstName,
        last_name: userData.lastName,
        email: userData.email,
        role: userData.role,
        password: userData.password,
        password2: userData.confirmPassword
      };

      // 2. CRITICAL FIX: Handle the special case for the 'hospital' role
      if (postData.role === 'hospital') {
        postData.first_name = userData.hospitalName;
        postData.last_name = ''; 
        // A) Map role to backend value
        postData.role = 'hospital_admin'; 
        // B) Inject password as password2 to bypass missing confirm field
        postData.password2 = userData.password;
      }

      // 3. Make the API call to register the user
      await axios.post("/api/register/", postData);

      // 4. CRITICAL FIX: Immediately log in the user after successful registration
      // This resolves the 401 Unauthorized errors after signup.
      const loginResult = await login(userData); 
      
      if (loginResult.success) {
          return { success: true };
      } else {
          return { success: false, error: "Registration succeeded, but automatic login failed. Please try logging in manually." };
      }

    } catch (error) {
      // 5. Handle errors from the backend
      let errorMessage = 'Signup failed. Please try again.';
      if (error.response && error.response.data) {
        const errors = error.response.data;
        const errorKey = Object.keys(errors)[0];
        if (errorKey && Array.isArray(errors[errorKey])) {
          errorMessage = errors[errorKey][0];
        } else if (typeof errors === 'string') {
          errorMessage = errors;
        } else if (errors.email) {
          errorMessage = errors.email[0];
        } else if (errors.password) {
          errorMessage = errors.password[0];
        }
      }
      return {
        success: false,
        error: errorMessage
      };
    }
  }


  // --- Logout Function ---
  const logout = () => {
    setUser(null)
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }

  // Value provided to consumers
  const value = {
    user,
    loading,
    login,
    logout,
    signup,
    fetchUser: decodeAndSetUser,
    setUser
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

// Custom hook to use AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}