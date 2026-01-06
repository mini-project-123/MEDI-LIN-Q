import React, { useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { X, Upload, AlertCircle, CheckCircle } from 'lucide-react'
import axios from 'axios'

/**
 * PatientReportUploadModal
 * Modal for uploading medical reports for a patient
 */
const PatientReportUploadModal = ({ isOpen, patient, onClose, onSuccess }) => {
  const { theme } = useTheme()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    report_type: 'Blood Test',
    description: '',
    report_file: null
  })

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData(prev => ({
        ...prev,
        report_file: file
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!formData.report_type || !formData.report_file) {
      setError('Please fill in all required fields and select a file')
      return
    }

    // Get patient ID safely
    const patientId = patient?.id || patient?.user?.id
    if (!patientId) {
      setError('Patient ID not found. Please try again.')
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem('accessToken')
      const form = new FormData()
      form.append('report_type', formData.report_type)
      form.append('description', formData.description || '')
      form.append('report_file', formData.report_file)

      await axios.post(`/api/hospital/patients/${patientId}/upload-report/`, form, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })

      setSuccess(true)
      setTimeout(() => {
        setFormData({ report_type: 'Blood Test', description: '', report_file: null })
        onClose()
        if (onSuccess) onSuccess()
      }, 1500)
    } catch (err) {
      console.error('Error uploading report:', err)
      setError(err.response?.data?.detail || 'Failed to upload report. Please try again.')
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
        maxWidth: '500px',
        padding: '2rem'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ color: theme.text, margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Upload size={24} />
              Upload Medical Report
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

        {/* Success Message */}
        {success && (
          <div style={{
            padding: '1rem',
            backgroundColor: '#d1fae5',
            borderColor: '#10b981',
            borderRadius: '8px',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <CheckCircle size={20} style={{ color: '#059669' }} />
            <p style={{ color: '#065f46', margin: 0 }}>Report uploaded successfully!</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
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

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Report Type */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: theme.text, fontWeight: '500', marginBottom: '0.5rem' }}>
              Report Type *
            </label>
            <select
              value={formData.report_type}
              onChange={(e) => setFormData(prev => ({ ...prev, report_type: e.target.value }))}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: `1px solid ${theme.border || '#e2e8f0'}`,
                backgroundColor: theme.cardBackground,
                color: theme.text,
                fontSize: '1rem',
                fontFamily: 'inherit'
              }}
            >
              <option>Blood Test</option>
              <option>X-Ray</option>
              <option>CT Scan</option>
              <option>MRI</option>
              <option>ECG</option>
              <option>Ultrasound</option>
              <option>Laboratory Report</option>
              <option>Other</option>
            </select>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: theme.text, fontWeight: '500', marginBottom: '0.5rem' }}>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter report description or findings..."
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: `1px solid ${theme.border || '#e2e8f0'}`,
                backgroundColor: theme.cardBackground,
                color: theme.text,
                fontSize: '1rem',
                fontFamily: 'inherit',
                minHeight: '100px',
                resize: 'vertical',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* File Upload */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: theme.text, fontWeight: '500', marginBottom: '0.5rem' }}>
              Report File *
            </label>
            <div style={{
              padding: '2rem',
              borderRadius: '8px',
              border: `2px dashed ${theme.border || '#e2e8f0'}`,
              backgroundColor: theme.background || '#f8fafc',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onDragOver={(e) => {
              e.preventDefault()
              e.currentTarget.style.borderColor = '#3b82f6'
              e.currentTarget.style.backgroundColor = '#dbeafe'
            }}
            onDragLeave={(e) => {
              e.currentTarget.style.borderColor = theme.border || '#e2e8f0'
              e.currentTarget.style.backgroundColor = theme.background || '#f8fafc'
            }}
            onDrop={(e) => {
              e.preventDefault()
              e.currentTarget.style.borderColor = theme.border || '#e2e8f0'
              e.currentTarget.style.backgroundColor = theme.background || '#f8fafc'
              const files = e.dataTransfer.files
              if (files[0]) {
                setFormData(prev => ({ ...prev, report_file: files[0] }))
              }
            }}
            >
              <input
                type="file"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                id="file-input"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              <label htmlFor="file-input" style={{ cursor: 'pointer', width: '100%' }}>
                <Upload size={32} style={{ color: '#3b82f6', marginBottom: '0.5rem', opacity: 0.7 }} />
                <p style={{ color: theme.text, margin: '0.5rem 0 0 0', fontWeight: '500' }}>
                  {formData.report_file ? formData.report_file.name : 'Click to upload or drag and drop'}
                </p>
                <p style={{ color: theme.textSecondary, margin: '0.25rem 0 0 0', fontSize: '0.85rem' }}>
                  PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                </p>
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: 'transparent',
                color: '#3b82f6',
                border: `1px solid ${theme.border || '#e2e8f0'}`,
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: '500',
                opacity: loading ? 0.5 : 1
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: '500',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Uploading...' : 'Upload Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PatientReportUploadModal
