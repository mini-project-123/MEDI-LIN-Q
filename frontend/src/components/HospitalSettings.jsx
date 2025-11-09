import React, { useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import { Mail, Lock, Building2, Shield, Bell, Eye, EyeOff, Save, AlertCircle } from 'lucide-react'

const HospitalSettings = () => {
  const { theme } = useTheme()
  const { user } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  
  const [hospitalInfo, setHospitalInfo] = useState({
    name: user?.hospitalName || 'City General Hospital',
    email: user?.email || 'hospital@medlinq.com',
    phone: '+1 (555) 123-4567',
    address: '123 Medical Street, City, State 12345',
    license: 'HL-2024-001234'
  })

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

  const handleSaveHospitalInfo = () => {
    alert('Hospital information updated successfully!')
  }

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

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: theme.text, margin: '0 0 0.5rem 0', fontSize: '2rem' }}>Settings & Privacy</h1>
        <p style={{ color: theme.textSecondary, margin: 0 }}>Manage your hospital account and privacy preferences</p>
      </div>

      {/* Hospital Information */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <Building2 size={24} style={{ color: '#3b82f6' }} />
          <h3 style={{ color: theme.text, margin: 0 }}>Hospital Information</h3>
        </div>

        <div style={{ display: 'grid', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', color: theme.text, fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: '500' }}>
              Hospital Name
            </label>
            <input
              type="text"
              value={hospitalInfo.name}
              onChange={(e) => setHospitalInfo({ ...hospitalInfo, name: e.target.value })}
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', color: theme.text, fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: '500' }}>
                Email Address
              </label>
              <input
                type="email"
                value={hospitalInfo.email}
                onChange={(e) => setHospitalInfo({ ...hospitalInfo, email: e.target.value })}
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
              <label style={{ display: 'block', color: theme.text, fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: '500' }}>
                Phone Number
              </label>
              <input
                type="tel"
                value={hospitalInfo.phone}
                onChange={(e) => setHospitalInfo({ ...hospitalInfo, phone: e.target.value })}
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
          </div>

          <div>
            <label style={{ display: 'block', color: theme.text, fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: '500' }}>
              Address
            </label>
            <input
              type="text"
              value={hospitalInfo.address}
              onChange={(e) => setHospitalInfo({ ...hospitalInfo, address: e.target.value })}
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
            <label style={{ display: 'block', color: theme.text, fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: '500' }}>
              License Number
            </label>
            <input
              type="text"
              value={hospitalInfo.license}
              onChange={(e) => setHospitalInfo({ ...hospitalInfo, license: e.target.value })}
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

          <button
            onClick={handleSaveHospitalInfo}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              width: 'fit-content'
            }}
          >
            <Save size={18} />
            Save Changes
          </button>
        </div>
      </div>

      {/* Security Settings */}
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
                  width: '100%',
                  padding: '0.75rem',
                  paddingRight: '3rem',
                  border: `1px solid ${theme.border || '#e5e7eb'}`,
                  borderRadius: '8px',
                  fontSize: '1rem',
                  backgroundColor: theme.cardBackground,
                  color: theme.text
                }}
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: theme.textSecondary
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
                    width: '100%',
                    padding: '0.75rem',
                    paddingRight: '3rem',
                    border: `1px solid ${theme.border || '#e5e7eb'}`,
                    borderRadius: '8px',
                    fontSize: '1rem',
                    backgroundColor: theme.cardBackground,
                    color: theme.text
                  }}
                />
                <button
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: theme.textSecondary
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
          </div>

          <button
            onClick={handleChangePassword}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              width: 'fit-content'
            }}
          >
            <Lock size={18} />
            Change Password
          </button>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <Shield size={24} style={{ color: '#8b5cf6' }} />
          <h3 style={{ color: theme.text, margin: 0 }}>Privacy Settings</h3>
        </div>

        <div style={{ display: 'grid', gap: '1.25rem' }}>
          {[
            { key: 'dataSharing', label: 'Data Sharing with Partners', description: 'Allow sharing anonymized data with research partners' },
            { key: 'analyticsTracking', label: 'Analytics Tracking', description: 'Help us improve by tracking usage analytics' },
            { key: 'marketingEmails', label: 'Marketing Emails', description: 'Receive updates about new features and services' },
            { key: 'twoFactorAuth', label: 'Two-Factor Authentication', description: 'Add an extra layer of security to your account' }
          ].map(({ key, label, description }) => (
            <div key={key} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem',
              border: `1px solid ${theme.border || '#e5e7eb'}`,
              borderRadius: '8px',
              backgroundColor: theme.background || '#fafafa'
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
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: privacy[key] ? '#3b82f6' : '#cbd5e1',
                  transition: '0.3s',
                  borderRadius: '28px'
                }}>
                  <span style={{
                    position: 'absolute',
                    content: '',
                    height: '20px',
                    width: '20px',
                    left: privacy[key] ? '28px' : '4px',
                    bottom: '4px',
                    backgroundColor: 'white',
                    transition: '0.3s',
                    borderRadius: '50%'
                  }} />
                </span>
              </label>
            </div>
          ))}

          <button
            onClick={handleSavePrivacy}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              width: 'fit-content'
            }}
          >
            <Save size={18} />
            Save Privacy Settings
          </button>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <Bell size={24} style={{ color: '#f59e0b' }} />
          <h3 style={{ color: theme.text, margin: 0 }}>Notification Preferences</h3>
        </div>

        <div style={{ display: 'grid', gap: '1.25rem' }}>
          {[
            { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive important updates via email' },
            { key: 'smsAlerts', label: 'SMS Alerts', description: 'Get critical alerts via text message' },
            { key: 'emergencyAlerts', label: 'Emergency Alerts', description: 'Immediate notifications for emergencies' },
            { key: 'appointmentReminders', label: 'Appointment Reminders', description: 'Reminders for upcoming appointments' },
            { key: 'systemUpdates', label: 'System Updates', description: 'Notifications about system maintenance' }
          ].map(({ key, label, description }) => (
            <div key={key} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem',
              border: `1px solid ${theme.border || '#e5e7eb'}`,
              borderRadius: '8px',
              backgroundColor: theme.background || '#fafafa'
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
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: notifications[key] ? '#3b82f6' : '#cbd5e1',
                  transition: '0.3s',
                  borderRadius: '28px'
                }}>
                  <span style={{
                    position: 'absolute',
                    content: '',
                    height: '20px',
                    width: '20px',
                    left: notifications[key] ? '28px' : '4px',
                    bottom: '4px',
                    backgroundColor: 'white',
                    transition: '0.3s',
                    borderRadius: '50%'
                  }} />
                </span>
              </label>
            </div>
          ))}

          <button
            onClick={handleSaveNotifications}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              width: 'fit-content'
            }}
          >
            <Save size={18} />
            Save Notification Preferences
          </button>
        </div>
      </div>

      {/* Warning Notice */}
      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        backgroundColor: '#fef3c7',
        border: '1px solid #fbbf24',
        borderRadius: '8px',
        display: 'flex',
        gap: '0.75rem'
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
