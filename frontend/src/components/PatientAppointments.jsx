import React, { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext' // Import useTheme
import { useAuth } from '../contexts/AuthContext'   // Import useAuth
import axios from 'axios' // Import axios
import { Calendar, Clock, User, MapPin, Phone, Filter, X, Stethoscope, AlertCircle, Loader2 } from 'lucide-react'

// --- Helper Functions for Formatting ---
const formatDate = (isoDate) => {
  if (!isoDate) return 'N/A';
  try {
    const date = new Date(isoDate);
    // Format to 'YYYY-MM-DD'
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

const PatientAppointments = () => {
  const { theme } = useTheme() // Get theme
  const { logout } = useAuth() // Get logout
  
  const [appointments, setAppointments] = useState([]) // This will hold all appointments from API
  const [filteredAppointments, setFilteredAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null) // State for API errors
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterTime, setFilterTime] = useState('all')

  // --- DATA FETCHING ---
  useEffect(() => {
    fetchAppointments()
  }, []) // Runs once on component load

  // --- FILTERING ---
  useEffect(() => {
    // This effect runs whenever the filters or the base appointments list changes
    applyFilters()
  }, [filterStatus, filterTime, appointments])

  const fetchAppointments = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('accessToken')
      // We get all data from the main dashboard endpoint
      const response = await axios.get('/api/dashboard/', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      // Save the appointments array from the response
      setAppointments(response.data.appointments || [])
      
    } catch (err) {
      console.error('Error fetching appointments:', err)
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        setError('Authentication failed. Please log in again.')
        logout()
      } else {
        setError('Failed to load appointments.')
      }
    } finally {
      setLoading(false)
    }
  }

  // --- This is frontend filtering, which is fine ---
  const applyFilters = () => {
    let filtered = [...appointments]

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(apt => apt.status === filterStatus)
    }

    // Time filter
    if (filterTime !== 'all') {
      const now = new Date()
      now.setHours(0, 0, 0, 0); // Set to start of today

      filtered = filtered.filter(apt => {
        // Use appointment_date and appointment_time from backend
        const aptDate = new Date(`${apt.appointment_date}T${apt.appointment_time}`);
        
        switch (filterTime) {
          case 'upcoming':
            return aptDate >= now
          case 'past':
            return aptDate < now
          case 'today':
            return aptDate.toDateString() === now.toDateString()
          case 'this_week':
            const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
            return aptDate >= now && aptDate <= weekFromNow
          default:
            return true
        }
      })
    }
    setFilteredAppointments(filtered)
  }

  // --- UPDATED to call the backend API ---
  const cancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return
    }

    try {
      const token = localStorage.getItem('accessToken')
      // Call the PATCH endpoint to update the status
      await axios.patch(
        `/api/appointments/${appointmentId}/manage/`, 
        { status: 'cancelled' }, // The data we want to change
        { headers: { 'Authorization': `Bearer ${token}` } }
      )
      
      // Success! Refresh the list from the server
      alert('Appointment cancelled successfully.')
      fetchAppointments()

    } catch (err) {
      console.error('Error cancelling appointment:', err)
      alert('Failed to cancel the appointment. It may have already been completed.')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return { bg: theme.isDarkMode ? '#064e3b' : '#dcfce7', color: theme.isDarkMode ? '#34d399' : '#166534' }
      case 'pending':
        return { bg: theme.isDarkMode ? '#78350f' : '#fef3c7', color: theme.isDarkMode ? '#fcd34d' : '#92400e' }
      case 'completed':
        return { bg: theme.isDarkMode ? '#1e3a8a' : '#dbeafe', color: theme.isDarkMode ? '#93c5fd' : '#1e40af' }
      case 'cancelled':
        return { bg: theme.isDarkMode ? '#7f1d1d' : '#fee2e2', color: theme.isDarkMode ? '#fca5a5' : '#991b1b' }
      default:
        return { bg: theme.isDarkMode ? '#374151' : '#f3f4f6', color: theme.isDarkMode ? '#d1d5db' : '#374151' }
    }
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        color: theme.textSecondary
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

  return (
    <div>
      {/* Filters */}
      <div className="card mb-6" style={{
        backgroundColor: theme.cardBackground,
        borderColor: theme.border
      }}>
        <h4 style={{ marginBottom: '1rem', color: theme.text, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={20} />
          Filter Appointments
        </h4>
        
        <div className="grid grid-2" style={{ gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" style={{ color: theme.text }}>Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="form-input"
              style={{
                backgroundColor: theme.background,
                color: theme.text,
                borderColor: theme.border
              }}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ color: theme.text }}>Time Period</label>
            <select
              value={filterTime}
              onChange={(e) => setFilterTime(e.target.value)}
              className="form-input"
              style={{
                backgroundColor: theme.background,
                color: theme.text,
                borderColor: theme.border
              }}
            >
              <option value="all">All Time</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
              <option value="today">Today</option>
              <option value="this_week">This Week</option>
            </select>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="card" style={{
        backgroundColor: theme.cardBackground,
        borderColor: theme.border
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{ color: theme.text }}>
            My Appointments ({filteredAppointments.length})
          </h3>
        </div>

        {filteredAppointments.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredAppointments.map((appointment) => {
              // --- USE API DATA ---
              const doctorName = `Dr. ${appointment.doctor.user.first_name} ${appointment.doctor.user.last_name}`;
              const specialization = appointment.doctor.specialization;
              const hospitalName = appointment.hospital.name;
              const aptDate = formatDate(appointment.appointment_date);
              const aptTime = formatTime(appointment.appointment_time);
              const isPast = new Date(appointment.appointment_date) < new Date();

              return (
                <div 
                  key={appointment.id}
                  style={{ 
                    padding: '1rem', 
                    border: `1px solid ${theme.border}`, 
                    borderRadius: '0.5rem',
                    backgroundColor: theme.background
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <div style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '50%',
                          backgroundColor: '#3b82f6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '1.2rem',
                          flexShrink: 0
                        }}>
                          {doctorName.charAt(4) || 'D'}
                        </div>
                        <div>
                          <h4 style={{ color: theme.text, marginBottom: '0.25rem' }}>
                            {doctorName}
                          </h4>
                          <p style={{ color: theme.textSecondary, fontSize: '0.9rem', margin: 0 }}>
                            {specialization}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ 
                        padding: '0.375rem 0.75rem', 
                        borderRadius: '0.375rem', 
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        ...getStatusColor(appointment.status)
                      }}>
                        {appointment.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    <div style={{ 
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.5rem 0.75rem', backgroundColor: theme.cardBackground,
                      borderRadius: '0.375rem', border: `1px solid ${theme.border}`,
                      fontSize: '0.875rem'
                    }}>
                      <Calendar size={14} style={{ color: theme.textSecondary }} />
                      <span style={{ color: theme.text, fontWeight: '500' }}>{aptDate}</span>
                    </div>

                    <div style={{ 
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.5rem 0.75rem', backgroundColor: theme.cardBackground,
                      borderRadius: '0.375rem', border: `1px solid ${theme.border}`,
                      fontSize: '0.875rem'
                    }}>
                      <Clock size={14} style={{ color: theme.textSecondary }} />
                      <span style={{ color: theme.text, fontWeight: '500' }}>{aptTime}</span>
                    </div>

                    <div style={{ 
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.5rem 0.75rem', backgroundColor: theme.cardBackground,
                      borderRadius: '0.375rem', border: `1px solid ${theme.border}`,
                      fontSize: '0.875rem'
                    }}>
                      <MapPin size={14} style={{ color: theme.textSecondary }} />
                      <span style={{ color: theme.text, fontWeight: '500' }}>{hospitalName}</span>
                    </div>

                    {appointment.token_number && (
                      <div style={{ 
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.5rem 0.75rem', backgroundColor: '#dbeafe',
                        color: '#1e40af', borderRadius: '0.375rem',
                        fontSize: '0.875rem', fontWeight: '500'
                      }}>
                        <User size={14} />
                        Token: {appointment.token_number}
                      </div>
                    )}
                  </div>

                  <div style={{ 
                    display: 'flex', gap: '0.5rem',
                    paddingTop: '1rem', borderTop: `1px solid ${theme.border}`
                  }}>
                    {(appointment.status === 'pending' || appointment.status === 'confirmed') && !isPast && (
                      <button 
                        onClick={() => cancelAppointment(appointment.id)}
                        className="btn btn-secondary" 
                        style={{ 
                          fontSize: '0.9rem',
                          backgroundColor: '#ef4444',
                          display: 'flex', alignItems: 'center', gap: '0.25rem'
                        }}
                      >
                        <X size={14} />
                        Cancel
                      </button>
                    )}
                    {appointment.status === 'completed' && (
                      <button className="btn btn-secondary" style={{ fontSize: '0.9rem' }}>
                        View Prescription
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <Calendar size={48} style={{ color: theme.textSecondary, margin: '0 auto 1rem' }} />
            <p style={{ color: theme.textSecondary, fontSize: '1.1rem' }}>
              No appointments found
            </p>
            <p style={{ color: theme.textSecondary, fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Try adjusting your filters or book a new appointment.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default PatientAppointments