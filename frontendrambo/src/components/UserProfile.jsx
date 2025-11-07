import React, { useState, useEffect } from 'react'
import { User, Edit, Save, X, Mail, Phone, Calendar, MapPin, Building2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'

const UserProfile = () => {
  const { user } = useAuth()
  const { theme } = useTheme()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    emergencyContactName: '',
    emergencyContactNumber: '',
    // Role specific fields
    specialization: '',
    hospitalId: '',
    hospitalName: '',
    hospitalAddress: '',
    allergies: ''
  })

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth || '',
        address: user.address || '',
        emergencyContactName: user.emergencyContactName || '',
        emergencyContactNumber: user.emergencyContactNumber || '',
        specialization: user.specialization || '',
        hospitalId: user.hospitalId || '',
        hospitalName: user.hospitalName || '',
        hospitalAddress: user.hospitalAddress || '',
        allergies: user.allergies || ''
      })
    }
  }, [user])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    
    // Mock save functionality
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Update localStorage mock user data
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
    const updatedUser = { ...currentUser, ...profileData }
    localStorage.setItem('currentUser', JSON.stringify(updatedUser))
    
    // Update mock users database
    const mockUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]')
    const userIndex = mockUsers.findIndex(u => u.id === user.id)
    if (userIndex !== -1) {
      mockUsers[userIndex] = { ...mockUsers[userIndex], ...profileData }
      localStorage.setItem('mockUsers', JSON.stringify(mockUsers))
    }
    
    setIsEditing(false)
    setLoading(false)
    alert('Profile updated successfully!')
  }

  const handleCancel = () => {
    // Reset to original data
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth || '',
        address: user.address || '',
        emergencyContactName: user.emergencyContactName || '',
        emergencyContactNumber: user.emergencyContactNumber || '',
        specialization: user.specialization || '',
        hospitalId: user.hospitalId || '',
        hospitalName: user.hospitalName || '',
        hospitalAddress: user.hospitalAddress || '',
        allergies: user.allergies || ''
      })
    }
    setIsEditing(false)
  }

  const renderBasicInfo = () => (
    <div className="card" style={{ 
      backgroundColor: theme.cardBackground,
      borderColor: theme.border,
      marginBottom: '2rem'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <h3 style={{ color: theme.text }}>Basic Information</h3>
        {!isEditing ? (
          <button 
            onClick={() => setIsEditing(true)}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Edit size={16} />
            Edit Profile
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={handleSave}
              disabled={loading}
              className="btn btn-success"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Save size={16} />
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button 
              onClick={handleCancel}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <X size={16} />
              Cancel
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="grid grid-2" style={{ gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" style={{ color: theme.text }}>Full Name</label>
            <input
              type="text"
              name="name"
              value={profileData.name}
              onChange={handleInputChange}
              className="form-input"
              style={{ 
                backgroundColor: theme.background,
                color: theme.text,
                borderColor: theme.border
              }}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ color: theme.text }}>Email</label>
            <input
              type="email"
              name="email"
              value={profileData.email}
              onChange={handleInputChange}
              className="form-input"
              style={{ 
                backgroundColor: theme.background,
                color: theme.text,
                borderColor: theme.border
              }}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ color: theme.text }}>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={profileData.phone}
              onChange={handleInputChange}
              className="form-input"
              style={{ 
                backgroundColor: theme.background,
                color: theme.text,
                borderColor: theme.border
              }}
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ color: theme.text }}>Date of Birth</label>
            <input
              type="date"
              name="dateOfBirth"
              value={profileData.dateOfBirth}
              onChange={handleInputChange}
              className="form-input"
              style={{ 
                backgroundColor: theme.background,
                color: theme.text,
                borderColor: theme.border
              }}
            />
          </div>

          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label" style={{ color: theme.text }}>Address</label>
            <textarea
              name="address"
              value={profileData.address}
              onChange={handleInputChange}
              className="form-input"
              style={{ 
                backgroundColor: theme.background,
                color: theme.text,
                borderColor: theme.border
              }}
              rows="3"
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-2" style={{ gap: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <User size={16} style={{ color: theme.textSecondary }} />
              <span style={{ color: theme.textSecondary }}>Name:</span>
              <span style={{ color: theme.text, fontWeight: '500' }}>{profileData.name}</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Mail size={16} style={{ color: theme.textSecondary }} />
              <span style={{ color: theme.textSecondary }}>Email:</span>
              <span style={{ color: theme.text, fontWeight: '500' }}>{profileData.email}</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Phone size={16} style={{ color: theme.textSecondary }} />
              <span style={{ color: theme.textSecondary }}>Phone:</span>
              <span style={{ color: theme.text, fontWeight: '500' }}>{profileData.phone || 'Not provided'}</span>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Calendar size={16} style={{ color: theme.textSecondary }} />
              <span style={{ color: theme.textSecondary }}>Date of Birth:</span>
              <span style={{ color: theme.text, fontWeight: '500' }}>
                {profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toLocaleDateString() : 'Not provided'}
              </span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <MapPin size={16} style={{ color: theme.textSecondary }} />
              <span style={{ color: theme.textSecondary }}>Address:</span>
              <span style={{ color: theme.text, fontWeight: '500' }}>{profileData.address || 'Not provided'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const renderRoleSpecificInfo = () => {
    if (user?.role === 'patient') {
      return (
        <div className="card" style={{ 
          backgroundColor: theme.cardBackground,
          borderColor: theme.border,
          marginBottom: '2rem'
        }}>
          <h4 style={{ color: theme.text, marginBottom: '1.5rem' }}>Emergency Contact & Medical Info</h4>
          
          {isEditing ? (
            <div className="grid grid-2" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ color: theme.text }}>Emergency Contact Name</label>
                <input
                  type="text"
                  name="emergencyContactName"
                  value={profileData.emergencyContactName}
                  onChange={handleInputChange}
                  className="form-input"
                  style={{ 
                    backgroundColor: theme.background,
                    color: theme.text,
                    borderColor: theme.border
                  }}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: theme.text }}>Emergency Contact Number</label>
                <input
                  type="tel"
                  name="emergencyContactNumber"
                  value={profileData.emergencyContactNumber}
                  onChange={handleInputChange}
                  className="form-input"
                  style={{ 
                    backgroundColor: theme.background,
                    color: theme.text,
                    borderColor: theme.border
                  }}
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label" style={{ color: theme.text }}>Allergies</label>
                <textarea
                  name="allergies"
                  value={profileData.allergies}
                  onChange={handleInputChange}
                  className="form-input"
                  style={{ 
                    backgroundColor: theme.background,
                    color: theme.text,
                    borderColor: theme.border
                  }}
                  rows="3"
                  placeholder="List any allergies or medical conditions"
                />
              </div>
            </div>
          ) : (
            <div>
              <p style={{ color: theme.textSecondary, marginBottom: '0.5rem' }}>
                <strong>Emergency Contact:</strong> {profileData.emergencyContactName || 'Not provided'}
              </p>
              <p style={{ color: theme.textSecondary, marginBottom: '0.5rem' }}>
                <strong>Emergency Number:</strong> {profileData.emergencyContactNumber || 'Not provided'}
              </p>
              <p style={{ color: theme.textSecondary }}>
                <strong>Allergies:</strong> {profileData.allergies || 'None reported'}
              </p>
            </div>
          )}
        </div>
      )
    }

    if (user?.role === 'doctor') {
      return (
        <div className="card" style={{ 
          backgroundColor: theme.cardBackground,
          borderColor: theme.border,
          marginBottom: '2rem'
        }}>
          <h4 style={{ color: theme.text, marginBottom: '1.5rem' }}>Professional Information</h4>
          
          {isEditing ? (
            <div className="grid grid-2" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ color: theme.text }}>Specialization</label>
                <input
                  type="text"
                  name="specialization"
                  value={profileData.specialization}
                  onChange={handleInputChange}
                  className="form-input"
                  style={{ 
                    backgroundColor: theme.background,
                    color: theme.text,
                    borderColor: theme.border
                  }}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: theme.text }}>Hospital ID</label>
                <input
                  type="text"
                  name="hospitalId"
                  value={profileData.hospitalId}
                  onChange={handleInputChange}
                  className="form-input"
                  style={{ 
                    backgroundColor: theme.background,
                    color: theme.text,
                    borderColor: theme.border
                  }}
                />
              </div>
            </div>
          ) : (
            <div>
              <p style={{ color: theme.textSecondary, marginBottom: '0.5rem' }}>
                <strong>Specialization:</strong> {profileData.specialization || 'Not specified'}
              </p>
              <p style={{ color: theme.textSecondary }}>
                <strong>Hospital ID:</strong> {profileData.hospitalId || 'Not provided'}
              </p>
            </div>
          )}
        </div>
      )
    }

    if (user?.role === 'admin') {
      return (
        <div className="card" style={{ 
          backgroundColor: theme.cardBackground,
          borderColor: theme.border,
          marginBottom: '2rem'
        }}>
          <h4 style={{ color: theme.text, marginBottom: '1.5rem' }}>Hospital Information</h4>
          
          {isEditing ? (
            <div className="grid grid-2" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ color: theme.text }}>Hospital Name</label>
                <input
                  type="text"
                  name="hospitalName"
                  value={profileData.hospitalName}
                  onChange={handleInputChange}
                  className="form-input"
                  style={{ 
                    backgroundColor: theme.background,
                    color: theme.text,
                    borderColor: theme.border
                  }}
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label" style={{ color: theme.text }}>Hospital Address</label>
                <textarea
                  name="hospitalAddress"
                  value={profileData.hospitalAddress}
                  onChange={handleInputChange}
                  className="form-input"
                  style={{ 
                    backgroundColor: theme.background,
                    color: theme.text,
                    borderColor: theme.border
                  }}
                  rows="3"
                />
              </div>
            </div>
          ) : (
            <div>
              <p style={{ color: theme.textSecondary, marginBottom: '0.5rem' }}>
                <strong>Hospital Name:</strong> {profileData.hospitalName || 'Not specified'}
              </p>
              <p style={{ color: theme.textSecondary }}>
                <strong>Hospital Address:</strong> {profileData.hospitalAddress || 'Not provided'}
              </p>
            </div>
          )}
        </div>
      )
    }

    return null
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: theme.text, margin: '0 0 0.5rem 0' }}>My Profile</h2>
        <p style={{ color: theme.textSecondary, margin: 0 }}>
          Manage your personal information and account settings
        </p>
      </div>

      {renderBasicInfo()}
      {renderRoleSpecificInfo()}
    </div>
  )
}

export default UserProfile