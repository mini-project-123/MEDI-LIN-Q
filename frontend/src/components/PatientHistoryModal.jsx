import React, { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { X, Calendar, FileText, AlertCircle } from 'lucide-react'
import axios from 'axios'

/**
 * PatientHistoryModal
 * Displays all past appointments and medical records for a patient
 */
const PatientHistoryModal = ({ isOpen, patient, onClose }) => {
  const { theme } = useTheme()
  const [activeTab, setActiveTab] = useState('appointments')
  const [appointments, setAppointments] = useState([])
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen && patient?.user?.id) {
      fetchPatientHistory()
    }
  }, [isOpen, patient?.user?.id])

  const fetchPatientHistory = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('accessToken')
      
      // Fetch appointments and reports for this patient
      const appointmentsResponse = await axios.get(`/api/hospital/patients/${patient.user.id}/history/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      setAppointments(appointmentsResponse.data.appointments || [])
      setReports(appointmentsResponse.data.medical_reports || [])
    } catch (err) {
      console.error('Error fetching patient history:', err)
      setError('Failed to load patient history')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
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
      zIndex: 1100,
      padding: '1rem'
    }}>
      <div className="card" style={{
        width: '100%',
        maxWidth: '800px',
        maxHeight: '85vh',
        overflow: 'auto',
        padding: '2rem'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ color: theme.text, margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={24} />
              Patient History
            </h2>
            <p style={{ color: theme.textSecondary, margin: 0 }}>
              {patient?.user?.first_name} {patient?.user?.last_name}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: theme.textSecondary,
              padding: 0,
              fontSize: '1.5rem'
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: `1px solid ${theme.border || '#e5e7eb'}` }}>
          <button
            onClick={() => setActiveTab('appointments')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: activeTab === 'appointments' ? 'transparent' : 'transparent',
              color: activeTab === 'appointments' ? '#3b82f6' : theme.textSecondary,
              border: 'none',
              borderBottom: activeTab === 'appointments' ? '2px solid #3b82f6' : 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: activeTab === 'appointments' ? '600' : '500',
              transition: 'all 0.2s'
            }}
          >
            <Calendar size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
            Appointments ({appointments.length})
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: activeTab === 'reports' ? 'transparent' : 'transparent',
              color: activeTab === 'reports' ? '#3b82f6' : theme.textSecondary,
              border: 'none',
              borderBottom: activeTab === 'reports' ? '2px solid #3b82f6' : 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: activeTab === 'reports' ? '600' : '500',
              transition: 'all 0.2s'
            }}
          >
            <FileText size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
            Reports ({reports.length})
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '2rem', color: theme.textSecondary }}>
            Loading patient history...
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div style={{
            padding: '1rem',
            backgroundColor: '#fee2e2',
            borderColor: '#ef4444',
            borderRadius: '8px',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <AlertCircle size={20} style={{ color: '#dc2626' }} />
            <p style={{ color: '#991b1b', margin: 0 }}>{error}</p>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {activeTab === 'appointments' && (
              <div>
                {appointments.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {appointments.map(appointment => (
                      <div key={appointment.id} style={{
                        padding: '1.25rem',
                        border: `1px solid ${theme.border || '#e5e7eb'}`,
                        borderRadius: '8px',
                        backgroundColor: theme.background || '#fafafa'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                          <div>
                            <h3 style={{ color: theme.text, margin: 0, fontWeight: '600' }}>
                              Dr. {appointment.doctor?.user?.first_name} {appointment.doctor?.user?.last_name}
                            </h3>
                            <p style={{ color: theme.textSecondary, margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
                              {appointment.doctor?.specialization || 'Specialist'}
                            </p>
                          </div>
                          <span style={{
                            padding: '0.4rem 0.8rem',
                            backgroundColor: appointment.status === 'completed' ? '#d1fae5' : appointment.status === 'confirmed' ? '#dbeafe' : '#fef3c7',
                            color: appointment.status === 'completed' ? '#065f46' : appointment.status === 'confirmed' ? '#0c4a6e' : '#92400e',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            textTransform: 'capitalize'
                          }}>
                            {appointment.status}
                          </span>
                        </div>

                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                          gap: '1rem',
                          marginBottom: '0.75rem',
                          padding: '0.75rem',
                          backgroundColor: theme.cardBackground || '#f8fafc',
                          borderRadius: '6px',
                          fontSize: '0.9rem'
                        }}>
                          <div>
                            <p style={{ color: theme.textSecondary, margin: '0 0 0.25rem 0', fontSize: '0.8rem' }}>Date</p>
                            <p style={{ color: theme.text, margin: 0, fontWeight: '500' }}>
                              {new Date(appointment.appointment_date).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p style={{ color: theme.textSecondary, margin: '0 0 0.25rem 0', fontSize: '0.8rem' }}>Time</p>
                            <p style={{ color: theme.text, margin: 0, fontWeight: '500' }}>
                              {appointment.appointment_time || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p style={{ color: theme.textSecondary, margin: '0 0 0.25rem 0', fontSize: '0.8rem' }}>Type</p>
                            <p style={{ color: theme.text, margin: 0, fontWeight: '500', textTransform: 'capitalize' }}>
                              {appointment.appointment_type || 'Consultation'}
                            </p>
                          </div>
                        </div>

                        {appointment.reason && (
                          <div style={{
                            padding: '0.75rem',
                            backgroundColor: theme.cardBackground || '#f8fafc',
                            borderRadius: '6px',
                            borderLeft: '3px solid #3b82f6'
                          }}>
                            <p style={{ color: theme.textSecondary, margin: '0 0 0.25rem 0', fontSize: '0.8rem' }}>Reason</p>
                            <p style={{ color: theme.text, margin: 0, fontSize: '0.9rem' }}>{appointment.reason}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    padding: '2rem',
                    textAlign: 'center',
                    backgroundColor: theme.background || '#f8fafc',
                    borderRadius: '8px'
                  }}>
                    <Calendar size={48} style={{ color: theme.textSecondary, marginBottom: '1rem', opacity: 0.5 }} />
                    <p style={{ color: theme.textSecondary, margin: 0, fontSize: '1rem' }}>
                      No appointments found for this patient.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reports' && (
              <div>
                {reports.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {reports.map(report => (
                      <div key={report.id} style={{
                        padding: '1.25rem',
                        border: `1px solid ${theme.border || '#e5e7eb'}`,
                        borderRadius: '8px',
                        backgroundColor: theme.background || '#fafafa'
                      }}>
                        <div style={{ marginBottom: '0.75rem' }}>
                          <h3 style={{ color: theme.text, margin: 0, fontWeight: '600' }}>
                            {report.report_type}
                          </h3>
                          <p style={{ color: theme.textSecondary, margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
                            {report.description}
                          </p>
                        </div>

                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                          gap: '1rem',
                          padding: '0.75rem',
                          backgroundColor: theme.cardBackground || '#f8fafc',
                          borderRadius: '6px',
                          fontSize: '0.9rem'
                        }}>
                          <div>
                            <p style={{ color: theme.textSecondary, margin: '0 0 0.25rem 0', fontSize: '0.8rem' }}>Date</p>
                            <p style={{ color: theme.text, margin: 0, fontWeight: '500' }}>
                              {new Date(report.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {report.report_file && (
                          <a
                            href={report.report_file}
                            download
                            style={{
                              marginTop: '0.75rem',
                              display: 'inline-block',
                              padding: '0.5rem 1rem',
                              backgroundColor: '#3b82f6',
                              color: 'white',
                              borderRadius: '6px',
                              textDecoration: 'none',
                              fontSize: '0.9rem',
                              fontWeight: '500'
                            }}
                          >
                            Download Report
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    padding: '2rem',
                    textAlign: 'center',
                    backgroundColor: theme.background || '#f8fafc',
                    borderRadius: '8px'
                  }}>
                    <FileText size={48} style={{ color: theme.textSecondary, marginBottom: '1rem', opacity: 0.5 }} />
                    <p style={{ color: theme.textSecondary, margin: 0, fontSize: '1rem' }}>
                      No medical reports found for this patient.
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default PatientHistoryModal
