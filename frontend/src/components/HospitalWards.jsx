import React, { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext' // Import useAuth
import axios from 'axios' // Import axios
import { Bed, AlertCircle } from 'lucide-react' // Removed Edit, Save, X

const HospitalWards = () => {
  const { theme } = useTheme()
  const { logout } = useAuth() // Get logout function
  
  // --- STATE FOR API DATA ---
  const [wards, setWards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Note: All editing-related states (editingWard, handleUpdateWard) are removed.

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchWards = async () => {
      setLoading(true)
      setError(null)
      try {
        const token = localStorage.getItem('accessToken')

        // Make the API call
        const response = await axios.get('/api/hospital/wards/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        setWards(response.data) // Save the ward list

      } catch (err) {
        console.error('Error fetching wards:', err)
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          setError('Authentication failed. Please log in again.')
          logout() // Logout on auth error
        } else {
          setError('Failed to load ward data.')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchWards()
  }, [logout]) // Re-run effect if logout function changes

  
  // This helper function is still needed
  const getOccupancyColor = (rate) => {
    if (rate >= 85) return '#ef4444' // Red
    if (rate >= 70) return '#f59e0b' // Orange
    return '#10b981' // Green
  }

  // --- RENDER FUNCTIONS ---
  
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: theme.textSecondary }}>
        Loading ward & bed data...
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
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: theme.text, margin: '0 0 0.5rem 0', fontSize: '2rem' }}>Wards & Beds Management</h1>
        <p style={{ color: theme.textSecondary, margin: 0 }}>Real-time bed availability and management controls</p>
      </div>

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {wards.length === 0 && !loading && (
           <div className="card" style={{ textAlign: 'center' }}>
            <p style={{ color: theme.textSecondary, margin: 0, fontSize: '1rem' }}>
              No ward data available.
            </p>
          </div>
        )}

        {wards.map(ward => {
          // Data from API: name, total_beds, occupied_beds, available_beds, occupancy_rate
          const occupancy = ward.occupancy_rate
          const occupancyColor = getOccupancyColor(parseFloat(occupancy))
          
          return (
            <div key={ward.id} className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '12px',
                    backgroundColor: `${occupancyColor}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Bed size={28} style={{ color: occupancyColor }} />
                  </div>
                  <div>
                    <h3 style={{ color: theme.text, margin: '0 0 0.25rem 0' }}>{ward.name}</h3>
                    <p style={{ color: theme.textSecondary, margin: 0, fontSize: '0.85rem' }}>
                      Occupancy: {occupancy}%
                    </p>
                  </div>
                </div>
                
                {/* All Edit/Save/Cancel buttons are removed */}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{
                  padding: '1rem',
                  backgroundColor: theme.background || '#f8fafc',
                  borderRadius: '8px'
                }}>
                  <label style={{ display: 'block', color: theme.textSecondary, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                    Total Beds
                  </label>
                  {/* Displaying read-only data from API */}
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: theme.text }}>{ward.total_beds}</div>
                </div>

                <div style={{
                  padding: '1rem',
                  backgroundColor: theme.background || '#f8fafc',
                  borderRadius: '8px'
                }}>
                  <label style={{ display: 'block', color: theme.textSecondary, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                    Occupied Beds
                  </label>
                  {/* Displaying read-only data from API */}
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>{ward.occupied_beds}</div>
                </div>

                <div style={{
                  padding: '1rem',
                  backgroundColor: theme.background || '#f8fafc',
                  borderRadius: '8px'
                }}>
                  <label style={{ display: 'block', color: theme.textSecondary, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                    Available Beds
                  </label>
                  {/* Displaying read-only data from API */}
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
                    {ward.available_beds}
                  </div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.9rem', color: theme.textSecondary }}>Occupancy Rate</span>
                  <span style={{ fontWeight: 'bold', color: occupancyColor, fontSize: '1.1rem' }}>
                    {occupancy}%
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '12px',
                  backgroundColor: theme.border || '#e2e8f0',
                  borderRadius: '6px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${occupancy}%`,
                    height: '100%',
                    backgroundColor: occupancyColor,
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default HospitalWards