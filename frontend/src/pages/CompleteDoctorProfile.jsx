import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext' // Corrected path
import axios from 'axios'
import { User, Building2, Award, Calendar, Languages, Save, AlertCircle } from 'lucide-react'

// 1. Changed to a named export to match the import in App.jsx
export const CompleteDoctorProfile = () => {
  const { user, setUser } = useAuth() // 2. Get setUser from context
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    specialization: '',
    qualification: '',
    experience_years: '',
    available_days: '',
    languages_spoken: '',
    hospital: '', // This will hold the ID
    photo: null
  })
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // 3. Automatically set the hospital ID if it was provided during signup
    // (Note: Your signup logic doesn't seem to pass this, but this is good practice)
    if (user && user.hospitalId) {
      setFormData(prev => ({ ...prev, hospital: user.hospitalId }))
    }

    const fetchHospitals = async () => {
      try {
        const token = localStorage.getItem('accessToken')
        //
        const response = await axios.get('/api/booking/hospitals/', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        setHospitals(response.data)
        setLoading(false)
      } catch (err) {
        console.error("Failed to fetch hospitals", err)
        setError('Could not load hospitals. Please try again.')
        setLoading(false)
      }
    }
    fetchHospitals()
  }, [user]) // Depend on user state

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
    
    // 4. We use FormData because we are sending a file (photo)
    const profileData = new FormData()
    profileData.append('specialization', formData.specialization)
    profileData.append('qualification', formData.qualification)
    profileData.append('experience_years', formData.experience_years)
    profileData.append('available_days', formData.available_days)
    profileData.append('languages_spoken', formData.languages_spoken)
    profileData.append('hospital', formData.hospital)
    if (formData.photo) {
      profileData.append('photo', formData.photo)
    }

    try {
      // 5. Send the data to the correct backend endpoint
      //
      await axios.post('/api/profile/doctor/', profileData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })
      
      // 6. On success, remove any temporary flags if you had them
      // localStorage.removeItem('tempDoctorHospitalId') // (You don't seem to use this, which is fine)
      alert('Profile completed successfully! Welcome, Doctor.')
      
      // 7. Manually update AuthContext user to set profile_complete to true
      // This is critical so the dashboard doesn't redirect again
      const updatedUser = { ...user, profile_complete: true };
      setUser(updatedUser); // This function was exposed from AuthContext
      
      navigate('/dashboard')

    } catch (err) {
      console.error("Profile completion failed", err)
      if (err.response && err.response.data) {
        setError(JSON.stringify(err.response.data))
      } else {
        setError('An error occurred. Please try again.')
      }
      setLoading(false)
    }
  }

  return (
    <div className="container" style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      padding: '2rem 1rem'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '600px' }}>
        <div className="text-center mb-6">
          <User size={48} style={{ color: '#3b82f6', margin: '0 auto 1rem' }} />
          <h2 style={{ marginBottom: '0.5rem', color: '#1e293b' }}>Complete Your Doctor Profile</h2>
          <p style={{ color: '#64748b' }}>
            Please fill in your professional details to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="error mb-4" style={{ 
              backgroundColor: '#fee2e2', 
              color: '#b91c1c', 
              padding: '1rem', 
              borderRadius: '0.5rem'
            }}>
              <AlertCircle size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
              {error}
            </div>
          )}

          <div className="grid grid-2" style={{ gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">
                <Award size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Specialization
              </label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., Cardiology"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Qualification</label>
              <input
                type="text"
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., MD, MBBS"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Experience (in years)</label>
            <input
              type="number"
              name="experience_years"
              value={formData.experience_years}
              onChange={handleChange}
              className="form-input"
              placeholder="e.g., 5"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Building2 size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Primary Hospital
            </label>
            <select
              name="hospital"
              value={formData.hospital} // 8. Value will be '' or the pre-filled ID
              onChange={handleChange}
              className="form-input"
              required
              disabled={loading || (user && user.hospitalId)} // 9. Disable if hospitalId came from signup
            >
              <option value="">{loading ? 'Loading hospitals...' : 'Select a hospital'}</option>
              {hospitals.map(hospital => (
                // 10. Use hospital.id as the value
                <option key={hospital.id} value={hospital.id}>
                  {hospital.name} {hospital.custom_id ? `(${hospital.custom_id})` : ''}
                </option>
              ))}
            </select>
            {/* 11. Show a helper message if the hospital was set at signup */}
            {user && user.hospitalId && (
              <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                Your hospital was set during signup.
              </p>
            )}
          </div>

          <div className="grid grid-2" style={{ gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">
                <Calendar size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Available Days
              </label>
              <input
                type="text"
                name="available_days"
                value={formData.available_days}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., Mon, Wed, Fri"
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
                value={formData.languages_spoken}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., English, Hindi"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Profile Photo (Optional)</label>
            <input
              type="file"
              name="photo"
              onChange={handleFileChange}
              className="form-input"
              accept="image/*"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            <Save size={18} />
            {loading ? 'Saving...' : 'Save and Continue'}
          </button>
        </form>
      </div>
    </div>
  )
}

// 12. Use default export
export default CompleteDoctorProfile