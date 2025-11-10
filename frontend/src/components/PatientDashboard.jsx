import React, { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext' 
import axios from 'axios' 
import { Calendar, Stethoscope, FileText, Pill, Clock, AlertCircle } from 'lucide-react'

// --- Helper Functions (No changes here) ---
const formatDate = (isoDate) => {
  if (!isoDate) return 'N/A';
  try {
    const date = new Date(isoDate);
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting date:', isoDate, error);
    return 'Invalid Date';
  }
};
const formatTime = (timeString) => {
  if (!timeString) return 'N/A';
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
  
  const [dashboardData, setDashboardData] = useState({
    appointments: [], 
    medical_reports: [], 
    prescriptions: [] 
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      setError(null)
      try {
        const token = localStorage.getItem('accessToken')
        const response = await axios.get('/api/dashboard/', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        const allAppointments = response.data.appointments || [];
        const now = new Date();
        const upcoming = allAppointments.filter(apt => {
            const aptDate = new Date(`${apt.appointment_date}T${apt.appointment_time}`);
            return aptDate >= now && (apt.status === 'pending' || apt.status === 'confirmed');
        }).slice(0, 3); 

        setDashboardData({
            appointments: upcoming,
            medical_reports: (response.data.medical_reports || []).slice(0, 3), 
            prescriptions: (response.data.prescriptions || []).slice(0, 5) 
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

  // --- RENDER FUNCTIONS ---

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: theme.textSecondary }}>
        Loading dashboard...
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

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: theme.text, margin: '0 0 0.5rem 0', fontSize: '2rem' }}>
          Welcome, {user?.email || 'Patient'}!
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
            {dashboardData.appointments.length > 0 ? (
              dashboardData.appointments.map(apt => {
                const doctorName = `Dr. N/A`; // Placeholder as SimpleAppointmentSerializer doesn't include doctor
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
                      <span>{formatDate(apt.appointment_date)}</span>
                      <Clock size={16} style={{ marginLeft: '1rem' }} />
                      <span>{formatTime(apt.appointment_time)}</span>
                    </div>
                  </div>
                )
              })
            ) : (
              <p style={{ color: theme.textSecondary, textAlign: 'center', margin: '1rem 0' }}>
                You have no upcoming appointments.
              </p>
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
              <p style={{ color: theme.textSecondary, textAlign: 'center', margin: '1rem 0' }}>
                No recent reports found.
              </p>
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
                {dashboardData.prescriptions.length > 0 ? (
                  dashboardData.prescriptions.map(presc => {
                    // --- THIS IS THE FIX ---
                    // The SimplePrescriptionSerializer provides 'doctor' as a string
                    // and 'medication' as an object with a 'name' field
                    const doctorName = presc.doctor || "N/A";
                    const medicationName = presc.medication?.name || "N/A"; // Use the nested object
                    // --- END OF FIX ---
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
                    <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: theme.textSecondary }}>
                      No recent prescriptions found.
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

export default PatientDashboard