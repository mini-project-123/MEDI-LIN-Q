import React, { useState, useEffect } from 'react'
import { Upload, FileText, Calendar, Search, Filter, Eye, Download, Plus, Sparkles, AlertCircle, X, Loader2 } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import axios from 'axios'

const PatientReports = () => {
  const { theme } = useTheme()
  const [reports, setReports] = useState([])
  const [filteredReports, setFilteredReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  
  // Summary modal state
  const [showSummaryModal, setShowSummaryModal] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)
  const [summary, setSummary] = useState(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summaryError, setSummaryError] = useState(null)

  useEffect(() => {
    fetchReports()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [searchTerm, filterType, reports])

  const fetchReports = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const token = localStorage.getItem('accessToken')
      const response = await axios.get('/api/patients/medical-reports/', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      setReports(response.data || [])
      setFilteredReports(response.data || [])
    } catch (err) {
      console.error('Error fetching reports:', err)
      setError(err.response?.data?.detail || 'Failed to load medical reports')
      setReports([])
      setFilteredReports([])
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...reports]

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(report => 
        report.title.toLowerCase().includes(term) ||
        report.description.toLowerCase().includes(term) ||
        report.doctor.toLowerCase().includes(term)
      )
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(report => report.type === filterType)
    }

    setFilteredReports(filtered)
  }

  const handleViewReport = (report) => {
    alert(`Opening ${report.title} for viewing...`)
  }

  const handleDownloadReport = (report) => {
    alert(`Downloading ${report.title}...`)
  }

  const handleGenerateSummary = async (report) => {
    setSelectedReport(report)
    setShowSummaryModal(true)
    setSummaryLoading(true)
    setSummaryError(null)
    setSummary(null)

    try {
      const token = localStorage.getItem('accessToken')
      const response = await axios.post(
        `/api/reports/${report.id}/ai-summary/`,
        {},
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      )

      setSummary(response.data?.summary || 'Summary generated successfully')
    } catch (err) {
      console.error('Error generating summary:', err)
      setSummaryError(
        err.response?.data?.detail || 
        'Failed to generate AI summary. Please try again.'
      )
    } finally {
      setSummaryLoading(false)
    }
  }

  const closeSummaryModal = () => {
    setShowSummaryModal(false)
    setSelectedReport(null)
    setSummary(null)
    setSummaryError(null)
  }

  const getReportTypeColor = (type) => {
    const colors = {
      blood_test: '#ef4444',
      xray: '#3b82f6',
      mri: '#8b5cf6',
      ct_scan: '#f59e0b',
      ecg: '#10b981',
      ultrasound: '#06b6d4',
      other: '#64748b'
    }
    return colors[type] || colors.other
  }

  const getReportTypeName = (type) => {
    const names = {
      blood_test: 'Blood Test',
      xray: 'X-Ray',
      mri: 'MRI Scan',
      ct_scan: 'CT Scan',
      ecg: 'ECG',
      ultrasound: 'Ultrasound',
      other: 'Other'
    }
    return names[type] || 'Other'
  }



  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh' 
      }}>
        <div style={{ textAlign: 'center', color: theme.text }}>
          <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
          <div>Loading your medical reports...</div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: theme.text, margin: '0 0 0.5rem 0' }}>Medical Reports</h2>
        <p style={{ color: theme.textSecondary, margin: 0 }}>
          View and download your medical reports and test results
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#fee2e2',
          borderColor: '#ef4444',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'flex-start'
        }}>
          <AlertCircle size={20} style={{ color: '#dc2626', flexShrink: 0, marginTop: '0.1rem' }} />
          <div>
            <p style={{ color: '#991b1b', margin: 0, fontWeight: '500' }}>Failed to Load Reports</p>
            <p style={{ color: '#991b1b', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>{error}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card" style={{ 
        backgroundColor: theme.cardBackground,
        borderColor: theme.border,
        marginBottom: '2rem'
      }}>
        <div className="grid grid-2" style={{ gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" style={{ color: theme.text }}>Search Reports</label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ 
                position: 'absolute', 
                left: '0.75rem', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: theme.textSecondary
              }} />
              <input
                type="text"
                placeholder="Search by title, description, or doctor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
                style={{ 
                  paddingLeft: '2.5rem',
                  backgroundColor: theme.background,
                  color: theme.text,
                  borderColor: theme.border
                }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ color: theme.text }}>Filter by Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="form-input"
              style={{ 
                backgroundColor: theme.background,
                color: theme.text,
                borderColor: theme.border
              }}
            >
              <option value="all">All Types</option>
              <option value="blood_test">Blood Tests</option>
              <option value="xray">X-Rays</option>
              <option value="mri">MRI Scans</option>
              <option value="ct_scan">CT Scans</option>
              <option value="ecg">ECG</option>
              <option value="ultrasound">Ultrasound</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="card" style={{ 
        backgroundColor: theme.cardBackground,
        borderColor: theme.border
      }}>
        <h3 style={{ 
          marginBottom: '1.5rem', 
          color: theme.text,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <FileText size={20} />
          My Reports ({filteredReports.length})
        </h3>

        {filteredReports.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredReports.map((report) => (
              <div 
                key={report.id}
                style={{ 
                  padding: '1.5rem', 
                  border: `1px solid ${theme.border}`, 
                  borderRadius: '0.75rem',
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
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        backgroundColor: getReportTypeColor(report.type) + '20',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <FileText size={20} style={{ color: getReportTypeColor(report.type) }} />
                      </div>
                      <div>
                        <h4 style={{ color: theme.text, marginBottom: '0.25rem' }}>
                          {report.title || 'Medical Report'}
                        </h4>
                        <p style={{ color: theme.textSecondary, fontSize: '0.9rem' }}>
                          {report.description || 'Medical test report'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '0.25rem', 
                      fontSize: '0.8rem',
                      fontWeight: '500',
                      backgroundColor: getReportTypeColor(report.type) + '20',
                      color: getReportTypeColor(report.type)
                    }}>
                      {getReportTypeName(report.type)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <p style={{ color: theme.textSecondary, fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                      <strong>Date:</strong> {new Date(report.date || report.created_at).toLocaleDateString()}
                    </p>
                    <p style={{ color: theme.textSecondary, fontSize: '0.9rem' }}>
                      <strong>Doctor:</strong> {report.doctor_name || 'N/A'}
                    </p>
                  </div>

                  <div>
                    <p style={{ color: theme.textSecondary, fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                      <strong>Hospital:</strong> {report.hospital_name || 'N/A'}
                    </p>
                    <p style={{ color: theme.textSecondary, fontSize: '0.9rem' }}>
                      <strong>File:</strong> {report.file_name || report.file || 'N/A'}
                    </p>
                  </div>
                </div>

                <div style={{ 
                  display: 'flex', 
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                  paddingTop: '1rem',
                  borderTop: `1px solid ${theme.border}`
                }}>
                  <button 
                    onClick={() => handleViewReport(report)}
                    className="btn btn-secondary" 
                    style={{ fontSize: '0.9rem' }}
                  >
                    <Eye size={14} style={{ marginRight: '0.25rem' }} />
                    View Report
                  </button>
                  <button 
                    onClick={() => handleDownloadReport(report)}
                    className="btn btn-primary" 
                    style={{ fontSize: '0.9rem' }}
                  >
                    <Download size={14} style={{ marginRight: '0.25rem' }} />
                    Download
                  </button>
                  <button 
                    onClick={() => handleGenerateSummary(report)}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#8b5cf6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#7c3aed'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#8b5cf6'
                    }}
                  >
                    <Sparkles size={14} />
                    Generate Summary
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <FileText size={48} style={{ color: theme.textSecondary, margin: '0 auto 1rem' }} />
            <p style={{ color: theme.textSecondary, fontSize: '1.1rem' }}>
              No reports found
            </p>
            <p style={{ color: theme.textSecondary, fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Your medical reports will appear here
            </p>
          </div>
        )}
      </div>

      {/* AI Summary Modal */}
      {showSummaryModal && (
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
            maxWidth: '600px',
            maxHeight: '85vh',
            overflow: 'auto',
            padding: '2rem'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ color: theme.text, margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={24} style={{ color: '#8b5cf6' }} />
                  AI Summary
                </h2>
                <p style={{ color: theme.textSecondary, margin: 0, fontSize: '0.9rem' }}>
                  {selectedReport?.title}
                </p>
              </div>
              <button
                onClick={closeSummaryModal}
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

            {/* Content */}
            {summaryLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: theme.textSecondary }}>
                <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
                <p>Generating AI summary in simple language...</p>
              </div>
            ) : summaryError ? (
              <div style={{
                padding: '1.5rem',
                backgroundColor: '#fee2e2',
                borderColor: '#ef4444',
                borderRadius: '8px',
                marginBottom: '1rem'
              }}>
                <p style={{ color: '#991b1b', margin: '0 0 0.5rem 0', fontWeight: '500' }}>Error Generating Summary</p>
                <p style={{ color: '#991b1b', margin: 0, fontSize: '0.9rem' }}>{summaryError}</p>
              </div>
            ) : summary ? (
              <div style={{
                padding: '1.5rem',
                backgroundColor: theme.cardBackground,
                borderLeft: '4px solid #8b5cf6',
                borderRadius: '8px',
                marginBottom: '1.5rem'
              }}>
                <p style={{ color: theme.text, lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                  {summary}
                </p>
              </div>
            ) : null}

            {/* Footer */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={closeSummaryModal}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: theme.cardBackground,
                  color: theme.text,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.background
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme.cardBackground
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default PatientReports