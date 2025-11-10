import React, { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios' // Import axios
import { Mail, Lock, Building2, Shield, Bell, Eye, EyeOff, Save, AlertCircle, Phone, Globe, Award, Clock } from 'lucide-react'

const HospitalSettings = () => {
  const { theme } = useTheme()
  const { user, logout } = useAuth() // Get logout
  
  // --- STATE FOR API-DRIVEN DATA ---
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [hospitalInfo, setHospitalInfo] = useState({
    name: '',
    email: '',
    contact_no1: '',
    contact_no2: '',
    address: '',
    license_no: '',
    website: '',
    operating_hours: '',
  })

  // --- STATE FOR MOCK DATA ---
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [privacy, setPrivacy] = useState({
    dataSharing: true,
    analyticsTracking: true,
    marketingEmails: false,
    twoFactorAuth: false
  })
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsAlerts: true,
    emergencyAlerts: true,
    appointmentReminders: true,
    systemUpdates: false
  })
  
  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchHospitalProfile = async () => {
      setLoading(true)
      setError(null)
      try {
        const token = localStorage.getItem('accessToken')
        const response = await axios.get('/api/hospital/profile/manage/', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        // Load API data into state
        const data = response.data
        setHospitalInfo({
          name: data.name || '',
          email: data.email || '',
          contact_no1: data.contact_no1 || '',
          contact_no2: data.contact_no2 || '',
          address: data.address || '',
          license_no: data.license_no || '',
          website: data.website || '',
          operating_hours: data.operating_hours || '',
        })

      } catch (err) {
        console.error('Error fetching hospital profile:', err)
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          setError('Authentication failed. Please log in again.')
          logout() // Logout on auth error
        } else {
          setError('Failed to load hospital profile data.')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchHospitalProfile()
  }, [logout])
  
  
  // --- HANDLER FOR API-CONNECTED FORM ---
  
  const handleInfoChange = (e) => {
    const { name, value } = e.target
    setHospitalInfo(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSaveHospitalInfo = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)

    try {
      const token = localStorage.getItem('accessToken')
      // Send a PATCH request with the updated hospitalInfo
      await axios.patch('/api/hospital/profile/manage/', hospitalInfo, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' // Use JSON, not FormData (unless you add photo)
        }
      })
      
      alert('Hospital information updated successfully!')

    } catch (err) {
      console.error('Error saving hospital profile:', err)
      setError('Failed to save data. Please check your inputs and try again.')
    } finally {
      setIsSaving(false)
    }
  }

  // --- MOCK HANDLERS (Unchanged) ---
  const handleChangePassword = () => {
    if (security.newPassword !== security.confirmPassword) {
      alert('Passwords do not match!')
      return
    }
    if (security.newPassword.length < 6) {
      alert('Password must be at least 6 characters!')
      return
    }
    alert('Password changed successfully!')
    setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '' })
  }

  const handleSavePrivacy = () => {
    alert('Privacy settings updated successfully!')
  }

  const handleSaveNotifications = () => {
    alert('Notification preferences updated successfully!')
  }

  // --- RENDER FUNCTIONS ---

  const renderHospitalInfoForm = () => {
    if (loading) {
      return <div style={{ textAlign: 'center', padding: '2rem', color: theme.textSecondary }}>Loading profile...</div>
    }

    return (
      <form onSubmit={handleSaveHospitalInfo}>
        <div style={{ display: 'grid', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', color: theme.text, fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: '500' }}>
              Hospital Name
            </label>
            <input
              type="text"
              name="name" // Matches API
              value={hospitalInfo.name}
              onChange={handleInfoChange}
              style={{
                width: '100%', padding: '0.75rem', border: `1px solid ${theme.border || '#e5e7eb'}`,
                borderRadius: '8px', fontSize: '1rem', backgroundColor: theme.cardBackground, color: theme.text
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', color: theme.text, fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: '500' }}>
                Email Address
              </label>
              <input
                type="email"
                name="email" // Matches API
                value={hospitalInfo.email}
                onChange={handleInfoChange}
                style={{
                  width: '100%', padding: '0.75rem', border: `1px solid ${theme.border || '#e5e7eb'}`,
                  borderRadius: '8px', fontSize: '1rem', backgroundColor: theme.cardBackground, color: theme.text
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: theme.text, fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: '500' }}>
                Primary Phone
              </label>
              <input
                type="tel"
                name="contact_no1" // Matches API
                value={hospitalInfo.contact_no1}
                onChange={handleInfoChange}
                style={{
                  width: '100%', padding: '0.75rem', border: `1px solid ${theme.border || '#e5e7eb'}`,
                  borderRadius: '8px', fontSize: '1rem', backgroundColor: theme.cardBackground, color: theme.text
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', color: theme.text, fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: '500' }}>
              Address
            </label>
            <input
              type="text"
              name="address" // Matches API
              value={hospitalInfo.address}
              onChange={handleInfoChange}
              style={{
                width: '100%', padding: '0.75rem', border: `1px solid ${theme.border || '#e5e7eb'}`,
                borderRadius: '8px', fontSize: '1rem', backgroundColor: theme.cardBackground, color: theme.text
              }}
            />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', color: theme.text, fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: '500' }}>
                <Award size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                License Number
              </label>
              <input
                type="text"
                name="license_no" // Matches API
                value={hospitalInfo.license_no}
                onChange={handleInfoChange}
                style={{
                  width: '100%', padding: '0.75rem', border: `1px solid ${theme.border || '#e5e7eb'}`,
                  borderRadius: '8px', fontSize: '1rem', backgroundColor: theme.cardBackground, color: theme.text
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: theme.text, fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: '500' }}>
                <Clock size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Operating Hours
              </label>
              <input
                type="text"
                name="operating_hours" // Matches API
                value={hospitalInfo.operating_hours}
                onChange={handleInfoChange}
                placeholder="e.g., 24/7"
                style={{
                  width: '100%', padding: '0.75rem', border: `1px solid ${theme.border || '#e5e7eb'}`,
                  borderRadius: '8px', fontSize: '1rem', backgroundColor: theme.cardBackground, color: theme.text
                }}
              />
            </div>
          </div>
          
           <div>
              <label style={{ display: 'block', color: theme.text, fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: '500' }}>
                <Globe size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Website
              </label>
              <input
                type="url"
                name="website" // Matches API
                value={hospitalInfo.website}
                onChange={handleInfoChange}
                placeholder="e.g., https://myhospital.com"
                style={{
                  width: '100%', padding: '0.75rem', border: `1px solid ${theme.border || '#e5e7eb'}`,
                  borderRadius: '8px', fontSize: '1rem', backgroundColor: theme.cardBackground, color: theme.text
                }}
              />
            </div>

          <button
            type="submit"
            disabled={isSaving}
            style={{
              padding: '0.75rem 1.5rem', backgroundColor: '#3b82f6', color: 'white',
              border: 'none', borderRadius: '8px', cursor: 'pointer',
              fontSize: '1rem', fontWeight: '500', display: 'flex',
              alignItems: 'center', gap: '0.5rem', width: 'fit-content',
              opacity: isSaving ? 0.7 : 1
            }}
          >
            <Save size={18} />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: theme.text, margin: '0 0 0.5rem 0', fontSize: '2rem' }}>Settings & Privacy</h1>
        <p style={{ color: theme.textSecondary, margin: 0 }}>Manage your hospital account and privacy preferences</p>
      </div>
      
      {/* General Error Display */}
      {error && (
        <div className="card" style={{ backgroundColor: '#fee2e2', borderColor: '#ef4444', marginBottom: '1.5rem' }}>
          <h3 style={{ color: '#991b1b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={20} />
            Error
          </h3>
          <p style={{ color: '#b91c1c' }}>{error}</p>
        </div>
      )}

      {/* Hospital Information (Now connected to API) */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <Building2 size={24} style={{ color: '#3b82f6' }} />
          <h3 style={{ color: theme.text, margin: 0 }}>Hospital Information</h3>
        </div>
        {renderHospitalInfoForm()}
      </div>

      {/* Security Settings (Mock) */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <Lock size={24} style={{ color: '#10b981' }} />
          <h3 style={{ color: theme.text, margin: 0 }}>Security Settings</h3>
        </div>

        <div style={{ display: 'grid', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', color: theme.text, fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: '500' }}>
              Current Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={security.currentPassword}
                onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })}
                placeholder="Enter current password"
                style={{
                  width: '100%', padding: '0.75rem', paddingRight: '3rem', border: `1px solid ${theme.border || '#e5e7eb'}`,
                  borderRadius: '8px', fontSize: '1rem', backgroundColor: theme.cardBackground, color: theme.text
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: theme.textSecondary
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', color: theme.text, fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: '500' }}>
                New Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={security.newPassword}
                  onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
                  placeholder="Enter new password"
                  style={{
                    width: '100%', padding: '0.75rem', paddingRight: '3rem', border: `1px solid ${theme.border || '#e5e7eb'}`,
                    borderRadius: '8px', fontSize: '1rem', backgroundColor: theme.cardBackground, color: theme.text
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{
                    position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: theme.textSecondary
                  }}
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', color: theme.text, fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: '500' }}>
                Confirm New Password
              </label>
              <input
                type="password"
                value={security.confirmPassword}
                onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })}
                placeholder="Confirm new password"
                style={{
                  width: '100%', padding: '0.75rem', border: `1px solid ${theme.border || '#e5e7eb'}`,
                  borderRadius: '8px', fontSize: '1rem', backgroundColor: theme.cardBackground, color: theme.text
                }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleChangePassword}
            style={{
              padding: '0.75rem 1.5rem', backgroundColor: '#10b981', color: 'white', border: 'none',
              borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', fontWeight: '500',
              display: 'flex', alignItems: 'center', gap: '0.5rem', width: 'fit-content'
            }}
          >
            <Lock size={18} />
            Change Password
          </button>
        </div>
      </div>

      {/* Privacy Settings (Mock) */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <Shield size={24} style={{ color: '#8b5cf6' }} />
          <h3 style={{ color: theme.text, margin: 0 }}>Privacy Settings</h3>
        </div>
        {/* ... (mock privacy toggles remain the same) ... */}
        <div style={{ display: 'grid', gap: '1.25rem' }}>
          {[
            { key: 'dataSharing', label: 'Data Sharing with Partners', description: 'Allow sharing anonymized data with research partners' },
            { key: 'analyticsTracking', label: 'Analytics Tracking', description: 'Help us improve by tracking usage analytics' },
            { key: 'marketingEmails', label: 'Marketing Emails', description: 'Receive updates about new features and services' },
            { key: 'twoFactorAuth', label: 'Two-Factor Authentication', description: 'Add an extra layer of security to your account' }
          ].map(({ key, label, description }) => (
            <div key={key} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '1rem', border: `1px solid ${theme.border || '#e5e7eb'}`,
              borderRadius: '8px', backgroundColor: theme.background || '#fafafa'
            }}>
              <div>
                <h4 style={{ color: theme.text, margin: '0 0 0.25rem 0' }}>{label}</h4>
                <p style={{ color: theme.textSecondary, margin: 0, fontSize: '0.85rem' }}>{description}</p>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: '52px', height: '28px' }}>
                <input
                  type="checkbox"
                  checked={privacy[key]}
                  onChange={(e) => setPrivacy({ ...privacy, [key]: e.target.checked })}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: privacy[key] ? '#3b82f6' : '#cbd5e1',
                  transition: '0.3s', borderRadius: '28px'
                }}>
                  <span style={{
                    position: 'absolute', content: '', height: '20px', width: '20px',
                    left: privacy[key] ? '28px' : '4px', bottom: '4px',
                    backgroundColor: 'white', transition: '0.3s', borderRadius: '50%'
                  }} />
                </span>
              </label>
            </div>
          ))}
          <button
            type="button"
            onClick={handleSavePrivacy}
            style={{
              padding: '0.75rem 1.5rem', backgroundColor: '#8b5cf6', color: 'white', border: 'none',
              borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', fontWeight: '500',
              display: 'flex', alignItems: 'center', gap: '0.5rem', width: 'fit-content'
            }}
          >
            <Save size={18} />
            Save Privacy Settings
          </button>
        </div>
      </div>

      {/* Notification Preferences (Mock) */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <Bell size={24} style={{ color: '#f59e0b' }} />
          <h3 style={{ color: theme.text, margin: 0 }}>Notification Preferences</h3>
        </div>
        {/* ... (mock notification toggles remain the same) ... */}
        <div style={{ display: 'grid', gap: '1.25rem' }}>
          {[
            { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive important updates via email' },
            { key: 'smsAlerts', label: 'SMS Alerts', description: 'Get critical alerts via text message' },
            { key: 'emergencyAlerts', label: 'Emergency Alerts', description: 'Immediate notifications for emergencies' },
            { key: 'appointmentReminders', label: 'Appointment Reminders', description: 'Reminders for upcoming appointments' },
            { key: 'systemUpdates', label: 'System Updates', description: 'Notifications about system maintenance' }
          ].map(({ key, label, description }) => (
             <div key={key} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '1rem', border: `1px solid ${theme.border || '#e5e7eb'}`,
              borderRadius: '8px', backgroundColor: theme.background || '#fafafa'
            }}>
              <div>
                <h4 style={{ color: theme.text, margin: '0 0 0.25rem 0' }}>{label}</h4>
                <p style={{ color: theme.textSecondary, margin: 0, fontSize: '0.85rem' }}>{description}</p>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: '52px', height: '28px' }}>
                <input
                  type="checkbox"
                  checked={notifications[key]}
                  onChange={(e) => setNotifications({ ...notifications, [key]: e.target.checked })}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: notifications[key] ? '#3b82f6' : '#cbd5e1',
                  transition: '0.3s', borderRadius: '28px'
                }}>
                  <span style={{
                    position: 'absolute', content: '', height: '20px', width: '20px',
                    left: notifications[key] ? '28px' : '4px', bottom: '4px',
                    backgroundColor: 'white', transition: '0.3s', borderRadius: '50%'
                  }} />
                </span>
              </label>
            </div>
          ))}
          <button
            type="button"
            onClick={handleSaveNotifications}
            style={{
              padding: '0.75rem 1.5rem', backgroundColor: '#f59e0b', color: 'white', border: 'none',
              borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', fontWeight: '500',
              display: 'flex', alignItems: 'center', gap: '0.5rem', width: 'fit-content'
            }}
          >
            <Save size={18} />
            Save Notification Preferences
          </button>
        </div>
      </div>

      {/* Warning Notice (Mock) */}
      <div style={{
        marginTop: '2rem', padding: '1rem', backgroundColor: '#fef3c7',
        border: '1px solid #fbbf24', borderRadius: '8px', display: 'flex', gap: '0.75rem'
      }}>
        <AlertCircle size={20} style={{ color: '#92400e', flexShrink: 0, marginTop: '0.125rem' }} />
        <div>
          <h4 style={{ color: '#92400e', margin: '0 0 0.25rem 0', fontSize: '0.9rem' }}>Important Notice</h4>
          <p style={{ color: '#92400e', margin: 0, fontSize: '0.85rem' }}>
            Changes to security and privacy settings may affect how your hospital data is managed. 
            Please review all changes carefully before saving.
          </p>
        </div>
      </div>
    </div>
  )
}

export default HospitalSettings