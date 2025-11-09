import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Mail, Lock, LogIn } from 'lucide-react'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'patient'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(formData)
    
    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.error)
    }
    
    setLoading(false)
  }

  return (
    <div className="container" style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '80vh',
      padding: '2rem 1rem'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="text-center mb-6">
          <LogIn size={48} style={{ color: '#3b82f6', margin: '0 auto 1rem' }} />
          <h2 style={{ marginBottom: '0.5rem', color: '#1e293b' }}>Welcome Back</h2>
          <p style={{ color: '#64748b' }}>Sign in to your account</p>
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
              placeholder="Enter your password"
              required
            />
          </div>

          {error && (
            <div className="error mb-4">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginBottom: '1rem' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center">
          <p style={{ color: '#64748b' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: '#3b82f6', textDecoration: 'none' }}>
              Sign up here
            </Link>
          </p>
        </div>

        {/* Demo Credentials */}
        <div style={{ 
          marginTop: '2rem', 
          padding: '1rem', 
          backgroundColor: '#f8fafc', 
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb'
        }}>
          <h4 style={{ color: '#1e293b', marginBottom: '1rem', fontSize: '0.9rem' }}>
            Demo Credentials (No Backend Required):
          </h4>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
            <p><strong>Doctor:</strong> doctor@medlinq.com</p>
            <p><strong>Patient:</strong> patient@medlinq.com</p>
            <p><strong>Hospital:</strong> hospital@medlinq.com</p>
            <p style={{ marginTop: '0.5rem', fontStyle: 'italic' }}>
              Password: any password works for demo
            </p>
          </div>
          
          <button
            onClick={() => {
              localStorage.removeItem('mockUsers')
              window.location.reload()
            }}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.8rem',
              width: '100%'
            }}
          >
            Reset Demo Users (if login issues)
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login