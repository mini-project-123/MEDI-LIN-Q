import React, { useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import { 
  Calendar, 
  FileText, 
  Pill, 
  FolderOpen, 
  Video, 
  MessageSquare, 
  User, 
  Settings, 
  LogOut, 
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Clock,
  Bell,
  Shield,
  Eye,
  Globe,
  Smartphone,
  CreditCard,
  HelpCircle
} from 'lucide-react'

const DoctorSettings = () => {
  const { theme } = useTheme()
  const { user, logout } = useAuth()
  const [activeSection, setActiveSection] = useState('profile')
  const [editingField, setEditingField] = useState(null)
  const [tempValues, setTempValues] = useState({})

  const settingsMenuItems = [
    {
      id: 'appointments',
      label: 'My Appointments',
      icon: Calendar,
      description: 'View and manage your scheduled appointments'
    },
    {
      id: 'tests',
      label: 'My Tests',
      icon: FileText,
      description: 'Access laboratory tests and results'
    },
    {
      id: 'medicine',
      label: 'My Medicine Orders',
      icon: Pill,
      description: 'Track prescription orders and medication history'
    },
    {
      id: 'records',
      label: 'My Medical Records',
      icon: FolderOpen,
      description: 'View patient medical records and history'
    },
    {
      id: 'consultations',
      label: 'My Online Consultations',
      icon: Video,
      description: 'Manage virtual consultations and telemedicine'
    },
    {
      id: 'feedback',
      label: 'My Feedback',
      icon: MessageSquare,
      description: 'View patient feedback and ratings'
    },
    {
      id: 'profile',
      label: 'View / Update Profile',
      icon: User,
      description: 'Edit your professional profile information',
      highlighted: true
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      description: 'Configure system preferences and notifications'
    },
    {
      id: 'logout',
      label: 'Logout',
      icon: LogOut,
      description: 'Sign out of your account'
    }
  ]

  const profileSettings = [
    {
      category: 'Personal Information',
      items: [
        { label: 'Full Name', value: user?.name || 'Dr. Sarah Johnson', editable: true },
        { label: 'Phone Number', value: '+918799550781', editable: true, icon: Phone },
        { label: 'Email Address', value: user?.email || 'doctor@medlinq.com', editable: true, icon: Mail },
        { label: 'Specialization', value: user?.specialization || 'Cardiology', editable: true },
        { label: 'License Number', value: 'MD-12345-2024', editable: true },
        { label: 'Years of Experience', value: '8 years', editable: true }
      ]
    },
    {
      category: 'Professional Details',
      items: [
        { label: 'Hospital/Clinic', value: 'City General Hospital', editable: true, icon: MapPin },
        { label: 'Department', value: 'Cardiology Department', editable: true },
        { label: 'Consultation Fee', value: '₹500', editable: true, icon: CreditCard },
        { label: 'Available Hours', value: '9:00 AM - 6:00 PM', editable: true, icon: Clock },
        { label: 'Languages Spoken', value: 'English, Hindi, Telugu', editable: true, icon: Globe }
      ]
    },
    {
      category: 'Notification Preferences',
      items: [
        { label: 'Appointment Reminders', value: 'Enabled', toggle: true, icon: Bell },
        { label: 'Patient Messages', value: 'Enabled', toggle: true, icon: MessageSquare },
        { label: 'Emergency Alerts', value: 'Enabled', toggle: true, icon: Shield },
        { label: 'SMS Notifications', value: 'Disabled', toggle: true, icon: Smartphone },
        { label: 'Email Updates', value: 'Enabled', toggle: true, icon: Mail }
      ]
    },
    {
      category: 'Privacy & Security',
      items: [
        { label: 'Profile Visibility', value: 'Public', editable: true, icon: Eye },
        { label: 'Two-Factor Authentication', value: 'Disabled', toggle: true, icon: Shield },
        { label: 'Data Sharing', value: 'Limited', editable: true },
        { label: 'Session Timeout', value: '30 minutes', editable: true, icon: Clock }
      ]
    }
  ]

  const handleMenuClick = (itemId) => {
    if (itemId === 'logout') {
      if (window.confirm('Are you sure you want to logout?')) {
        logout()
      }
      return
    }
    setActiveSection(itemId)
  }

  const handleEdit = (fieldKey, currentValue) => {
    setEditingField(fieldKey)
    setTempValues({ ...tempValues, [fieldKey]: currentValue })
  }

  const handleSave = (fieldKey) => {
    // Here you would typically save to backend
    console.log(`Saving ${fieldKey}:`, tempValues[fieldKey])
    setEditingField(null)
    // Show success message
    alert('Settings updated successfully!')
  }

  const handleCancel = () => {
    setEditingField(null)
    setTempValues({})
  }

  const handleToggle = (fieldKey, currentValue) => {
    const newValue = currentValue === 'Enabled' ? 'Disabled' : 'Enabled'
    console.log(`Toggling ${fieldKey} to:`, newValue)
    // Show success message
    alert(`${fieldKey} ${newValue.toLowerCase()} successfully!`)
  }

  const renderMenuItem = (item) => (
    <div
      key={item.id}
      onClick={() => handleMenuClick(item.id)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 1.5rem',
        margin: '0.5rem 0',
        backgroundColor: item.highlighted ? '#e0f2fe' : 'transparent',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        border: activeSection === item.id ? '2px solid #3b82f6' : '2px solid transparent'
      }}
      onMouseEnter={(e) => {
        if (!item.highlighted) {
          e.target.style.backgroundColor = theme.cardBackground || '#f8fafc'
        }
      }}
      onMouseLeave={(e) => {
        if (!item.highlighted) {
          e.target.style.backgroundColor = 'transparent'
        }
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <item.icon 
          size={20} 
          style={{ 
            color: item.highlighted ? '#0284c7' : (theme.textSecondary || '#64748b') 
          }} 
        />
        <div>
          <h4 style={{ 
            margin: 0, 
            fontSize: '1rem', 
            fontWeight: '500',
            color: item.highlighted ? '#0284c7' : (theme.text || '#1e293b')
          }}>
            {item.label}
          </h4>
          <p style={{ 
            margin: 0, 
            fontSize: '0.85rem', 
            color: theme.textSecondary || '#64748b',
            marginTop: '0.25rem'
          }}>
            {item.description}
          </p>
        </div>
      </div>
      <ArrowRight 
        size={16} 
        style={{ 
          color: item.highlighted ? '#0284c7' : (theme.textSecondary || '#64748b') 
        }} 
      />
    </div>
  )

  const renderProfileSettings = () => (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold', 
          color: theme.text || '#1e293b',
          marginBottom: '0.5rem'
        }}>
          Profile Settings
        </h2>
        <p style={{ color: theme.textSecondary || '#64748b' }}>
          Manage your professional profile and account preferences
        </p>
      </div>

      {profileSettings.map((section, index) => (
        <div key={index} className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ 
            fontSize: '1.2rem', 
            fontWeight: '600', 
            color: theme.text || '#1e293b',
            marginBottom: '1.5rem',
            paddingBottom: '0.5rem',
            borderBottom: `1px solid ${theme.border || '#e5e7eb'}`
          }}>
            {section.category}
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {section.items.map((item, itemIndex) => (
              <div 
                key={itemIndex}
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '0.75rem 0',
                  borderBottom: itemIndex < section.items.length - 1 ? `1px solid ${theme.border || '#f1f5f9'}` : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {item.icon && (
                    <item.icon size={18} style={{ color: theme.textSecondary || '#64748b' }} />
                  )}
                  <span style={{ 
                    fontSize: '0.95rem', 
                    fontWeight: '500',
                    color: theme.text || '#1e293b'
                  }}>
                    {item.label}
                  </span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {item.toggle ? (
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={item.value === 'Enabled'}
                        style={{ marginRight: '0.5rem' }}
                        onChange={() => handleToggle(item.label, item.value)}
                      />
                      <span style={{ 
                        fontSize: '0.9rem', 
                        color: theme.textSecondary || '#64748b'
                      }}>
                        {item.value}
                      </span>
                    </label>
                  ) : editingField === `${section.category}-${item.label}` ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="text"
                        value={tempValues[`${section.category}-${item.label}`] || item.value}
                        onChange={(e) => setTempValues({
                          ...tempValues,
                          [`${section.category}-${item.label}`]: e.target.value
                        })}
                        style={{
                          padding: '0.25rem 0.5rem',
                          border: `1px solid ${theme.border || '#e5e7eb'}`,
                          borderRadius: '4px',
                          fontSize: '0.9rem',
                          minWidth: '150px'
                        }}
                        autoFocus
                      />
                      <button
                        onClick={() => handleSave(`${section.category}-${item.label}`)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.8rem',
                          backgroundColor: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        style={{
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.8rem',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <span style={{ 
                        fontSize: '0.9rem', 
                        color: theme.textSecondary || '#64748b'
                      }}>
                        {item.value}
                      </span>
                      {item.editable && (
                        <button
                          onClick={() => handleEdit(`${section.category}-${item.label}`, item.value)}
                          style={{
                            padding: '0.25rem 0.75rem',
                            fontSize: '0.8rem',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          Edit
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
        <HelpCircle size={48} style={{ color: '#64748b', margin: '0 auto 1rem' }} />
        <h3 style={{ color: theme.text || '#1e293b', marginBottom: '1rem' }}>
          Need Help?
        </h3>
        <p style={{ color: theme.textSecondary || '#64748b', marginBottom: '1.5rem' }}>
          Contact our support team for assistance with your account settings
        </p>
        <button
          style={{
            padding: '0.75rem 2rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          Contact Support
        </button>
      </div>
    </div>
  )

  const renderDefaultContent = () => (
    <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
      <Settings size={64} style={{ color: '#64748b', margin: '0 auto 2rem' }} />
      <h3 style={{ color: theme.text || '#1e293b', marginBottom: '1rem' }}>
        {activeSection === 'appointments' && 'My Appointments'}
        {activeSection === 'tests' && 'My Tests'}
        {activeSection === 'medicine' && 'My Medicine Orders'}
        {activeSection === 'records' && 'My Medical Records'}
        {activeSection === 'consultations' && 'My Online Consultations'}
        {activeSection === 'feedback' && 'My Feedback'}
        {activeSection === 'settings' && 'System Settings'}
      </h3>
      <p style={{ color: theme.textSecondary || '#64748b', marginBottom: '2rem' }}>
        This section is under development. Full functionality coming soon.
      </p>
      <button
        onClick={() => setActiveSection('profile')}
        style={{
          padding: '0.75rem 2rem',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1rem',
          fontWeight: '500',
          cursor: 'pointer'
        }}
      >
        Go to Profile Settings
      </button>
    </div>
  )

  return (
    <div style={{ display: 'flex', gap: '2rem', minHeight: '70vh' }}>
      {/* Settings Menu */}
      <div style={{ 
        width: '400px', 
        backgroundColor: theme.cardBackground || 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        height: 'fit-content',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '1.5rem',
              color: 'white'
            }}>
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div>
              <h3 style={{ 
                margin: 0, 
                fontSize: '1.2rem', 
                fontWeight: '600',
                color: theme.text || '#1e293b'
              }}>
                {user?.name || 'Aditi'}
              </h3>
              <p style={{ 
                margin: 0, 
                fontSize: '0.9rem', 
                color: theme.textSecondary || '#64748b'
              }}>
                +918799550781
              </p>
            </div>
          </div>
        </div>

        <div>
          {settingsMenuItems.map(renderMenuItem)}
        </div>

        <div style={{ 
          marginTop: '2rem', 
          padding: '1rem',
          backgroundColor: '#f0f9ff',
          borderRadius: '8px',
          border: '1px solid #0284c7'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <ArrowRight size={16} style={{ color: '#0284c7' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#0284c7' }}>
              Switch to provider products
            </span>
          </div>
          <p style={{ 
            margin: 0, 
            fontSize: '0.8rem', 
            color: '#64748b',
            lineHeight: '1.4'
          }}>
            Manage your clinic, answer consult questions, write health articles and more
          </p>
        </div>
      </div>

      {/* Settings Content */}
      <div style={{ flex: 1 }}>
        {activeSection === 'profile' ? renderProfileSettings() : renderDefaultContent()}
      </div>
    </div>
  )
}

export default DoctorSettings