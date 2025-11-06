import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { UserPlus, Mail, Lock, User } from 'lucide-react'

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    name: '', // For admin (hospital name)
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient',
    // Doctor specific fields
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

    // Combine first and last name for patients and doctors
    const submitData = { ...formData }
    if (formData.role !== 'admin') {
      submitData.name = `${formData.firstName} ${formData.lastName}`.trim()
    } else {
      submitData.name = formData.hospitalName
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
    switch (formData.role) {
      case 'doctor':
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
      case 'admin':
        return null // Admin fields are handled in the main form
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

          {formData.role === 'admin' ? (
            // Admin form - only hospital name, email, password
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
            </>
          ) : (
            // Patient and Doctor form - separate first and last name
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
            </>
          )}

          {formData.role === 'admin' ? (
            // Admin - single password field
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
          ) : (
            // Patient and Doctor - password and confirm password
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