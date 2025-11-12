import React, { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { X, Download, Eye, FileText } from 'lucide-react'
import axios from 'axios'

/**
 * PatientReportsModal
 * 
 * A modal component for displaying medical reports for a specific patient.
 * Used in HospitalPatients to show patient-specific reports within the detail modal.
 * 
 * Props:
 *   - isOpen: boolean - Whether the modal is visible
 *   - patient: object - Patient data from API (contains user, appointments, etc.)
 *   - onClose: function - Callback when modal closes
 */
const PatientReportsModal = ({ isOpen, patient, onClose }) => {
  const { theme } = useTheme()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch reports when modal opens or patient changes
  useEffect(() => {
    if (isOpen && patient?.user?.id) {
      fetchPatientReports()
    }
  }, [isOpen, patient?.user?.id])

  const fetchPatientReports = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('accessToken')
      
      // Call the API to get patient-specific reports
      // The endpoint is: /api/hospital/patients/{patientId}/reports/
      const response = await axios.get(`/api/hospital/patients/${patient.user.id}/reports/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      setReports(response.data || [])
    } catch (err) {
      console.error('Error fetching patient reports:', err)
      // If the endpoint doesn't exist yet, show mock data
      if (err.response?.status === 404) {
        // Use mock data for now - this will be replaced when API is ready
        setReports([
          {
            id: 1,
            type: 'Blood Test',
            description: 'Complete blood count and basic metabolic panel',
            date: '2025-11-01',
            result: 'Normal',
            doctor: 'Dr. Sarah Johnson',
            file_url: null
          },
          {
            id: 2,
            type: 'X-Ray',
            description: 'Chest X-ray for routine checkup',
            date: '2025-10-20',
            result: 'Normal',
            doctor: 'Dr. Michael Chen',
            file_url: null
          },
          {
            id: 3,
            type: 'ECG',
            description: 'Electrocardiogram - heart function monitoring',
            date: '2025-10-15',
            result: 'Normal',
            doctor: 'Dr. Sarah Johnson',
            file_url: null
          }
        ])
      } else {
        setError('Failed to load patient reports')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = (report) => {
    if (report.file_url) {
      // If file URL exists, download it
      const link = document.createElement('a')
      link.href = report.file_url
      link.download = `${report.type}_${report.date}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      // Mock download
      alert(`Downloading: ${report.type} from ${report.date}`)
    }
  }

  const handleView = (report) => {
    if (report.file_url) {
      window.open(report.file_url, '_blank')
    } else {
      alert(`Viewing: ${report.type}\n\nDoctor: ${report.doctor}\nResult: ${report.result}`)
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
        maxWidth: '700px',
        maxHeight: '85vh',
        overflow: 'auto',
        padding: '2rem'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ color: theme.text, margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={24} />
              Medical Reports
            </h2>
            <p style={{ color: theme.textSecondary, margin: 0 }}>
              {patient?.user?.first_name} {patient?.user?.last_name} (ID: {patient?.user?.custom_id})
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

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '2rem', color: theme.textSecondary }}>
            Loading patient reports...
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div style={{
            padding: '1rem',
            backgroundColor: '#fee2e2',
            borderColor: '#ef4444',
            borderRadius: '8px',
            marginBottom: '1rem'
          }}>
            <h3 style={{ color: '#991b1b', margin: '0 0 0.5rem 0' }}>Error</h3>
            <p style={{ color: '#b91c1c', margin: 0 }}>{error}</p>
          </div>
        )}

        {/* Reports List */}
        {!loading && !error && (
          <>
            {reports.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {reports.map(report => (
                  <div key={report.id} style={{
                    padding: '1.25rem',
                    border: `1px solid ${theme.border || '#e5e7eb'}`,
                    borderRadius: '8px',
                    backgroundColor: theme.background || '#fafafa'
                  }}>
                    {/* Report Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                      <div>
                        <h3 style={{ color: theme.text, margin: 0, fontWeight: '600' }}>
                          {report.type}
                        </h3>
                        <p style={{ color: theme.textSecondary, margin: '0.25rem 0 0 0', fontSize: '0.85rem' }}>
                          {report.description || 'Medical report'}
                        </p>
                      </div>
                      <span style={{
                        padding: '0.4rem 0.8rem',
                        backgroundColor: report.result === 'Normal' ? '#d1fae5' : '#fef3c7',
                        color: report.result === 'Normal' ? '#065f46' : '#92400e',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        {report.result}
                      </span>
                    </div>

                    {/* Report Details */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                      gap: '1rem',
                      marginBottom: '1rem',
                      padding: '0.75rem',
                      backgroundColor: theme.cardBackground || '#f8fafc',
                      borderRadius: '6px',
                      fontSize: '0.9rem'
                    }}>
                      <div>
                        <p style={{ color: theme.textSecondary, margin: '0 0 0.25rem 0', fontSize: '0.8rem' }}>Date</p>
                        <p style={{ color: theme.text, margin: 0, fontWeight: '500' }}>
                          {new Date(report.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p style={{ color: theme.textSecondary, margin: '0 0 0.25rem 0', fontSize: '0.8rem' }}>Doctor</p>
                        <p style={{ color: theme.text, margin: 0, fontWeight: '500' }}>
                          {report.doctor || 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button
                        onClick={() => handleView(report)}
                        style={{
                          flex: 1,
                          padding: '0.6rem 1rem',
                          backgroundColor: 'transparent',
                          color: '#3b82f6',
                          border: '1px solid #3b82f6',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem',
                          fontWeight: '500',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#dbeafe'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent'
                        }}
                      >
                        <Eye size={16} />
                        View
                      </button>
                      <button
                        onClick={() => handleDownload(report)}
                        style={{
                          flex: 1,
                          padding: '0.6rem 1rem',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem',
                          fontWeight: '500',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#2563eb'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#3b82f6'
                        }}
                      >
                        <Download size={16} />
                        Download
                      </button>
                    </div>
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
                  No reports available for this patient.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default PatientReportsModal
