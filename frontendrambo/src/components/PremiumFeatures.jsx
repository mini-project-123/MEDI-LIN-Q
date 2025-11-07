import React, { useState } from 'react'
import { Crown, Star, Zap, Shield, Clock, Users, CheckCircle, X } from 'lucide-react'

const PremiumFeatures = ({ userRole = 'patient' }) => {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const patientFeatures = [
    {
      icon: Zap,
      title: 'Priority Booking',
      description: 'Skip the queue with instant appointment booking',
      premium: true
    },
    {
      icon: Shield,
      title: 'Advanced Health Analytics',
      description: 'AI-powered health insights and predictions',
      premium: true
    },
    {
      icon: Clock,
      title: '24/7 Telemedicine',
      description: 'Video consultations anytime, anywhere',
      premium: true
    },
    {
      icon: Users,
      title: 'Family Health Management',
      description: 'Manage health records for your entire family',
      premium: true
    }
  ]

  const doctorFeatures = [
    {
      icon: Star,
      title: 'Premium Profile',
      description: 'Featured listing and enhanced visibility',
      premium: true
    },
    {
      icon: Zap,
      title: 'Advanced Analytics',
      description: 'Detailed patient insights and performance metrics',
      premium: true
    },
    {
      icon: Shield,
      title: 'Priority Support',
      description: 'Dedicated support team and faster response',
      premium: true
    },
    {
      icon: Users,
      title: 'Patient Management Tools',
      description: 'Advanced tools for patient care and follow-up',
      premium: true
    }
  ]

  const features = userRole === 'doctor' ? doctorFeatures : patientFeatures

  const renderUpgradeModal = () => {
    if (!showUpgradeModal) return null

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '2rem',
          maxWidth: '500px',
          width: '90%',
          textAlign: 'center'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem'
          }}>
            <Crown size={40} style={{ color: 'white' }} />
          </div>

          <h2 style={{ color: '#1e293b', marginBottom: '1rem' }}>
            Upgrade to MedLinq Premium
          </h2>
          <p style={{ color: '#64748b', marginBottom: '2rem', fontSize: '1.1rem' }}>
            Unlock advanced features and get the most out of your healthcare experience
          </p>

          <div style={{ 
            backgroundColor: '#f8fafc', 
            padding: '1.5rem', 
            borderRadius: '0.75rem',
            marginBottom: '2rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <span style={{ 
                fontSize: '2rem', 
                fontWeight: 'bold', 
                color: '#1e293b',
                textDecoration: 'line-through',
                opacity: 0.5
              }}>
                ₹999
              </span>
              <span style={{ 
                fontSize: '3rem', 
                fontWeight: 'bold', 
                color: '#10b981'
              }}>
                ₹499
              </span>
              <span style={{ color: '#64748b' }}>/month</span>
            </div>
            <div style={{
              backgroundColor: '#10b981',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '2rem',
              fontSize: '0.9rem',
              fontWeight: '600',
              display: 'inline-block'
            }}>
              50% OFF - Limited Time Offer!
            </div>
          </div>

          <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem',
                  marginBottom: '1rem'
                }}>
                  <CheckCircle size={20} style={{ color: '#10b981' }} />
                  <span style={{ color: '#1e293b' }}>{feature.title}</span>
                </div>
              )
            })}
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={() => {
                alert('Redirecting to payment gateway...')
                setShowUpgradeModal(false)
              }}
              style={{
                flex: 1,
                padding: '1rem 2rem',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                border: 'none',
                borderRadius: '0.75rem',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Upgrade Now
            </button>
            <button 
              onClick={() => setShowUpgradeModal(false)}
              style={{
                padding: '1rem',
                backgroundColor: '#f3f4f6',
                color: '#64748b',
                border: 'none',
                borderRadius: '0.75rem',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card" style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      marginTop: '2rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <Crown size={24} style={{ color: '#fbbf24' }} />
        <h3 style={{ margin: 0 }}>Unlock Premium Features</h3>
      </div>

      <div className="grid grid-2" style={{ gap: '1rem', marginBottom: '2rem' }}>
        {features.map((feature, index) => {
          const Icon = feature.icon
          return (
            <div key={index} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem',
              padding: '0.75rem',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '0.5rem'
            }}>
              <Icon size={20} style={{ color: '#fbbf24' }} />
              <div>
                <p style={{ margin: 0, fontWeight: '500', fontSize: '0.9rem' }}>
                  {feature.title}
                </p>
                <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.8 }}>
                  {feature.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ textAlign: 'center' }}>
        <button 
          onClick={() => setShowUpgradeModal(true)}
          style={{
            padding: '1rem 2rem',
            backgroundColor: '#fbbf24',
            color: '#1e293b',
            border: 'none',
            borderRadius: '0.75rem',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            margin: '0 auto'
          }}
        >
          <Crown size={20} />
          Upgrade to Premium
        </button>
        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', opacity: 0.8 }}>
          Starting at ₹499/month • Cancel anytime
        </p>
      </div>

      {renderUpgradeModal()}
    </div>
  )
}

export default PremiumFeatures