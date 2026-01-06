import React, { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext' // Import useAuth
import axios from 'axios' // Import axios
import { Briefcase, MapPin, Users, X, Plus, Search, Phone, Mail } from 'lucide-react'

const HospitalDoctors = () => {
  const { theme } = useTheme()
  const { logout } = useAuth() // Get logout function

  // --- STATE FOR API DATA ---
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // --- STATE FOR MODALS AND FILTERS ---
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const [newDoctor, setNewDoctor] = useState({
    name: '',
    specialty: '',
    phone: '',
    email: ''
  })

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchDoctors = async () => {
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
        const response = await axios.get('/api/hospital/doctors/', {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          params: params
        })
        
        // Handle both paginated and non-paginated responses
        const data = response.data
        const doctorList = Array.isArray(data) ? data : (data.results || data || [])
        setDoctors(doctorList) // Save the doctor list

      } catch (err) {
        console.error('Error fetching doctors:', err)
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          setError('Authentication failed. Please log in again.')
          logout() // Logout on auth error
        } else {
          setError('Failed to load doctor data.')
        }
      } finally {
        setLoading(false)
      }
    }

    // Debounce the search
    const searchTimeout = setTimeout(() => {
      fetchDoctors()
    }, 500) // 500ms delay

    // Clear the timeout if the user types again
    return () => clearTimeout(searchTimeout)

  }, [searchTerm, logout]) // Re-run effect if searchTerm or logout changes

  
  // --- MODAL & FORM HANDLERS ---
  
  const handleAddDoctor = async () => {
    if (!newDoctor.name || !newDoctor.specialty || !newDoctor.email) {
      alert('Please fill in all required fields')
      return
    }

    try {
      const token = localStorage.getItem('accessToken')
      
      // TODO: Implement doctor creation API endpoint
      console.log('Add doctor:', newDoctor)
      
      // Reset form
      setNewDoctor({ name: '', specialty: '', phone: '', email: '' })
      setShowAddModal(false)
    } catch (err) {
      console.error('Error adding doctor:', err)
      alert('Failed to add doctor')
    }
  }
  
  // Mock data for modal (will be replaced later)
  const doctorDetails = {
    patients: [
      { name: 'John Doe', id: 'P001', lastVisit: '2025-11-01' },
      { name: 'Jane Smith', id: 'P002', lastVisit: '2025-10-28' },
    ],
    appointments: [
      { id: 'A001', patient: 'John Doe', time: '10:00 AM', date: '2025-11-10' },
      { id: 'A002', patient: 'Robert Brown', time: '11:00 AM', date: '2025-11-10' },
    ]
  }

  // --- RENDER FUNCTIONS ---

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ color: theme.text, margin: '0 0 0.5rem 0', fontSize: '2rem' }}>Doctors</h1>
          <p style={{ color: theme.textSecondary, margin: 0 }}>Manage doctors and view their profiles.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          
          {/* Search Bar */}
          <div style={{ position: 'relative', minWidth: '250px' }}>
            <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: theme.textSecondary }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or specialty..."
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
            Add Doctor
          </button>
        </div>
      </div>

      {/* Doctor List Grid */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '2rem', color: theme.textSecondary }}>
          Loading doctors...
        </div>
      )}
      
      {!loading && error && (
        <div className="card" style={{ backgroundColor: '#fee2e2', borderColor: '#ef4444' }}>
          <h3 style={{ color: '#991b1b' }}>Error</h3>
          <p style={{ color: '#b91c1c' }}>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {doctors.length > 0 ? doctors.map(doctor => {
            // --- UPDATED to use API data structure ---
            // API provides: { user: { first_name, last_name, email, contact_no }, specialization, ... }
            const doctorName = `${doctor.user.first_name || ''} ${doctor.user.last_name || ''}`.trim();
            const doctorEmail = doctor.user.email;
            const doctorPhone = doctor.user.contact_no;
            const doctorSpecialty = doctor.specialization;
            
            // Mock data for fields not in the list serializer
            const mockLocation = 'On Duty';
            const mockPatients = 24; // This will come from an aggregation later

            return (
              <div 
                key={doctor.user.custom_id} // Use a unique key
                className="card" 
                style={{ padding: '1.5rem', cursor: 'pointer', transition: 'transform 0.2s' }}
                onClick={() => setSelectedDoctor(doctor)} // Pass the full doctor object
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                  {/* Mock profile picture */}
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    backgroundColor: theme.background || '#e2e8f0',
                    margin: '0 auto 1rem auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: theme.textSecondary,
                    fontSize: '2rem',
                    fontWeight: 'bold'
                  }}>
                    {doctorName.charAt(0)}
                  </div>
                  <h3 style={{ color: theme.text, margin: '0 0 0.25rem 0' }}>{doctorName || 'N/A'}</h3>
                  <p style={{ color: theme.textSecondary, margin: 0, fontSize: '0.9rem' }}>{doctorSpecialty || 'N/A'}</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Phone size={16} style={{ color: theme.textSecondary }} />
                    <span style={{ color: theme.textSecondary, fontSize: '0.9rem' }}>
                      {doctorPhone || 'No contact'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Mail size={16} style={{ color: theme.textSecondary }} />
                    <span style={{ color: theme.textSecondary, fontSize: '0.9rem' }}>
                      {doctorEmail || 'No email'}
                    </span>
                  </div>
                  {/* Mocked fields */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={16} style={{ color: theme.textSecondary }} />
                    <span style={{ color: theme.textSecondary, fontSize: '0.9rem' }}>
                      {mockLocation}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={16} style={{ color: theme.textSecondary }} />
                    <span style={{ color: theme.textSecondary, fontSize: '0.9rem' }}>
                      {mockPatients} Patients
                    </span>
                  </div>
                </div>
              </div>
            )
          }) : (
            <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
              <p style={{ color: theme.textSecondary, margin: 0, fontSize: '1rem' }}>
                No doctors found matching your search.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Doctor Details Modal (Still mock) */}
      {selectedDoctor && (
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
                <h2 style={{ color: theme.text, margin: '0 0 0.5rem 0' }}>{selectedDoctor.user.first_name} {selectedDoctor.user.last_name}</h2>
                <p style={{ color: theme.textSecondary, margin: 0 }}>{selectedDoctor.specialization}</p>
              </div>
              <button
                onClick={() => setSelectedDoctor(null)}
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

            {/* Doctor Info */}
            <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: theme.background || '#f8fafc', borderRadius: '8px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <p style={{ color: theme.textSecondary, margin: '0 0 0.25rem 0', fontSize: '0.85rem' }}>Email</p>
                  <p style={{ color: theme.text, margin: 0, fontWeight: '500' }}>{selectedDoctor.user.email}</p>
                </div>
                <div>
                  <p style={{ color: theme.textSecondary, margin: '0 0 0.25rem 0', fontSize: '0.85rem' }}>Phone</p>
                  <p style={{ color: theme.text, margin: 0, fontWeight: '500' }}>{selectedDoctor.user.contact_no}</p>
                </div>
                <div>
                  <p style={{ color: theme.textSecondary, margin: '0 0 0.25rem 0', fontSize: '0.85rem' }}>Qualifications</p>
                  <p style={{ color: theme.text, margin: 0, fontWeight: '500' }}>{selectedDoctor.qualifications}</p>
                </div>
              </div>
            </div>

            {/* Patient List (Mock) */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: theme.text, margin: '0 0 1rem 0' }}>Assigned Patients</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {doctorDetails.patients.map((patient, index) => (
                  <div key={index} style={{
                    padding: '1rem',
                    border: `1px solid ${theme.border || '#e5e7eb'}`,
                    borderRadius: '8px',
                    backgroundColor: theme.background || '#fafafa',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <span style={{ color: theme.text, fontWeight: '500' }}>{patient.name}</span>
                      <span style={{ color: theme.textSecondary, fontSize: '0.85rem', marginLeft: '0.5rem' }}>({patient.id})</span>
                    </div>
                    <span style={{ color: theme.textSecondary, fontSize: '0.85rem' }}>Last Visit: {patient.lastVisit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Appointments (Mock) */}
            <div>
              <h3 style={{ color: theme.text, margin: '0 0 1rem 0' }}>Upcoming Appointments</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {doctorDetails.appointments.map((apt, index) => (
                  <div key={index} style={{
                    padding: '1rem',
                    border: `1px solid ${theme.border || '#e5e7eb'}`,
                    borderRadius: '8px',
                    backgroundColor: theme.background || '#fafafa'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ color: theme.text, fontWeight: '500' }}>{apt.patient}</span>
                      <span style={{ color: theme.textSecondary, fontSize: '0.85rem' }}>{apt.date} at {apt.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Doctor Modal (Mock) */}
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
              <h2 style={{ color: theme.text, margin: 0 }}>Add New Doctor</h2>
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
                  Doctor Name *
                </label>
                <input
                  type="text"
                  value={newDoctor.name}
                  onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
                  placeholder="Enter doctor name"
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
                  Specialty *
                </label>
                <input
                  type="text"
                  value={newDoctor.specialty}
                  onChange={(e) => setNewDoctor({ ...newDoctor, specialty: e.target.value })}
                  placeholder="e.g., Cardiology"
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
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={newDoctor.phone}
                  onChange={(e) => setNewDoctor({ ...newDoctor, phone: e.target.value })}
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
                  Email *
                </label>
                <input
                  type="email"
                  value={newDoctor.email}
                  onChange={(e) => setNewDoctor({ ...newDoctor, email: e.target.value })}
                  placeholder="Enter email address"
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

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setAddError(null)
                  }}
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
                  onClick={handleAddDoctor}
                  disabled={addingDoctor}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: addingDoctor ? '#9ca3af' : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: addingDoctor ? 'not-allowed' : 'pointer',
                    fontSize: '1rem',
                    fontWeight: '500'
                  }}
                >
                  {addingDoctor ? 'Adding...' : 'Add Doctor'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HospitalDoctors