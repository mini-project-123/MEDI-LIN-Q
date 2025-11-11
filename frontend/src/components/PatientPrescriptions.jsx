import React, { useState, useEffect } from 'react'
import { Pill, Calendar, User, FileText, Download, Search, AlertCircle, Loader2 } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import { patientAPI } from '../utils/api'

// --- Helper Function ---
const formatDate = (isoDate) => {
  if (!isoDate) return 'N/A';
  try {
    const date = new Date(isoDate);
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting date:', isoDate, error);
    return 'Invalid Date';
  }
};
// --- End Helper Function ---

const PatientPrescriptions = () => {
  const { theme } = useTheme()
  const { logout } = useAuth()
  
  // State for all prescriptions from API
  const [prescriptions, setPrescriptions] = useState([])
  
  // State for what's actually shown
  const [filteredPrescriptions, setFilteredPrescriptions] = useState([])
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  // --- 1. DATA FETCHING (MODIFIED) ---
  useEffect(() => {
    fetchPrescriptions()
  }, [])

  // --- 2. FILTERING (MODIFIED) ---
  useEffect(() => {
    applyFilters()
  }, [searchTerm, prescriptions]) // Re-run filter when search or base data changes

  const fetchPrescriptions = async () => {
    setLoading(true)
    setError(null)
    try {
      // Fetch from the single dashboard endpoint
      const response = await patientAPI.getDashboard()
      const allPrescriptions = response.data.prescriptions || []
      
      setPrescriptions(allPrescriptions)
      setFilteredPrescriptions(allPrescriptions)
      
    } catch (err) {
      console.error('Error fetching prescriptions:', err)
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        setError('Authentication failed. Please log in again.')
        logout()
      } else {
        setError('Failed to load prescriptions.')
      }
    } finally {
      setLoading(false)
    }
  }

  // --- 3. FILTER LOGIC (SIMPLIFIED) ---
  const applyFilters = () => {
    let filtered = [...prescriptions]

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(prescription => 
        (prescription.medication?.name?.toLowerCase() || '').includes(term) ||
        (prescription.doctor?.toLowerCase() || '').includes(term) // Use 'doctor' key
      )
    }

    setFilteredPrescriptions(filtered)
  }

  // --- 4. RENDER LOGIC ---

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        color: theme.textSecondary
      }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="card" style={{ backgroundColor: '#fee2e2', borderColor: '#ef4444' }}>
        <h3 style={{ color: '#991b1b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={20} />
          Error
        </h3>
        <p style={{ color: '#b91c1c' }}>{error}</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
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
        {/* "Add Prescription" button removed, as patients don't add their own */}
      </div>

      {/* Filters (Simplified) */}
      <div className="card mb-6" style={{ 
        backgroundColor: theme.cardBackground,
        borderColor: theme.border,
        padding: '1.5rem'
      }}>
        <div className="form-group">
          <label className="form-label" style={{ color: theme.text, fontWeight: '500' }}>
            Search Prescriptions
          </label>
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
      </div>

      {/* Prescriptions List */}
      <div className="card" style={{ 
        backgroundColor: theme.cardBackground,
        borderColor: theme.border,
        padding: '1.5rem'
      }}>
        <h3 style={{ color: theme.text, marginBottom: '1.5rem' }}>
          All Prescriptions ({filteredPrescriptions.length})
        </h3>

        {filteredPrescriptions.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredPrescriptions.map((prescription) => (
              <div 
                key={prescription.id}
                style={{ 
                  padding: '1rem 1.5rem', 
                  border: `1px solid ${theme.border || '#e5e7eb'}`, 
                  borderRadius: '0.75rem',
                  backgroundColor: theme.background || '#f8fafc'
                }}
              >
                {/* Top Section: Medication and Doctor */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  marginBottom: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Pill size={24} style={{ color: '#8b5cf6' }} />
                    <div>
                      <h4 style={{ color: theme.text, margin: '0 0 0.25rem 0', fontSize: '1.1rem' }}>
                        {prescription.medication?.name || 'Unknown Medication'}
                      </h4>
                      <p style={{ color: theme.textSecondary, margin: 0, fontSize: '0.9rem' }}>
                        {/* Use 'doctor' key, which is a string from API */}
                        Prescribed by: {prescription.doctor || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Middle Section: Details */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                  gap: '1rem', 
                  marginBottom: '1rem',
                  padding: '1rem',
                  backgroundColor: theme.cardBackground,
                  borderRadius: '0.5rem'
                }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: theme.textSecondary }}>Dosage</span>
                    <p style={{ color: theme.text, margin: 0, fontWeight: '500' }}>
                      {prescription.dosage}
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: theme.textSecondary }}>Frequency</span>
                    <p style={{ color: theme.text, margin: 0, fontWeight: '500' }}>
                      {prescription.frequency}
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: theme.textSecondary }}>Date</span>
                    <p style={{ color: theme.text, margin: 0, fontWeight: '500' }}>
                      {formatDate(prescription.prescription_date)}
                    </p>
                  </div>
                  {/* Fields not provided by API are removed: duration, start/end date, notes, instructions */}
                </div>

                {/* Bottom Section: Actions */}
                <div style={{ 
                  display: 'flex', 
                  gap: '0.5rem',
                  paddingTop: '1rem',
                  borderTop: `1px solid ${theme.border || '#e5e7eb'}`
                }}>
                  <button className="btn btn-secondary" style={{ fontSize: '0.9rem' }} disabled>
                    <FileText size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                    View Details
                  </button>
                  <button className="btn btn-secondary" style={{ fontSize: '0.9rem' }} disabled>
                    <Download size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                    Download
                  </button>
                  {/* Note: Buttons are left in but disabled, as their function is not yet defined */}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <Pill size={48} style={{ color: theme.textSecondary, margin: '0 auto 1rem', opacity: 0.5 }} />
            <p style={{ color: theme.textSecondary, fontSize: '1.1rem', margin: 0 }}>
              No prescriptions found
            </p>
            <p style={{ color: theme.textSecondary, fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Prescriptions from your doctor will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default PatientPrescriptions