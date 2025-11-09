import React, { useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { Bed, Edit, Save, X } from 'lucide-react'

const HospitalWards = () => {
  const { theme } = useTheme()
  const [editingWard, setEditingWard] = useState(null)
  const [wards, setWards] = useState([
    { id: 1, name: 'Cardiology', wardId: 'W001', total: 50, occupied: 38 },
    { id: 2, name: 'Orthopedics', wardId: 'W002', total: 40, occupied: 32 },
    { id: 3, name: 'Obstetrics & Gynecology', wardId: 'W003', total: 35, occupied: 28 },
    { id: 4, name: 'Internal Medicine', wardId: 'W004', total: 60, occupied: 45 },
    { id: 5, name: 'Surgery', wardId: 'W005', total: 45, occupied: 40 },
    { id: 6, name: 'ICU', wardId: 'W006', total: 20, occupied: 18 }
  ])

  const handleUpdateWard = (wardId, field, value) => {
    setWards(wards.map(w => 
      w.id === wardId ? { ...w, [field]: parseInt(value) || 0 } : w
    ))
  }

  const handleSaveWard = () => {
    setEditingWard(null)
    alert('Ward information updated successfully!')
  }

  const getOccupancyColor = (rate) => {
    if (rate >= 85) return '#ef4444'
    if (rate >= 70) return '#f59e0b'
    return '#10b981'
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: theme.text, margin: '0 0 0.5rem 0', fontSize: '2rem' }}>Wards & Beds Management</h1>
        <p style={{ color: theme.textSecondary, margin: 0 }}>Real-time bed availability and management controls</p>
      </div>

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {wards.map(ward => {
          const available = ward.total - ward.occupied
          const occupancy = ((ward.occupied / ward.total) * 100).toFixed(1)
          const occupancyColor = getOccupancyColor(parseFloat(occupancy))
          const isEditing = editingWard === ward.id
          
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
                      Ward ID: {ward.wardId} • Occupancy: {occupancy}%
                    </p>
                  </div>
                </div>
                
                {!isEditing ? (
                  <button
                    onClick={() => setEditingWard(ward.id)}
                    style={{
                      padding: '0.75rem 1.25rem',
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
                    <Edit size={16} />
                    Edit
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                      onClick={handleSaveWard}
                      style={{
                        padding: '0.75rem 1.25rem',
                        backgroundColor: '#10b981',
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
                      <Save size={16} />
                      Save
                    </button>
                    <button
                      onClick={() => setEditingWard(null)}
                      style={{
                        padding: '0.75rem 1.25rem',
                        backgroundColor: '#ef4444',
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
                      <X size={16} />
                      Cancel
                    </button>
                  </div>
                )}
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
                  {isEditing ? (
                    <input
                      type="number"
                      value={ward.total}
                      onChange={(e) => handleUpdateWard(ward.id, 'total', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: `1px solid ${theme.border || '#e5e7eb'}`,
                        borderRadius: '6px',
                        fontSize: '1.25rem',
                        fontWeight: 'bold',
                        backgroundColor: theme.cardBackground,
                        color: theme.text
                      }}
                    />
                  ) : (
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: theme.text }}>{ward.total}</div>
                  )}
                </div>

                <div style={{
                  padding: '1rem',
                  backgroundColor: theme.background || '#f8fafc',
                  borderRadius: '8px'
                }}>
                  <label style={{ display: 'block', color: theme.textSecondary, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                    Occupied Beds
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={ward.occupied}
                      onChange={(e) => handleUpdateWard(ward.id, 'occupied', e.target.value)}
                      max={ward.total}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: `1px solid ${theme.border || '#e5e7eb'}`,
                        borderRadius: '6px',
                        fontSize: '1.25rem',
                        fontWeight: 'bold',
                        backgroundColor: theme.cardBackground,
                        color: theme.text
                      }}
                    />
                  ) : (
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>{ward.occupied}</div>
                  )}
                </div>

                <div style={{
                  padding: '1rem',
                  backgroundColor: theme.background || '#f8fafc',
                  borderRadius: '8px'
                }}>
                  <label style={{ display: 'block', color: theme.textSecondary, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                    Available Beds
                  </label>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
                    {available}
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
