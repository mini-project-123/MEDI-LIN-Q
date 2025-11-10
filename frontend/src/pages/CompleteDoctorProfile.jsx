import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext' 
import axios from 'axios'
// --- IMPORT NEW ICONS ---
import { User, Award, Calendar, Languages, Save, AlertCircle, MapPin, Phone, UserCheck, Building2 } from 'lucide-react'

export const CompleteDoctorProfile = () => {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()

  // Check for the hospital ID from signup
  const storedHospitalId = localStorage.getItem('tempDoctorHospitalId')

  const [formData, setFormData] = useState({
    specialization: '',
    qualification: '',
    experience_years: '',
    available_days: '',
    languages_spoken: '',
    photo: null,
    gender: 'Male',
    contact_no: '',
    date_of_birth: '',
    address: '',
    // --- ADDED hospital field to form state ---
    // If we have the stored ID, use it. Otherwise, it's empty and must be selected.
    hospital: storedHospitalId || '' 
  })

  const [hospitals, setHospitals] = useState([]) // To store list of hospitals
  const [loading, setLoading] = useState(true) // Set to true to load hospitals
  const [error, setError] = useState(null)

  // --- ADDED useEffect to fetch hospitals for the dropdown ---
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        setLoading(false);
        setError("Authentication error. Please log in again.");
        return;
    }
      
    // Only fetch hospitals if the ID wasn't stored (i.e., dropdown will be shown)
    if (!storedHospitalId) {
      const fetchHospitals = async () => {
        setLoading(true)
        try {
          // Use the public booking endpoint to get hospital list
          const response = await axios.get('/api/booking/hospitals/', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          setHospitals(response.data)
          setLoading(false)
        } catch (err) {
          console.error("Failed to fetch hospitals", err)
          setError('Could not load hospitals list. Please refresh and try again.')
          setLoading(false)
        }
      }
      fetchHospitals()
    } else {
      // If we have the ID, we don't need to fetch the list
      setLoading(false)
    }
  }, [storedHospitalId]) // Run this effect only once

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
    
    // --- UPDATED: Get hospital ID from form state ---
    const hospitalId = formData.hospital 

    if (!hospitalId) {
        // This error will now trigger if the dropdown was visible and not selected
        setError('You must select a primary hospital.')
        setLoading(false)
        return
    }
    
    const profileData = new FormData()
    // DoctorProfile fields
    profileData.append('specialization', formData.specialization)
    profileData.append('qualification', formData.qualification)
    profileData.append('experience_years', formData.experience_years)
    profileData.append('available_days', formData.available_days)
    profileData.append('languages_spoken', formData.languages_spoken)
    profileData.append('hospital', hospitalId) // --- Use the ID from form state ---
    if (formData.photo) {
      profileData.append('photo', formData.photo)
    }

    // User model fields
    profileData.append('gender', formData.gender)
    profileData.append('contact_no', formData.contact_no)
    profileData.append('date_of_birth', formData.date_of_birth)
    profileData.append('address', formData.address)

    try {
      await axios.post('/api/profile/doctor/', profileData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })
      
      // If the temp ID existed, remove it now that it's been used
      if (storedHospitalId) {
        localStorage.removeItem('tempDoctorHospitalId')
      }
      
      alert('Profile completed successfully! Welcome, Doctor.')
      
      const updatedUser = { ...user, profile_complete: true };
      setUser(updatedUser); 
      
      navigate('/dashboard')

    } catch (err) {
      console.error("Profile completion failed", err)
      if (err.response && err.response.data) {
         // Handle complex validation errors
        const errors = err.response.data;
        let errorMsg = "Please check your input.\n";
        for (const key in errors) {
          if (Array.isArray(errors[key])) {
            errorMsg += `${key}: ${errors[key][0]}\n`;
          } else if (typeof errors[key] === 'string') {
             errorMsg += `${key}: ${errors[key]}\n`;
          } else {
            // Handle cases where the error is not a list
            errorMsg += `${key}: ${JSON.stringify(errors[key])}\n`;
          }
        }
        setError(errorMsg);
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
              borderRadius: '0.5rem',
              whiteSpace: 'pre-wrap' // To show newlines in errors
            }}>
              <AlertCircle size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
              {error}
            </div>
          )}

          {/* Personal Info Section */}
          <h4 style={{ color: '#1e293b', marginBottom: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>
            Personal Details
          </h4>

          <div className="grid grid-2" style={{ gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">
                <Phone size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Contact No
              </label>
              <input
                type="tel"
                name="contact_no"
                value={formData.contact_no}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., +91..."
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
                <UserCheck size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Gender
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="form-input"
              required
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              <MapPin size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="form-input"
              placeholder="Your residential address"
              rows="3"
            />
          </div>

          {/* Professional Info Section */}
          <h4 style={{ color: '#1e293b', margin: '2rem 0 1rem 0', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>
            Professional Details
          </h4>

          {/* --- CONDITIONALLY RENDER HOSPITAL DROPDOWN (This is the fix) --- */}
          {!storedHospitalId ? (
            <div className="form-group">
              <label className="form-label">
                <Building2 size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Primary Hospital
              </label>
              <select
                name="hospital"
                value={formData.hospital}
                onChange={handleChange}
                className="form-input"
                required
                disabled={loading}
              >
                <option value="">{loading ? 'Loading hospitals...' : 'Select a hospital'}</option>
                {hospitals.map(hospital => (
                  // Use the hospital's 'id' (which is the user_id, fixed in the serializer)
                  <option key={hospital.id} value={hospital.id}>
                    {hospital.name} {hospital.custom_id ? `(${hospital.custom_id})` : ''}
                  </option>
                ))}
              </select>
              {loading && <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                Loading available hospitals...
              </p>}
            </div>
          ) : (
            // This message shows if the ID was successfully passed from signup
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">
                    <Building2 size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                    Primary Hospital
                </label>
                <input
                    type="text"
                    value="Hospital ID linked from signup"
                    className="form-input"
                    disabled
                    style={{ backgroundColor: '#f3f4f6', color: '#6b7280' }}
                />
                <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                    Your hospital was set during signup.
                </p>
            </div>
          )}

          <div className="grid grid-2" style={{ gap: '1rem', gridColumn: '1 / -1' }}>
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
            style={{ width: '100%', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            <Save size={18} />
            {loading ? 'Saving...' : 'Save and Continue'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default CompleteDoctorProfile