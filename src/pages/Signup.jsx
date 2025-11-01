import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { UserPlus, Mail, Lock, User, Calendar, Phone, AlertTriangle } from 'lucide-react'

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient',
    dateOfBirth: '',
    age: '',
    emergencyContactName: '',
    emergencyContactNumber: '',
    allergies: '',
    // Doctor specific fields
    specialization: '',
    hospitalId: '',
    // Admin specific fields
    hospitalName: '',
    hospitalAddress: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { signup } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Auto-calculate age from date of birth
    if (name === 'dateOfBirth' && value) {
      const today = new Date()
      const birthDate = new Date(value)
      const age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        setFormData(prev => ({ ...prev, age: (age - 1).toString() }))
      } else {
        setFormData(prev => ({ ...prev, age: age.toString() }))
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setLoading(true)

    const result = await signup(formData)
    
    if (result.success) {
      // Show success message
      alert(`Welcome to MedLinq! Account created successfully for ${formData.name}.`)
      
      // For doctors, redirect to profile completion
      if (formData.role === 'doctor') {
        navigate('/dashboard?tab=profile')
      } else {
        navigate('/dashboard')
      }
    } else {
      setError(result.error)
    }
    
    setLoading(false)
  }

  const renderRoleSpecificFields = () => {
    switch (formData.role) {
      case 'doctor':
        return (
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Specialization</label>
              <select
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="">Select Specialization</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Neurology">Neurology</option>
                <option value="Ophthalmology">Ophthalmology</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="General Medicine">General Medicine</option>
                <option value="Dermatology">Dermatology</option>
                <option value="Psychiatry">Psychiatry</option>
                <option value="Gynecology">Gynecology</option>
                <option value="Oncology">Oncology</option>
                <option value="Radiology">Radiology</option>
                <option value="Anesthesiology">Anesthesiology</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Hospital ID</label>
              <input
                type="text"
                name="hospitalId"
                value={formData.hospitalId}
                onChange={handleChange}
                className="form-input"
                placeholder="Your hospital identification"
                required
              />
            </div>
          </div>
        )
      case 'admin':
        return (
          <>
            <div className="form-group">
              <label className="form-label">Hospital Name</label>
              <input
                type="text"
                name="hospitalName"
                value={formData.hospitalName}
                onChange={handleChange}
                className="form-input"
                placeholder="Name of your hospital"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Hospital Address</label>
              <textarea
                name="hospitalAddress"
                value={formData.hospitalAddress}
                onChange={handleChange}
                className="form-input"
                placeholder="Complete hospital address"
                rows="3"
                required
              />
            </div>
          </>
        )
      default:
        return null
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
          <UserPlus size={48} style={{ color: '#3b82f6', margin: '0 auto 1rem' }} />
          <h2 style={{ marginBottom: '0.5rem', color: '#1e293b' }}>Create Account</h2>
          <p style={{ color: '#64748b' }}>Join our healthcare platform</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="form-input"
              required
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="admin">Hospital Admin</option>
            </select>
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">
                <User size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Mail size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">
                <Lock size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                placeholder="Create a password"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="form-input"
                placeholder="Confirm your password"
                required
              />
            </div>
          </div>

          {formData.role !== 'doctor' && (
            <>
              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">
                    <Calendar size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Your age"
                    readOnly
                  />
                </div>
              </div>

              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Emergency Contact Name</label>
                  <input
                    type="text"
                    name="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Emergency contact person"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Phone size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                    Emergency Contact Number
                  </label>
                  <input
                    type="tel"
                    name="emergencyContactNumber"
                    value={formData.emergencyContactNumber}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Emergency contact number"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <AlertTriangle size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  Allergies (Optional)
                </label>
                <textarea
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="List any allergies or medical conditions"
                  rows="3"
                />
              </div>
            </>
          )}

          {formData.role === 'doctor' && (
            <div className="form-group">
              <label className="form-label">
                <Calendar size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Date of Birth
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
          )}

          {renderRoleSpecificFields()}

          {error && (
            <div className="error mb-4">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginBottom: '1rem' }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="text-center">
          <p style={{ color: '#64748b' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#3b82f6', textDecoration: 'none' }}>
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Signup