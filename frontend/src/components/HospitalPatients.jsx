import React, { useState, useEffect, useCallback } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import { Users, Calendar, X, Plus, Search, Phone, Edit, Trash2, Eye, Upload, AlertCircle } from 'lucide-react'
import PatientHistoryModal from './PatientHistoryModal'
import PatientReportUploadModal from './PatientReportUploadModal'

const HospitalPatients = () => {
  const { theme } = useTheme()
  const { logout } = useAuth()
  
  // --- STATE FOR API DATA ---
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // --- STATE FOR MODALS AND FILTERS ---
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
  const [newPatient, setNewPatient] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: 'Male',
    bloodGroup: 'O+'
  })

  const [editPatient, setEditPatient] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: 'Male'
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState({})

  // --- Fetch Patients Function ---
  const loadPatients = useCallback((searchTerm = '') => {
    setLoading(true)
    setError(null)
    const token = localStorage.getItem('accessToken')

    const params = new URLSearchParams()
    if (searchTerm) {
      params.append('search', searchTerm)
    }

    axios.get('/api/hospital/patients/', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: params
    })
      .then(response => {
        // Handle both paginated and non-paginated responses
        const data = response.data
        const patientList = Array.isArray(data) ? data : (data.results || data || [])
        setPatients(patientList)
      })
      .catch(err => {
        console.error('Error fetching patients:', err)
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          setError('Authentication failed. Please log in again.')
          logout()
        } else {
          setError('Failed to load patients data.')
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }, [logout])

  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      loadPatients(searchTerm)
    }, 500)

    return () => clearTimeout(searchTimeout)
  }, [searchTerm, loadPatients])

  // --- ADD PATIENT HANDLER ---
  const handleAddPatient = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFormErrors({})

    const payload = {
      first_name: newPatient.firstName,
      last_name: newPatient.lastName,
      email: newPatient.email,
      contact_no: newPatient.phone,
      gender: newPatient.gender,
      blood_group: newPatient.bloodGroup,
      password: `Patient@${Date.now()}`,
      allergies: ''
    }

    try {
      const token = localStorage.getItem('accessToken')
      await axios.post('/api/hospital/patients/add/', payload, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      alert('Patient added successfully!')
      setShowAddModal(false)
      setNewPatient({ firstName: '', lastName: '', email: '', phone: '', gender: 'Male', bloodGroup: 'O+' })
      loadPatients(searchTerm)
    } catch (err) {
      console.error('Error adding patient:', err)
      if (err.response && err.response.data) {
        const apiErrors = err.response.data
        const formattedErrors = {}
        
        if (apiErrors.first_name) formattedErrors.firstName = apiErrors.first_name[0]
        if (apiErrors.last_name) formattedErrors.lastName = apiErrors.last_name[0]
        if (apiErrors.email) formattedErrors.email = apiErrors.email[0]
        if (apiErrors.contact_no) formattedErrors.phone = apiErrors.contact_no[0]
        if (apiErrors.gender) formattedErrors.gender = apiErrors.gender[0]
        if (apiErrors.blood_group) formattedErrors.bloodGroup = apiErrors.blood_group[0]
        if (apiErrors.detail) formattedErrors.general = apiErrors.detail
        if (Object.keys(formattedErrors).length === 0) {
          formattedErrors.general = 'An unknown error occurred. Please try again.'
        }
        
        setFormErrors(formattedErrors)
      } else {
        setFormErrors({ general: 'Failed to connect to the server.' })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // --- EDIT PATIENT HANDLER ---
  const handleEditPatient = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFormErrors({})

    const payload = {
      user: {
        first_name: editPatient.firstName,
        last_name: editPatient.lastName,
        contact_no: editPatient.phone,
        gender: editPatient.gender
      }
    }

    try {
      const token = localStorage.getItem('accessToken')
      await axios.put(`/api/hospital/patients/${selectedPatient.user.id}/manage/`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      alert('Patient updated successfully!')
      setShowEditModal(false)
      loadPatients(searchTerm)
      setSelectedPatient(null)
    } catch (err) {
      console.error('Error updating patient:', err)
      setFormErrors({ general: 'Failed to update patient. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // --- DELETE PATIENT HANDLER ---
  const handleDeletePatient = async (patientId) => {
    if (!window.confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
      return
    }

    try {
      const token = localStorage.getItem('accessToken')
      await axios.delete(`/api/hospital/patients/${patientId}/manage/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      alert('Patient deleted successfully!')
      loadPatients(searchTerm)
      setSelectedPatient(null)
    } catch (err) {
      console.error('Error deleting patient:', err)
      alert('Failed to delete patient. ' + (err.response?.data?.detail || ''))
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ color: theme.text, margin: '0 0 0.5rem 0', fontSize: '2rem' }}>Patient Management</h1>
          <p style={{ color: theme.textSecondary, margin: 0 }}>Manage and view all hospital patients</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search Bar */}
          <div style={{ position: 'relative', minWidth: '250px' }}>
            <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: theme.textSecondary }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or ID..."
              style={{
                padding: '0.75rem 1rem 0.75rem 3rem',
                borderRadius: '8px',
                border: `1px solid ${theme.border || '#e2e8f0'}`,
                backgroundColor: theme.cardBackground,
                color: theme.text,
                fontSize: '0.9rem',
                width: '100%'
              }}
            />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem',
              fontWeight: '500'
            }}
          >
            <Plus size={18} />
            Add Patient
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '2rem', color: theme.textSecondary }}>
          Loading patients...
        </div>
      )}
      
      {/* Error State */}
      {!loading && error && (
        <div className="card" style={{ backgroundColor: '#fee2e2', borderColor: '#ef4444', padding: '1.5rem' }}>
          <h3 style={{ color: '#991b1b', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <AlertCircle size={20} />
            Error
          </h3>
          <p style={{ color: '#b91c1c', margin: '0.5rem 0 0 0' }}>{error}</p>
        </div>
      )}

      {/* Patients Grid */}
      {!loading && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {patients.length > 0 ? patients.map(patient => (
            <div 
              key={patient.user.id}
              className="card" 
              style={{ padding: '1.5rem' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ color: theme.text, margin: '0 0 0.25rem 0' }}>
                    {patient.user.first_name} {patient.user.last_name}
                  </h3>
                  <p style={{ color: theme.textSecondary, margin: 0, fontSize: '0.85rem' }}>ID: {patient.user.custom_id}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => {
                      setSelectedPatient(patient)
                      setEditPatient({
                        firstName: patient.user.first_name,
                        lastName: patient.user.last_name,
                        email: patient.user.email,
                        phone: patient.user.contact_no || '',
                        gender: patient.user.gender || 'Male'
                      })
                      setShowEditModal(true)
                    }}
                    style={{
                      padding: '0.5rem',
                      backgroundColor: '#f0f9ff',
                      border: '1px solid #0ea5e9',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      color: '#0369a1',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e0f2fe'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f0f9ff'}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPatient(patient)
                      setShowHistoryModal(true)
                    }}
                    style={{
                      padding: '0.5rem',
                      backgroundColor: '#f0f9ff',
                      border: '1px solid #0ea5e9',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      color: '#0369a1',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e0f2fe'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f0f9ff'}
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => handleDeletePatient(patient.user.id)}
                    style={{
                      padding: '0.5rem',
                      backgroundColor: '#fef2f2',
                      border: '1px solid #fca5a5',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      color: '#dc2626',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Patient Info */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '1rem',
                marginBottom: '1.5rem',
                padding: '1rem',
                backgroundColor: theme.background || '#f8fafc',
                borderRadius: '8px',
                fontSize: '0.9rem'
              }}>
                <div>
                  <p style={{ color: theme.textSecondary, margin: '0 0 0.25rem 0', fontSize: '0.8rem' }}>Gender</p>
                  <p style={{ color: theme.text, margin: 0, fontWeight: '500' }}>{patient.user.gender || 'N/A'}</p>
                </div>
                <div>
                  <p style={{ color: theme.textSecondary, margin: '0 0 0.25rem 0', fontSize: '0.8rem' }}>Contact</p>
                  <p style={{ color: theme.text, margin: 0, fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Phone size={14} /> {patient.user.contact_no || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <button
                  onClick={() => {
                    setSelectedPatient(patient)
                    setShowHistoryModal(true)
                  }}
                  style={{
                    padding: '0.75rem',
                    backgroundColor: 'transparent',
                    border: `1px solid ${theme.border || '#e2e8f0'}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    color: theme.text,
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <Calendar size={16} />
                  View Records
                </button>
                <button
                  onClick={() => {
                    setSelectedPatient(patient)
                    setShowUploadModal(true)
                  }}
                  style={{
                    padding: '0.75rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <Upload size={16} />
                  Upload Report
                </button>
              </div>
            </div>
          )) : (
            <div style={{
              gridColumn: '1 / -1',
              padding: '3rem',
              textAlign: 'center',
              backgroundColor: theme.background || '#f8fafc',
              borderRadius: '8px'
            }}>
              <Users size={48} style={{ color: theme.textSecondary, marginBottom: '1rem', opacity: 0.5 }} />
              <p style={{ color: theme.textSecondary, margin: 0, fontSize: '1rem' }}>
                No patients found. Click "Add Patient" to create one.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ===== ADD PATIENT MODAL ===== */}
      {showAddModal && (
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
          <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
              <h2 style={{ color: theme.text, margin: 0 }}>Add New Patient</h2>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setFormErrors({})
                  setNewPatient({ firstName: '', lastName: '', email: '', phone: '', gender: 'Male', bloodGroup: 'O+' })
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.textSecondary, fontSize: '1.5rem' }}
              >
                <X size={24} />
              </button>
            </div>

            {formErrors.general && (
              <div style={{
                padding: '1rem',
                backgroundColor: '#fee2e2',
                color: '#991b1b',
                borderRadius: '6px',
                marginBottom: '1rem',
                fontSize: '0.9rem'
              }}>
                {formErrors.general}
              </div>
            )}

            <form onSubmit={handleAddPatient}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', color: theme.text, fontWeight: '500', marginBottom: '0.5rem' }}>First Name *</label>
                <input
                  type="text"
                  value={newPatient.firstName}
                  onChange={(e) => setNewPatient(prev => ({ ...prev, firstName: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: `1px solid ${formErrors.firstName ? '#ef4444' : theme.border || '#e2e8f0'}`,
                    backgroundColor: theme.cardBackground,
                    color: theme.text,
                    boxSizing: 'border-box'
                  }}
                />
                {formErrors.firstName && <p style={{ color: '#ef4444', margin: '0.25rem 0 0 0', fontSize: '0.8rem' }}>{formErrors.firstName}</p>}
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', color: theme.text, fontWeight: '500', marginBottom: '0.5rem' }}>Last Name *</label>
                <input
                  type="text"
                  value={newPatient.lastName}
                  onChange={(e) => setNewPatient(prev => ({ ...prev, lastName: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: `1px solid ${formErrors.lastName ? '#ef4444' : theme.border || '#e2e8f0'}`,
                    backgroundColor: theme.cardBackground,
                    color: theme.text,
                    boxSizing: 'border-box'
                  }}
                />
                {formErrors.lastName && <p style={{ color: '#ef4444', margin: '0.25rem 0 0 0', fontSize: '0.8rem' }}>{formErrors.lastName}</p>}
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', color: theme.text, fontWeight: '500', marginBottom: '0.5rem' }}>Email *</label>
                <input
                  type="email"
                  value={newPatient.email}
                  onChange={(e) => setNewPatient(prev => ({ ...prev, email: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: `1px solid ${formErrors.email ? '#ef4444' : theme.border || '#e2e8f0'}`,
                    backgroundColor: theme.cardBackground,
                    color: theme.text,
                    boxSizing: 'border-box'
                  }}
                />
                {formErrors.email && <p style={{ color: '#ef4444', margin: '0.25rem 0 0 0', fontSize: '0.8rem' }}>{formErrors.email}</p>}
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', color: theme.text, fontWeight: '500', marginBottom: '0.5rem' }}>Phone *</label>
                <input
                  type="text"
                  value={newPatient.phone}
                  onChange={(e) => setNewPatient(prev => ({ ...prev, phone: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: `1px solid ${formErrors.phone ? '#ef4444' : theme.border || '#e2e8f0'}`,
                    backgroundColor: theme.cardBackground,
                    color: theme.text,
                    boxSizing: 'border-box'
                  }}
                />
                {formErrors.phone && <p style={{ color: '#ef4444', margin: '0.25rem 0 0 0', fontSize: '0.8rem' }}>{formErrors.phone}</p>}
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', color: theme.text, fontWeight: '500', marginBottom: '0.5rem' }}>Gender *</label>
                <select
                  value={newPatient.gender}
                  onChange={(e) => setNewPatient(prev => ({ ...prev, gender: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: `1px solid ${theme.border || '#e2e8f0'}`,
                    backgroundColor: theme.cardBackground,
                    color: theme.text,
                    boxSizing: 'border-box'
                  }}
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', color: theme.text, fontWeight: '500', marginBottom: '0.5rem' }}>Blood Group</label>
                <select
                  value={newPatient.bloodGroup}
                  onChange={(e) => setNewPatient(prev => ({ ...prev, bloodGroup: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: `1px solid ${theme.border || '#e2e8f0'}`,
                    backgroundColor: theme.cardBackground,
                    color: theme.text,
                    boxSizing: 'border-box'
                  }}
                >
                  <option>O+</option>
                  <option>O-</option>
                  <option>A+</option>
                  <option>A-</option>
                  <option>B+</option>
                  <option>B-</option>
                  <option>AB+</option>
                  <option>AB-</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    setFormErrors({})
                    setNewPatient({ firstName: '', lastName: '', email: '', phone: '', gender: 'Male', bloodGroup: 'O+' })
                  }}
                  disabled={isSubmitting}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: 'transparent',
                    border: `1px solid ${theme.border || '#e2e8f0'}`,
                    borderRadius: '6px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    color: theme.text,
                    fontSize: '1rem',
                    fontWeight: '500',
                    opacity: isSubmitting ? 0.5 : 1
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    fontSize: '1rem',
                    fontWeight: '500',
                    opacity: isSubmitting ? 0.7 : 1
                  }}
                >
                  {isSubmitting ? 'Adding...' : 'Add Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== EDIT PATIENT MODAL ===== */}
      {showEditModal && selectedPatient && (
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
          <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
              <h2 style={{ color: theme.text, margin: 0 }}>Edit Patient</h2>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setFormErrors({})
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.textSecondary, fontSize: '1.5rem' }}
              >
                <X size={24} />
              </button>
            </div>

            {formErrors.general && (
              <div style={{
                padding: '1rem',
                backgroundColor: '#fee2e2',
                color: '#991b1b',
                borderRadius: '6px',
                marginBottom: '1rem',
                fontSize: '0.9rem'
              }}>
                {formErrors.general}
              </div>
            )}

            <form onSubmit={handleEditPatient}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', color: theme.text, fontWeight: '500', marginBottom: '0.5rem' }}>First Name</label>
                <input
                  type="text"
                  value={editPatient.firstName}
                  onChange={(e) => setEditPatient(prev => ({ ...prev, firstName: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: `1px solid ${theme.border || '#e2e8f0'}`,
                    backgroundColor: theme.cardBackground,
                    color: theme.text,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', color: theme.text, fontWeight: '500', marginBottom: '0.5rem' }}>Last Name</label>
                <input
                  type="text"
                  value={editPatient.lastName}
                  onChange={(e) => setEditPatient(prev => ({ ...prev, lastName: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: `1px solid ${theme.border || '#e2e8f0'}`,
                    backgroundColor: theme.cardBackground,
                    color: theme.text,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', color: theme.text, fontWeight: '500', marginBottom: '0.5rem' }}>Email</label>
                <input
                  type="email"
                  value={editPatient.email}
                  disabled
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: `1px solid ${theme.border || '#e2e8f0'}`,
                    backgroundColor: theme.background || '#f8fafc',
                    color: theme.textSecondary,
                    boxSizing: 'border-box',
                    opacity: 0.6
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', color: theme.text, fontWeight: '500', marginBottom: '0.5rem' }}>Phone</label>
                <input
                  type="text"
                  value={editPatient.phone}
                  onChange={(e) => setEditPatient(prev => ({ ...prev, phone: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: `1px solid ${theme.border || '#e2e8f0'}`,
                    backgroundColor: theme.cardBackground,
                    color: theme.text,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', color: theme.text, fontWeight: '500', marginBottom: '0.5rem' }}>Gender</label>
                <select
                  value={editPatient.gender}
                  onChange={(e) => setEditPatient(prev => ({ ...prev, gender: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: `1px solid ${theme.border || '#e2e8f0'}`,
                    backgroundColor: theme.cardBackground,
                    color: theme.text,
                    boxSizing: 'border-box'
                  }}
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setFormErrors({})
                  }}
                  disabled={isSubmitting}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: 'transparent',
                    border: `1px solid ${theme.border || '#e2e8f0'}`,
                    borderRadius: '6px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    color: theme.text,
                    fontSize: '1rem',
                    fontWeight: '500',
                    opacity: isSubmitting ? 0.5 : 1
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    fontSize: '1rem',
                    fontWeight: '500',
                    opacity: isSubmitting ? 0.7 : 1
                  }}
                >
                  {isSubmitting ? 'Updating...' : 'Update Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {selectedPatient && <PatientHistoryModal isOpen={showHistoryModal} patient={selectedPatient} onClose={() => setShowHistoryModal(false)} />}

      {/* Upload Modal */}
      {selectedPatient && <PatientReportUploadModal isOpen={showUploadModal} patient={selectedPatient} onClose={() => setShowUploadModal(false)} onSuccess={() => loadPatients(searchTerm)} />}
    </div>
  )
}

export default HospitalPatients
