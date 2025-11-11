import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      try {
        const decoded = jwtDecode(token)
        if (decoded.exp * 1000 < Date.now()) {
          console.log("Token expired, logging out.")
          logout()
        } else {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
          decodeAndSetUser(token)
        }
      } catch (error) {
        console.error("Invalid token on load", error)
        logout()
      }
    }
    setLoading(false)
  }, [])

  const decodeAndSetUser = (token) => {
    try {
      const decodedUser = jwtDecode(token)
      
      const tempSignupData = JSON.parse(localStorage.getItem('tempSignupData'))
      
      const userData = {
        id: decodedUser.user_id,
        email: decodedUser.email,
        role: decodedUser.role,
        profile_complete: decodedUser.profile_complete,
      };

      // If temp data exists AND the user is a doctor, add it
      if (tempSignupData && userData.role === 'doctor') {
        // --- ADDED EMAIL AND ALL FIELDS BACK TO TEMP DATA ---
        userData.firstName = tempSignupData.firstName;
        userData.lastName = tempSignupData.lastName;
        userData.email = tempSignupData.email; // Added email
        userData.hospitalId = tempSignupData.hospitalId;
      }
      
      setUser(userData);
      
      // Clear temp data if the profile is complete (meaning they successfully submitted Step 2)
      if (decodedUser.profile_complete) {
         localStorage.removeItem('tempSignupData');
      }

    } catch (error) {
      console.error("Failed to decode token", error)
      setUser(null)
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('tempSignupData')
      delete axios.defaults.headers.common['Authorization']
    }
  }


  const login = async (credentials) => {
    try {
      const postData = {
        username: credentials.email,
        password: credentials.password
      };

      const response = await axios.post('http://127.0.0.1:8000/api/login/', postData);
      
      const { access, refresh } = response.data;

      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`
      
      decodeAndSetUser(access); 
      
      return { success: true };

    } catch (error) {
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

  const signup = async (userData) => {
    try {
      const postData = {
        first_name: userData.firstName,
        last_name: userData.lastName,
        email: userData.email,
        role: userData.role,
        password: userData.password,
        password2: userData.confirmPassword
      };

      if (postData.role === 'hospital') {
        postData.first_name = userData.hospitalName;
        postData.last_name = ''; 
        postData.role = 'hospital_admin'; 
        postData.password2 = userData.password;
      }

      // --- Store ALL necessary data for Step 2 ---
      if (postData.role === 'doctor') {
        const tempSignupData = {
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email, // Store email too
          hospitalId: userData.hospitalId // This is the numeric "Hos. ID"
        };
        localStorage.setItem('tempSignupData', JSON.stringify(tempSignupData));
      } else {
        localStorage.removeItem('tempSignupData');
      }

      await axios.post("http://127.0.0.1:8000/api/register/", postData);

      return { success: true };

    } catch (error) {
      let errorMessage = 'Signup failed. Please try again.';
      if (error.response && error.response.data) {
        const errors = error.response.data;
        const errorKey = Object.keys(errors)[0];
        if (errorKey && Array.isArray(errors[errorKey])) {
          errorMessage = `${errorKey}: ${errors[errorKey][0]}`;
        } else if (errors.detail) {
           errorMessage = errors.detail;
        } else if (errors.email) {
          errorMessage = errors.email[0];
        } else if (errors.password) {
          errorMessage = errors.password[0];
        } else {
          errorMessage = JSON.stringify(errors);
        }
      }
      localStorage.removeItem('tempSignupData');
      return {
        success: false,
        error: errorMessage
      };
    }
  }


  const logout = () => {
    setUser(null)
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    localStorage.removeItem('tempSignupData')
    delete axios.defaults.headers.common['Authorization']
  }

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

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}