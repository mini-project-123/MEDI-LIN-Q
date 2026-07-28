import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Calendar, User, LogOut } from 'lucide-react'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const displayName = user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || 'User'

  // Don't show navbar for doctors on dashboard (they have sidebar)
  if (user?.role === 'doctor' && window.location.pathname === '/dashboard') {
    return null
  }

  return (
    <nav style={{ 
      background: 'white', 
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
      padding: '1rem 0' 
    }}>
      <div className="container" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <Link 
          to="/" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            textDecoration: 'none', 
            color: '#3b82f6',
            fontSize: '1.5rem',
            fontWeight: 'bold'
          }}
        >
          <Calendar size={32} />
          Medi-Lin-Q
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {user ? (
            <>
              <Link to="/dashboard" className="btn btn-secondary">
                Dashboard
              </Link>
              {user.role === 'patient' && (
                <Link to="/book-appointment" className="btn btn-primary">
                  Book Appointment
                </Link>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={20} />
                <span>{displayName} ({user.role})</span>
              </div>
              <button 
                onClick={handleLogout}
                className="btn btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary">
                Login
              </Link>
              <Link to="/signup" className="btn btn-primary">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar