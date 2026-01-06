import React, { useState, useEffect, useCallback } from 'react' // Import useCallback
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import { Users, Phone, Mail, Briefcase, Plus, X, Search, AlertCircle } from 'lucide-react'

// --- Reusable Fetch Function ---
// We move fetchStaff outside so we can call it from useEffect AND handleAddStaff
const fetchStaff = async (searchTerm, token, logout) => {
  const params = new URLSearchParams()
  if (searchTerm) {
    params.append('search', searchTerm)
  }

  const response = await axios.get('/api/hospital/staff/', {
    headers: {
      'Authorization': `Bearer ${token}`
    },
    params: params
  })
  return response.data
}


const HospitalStaff = () => {
  const { theme } = useTheme()
  const { logout } = useAuth()

  // --- STATE FOR API DATA ---
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // --- STATE FOR MODALS AND FILTERS ---
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
  // --- STATE FOR 'ADD STAFF' MODAL ---
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  
  // Updated state to match API fields
  const [newStaff, setNewStaff] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobTitle: 'Nurse', // Matches 'job_title'
    password: ''
  })
  
  // --- DATA FETCHING (using useCallback) ---
  const loadStaff = useCallback((currentSearchTerm) => {
    setLoading(true)
    setError(null)
    const token = localStorage.getItem('accessToken')

    fetchStaff(currentSearchTerm, token, logout)
      .then(data => {
        setStaff(data)
      })
      .catch(err => {
        console.error('Error fetching staff:', err)
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          setError('Authentication failed. Please log in again.')
          logout()
        } else {
          setError('Failed to load staff data.')
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }, [logout]) // useCallback dependency

  
  // useEffect for initial load and search
  useEffect(() => {
    // Debounce the search
    const searchTimeout = setTimeout(() => {
      loadStaff(searchTerm)
    }, 500) // 500ms delay

    // Clear the timeout if the user types again
    return () => clearTimeout(searchTimeout)

  }, [searchTerm, loadStaff]) // Re-run effect if searchTerm or loadStaff changes

  
  // --- MODAL & FORM HANDLERS ---
  
  const handleAddStaff = async (e) => {
    e.preventDefault() // Prevent form from reloading page
    setIsSubmitting(true)
    setFormErrors({})

    // --- Payload for the API ---
    // Maps frontend state to backend field names
    const payload = {
      first_name: newStaff.firstName,
      last_name: newStaff.lastName,
      email: newStaff.email,
      contact_no: newStaff.phone,
      job_title: newStaff.jobTitle,
      gender: 'Male',
      password: newStaff.password
    }

    try {
      const token = localStorage.getItem('accessToken')
      await axios.post('/api/hospital/staff/add/', payload, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      // --- Success ---
      alert('Staff member added successfully!')
      setShowAddModal(false)
      setNewStaff({ // Reset form
        firstName: '', lastName: '', email: '', phone: '', jobTitle: 'Nurse', password: ''
      })
      loadStaff(searchTerm) // Refresh the staff list

    } catch (err) {
      // --- Error Handling ---
      console.error('Error adding staff:', err)
      if (err.response && err.response.data) {
        // Handle validation errors from Django
        const apiErrors = err.response.data
        const formattedErrors = {}
        
        // Map backend errors to frontend fields
        if (apiErrors.first_name) formattedErrors.firstName = apiErrors.first_name[0]
        if (apiErrors.last_name) formattedErrors.lastName = apiErrors.last_name[0]
        if (apiErrors.email) formattedErrors.email = apiErrors.email[0]
        if (apiErrors.contact_no) formattedErrors.phone = apiErrors.contact_no[0]
        if (apiErrors.job_title) formattedErrors.jobTitle = apiErrors.job_title[0]
        if (apiErrors.password) formattedErrors.password = apiErrors.password[0]
        
        // Handle non-field errors
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

  // Helper to close modal
  const handleCloseModal = () => {
    setShowAddModal(false)
    setFormErrors({})
    setNewStaff({ // Reset form
      firstName: '', lastName: '', email: '', phone: '', jobTitle: 'Nurse', password: ''
    })
  }

  // Delete staff handler
  const handleDeleteStaff = async (staffId) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) {
      return
    }

    try {
      const token = localStorage.getItem('accessToken')
      await axios.delete(`/api/hospital/staff/${staffId}/manage/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      alert('Staff member deleted successfully!')
      loadStaff(searchTerm)
    } catch (err) {
      console.error('Error deleting staff:', err)
      alert('Failed to delete staff member. ' + (err.response?.data?.detail || ''))
    }
  }

  // --- RENDER FUNCTIONS ---

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ color: theme.text, margin: '0 0 0.5rem 0', fontSize: '2rem' }}>Staff Directory</h1>
          <p style={{ color: theme.textSecondary, margin: 0 }}>Complete directory of hospital staff members</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {/* Search Bar */}
          <div style={{ position: 'relative', minWidth: '250px' }}>
            <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: theme.textSecondary }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or job title..."
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
            Add Staff
          </button>
        </div>
      </div>

      {/* Staff List Grid */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '2rem', color: theme.textSecondary }}>
          Loading staff...
        </div>
      )}
      
      {!loading && error && (
        <div className="card" style={{ backgroundColor: '#fee2e2', borderColor: '#ef4444' }}>
          <h3 style={{ color: '#991b1b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={20} />
            Error
          </h3>
          <p style={{ color: '#b91c1c' }}>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {staff.length > 0 ? staff.map(member => {
            // --- UPDATED to use API data structure ---
            const staffName = `${member.user.first_name || ''} ${member.user.last_name || ''}`.trim();
            const staffId = member.user.custom_id;
            const staffRole = member.job_title;
            const staffPhone = member.user.contact_no;
            const staffEmail = member.user.email;
            
            const mockStatus = 'Working';
            const mockStatusColor = '#10b81';

            return (
              <div key={member.user.custom_id} className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ color: theme.text, margin: '0 0 0.25rem 0' }}>{staffName}</h3>
                    <p style={{ color: theme.textSecondary, margin: 0, fontSize: '0.85rem' }}>ID: {staffId}</p>
                  </div>
                  <span style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: `${mockStatusColor}20`,
                    color: mockStatusColor,
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: '500'
                  }}>
                    {mockStatus} {/* This is mocked */}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Briefcase size={16} style={{ color: theme.textSecondary }} />
                    <span style={{ color: theme.textSecondary, fontSize: '0.9rem' }}>
                      {staffRole || 'N/A'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Phone size={16} style={{ color: theme.textSecondary }} />
                    <span style={{ color: theme.textSecondary, fontSize: '0.9rem' }}>
                      {staffPhone || 'No contact'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Mail size={16} style={{ color: theme.textSecondary }} />
                    <span style={{ color: theme.textSecondary, fontSize: '0.9rem' }}>
                      {staffEmail || 'No email'}
                    </span>
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteStaff(member.user.id)}
                  style={{
                    marginTop: '1rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: '#fee2e2',
                    color: '#dc2626',
                    border: '1px solid #fca5a5',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = '#fecaca'
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = '#fee2e2'
                  }}
                >
                  Delete Staff
                </button>
              </div>
            )
          }) : (
             <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
              <p style={{ color: theme.textSecondary, margin: 0, fontSize: '1rem' }}>
                No staff members found matching your search.
              </p>
            </div>
          )}
        </div>
      )}

      {/* --- UPDATED 'Add Staff' Modal --- */}
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
              <h2 style={{ color: theme.text, margin: 0 }}>Add New Staff Member</h2>
              <button
                onClick={handleCloseModal}
                disabled={isSubmitting}
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
            
            {/* Form now uses handleAddStaff on submit */}
            <form onSubmit={handleAddStaff}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                {/* Name Fields */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', color: theme.text, marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>
                      First Name
                    </label>
                    <input
                      type="text"
                      value={newStaff.firstName}
                      onChange={(e) => setNewStaff({ ...newStaff, firstName: e.target.value })}
                      placeholder="Enter first name"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: `1px solid ${formErrors.firstName ? '#ef4444' : (theme.border || '#e5e7eb')}`,
                        borderRadius: '8px',
                        fontSize: '1rem',
                        backgroundColor: theme.cardBackground,
                        color: theme.text
                      }}
                    />
                    {formErrors.firstName && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem' }}>{formErrors.firstName}</p>}
                  </div>
                  <div>
                    <label style={{ display: 'block', color: theme.text, marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={newStaff.lastName}
                      onChange={(e) => setNewStaff({ ...newStaff, lastName: e.target.value })}
                      placeholder="Enter last name"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: `1px solid ${formErrors.lastName ? '#ef4444' : (theme.border || '#e5e7eb')}`,
                        borderRadius: '8px',
                        fontSize: '1rem',
                        backgroundColor: theme.cardBackground,
                        color: theme.text
                      }}
                    />
                    {formErrors.lastName && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem' }}>{formErrors.lastName}</p>}
                  </div>
                </div>

                {/* Job Title Field */}
                <div>
                  <label style={{ display: 'block', color: theme.text, marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>
                    Job Title
                  </label>
                  <select
                    value={newStaff.jobTitle}
                    onChange={(e) => setNewStaff({ ...newStaff, jobTitle: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: `1px solid ${formErrors.jobTitle ? '#ef4444' : (theme.border || '#e5e7eb')}`,
                      borderRadius: '8px',
                      fontSize: '1rem',
                      backgroundColor: theme.cardBackground,
                      color: theme.text
                    }}
                  >
                    <option value="Nurse">Nurse</option>
                    <option value="Technician">Technician</option>
                    <option value="Administrator">Administrator</option>
                    <option value="Support">Support</option>
                    <option value="Security">Security</option>
                    <option value="Other">Other</option>
                  </select>
                  {formErrors.jobTitle && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem' }}>{formErrors.jobTitle}</p>}
                </div>

                {/* Email Field */}
                <div>
                  <label style={{ display: 'block', color: theme.text, marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                    placeholder="Enter email address"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: `1px solid ${formErrors.email ? '#ef4444' : (theme.border || '#e5e7eb')}`,
                      borderRadius: '8px',
                      fontSize: '1rem',
                      backgroundColor: theme.cardBackground,
                      color: theme.text
                    }}
                  />
                  {formErrors.email && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem' }}>{formErrors.email}</p>}
                </div>

                {/* Phone Field */}
                <div>
                  <label style={{ display: 'block', color: theme.text, marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={newStaff.phone}
                    onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                    placeholder="Enter phone number"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: `1px solid ${formErrors.phone ? '#ef4444' : (theme.border || '#e5e7eb')}`,
                      borderRadius: '8px',
                      fontSize: '1rem',
                      backgroundColor: theme.cardBackground,
                      color: theme.text
                    }}
                  />
                  {formErrors.phone && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem' }}>{formErrors.phone}</p>}
                </div>

                {/* Password Field */}
                <div>
                  <label style={{ display: 'block', color: theme.text, marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>
                    Password
                  </label>
                  <input
                    type="password"
                    value={newStaff.password}
                    onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                    placeholder="Enter temporary password"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: `1px solid ${formErrors.password ? '#ef4444' : (theme.border || '#e5e7eb')}`,
                      borderRadius: '8px',
                      fontSize: '1rem',
                      backgroundColor: theme.cardBackground,
                      color: theme.text
                    }}
                  />
                  {formErrors.password && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem' }}>{formErrors.password}</p>}
                </div>
                
                {/* General Error Message */}
                {formErrors.general && (
                  <div style={{ color: '#ef4444', fontSize: '0.9rem', textAlign: 'center', backgroundColor: '#fee2e2', padding: '0.75rem', borderRadius: '8px' }}>
                    {formErrors.general}
                  </div>
                )}

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button
                    type="button" // Important: type="button" to prevent form submit
                    onClick={handleCloseModal}
                    disabled={isSubmitting}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      backgroundColor: theme.cardBackground,
                      color: theme.text,
                      border: `1px solid ${theme.border || '#e5e7eb'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      opacity: isSubmitting ? 0.7 : 1
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit" // This is the submit button
                    disabled={isSubmitting}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      fontWeight: '500',
                      opacity: isSubmitting ? 0.7 : 1
                    }}
                  >
                    {isSubmitting ? 'Adding...' : 'Add Staff'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default HospitalStaff