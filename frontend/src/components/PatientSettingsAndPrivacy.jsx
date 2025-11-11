import React, { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import { Lock, Mail, Phone, User, MapPin, Calendar, Droplet, AlertCircle, CheckCircle2, Loader2, Save } from 'lucide-react'

const PatientSettingsAndPrivacy = () => {
  const { theme } = useAuth()
  const { user } = useAuth()
  const token = localStorage.getItem('accessToken')

  // Tabs
  const [activeTab, setActiveTab] = useState('profile')

  // Settings state
  const [settings, setSettings] = useState(null)
  const [privacy, setPrivacy] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  // Edit mode
  const [editMode, setEditMode] = useState({
    profile: false,
    privacy: false
  })

  // Form data
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    contact_no: '',
    gender: '',
    blood_group: '',
    allergies: '',
    chronic_diseases: '',
    height: '',
    weight: ''
  })

  const [privacyData, setPrivacyData] = useState({
    profile_visibility: 'private',
    show_medical_history: false,
    allow_doctor_contact: true,
    allow_notifications: true,
    data_sharing_consent: false,
    marketing_emails: false
  })

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings()
    fetchPrivacy()
  }, [])

  // Fetch user settings
  const fetchSettings = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('http://127.0.0.1:8000/api/patient/settings/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) throw new Error('Failed to fetch settings')
      
      const data = await response.json()
      setSettings(data)
      
      // Populate form
      setFormData({
        first_name: data.user_info?.first_name || '',
        last_name: data.user_info?.last_name || '',
        contact_no: data.user_info?.contact_no || '',
        gender: data.user_info?.gender || '',
        blood_group: data.profile_info?.blood_group || '',
        allergies: data.profile_info?.allergies || '',
        chronic_diseases: data.profile_info?.chronic_diseases || '',
        height: data.profile_info?.height || '',
        weight: data.profile_info?.weight || ''
      })
    } catch (err) {
      setError(err.message)
      console.error('Error fetching settings:', err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch privacy settings
  const fetchPrivacy = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/patient/privacy/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) throw new Error('Failed to fetch privacy settings')
      
      const data = await response.json()
      setPrivacy(data)
      setPrivacyData(data)
    } catch (err) {
      console.error('Error fetching privacy:', err)
    }
  }

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle privacy checkbox change
  const handlePrivacyChange = (field) => {
    setPrivacyData(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  // Save settings
  const handleSaveSettings = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch('http://127.0.0.1:8000/api/patient/settings/', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Failed to save settings')
      
      const data = await response.json()
      setSuccess(true)
      setEditMode(prev => ({ ...prev, profile: false }))
      
      // Refresh settings
      setTimeout(() => {
        fetchSettings()
        setSuccess(false)
      }, 2000)
    } catch (err) {
      setError(err.message)
      console.error('Error saving settings:', err)
    } finally {
      setSaving(false)
    }
  }

  // Save privacy settings
  const handleSavePrivacy = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch('http://127.0.0.1:8000/api/patient/privacy/', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(privacyData)
      })

      if (!response.ok) throw new Error('Failed to save privacy settings')
      
      setSuccess(true)
      setEditMode(prev => ({ ...prev, privacy: false }))
      
      setTimeout(() => {
        setSuccess(false)
      }, 2000)
    } catch (err) {
      setError(err.message)
      console.error('Error saving privacy:', err)
    } finally {
      setSaving(false)
    }
  }

  // Styles
  const styles = {
    container: {
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '2rem',
      backgroundColor: theme.background || '#f9fafb'
    },
    header: {
      marginBottom: '2rem'
    },
    title: {
      fontSize: '2rem',
      fontWeight: '700',
      color: theme.textPrimary || '#111',
      marginBottom: '0.5rem'
    },
    subtitle: {
      color: theme.textSecondary || '#6b7280'
    },
    tabs: {
      display: 'flex',
      gap: '1rem',
      borderBottom: `2px solid ${theme.borderColor || '#e5e7eb'}`,
      marginBottom: '2rem'
    },
    tab: (isActive) => ({
      padding: '1rem 1.5rem',
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      fontWeight: isActive ? '600' : '400',
      color: isActive ? (theme.primary || '#3b82f6') : (theme.textSecondary || '#6b7280'),
      borderBottom: isActive ? `3px solid ${theme.primary || '#3b82f6'}` : 'none',
      transition: 'all 0.3s ease'
    }),
    card: {
      backgroundColor: theme.cardBackground || '#fff',
      borderRadius: '12px',
      padding: '2rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      marginBottom: '2rem'
    },
    formGroup: {
      marginBottom: '1.5rem'
    },
    label: {
      display: 'block',
      marginBottom: '0.5rem',
      fontWeight: '600',
      color: theme.textPrimary || '#111'
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      border: `1px solid ${theme.borderColor || '#e5e7eb'}`,
      borderRadius: '8px',
      fontSize: '1rem',
      fontFamily: 'inherit',
      transition: 'border-color 0.2s ease',
      boxSizing: 'border-box'
    },
    select: {
      width: '100%',
      padding: '0.75rem',
      border: `1px solid ${theme.borderColor || '#e5e7eb'}`,
      borderRadius: '8px',
      fontSize: '1rem',
      fontFamily: 'inherit',
      backgroundColor: theme.cardBackground || '#fff'
    },
    gridForm: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1.5rem'
    },
    button: {
      primary: {
        backgroundColor: theme.primary || '#3b82f6',
        color: '#fff',
        padding: '0.75rem 1.5rem',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        fontWeight: '600',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      },
      secondary: {
        backgroundColor: 'transparent',
        color: theme.primary || '#3b82f6',
        padding: '0.75rem 1.5rem',
        borderRadius: '8px',
        border: `1px solid ${theme.primary || '#3b82f6'}`,
        cursor: 'pointer',
        fontWeight: '600',
        transition: 'all 0.3s ease'
      }
    },
    checkboxGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '1rem',
      backgroundColor: theme.background || '#f9fafb',
      borderRadius: '8px',
      marginBottom: '1rem'
    },
    checkbox: {
      width: '20px',
      height: '20px',
      cursor: 'pointer'
    }
  }

  if (loading) {
    return (
      <div style={{ ...styles.container, textAlign: 'center', paddingTop: '5rem' }}>
        <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} />
        <p style={{ marginTop: '1rem', color: theme.textSecondary || '#6b7280' }}>
          Loading settings...
        </p>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Settings & Privacy</h1>
        <p style={styles.subtitle}>
          Manage your profile information and privacy preferences
        </p>
      </div>

      {/* Messages */}
      {success && (
        <div style={{
          backgroundColor: '#d1fae5',
          border: '1px solid #6ee7b7',
          color: '#065f46',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <CheckCircle2 size={20} />
          Settings updated successfully!
        </div>
      )}

      {error && (
        <div style={{
          backgroundColor: '#fee2e2',
          border: '1px solid #fca5a5',
          color: '#991b1b',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          onClick={() => setActiveTab('profile')}
          style={styles.tab(activeTab === 'profile')}
        >
          <User size={18} style={{ marginRight: '0.5rem', display: 'inline' }} />
          Profile Settings
        </button>
        <button
          onClick={() => setActiveTab('privacy')}
          style={styles.tab(activeTab === 'privacy')}
        >
          <Lock size={18} style={{ marginRight: '0.5rem', display: 'inline' }} />
          Privacy & Preferences
        </button>
      </div>

      {/* Profile Settings Tab */}
      {activeTab === 'profile' && (
        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Personal Information</h2>
            {!editMode.profile ? (
              <button
                onClick={() => setEditMode(prev => ({ ...prev, profile: true }))}
                style={styles.button.secondary}
              >
                Edit Profile
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={() => setEditMode(prev => ({ ...prev, profile: false }))}
                  style={styles.button.secondary}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSettings}
                  disabled={saving}
                  style={{
                    ...styles.button.primary,
                    opacity: saving ? 0.5 : 1,
                    cursor: saving ? 'not-allowed' : 'pointer'
                  }}
                >
                  {saving ? (
                    <>
                      <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          <div style={styles.gridForm}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <User size={16} style={{ marginRight: '0.5rem', display: 'inline' }} />
                First Name
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                disabled={!editMode.profile}
                style={{
                  ...styles.input,
                  opacity: editMode.profile ? 1 : 0.7,
                  cursor: editMode.profile ? 'text' : 'default',
                  backgroundColor: editMode.profile ? (theme.cardBackground || '#fff') : (theme.background || '#f9fafb')
                }}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                <User size={16} style={{ marginRight: '0.5rem', display: 'inline' }} />
                Last Name
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                disabled={!editMode.profile}
                style={{
                  ...styles.input,
                  opacity: editMode.profile ? 1 : 0.7,
                  cursor: editMode.profile ? 'text' : 'default',
                  backgroundColor: editMode.profile ? (theme.cardBackground || '#fff') : (theme.background || '#f9fafb')
                }}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                <Phone size={16} style={{ marginRight: '0.5rem', display: 'inline' }} />
                Contact Number
              </label>
              <input
                type="tel"
                name="contact_no"
                value={formData.contact_no}
                onChange={handleInputChange}
                disabled={!editMode.profile}
                style={{
                  ...styles.input,
                  opacity: editMode.profile ? 1 : 0.7,
                  cursor: editMode.profile ? 'text' : 'default',
                  backgroundColor: editMode.profile ? (theme.cardBackground || '#fff') : (theme.background || '#f9fafb')
                }}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                <Mail size={16} style={{ marginRight: '0.5rem', display: 'inline' }} />
                Email
              </label>
              <input
                type="email"
                value={settings?.user_info?.email || ''}
                disabled={true}
                style={{
                  ...styles.input,
                  opacity: 0.7,
                  cursor: 'default',
                  backgroundColor: theme.background || '#f9fafb'
                }}
              />
              <p style={{ fontSize: '0.85rem', color: theme.textSecondary || '#6b7280', marginTop: '0.25rem' }}>
                Email cannot be changed
              </p>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                disabled={!editMode.profile}
                style={{
                  ...styles.select,
                  opacity: editMode.profile ? 1 : 0.7,
                  cursor: editMode.profile ? 'pointer' : 'default'
                }}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                <Droplet size={16} style={{ marginRight: '0.5rem', display: 'inline' }} />
                Blood Group
              </label>
              <select
                name="blood_group"
                value={formData.blood_group}
                onChange={handleInputChange}
                disabled={!editMode.profile}
                style={{
                  ...styles.select,
                  opacity: editMode.profile ? 1 : 0.7,
                  cursor: editMode.profile ? 'pointer' : 'default'
                }}
              >
                <option value="">Select Blood Group</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Height (cm)</label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleInputChange}
                disabled={!editMode.profile}
                style={{
                  ...styles.input,
                  opacity: editMode.profile ? 1 : 0.7,
                  cursor: editMode.profile ? 'text' : 'default',
                  backgroundColor: editMode.profile ? (theme.cardBackground || '#fff') : (theme.background || '#f9fafb')
                }}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Weight (kg)</label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                disabled={!editMode.profile}
                style={{
                  ...styles.input,
                  opacity: editMode.profile ? 1 : 0.7,
                  cursor: editMode.profile ? 'text' : 'default',
                  backgroundColor: editMode.profile ? (theme.cardBackground || '#fff') : (theme.background || '#f9fafb')
                }}
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Allergies</label>
            <textarea
              name="allergies"
              value={formData.allergies}
              onChange={handleInputChange}
              disabled={!editMode.profile}
              placeholder="Enter any allergies (comma-separated)"
              style={{
                ...styles.input,
                minHeight: '100px',
                resize: 'vertical',
                opacity: editMode.profile ? 1 : 0.7,
                cursor: editMode.profile ? 'text' : 'default',
                backgroundColor: editMode.profile ? (theme.cardBackground || '#fff') : (theme.background || '#f9fafb')
              }}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Chronic Diseases</label>
            <textarea
              name="chronic_diseases"
              value={formData.chronic_diseases}
              onChange={handleInputChange}
              disabled={!editMode.profile}
              placeholder="Enter any chronic diseases (comma-separated)"
              style={{
                ...styles.input,
                minHeight: '100px',
                resize: 'vertical',
                opacity: editMode.profile ? 1 : 0.7,
                cursor: editMode.profile ? 'text' : 'default',
                backgroundColor: editMode.profile ? (theme.cardBackground || '#fff') : (theme.background || '#f9fafb')
              }}
            />
          </div>
        </div>
      )}

      {/* Privacy Settings Tab */}
      {activeTab === 'privacy' && (
        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Privacy Preferences</h2>
            {editMode.privacy && (
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={() => setEditMode(prev => ({ ...prev, privacy: false }))}
                  style={styles.button.secondary}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePrivacy}
                  disabled={saving}
                  style={{
                    ...styles.button.primary,
                    opacity: saving ? 0.5 : 1,
                    cursor: saving ? 'not-allowed' : 'pointer'
                  }}
                >
                  {saving ? (
                    <>
                      <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', fontWeight: '600' }}>Data & Sharing</h3>
            
            <label style={styles.checkboxGroup}>
              <input
                type="checkbox"
                checked={privacyData.show_medical_history}
                onChange={() => handlePrivacyChange('show_medical_history')}
                disabled={!editMode.privacy}
                style={styles.checkbox}
              />
              <div>
                <strong>Show Medical History to Doctors</strong>
                <p style={{ fontSize: '0.9rem', color: theme.textSecondary || '#6b7280', margin: 0 }}>
                  Allow your medical history to be visible to healthcare providers
                </p>
              </div>
            </label>

            <label style={styles.checkboxGroup}>
              <input
                type="checkbox"
                checked={privacyData.data_sharing_consent}
                onChange={() => handlePrivacyChange('data_sharing_consent')}
                disabled={!editMode.privacy}
                style={styles.checkbox}
              />
              <div>
                <strong>Allow Research Data Sharing</strong>
                <p style={{ fontSize: '0.9rem', color: theme.textSecondary || '#6b7280', margin: 0 }}>
                  Allow your anonymized data to be used for medical research
                </p>
              </div>
            </label>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', fontWeight: '600' }}>Communication</h3>
            
            <label style={styles.checkboxGroup}>
              <input
                type="checkbox"
                checked={privacyData.allow_doctor_contact}
                onChange={() => handlePrivacyChange('allow_doctor_contact')}
                disabled={!editMode.privacy}
                style={styles.checkbox}
              />
              <div>
                <strong>Allow Doctor Contact</strong>
                <p style={{ fontSize: '0.9rem', color: theme.textSecondary || '#6b7280', margin: 0 }}>
                  Allow doctors to contact you via email or phone
                </p>
              </div>
            </label>

            <label style={styles.checkboxGroup}>
              <input
                type="checkbox"
                checked={privacyData.allow_notifications}
                onChange={() => handlePrivacyChange('allow_notifications')}
                disabled={!editMode.privacy}
                style={styles.checkbox}
              />
              <div>
                <strong>Allow Notifications</strong>
                <p style={{ fontSize: '0.9rem', color: theme.textSecondary || '#6b7280', margin: 0 }}>
                  Receive appointment reminders and health alerts
                </p>
              </div>
            </label>

            <label style={styles.checkboxGroup}>
              <input
                type="checkbox"
                checked={privacyData.marketing_emails}
                onChange={() => handlePrivacyChange('marketing_emails')}
                disabled={!editMode.privacy}
                style={styles.checkbox}
              />
              <div>
                <strong>Marketing Communications</strong>
                <p style={{ fontSize: '0.9rem', color: theme.textSecondary || '#6b7280', margin: 0 }}>
                  Receive promotional emails and special offers
                </p>
              </div>
            </label>
          </div>

          <div>
            <h3 style={{ marginBottom: '1.5rem', fontWeight: '600' }}>Profile Visibility</h3>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Who can see your profile?</label>
              <select
                value={privacyData.profile_visibility}
                onChange={(e) => setPrivacyData(prev => ({ ...prev, profile_visibility: e.target.value }))}
                disabled={!editMode.privacy}
                style={{
                  ...styles.select,
                  opacity: editMode.privacy ? 1 : 0.7,
                  cursor: editMode.privacy ? 'pointer' : 'default'
                }}
              >
                <option value="private">Private (Only you)</option>
                <option value="doctors">Doctors Only</option>
                <option value="public">Public</option>
              </select>
            </div>
          </div>

          {!editMode.privacy && (
            <button
              onClick={() => setEditMode(prev => ({ ...prev, privacy: true }))}
              style={styles.button.secondary}
            >
              Edit Privacy Settings
            </button>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default PatientSettingsAndPrivacy
