import React, { useState, useEffect } from 'react'
import { Search, Filter, User, Calendar, Phone, Mail, Eye, FileText } from 'lucide-react'
import axios from 'axios' // 1. IMPORT AXIOS

const DoctorPatients = () => {
  const [patients, setPatients] = useState([])
  // 2. RENAMED to reflect it's from the API
  const [filteredPatients, setFilteredPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [patientDetails, setPatientDetails] = useState(null)
  const [patientSummary, setPatientSummary] = useState('')
  const [showPatientModal, setShowPatientModal] = useState(false)
  const [filters, setFilters] = useState({
    search: '',
    visited: '', // 'today', 'yesterday', 'this_month'
    consultationType: '' // Note: Your backend doesn't filter by this, but we'll leave the UI
  })

  // 3. This useEffect now fetches when filters change
  useEffect(() => {
    fetchPatients()
  }, [filters]) // Re-fetch when filters change

  // 4. fetchPatients is now connected to the backend
  const fetchPatients = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('accessToken')
      
      // Prepare query params
      const params = new URLSearchParams()
      if (filters.search) {
        params.append('search', filters.search)
      }
      if (filters.visited) {
        params.append('visited', filters.visited)
      }
      
      //
      const response = await axios.get('/api/doctor/patients/', {
        headers: { 'Authorization': `Bearer ${token}` },
        params: params
      })
      
      setPatients(response.data)
      setFilteredPatients(response.data) // Set both for consistency
    } catch (error) {
      console.error('Error fetching patients:', error)
      setPatients([]) // Clear list on error
      setFilteredPatients([])
    } finally {
      setLoading(false)
    }
  }

  // 5. This new function fetches full details for the modal
  //
  const fetchPatientDetails = async (patientId) => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await axios.get(`/api/doctor/patients/${patientId}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setPatientDetails(response.data)
    } catch (error) {
      console.error('Error fetching patient details:', error)
      setPatientDetails(null) // Reset on error
    }
  }

  // 6. This new function fetches the AI summary for the modal
  //
  const fetchPatientSummary = async (patientId) => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await axios.get(`/api/patients/${patientId}/summary/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setPatientSummary(response.data.summary)
    } catch (error) {
      console.error('Error fetching patient summary:', error)
      setPatientSummary('Error: Could not load AI summary.')
    }
  }

  // 7. applyFilters is no longer needed (removed)

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

  // 8. openPatientModal is now async and calls the new fetch functions
  const openPatientModal = async (patient) => {
    setSelectedPatient(patient) // Set the basic patient data (from list) immediately
    setShowPatientModal(true)
    setPatientDetails(null) // Clear old details
    setPatientSummary('')   // Clear old summary
    
    // Get the patient's User ID from the nested structure
    const patientId = patient.user.id; 
    
    // Fetch detailed patient information and summary in parallel
    await Promise.all([
      fetchPatientDetails(patientId),
      fetchPatientSummary(patientId)
    ])
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
              // 9. Use handleFilterChange to update state, which triggers fetch
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
            // 10. This filter is not in the backend view, so we'll disable it for now
            disabled={true} 
          >
            <option value="">All Types (Not Implemented)</option>
            <option value="general">General Checkup</option>
            <option value="follow_up">Follow-up</option>
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
              key={patient.user.id} // Use patient.user.id as the key
              style={{ 
                padding: '1.5rem', 
                border: '1px solid #e5e7eb', 
                borderRadius: '0.75rem',
                backgroundColor: '#fafafa',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onClick={() => openPatientModal(patient)} // Pass the whole patient object
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

              {/* 11. Removed Age, Gender, Last Visit, and Appointments count
                   from this list view, as they don't come from the
                   PatientListSerializer. They WILL appear in the modal. */}

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

          {/* 12. Use patientDetails (from API) not selectedPatient (from list) */}
          {patientDetails ? (
            <div>
              {/* Patient Basic Info */}
              <div className="card mb-4">
                <h4 style={{ marginBottom: '1rem', color: '#1e293b' }}>Patient Information</h4>
                <div className="grid grid-2" style={{ gap: '1rem' }}>
                  <div>
                    <p><strong>ID:</strong> {patientDetails.user?.custom_id}</p>
                    <p><strong>Age:</strong> {patientDetails.age}</p>
                    <p><strong>Gender:</strong> {patientDetails.user?.gender}</p>
                  </div>
                  <div>
                    <p><strong>Email:</strong> {patientDetails.user?.email}</p>
                    <p><strong>Phone:</strong> {patientDetails.user?.contact_no}</p>
                    <p><strong>Emergency Contact:</strong> {patientDetails.emergency_contact_relation}</p>
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
              {/* 13. Use patientSummary state, which is loading in parallel */}
              {patientSummary ? (
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
              ) : (
                <div className="card mb-4">
                  <h4 style={{ marginBottom: '1rem', color: '#1e293b' }}>AI Medical Summary</h4>
                  <p>Loading AI summary...</p>
                </div>
              )}


              {/* Recent Appointments */}
              {/* 14. Use patientDetails.appointments from the backend */}
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
              {/* 15. Use patientDetails.prescriptions from the backend */}
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
                            {new Date(prescription.prescription_date).toLocaleDateString()}
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

  if (loading && !showPatientModal) { // Don't show full page load if modal is just loading
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