import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useNavigate } from 'react-router-dom'
import { Calendar, Users, Clock, User, Settings, Activity, Pill, FileText, Sun, Moon, Menu, X, Building2, Bed, Stethoscope, BarChart3, LogOut } from 'lucide-react'
import DoctorDashboard from '../components/DoctorDashboard'
import DoctorAppointments from '../components/DoctorAppointments'
import DoctorPatients from '../components/DoctorPatients'
import DoctorProfile from '../components/DoctorProfile'
import DoctorPrescriptions from '../components/DoctorPrescriptions'
import DoctorSettings from '../components/DoctorSettings'
import Articles from '../components/Articles'
import PatientDashboard from '../components/PatientDashboard'
import PatientAppointments from '../components/PatientAppointments'
import PatientPrescriptions from '../components/PatientPrescriptions'
import PatientReports from '../components/PatientReports'
import PatientSettings from '../components/PatientSettings'
import UserProfile from '../components/UserProfile'
import HospitalDashboard from '../components/HospitalDashboard'
import HospitalPatients from '../components/HospitalPatients'
import HospitalDoctors from '../components/HospitalDoctors'
import HospitalAppointments from '../components/HospitalAppointments'
import HospitalWards from '../components/HospitalWards'
import HospitalStaff from '../components/HospitalStaff'
import HospitalReports from '../components/HospitalReports'
import HospitalArticles from '../components/HospitalArticles'
import HospitalAnalytics from '../components/HospitalAnalytics'
import HospitalSettings from '../components/HospitalSettings'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const { theme, toggleTheme, isDarkMode } = useTheme()
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    if (user?.role !== 'doctor') {
      fetchDashboardData()
    } else {
      setLoading(false)
    }
  }, [user])

  const fetchDashboardData = async () => {
    // Mock data from localStorage
    const mockAppointments = JSON.parse(localStorage.getItem('appointments') || '[]')
    const mockStats = {
      totalAppointments: mockAppointments.length,
      upcomingAppointments: mockAppointments.filter(a => new Date(a.date) > new Date()).length,
      completedAppointments: mockAppointments.filter(a => a.status === 'completed').length
    }
    
    setAppointments(mockAppointments)
    setStats(mockStats)
    setLoading(false)
  }

  const renderPatientDashboard = () => (
    <div>
      {/* Patient Navigation Tabs */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        borderBottom: `1px solid ${theme.border}`
      }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {[
            { id: 'overview', label: 'Health Analytics', icon: Activity },
            { id: 'appointments', label: 'Appointments', icon: Calendar },
            { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
            { id: 'reports', label: 'Reports', icon: FileText },
            { id: 'articles', label: 'Articles', icon: FileText },
            { id: 'settings', label: 'Settings & Privacy', icon: Settings }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                border: 'none',
                background: 'none',
                color: activeTab === id ? '#3b82f6' : theme.textSecondary,
                borderBottom: activeTab === id ? '2px solid #3b82f6' : '2px solid transparent',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: activeTab === id ? '500' : '400'
              }}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            border: `1px solid ${theme.border}`,
            backgroundColor: theme.cardBackground,
            color: theme.text,
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontSize: '0.9rem',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = theme.background
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = theme.cardBackground
          }}
        >
          {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
          {isDarkMode ? 'Light' : 'Dark'}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && <PatientDashboard />}
      {activeTab === 'appointments' && <PatientAppointments />}
      {activeTab === 'prescriptions' && <PatientPrescriptions />}
      {activeTab === 'reports' && <PatientReports />}
      {activeTab === 'articles' && <Articles />}
      {activeTab === 'settings' && <PatientSettings />}
    </div>
  )

  const renderDoctorDashboard = () => (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      backgroundColor: theme.background
    }}>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          position: 'fixed',
          top: '1rem',
          left: sidebarOpen ? '280px' : '1rem',
          zIndex: 1001,
          backgroundColor: theme.sidebar || '#1e293b',
          color: theme.sidebarText || 'white',
          border: 'none',
          borderRadius: '0.5rem',
          padding: '0.5rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? '280px' : '0px',
        backgroundColor: theme.sidebar || '#1e293b',
        color: theme.sidebarText || 'white',
        height: '100vh',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease',
        overflow: sidebarOpen ? 'visible' : 'hidden',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 1000
      }}>
        {sidebarOpen && (
          <>
            {/* Logo */}
            <div style={{ 
              padding: '1.5rem 1.5rem 2rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#3b82f6',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '1.2rem',
                color: 'white'
              }}>
                M
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'white' }}>MedLinq</h3>
                <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.7, color: 'white' }}>Health Management System</p>
              </div>
            </div>

            {/* Navigation */}
            <nav style={{ padding: '0 1rem', flex: 1 }}>
              {[
                { id: 'overview', label: 'Dashboard', icon: Building2 },
                { id: 'patients', label: 'View Patients', icon: Users },
                { id: 'appointments', label: 'My Appointments', icon: Calendar },
                { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
                { id: 'articles', label: 'Articles', icon: FileText },
                { id: 'settings', label: 'Settings', icon: Settings },
                { id: 'profile', label: 'Profile', icon: User }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.875rem 1rem',
                    margin: '0.25rem 0',
                    border: 'none',
                    backgroundColor: activeTab === id ? '#3b82f6' : 'transparent',
                    color: 'white',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    fontWeight: activeTab === id ? '500' : '400',
                    transition: 'all 0.2s ease',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== id) {
                      e.target.style.backgroundColor = '#334155'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== id) {
                      e.target.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  <Icon size={20} />
                  {label}
                </button>
              ))}
            </nav>

            {/* User Info & Controls */}
            <div style={{ padding: '1rem', borderTop: '1px solid #334155' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#3b82f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  color: 'white'
                }}>
                  {user?.name?.charAt(0) || 'D'}
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '500', color: 'white' }}>
                    {user?.name || 'Doctor'}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.7, color: 'white' }}>
                    {user?.specialization || 'Specialist'}
                  </p>
                </div>
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  border: 'none',
                  backgroundColor: '#374151',
                  color: 'white',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  marginBottom: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#4b5563'
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#374151'
                }}
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </button>

              <button
                onClick={() => {
                  logout()
                  navigate('/')
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  border: 'none',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#dc2626'
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#ef4444'
                }}
              >
                <User size={18} />
                Logout
              </button>
            </div>
          </>
        )}
      </div>

      {/* Main Content */}
      <div style={{ 
        marginLeft: sidebarOpen ? '280px' : '0px', 
        flex: 1, 
        padding: '4rem 2rem 2rem 2rem',
        backgroundColor: theme.background,
        minHeight: '100vh',
        transition: 'margin-left 0.3s ease'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            color: theme.text || '#1e293b',
            margin: '0 0 0.5rem 0'
          }}>
            {activeTab === 'overview' && 'Dashboard'}
            {activeTab === 'patients' && 'View Patients'}
            {activeTab === 'appointments' && 'My Appointments'}
            {activeTab === 'prescriptions' && 'Prescriptions'}
            {activeTab === 'articles' && 'Articles'}
            {activeTab === 'settings' && 'Settings'}
            {activeTab === 'profile' && 'Profile'}
          </h1>
          <p style={{ 
            color: theme.textSecondary || '#64748b', 
            fontSize: '1rem',
            margin: 0
          }}>
            Welcome back, {user?.name || 'Doctor'}
          </p>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && <DoctorDashboard />}
        {activeTab === 'appointments' && <DoctorAppointments />}
        {activeTab === 'patients' && <DoctorPatients />}
        {activeTab === 'articles' && <Articles />}
        {activeTab === 'prescriptions' && <DoctorPrescriptions />}
        {activeTab === 'settings' && <DoctorSettings />}
        {activeTab === 'profile' && <UserProfile />}
      </div>
    </div>
  )



  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh' 
      }}>
        <div>Loading dashboard...</div>
      </div>
    )
  }

  if (user.role === 'doctor') {
    return renderDoctorDashboard()
  }

  const renderHospitalDashboard = () => (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? '280px' : '0',
        backgroundColor: '#1e293b',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        transition: 'width 0.3s ease',
        overflow: 'hidden',
        flexShrink: 0
      }}>
        {sidebarOpen && (
          <>
            {/* Logo */}
            <div style={{ padding: '1.5rem 1rem', borderBottom: '1px solid #334155' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#3b82f6',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '1.2rem',
                  color: 'white'
                }}>
                  H
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'white' }}>Hospital HMS</h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.7, color: 'white' }}>Management System</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav style={{ padding: '0 1rem', flex: 1, overflowY: 'auto' }}>
              {[
                { id: 'overview', label: 'Dashboard', icon: Building2 },
                { id: 'patients', label: 'Patients', icon: Users },
                { id: 'doctors', label: 'Doctors', icon: Stethoscope },
                { id: 'appointments', label: 'Appointments', icon: Calendar },
                { id: 'wards', label: 'Wards & Beds', icon: Bed },
                { id: 'staff', label: 'Staff', icon: Users },
                { id: 'reports', label: 'Reports', icon: FileText },
                { id: 'articles', label: 'Articles', icon: FileText },
                { id: 'analytics', label: 'Analytics', icon: BarChart3 },
                { id: 'settings', label: 'Settings & Privacy', icon: Settings }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.875rem 1rem',
                    margin: '0.25rem 0',
                    border: 'none',
                    backgroundColor: activeTab === id ? '#3b82f6' : 'transparent',
                    color: 'white',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    fontWeight: activeTab === id ? '500' : '400',
                    transition: 'all 0.2s ease',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== id) {
                      e.currentTarget.style.backgroundColor = '#334155'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== id) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  <Icon size={20} />
                  {label}
                </button>
              ))}
            </nav>

            {/* User Info & Controls */}
            <div style={{ padding: '1rem', borderTop: '1px solid #334155' }}>
              <button
                onClick={toggleTheme}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  marginBottom: '0.5rem',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: 'white',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#334155'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </button>
              <button
                onClick={() => {
                  logout()
                  navigate('/')
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: 'white',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#334155'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <LogOut size={20} />
                Logout
              </button>
            </div>
          </>
        )}
      </div>

      {/* Main Content */}
      <div style={{ 
        flex: 1, 
        minHeight: '100vh',
        padding: '2rem', 
        backgroundColor: theme.background,
        position: 'relative'
      }}>
        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            position: 'absolute',
            top: '1rem',
            left: '1rem',
            zIndex: 100,
            padding: '0.75rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}
        >
          <Menu size={20} />
        </button>

        <div style={{ marginTop: '4rem' }}>
          {activeTab === 'overview' && <HospitalDashboard />}
          {activeTab === 'patients' && <HospitalPatients />}
          {activeTab === 'doctors' && <HospitalDoctors />}
          {activeTab === 'appointments' && <HospitalAppointments />}
          {activeTab === 'wards' && <HospitalWards />}
          {activeTab === 'staff' && <HospitalStaff />}
          {activeTab === 'reports' && <HospitalReports />}
          {activeTab === 'articles' && <HospitalArticles />}
          {activeTab === 'analytics' && <HospitalAnalytics />}
          {activeTab === 'settings' && <HospitalSettings />}
        </div>
      </div>
    </div>
  )

  if (user.role === 'hospital') {
    return renderHospitalDashboard()
  }

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: theme.text || '#1e293b', marginBottom: '0.5rem' }}>
          Welcome back, {user.name}!
        </h1>
        <p style={{ color: theme.textSecondary || '#64748b' }}>
          {user.role === 'patient' && 'Manage your appointments and health records'}
        </p>
      </div>

      {user.role === 'patient' && renderPatientDashboard()}
    </div>
  )
}

export default Dashboard