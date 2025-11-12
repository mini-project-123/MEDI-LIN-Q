import React, { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext' // Import useAuth
import axios from 'axios' // Import axios
import { Users, Calendar, Stethoscope, X, Plus, Filter, FileText, Activity, Search, Phone } from 'lucide-react'
import PatientReportsModal from './PatientReportsModal'

const HospitalPatients = () => {
  const { theme } = useTheme()
  const { logout } = useAuth() // Get logout function for auth errors
  
  // --- STATE FOR API DATA ---
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // --- STATE FOR MODALS AND FILTERS ---
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showReportsModal, setShowReportsModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
  // (Note: The filter dropdown from the mock file has been removed for now,
  // as the backend API supports search but not status filtering on this endpoint)
  
  const [newPatient, setNewPatient] = useState({
    name: '',
    age: '',
    gender: 'Male',
    phone: '',
    diagnosis: ''
  })

  // --- DATA FETCHING ---
  useEffect(() => {
    // This function will be called when the component loads
    // and whenever the searchTerm changes.
    const fetchPatients = async () => {
      setLoading(true)
      setError(null)
      try {
        const token = localStorage.getItem('accessToken')
        
        // Prepare query parameters
        const params = new URLSearchParams()
        if (searchTerm) {
          params.append('search', searchTerm)
        }

        // Make the API call
        const response = await axios.get('/api/hospital/patients/', {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          params: params
        })
        
        setPatients(response.data) // Save the patient list

      } catch (err) {
        console.error('Error fetching patients:', err)
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          setError('Authentication failed. Please log in again.')
          logout() // Logout on auth error
        } else {
          setError('Failed to load patient data.')
        }
      } finally {
        setLoading(false)
      }
    }

    // We'll use a timeout to avoid searching on every single keystroke
    const searchTimeout = setTimeout(() => {
      fetchPatients()
    }, 500) // 500ms debounce

    // Clear the timeout if the user types again quickly
    return () => clearTimeout(searchTimeout)
    
  }, [searchTerm, logout]) // Re-run effect if searchTerm or logout function changes

  
  // --- MODAL & FORM HANDLERS (Mocked for now) ---
  
  const handleAddPatient = () => {
    // We will wire this up in a future step
    alert(`(Mock) Patient ${newPatient.name} added successfully!`)
    setShowAddModal(false)
    setNewPatient({ name: '', age: '', gender: 'Male', phone: '', diagnosis: '' })
  }

  // This mock data will be replaced when we build the patient detail modal
  const patientHistory = {
    appointments: [
      { date: '2025-11-01', doctor: 'Dr. Sarah Johnson', type: 'Consultation', notes: 'Initial checkup' },
      { date: '2025-10-15', doctor: 'Dr. Sarah Johnson', type: 'Follow-up', notes: 'Blood pressure monitoring' },
    ],
    reports: [
      { date: '2025-11-01', type: 'Blood Test', result: 'Normal', doctor: 'Dr. Sarah Johnson' },
    ]
  }
  
  // --- RENDER FUNCTIONS ---

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ color: theme.text, margin: '0 0 0.5rem 0', fontSize: '2rem' }}>Patients</h1>
          <p style={{ color: theme.textSecondary, margin: 0 }}>Complete list of patients and their visit history</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          
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

      {/* Patient List Grid */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '2rem', color: theme.textSecondary }}>
          Loading patients...
        </div>
      )}
      
      {!loading && error && (
        <div className="card" style={{ backgroundColor: '#fee2e2', borderColor: '#ef4444' }}>
          <h3 style={{ color: '#991b1b' }}>Error</h3>
          <p style={{ color: '#b91c1c' }}>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {patients.length > 0 ? patients.map(patient => {
            // --- UPDATED to use API data structure ---
            // The API provides: { user: { first_name, last_name, custom_id, gender, ... }, age: ... }
            const patientName = `${patient.user.first_name || ''} ${patient.user.last_name || ''}`.trim();
            const patientId = patient.user.custom_id;
            const patientAge = patient.age;
            const patientGender = patient.user.gender;
            const patientPhone = patient.user.contact_no;
            
            // Mock data for fields not in the list serializer
            const mockStatus = 'Stable';
            const mockStatusColor = '#10b981'; 

            return (
              <div 
                key={patient.user.custom_id} // Use a unique key
                className="card" 
                style={{ padding: '1.5rem', cursor: 'pointer', transition: 'transform 0.2s' }}
                onClick={() => setSelectedPatient(patient)} // Pass the full patient object
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ color: theme.text, margin: '0 0 0.25rem 0' }}>{patientName || 'N/A'}</h3>
                    <p style={{ color: theme.textSecondary, margin: 0, fontSize: '0.85rem' }}>ID: {patientId}</p>
                  </div>
                  <span style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: `${mockStatusColor}20`,
                    color: mockStatusColor,
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: '500'
                  }}>
                    {mockStatus}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={16} style={{ color: theme.textSecondary }} />
                    <span style={{ color: theme.textSecondary, fontSize: '0.9rem' }}>
                      {patientAge || 'N/A'}y • {patientGender || 'N/A'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Phone size={16} style={{ color: theme.textSecondary }} />
                    <span style={{ color: theme.textSecondary, fontSize: '0.9rem' }}>
                      {patientPhone || 'No contact'}
                    </span>
                  </div>
                  {/* These fields are not in the list view, but will be in the detail view */}
                  {/* <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Stethoscope size={16} style={{ color: theme.textSecondary }} />
                    <span style={{ color: theme.textSecondary, fontSize: '0.9rem' }}>
                      {patient.doctor}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={16} style={{ color: theme.textSecondary }} />
                    <span style={{ color: theme.textSecondary, fontSize: '0.9rem' }}>
                      {patient.nextVisit}
                    </span>
                  </div> */}
                </div>

                {/* View Reports Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation() // Prevent triggering the card click
                    setSelectedPatient(patient)
                    setShowReportsModal(true)
                  }}
                  style={{
                    width: '100%',
                    marginTop: '1rem',
                    padding: '0.75rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#2563eb'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#3b82f6'
                  }}
                >
                  <FileText size={16} />
                  View Reports
                </button>
              </div>
            )
          }) : (
            <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
              <p style={{ color: theme.textSecondary, margin: 0, fontSize: '1rem' }}>
                No patients found matching your search.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Patient Details Modal (Still mock) */}
      {selectedPatient && (
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
          <div className="card" style={{
            width: '100%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflow: 'auto',
            padding: '2rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '2rem' }}>
              <div>
                <h2 style={{ color: theme.text, margin: '0 0 0.5rem 0' }}>{selectedPatient.user.first_name} {selectedPatient.user.last_name}</h2>
                <p style={{ color: theme.textSecondary, margin: 0 }}>Patient ID: {selectedPatient.user.custom_id}</p>
              </div>
              <button
                onClick={() => setSelectedPatient(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: theme.textSecondary
                }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Patient Info */}
            <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: theme.background || '#f8fafc', borderRadius: '8px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <p style={{ color: theme.textSecondary, margin: '0 0 0.25rem 0', fontSize: '0.85rem' }}>Age & Gender</p>
                  <p style={{ color: theme.text, margin: 0, fontWeight: '500' }}>{selectedPatient.age}y • {selectedPatient.user.gender}</p>
                </div>
                <div>
                  <p style={{ color: theme.textSecondary, margin: '0 0 0.25rem 0', fontSize: '0.85rem' }}>Status</p>
                  <p style={{ color: '#10b981', margin: 0, fontWeight: '500' }}>(Mock) Stable</p>
                </div>
                <div>
                  <p style={{ color: theme.textSecondary, margin: '0 0 0.25rem 0', fontSize: '0.85rem' }}>Assigned Doctor</p>
                  <p style={{ color: theme.text, margin: 0, fontWeight: '500' }}>(Mock) Dr. Sarah Johnson</p>
                </div>
              </div>
            </div>

            {/* Appointment History (Mock) */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: theme.text, margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={20} />
                Appointment History
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {patientHistory.appointments.map((apt, index) => (
                  <div key={index} style={{
                    padding: '1rem',
                    border: `1px solid ${theme.border || '#e5e7eb'}`,
                    borderRadius: '8px',
                    backgroundColor: theme.background || '#fafafa'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ color: theme.text, fontWeight: '500' }}>{apt.type}</span>
                      <span style={{ color: theme.textSecondary, fontSize: '0.85rem' }}>{apt.date}</span>
                    </div>
                    <p style={{ color: theme.textSecondary, margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>{apt.doctor}</p>
                    <p style={{ color: theme.text, margin: 0, fontSize: '0.9rem' }}>{apt.notes}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Reports (Mock) */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ color: theme.text, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={20} />
                  Medical Reports
                </h3>
                <button
                  onClick={() => setShowReportsModal(true)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#2563eb'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#3b82f6'
                  }}
                >
                  View All Reports
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {patientHistory.reports.map((report, index) => (
                  <div key={index} style={{
                    padding: '1rem',
                    border: `1px solid ${theme.border || '#e5e7eb'}`,
                    borderRadius: '8px',
                    backgroundColor: theme.background || '#fafafa'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ color: theme.text, fontWeight: '500' }}>{report.type}</span>
                      <span style={{ color: theme.textSecondary, fontSize: '0.85rem' }}>{report.date}</span>
                    </div>
                    <p style={{ color: theme.textSecondary, margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>{report.doctor}</p>
                    <p style={{ color: '#10b981', margin: 0, fontSize: '0.9rem', fontWeight: '500' }}>Result: {report.result}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Patient Modal (Mock) */}
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
          <div className="card" style={{
            width: '100%',
            maxWidth: '500px',
            padding: '2rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ color: theme.text, margin: 0 }}>Add New Patient</h2>
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: theme.textSecondary
                }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', color: theme.text, marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>
                  Patient Name
                </label>
                <input
                  type="text"
                  value={newPatient.name}
                  onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                  placeholder="Enter patient name"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `1px solid ${theme.border || '#e5e7eb'}`,
                    borderRadius: '8px',
                    fontSize: '1rem',
                    backgroundColor: theme.cardBackground,
                    color: theme.text
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', color: theme.text, marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>
                    Age
                  </label>
                  <input
                    type="number"
                    value={newPatient.age}
                    onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                    placeholder="Age"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: `1px solid ${theme.border || '#e5e7eb'}`,
                      borderRadius: '8px',
                      fontSize: '1rem',
                      backgroundColor: theme.cardBackground,
                      color: theme.text
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: theme.text, marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>
                    Gender
                  </label>
                  <select
                    value={newPatient.gender}
                    onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: `1px solid ${theme.border || '#e5e7eb'}`,
                      borderRadius: '8px',
                      fontSize: '1rem',
                      backgroundColor: theme.cardBackground,
                      color: theme.text
                    }}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: theme.text, marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={newPatient.phone}
                  onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                  placeholder="Enter phone number"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `1px solid ${theme.border || '#e5e7eb'}`,
                    borderRadius: '8px',
                    fontSize: '1rem',
                    backgroundColor: theme.cardBackground,
                    color: theme.text
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: theme.text, marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>
                  Initial Diagnosis
                </label>
                <textarea
                  value={newPatient.diagnosis}
                  onChange={(e) => setNewPatient({ ...newPatient, diagnosis: e.target.value })}
                  placeholder="Enter initial diagnosis"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `1px solid ${theme.border || '#e5e7eb'}`,
                    borderRadius: '8px',
                    fontSize: '1rem',
                    backgroundColor: theme.cardBackground,
                    color: theme.text,
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button
                  onClick={() => setShowAddModal(false)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: theme.cardBackground,
                    color: theme.text,
                    border: `1px solid ${theme.border || '#e5e7eb'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPatient}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '500'
                  }}
                >
                  Add Patient
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Patient Reports Modal */}
      <PatientReportsModal 
        isOpen={showReportsModal} 
        patient={selectedPatient}
        onClose={() => setShowReportsModal(false)}
      />
    </div>
  )
}

export default HospitalPatients