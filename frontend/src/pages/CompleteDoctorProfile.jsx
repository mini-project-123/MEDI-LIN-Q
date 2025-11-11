import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext' 
import axios from 'axios'
// --- IMPORT ICONS ---
import { User, Award, Calendar, Languages, Save, AlertCircle, MapPin, Phone, UserCheck, Mail, Building2, Loader2 } from 'lucide-react'

export const CompleteDoctorProfile = () => {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()

  // --- ALL FIELDS FROM YOUR DRAWING ---
  const [formData, setFormData] = useState({
    // Autofill fields (now editable for User model update)
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    hospital: user?.hospitalId || '', // The numeric ID from Signup
    
    // User-filled fields
    contact_no: '',
    date_of_birth: '',
    address: '',
    gender: 'Male',
    
    // DoctorProfile fields
    specialization: '',
    qualification: '',
    experience_years: '',
    available_days: '',
    languages_spoken: '',
    photo: null,
  })
  
  const [hospitalName, setHospitalName] = useState('');
  
  const [initialLoading, setInitialLoading] = useState(true) 
  const [saving, setSaving] = useState(false); 
  const [error, setError] = useState(null)

  // --- Fetch Hospital Name on Load ---
  useEffect(() => {
    if (!user?.hospitalId) {
      setError("Hospital ID not found from signup. Please log out and sign up again.");
      setInitialLoading(false);
      return;
    }
    
    const fetchHospitalName = async () => {
      setInitialLoading(true)
      setError(null);
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get('http://127.0.0.1:8000/api/booking/hospitals/', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        // Find the hospital that matches the User ID stored during signup
        const hospital = response.data.find(h => h.id.toString() === user.hospitalId.toString());
        
        if (hospital) {
          setHospitalName(hospital.name);
        } else {
          setError(`Error: Hospital not found for ID ${user.hospitalId}.`);
        }
        
      } catch (err) {
        console.error("Failed to fetch hospitals", err)
        setError('Failed to fetch hospital list. Check your database sync.')
      } finally {
        setInitialLoading(false)
      }
    }
    
    fetchHospitalName()
  }, [user?.hospitalId]) 

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
    setSaving(true)

    const token = localStorage.getItem('accessToken')
    
    const profileData = new FormData()
    
    // --- Add ALL required fields to FormData ---
    profileData.append('first_name', formData.firstName)
    profileData.append('last_name', formData.lastName)
    profileData.append('email', formData.email)
    profileData.append('gender', formData.gender)
    profileData.append('contact_no', formData.contact_no)
    profileData.append('date_of_birth', formData.date_of_birth)
    profileData.append('address', formData.address)
    profileData.append('specialization', formData.specialization)
    profileData.append('qualification', formData.qualification)
    profileData.append('experience_years', formData.experience_years)
    profileData.append('available_days', formData.available_days)
    profileData.append('languages_spoken', formData.languages_spoken)
    profileData.append('hospital', formData.hospital) // Send the ID
    
    if (formData.photo) {
      profileData.append('photo', formData.photo)
    }

    try {
      // THIS WILL FAIL IF DATABASE IS NOT SYNCED
      await axios.post('http://127.0.0.1:8000/api/profile/doctor/', profileData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })
      
      alert('Profile completed successfully! Welcome, Doctor.')
      
      const updatedUser = { ...user, profile_complete: true };
      setUser(updatedUser); 
      
      navigate('/dashboard')

    } catch (err) {
      console.error("Profile completion failed", err)
      if (err.response && err.response.data) {
        const errors = err.response.data;
        let errorMsg = "Please check your input.\n";
        const firstErrorKey = Object.keys(errors).find(k => k !== 'detail');
        if (firstErrorKey && Array.isArray(errors[firstErrorKey])) {
           errorMsg = `Error in ${firstErrorKey}: ${errors[firstErrorKey][0]}\n`;
        } else if (errors.detail) {
           errorMsg = errors.detail;
        } else {
            errorMsg = JSON.stringify(errors, null, 2);
        }
        setError(errorMsg);
      } else {
        setError('An unknown error occurred. Please try again.')
      }
      setSaving(false)
    }
  }

  // --- Style for disabled inputs ---
  const disabledInputStyle = {
    backgroundColor: '#f3f4f6',
    color: '#6b7280',
    cursor: 'not-allowed'
  };

  if (initialLoading) {
      return (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
              <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
          </div>
      );
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
            Please fill in your professional and personal details to activate your account.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="error mb-4" style={{ 
              backgroundColor: '#fee2e2', 
              color: '#b91c1c', 
              padding: '1rem', 
              borderRadius: '0.5rem',
              whiteSpace: 'pre-wrap'
            }}>
              <AlertCircle size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
              {error}
            </div>
          )}

          {/* Personal Details - Autofilled/Editable */}
          <h4 style={{ color: '#1e293b', marginBottom: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>
            Personal Details
          </h4>
          
          <div className="grid grid-2" style={{ gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="form-input" required />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="form-input" required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-input" required />
          </div>
          
          <div className="grid grid-2" style={{ gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">
                <Phone size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Contact No
              </label>
              <input type="tel" name="contact_no" value={formData.contact_no} onChange={handleChange} className="form-input" placeholder="e.g., +91..." required />
            </div>
            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} className="form-input" required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">
                <UserCheck size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Gender
            </label>
            <select name="gender" value={formData.gender} onChange={handleChange} className="form-input" required>
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
            <textarea name="address" value={formData.address} onChange={handleChange} className="form-input" placeholder="Your residential address" rows="3" />
          </div>


          {/* Professional Details - Editable */}
          <h4 style={{ color: '#1e293b', margin: '2rem 0 1rem 0', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>
            Professional Details
          </h4>

          <div className="form-group">
            <label className="form-label">Hospital Name</label>
            <input type="text" name="hospitalName" value={hospitalName || "Hospital Not Found"} className="form-input" disabled style={disabledInputStyle} />
          </div>
          
          <div className="grid grid-2" style={{ gap: '1rem', gridColumn: '1 / -1' }}>
            <div className="form-group">
              <label className="form-label">
                <Award size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Specialization
              </label>
              <input type="text" name="specialization" value={formData.specialization} onChange={handleChange} className="form-input" placeholder="e.g., Cardiology" required />
            </div>
            <div className="form-group">
              <label className="form-label">Qualification</label>
              <input type="text" name="qualification" value={formData.qualification} onChange={handleChange} className="form-input" placeholder="e.g., MD, MBBS" required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Experience (in years)</label>
            <input type="number" name="experience_years" value={formData.experience_years} onChange={handleChange} className="form-input" placeholder="e.g., 5" min="0" required />
          </div>
          <div className="grid grid-2" style={{ gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">
                <Calendar size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Available Days
              </label>
              <input type="text" name="available_days" value={formData.available_days} onChange={handleChange} className="form-input" placeholder="e.g., Mon, Wed, Fri" />
            </div>
            <div className="form-group">
              <label className="form-label">
                <Languages size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Languages Spoken
              </label>
              <input type="text" name="languages_spoken" value={formData.languages_spoken} onChange={handleChange} className="form-input" placeholder="e.g., English, Hindi" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Profile Photo (Optional)</label>
            <input type="file" name="photo" onChange={handleFileChange} className="form-input" accept="image/*" />
          </div>
          

          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save and Continue'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default CompleteDoctorProfile