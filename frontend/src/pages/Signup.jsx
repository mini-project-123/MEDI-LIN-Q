import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { UserPlus, Mail, Lock, User } from 'lucide-react'

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient',
    // Doctor specific fields
    hospitalId: '',
    // Hospital specific fields
    hospitalName: ''
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
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Hospital role doesn't need password confirmation
    if (formData.role !== 'hospital' && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setLoading(true)

    // Set name based on role
    const submitData = { ...formData }
    if (formData.role === 'hospital') {
      submitData.name = formData.hospitalName
    } else {
      submitData.name = `${formData.firstName} ${formData.lastName}`.trim()
    }

    const result = await signup(submitData)
    
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
    if (formData.role === 'doctor') {
      return (
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
      )
    }
    return null
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
              <option value="hospital">Hospital</option>
            </select>
          </div>

          {formData.role === 'hospital' ? (
            // Hospital form - only hospital name, email, password
            <>
              <div className="form-group">
                <label className="form-label">
                  <User size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  Hospital Name
                </label>
                <input
                  type="text"
                  name="hospitalName"
                  value={formData.hospitalName}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter hospital name"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Mail size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  Hospital Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter hospital email"
                  required
                />
              </div>

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
            </>
          ) : (
            // Patient and Doctor form
            <>
              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">
                    <User size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter first name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter last name"
                    required
                  />
                </div>
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
            </>
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