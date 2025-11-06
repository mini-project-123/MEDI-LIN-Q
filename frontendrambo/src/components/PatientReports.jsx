import React, { useState, useEffect } from 'react'
import { Upload, FileText, Calendar, Search, Filter, Eye, Download, Plus } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

const PatientReports = () => {
  const { theme } = useTheme()
  const [reports, setReports] = useState([])
  const [filteredReports, setFilteredReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    type: 'blood_test',
    file: null,
    date: new Date().toISOString().split('T')[0]
  })

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

  const handleUploadSubmit = async (e) => {
    e.preventDefault()
    
    const newReport = {
      id: Date.now(),
      title: uploadForm.title,
      description: uploadForm.description,
      type: uploadForm.type,
      date: uploadForm.date,
      file: uploadForm.file?.name || 'uploaded-report.pdf',
      doctor: 'Self-uploaded',
      hospital: 'Patient Upload'
    }
    
    setReports(prev => [newReport, ...prev])
    setUploadForm({
      title: '',
      description: '',
      type: 'blood_test',
      file: null,
      date: new Date().toISOString().split('T')[0]
    })
    setShowUploadModal(false)
    
    alert('Medical report uploaded successfully!')
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

  const renderUploadModal = () => {
    if (!showUploadModal) return null

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: theme.cardBackground,
          color: theme.text,
          borderRadius: '0.75rem',
          padding: '2rem',
          maxWidth: '500px',
          width: '90%',
          border: `1px solid ${theme.border}`
        }}>
          <h3 style={{ marginBottom: '1.5rem', color: theme.text }}>
            Upload Medical Report
          </h3>
          
          <form onSubmit={handleUploadSubmit}>
            <div className="form-group">
              <label className="form-label" style={{ color: theme.text }}>Report Title</label>
              <input
                type="text"
                value={uploadForm.title}
                onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                className="form-input"
                style={{ 
                  backgroundColor: theme.background,
                  color: theme.text,
                  borderColor: theme.border
                }}
                placeholder="Enter report title"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: theme.text }}>Report Type</label>
              <select
                value={uploadForm.type}
                onChange={(e) => setUploadForm({...uploadForm, type: e.target.value})}
                className="form-input"
                style={{ 
                  backgroundColor: theme.background,
                  color: theme.text,
                  borderColor: theme.border
                }}
                required
              >
                <option value="blood_test">Blood Test</option>
                <option value="xray">X-Ray</option>
                <option value="mri">MRI Scan</option>
                <option value="ct_scan">CT Scan</option>
                <option value="ecg">ECG</option>
                <option value="ultrasound">Ultrasound</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: theme.text }}>Description</label>
              <textarea
                value={uploadForm.description}
                onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                className="form-input"
                style={{ 
                  backgroundColor: theme.background,
                  color: theme.text,
                  borderColor: theme.border
                }}
                placeholder="Add description or notes"
                rows="3"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: theme.text }}>Report Date</label>
              <input
                type="date"
                value={uploadForm.date}
                onChange={(e) => setUploadForm({...uploadForm, date: e.target.value})}
                className="form-input"
                style={{ 
                  backgroundColor: theme.background,
                  color: theme.text,
                  borderColor: theme.border
                }}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: theme.text }}>Upload File</label>
              <input
                type="file"
                onChange={(e) => setUploadForm({...uploadForm, file: e.target.files[0]})}
                className="form-input"
                style={{ 
                  backgroundColor: theme.background,
                  color: theme.text,
                  borderColor: theme.border
                }}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                required
              />
              <p style={{ color: theme.textSecondary, fontSize: '0.8rem', marginTop: '0.25rem' }}>
                Supported formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB)
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                <Upload size={16} style={{ marginRight: '0.5rem' }} />
                Upload Report
              </button>
              <button 
                type="button" 
                onClick={() => setShowUploadModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    )
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
      {/* Header with Upload Button */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div>
          <h2 style={{ color: theme.text, margin: '0 0 0.5rem 0' }}>Medical Reports</h2>
          <p style={{ color: theme.textSecondary, margin: 0 }}>
            Upload and manage your medical reports and test results
          </p>
        </div>
        <button 
          onClick={() => setShowUploadModal(true)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={16} />
          Upload Report
        </button>
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
                  <button className="btn btn-primary" style={{ fontSize: '0.9rem' }}>
                    <Eye size={14} style={{ marginRight: '0.25rem' }} />
                    View Report
                  </button>
                  <button className="btn btn-secondary" style={{ fontSize: '0.9rem' }}>
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
              Upload your first medical report to get started
            </p>
            <button 
              onClick={() => setShowUploadModal(true)}
              className="btn btn-primary"
              style={{ marginTop: '1rem' }}
            >
              Upload Your First Report
            </button>
          </div>
        )}
      </div>

      {renderUploadModal()}
    </div>
  )
}

export default PatientReports