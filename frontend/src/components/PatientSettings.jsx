import React, { useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import { Mail, Lock, User, Shield, Bell, Eye, EyeOff, Save, AlertCircle, Phone } from 'lucide-react'

const PatientSettings = () => {
  const { theme } = useTheme()
  const { user } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  
  const [patientInfo, setPatientInfo] = useState({
    name: user?.name || 'John Patient',
    email: user?.email || 'patient@medlinq.com',
    phone: '+1 (555) 123-4567',
    dateOfBirth: '1990-01-01',
    bloodGroup: 'O+',
    emergencyContact: 'Jane Patient',
    emergencyPhone: '+1 (555) 987-6543'
  })

  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [privacy, setPrivacy] = useState({
    shareDataWithDoctors: true,
    allowAppointmentReminders: true,
    shareHealthMetrics: false,
    twoFactorAuth: false
  })

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsAlerts: true,
    appointmentReminders: true,
    prescriptionRefills: true,
    healthTips: false
  })

  const handleSavePatientInfo = () => {
    alert('Patient information updated successfully!')
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
        <p style={{ color: theme.textSecondary, margin: 0 }}>Manage your profile, account and privacy preferences</p>
      </div>

      {/* My Profile Section */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <User size={24} style={{ color: '#3b82f6' }} />
          <h3 style={{ color: theme.text, margin: 0 }}>My Profile</h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem', padding: '1.5rem', backgroundColor: theme.background || '#f8fafc', borderRadius: '8px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#3b82f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '2rem',
            fontWeight: 'bold'
          }}>
            {user?.name?.charAt(0) || 'P'}
          </div>
          <div>
            <h2 style={{ color: theme.text, margin: '0 0 0.5rem 0' }}>{user?.name || 'Patient Name'}</h2>
            <p style={{ color: theme.textSecondary, margin: 0 }}>{user?.email || 'patient@medlinq.com'}</p>
            <p style={{ color: theme.textSecondary, margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
              Role: Patient • Member since {new Date().getFullYear()}
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: theme.background || '#f8fafc', borderRadius: '8px' }}>
              <p style={{ color: theme.textSecondary, margin: '0 0 0.5rem 0', fontSize: '0.85rem' }}>Email</p>
              <p style={{ color: theme.text, margin: 0, fontWeight: '500' }}>{patientInfo.email}</p>
            </div>
            <div style={{ padding: '1rem', backgroundColor: theme.background || '#f8fafc', borderRadius: '8px' }}>
              <p style={{ color: theme.textSecondary, margin: '0 0 0.5rem 0', fontSize: '0.85rem' }}>Phone</p>
              <p style={{ color: theme.text, margin: 0, fontWeight: '500' }}>{patientInfo.phone}</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: theme.background || '#f8fafc', borderRadius: '8px' }}>
              <p style={{ color: theme.textSecondary, margin: '0 0 0.5rem 0', fontSize: '0.85rem' }}>Date of Birth</p>
              <p style={{ color: theme.text, margin: 0, fontWeight: '500' }}>{new Date(patientInfo.dateOfBirth).toLocaleDateString()}</p>
            </div>
            <div style={{ padding: '1rem', backgroundColor: theme.background || '#f8fafc', borderRadius: '8px' }}>
              <p style={{ color: theme.textSecondary, margin: '0 0 0.5rem 0', fontSize: '0.85rem' }}>Blood Group</p>
              <p style={{ color: theme.text, margin: 0, fontWeight: '500' }}>{patientInfo.bloodGroup}</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: theme.background || '#f8fafc', borderRadius: '8px' }}>
              <p style={{ color: theme.textSecondary, margin: '0 0 0.5rem 0', fontSize: '0.85rem' }}>Emergency Contact</p>
              <p style={{ color: theme.text, margin: 0, fontWeight: '500' }}>{patientInfo.emergencyContact}</p>
            </div>
            <div style={{ padding: '1rem', backgroundColor: theme.background || '#f8fafc', borderRadius: '8px' }}>
              <p style={{ color: theme.textSecondary, margin: '0 0 0.5rem 0', fontSize: '0.85rem' }}>Emergency Phone</p>
              <p style={{ color: theme.text, margin: 0, fontWeight: '500' }}>{patientInfo.emergencyPhone}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <User size={24} style={{ color: '#3b82f6' }} />
          <h3 style={{ color: theme.text, margin: 0 }}>Personal Information</h3>
        </div>

        <div style={{ display: 'grid', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', color: theme.text, fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: '500' }}>
              Full Name
            </label>
            <input
              type="text"
              value={patientInfo.name}
              onChange={(e) => setPatientInfo({ ...patientInfo, name: e.target.value })}
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
                value={patientInfo.email}
                onChange={(e) => setPatientInfo({ ...patientInfo, email: e.target.value })}
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
                value={patientInfo.phone}
                onChange={(e) => setPatientInfo({ ...patientInfo, phone: e.target.value })}
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', color: theme.text, fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: '500' }}>
                Date of Birth
              </label>
              <input
                type="date"
                value={patientInfo.dateOfBirth}
                onChange={(e) => setPatientInfo({ ...patientInfo, dateOfBirth: e.target.value })}
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
                Blood Group
              </label>
              <select
                value={patientInfo.bloodGroup}
                onChange={(e) => setPatientInfo({ ...patientInfo, bloodGroup: e.target.value })}
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
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', color: theme.text, fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: '500' }}>
                Emergency Contact Name
              </label>
              <input
                type="text"
                value={patientInfo.emergencyContact}
                onChange={(e) => setPatientInfo({ ...patientInfo, emergencyContact: e.target.value })}
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
                Emergency Contact Phone
              </label>
              <input
                type="tel"
                value={patientInfo.emergencyPhone}
                onChange={(e) => setPatientInfo({ ...patientInfo, emergencyPhone: e.target.value })}
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
            onClick={handleSavePatientInfo}
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
            { key: 'shareDataWithDoctors', label: 'Share Data with Doctors', description: 'Allow your doctors to access your health records' },
            { key: 'allowAppointmentReminders', label: 'Appointment Reminders', description: 'Receive reminders for upcoming appointments' },
            { key: 'shareHealthMetrics', label: 'Share Health Metrics', description: 'Share anonymized health data for research' },
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
            { key: 'appointmentReminders', label: 'Appointment Reminders', description: 'Reminders for upcoming appointments' },
            { key: 'prescriptionRefills', label: 'Prescription Refill Reminders', description: 'Notifications when prescriptions need refilling' },
            { key: 'healthTips', label: 'Health Tips', description: 'Receive personalized health tips and advice' }
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
            Changes to security and privacy settings may affect how your health data is managed. 
            Please review all changes carefully before saving.
          </p>
        </div>
      </div>
    </div>
  )
}

export default PatientSettings
