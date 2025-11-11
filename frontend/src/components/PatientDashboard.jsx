import React, { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext' 
import { patientAPI } from '../utils/api'
import { Calendar, Stethoscope, FileText, Pill, Clock, AlertCircle, Loader2 } from 'lucide-react' // Added Loader2

// --- Helper Functions (No changes here) ---
const formatDate = (isoDate) => {
  if (!isoDate) return 'N/A';
  try {
    const date = new Date(isoDate);
    // This will handle both full datetime strings and date-only strings
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting date:', isoDate, error);
    return 'Invalid Date';
  }
};
const formatTime = (timeString) => {
  if (!timeString) return 'N/A';
  // Assuming timeString is in "HH:MM:SS" or "HH:MM" format
  try {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const minute = parseInt(minutes, 10);
    
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
    const formattedMinute = minute < 10 ? `0${minute}` : minute;
    
    return `${formattedHour}:${formattedMinute} ${ampm}`;
  } catch (error) {
    console.error('Error formatting time:', timeString, error);
    return 'Invalid Time';
  }
};
const getStatusChipStyles = (status, theme) => {
    const colors = {
      pending: { bg: '#fffbeb', text: '#f59e0b' },
      confirmed: { bg: '#f0f9ff', text: '#3b82f6' },
      completed: { bg: '#f0fdf4', text: '#22c55e' },
      cancelled: { bg: '#fef2f2', text: '#ef4444' },
      default: { bg: theme.background || '#f3f4f6', text: theme.textSecondary || '#6b7280' }
    }
    const style = colors[status.toLowerCase()] || colors.default
    return {
      padding: '0.25rem 0.75rem',
      backgroundColor: style.bg,
      color: style.text,
      borderRadius: '20px',
      fontSize: '0.8rem',
      fontWeight: '500',
      textTransform: 'capitalize'
    }
}
// --- End of Helper Functions ---

const PatientDashboard = () => {
  const { theme } = useTheme()
  const { user, logout } = useAuth() 
  
  // --- 1. UPDATED STATE ---
  // This state now matches the PatientDashboardSerializer payload
  const [dashboardData, setDashboardData] = useState({
    profile: null,
    upcoming_appointments: [],
    recent_appointments: [], // We can use this later
    prescriptions: [],
    notifications: [], // We can use this later
    stats: {},
    medical_reports: [] // We'll derive this from profile
  })
  // --- END OF UPDATED STATE ---

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // --- 2. UPDATED useEffect ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await patientAPI.getDashboard()
        const data = response.data; 

        // Medical reports are nested inside the 'profile' object
        const reports = data.profile?.medical_reports || [];

        setDashboardData({
            profile: data.profile || null,
            upcoming_appointments: (data.upcoming_appointments || []).slice(0, 3),
            recent_appointments: (data.recent_appointments || []).slice(0, 3),
            medical_reports: reports.slice(0, 3), 
            prescriptions: (data.prescriptions || []).slice(0, 5),
            notifications: data.notifications || [],
            stats: data.stats || {} 
        })

      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          setError('Authentication failed. Please log in again.')
          logout() 
        } else {
          setError('Failed to load dashboard data.')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [logout])
  // --- END OF UPDATED useEffect ---

  // --- RENDER FUNCTIONS ---

  if (loading) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '2rem', 
        color: theme.textSecondary,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh'
      }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="card" style={{ backgroundColor: '#fee2e2', borderColor: '#ef4444' }}>
        <h3 style={{ color: '#991b1b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={20} />
          Error
        </h3>
        <p style={{ color: '#b91c1c' }}>{error}</p>
      </div>
    )
  }

  // --- 3. UPDATED JSX ---
  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: theme.text, margin: '0 0 0.5rem 0', fontSize: '2rem' }}>
          {/* Use the name from the profile object */}
          Welcome, {dashboardData.profile?.user?.first_name || 'Patient'}!
        </h1>
        <p style={{ color: theme.textSecondary, margin: 0 }}>Here's a summary of your health dashboard.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        
        {/* Upcoming Appointments */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ color: theme.text, margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Calendar size={24} style={{ color: '#3b82f6' }} />
            Upcoming Appointments
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Loop over upcoming_appointments */}
            {dashboardData.upcoming_appointments.length > 0 ? (
              dashboardData.upcoming_appointments.map(apt => {
                // The API provides apt.doctor.name
                const doctorName = apt.doctor?.name || 'Doctor'
                return (
                  <div key={apt.id} style={{
                    padding: '1rem',
                    backgroundColor: theme.background || '#f8fafc',
                    borderRadius: '8px',
                    border: `1px solid ${theme.border || '#e5e7eb'}`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ color: theme.text, fontWeight: '500' }}>{doctorName}</span>
                      <span style={getStatusChipStyles(apt.status, theme)}>{apt.status}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: theme.textSecondary, fontSize: '0.9rem' }}>
                      <Calendar size={16} />
                      {/* Use the fields from normalize_appointment_row */}
                      <span>{formatDate(apt.appointment_date)}</span>
                      <Clock size={16} style={{ marginLeft: '1rem' }} />
                      <span>{formatTime(apt.appointment_time)}</span>
                    </div>
                  </div>
                )
              })
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <Calendar size={48} style={{ color: theme.textSecondary, margin: '0 auto 1rem', opacity: 0.5 }} />
                <p style={{ color: theme.textSecondary, margin: 0 }}>
                  No upcoming appointments
                </p>
                <p style={{ color: theme.textSecondary, margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
                  Book your first appointment to get started
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Medical Reports */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ color: theme.text, margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FileText size={24} style={{ color: '#10b981' }} />
            Recent Medical Reports
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* This was already correct */}
            {dashboardData.medical_reports.length > 0 ? (
              dashboardData.medical_reports.map(report => (
                <div key={report.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '1rem', backgroundColor: theme.background || '#f8fafc',
                  borderRadius: '8px', border: `1px solid ${theme.border || '#e5e7eb'}`
                }}>
                  <div>
                    <h4 style={{ color: theme.text, margin: '0 0 0.25rem 0' }}>{report.report_type}</h4>
                    <p style={{ color: theme.textSecondary, margin: 0, fontSize: '0.85rem' }}>
                      Uploaded: {formatDate(report.created_at)}
                    </p>
                  </div>
                  <a
                    href={report.report_file} 
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '6px',
                      fontSize: '0.85rem'
                    }}
                  >
                    View
                  </a>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <FileText size={48} style={{ color: theme.textSecondary, margin: '0 auto 1rem', opacity: 0.5 }} />
                <p style={{ color: theme.textSecondary, margin: 0 }}>
                  No medical reports yet
                </p>
                <p style={{ color: theme.textSecondary, margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
                  Your reports will appear here once uploaded
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Recent Prescriptions */}
        <div className="card" style={{ padding: '1.5rem', gridColumn: '1 / -1' }}>
          <h3 style={{ color: theme.text, margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Pill size={24} style={{ color: '#8b5cf6' }} />
            Recent Prescriptions
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${theme.border || '#e5e7eb'}` }}>
                  <th style={{ padding: '0.75rem 1rem', color: theme.textSecondary, fontSize: '0.85rem', fontWeight: '500', textAlign: 'left' }}>Medication</th>
                  <th style={{ padding: '0.75rem 1rem', color: theme.textSecondary, fontSize: '0.85rem', fontWeight: '500', textAlign: 'left' }}>Dosage</th>
                  <th style={{ padding: '0.75rem 1rem', color: theme.textSecondary, fontSize: '0.85rem', fontWeight: '500', textAlign: 'left' }}>Frequency</th>
                  <th style={{ padding: '0.75rem 1rem', color: theme.textSecondary, fontSize: '0.85rem', fontWeight: '500', textAlign: 'left' }}>Doctor</th>
                  <th style={{ padding: '0.75rem 1rem', color: theme.textSecondary, fontSize: '0.85rem', fontWeight: '500', textAlign: 'left' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {/* This was already correct */}
                {dashboardData.prescriptions.length > 0 ? (
                  dashboardData.prescriptions.map(presc => {
                    const doctorName = presc.doctor || "N/A" // presc.doctor is a string
                    const medicationName = presc.medication?.name || "N/A"
                    return (
                      <tr key={presc.id} style={{ borderBottom: `1px solid ${theme.border || '#e5e7eb'}` }}>
                        <td style={{ padding: '1rem', color: theme.text, fontWeight: '500' }}>{medicationName}</td>
                        <td style={{ padding: '1rem', color: theme.textSecondary, fontSize: '0.9rem' }}>{presc.dosage}</td>
                        <td style={{ padding: '1rem', color: theme.textSecondary, fontSize: '0.9rem' }}>{presc.frequency}</td>
                        <td style={{ padding: '1rem', color: theme.textSecondary, fontSize: '0.9rem' }}>{doctorName}</td>
                        <td style={{ padding: '1rem', color: theme.textSecondary, fontSize: '0.9rem' }}>{formatDate(presc.prescription_date)}</td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan="5" style={{ padding: '3rem', textAlign: 'center' }}>
                      <Pill size={48} style={{ color: theme.textSecondary, margin: '0 auto 1rem', opacity: 0.5 }} />
                      <p style={{ color: theme.textSecondary, margin: 0 }}>
                        No prescriptions yet
                      </p>
                      <p style={{ color: theme.textSecondary, margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
                        Your prescriptions will appear here after doctor visits
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
// --- END OF UPDATED JSX ---

export default PatientDashboard