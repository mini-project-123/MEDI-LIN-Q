import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import { Building, Mail, Phone, MapPin, Save, AlertCircle, Award } from 'lucide-react'

// Note: We use a named export
export const CompleteHospitalProfile = () => {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contact_no1: '',
    contact_no2: '',
    email: user?.email || '', // Pre-fill email from user
    website: '',
    license_no: '',
    operating_hours: '',
    num_departments: 1,
    photo: null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    // This effect is fine as-is, no changes needed here.
    const fetchHospitals = async () => {
      try {
        const token = localStorage.getItem('accessToken')
        const response = await axios.get('http://127.0.0.1:8000/api/booking/hospitals/', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        // This is just to populate a list, but our form is for *creating* a hospital.
        // We'll leave this logic as it doesn't break anything.
      } catch (err) {
        console.error("Failed to fetch hospitals", err)
        // Non-critical error, so we don't set a user-facing error
      }
    }
    fetchHospitals()
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      photo: e.target.files[0]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const token = localStorage.getItem('accessToken')
    
    const profileData = new FormData()
    profileData.append('name', formData.name)
    profileData.append('address', formData.address)
    profileData.append('contact_no1', formData.contact_no1)
    profileData.append('contact_no2', formData.contact_no2)
    profileData.append('email', formData.email)
    profileData.append('website', formData.website)
    profileData.append('license_no', formData.license_no)
    profileData.append('operating_hours', formData.operating_hours)
    profileData.append('num_departments', formData.num_departments)
    if (formData.photo) {
      profileData.append('photo', formData.photo)
    }

    try {
      await axios.post('http://127.0.0.1:8000/api/profile/hospital/', profileData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })
      
      alert('Hospital profile created successfully! Welcome.')
      
      const updatedUser = { ...user, profile_complete: true };
      setUser(updatedUser); 
      
      navigate('/dashboard')

    } catch (err) {
      console.error("Profile completion failed", err)
      
      // --- THIS IS THE MODIFIED ERROR HANDLING LOGIC ---
      if (err.response && err.response.data) {
        const errorData = err.response.data;
        // Check if errorData is an object (like { email: ["..."] })
        if (typeof errorData === 'object' && errorData !== null) {
          // Find the first error message
          const firstErrorKey = Object.keys(errorData)[0];
          const firstErrorMessage = errorData[firstErrorKey];
          
          if (Array.isArray(firstErrorMessage) && firstErrorMessage.length > 0) {
            // This handles { "field": ["Error message"] }
            setError(`Error: ${firstErrorKey} - ${firstErrorMessage[0]}`);
          } else if (firstErrorMessage) {
            // This handles { "detail": "Error message" }
            setError(firstErrorMessage.toString());
          } else {
            // Fallback for unexpected object structure
            setError('An error occurred. Please check your data.')
          }
        } else {
          // Fallback for simple string errors
          setError(errorData.toString());
        }
      } else {
        setError('An error occurred. Please try again.')
      }
      // --- END OF MODIFIED LOGIC ---
      
      setLoading(false)
    }
  }

  return (
    <div className="container" style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      padding: '2rem 1rem'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '700px' }}>
        <div className="text-center mb-6">
          <Building size={48} style={{ color: '#3b82f6', margin: '0 auto 1rem' }} />
          <h2 style={{ marginBottom: '0.5rem', color: '#1e293b' }}>Complete Hospital Profile</h2>
          <p style={{ color: '#64748b' }}>
            Please provide your hospital's official details to activate your account.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="error mb-4" style={{ 
              backgroundColor: '#fee2e2', 
              color: '#b91c1c', 
              padding: '1rem', 
              borderRadius: '0.5rem',
              wordBreak: 'break-word' // Added to prevent overflow
            }}>
              <AlertCircle size={20} style={{ display: 'inline', marginRight: '0.5rem', float: 'left' }} />
              {error}
            </div>
          )}

          <div className="grid grid-2" style={{ gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Hospital Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., City General Hospital"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                <Mail size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Official Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., info@hospital.com"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <MapPin size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="form-input"
              placeholder="Full hospital address"
              required
            />
          </div>

          <div className="grid grid-2" style={{ gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">
                <Phone size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Primary Contact No
              </label>
              <input
                type="tel"
                name="contact_no1"
                value={formData.contact_no1}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., +91..."
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Secondary Contact No (Optional)</label>
              <input
                type="tel"
                name="contact_no2"
                value={formData.contact_no2}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., Reception desk"
              />
            </div>
          </div>
          
          <div className="grid grid-2" style={{ gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">
                <Award size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                License Number
              </label>
              <input
                type="text"
                name="license_no"
                value={formData.license_no}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., HOS-12345"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Operating Hours</label>
              <input
                type="text"
                name="operating_hours"
                value={formData.operating_hours}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., 24/7"
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Website (Optional)</label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              className="form-input"
              placeholder="e.g., https://hospital.com"
            />
          </div>

          <div className="grid grid-2" style={{ gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Number of Departments</label>
              <input
                type="number"
                name="num_departments"
                value={formData.num_departments}
                onChange={handleChange}
                className="form-input"
                min="1"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Hospital Photo (Optional)</label>
              <input
                type="file"
                name="photo"
                onChange={handleFileChange}
                className="form-input"
                accept="image/*"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            <Save size={18} />
            {loading ? 'Saving...' : 'Save and Continue to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  )
}

// Use default export as well to be safe
export default CompleteHospitalProfile