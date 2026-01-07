import React, { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext' // Import useAuth
import axios from 'axios' // Import axios
import { Calendar, Clock, User, Stethoscope, Search, Check, X, MoreHorizontal, Filter, AlertCircle } from 'lucide-react'

// Helper function to format date
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

// Helper function to format time
const formatTime = (timeString) => {
  if (!timeString) return 'N/A';
  // Assuming timeString is in "HH:MM:SS" format
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

const HospitalAppointments = () => {
  const { theme } = useTheme()
  const { logout } = useAuth() // Get logout function

  // --- STATE FOR API DATA ---
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // --- STATE FOR FILTERS ---
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // 'all', 'pending', 'confirmed', 'completed', 'cancelled'
  const [dateFilter, setDateFilter] = useState('') // YYYY-MM-DD

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true)
      setError(null)
      try {
        const token = localStorage.getItem('accessToken')
        
        // Prepare query parameters based on filters
        const params = new URLSearchParams()
        if (searchTerm) {
          params.append('search', searchTerm)
        }
        if (statusFilter !== 'all') {
          params.append('status', statusFilter)
        }
        if (dateFilter) {
          params.append('appointment_date', dateFilter)
        }

        // Make the API call
        const response = await axios.get('/api/hospital/appointments/', {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          params: params
        })
        
        setAppointments(response.data) // Save the appointments

      } catch (err) {
        console.error('Error fetching appointments:', err)
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          setError('Authentication failed. Please log in again.')
          logout() // Logout on auth error
        } else {
          setError('Failed to load appointment data.')
        }
      } finally {
        setLoading(false)
      }
    }

    // Debounce the search term to avoid excessive API calls
    const searchTimeout = setTimeout(() => {
      fetchAppointments()
    }, 500) // 500ms delay for search

    // Clear the timeout if the user types again
    return () => clearTimeout(searchTimeout)

  }, [searchTerm, statusFilter, dateFilter, logout]) // Re-run effect if any filter changes

  
  // --- ACTION HANDLERS (Mocked for now) ---
  const handleUpdateStatus = (id, newStatus) => {
    // In a real app, you'd call a PATCH API here
    alert(`(Mock) Updating appointment ${id} to ${newStatus}`);
    
    // Optimistic UI update (for demo)
    setAppointments(prev => 
      prev.map(apt => apt.id === id ? { ...apt, status: newStatus } : apt)
    )
  }

  // --- RENDER FUNCTIONS ---

  const getStatusChip = (status) => {
    const colors = {
      pending: { bg: '#fffbeb', text: '#f59e0b' },
      confirmed: { bg: '#f0f9ff', text: '#3b82f6' },
      completed: { bg: '#f0fdf4', text: '#22c55e' },
      cancelled: { bg: '#fef2f2', text: '#ef4444' },
      default: { bg: '#f3f4f6', text: '#6b7280' }
    }
    const style = colors[status.toLowerCase()] || colors.default
    
    return (
      <span style={{
        padding: '0.25rem 0.75rem',
        backgroundColor: style.bg,
        color: style.text,
        borderRadius: '20px',
        fontSize: '0.8rem',
        fontWeight: '500',
        textTransform: 'capitalize'
      }}>
        {status}
      </span>
    )
  }

  return (
    <div>
      {/* Header and Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ color: theme.text, margin: '0 0 0.5rem 0', fontSize: '2rem' }}>Appointments</h1>
          <p style={{ color: theme.textSecondary, margin: 0 }}>View and manage all appointments</p>
        </div>
        
        {/* Filter Controls */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search Bar */}
          <div style={{ position: 'relative', minWidth: '250px' }}>
            <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: theme.textSecondary }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by patient or doctor..."
              style={{
                padding: '0.75rem 1rem 0.75rem 3rem',
                borderRadius: '8px',
                border: `1px solid ${theme.border || '#e2e8f0'}`,
                backgroundColor: theme.cardBackground,
                color: theme.text,
                fontSize: '0.9rem',
                width: '100%'
              }}
            />
          </div>

          {/* Date Filter */}
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            style={{
              padding: '0.65rem 1rem', // Slightly less padding for date input
              borderRadius: '8px',
              border: `1px solid ${theme.border || '#e2e8f0'}`,
              backgroundColor: theme.cardBackground,
              color: theme.text,
              fontSize: '0.9rem',
              colorScheme: theme.name === 'dark' ? 'dark' : 'light'
            }}
          />

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: `1px solid ${theme.border || '#e2e8f0'}`,
              backgroundColor: theme.cardBackground,
              color: theme.text,
              fontSize: '0.9rem'
            }}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left'
          }}>
            <thead style={{
              borderBottom: `1px solid ${theme.border || '#e5e7eb'}`,
              backgroundColor: theme.background || '#f9fafb'
            }}>
              <tr>
                <th style={{ padding: '1rem 1.5rem', color: theme.textSecondary, fontSize: '0.85rem', fontWeight: '500' }}>Patient</th>
                <th style={{ padding: '1rem 1.5rem', color: theme.textSecondary, fontSize: '0.85rem', fontWeight: '500' }}>Doctor</th>
                <th style={{ padding: '1rem 1.5rem', color: theme.textSecondary, fontSize: '0.85rem', fontWeight: '500' }}>Date & Time</th>
                <th style={{ padding: '1rem 1.5rem', color: theme.textSecondary, fontSize: '0.85rem', fontWeight: '500' }}>Type</th>
                <th style={{ padding: '1rem 1.5rem', color: theme.textSecondary, fontSize: '0.85rem', fontWeight: '500' }}>Status</th>
                <th style={{ padding: '1rem 1.5rem', color: theme.textSecondary, fontSize: '0.85rem', fontWeight: '500' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: theme.textSecondary }}>
                    Loading appointments...
                  </td>
                </tr>
              )}
              
              {!loading && error && (
                <tr>
                  <td colSpan="6" style={{ padding: '2rem', textAlign: 'center' }}>
                    <div style={{ color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                      <AlertCircle size={20} />
                      <span>{error}</span>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && !error && appointments.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: theme.textSecondary }}>
                    No appointments found matching your filters.
                  </td>
                </tr>
              )}

              {!loading && !error && appointments.length > 0 && (
                appointments.map(apt => {
                  // --- UPDATED to use API data structure ---
                  // API: { id, patient: { user: { ... } }, doctor: { user: { ... } }, ... }
                  const patientName = `${apt.patient.user.first_name || ''} ${apt.patient.user.last_name || ''}`.trim();
                  const doctorName = `Dr. ${apt.doctor.user.first_name || ''} ${apt.doctor.user.last_name || ''}`.trim();

                  return (
                    <tr key={apt.id} style={{ borderBottom: `1px solid ${theme.border || '#e5e7eb'}` }}>
                      {/* Patient Info */}
                      <td style={{ padding: '1rem 1.5rem', color: theme.text, fontWeight: '500' }}>
                        {patientName || 'N/A'}
                      </td>
                      
                      {/* Doctor Info */}
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Stethoscope size={16} style={{ color: theme.textSecondary, flexShrink: 0 }} />
                          <span style={{ color: theme.text, fontSize: '0.9rem' }}>{doctorName || 'N/A'}</span>
                        </div>
                      </td>
                      
                      {/* Date & Time */}
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <Calendar size={16} style={{ color: theme.textSecondary, flexShrink: 0 }} />
                          <span style={{ color: theme.text, fontSize: '0.9rem' }}>{formatDate(apt.appointment_date)}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Clock size={16} style={{ color: theme.textSecondary, flexShrink: 0 }} />
                          <span style={{ color: theme.text, fontSize: '0.9rem' }}>{formatTime(apt.appointment_time)}</span>
                        </div>
                      </td>
                      
                      {/* Type */}
                      <td style={{ padding: '1rem 1.5rem', color: theme.text, fontSize: '0.9rem', textTransform: 'capitalize' }}>
                        {apt.appointment_type ? apt.appointment_type.replace('_', ' ') : 'N/A'}
                      </td>
                      
                      {/* Status */}
                      <td style={{ padding: '1rem 1.5rem' }}>
                        {getStatusChip(apt.status)}
                      </td>
                      
                      {/* Actions (Mocked) */}
                      <td style={{ padding: '1rem 1.5rem' }}>
                        {/* A simple dropdown for actions */}
                        <div style={{ position: 'relative' }}>
                          {/* We can wire this up later. For now, just show buttons for pending/confirmed */}
                          {apt.status.toLowerCase() === 'pending' && (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button 
                                onClick={() => handleUpdateStatus(apt.id, 'confirmed')}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#22c55e' }}
                                title="Confirm"
                              >
                                <Check size={20} />
                              </button>
                              <button 
                                onClick={() => handleUpdateStatus(apt.id, 'cancelled')}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                                title="Cancel"
                              >
                                <X size={20} />
                              </button>
                            </div>
                          )}
                          {apt.status.toLowerCase() === 'confirmed' && (
                            <button 
                              onClick={() => handleUpdateStatus(apt.id, 'cancelled')}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                              title="Cancel"
                            >
                              <X size={20} />
                            </button>
                          )}
                          {/* For completed/cancelled, show no actions */}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default HospitalAppointments