import React, { useState, useEffect } from 'react'
import { Calendar, Clock, Filter, Search, User, Phone } from 'lucide-react'
import axios from 'axios'

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([])
  const [filteredAppointments, setFilteredAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: '',
    date: '',
    timeStart: '',
    timeEnd: ''
  })

  useEffect(() => {
    fetchAppointments()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [filters, appointments])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/doctor/appointments/')
      setAppointments(response.data)
      setFilteredAppointments(response.data)
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...appointments]

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(apt => apt.status === filters.status)
    }

    // Date filter
    if (filters.date) {
      filtered = filtered.filter(apt => 
        new Date(apt.appointment_datetime).toDateString() === 
        new Date(filters.date).toDateString()
      )
    }

    // Time range filter
    if (filters.timeStart && filters.timeEnd) {
      filtered = filtered.filter(apt => {
        const aptTime = new Date(apt.appointment_datetime).toTimeString().slice(0, 5)
        return aptTime >= filters.timeStart && aptTime <= filters.timeEnd
      })
    }

    setFilteredAppointments(filtered)
  }

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
          Appointments ({filteredAppointments.length})
        </h3>
      </div>

      {filteredAppointments.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredAppointments.map((appointment) => (
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