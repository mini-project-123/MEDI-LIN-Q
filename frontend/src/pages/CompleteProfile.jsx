import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { User, Phone, Heart, Users, Upload, Loader2, AlertCircle } from 'lucide-react'

const CompleteProfile = () => {
  // --- THIS IS THE FIX ---
  // We need the 'setUser' function from useAuth, not 'login'
  const { user, setUser } = useAuth()
  // --- END OF FIX ---
  
  const navigate = useNavigate()
  
  const [formDataState, setFormDataState] = useState({
    bloodGroup: '',
    emergencyContact: '',
    emergencyRelation: '',
    allergies: '',
    photo: null,
  })
  
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [photoPreview, setPhotoPreview] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormDataState(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormDataState(prev => ({ ...prev, photo: file }))
      setPhotoPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    const formData = new FormData()
    formData.append('blood_group', formDataState.bloodGroup)
    formData.append('emergency_contact_no', formDataState.emergencyContact)
    formData.append('emergency_contact_relation', formDataState.emergencyRelation)
    formData.append('allergies', formDataState.allergies)
    if (formDataState.photo) {
      formData.append('photo', formDataState.photo)
    }

    try {
      // --- THIS IS THE FIX ---
      // We must manually add the Authorization header because AuthContext
      // default headers can be overridden by multipart/form-data.
      const token = localStorage.getItem('accessToken');
      
      const response = await axios.post('/api/profile/patient/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}` // <-- This line was missing
        }
      })
      // --- END OF FIX ---

      // --- THIS IS THE SECOND FIX ---
      // Update user in AuthContext to mark profile as complete
      // We call 'setUser', not 'login'
      if (response.data) {
        const updatedUser = {
          ...user,
          // The backend /api/dashboard/ view will check for the profile's
          // existence, so we just need to update the flag in the frontend.
          profile_complete: true 
        }
        // Save updated user data back into context
        setUser(updatedUser) // <-- This now correctly calls setUser
      }
      // --- END OF FIX ---
      
      setIsLoading(false)
      navigate('/dashboard')

    } catch (err) {
      console.error('Error completing profile:', err)
      if (err.response && err.response.data) {
        setErrors(err.response.data)
      } else if (err.response && err.response.status === 401) {
        setErrors({ general: 'Authentication failed. Please log in again.' })
      } else {
        setErrors({ general: 'An error occurred. Please try again.' })
      }
      setIsLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f9fafb',
      padding: '2rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '700px',
        backgroundColor: 'white',
        padding: '3rem',
        borderRadius: '12px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>Complete Your Profile</h1>
          <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
            Please fill in your medical details to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {errors.general && (
            <div style={{
              backgroundColor: '#fee2e2',
              color: '#b91c1c',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertCircle size={20} />
              <span>{errors.general}</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                backgroundColor: '#f3f4f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                {photoPreview ? (
                  <img src={photoPreview} alt="Profile Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <User size={48} style={{ color: '#9ca3af' }} />
                )}
              </div>
              <div>
                <label
                  htmlFor="photo-upload"
                  style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    padding: '0.6rem 1rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Upload size={18} />
                  Upload Photo
                </label>
                <input
                  type="file"
                  id="photo-upload"
                  name="photo"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <p style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                  PNG or JPG (Max 2MB)
                </p>
                {errors.photo && <p style={{ color: '#ef4444', fontSize: '0.8rem' }}>{errors.photo}</p>}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label htmlFor="bloodGroup" style={{ display: 'block', color: '#374151', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  Blood Group
                </label>
                <input
                  type="text"
                  id="bloodGroup"
                  name="bloodGroup"
                  value={formDataState.bloodGroup}
                  onChange={handleChange}
                  placeholder="e.g., O+"
                  style={{
                    width: '100%', padding: '0.75rem', border: `1px solid ${errors.blood_group ? '#ef4444' : '#d1d5db'}`,
                    borderRadius: '8px', fontSize: '1rem'
                  }}
                />
                {errors.blood_group && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.blood_group}</p>}
              </div>

              <div>
                <label htmlFor="emergencyContact" style={{ display: 'block', color: '#374151', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  Emergency Contact
                </label>
                <input
                  type="tel"
                  id="emergencyContact"
                  name="emergencyContact"
                  value={formDataState.emergencyContact}
                  onChange={handleChange}
                  placeholder="Contact number"
                  style={{
                    width: '100%', padding: '0.75rem', border: `1px solid ${errors.emergency_contact_no ? '#ef4444' : '#d1d5db'}`,
                    borderRadius: '8px', fontSize: '1rem'
                  }}
                />
                {errors.emergency_contact_no && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.emergency_contact_no}</p>}
              </div>
            </div>
            
            <div>
              <label htmlFor="emergencyRelation" style={{ display: 'block', color: '#374151', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                Emergency Contact Relation
              </label>
              <input
                type="text"
                id="emergencyRelation"
                name="emergencyRelation"
                value={formDataState.emergencyRelation}
                onChange={handleChange}
                placeholder="e.g., Spouse, Parent"
                style={{
                  width: '100%', padding: '0.75rem', border: `1px solid ${errors.emergency_contact_relation ? '#ef4444' : '#d1d5db'}`,
                  borderRadius: '8px', fontSize: '1rem'
                }}
              />
              {errors.emergency_contact_relation && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.emergency_contact_relation}</p>}
            </div>

            <div>
              <label htmlFor="allergies" style={{ display: 'block', color: '#374151', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                Allergies (if any)
              </label>
              <textarea
                id="allergies"
                name="allergies"
                value={formDataState.allergies}
                onChange={handleChange}
                placeholder="e.g., Peanuts, Penicillin"
                rows={3}
                style={{
                  width: '100%', padding: '0.75rem', border: `1px solid ${errors.allergies ? '#ef4444' : '#d1d5db'}`,
                  borderRadius: '8px', fontSize: '1rem', resize: 'vertical'
                }}
              />
              {errors.allergies && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.allergies}</p>}
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  backgroundColor: isLoading ? '#93c5fd' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                    Saving...
                  </>
                ) : (
                  'Save and Continue'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CompleteProfile