import React, { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { Users, TrendingUp, Activity, Clock } from 'lucide-react'

const HospitalDashboard = () => {
  const { theme } = useTheme()
  const [stats, setStats] = useState({
    totalPatients: 2847,
    totalDoctors: 156,
    bedOccupancy: 78.5,
    todayAppointments: []
  })

  useEffect(() => {
    // Mock today's appointments
    const mockAppointments = [
      {
        id: 1,
        patientName: 'John Smith',
        patientId: 'P001',
        doctorName: 'Dr. Sarah Johnson',
        doctorId: 'D001',
        time: '09:00 AM',
        status: 'Follow-up'
      },
      {
        id: 2,
        patientName: 'Emma Wilson',
        patientId: 'P002',
        doctorName: 'Dr. Michael Chen',
        doctorId: 'D002',
        time: '10:30 AM',
        status: 'Consultation'
      },
      {
        id: 3,
        patientName: 'Lisa Anderson',
        patientId: 'P004',
        doctorName: 'Dr. Priya Patel',
        doctorId: 'D003',
        time: '02:03 PM',
        status: 'Check-up'
      },
      {
        id: 4,
        patientName: 'Robert Brown',
        patientId: 'P003',
        doctorName: 'Dr. Sarah Johnson',
        doctorId: 'D001',
        time: '03:30 PM',
        status: 'Consultation'
      }
    ]
    setStats(prev => ({ ...prev, todayAppointments: mockAppointments }))
  }, [])

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: theme.text, margin: '0 0 0.5rem 0', fontSize: '2rem' }}>Dashboard</h1>
        <p style={{ color: theme.textSecondary, margin: 0 }}>Welcome back! Here's your hospital overview</p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <p style={{ color: theme.textSecondary, margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>Total Patients</p>
              <h2 style={{ color: theme.text, margin: '0 0 0.25rem 0', fontSize: '2rem' }}>{stats.totalPatients.toLocaleString()}</h2>
              <p style={{ color: '#10b981', margin: 0, fontSize: '0.85rem' }}>
                <TrendingUp size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                +3.8% from last month
              </p>
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
              <h2 style={{ color: theme.text, margin: '0 0 0.25rem 0', fontSize: '2rem' }}>{stats.totalDoctors}</h2>
              <p style={{ color: '#10b981', margin: 0, fontSize: '0.85rem' }}>
                <TrendingUp size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                +1.7% last month
              </p>
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
              <Activity size={24} style={{ color: '#10b981' }} />
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <p style={{ color: theme.textSecondary, margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>Bed Occupancy</p>
              <h2 style={{ color: theme.text, margin: '0 0 0.25rem 0', fontSize: '2rem' }}>{stats.bedOccupancy}%</h2>
              <p style={{ color: '#ef4444', margin: 0, fontSize: '0.85rem' }}>
                <TrendingUp size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                -5.3% from last month
              </p>
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
        <h3 style={{ color: theme.text, margin: '0 0 1.5rem 0', fontSize: '1.25rem' }}>Today's Appointments</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {stats.todayAppointments.map(apt => (
            <div key={apt.id} style={{
              padding: '1rem',
              border: `1px solid ${theme.border || '#e5e7eb'}`,
              borderRadius: '8px',
              backgroundColor: theme.background || '#fafafa'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                <div>
                  <h4 style={{ color: theme.text, margin: '0 0 0.25rem 0' }}>{apt.patientName}</h4>
                  <p style={{ color: theme.textSecondary, margin: 0, fontSize: '0.85rem' }}>ID: {apt.patientId}</p>
                </div>
                <span style={{
                  padding: '0.25rem 0.75rem',
                  backgroundColor: '#dbeafe',
                  color: '#1e40af',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: '500'
                }}>
                  {apt.status}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Users size={14} style={{ color: theme.textSecondary }} />
                <span style={{ color: theme.textSecondary, fontSize: '0.85rem' }}>{apt.doctorName}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={14} style={{ color: theme.textSecondary }} />
                <span style={{ color: theme.text, fontSize: '0.85rem', fontWeight: '500' }}>{apt.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default HospitalDashboard
