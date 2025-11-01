import React, { useState, useEffect } from 'react'
import { Pill, Plus, Search, Filter, Calendar, User, FileText } from 'lucide-react'
import axios from 'axios'

const DoctorPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([])
  const [filteredPrescriptions, setFilteredPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [filterPatient, setFilterPatient] = useState('')

  useEffect(() => {
    fetchPrescriptions()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [searchTerm, filterDate, filterPatient, prescriptions])

  const fetchPrescriptions = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/doctor/prescriptions/')
      setPrescriptions(response.data)
      setFilteredPrescriptions(response.data)
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
        prescription.patient_name?.toLowerCase().includes(term)
      )
    }

    // Date filter
    if (filterDate) {
      filtered = filtered.filter(prescription => 
        new Date(prescription.created_at).toDateString() === new Date(filterDate).toDateString()
      )
    }

    // Patient filter
    if (filterPatient) {
      filtered = filtered.filter(prescription => 
        prescription.patient_name?.toLowerCase().includes(filterPatient.toLowerCase())
      )
    }

    setFilteredPrescriptions(filtered)
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh' 
      }}>
        <div>Loading prescriptions...</div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#1e293b', margin: '0 0 0.5rem 0' }}>Prescriptions</h2>
        <p style={{ color: '#64748b', margin: 0 }}>Manage and track all patient prescriptions</p>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <h4 style={{ marginBottom: '1rem', color: '#1e293b' }}>
          <Filter size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
          Filter Prescriptions
        </h4>
        
        <div className="grid grid-3" style={{ gap: '1rem' }}>
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
                placeholder="Search by medication or patient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Date</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Patient</label>
            <input
              type="text"
              placeholder="Patient name..."
              value={filterPatient}
              onChange={(e) => setFilterPatient(e.target.value)}
              className="form-input"
            />
          </div>
        </div>

        <button 
          onClick={() => {
            setSearchTerm('')
            setFilterDate('')
            setFilterPatient('')
          }}
          className="btn btn-secondary"
        >
          Clear Filters
        </button>
      </div>

      {/* Prescriptions List */}
      <div className="card">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{ color: '#1e293b' }}>
            All Prescriptions ({filteredPrescriptions.length})
          </h3>
        </div>

        {filteredPrescriptions.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredPrescriptions.map((prescription) => (
              <div 
                key={prescription.id}
                style={{ 
                  padding: '1.5rem', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '0.75rem',
                  backgroundColor: '#fafafa'
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
                      <Pill size={24} style={{ color: '#3b82f6' }} />
                      <div>
                        <h4 style={{ color: '#1e293b', marginBottom: '0.25rem' }}>
                          {prescription.medication?.name || 'Unknown Medication'}
                        </h4>
                        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                          Patient: {prescription.patient_name}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                      {new Date(prescription.created_at).toLocaleDateString()}
                    </p>
                    <p style={{ color: '#3b82f6', fontSize: '0.9rem', fontWeight: '500' }}>
                      ID: {prescription.patient_id}
                    </p>
                  </div>
                </div>

                <div className="grid grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                      <strong>Dosage:</strong> {prescription.dosage}
                    </p>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                      <strong>Frequency:</strong> {prescription.frequency}
                    </p>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                      <strong>Duration:</strong> {prescription.duration}
                    </p>
                  </div>

                  <div>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                      <strong>Start Date:</strong> {new Date(prescription.start_date).toLocaleDateString()}
                    </p>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                      <strong>End Date:</strong> {new Date(prescription.end_date).toLocaleDateString()}
                    </p>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                      <strong>Status:</strong> 
                      <span style={{ 
                        marginLeft: '0.5rem',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.8rem',
                        backgroundColor: new Date(prescription.end_date) >= new Date() ? '#dcfce7' : '#fee2e2',
                        color: new Date(prescription.end_date) >= new Date() ? '#166534' : '#dc2626'
                      }}>
                        {new Date(prescription.end_date) >= new Date() ? 'Active' : 'Expired'}
                      </span>
                    </p>
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
                    Edit Prescription
                  </button>
                  <button className="btn btn-secondary" style={{ fontSize: '0.9rem' }}>
                    Print
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <Pill size={48} style={{ color: '#d1d5db', margin: '0 auto 1rem' }} />
            <p style={{ color: '#64748b', fontSize: '1.1rem' }}>
              No prescriptions found
            </p>
            <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Prescriptions will appear here after patient consultations
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default DoctorPrescriptions