import React, { useState, useEffect } from 'react'
import { Upload, FileText, Search, Filter, Eye, Download, Sparkles, AlertCircle, X, Loader2, Bot, Send, Paperclip } from 'lucide-react'
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

  // Report assistant chatbot state
  const [assistantOpen, setAssistantOpen] = useState(false)
  const [assistantMessages, setAssistantMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Upload a medical report here and I will explain it in simple, layman language.'
    }
  ])
  const [assistantPrompt, setAssistantPrompt] = useState('')
  const [assistantFile, setAssistantFile] = useState(null)
  const [assistantReportType, setAssistantReportType] = useState('Lab Report')
  const [assistantDescription, setAssistantDescription] = useState('')
  const [assistantActiveReport, setAssistantActiveReport] = useState(null)
  const [assistantReportSummary, setAssistantReportSummary] = useState('')
  const [assistantBusy, setAssistantBusy] = useState(false)

  const quickPrompts = [
    'Explain this report in simple words',
    'What are the important findings?',
    'Are any values abnormal?',
    'What should I ask my doctor about this report?'
  ]

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

      const summaryText = response.data?.ai_summary || response.data?.summary || 'Summary generated successfully'
      setSummary(summaryText)
      setAssistantActiveReport(uploadedReport)
      setAssistantReportSummary(summaryText)
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

  const addAssistantMessage = (sender, text) => {
    setAssistantMessages(prev => ([
      ...prev,
      {
        id: Date.now() + prev.length,
        sender,
        text
      }
    ]))
  }

  const handleAssistantUpload = async () => {
    if (!assistantFile) {
      addAssistantMessage('bot', 'Please choose a report file first so I can summarize it.')
      return
    }

    setAssistantBusy(true)
    setSummaryError(null)

    try {
      const token = localStorage.getItem('accessToken')
      const formData = new FormData()
      formData.append('report_type', assistantReportType)
      formData.append('description', assistantDescription)
      formData.append('report_file', assistantFile)

      addAssistantMessage('user', `Uploaded ${assistantFile.name}`)

      const uploadResponse = await axios.post('/api/medical-reports/', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })

      const uploadedReport = uploadResponse.data
      const reportId = uploadedReport?.id

      if (!reportId) {
        throw new Error('Upload succeeded but the report id was not returned')
      }

      addAssistantMessage('bot', 'The report is uploaded. I am generating a simple summary now...')

      const summaryResponse = await axios.post(
        `/api/reports/${reportId}/ai-summary/`,
        {},
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      )

      const summaryText = summaryResponse.data?.ai_summary || summaryResponse.data?.summary || 'Summary generated, but no text was returned.'
      addAssistantMessage('bot', summaryText)
      setAssistantActiveReport(uploadedReport)
      setAssistantReportSummary(summaryText)
      setReports(prev => [uploadedReport, ...prev])
      setFilteredReports(prev => [uploadedReport, ...prev])
      setAssistantFile(null)
      setAssistantDescription('')
    } catch (err) {
      console.error('Error uploading or summarizing report:', err)
      addAssistantMessage('bot', err.response?.data?.detail || err.response?.data?.error || 'I could not upload or summarize that report. Please try again.')
    } finally {
      setAssistantBusy(false)
    }
  }

  const handleAssistantPrompt = async () => {
    const prompt = assistantPrompt.trim()
    if (!prompt) return

    setAssistantPrompt('')
    addAssistantMessage('user', prompt)
    setAssistantBusy(true)

    try {
      const token = localStorage.getItem('accessToken')
      const response = await axios.post('/api/ai-chatbot/', {
        message: assistantReportSummary
          ? `${prompt}\n\nUploaded report summary: ${assistantReportSummary}\nReport type: ${assistantActiveReport?.report_type || assistantReportType}`
          : prompt,
        context: 'medical_query'
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      const reply = response.data?.ai_response || response.data?.response || response.data?.ai_summary || 'I could not generate a response right now.'
      addAssistantMessage('bot', reply)
    } catch (err) {
      console.error('Error sending assistant prompt:', err)
      const fallback = assistantReportSummary
        ? 'I could not reach the AI service, but the uploaded report summary is available above. Try asking about the abnormal values, the main findings, or what to discuss with your doctor.'
        : 'I could not answer that right now. Please upload a report first or try again.'
      addAssistantMessage('bot', fallback)
    } finally {
      setAssistantBusy(false)
    }
  }

  const useQuickPrompt = (question) => {
    setAssistantPrompt(question)
    handleAssistantPrompt()
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

      {/* Report Summarization Chatbot */}
      <button
        onClick={() => setAssistantOpen(true)}
        style={{
          position: 'fixed',
          right: '1.5rem',
          bottom: '1.5rem',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          border: 'none',
          background: 'linear-gradient(135deg, #2563eb, #8b5cf6)',
          color: 'white',
          display: assistantOpen ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 12px 30px rgba(37, 99, 235, 0.35)',
          zIndex: 1200,
          cursor: 'pointer'
        }}
        aria-label="Open report summarization chatbot"
      >
        <Bot size={28} />
      </button>

      {assistantOpen && (
        <div style={{
          position: 'fixed',
          right: '1.5rem',
          bottom: '1.5rem',
          width: 'min(420px, calc(100vw - 2rem))',
          maxHeight: 'min(80vh, 760px)',
          backgroundColor: theme.cardBackground,
          border: `1px solid ${theme.border}`,
          borderRadius: '20px',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.18)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          zIndex: 1201
        }}>
          <div style={{
            padding: '1rem 1.1rem',
            background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.16)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Bot size={20} />
              </div>
              <div>
                <div style={{ fontWeight: '700' }}>Report Assistant</div>
                <div style={{ fontSize: '0.82rem', opacity: 0.9 }}>Upload a report and ask questions in plain language</div>
              </div>
            </div>
            <button
              onClick={() => setAssistantOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={20} />
            </button>
          </div>

          <div style={{ padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {assistantMessages.map(message => (
              <div key={message.id} style={{
                display: 'flex',
                justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start'
              }}>
                <div style={{
                  maxWidth: '85%',
                  padding: '0.8rem 0.95rem',
                  borderRadius: '16px',
                  backgroundColor: message.sender === 'user' ? '#2563eb' : theme.background,
                  color: message.sender === 'user' ? 'white' : theme.text,
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap'
                }}>
                  {message.text}
                </div>
              </div>
            ))}

            <div style={{
              border: `1px solid ${theme.border}`,
              borderRadius: '16px',
              padding: '1rem',
              backgroundColor: theme.background,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem'
            }}>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <label style={{ color: theme.text, fontSize: '0.9rem', fontWeight: '600' }}>
                  Report type
                </label>
                <select
                  value={assistantReportType}
                  onChange={(e) => setAssistantReportType(e.target.value)}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '10px',
                    border: `1px solid ${theme.border}`,
                    backgroundColor: theme.cardBackground,
                    color: theme.text
                  }}
                >
                  <option>Lab Report</option>
                  <option>Blood Test</option>
                  <option>X-Ray</option>
                  <option>CT Scan</option>
                  <option>MRI</option>
                  <option>ECG</option>
                  <option>Ultrasound</option>
                  <option>Other</option>
                </select>
              </div>

              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <label style={{ color: theme.text, fontSize: '0.9rem', fontWeight: '600' }}>
                  Report file
                </label>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.9rem 1rem',
                  border: `1px dashed ${theme.border}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  color: theme.textSecondary,
                  backgroundColor: theme.cardBackground
                }}>
                  <Paperclip size={16} />
                  <span>{assistantFile ? assistantFile.name : 'Choose a PDF, image, or document'}</span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => setAssistantFile(e.target.files?.[0] || null)}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <label style={{ color: theme.text, fontSize: '0.9rem', fontWeight: '600' }}>
                  Add a note for the assistant
                </label>
                <textarea
                  value={assistantDescription}
                  onChange={(e) => setAssistantDescription(e.target.value)}
                  placeholder="Example: Please explain the abnormal values in simple language."
                  rows={3}
                  style={{
                    padding: '0.8rem',
                    borderRadius: '12px',
                    border: `1px solid ${theme.border}`,
                    backgroundColor: theme.cardBackground,
                    color: theme.text,
                    resize: 'vertical'
                  }}
                />
              </div>

              <button
                onClick={handleAssistantUpload}
                disabled={assistantBusy}
                style={{
                  padding: '0.85rem 1rem',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: assistantBusy ? 'not-allowed' : 'pointer',
                  background: assistantBusy ? '#93c5fd' : 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  color: 'white',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                {assistantBusy ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Upload size={16} />}
                Upload and summarize
              </button>
            </div>

            <div style={{
              display: 'flex',
              gap: '0.5rem'
            }}>
              <input
                type="text"
                value={assistantPrompt}
                onChange={(e) => setAssistantPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAssistantPrompt()
                  }
                }}
                placeholder="Ask about the report, test result, or medication..."
                style={{
                  flex: 1,
                  padding: '0.85rem 1rem',
                  borderRadius: '12px',
                  border: `1px solid ${theme.border}`,
                  backgroundColor: theme.cardBackground,
                  color: theme.text
                }}
              />
              <button
                onClick={handleAssistantPrompt}
                disabled={assistantBusy || !assistantPrompt.trim()}
                style={{
                  width: '48px',
                  border: 'none',
                  borderRadius: '12px',
                  backgroundColor: assistantPrompt.trim() ? '#2563eb' : '#cbd5e1',
                  color: 'white',
                  cursor: assistantPrompt.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Send size={16} />
              </button>
            </div>

            {assistantReportSummary && (
              <div style={{
                padding: '0.85rem',
                borderRadius: '12px',
                backgroundColor: theme.background,
                border: `1px solid ${theme.border}`,
                color: theme.textSecondary,
                fontSize: '0.85rem',
                lineHeight: 1.5
              }}>
                <strong style={{ color: theme.text }}>Active report:</strong> {assistantActiveReport?.report_type || assistantReportType}
                <div style={{ marginTop: '0.5rem' }}>{assistantReportSummary}</div>
              </div>
            )}

            <div style={{ display: 'grid', gap: '0.5rem' }}>
              <p style={{ margin: 0, fontSize: '0.8rem', color: theme.textSecondary }}>Quick questions</p>
              {quickPrompts.map((question) => (
                <button
                  key={question}
                  onClick={() => useQuickPrompt(question)}
                  disabled={assistantBusy || !assistantReportSummary}
                  style={{
                    padding: '0.7rem 0.85rem',
                    borderRadius: '10px',
                    border: `1px solid ${theme.border}`,
                    backgroundColor: assistantReportSummary ? theme.cardBackground : theme.background,
                    color: theme.text,
                    cursor: assistantBusy || !assistantReportSummary ? 'not-allowed' : 'pointer',
                    textAlign: 'left'
                  }}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

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