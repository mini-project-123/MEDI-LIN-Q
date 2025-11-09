import React, { useState, useEffect } from 'react'
import { Search, Filter, User, Calendar, Phone, Mail, Eye, FileText } from 'lucide-react'

const DoctorPatients = () => {
  const [patients, setPatients] = useState([])
  const [filteredPatients, setFilteredPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [patientDetails, setPatientDetails] = useState(null)
  const [patientSummary, setPatientSummary] = useState('')
  const [showPatientModal, setShowPatientModal] = useState(false)
  const [filters, setFilters] = useState({
    search: '',
    visited: '',
    consultationType: ''
  })

  useEffect(() => {
    fetchPatients()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [filters, patients])

  const fetchPatients = async () => {
    setLoading(true)
    // Mock patient data
    const mockPatients = [
      {
        id: 1,
        user: { first_name: 'John', last_name: 'Doe', email: 'john@example.com' },
        phone: '+1234567890',
        date_of_birth: '1980-01-15',
        blood_group: 'O+',
        last_visit: new Date().toISOString().split('T')[0],
        consultation_type: 'In-Person'
      },
      {
        id: 2,
        user: { first_name: 'Jane', last_name: 'Smith', email: 'jane@example.com' },
        phone: '+1234567891',
        date_of_birth: '1992-05-20',
        blood_group: 'A+',
        last_visit: new Date().toISOString().split('T')[0],
        consultation_type: 'Video Call'
      }
    ]
    setTimeout(() => {
      setPatients(mockPatients)
      setFilteredPatients(mockPatients)
      setLoading(false)
    }, 500)
  }

  const fetchPatientDetails = async (patientId) => {
    const patient = patients.find(p => p.id === patientId)
    if (patient) {
      setPatientDetails(patient)
    }
  }

  const fetchPatientSummary = async (patientId) => {
    // Mock AI summary
    setPatientSummary('Patient has been under regular care with stable vitals. Recent checkup shows improvement in overall health. Continue current medication and schedule follow-up in 2 weeks.')
  }

  const applyFilters = () => {
    let filtered = [...patients]

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(patient => 
        patient.user?.first_name?.toLowerCase().includes(searchTerm) ||
        patient.user?.last_name?.toLowerCase().includes(searchTerm) ||
        patient.user?.custom_id?.toLowerCase().includes(searchTerm)
      )
    }

    // Visit filter
    if (filters.visited) {
      const today = new Date()
      const todayStr = today.toDateString()
      const yesterday = new Date(today)
      yesterday.setDate(today.getDate() - 1)
      const yesterdayStr = yesterday.toDateString()

      filtered = filtered.filter(patient => {
        if (!patient.last_visit_date) return false
        
        const visitDate = new Date(patient.last_visit_date).toDateString()
        
        switch (filters.visited) {
          case 'today':
            return visitDate === todayStr
          case 'yesterday':
            return visitDate === yesterdayStr
          case 'this_month':
            const visitMonth = new Date(patient.last_visit_date)
            return visitMonth.getMonth() === today.getMonth() && 
                   visitMonth.getFullYear() === today.getFullYear()
          default:
            return true
        }
      })
    }

    // Consultation type filter
    if (filters.consultationType) {
      filtered = filtered.filter(patient => 
        patient.consultation_type === filters.consultationType
      )
    }

    setFilteredPatients(filtered)
  }

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }))
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      visited: '',
      consultationType: ''
    })
  }

  const openPatientModal = async (patient) => {
    setSelectedPatient(patient)
    setShowPatientModal(true)
    setPatientDetails(null)
    setPatientSummary('')
    
    // Fetch detailed patient information
    await fetchPatientDetails(patient.id)
    await fetchPatientSummary(patient.id)
  }

  const closePatientModal = () => {
    setShowPatientModal(false)
    setSelectedPatient(null)
    setPatientDetails(null)
    setPatientSummary('')
  }

  const renderFilters = () => (
    <div className="card mb-6">
      <h3 style={{ marginBottom: '1rem', color: '#1e293b' }}>
        <Filter size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
        Filter Patients
      </h3>
      
      <div className="grid grid-3" style={{ gap: '1rem', marginBottom: '1rem' }}>
        <div className="form-group">
          <label className="form-label">Search</label>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ 
              position: 'absolute', 
              left: '0.75rem', 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: '#6b7280'
            }} />
            <input
              type="text"
              placeholder="Name or ID..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Last Visit</label>
          <select
            value={filters.visited}
            onChange={(e) => handleFilterChange('visited', e.target.value)}
            className="form-input"
          >
            <option value="">All Patients</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="this_month">This Month</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Consultation Type</label>
          <select
            value={filters.consultationType}
            onChange={(e) => handleFilterChange('consultationType', e.target.value)}
            className="form-input"
          >
            <option value="">All Types</option>
            <option value="general">General Checkup</option>
            <option value="follow_up">Follow-up</option>
            <option value="emergency">Emergency</option>
            <option value="consultation">Consultation</option>
            <option value="routine">Routine Visit</option>
          </select>
        </div>
      </div>

      <button onClick={clearFilters} className="btn btn-secondary">
        Clear Filters
      </button>
    </div>
  )

  const renderPatientsList = () => (
    <div className="card">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <h3 style={{ color: '#1e293b' }}>
          Patients ({filteredPatients.length})
        </h3>
      </div>

      {filteredPatients.length > 0 ? (
        <div className="grid grid-2" style={{ gap: '1rem' }}>
          {filteredPatients.map((patient) => (
            <div 
              key={patient.id}
              style={{ 
                padding: '1.5rem', 
                border: '1px solid #e5e7eb', 
                borderRadius: '0.75rem',
                backgroundColor: '#fafafa',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onClick={() => openPatientModal(patient)}
              onMouseEnter={(e) => {
                e.target.style.borderColor = '#3b82f6'
                e.target.style.backgroundColor = '#f8fafc'
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = '#e5e7eb'
                e.target.style.backgroundColor = '#fafafa'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundColor: '#3b82f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '1.2rem'
                }}>
                  {patient.user?.first_name?.charAt(0)}{patient.user?.last_name?.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ color: '#1e293b', marginBottom: '0.25rem' }}>
                    {patient.user?.first_name} {patient.user?.last_name}
                  </h4>
                  <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                    ID: {patient.user?.custom_id}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <User size={14} style={{ color: '#64748b' }} />
                  <span style={{ color: '#64748b', fontSize: '0.9rem' }}>
                    Age: {patient.user?.age || 'N/A'} • {patient.user?.gender || 'N/A'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={14} style={{ color: '#64748b' }} />
                  <span style={{ color: '#64748b', fontSize: '0.9rem' }}>
                    Last visit: {patient.last_visit_date ? 
                      new Date(patient.last_visit_date).toLocaleDateString() : 
                      'No visits'
                    }
                  </span>
                </div>

                {patient.total_appointments && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileText size={14} style={{ color: '#64748b' }} />
                    <span style={{ color: '#64748b', fontSize: '0.9rem' }}>
                      {patient.total_appointments} appointments
                    </span>
                  </div>
                )}
              </div>

              <div style={{ 
                marginTop: '1rem', 
                paddingTop: '1rem', 
                borderTop: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'flex-end'
              }}>
                <Eye size={16} style={{ color: '#3b82f6' }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: '#64748b', textAlign: 'center', padding: '3rem' }}>
          No patients found matching your filters.
        </p>
      )}
    </div>
  )

  const renderPatientModal = () => {
    if (!showPatientModal || !selectedPatient) return null

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
        zIndex: 1000,
        padding: '1rem'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          padding: '2rem',
          maxWidth: '800px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <h2 style={{ color: '#1e293b' }}>
              {selectedPatient.user?.first_name} {selectedPatient.user?.last_name}
            </h2>
            <button 
              onClick={closePatientModal}
              style={{ 
                background: 'none', 
                border: 'none', 
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#64748b'
              }}
            >
              ×
            </button>
          </div>

          {patientDetails ? (
            <div>
              {/* Patient Basic Info */}
              <div className="card mb-4">
                <h4 style={{ marginBottom: '1rem', color: '#1e293b' }}>Patient Information</h4>
                <div className="grid grid-2" style={{ gap: '1rem' }}>
                  <div>
                    <p><strong>ID:</strong> {patientDetails.user?.custom_id}</p>
                    <p><strong>Age:</strong> {patientDetails.user?.age}</p>
                    <p><strong>Gender:</strong> {patientDetails.user?.gender}</p>
                  </div>
                  <div>
                    <p><strong>Email:</strong> {patientDetails.user?.email}</p>
                    <p><strong>Phone:</strong> {patientDetails.user?.phone_number}</p>
                    <p><strong>Emergency Contact:</strong> {patientDetails.emergency_contact_name}</p>
                  </div>
                </div>
                {patientDetails.allergies && (
                  <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#fef3c7', borderRadius: '0.5rem' }}>
                    <strong style={{ color: '#92400e' }}>Allergies:</strong>
                    <p style={{ color: '#92400e', marginTop: '0.5rem' }}>{patientDetails.allergies}</p>
                  </div>
                )}
              </div>

              {/* AI Summary */}
              {patientSummary && (
                <div className="card mb-4">
                  <h4 style={{ marginBottom: '1rem', color: '#1e293b' }}>AI Medical Summary</h4>
                  <div 
                    style={{ 
                      color: '#374151', 
                      lineHeight: '1.6',
                      whiteSpace: 'pre-wrap'
                    }}
                    dangerouslySetInnerHTML={{ __html: patientSummary.replace(/\n/g, '<br>') }}
                  />
                </div>
              )}

              {/* Recent Appointments */}
              {patientDetails.appointments && patientDetails.appointments.length > 0 && (
                <div className="card mb-4">
                  <h4 style={{ marginBottom: '1rem', color: '#1e293b' }}>Recent Appointments</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {patientDetails.appointments.slice(0, 5).map((appointment) => (
                      <div 
                        key={appointment.id}
                        style={{ 
                          padding: '0.75rem', 
                          backgroundColor: '#f8fafc', 
                          borderRadius: '0.5rem',
                          display: 'flex',
                          justifyContent: 'space-between'
                        }}
                      >
                        <span>{new Date(appointment.appointment_datetime).toLocaleDateString()}</span>
                        <span style={{ 
                          color: appointment.status === 'completed' ? '#10b981' : '#3b82f6' 
                        }}>
                          {appointment.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Prescriptions */}
              {patientDetails.prescriptions && patientDetails.prescriptions.length > 0 && (
                <div className="card">
                  <h4 style={{ marginBottom: '1rem', color: '#1e293b' }}>Recent Prescriptions</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {patientDetails.prescriptions.slice(0, 5).map((prescription) => (
                      <div 
                        key={prescription.id}
                        style={{ 
                          padding: '1rem', 
                          backgroundColor: '#f8fafc', 
                          borderRadius: '0.5rem'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <strong>{prescription.medication?.name}</strong>
                          <span style={{ color: '#64748b', fontSize: '0.9rem' }}>
                            {new Date(prescription.appointment?.appointment_datetime).toLocaleDateString()}
                          </span>
                        </div>
                        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                          {prescription.dosage} • {prescription.frequency} • {prescription.duration}
                        </p>
                        {prescription.notes && (
                          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                            Notes: {prescription.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              Loading patient details...
            </div>
          )}
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
        <div>Loading patients...</div>
      </div>
    )
  }

  return (
    <div>
      {renderFilters()}
      {renderPatientsList()}
      {renderPatientModal()}
    </div>
  )
}

export default DoctorPatients