import React, { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { Users, TrendingUp, Activity, Clock, User, Stethoscope, Calendar, AlertCircle } from 'lucide-react'
import { hospitalAPI } from '../utils/api'
import { useAuth } from '../contexts/AuthContext'

const HospitalDashboard = () => {
  const { theme } = useTheme()
  const { logout } = useAuth() // Get logout function
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await hospitalAPI.getDashboardSummary()
        setDashboardData(response.data)
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          setError('Authentication failed. Please log in again.')
          logout()
        } else if (err.response && err.response.status === 404) {
          setError('Hospital profile not found. Please complete your profile.')
        } else {
          setError('Failed to load dashboard data.')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [logout])

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh' 
      }}>
        <div style={{ color: theme.text }}>Loading dashboard...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card" style={{ 
        backgroundColor: '#fee2e2', 
        borderColor: '#ef4444' 
      }}>
        <h3 style={{ color: '#991b1b' }}>Error</h3>
        <p style={{ color: '#b91c1c' }}>{error}</p>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="card">
        <p style={{ color: theme.textSecondary }}>No dashboard data available.</p>
      </div>
    )
  }

  // Helper to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return { bg: '#dcfce7', color: '#166534' } // Green
      case 'pending':
        return { bg: '#fef3c7', color: '#92400e' } // Yellow
      case 'completed':
        return { bg: '#dbeafe', color: '#1e40af' } // Blue
      case 'cancelled':
        return { bg: '#fee2e2', color: '#991b1b' } // Red
      default:
        return { bg: '#e5e7eb', color: '#374151' } // Gray
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: theme.text, margin: '0 0 0.5rem 0', fontSize: '2rem' }}>Dashboard</h1>
        <p style={{ color: theme.textSecondary, margin: 0 }}>Welcome back! Here's your hospital overview</p>
      </div>

      {/* Stats Cards - Updated to use dashboardData.summary_cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <p style={{ color: theme.textSecondary, margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>Total Patients</p>
              <h2 style={{ color: theme.text, margin: '0 0 0.25rem 0', fontSize: '2rem' }}>
                {dashboardData.summary_cards.total_patients.toLocaleString()}
              </h2>
              {/* <p style={{ color: '#10b981', margin: 0, fontSize: '0.85rem' }}>
                <TrendingUp size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                +3.8% from last month
              </p> */}
            </div>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#dbeafe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Users size={24} style={{ color: '#3b82f6' }} />
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <p style={{ color: theme.textSecondary, margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>Total Doctors</p>
              <h2 style={{ color: theme.text, margin: '0 0 0.25rem 0', fontSize: '2rem' }}>
                {dashboardData.summary_cards.total_doctors}
              </h2>
              {/* <p style={{ color: '#10b981', margin: 0, fontSize: '0.85rem' }}>
                <TrendingUp size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                +1.7% last month
              </p> */}
            </div>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#dcfce7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Stethoscope size={24} style={{ color: '#10b981' }} />
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <p style={{ color: theme.textSecondary, margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>Total Staff</p>
              <h2 style={{ color: theme.text, margin: '0 0 0.25rem 0', fontSize: '2rem' }}>
                {dashboardData.summary_cards.total_staff}
              </h2>
            </div>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#fef3c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Users size={24} style={{ color: '#f59e0b' }} />
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <p style={{ color: theme.textSecondary, margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>Bed Occupancy</p>
              <h2 style={{ color: theme.text, margin: '0 0 0.25rem 0', fontSize: '2rem' }}>
                {dashboardData.summary_cards.bed_occupancy_rate}%
              </h2>
              {/* <p style={{ color: '#ef4444', margin: 0, fontSize: '0.85rem' }}>
                <TrendingUp size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                -5.3% from last month
              </p> */}
            </div>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#fee2e2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Activity size={24} style={{ color: '#ef4444' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Today's Appointments */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ color: theme.text, margin: '0 0 1.5rem 0', fontSize: '1.25rem' }}>Today's Confirmed Appointments</h3>
        
        {dashboardData.todays_appointments && dashboardData.todays_appointments.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {dashboardData.todays_appointments.map(apt => (
              <div key={apt.id} style={{
                padding: '1rem',
                border: `1px solid ${theme.border || '#e5e7eb'}`,
                borderRadius: '8px',
                backgroundColor: theme.background || '#fafafa'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                  <div>
                    <h4 style={{ color: theme.text, margin: '0 0 0.25rem 0' }}>
                      {apt.patient.user.first_name} {apt.patient.user.last_name}
                    </h4>
                    <p style={{ color: theme.textSecondary, margin: 0, fontSize: '0.85rem' }}>
                      ID: {apt.patient.user.custom_id}
                    </p>
                  </div>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    ...getStatusColor(apt.status)
                  }}>
                    {apt.status.toUpperCase()}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Stethoscope size={14} style={{ color: theme.textSecondary }} />
                  <span style={{ color: theme.textSecondary, fontSize: '0.85rem' }}>
                    Dr. {apt.doctor.user.first_name} {apt.doctor.user.last_name}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={14} style={{ color: theme.textSecondary }} />
                  <span style={{ color: theme.text, fontSize: '0.85rem', fontWeight: '500' }}>
                    {new Date(apt.appointment_datetime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <Calendar size={48} style={{ color: theme.textSecondary, margin: '0 auto 1rem', opacity: 0.5 }} />
            <p style={{ color: theme.textSecondary, margin: 0 }}>
              No confirmed appointments for today
            </p>
            <p style={{ color: theme.textSecondary, margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
              Appointments will appear here once scheduled
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default HospitalDashboard