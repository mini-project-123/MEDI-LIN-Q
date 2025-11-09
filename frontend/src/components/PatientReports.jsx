import React, { useState, useEffect } from 'react'
import { Upload, FileText, Calendar, Search, Filter, Eye, Download, Plus } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

const PatientReports = () => {
  const { theme } = useTheme()
  const [reports, setReports] = useState([])
  const [filteredReports, setFilteredReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')

  useEffect(() => {
    fetchReports()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [searchTerm, filterType, reports])

  const fetchReports = async () => {
    try {
      setLoading(true)
      
      // Mock reports data
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const mockReports = [
        {
          id: 1,
          title: 'Complete Blood Count',
          description: 'Routine blood work checkup',
          type: 'blood_test',
          date: '2024-01-15',
          file: 'blood_test_jan_2024.pdf',
          doctor: 'Dr. Sarah Johnson',
          hospital: 'City General Hospital'
        },
        {
          id: 2,
          title: 'Chest X-Ray',
          description: 'Chest examination for respiratory health',
          type: 'xray',
          date: '2024-01-10',
          file: 'chest_xray_jan_2024.pdf',
          doctor: 'Dr. Michael Chen',
          hospital: 'Metro Medical Center'
        },
        {
          id: 3,
          title: 'ECG Report',
          description: 'Heart rhythm analysis',
          type: 'ecg',
          date: '2024-01-05',
          file: 'ecg_report_jan_2024.pdf',
          doctor: 'Dr. Sarah Johnson',
          hospital: 'City General Hospital'
        }
      ]
      
      setReports(mockReports)
      setFilteredReports(mockReports)
    } catch (error) {
      console.error('Error fetching reports:', error)
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
        <div style={{ color: theme.text }}>Loading reports...</div>
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
                          {report.title}
                        </h4>
                        <p style={{ color: theme.textSecondary, fontSize: '0.9rem' }}>
                          {report.description}
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
                      <strong>Date:</strong> {new Date(report.date).toLocaleDateString()}
                    </p>
                    <p style={{ color: theme.textSecondary, fontSize: '0.9rem' }}>
                      <strong>Doctor:</strong> {report.doctor}
                    </p>
                  </div>

                  <div>
                    <p style={{ color: theme.textSecondary, fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                      <strong>Hospital:</strong> {report.hospital}
                    </p>
                    <p style={{ color: theme.textSecondary, fontSize: '0.9rem' }}>
                      <strong>File:</strong> {report.file}
                    </p>
                  </div>
                </div>

                <div style={{ 
                  display: 'flex', 
                  gap: '0.5rem',
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
    </div>
  )
}

export default PatientReports