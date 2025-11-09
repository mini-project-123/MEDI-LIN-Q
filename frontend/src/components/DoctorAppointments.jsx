import React, { useState, useEffect } from 'react'
import { Calendar, Clock, Filter, Search, User, Phone } from 'lucide-react'
import axios from 'axios' // 1. IMPORT AXIOS

const DoctorAppointments = () => {
  // 2. We only need one state for appointments now
  const [appointments, setAppointments] = useState([]) 
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: '',
    date: '',
    timeStart: '',
    timeEnd: ''
  })

  // 3. This useEffect now re-fetches data ANYTIME the filters change
  useEffect(() => {
    fetchAppointments()
  }, [filters]) // Dependency array changed to [filters]

  // 4. This function is now rewritten for API calls
  const fetchAppointments = async () => {
    setLoading(true)
    try {
      // Get the auth token
      const token = localStorage.getItem('accessToken');
      
      // Prepare the query parameters from the filter state
      const params = new URLSearchParams()
      if (filters.status) {
        params.append('status', filters.status)
      }
      if (filters.date) {
        params.append('date', filters.date)
      }
      if (filters.timeStart) {
        // Backend expects HH:MM format
        params.append('time_start', filters.timeStart)
      }
      if (filters.timeEnd) {
        // Backend expects HH:MM format
        params.append('time_end', filters.timeEnd)
      }

      // Make the API call
      //
      const response = await axios.get('/api/doctor/appointments/', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: params // Pass the filters as query parameters
      })
      
      // 5. Set the response data (which is already filtered by the backend)
      setAppointments(response.data)

    } catch (error) {
      console.error('Error fetching appointments:', error)
      // You could add error handling here, e.g., redirect on 401/403
    } finally {
      setLoading(false)
    }
  }

  // 6. applyFilters() function is no longer needed, so it's been removed.

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }))
  }

  const clearFilters = () => {
    setFilters({
      status: '',
      date: '',
      timeStart: '',
      timeEnd: ''
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return { bg: '#dcfce7', color: '#166534' }
      case 'pending':
        return { bg: '#fef3c7', color: '#92400e' }
      case 'completed':
        return { bg: '#dbeafe', color: '#1e40af' }
      case 'cancelled':
        return { bg: '#fee2e2', color: '#dc2626' }
      default:
        return { bg: '#f3f4f6', color: '#374151' }
    }
  }

  const renderFilters = () => (
    <div className="card mb-6">
      <h3 style={{ marginBottom: '1rem', color: '#1e293b' }}>
        <Filter size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
        Filter Appointments
      </h3>
      
      <div className="grid grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
        <div className="form-group">
          <label className="form-label">Status</label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="form-input"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Date</label>
          <input
            type="date"
            value={filters.date}
            onChange={(e) => handleFilterChange('date', e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Start Time</label>
          <input
            type="time"
            value={filters.timeStart}
            onChange={(e) => handleFilterChange('timeStart', e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">End Time</label>
          <input
            type="time"
            value={filters.timeEnd}
            onChange={(e) => handleFilterChange('timeEnd', e.target.value)}
            className="form-input"
          />
        </div>
      </div>

      <button onClick={clearFilters} className="btn btn-secondary">
        Clear Filters
      </button>
    </div>
  )

  const renderAppointmentsList = () => (
    <div className="card">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <h3 style={{ color: '#1e293b' }}>
          {/* 7. Use appointments.length */}
          Appointments ({appointments.length}) 
        </h3>
      </div>

      {/* 8. Check appointments.length */}
      {appointments.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* 9. Map over appointments */}
          {appointments.map((appointment) => (
            <div 
              key={appointment.id}
              style={{ 
                padding: '1rem', 
                border: '1px solid #e5e7eb', 
                borderRadius: '0.5rem',
                backgroundColor: '#fafafa'
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
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: '#3b82f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold'
                    }}>
                      {/* 10. Use backend serializer structure */}
                      {appointment.patient?.user?.first_name?.charAt(0)}
                      {appointment.patient?.user?.last_name?.charAt(0)}
                    </div>
                    <div>
                      <h4 style={{ color: '#1e293b', marginBottom: '0.25rem' }}>
                        {appointment.patient?.user?.first_name} {appointment.patient?.user?.last_name}
                      </h4>
                      <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                        ID: {appointment.patient?.user?.custom_id} • Token: {appointment.token_number}
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

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  backgroundColor: 'white',
                  borderRadius: '0.375rem',
                  border: '1px solid #e5e7eb',
                  fontSize: '0.875rem'
                }}>
                  <Calendar size={14} style={{ color: '#64748b' }} />
                  <span style={{ color: '#1e293b', fontWeight: '500' }}>
                    {new Date(appointment.appointment_datetime).toLocaleDateString()}
                  </span>
                </div>

                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  backgroundColor: 'white',
                  borderRadius: '0.375rem',
                  border: '1px solid #e5e7eb',
                  fontSize: '0.875rem'
                }}>
                  <Clock size={14} style={{ color: '#64748b' }} />
                  <span style={{ color: '#1e293b', fontWeight: '500' }}>
                    {new Date(appointment.appointment_datetime).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              </div>

              <div style={{ 
                marginTop: '0.75rem', 
                paddingTop: '0.75rem', 
                borderTop: '1px solid #e5e7eb',
                display: 'flex',
                gap: '0.5rem'
              }}>
                <button className="btn btn-primary" style={{ fontSize: '0.9rem' }}>
                  View Details
                </button>
                {appointment.status === 'pending' && (
                  <>
                    <button className="btn btn-success" style={{ fontSize: '0.9rem' }}>
                      Confirm
                    </button>
                    <button className="btn btn-secondary" style={{ fontSize: '0.9rem' }}>
                      Reschedule
                    </button>
                  </>
                )}
                {appointment.status === 'confirmed' && (
                  <button className="btn btn-success" style={{ fontSize: '0.9rem' }}>
                    Mark Complete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: '#64748b', textAlign: 'center', padding: '3rem' }}>
          No appointments found matching your filters.
        </p>
      )}
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
        <div>Loading appointments...</div>
      </div>
    )
  }

  return (
    <div>
      {renderFilters()}
      {renderAppointmentsList()}
    </div>
  )
}

export default DoctorAppointments