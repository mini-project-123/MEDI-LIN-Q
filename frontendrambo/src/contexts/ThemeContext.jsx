import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark')
    }
  }, [])

  useEffect(() => {
    // Apply dark mode class to body
    if (isDarkMode) {
      document.body.classList.add('dark-mode')
    } else {
      document.body.classList.remove('dark-mode')
    }
  }, [isDarkMode])

  const toggleTheme = () => {
    const newTheme = !isDarkMode
    setIsDarkMode(newTheme)
    localStorage.setItem('theme', newTheme ? 'dark' : 'light')
  }

  const theme = {
    isDarkMode,
    colors: {
      background: isDarkMode ? '#0f172a' : '#ffffff',
      cardBackground: isDarkMode ? '#1e293b' : '#ffffff',
      text: isDarkMode ? '#f1f5f9' : '#1e293b',
      textSecondary: isDarkMode ? '#94a3b8' : '#64748b',
      border: isDarkMode ? '#334155' : '#e5e7eb',
      primary: '#3b82f6',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
      sidebar: isDarkMode ? '#0f172a' : '#1e293b',
      sidebarText: '#f1f5f9'
    }
  }

  const value = {
    isDarkMode,
    toggleTheme,
    theme
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}