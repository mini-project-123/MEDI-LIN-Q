import React, { useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { Calendar, Clock, Users, Stethoscope, X, Activity } from 'lucide-react'

const HospitalAppointments = () => {
  const { theme } = useTheme()
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  
  const [appointments] = useState([
    { id: 1, patient: 'John Smith', patientId: 'P001', doctor: 'Dr. Sarah Johnson', doctorId: 'D001', date: 'Today', time: '09:00 AM', status: 'Follow-up', statusColor: '#3b82f6' },
    { id: 2, patient: 'Emma Wilson', patientId: 'P002', doctor: 'Dr. Michael Chen', doctorId: 'D002', date: 'Today', time: '10:30 AM', status: 'Consultation', statusColor: '#06b6d4' },
    { id: 3, patient: 'Lisa Anderson', patientId: 'P004', doctor: 'Dr. Priya Patel', doctorId: 'D003', date: 'Today', time: '02:03 PM', status: 'Check-up', statusColor: '#8b5cf6' },
    { id: 4, patient: 'Robert Brown', patientId: 'P003', doctor: 'Dr. Sarah Johnson', doctorId: 'D001', date: 'Today', time: '03:30 PM', status: 'Consultation', statusColor: '#06b6d4' },
    { id: 5, patient: 'James Martinez', patientId: 'P005', doctor: 'Dr. David Lee', doctorId: 'D004', date: 'Today', time: '11:00 AM', status: 'Follow-up', statusColor: '#3b82f6' },
    { id: 6, patient: 'Sarah Parker', patientId: 'P006', doctor: 'Dr. Emily Rodriguez', doctorId: 'D005', date: 'Today', time: '01:00 PM', status: 'Consultation', statusColor: '#06b6d4' }
  ])

  const appointmentTimeline = [
    { date: '2025-11-08', time: '09:00 AM', status: 'Scheduled', type: 'Follow-up', notes: 'Regular checkup scheduled' },
    { date: '2025-11-01', time: '10:30 AM', status: 'Completed', type: 'Consultation', notes: 'Initial consultation completed. Prescribed medication.' },
    { date: '2025-10-15', time: '02:00 PM', status: 'Completed', type: 'Follow-up', notes: 'Follow-up visit. Patient showing improvement.' },
    { date: '2025-09-20', time: '11:00 AM', status: 'Completed', type: 'Initial Visit', notes: 'First visit. Diagnosis confirmed.' }
  ]

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: theme.text, margin: '0 0 0.5rem 0', fontSize: '2rem' }}>Appointments</h1>
        <p style={{ color: theme.textSecondary, margin: 0 }}>View and manage all scheduled appointments</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {appointments.map(apt => (
          <div 
            key={apt.id} 
            className="card" 
            style={{ padding: '1.5rem', cursor: 'pointer', transition: 'transform 0.2s' }}
            onClick={() => setSelectedAppointment(apt)}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ color: theme.text, margin: '0 0 0.25rem 0' }}>{apt.patient}</h3>
                <p style={{ color: theme.textSecondary, margin: 0, fontSize: '0.85rem' }}>Patient ID: {apt.patientId}</p>
              </div>
              <span style={{
                padding: '0.5rem 1rem',
                backgroundColor: `${apt.statusColor}20`,
                color: apt.statusColor,
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: '500'
              }}>
                {apt.status}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Stethoscope size={16} style={{ color: theme.textSecondary }} />
                <span style={{ color: theme.textSecondary, fontSize: '0.9rem' }}>
                  {apt.doctor} ({apt.doctorId})
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={16} style={{ color: theme.textSecondary }} />
                <span style={{ color: theme.textSecondary, fontSize: '0.9rem' }}>
                  {apt.date}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={16} style={{ color: theme.textSecondary }} />
                <span style={{ color: theme.text, fontSize: '0.9rem', fontWeight: '500' }}>
                  {apt.time}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Appointment Timeline Modal */}
      {selectedAppointment && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="card" style={{
            width: '100%',
            maxWidth: '700px',
            maxHeight: '90vh',
            overflow: 'auto',
            padding: '2rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '2rem' }}>
              <div>
                <h2 style={{ color: theme.text, margin: '0 0 0.5rem 0' }}>Appointment Timeline</h2>
                <p style={{ color: theme.textSecondary, margin: 0 }}>
                  {selectedAppointment.patient} • {selectedAppointment.patientId}
                </p>
              </div>
              <button
                onClick={() => setSelectedAppointment(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: theme.textSecondary
                }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Current Appointment Info */}
            <div style={{ 
              marginBottom: '2rem', 
              padding: '1.5rem', 
              backgroundColor: `${selectedAppointment.statusColor}10`,
              border: `2px solid ${selectedAppointment.statusColor}`,
              borderRadius: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Activity size={20} style={{ color: selectedAppointment.statusColor }} />
                <h3 style={{ color: theme.text, margin: 0 }}>Current Appointment</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                <div>
                  <p style={{ color: theme.textSecondary, margin: '0 0 0.25rem 0', fontSize: '0.85rem' }}>Doctor</p>
                  <p style={{ color: theme.text, margin: 0, fontWeight: '500' }}>{selectedAppointment.doctor}</p>
                </div>
                <div>
                  <p style={{ color: theme.textSecondary, margin: '0 0 0.25rem 0', fontSize: '0.85rem' }}>Date & Time</p>
                  <p style={{ color: theme.text, margin: 0, fontWeight: '500' }}>{selectedAppointment.date} • {selectedAppointment.time}</p>
                </div>
                <div>
                  <p style={{ color: theme.textSecondary, margin: '0 0 0.25rem 0', fontSize: '0.85rem' }}>Status</p>
                  <p style={{ color: selectedAppointment.statusColor, margin: 0, fontWeight: '500' }}>{selectedAppointment.status}</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h3 style={{ color: theme.text, margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={20} />
                Complete Timeline
              </h3>
              <div style={{ position: 'relative', paddingLeft: '2rem' }}>
                {/* Timeline Line */}
                <div style={{
                  position: 'absolute',
                  left: '0.5rem',
                  top: '1rem',
                  bottom: '1rem',
                  width: '2px',
                  backgroundColor: theme.border || '#e5e7eb'
                }} />

                {appointmentTimeline.map((item, index) => (
                  <div key={index} style={{ position: 'relative', marginBottom: '2rem' }}>
                    {/* Timeline Dot */}
                    <div style={{
                      position: 'absolute',
                      left: '-1.5rem',
                      top: '0.5rem',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: item.status === 'Completed' ? '#10b981' : item.status === 'Scheduled' ? '#3b82f6' : '#f59e0b',
                      border: `3px solid ${theme.cardBackground || 'white'}`
                    }} />

                    <div style={{
                      padding: '1rem',
                      border: `1px solid ${theme.border || '#e5e7eb'}`,
                      borderRadius: '8px',
                      backgroundColor: theme.background || '#fafafa'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ color: theme.text, fontWeight: '500' }}>{item.type}</span>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          backgroundColor: item.status === 'Completed' ? '#dcfce7' : item.status === 'Scheduled' ? '#dbeafe' : '#fef3c7',
                          color: item.status === 'Completed' ? '#166534' : item.status === 'Scheduled' ? '#1e40af' : '#92400e',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: '500'
                        }}>
                          {item.status}
                        </span>
                      </div>
                      <p style={{ color: theme.textSecondary, margin: '0 0 0.75rem 0', fontSize: '0.85rem' }}>
                        {item.date} • {item.time}
                      </p>
                      <p style={{ color: theme.text, margin: 0, fontSize: '0.9rem' }}>{item.notes}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HospitalAppointments
