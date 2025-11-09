import React, { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios' // 1. IMPORT AXIOS
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
  HelpCircle,
  Award, // 2. IMPORT NEW ICONS
  Save,
  X,
  EyeOff
} from 'lucide-react'

const DoctorSettings = () => {
  const { theme } = useTheme()
  const { user, logout } = useAuth()
  const [activeSection, setActiveSection] = useState('profile')
  const [editingField, setEditingField] = useState(null)
  
  // 3. ADD STATE FOR LOADING AND PROFILE DATA
  const [profile, setProfile] = useState(null) 
  const [loading, setLoading] = useState(true)

  // This state holds the temporary values while editing
  const [tempValues, setTempValues] = useState({
    name: '',
    phone: '',
    email: '',
    specialization: '',
    license: '',
    experience: '',
    hospital: '',
    department: '',
    fee: '',
    hours: '',
    languages: ''
  })

  // 4. FETCH THE PROFILE DATA WHEN THE COMPONENT LOADS
  useEffect(() => {
    fetchProfileData()
  }, [])

  const fetchProfileData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('accessToken');
      //
      const response = await axios.get('/api/profile/doctor/manage/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = response.data;
      setProfile(data); // Save the full profile

      // Pre-fill the tempValues state with real data
      setTempValues({
        name: `${data.user.first_name} ${data.user.last_name}`,
        phone: data.user.contact_no || '+918799550781', // Fallback to mock
        email: data.user.email,
        specialization: data.specialization || '',
        license: 'MD-12345-2024', // Mock: Not in your backend model
        experience: data.experience_years || '0',
        hospital: data.hospital?.name || 'City General Hospital', // Fallback to mock
        department: 'Cardiology Department', // Mock: Not in your backend model
        fee: '₹500', // Mock: Not in your backend model
        hours: data.available_days || '',
        languages: data.languages_spoken || ''
      });
      
    } catch (error) {
      console.error("Error fetching doctor profile for settings:", error);
    } finally {
      setLoading(false); // Make sure to set loading to false
    }
  }

  // (This menu is unchanged)
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

  // 6. This function defines the settings sections
  const getProfileSettings = () => [
    {
      category: 'Personal Information',
      items: [
        // These fields are not editable via this endpoint, so editable: false
        { key: 'name', label: 'Full Name', value: tempValues.name, editable: false, icon: User },
        { key: 'phone', label: 'Phone Number', value: tempValues.phone, editable: false, icon: Phone },
        { key: 'email', label: 'Email Address', value: tempValues.email, editable: false, icon: Mail },
        // These fields ARE editable
        { key: 'specialization', label: 'Specialization', value: tempValues.specialization, editable: true, icon: Award },
        { key: 'license', label: 'License Number', value: tempValues.license, editable: true, icon: FileText }, // Mock field
        { key: 'experience', label: 'Years of Experience', value: tempValues.experience, editable: true, icon: Calendar }
      ]
    },
    {
      category: 'Professional Details',
      items: [
        { key: 'hospital', label: 'Hospital/Clinic', value: tempValues.hospital, editable: false, icon: MapPin }, // Not editable (it's a relationship ID)
        { key: 'department', label: 'Department', value: tempValues.department, editable: true }, // Mock field
        { key: 'fee', label: 'Consultation Fee', value: tempValues.fee, editable: true, icon: CreditCard }, // Mock field
        { key: 'hours', label: 'Available Hours', value: tempValues.hours, editable: true, icon: Clock },
        { key: 'languages', label: 'Languages Spoken', value: tempValues.languages, editable: true, icon: Globe }
      ]
    },
    // These sections are still mock, as requested
    {
      category: 'Notification Preferences',
      items: [
        { key: 'reminders', label: 'Appointment Reminders', value: 'Enabled', toggle: true, icon: Bell },
        { key: 'messages', label: 'Patient Messages', value: 'Enabled', toggle: true, icon: MessageSquare },
        { key: 'alerts', label: 'Emergency Alerts', value: 'Enabled', toggle: true, icon: Shield },
        { key: 'sms', label: 'SMS Notifications', value: 'Disabled', toggle: true, icon: Smartphone },
        { key: 'emailUpdates', label: 'Email Updates', value: 'Enabled', toggle: true, icon: Mail }
      ]
    },
    {
      category: 'Privacy & Security',
      items: [
        { key: 'visibility', label: 'Profile Visibility', value: 'Public', editable: true, icon: Eye },
        { key: '2fa', label: 'Two-Factor Authentication', value: 'Disabled', toggle: true, icon: Shield },
        { key: 'sharing', label: 'Data Sharing', value: 'Limited', editable: true },
        { key: 'timeout', label: 'Session Timeout', value: '30 minutes', editable: true, icon: Clock }
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

  // This function is for *all* edit buttons
  const handleEdit = (fieldKey, currentValue) => {
    setEditingField(fieldKey)
    setTempValues(prev => ({ ...prev, [fieldKey]: currentValue }))
  }

  // 7. This is the new API-connected save function
  const handleSave = async (fieldKey) => {
    
    // These are the fields the backend API will accept
    const realApiFields = ['specialization', 'experience', 'hours', 'languages'];
    
    // If we are "saving" a field that is NOT in the API, just show a mock alert
    if (!realApiFields.includes(fieldKey)) {
        console.log(`(Mock Save) ${fieldKey}:`, tempValues[fieldKey]);
        setEditingField(null);
        alert('Setting updated successfully! (Mock)');
        return;
    }

    // If it's a real API field, prepare the data and send the PATCH request
    // We use FormData because the main profile page supports photo upload,
    // so the backend endpoint is likely set up for it.
    const apiData = new FormData();
    apiData.append('specialization', tempValues.specialization);
    apiData.append('experience_years', tempValues.experience); // Use 'experience' from state
    apiData.append('available_days', tempValues.hours); // Use 'hours' from state
    apiData.append('languages_spoken', tempValues.languages); // Use 'languages' from state
    
    // We also need to send the *existing* hospital ID
    if (profile.hospital?.id) {
      apiData.append('hospital', profile.hospital.id);
    }
    
    console.log("Sending API update for:", fieldKey);
    setLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      //
      const response = await axios.patch('/api/profile/doctor/manage/', apiData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      // Update the profile and tempValues with the response from the server
      const data = response.data;
      setProfile(data);
      setTempValues({
        name: `${data.user.first_name} ${data.user.last_name}`,
        phone: data.user.contact_no || '+918799550781',
        email: data.user.email,
        specialization: data.specialization || '',
        license: 'MD-12345-2024', // Mock
        experience: data.experience_years || '0',
        hospital: data.hospital?.name || 'City General Hospital', // Mock
        department: 'Cardiology Department', // Mock
        fee: '₹500', // Mock
        hours: data.available_days || '',
        languages: data.languages_spoken || ''
      });
      
      setEditingField(null);
      alert('Profile updated successfully!');

    } catch (error) {
      console.error("Error saving profile:", error.response?.data || error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const handleCancel = () => {
    setEditingField(null)
    // Reset tempValues from the master profile state
    if (profile) { // Check if profile is not null
      setTempValues({
        name: `${profile.user.first_name} ${profile.user.last_name}`,
        phone: profile.user.contact_no || '+918799550781',
        email: profile.user.email,
        specialization: profile.specialization || '',
        license: 'MD-12345-2024', // Mock
        experience: profile.experience_years || '0',
        hospital: profile.hospital?.name || 'City General Hospital', // Mock
        department: 'Cardiology Department', // Mock
        fee: '₹500', // Mock
        hours: profile.available_days || '',
        languages: profile.languages_spoken || ''
      })
    }
  }
  
  // This is for mock toggles
  const handleToggle = (fieldKey, currentValue) => {
    const newValue = currentValue === 'Enabled' ? 'Disabled' : 'Enabled'
    console.log(`Toggling ${fieldKey} to:`, newValue)
    alert(`${fieldKey} ${newValue.toLowerCase()} successfully! (Mock)`)
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

  // 8. UPDATED RENDER FUNCTION
  const renderProfileSettings = () => {
    // THIS IS THE FIX. Wait for data.
    if (loading || !profile) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh',
          maxWidth: '800px'
        }}>
          <div>Loading settings...</div>
        </div>
      )
    }
  
    // Now it's safe to render, because 'profile' exists
    return (
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

        {getProfileSettings().map((section, index) => (
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
                    ) : editingField === item.key ? ( // Use item.key
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                          type="text"
                          value={tempValues[item.key] || ''}
                          onChange={(e) => setTempValues({
                            ...tempValues,
                            [item.key]: e.target.value
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
                          onClick={() => handleSave(item.key)} // Use handleSave
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
                          <Save size={14} />
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
                          <X size={14} />
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
                            onClick={() => handleEdit(item.key, item.value)}
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
  }

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
              {/* 9. FIX: Check if profile exists before rendering */}
              {profile ? profile.user.first_name.charAt(0) : (user?.name?.charAt(0) || 'A')}
            </div>
            <div>
              <h3 style={{ 
                margin: 0, 
                fontSize: '1.2rem', 
                fontWeight: '600',
                color: theme.text || '#1e293b'
              }}>
                {/* 10. FIX: Check if profile exists */}
                {profile ? `${profile.user.first_name} ${profile.user.last_name}` : (user?.name || 'Aditi')}
              </h3>
              <p style={{ 
                margin: 0, 
                fontSize: '0.9rem', 
                color: theme.textSecondary || '#64748b'
              }}>
                {profile ? (profile.user.contact_no || '+918799550781') : '+918799550781'}
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