import React, { useState, useEffect } from 'react'
import { Pill, Plus, Search, Filter, Calendar, User, FileText } from 'lucide-react'
import axios from 'axios' // 1. IMPORT AXIOS

const DoctorPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([])
  const [filteredPrescriptions, setFilteredPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)
  // 2. RENAMED searchTerm to filterMedication for clarity
  const [filterMedication, setFilterMedication] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [filterPatient, setFilterPatient] = useState('')

  useEffect(() => {
    fetchPrescriptions()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [filterMedication, filterDate, filterPatient, prescriptions])

  // 3. UPDATED to fetch from the backend
  const fetchPrescriptions = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('accessToken');
      //
      const response = await axios.get('/api/doctor/prescriptions/', {
         headers: { 'Authorization': `Bearer ${token}` }
      });
      setPrescriptions(response.data);
      setFilteredPrescriptions(response.data); // Set initial filtered list
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      setPrescriptions([]);
      setFilteredPrescriptions([]);
    } finally {
      setLoading(false)
    }
  }

  // 4. UPDATED to use backend data structure
  const applyFilters = () => {
    let filtered = [...prescriptions]

    // Medication filter (renamed from searchTerm)
    if (filterMedication) {
      const term = filterMedication.toLowerCase()
      filtered = filtered.filter(prescription => 
        prescription.medication?.name?.toLowerCase().includes(term)
      )
    }

    // Date filter
    if (filterDate) {
      filtered = filtered.filter(prescription => 
        //
        prescription.prescription_date === filterDate
      )
    }

    // Patient filter
    if (filterPatient) {
      const patientTerm = filterPatient.toLowerCase()
      filtered = filtered.filter(prescription => {
        //
        const fullName = `${prescription.patient?.user?.first_name || ''} ${prescription.patient?.user?.last_name || ''}`.toLowerCase()
        return fullName.includes(patientTerm)
      })
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
        
        {/* 5. UPDATED filter grid to have 3 columns */}
        <div className="grid grid-3" style={{ gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Medication Name</label>
            <input
              type="text"
              placeholder="Search by medication..."
              value={filterMedication}
              onChange={(e) => setFilterMedication(e.target.value)}
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

          <div className="form-group">
            <label className="form-label">Date</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="form-input"
            />
          </div>
        </div>

        <button 
          onClick={() => {
            setFilterMedication('')
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
          {/* We will add the "Create" functionality in a later step */}
          <button className="btn btn-primary" disabled={true}>
            <Plus size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
            Create Prescription (Soon)
          </button>
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
                        {/* 6. UPDATED data path */}
                        <h4 style={{ color: '#1e293b', marginBottom: '0.25rem' }}>
                          {prescription.medication?.name || 'Unknown Medication'}
                        </h4>
                        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                          Patient: {prescription.patient?.user?.first_name} {prescription.patient?.user?.last_name}
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
                      {/* 7. UPDATED data path */}
                      {new Date(prescription.prescription_date).toLocaleDateString()}
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
                      {/* 8. UPDATED data path */}
                      ID: {prescription.patient?.user?.custom_id}
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
                    {/* 9. All these fields are correct */}
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

                  {/* 10. REMOVED start_date, end_date, and status as they aren't in the serializer */}
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

                {/* 11. REMOVED instructions as it's not in the serializer */}

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
              Prescriptions you write will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default DoctorPrescriptions