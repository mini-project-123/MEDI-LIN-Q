import React, { useState, useEffect } from 'react'
import { Pill, Plus, Search, Filter, Calendar, User, FileText } from 'lucide-react'

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
    setLoading(true)
    // Mock prescription data
    const mockPrescriptions = [
      {
        id: 1,
        patient: { name: 'John Doe' },
        medication: { name: 'Amoxicillin' },
        dosage: '500mg',
        frequency: 'Twice daily',
        duration: '7 days',
        date: new Date().toISOString().split('T')[0],
        status: 'active'
      },
      {
        id: 2,
        patient: { name: 'Jane Smith' },
        medication: { name: 'Ibuprofen' },
        dosage: '400mg',
        frequency: 'Three times daily',
        duration: '5 days',
        date: new Date().toISOString().split('T')[0],
        status: 'active'
      }
    ]
    setTimeout(() => {
      setPrescriptions(mockPrescriptions)
      setFilteredPrescriptions(mockPrescriptions)
      setLoading(false)
    }, 500)
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
        
        <div className="grid grid-2" style={{ gap: '1rem' }}>
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
            <label className="form-label">Patient Name</label>
            <input
              type="text"
              placeholder="Search by patient name..."
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
                  padding: '1rem', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '0.5rem',
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

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ 
                      padding: '0.375rem 0.75rem',
                      backgroundColor: 'white',
                      borderRadius: '0.375rem',
                      border: '1px solid #e5e7eb',
                      fontSize: '0.75rem',
                      textAlign: 'center'
                    }}>
                      {new Date(prescription.created_at).toLocaleDateString()}
                    </div>
                    <div style={{ 
                      padding: '0.375rem 0.75rem',
                      backgroundColor: '#dbeafe',
                      color: '#1e40af',
                      borderRadius: '0.375rem',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      textAlign: 'center'
                    }}>
                      ID: {prescription.patient_id}
                    </div>
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
                    borderRadius: '0.375rem',
                    fontSize: '0.8rem',
                    fontWeight: '500',
                    backgroundColor: new Date(prescription.end_date) >= new Date() ? '#dcfce7' : '#fee2e2',
                    color: new Date(prescription.end_date) >= new Date() ? '#166534' : '#dc2626'
                  }}>
                    {new Date(prescription.end_date) >= new Date() ? 'Active' : 'Expired'}
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