import React, { useState, useEffect } from 'react'
import { User, Edit, Save, X, Building2, Award, Calendar, Languages } from 'lucide-react'

const DoctorProfile = () => {
  const [profile, setProfile] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState({
    specialization: '',
    qualification: '',
    experience_years: '',
    available_days: '',
    languages_spoken: '',
    hospital: '',
    photo: null
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setLoading(true)
    // Mock profile data from localStorage
    const savedProfile = localStorage.getItem('doctorProfile')
    const mockProfile = savedProfile ? JSON.parse(savedProfile) : {
      user: { first_name: 'Dr. Sarah', last_name: 'Johnson', email: 'sarah.johnson@hospital.com' },
      specialization: 'Cardiology',
      qualification: 'MD, FACC',
      experience_years: 15,
      available_days: 'Monday to Friday',
      languages_spoken: 'English, Spanish',
      hospital: 'City General Hospital'
    }
    
    setTimeout(() => {
      setProfile(mockProfile)
      setEditForm({
        specialization: mockProfile.specialization || '',
        qualification: mockProfile.qualification || '',
        experience_years: mockProfile.experience_years || '',
        available_days: mockProfile.available_days || '',
        languages_spoken: mockProfile.languages_spoken || '',
        hospital: mockProfile.hospital || '',
        photo: null
      })
      setLoading(false)
    }, 500)
  }

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target
    setEditForm(prev => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    
    // Save to localStorage
    const updatedProfile = {
      ...profile,
      ...editForm
    }
    localStorage.setItem('doctorProfile', JSON.stringify(updatedProfile))
    
    setTimeout(() => {
      setProfile(updatedProfile)
      setIsEditing(false)
      setSaving(false)
    }, 500)
  }

  const handleCancel = () => {
    setEditForm({
      specialization: profile?.specialization || '',
      qualification: profile?.qualification || '',
      experience_years: profile?.experience_years || '',
      available_days: profile?.available_days || '',
      languages_spoken: profile?.languages_spoken || '',
      hospital: profile?.hospital || '',
      photo: null
    })
    setIsEditing(false)
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh' 
      }}>
        <div>Loading profile...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="card">
        <h3 style={{ color: '#1e293b', marginBottom: '1rem' }}>Doctor Profile</h3>
        <p style={{ color: '#64748b' }}>
          No profile found. Please complete your profile setup.
        </p>
      </div>
    )
  }

  return (
    <div className="card">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <h3 style={{ color: '#1e293b' }}>Doctor Profile</h3>
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
              disabled={saving}
              className="btn btn-success"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Save size={16} />
              {saving ? 'Saving...' : 'Save'}
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
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <div className="grid grid-2" style={{ gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">
                <Award size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Specialization
              </label>
              <input
                type="text"
                name="specialization"
                value={editForm.specialization}
                onChange={handleInputChange}
                className="form-input"
                placeholder="e.g., Cardiology, Pediatrics"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Qualification</label>
              <input
                type="text"
                name="qualification"
                value={editForm.qualification}
                onChange={handleInputChange}
                className="form-input"
                placeholder="e.g., MBBS, MD"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Experience (Years)</label>
              <input
                type="number"
                name="experience_years"
                value={editForm.experience_years}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Years of experience"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Building2 size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Hospital
              </label>
              <input
                type="text"
                name="hospital"
                value={editForm.hospital}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Hospital name"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Calendar size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Available Days
              </label>
              <input
                type="text"
                name="available_days"
                value={editForm.available_days}
                onChange={handleInputChange}
                className="form-input"
                placeholder="e.g., Monday-Friday, Weekends"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Languages size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Languages Spoken
              </label>
              <input
                type="text"
                name="languages_spoken"
                value={editForm.languages_spoken}
                onChange={handleInputChange}
                className="form-input"
                placeholder="e.g., English, Hindi, Spanish"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Profile Photo</label>
            <input
              type="file"
              name="photo"
              onChange={handleInputChange}
              className="form-input"
              accept="image/*"
            />
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              Upload a professional photo (optional)
            </p>
          </div>
        </form>
      ) : (
        <div>
          {/* Profile Display */}
          <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
            {profile.photo && (
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '3px solid #e5e7eb'
              }}>
                <img 
                  src={profile.photo} 
                  alt="Profile"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            )}
            <div style={{ flex: 1 }}>
              <h4 style={{ color: '#1e293b', marginBottom: '0.5rem', fontSize: '1.5rem' }}>
                Dr. {profile.user?.first_name} {profile.user?.last_name}
              </h4>
              <p style={{ color: '#3b82f6', fontSize: '1.1rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                {profile.specialization}
              </p>
              <p style={{ color: '#64748b' }}>
                {profile.qualification} • {profile.experience_years} years experience
              </p>
            </div>
          </div>

          <div className="grid grid-2" style={{ gap: '2rem' }}>
            <div>
              <h5 style={{ color: '#1e293b', marginBottom: '1rem' }}>Professional Details</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Award size={16} style={{ color: '#64748b' }} />
                  <span style={{ color: '#64748b' }}>Specialization:</span>
                  <span style={{ color: '#1e293b', fontWeight: '500' }}>{profile.specialization}</span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <User size={16} style={{ color: '#64748b' }} />
                  <span style={{ color: '#64748b' }}>Qualification:</span>
                  <span style={{ color: '#1e293b', fontWeight: '500' }}>{profile.qualification}</span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={16} style={{ color: '#64748b' }} />
                  <span style={{ color: '#64748b' }}>Experience:</span>
                  <span style={{ color: '#1e293b', fontWeight: '500' }}>{profile.experience_years} years</span>
                </div>
              </div>
            </div>

            <div>
              <h5 style={{ color: '#1e293b', marginBottom: '1rem' }}>Availability & Contact</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Building2 size={16} style={{ color: '#64748b' }} />
                  <span style={{ color: '#64748b' }}>Hospital:</span>
                  <span style={{ color: '#1e293b', fontWeight: '500' }}>{profile.hospital}</span>
                </div>
                
                {profile.available_days && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={16} style={{ color: '#64748b' }} />
                    <span style={{ color: '#64748b' }}>Available:</span>
                    <span style={{ color: '#1e293b', fontWeight: '500' }}>{profile.available_days}</span>
                  </div>
                )}
                
                {profile.languages_spoken && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Languages size={16} style={{ color: '#64748b' }} />
                    <span style={{ color: '#64748b' }}>Languages:</span>
                    <span style={{ color: '#1e293b', fontWeight: '500' }}>{profile.languages_spoken}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DoctorProfile