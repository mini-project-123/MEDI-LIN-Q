import React, { useState, useEffect } from 'react'
import { Pill, Calendar, User, FileText, Download, Search, Plus, Upload } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import axios from 'axios'

const PatientPrescriptions = () => {
  const { theme } = useTheme()
  const [prescriptions, setPrescriptions] = useState([])
  const [filteredPrescriptions, setFilteredPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    medicationName: '',
    dosage: '',
    frequency: '',
    duration: '',
    doctorName: '',
    instructions: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    file: null
  })

  useEffect(() => {
    fetchPrescriptions()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [searchTerm, filterStatus, prescriptions])

  const fetchPrescriptions = async () => {
    try {
      setLoading(true)
      
      // Mock prescriptions data
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const mockPrescriptions = [
        {
          id: 1,
          medication: { name: 'Lisinopril' },
          dosage: '10mg',
          frequency: 'Once daily',
          duration: '30 days',
          doctor_name: 'Dr. Sarah Johnson',
          start_date: '2024-01-01',
          end_date: '2024-01-31',
          instructions: 'Take with food',
          notes: 'For blood pressure management',
          appointment: { appointment_datetime: '2024-01-01T10:00:00' }
        },
        {
          id: 2,
          medication: { name: 'Metformin' },
          dosage: '500mg',
          frequency: 'Twice daily',
          duration: '90 days',
          doctor_name: 'Dr. Michael Chen',
          start_date: '2024-01-15',
          end_date: '2024-04-15',
          instructions: 'Take with meals',
          notes: 'For diabetes management',
          appointment: { appointment_datetime: '2024-01-15T14:00:00' }
        }
      ]
      
      setPrescriptions(mockPrescriptions)
      setFilteredPrescriptions(mockPrescriptions)
    } catch (error) {
      console.error('Error fetching prescriptions:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...prescriptions]

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(prescription => 
        prescription.medication?.name?.toLowerCase().includes(term) ||
        prescription.doctor_name?.toLowerCase().includes(term)
      )
    }

    // Status filter
    if (filterStatus !== 'all') {
      const now = new Date()
      filtered = filtered.filter(prescription => {
        const endDate = new Date(prescription.end_date)
        if (filterStatus === 'active') {
          return endDate >= now
        } else if (filterStatus === 'expired') {
          return endDate < now
        }
        return true
      })
    }

    setFilteredPrescriptions(filtered)
  }

  const isPrescriptionActive = (endDate) => {
    return new Date(endDate) >= new Date()
  }

  const handleUploadSubmit = async (e) => {
    e.preventDefault()
    
    const newPrescription = {
      id: Date.now(),
      medication: { name: uploadForm.medicationName },
      dosage: uploadForm.dosage,
      frequency: uploadForm.frequency,
      duration: uploadForm.duration,
      doctor_name: uploadForm.doctorName,
      start_date: uploadForm.startDate,
      end_date: uploadForm.endDate,
      instructions: uploadForm.instructions,
      notes: 'Self-uploaded prescription',
      appointment: { appointment_datetime: new Date().toISOString() }
    }
    
    setPrescriptions(prev => [newPrescription, ...prev])
    setUploadForm({
      medicationName: '',
      dosage: '',
      frequency: '',
      duration: '',
      doctorName: '',
      instructions: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      file: null
    })
    setShowUploadModal(false)
    
    alert('Prescription added successfully!')
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
          maxWidth: '600px',
          width: '90%',
          maxHeight: '90vh',
          overflowY: 'auto',
          border: `1px solid ${theme.border}`
        }}>
          <h3 style={{ marginBottom: '1.5rem', color: theme.text }}>
            Add Prescription
          </h3>
          
          <form onSubmit={handleUploadSubmit}>
            <div className="grid grid-2" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ color: theme.text }}>Medication Name</label>
                <input
                  type="text"
                  value={uploadForm.medicationName}
                  onChange={(e) => setUploadForm({...uploadForm, medicationName: e.target.value})}
                  className="form-input"
                  style={{ 
                    backgroundColor: theme.background,
                    color: theme.text,
                    borderColor: theme.border
                  }}
                  placeholder="Enter medication name"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: theme.text }}>Dosage</label>
                <input
                  type="text"
                  value={uploadForm.dosage}
                  onChange={(e) => setUploadForm({...uploadForm, dosage: e.target.value})}
                  className="form-input"
                  style={{ 
                    backgroundColor: theme.background,
                    color: theme.text,
                    borderColor: theme.border
                  }}
                  placeholder="e.g., 10mg, 1 tablet"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: theme.text }}>Frequency</label>
                <select
                  value={uploadForm.frequency}
                  onChange={(e) => setUploadForm({...uploadForm, frequency: e.target.value})}
                  className="form-input"
                  style={{ 
                    backgroundColor: theme.background,
                    color: theme.text,
                    borderColor: theme.border
                  }}
                  required
                >
                  <option value="">Select frequency</option>
                  <option value="Once daily">Once daily</option>
                  <option value="Twice daily">Twice daily</option>
                  <option value="Three times daily">Three times daily</option>
                  <option value="Four times daily">Four times daily</option>
                  <option value="As needed">As needed</option>
                  <option value="Weekly">Weekly</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: theme.text }}>Duration</label>
                <input
                  type="text"
                  value={uploadForm.duration}
                  onChange={(e) => setUploadForm({...uploadForm, duration: e.target.value})}
                  className="form-input"
                  style={{ 
                    backgroundColor: theme.background,
                    color: theme.text,
                    borderColor: theme.border
                  }}
                  placeholder="e.g., 30 days, 2 weeks"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: theme.text }}>Doctor Name</label>
                <input
                  type="text"
                  value={uploadForm.doctorName}
                  onChange={(e) => setUploadForm({...uploadForm, doctorName: e.target.value})}
                  className="form-input"
                  style={{ 
                    backgroundColor: theme.background,
                    color: theme.text,
                    borderColor: theme.border
                  }}
                  placeholder="Prescribing doctor"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: theme.text }}>Start Date</label>
                <input
                  type="date"
                  value={uploadForm.startDate}
                  onChange={(e) => setUploadForm({...uploadForm, startDate: e.target.value})}
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
                <label className="form-label" style={{ color: theme.text }}>End Date</label>
                <input
                  type="date"
                  value={uploadForm.endDate}
                  onChange={(e) => setUploadForm({...uploadForm, endDate: e.target.value})}
                  className="form-input"
                  style={{ 
                    backgroundColor: theme.background,
                    color: theme.text,
                    borderColor: theme.border
                  }}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: theme.text }}>Instructions</label>
              <textarea
                value={uploadForm.instructions}
                onChange={(e) => setUploadForm({...uploadForm, instructions: e.target.value})}
                className="form-input"
                style={{ 
                  backgroundColor: theme.background,
                  color: theme.text,
                  borderColor: theme.border
                }}
                placeholder="Special instructions (e.g., take with food, avoid alcohol)"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: theme.text }}>Prescription Image (Optional)</label>
              <input
                type="file"
                onChange={(e) => setUploadForm({...uploadForm, file: e.target.files[0]})}
                className="form-input"
                style={{ 
                  backgroundColor: theme.background,
                  color: theme.text,
                  borderColor: theme.border
                }}
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <p style={{ color: theme.textSecondary, fontSize: '0.8rem', marginTop: '0.25rem' }}>
                Upload a photo or scan of the prescription (Optional)
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                <Plus size={16} style={{ marginRight: '0.5rem' }} />
                Add Prescription
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
        <div style={{ color: theme.text }}>Loading prescriptions...</div>
      </div>
    )
  }

  return (
    <div>
      {/* Header with Add Button */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div>
          <h2 style={{ color: theme.text, margin: '0 0 0.5rem 0' }}>My Prescriptions</h2>
          <p style={{ color: theme.textSecondary, margin: 0 }}>
            Manage your medications and prescriptions
          </p>
        </div>
        <button 
          onClick={() => setShowUploadModal(true)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={16} />
          Add Prescription
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-6" style={{ 
        backgroundColor: theme.cardBackground,
        borderColor: theme.border
      }}>
        <div className="grid grid-2" style={{ gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" style={{ color: theme.text }}>Search</label>
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
                placeholder="Search by medication or doctor..."
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
            <label className="form-label" style={{ color: theme.text }}>Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="form-input"
              style={{ 
                backgroundColor: theme.background,
                color: theme.text,
                borderColor: theme.border
              }}
            >
              <option value="all">All Prescriptions</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>
      </div>

      {/* Prescriptions List */}
      <div className="card" style={{ 
        backgroundColor: theme.cardBackground,
        borderColor: theme.border
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{ color: theme.text }}>
            My Prescriptions ({filteredPrescriptions.length})
          </h3>
        </div>

        {filteredPrescriptions.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredPrescriptions.map((prescription) => {
              const isActive = isPrescriptionActive(prescription.end_date)
              
              return (
                <div 
                  key={prescription.id}
                  style={{ 
                    padding: '1rem', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '0.5rem',
                    backgroundColor: isActive ? '#f0fdf4' : '#fafafa'
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <Pill size={24} style={{ color: isActive ? '#10b981' : '#6b7280' }} />
                        <div>
                          <h4 style={{ color: '#1e293b', marginBottom: '0.25rem' }}>
                            {prescription.medication?.name || 'Unknown Medication'}
                          </h4>
                          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                            Prescribed by Dr. {prescription.doctor_name}
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
                        backgroundColor: isActive ? '#dcfce7' : '#f3f4f6',
                        color: isActive ? '#166534' : '#6b7280'
                      }}>
                        {isActive ? 'ACTIVE' : 'EXPIRED'}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    <div style={{ 
                      padding: '0.5rem 0.75rem',
                      backgroundColor: 'white',
                      borderRadius: '0.375rem',
                      border: '1px solid #e5e7eb',
                      fontSize: '0.8rem'
                    }}>
                      <strong>Dosage:</strong> {prescription.dosage}
                    </div>
                    
                    <div style={{ 
                      padding: '0.5rem 0.75rem',
                      backgroundColor: 'white',
                      borderRadius: '0.375rem',
                      border: '1px solid #e5e7eb',
                      fontSize: '0.8rem'
                    }}>
                      <strong>Frequency:</strong> {prescription.frequency}
                    </div>
                    
                    <div style={{ 
                      padding: '0.5rem 0.75rem',
                      backgroundColor: 'white',
                      borderRadius: '0.375rem',
                      border: '1px solid #e5e7eb',
                      fontSize: '0.8rem'
                    }}>
                      <strong>Duration:</strong> {prescription.duration}
                    </div>

                    <div style={{ 
                      padding: '0.5rem 0.75rem',
                      backgroundColor: 'white',
                      borderRadius: '0.375rem',
                      border: '1px solid #e5e7eb',
                      fontSize: '0.8rem'
                    }}>
                      <strong>Start:</strong> {new Date(prescription.start_date).toLocaleDateString()}
                    </div>
                    
                    <div style={{ 
                      padding: '0.5rem 0.75rem',
                      backgroundColor: 'white',
                      borderRadius: '0.375rem',
                      border: '1px solid #e5e7eb',
                      fontSize: '0.8rem'
                    }}>
                      <strong>End:</strong> {new Date(prescription.end_date).toLocaleDateString()}
                    </div>
                    
                    <div style={{ 
                      padding: '0.5rem 0.75rem',
                      backgroundColor: '#f0f9ff',
                      color: '#0369a1',
                      borderRadius: '0.375rem',
                      fontSize: '0.8rem',
                      fontWeight: '500'
                    }}>
                      <strong>Appointment:</strong> {new Date(prescription.appointment?.appointment_datetime).toLocaleDateString()}
                    </div>
                  </div>

                  {prescription.notes && (
                    <div style={{ 
                      padding: '0.75rem', 
                      backgroundColor: 'white', 
                      borderRadius: '0.5rem',
                      marginBottom: '1rem'
                    }}>
                      <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                        <strong>Notes:</strong> {prescription.notes}
                      </p>
                    </div>
                  )}

                  {prescription.instructions && (
                    <div style={{ 
                      padding: '0.75rem', 
                      backgroundColor: '#fef3c7', 
                      borderRadius: '0.5rem',
                      marginBottom: '1rem'
                    }}>
                      <p style={{ color: '#92400e', fontSize: '0.9rem' }}>
                        <strong>Instructions:</strong> {prescription.instructions}
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
                      <FileText size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                      View Details
                    </button>
                    <button className="btn btn-secondary" style={{ fontSize: '0.9rem' }}>
                      <Download size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                      Download
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <Pill size={48} style={{ color: theme.textSecondary, margin: '0 auto 1rem' }} />
            <p style={{ color: theme.textSecondary, fontSize: '1.1rem' }}>
              No prescriptions found
            </p>
            <p style={{ color: theme.textSecondary, fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Add your prescriptions to keep track of your medications
            </p>
            <button 
              onClick={() => setShowUploadModal(true)}
              className="btn btn-primary"
              style={{ marginTop: '1rem' }}
            >
              Add Your First Prescription
            </button>
          </div>
        )}
      </div>

      {renderUploadModal()}
    </div>
  )
}

export default PatientPrescriptions