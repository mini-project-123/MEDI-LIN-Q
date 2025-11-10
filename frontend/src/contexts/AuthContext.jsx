import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode' // Import jwt-decode

// Create Context
export const AuthContext = createContext()

// AuthProvider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true) // Start loading by default

  useEffect(() => {
    // This effect runs when the app first loads
    // It tries to set the user if a token is present
    const token = localStorage.getItem('accessToken')
    if (token) {
      try {
        const decoded = jwtDecode(token)
        if (decoded.exp * 1000 < Date.now()) {
          // Token is expired
          console.log("Token expired, logging out.")
          logout()
        } else {
          // Token is valid, set user and default header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
          decodeAndSetUser(token)
        }
      } catch (error) {
        console.error("Invalid token on load", error)
        logout() // Clear invalid token
      }
    }
    setLoading(false)
  }, [])

  // HELPER FUNCTION
  // This decodes the JWT token to get the user's info
  const decodeAndSetUser = (token) => {
    try {
      const decodedUser = jwtDecode(token) // Use jwtDecode
      
      // The backend token payload contains role, email, etc.
      //
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
      delete axios.defaults.headers.common['Authorization']
    }
  }


  // --- login FUNCTION (Handles authentication and token storage) ---
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
      
      // 4. Set default header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`
      
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
  // --- END OF login FUNCTION ---


  // --- signup FUNCTION ---
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

      // 2. Handle the special case for the 'hospital' role
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

      // 4. Immediately log in the user after successful registration
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
    localStorage.removeItem('user') // Also remove any mock user data
    delete axios.defaults.headers.common['Authorization'] // Remove default header
  }

  // Value provided to consumers
  const value = {
    user,
    loading,
    login,
    logout,
    signup,
    fetchUser: decodeAndSetUser,
    setUser // Expose setUser for profile completion
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




// import React, { createContext, useState, useContext, useEffect } from 'react'
// import axios from 'axios'
// import { jwtDecode } from 'jwt-decode' 

// const AuthContext = createContext()

// export const useAuth = () => {
//   return useContext(AuthContext)
// }

// export const AuthProvider = ({ children }) => {
//   // Renamed to setUserState to avoid conflicts
//   const [user, setUserState] = useState(() => {
//     const storedUser = localStorage.getItem('user')
//     return storedUser ? JSON.parse(storedUser) : null
//   })

//   useEffect(() => {
//     const token = localStorage.getItem('accessToken')
//     if (token) {
//       try {
//         const decoded = jwtDecode(token)
//         if (decoded.exp * 1000 < Date.now()) {
//           logout()
//         } else {
//           axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
//         }
//       } catch (error) {
//         console.error("Invalid token:", error)
//         logout()
//       }
//     }
//   }, []) 

//   const login = (accessToken, userData) => {
//     localStorage.setItem('accessToken', accessToken)
//     localStorage.setItem('user', JSON.stringify(userData))
//     axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
//     setUserState(userData) // Use the internal state setter
//   }

//   const logout = () => {
//     localStorage.removeItem('accessToken')
//     localStorage.removeItem('user')
//     delete axios.defaults.headers.common['Authorization']
//     setUserState(null) // Use the internal state setter
//   }
  
//   // --- THIS IS THE FIX ---
//   // This new function updates both the state AND localStorage,
//   // so the user's "profile_complete: true" status persists.
//   const setUser = (userData) => {
//     localStorage.setItem('user', JSON.stringify(userData))
//     setUserState(userData)
//   }
//   // --- END OF FIX ---

//   const value = {
//     user,
//     login,
//     logout,
//     setUser // --- ADDED setUser TO THE CONTEXT VALUE ---
//   }

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   )
// }