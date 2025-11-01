import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useNavigate } from 'react-router-dom'
import { Calendar, Users, Building2, Clock, User, Mail, Phone, Settings, Activity, Pill, FileText, Sun, Moon } from 'lucide-react'
import DoctorDashboard from '../components/DoctorDashboard'
import DoctorAppointments from '../components/DoctorAppointments'
import DoctorPatients from '../components/DoctorPatients'
import DoctorProfile from '../components/DoctorProfile'
import DoctorArticles from '../components/DoctorArticles'
import DoctorPrescriptions from '../components/DoctorPrescriptions'
import PatientDashboard from '../components/PatientDashboard'
import PatientAppointments from '../components/PatientAppointments'
import PatientPrescriptions from '../components/PatientPrescriptions'
import PatientReports from '../components/PatientReports'
import axios from 'axios'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const { theme, toggleTheme, isDarkMode } = useTheme()
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (user?.role !== 'doctor') {
      fetchDashboardData()
    } else {
      setLoading(false)
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      const [appointmentsRes, statsRes] = await Promise.all([
        axios.get('/api/appointments/'),
        axios.get('/api/dashboard/stats/')
      ])
      
      setAppointments(appointmentsRes.data)
      setStats(statsRes.data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
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
            { id: 'reports', label: 'Reports', icon: FileText }
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
    </div>
  )

  const renderDoctorDashboard = () => (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0
    }}>
      {/* Sidebar */}
      <div style={{
        width: '280px',
        backgroundColor: '#1e293b',
        color: 'white',
        height: '100vh',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}>
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
            fontSize: '1.2rem'
          }}>
            M
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>MedLinq</h3>
            <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.7 }}>Health Management System</p>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ padding: '0 1rem', flex: 1 }}>
          {[
            { id: 'overview', label: 'Dashboard', icon: Building2 },
            { id: 'patients', label: 'View Patients', icon: Users },
            { id: 'appointments', label: 'My Appointments', icon: Calendar },
            { id: 'articles', label: 'Articles', icon: Clock },
            { id: 'prescriptions', label: 'Prescriptions', icon: Settings }
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
              fontSize: '1rem'
            }}>
              {user?.name?.charAt(0) || 'D'}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '500' }}>
                Dr. {user?.name || 'Smith'}
              </p>
              <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.7 }}>
                {user?.specialization || 'Doctor'}
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
      </div>

      {/* Main Content */}
      <div style={{ 
        marginLeft: '280px', 
        flex: 1, 
        padding: '2rem',
        backgroundColor: '#f8fafc',
        height: '100vh',
        overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            color: '#1e293b',
            margin: '0 0 0.5rem 0'
          }}>
            Dashboard
          </h1>
          <p style={{ 
            color: '#64748b', 
            fontSize: '1rem',
            margin: 0
          }}>
            Welcome back, Dr. {user?.name || 'Smith'}
          </p>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && <DoctorDashboard />}
        {activeTab === 'appointments' && <DoctorAppointments />}
        {activeTab === 'patients' && <DoctorPatients />}
        {activeTab === 'articles' && <DoctorArticles />}
        {activeTab === 'prescriptions' && <DoctorPrescriptions />}
      </div>
    </div>
  )

  const renderAdminDashboard = () => (
    <div>
      <div className="grid grid-3 mb-6">
        <div className="card text-center">
          <Users size={32} style={{ color: '#3b82f6', margin: '0 auto 0.5rem' }} />
          <h3 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>
            {stats.totalDoctors || 0}
          </h3>
          <p style={{ color: '#64748b' }}>Total Doctors</p>
        </div>
        
        <div className="card text-center">
          <Calendar size={32} style={{ color: '#10b981', margin: '0 auto 0.5rem' }} />
          <h3 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>
            {stats.totalAppointments || 0}
          </h3>
          <p style={{ color: '#64748b' }}>Total Appointments</p>
        </div>
        
        <div className="card text-center">
          <Building2 size={32} style={{ color: '#f59e0b', margin: '0 auto 0.5rem' }} />
          <h3 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>
            {stats.totalPatients || 0}
          </h3>
          <p style={{ color: '#64748b' }}>Registered Patients</p>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>Hospital Overview</h3>
        <div className="grid grid-2">
          <div>
            <h4 style={{ color: '#1e293b', marginBottom: '1rem' }}>Recent Activity</h4>
            {appointments.slice(0, 3).map((appointment) => (
              <div 
                key={appointment.id}
                style={{ 
                  padding: '0.75rem', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '0.5rem',
                  marginBottom: '0.5rem'
                }}
              >
                <p style={{ color: '#1e293b', fontSize: '0.9rem' }}>
                  {appointment.patient_name} → Dr. {appointment.doctor_name}
                </p>
                <p style={{ color: '#64748b', fontSize: '0.8rem' }}>
                  {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                </p>
              </div>
            ))}
          </div>
          <div>
            <h4 style={{ color: '#1e293b', marginBottom: '1rem' }}>Quick Actions</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button className="btn btn-primary" style={{ width: '100%' }}>
                Add New Doctor
              </button>
              <button className="btn btn-secondary" style={{ width: '100%' }}>
                View All Appointments
              </button>
              <button className="btn btn-secondary" style={{ width: '100%' }}>
                Generate Reports
              </button>
            </div>
          </div>
        </div>
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

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>
          Welcome back, {user.name}!
        </h1>
        <p style={{ color: '#64748b' }}>
          {user.role === 'patient' && 'Manage your appointments and health records'}
          {user.role === 'doctor' && 'View your schedule and patient appointments'}
          {user.role === 'admin' && 'Oversee hospital operations and manage staff'}
        </p>
      </div>

      {user.role === 'patient' && renderPatientDashboard()}
      {user.role === 'doctor' && renderDoctorDashboard()}
      {user.role === 'admin' && renderAdminDashboard()}
    </div>
  )
}

export default Dashboard