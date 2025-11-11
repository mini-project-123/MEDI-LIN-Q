import React, { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import { FileText, Upload, Download, Trash2, Calendar, Loader2, AlertCircle, CheckCircle2, Eye } from 'lucide-react'

const PatientMedicalReportsAPI = () => {
  const { theme } = useTheme()
  const { user } = useAuth()
  const token = localStorage.getItem('accessToken')

  // State
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [reportType, setReportType] = useState('Lab Report')
  const [description, setDescription] = useState('')
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [previewReport, setPreviewReport] = useState(null)

  // Fetch reports on mount
  useEffect(() => {
    fetchReports()
  }, [])

  // Fetch medical reports from API
  const fetchReports = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('http://127.0.0.1:8000/api/patient/medical-reports-api/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) throw new Error('Failed to fetch medical reports')
      
      const data = await response.json()
      // Handle both paginated and non-paginated responses
      const reportsList = data.results ? data.results : (Array.isArray(data) ? data : [])
      setReports(reportsList)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching reports:', err)
    } finally {
      setLoading(false)
    }
  }

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      setError(null)
    }
  }

  // Upload medical report
  const handleUploadReport = async (e) => {
    e.preventDefault()

    if (!selectedFile || !reportType.trim()) {
      setError('Please select a file and report type')
      return
    }

    setUploading(true)
    setError(null)

    const formData = new FormData()
    formData.append('report_file', selectedFile)
    formData.append('report_type', reportType)
    formData.append('description', description)

    try {
      const response = await fetch('http://127.0.0.1:8000/api/patient/medical-reports-api/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to upload report')
      }

      setSuccess(true)
      setSelectedFile(null)
      setReportType('Lab Report')
      setDescription('')
      setShowUploadForm(false)

      // Refresh reports
      setTimeout(() => {
        fetchReports()
        setSuccess(false)
      }, 2000)
    } catch (err) {
      setError(err.message)
      console.error('Error uploading report:', err)
    } finally {
      setUploading(false)
    }
  }

  // Delete report
  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/patient/medical-reports/${reportId}/`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) throw new Error('Failed to delete report')

      setSuccess(true)
      fetchReports()
      setTimeout(() => setSuccess(false), 2000)
    } catch (err) {
      setError(err.message)
      console.error('Error deleting report:', err)
    }
  }

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A'
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  // Styles
  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem',
      backgroundColor: theme.background || '#f9fafb'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem'
    },
    title: {
      fontSize: '2rem',
      fontWeight: '700',
      color: theme.textPrimary || '#111'
    },
    button: {
      primary: {
        backgroundColor: theme.primary || '#3b82f6',
        color: '#fff',
        padding: '0.75rem 1.5rem',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        fontWeight: '600',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      },
      secondary: {
        backgroundColor: 'transparent',
        color: theme.primary || '#3b82f6',
        padding: '0.75rem 1.5rem',
        borderRadius: '8px',
        border: `1px solid ${theme.primary || '#3b82f6'}`,
        cursor: 'pointer',
        fontWeight: '600',
        transition: 'all 0.3s ease'
      }
    },
    card: {
      backgroundColor: theme.cardBackground || '#fff',
      borderRadius: '12px',
      padding: '2rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      marginBottom: '2rem'
    },
    formGroup: {
      marginBottom: '1.5rem'
    },
    label: {
      display: 'block',
      marginBottom: '0.5rem',
      fontWeight: '600',
      color: theme.textPrimary || '#111'
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      border: `1px solid ${theme.borderColor || '#e5e7eb'}`,
      borderRadius: '8px',
      fontSize: '1rem',
      fontFamily: 'inherit',
      boxSizing: 'border-box'
    },
    select: {
      width: '100%',
      padding: '0.75rem',
      border: `1px solid ${theme.borderColor || '#e5e7eb'}`,
      borderRadius: '8px',
      fontSize: '1rem',
      fontFamily: 'inherit',
      backgroundColor: theme.cardBackground || '#fff'
    },
    reportCard: {
      backgroundColor: theme.background || '#f9fafb',
      borderRadius: '8px',
      padding: '1.5rem',
      border: `1px solid ${theme.borderColor || '#e5e7eb'}`,
      marginBottom: '1rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'start',
      transition: 'all 0.3s ease',
      '&:hover': {
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }
    },
    reportInfo: {
      flex: 1
    },
    reportType: {
      fontSize: '1.1rem',
      fontWeight: '600',
      color: theme.textPrimary || '#111',
      marginBottom: '0.5rem'
    },
    reportDescription: {
      color: theme.textSecondary || '#6b7280',
      marginBottom: '0.75rem',
      fontSize: '0.95rem'
    },
    reportMeta: {
      display: 'flex',
      gap: '1.5rem',
      fontSize: '0.85rem',
      color: theme.textSecondary || '#6b7280'
    },
    actions: {
      display: 'flex',
      gap: '0.75rem'
    },
    actionButton: (bgColor = 'transparent', textColor = theme.textSecondary) => ({
      padding: '0.5rem',
      backgroundColor: bgColor,
      color: textColor,
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    })
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Medical Reports</h1>
        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          style={styles.button.primary}
        >
          <Upload size={18} />
          Upload Report
        </button>
      </div>

      {/* Messages */}
      {success && (
        <div style={{
          backgroundColor: '#d1fae5',
          border: '1px solid #6ee7b7',
          color: '#065f46',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <CheckCircle2 size={20} />
          Operation completed successfully!
        </div>
      )}

      {error && (
        <div style={{
          backgroundColor: '#fee2e2',
          border: '1px solid #fca5a5',
          color: '#991b1b',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Upload Form */}
      {showUploadForm && (
        <div style={styles.card}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: '600' }}>
            Upload Medical Report
          </h2>

          <form onSubmit={handleUploadReport}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Report Type *</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                style={styles.select}
                required
              >
                <option value="Lab Report">Lab Report</option>
                <option value="X-Ray">X-Ray</option>
                <option value="CT Scan">CT Scan</option>
                <option value="Ultrasound">Ultrasound</option>
                <option value="MRI">MRI</option>
                <option value="ECG">ECG</option>
                <option value="Blood Test">Blood Test</option>
                <option value="Prescription">Prescription</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add any notes about this report..."
                style={{
                  ...styles.input,
                  minHeight: '80px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>File *</label>
              <div style={{
                border: `2px dashed ${theme.primary || '#3b82f6'}`,
                borderRadius: '8px',
                padding: '2rem',
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: (theme.primary || '#3b82f6') + '08',
                transition: 'all 0.3s ease'
              }}>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  style={{ display: 'none' }}
                  id="file-input"
                  required
                />
                <label htmlFor="file-input" style={{ cursor: 'pointer' }}>
                  <FileText size={32} style={{ margin: '0 auto 1rem', color: theme.primary || '#3b82f6' }} />
                  <p style={{ marginBottom: '0.5rem', fontWeight: '600' }}>
                    Click to select or drag and drop
                  </p>
                  <p style={{ fontSize: '0.9rem', color: theme.textSecondary || '#6b7280' }}>
                    Supported formats: PDF, JPG, PNG, DOC (Max 50MB)
                  </p>
                </label>
                {selectedFile && (
                  <p style={{ marginTop: '1rem', color: theme.success || '#10b981', fontWeight: '600' }}>
                    ✓ {selectedFile.name} ({formatFileSize(selectedFile.size)})
                  </p>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="submit"
                disabled={uploading || !selectedFile}
                style={{
                  ...styles.button.primary,
                  opacity: uploading || !selectedFile ? 0.5 : 1,
                  cursor: uploading || !selectedFile ? 'not-allowed' : 'pointer'
                }}
              >
                {uploading ? (
                  <>
                    <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={18} />
                    Upload Report
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowUploadForm(false)
                  setSelectedFile(null)
                  setDescription('')
                }}
                style={styles.button.secondary}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reports List */}
      <div style={styles.card}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: '600' }}>
          Your Medical Reports ({reports.length})
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} />
            <p style={{ marginTop: '1rem', color: theme.textSecondary || '#6b7280' }}>
              Loading reports...
            </p>
          </div>
        ) : reports.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            backgroundColor: theme.background || '#f9fafb',
            borderRadius: '8px'
          }}>
            <FileText size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              No medical reports yet
            </p>
            <p style={{ color: theme.textSecondary || '#6b7280', marginBottom: '1.5rem' }}>
              Upload your first medical report to get started
            </p>
            <button
              onClick={() => setShowUploadForm(true)}
              style={styles.button.primary}
            >
              <Upload size={18} />
              Upload Report
            </button>
          </div>
        ) : (
          <div>
            {reports.map(report => (
              <div key={report.id} style={styles.reportCard}>
                <div style={styles.reportInfo}>
                  <div style={styles.reportType}>
                    <FileText size={20} style={{ marginRight: '0.75rem', display: 'inline' }} />
                    {report.report_type}
                  </div>
                  {report.description && (
                    <p style={styles.reportDescription}>{report.description}</p>
                  )}
                  <div style={styles.reportMeta}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={16} />
                      {formatDate(report.created_at)}
                    </span>
                  </div>
                </div>

                <div style={styles.actions}>
                  {report.report_file && (
                    <>
                      <a
                        href={report.report_file}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          ...styles.actionButton('#f3f4f6', theme.primary || '#3b82f6'),
                          textDecoration: 'none'
                        }}
                        title="View Report"
                      >
                        <Eye size={18} />
                      </a>
                      <a
                        href={report.report_file}
                        download
                        style={{
                          ...styles.actionButton('#f3f4f6', theme.success || '#10b981'),
                          textDecoration: 'none'
                        }}
                        title="Download Report"
                      >
                        <Download size={18} />
                      </a>
                    </>
                  )}
                  <button
                    onClick={() => handleDeleteReport(report.id)}
                    style={styles.actionButton('#fee2e2', '#ef4444')}
                    title="Delete Report"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default PatientMedicalReportsAPI
