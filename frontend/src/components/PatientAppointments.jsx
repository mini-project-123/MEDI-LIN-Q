import React, { useState, useEffect } from 'react'
import { Calendar, Clock, User, MapPin, Phone, Filter, X } from 'lucide-react'

const PatientAppointments = () => {
  const [appointments, setAppointments] = useState([])
  const [filteredAppointments, setFilteredAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterTime, setFilterTime] = useState('all')

  useEffect(() => {
    fetchAppointments()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [filterStatus, filterTime, appointments])

  const fetchAppointments = async () => {
    setLoading(true)
    // Get appointments from localStorage
    const storedAppointments = JSON.parse(localStorage.getItem('appointments') || '[]')
    
    // Mock appointment data if none exist
    const mockAppointments = storedAppointments.length > 0 ? storedAppointments : [
      {
        id: 1,
        doctor: { user: { first_name: 'Dr. Sarah', last_name: 'Johnson' } },
        hospital: { name: 'City General Hospital', address: '123 Main St' },
        date: new Date().toISOString().split('T')[0],
        timeSlot: '09:00 AM',
        status: 'confirmed',
        reason: 'Regular checkup'
      }
    ]
    
    setTimeout(() => {
      setAppointments(mockAppointments)
      setFilteredAppointments(mockAppointments)
      setLoading(false)
    }, 500)
  }

  const applyFilters = () => {
    let filtered = [...appointments]

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(apt => apt.status === filterStatus)
    }

    // Time filter
    if (filterTime !== 'all') {
      const now = new Date()
      filtered = filtered.filter(apt => {
        const aptDate = new Date(apt.appointment_datetime)
        
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

  const cancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return
    }

    // Update appointment status in localStorage
    const storedAppointments = JSON.parse(localStorage.getItem('appointments') || '[]')
    const updatedAppointments = storedAppointments.map(apt => 
      apt.id === appointmentId ? { ...apt, status: 'cancelled' } : apt
    )
    localStorage.setItem('appointments', JSON.stringify(updatedAppointments))
    fetchAppointments()
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
      {/* Filters */}
      <div className="card mb-6">
        <h4 style={{ marginBottom: '1rem', color: '#1e293b' }}>
          <Filter size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
          Filter Appointments
        </h4>
        
        <div className="grid grid-2" style={{ gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="form-input"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Time Period</label>
            <select
              value={filterTime}
              onChange={(e) => setFilterTime(e.target.value)}
              className="form-input"
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
      <div className="card">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{ color: '#1e293b' }}>
            My Appointments ({filteredAppointments.length})
          </h3>
        </div>

        {filteredAppointments.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredAppointments.map((appointment) => {
              const appointmentDate = new Date(appointment.appointment_datetime)
              const isPast = appointmentDate < new Date()
              
              return (
                <div 
                  key={appointment.id}
                  style={{ 
                    padding: '1rem', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '0.5rem',
                    backgroundColor: isPast ? '#fafafa' : 'white'
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
                          fontSize: '1.2rem'
                        }}>
                          {appointment.doctor_name?.charAt(0) || 'D'}
                        </div>
                        <div>
                          <h4 style={{ color: '#1e293b', marginBottom: '0.25rem' }}>
                            Dr. {appointment.doctor_name}
                          </h4>
                          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                            {appointment.specialization}
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
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      backgroundColor: '#f8fafc',
                      borderRadius: '0.375rem',
                      border: '1px solid #e5e7eb',
                      fontSize: '0.875rem'
                    }}>
                      <Calendar size={14} style={{ color: '#64748b' }} />
                      <span style={{ color: '#1e293b', fontWeight: '500' }}>
                        {appointmentDate.toLocaleDateString()}
                      </span>
                    </div>

                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      backgroundColor: '#f8fafc',
                      borderRadius: '0.375rem',
                      border: '1px solid #e5e7eb',
                      fontSize: '0.875rem'
                    }}>
                      <Clock size={14} style={{ color: '#64748b' }} />
                      <span style={{ color: '#1e293b', fontWeight: '500' }}>
                        {appointmentDate.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>

                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      backgroundColor: '#f8fafc',
                      borderRadius: '0.375rem',
                      border: '1px solid #e5e7eb',
                      fontSize: '0.875rem'
                    }}>
                      <MapPin size={14} style={{ color: '#64748b' }} />
                      <span style={{ color: '#1e293b', fontWeight: '500' }}>
                        {appointment.hospital_name}
                      </span>
                    </div>

                    {appointment.token_number && (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        padding: '0.5rem 0.75rem',
                        backgroundColor: '#dbeafe',
                        color: '#1e40af',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}>
                        <User size={14} />
                        Token: {appointment.token_number}
                      </div>
                    )}
                  </div>

                  {appointment.reason && (
                    <div style={{ 
                      padding: '0.75rem', 
                      backgroundColor: '#f8fafc', 
                      borderRadius: '0.5rem',
                      marginBottom: '1rem'
                    }}>
                      <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                        <strong>Reason:</strong> {appointment.reason}
                      </p>
                    </div>
                  )}

                  {appointment.notes && (
                    <div style={{ 
                      padding: '0.75rem', 
                      backgroundColor: '#f8fafc', 
                      borderRadius: '0.5rem',
                      marginBottom: '1rem'
                    }}>
                      <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                        <strong>Notes:</strong> {appointment.notes}
                      </p>
                    </div>
                  )}

                  <div style={{ 
                    display: 'flex', 
                    gap: '0.5rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid #e5e7eb'
                  }}>
                    <button className="btn btn-primary" style={{ fontSize: '0.9rem' }}>
                      View Details
                    </button>
                    
                    {appointment.status === 'pending' || appointment.status === 'confirmed' ? (
                      !isPast && (
                        <>
                          <button className="btn btn-secondary" style={{ fontSize: '0.9rem' }}>
                            Reschedule
                          </button>
                          <button 
                            onClick={() => cancelAppointment(appointment.id)}
                            className="btn btn-secondary" 
                            style={{ 
                              fontSize: '0.9rem',
                              backgroundColor: '#ef4444',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}
                          >
                            <X size={14} />
                            Cancel
                          </button>
                        </>
                      )
                    ) : null}

                    {appointment.status === 'completed' && (
                      <button className="btn btn-success" style={{ fontSize: '0.9rem' }}>
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
            <Calendar size={48} style={{ color: '#d1d5db', margin: '0 auto 1rem' }} />
            <p style={{ color: '#64748b', fontSize: '1.1rem' }}>
              No appointments found
            </p>
            <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Book your first appointment to get started
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default PatientAppointments