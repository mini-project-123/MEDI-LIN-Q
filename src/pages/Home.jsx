import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Calendar, Users, Building2, Clock, Heart, Brain, Eye, Bone, Baby, Stethoscope, ChevronLeft, ChevronRight, Star, Phone, Mail, MapPin, Send } from 'lucide-react'

const Home = () => {
  const { user } = useAuth()
  const [currentSpecialty, setCurrentSpecialty] = useState(0)
  const [currentDoctor, setCurrentDoctor] = useState(0)
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })

  const specialties = [
    { name: 'Cardiology', icon: Heart, description: 'Heart and cardiovascular care', doctors: '50+ Specialists', color: '#ef4444' },
    { name: 'Neurology', icon: Brain, description: 'Brain and nervous system', doctors: '30+ Specialists', color: '#8b5cf6' },
    { name: 'Ophthalmology', icon: Eye, description: 'Eye care and vision', doctors: '25+ Specialists', color: '#06b6d4' },
    { name: 'Orthopedics', icon: Bone, description: 'Bone and joint care', doctors: '40+ Specialists', color: '#f59e0b' },
    { name: 'Pediatrics', icon: Baby, description: 'Child healthcare', doctors: '35+ Specialists', color: '#10b981' },
    { name: 'General Medicine', icon: Stethoscope, description: 'Primary healthcare', doctors: '60+ Specialists', color: '#3b82f6' },
    { name: 'Dermatology', icon: Users, description: 'Skin and hair care', doctors: '20+ Specialists', color: '#f97316' },
    { name: 'Psychiatry', icon: Brain, description: 'Mental health care', doctors: '15+ Specialists', color: '#ec4899' }
  ]

  const featuredDoctors = [
    {
      name: 'Dr. Sarah Johnson',
      specialty: 'Cardiologist',
      experience: '15 years',
      rating: 4.9,
      reviews: 1250,
      hospital: 'City General Hospital',
      image: '/api/placeholder/150/150'
    },
    {
      name: 'Dr. Michael Chen',
      specialty: 'Neurologist',
      experience: '12 years',
      rating: 4.8,
      reviews: 980,
      hospital: 'Metro Medical Center',
      image: '/api/placeholder/150/150'
    },
    {
      name: 'Dr. Emily Rodriguez',
      specialty: 'Pediatrician',
      experience: '10 years',
      rating: 4.9,
      reviews: 1100,
      hospital: 'Children\'s Hospital',
      image: '/api/placeholder/150/150'
    },
    {
      name: 'Dr. David Kumar',
      specialty: 'Orthopedic Surgeon',
      experience: '18 years',
      rating: 4.7,
      reviews: 850,
      hospital: 'Bone & Joint Institute',
      image: '/api/placeholder/150/150'
    },
    {
      name: 'Dr. Lisa Thompson',
      specialty: 'Dermatologist',
      experience: '8 years',
      rating: 4.8,
      reviews: 720,
      hospital: 'Skin Care Clinic',
      image: '/api/placeholder/150/150'
    }
  ]

  useEffect(() => {
    const specialtyInterval = setInterval(() => {
      setCurrentSpecialty((prev) => (prev + 1) % Math.ceil(specialties.length / 4))
    }, 4000)

    const doctorInterval = setInterval(() => {
      setCurrentDoctor((prev) => (prev + 1) % Math.ceil(featuredDoctors.length / 3))
    }, 5000)

    return () => {
      clearInterval(specialtyInterval)
      clearInterval(doctorInterval)
    }
  }, [])

  const handleContactSubmit = (e) => {
    e.preventDefault()
    // Handle contact form submission
    console.log('Contact form submitted:', contactForm)
    alert('Thank you for your message! We\'ll get back to you soon.')
    setContactForm({ name: '', email: '', phone: '', message: '' })
  }

  const nextSpecialty = () => {
    setCurrentSpecialty((prev) => (prev + 1) % Math.ceil(specialties.length / 4))
  }

  const prevSpecialty = () => {
    setCurrentSpecialty((prev) => (prev - 1 + Math.ceil(specialties.length / 4)) % Math.ceil(specialties.length / 4))
  }

  const nextDoctor = () => {
    setCurrentDoctor((prev) => (prev + 1) % Math.ceil(featuredDoctors.length / 3))
  }

  const prevDoctor = () => {
    setCurrentDoctor((prev) => (prev - 1 + Math.ceil(featuredDoctors.length / 3)) % Math.ceil(featuredDoctors.length / 3))
  }

  return (
    <div>
      {/* Hero Section */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '4rem 0',
        textAlign: 'center'
      }}>
        <div className="container">
          <h1 style={{ 
            fontSize: '3.5rem', 
            fontWeight: 'bold', 
            marginBottom: '1rem',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            Your Health, Our Priority
          </h1>
          <p style={{ 
            fontSize: '1.5rem', 
            marginBottom: '2rem',
            maxWidth: '700px',
            margin: '0 auto 2rem',
            opacity: 0.9
          }}>
            Connect with 500+ verified doctors across 50+ specialties. 
            Book appointments instantly, manage prescriptions, and track your health journey.
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '3rem' }}>
            {!user && (
              <>
                <Link to="/signup" className="btn" style={{ 
                  fontSize: '1.2rem',
                  padding: '1rem 2rem',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50px',
                  fontWeight: '600',
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)'
                }}>
                  Get Started Free
                </Link>
                <Link to="/login" className="btn" style={{ 
                  fontSize: '1.2rem',
                  padding: '1rem 2rem',
                  backgroundColor: 'transparent',
                  color: 'white',
                  border: '2px solid white',
                  borderRadius: '50px',
                  fontWeight: '600'
                }}>
                  Sign In
                </Link>
              </>
            )}
            
            {user && user.role === 'patient' && (
              <Link to="/book-appointment" className="btn" style={{ 
                fontSize: '1.2rem',
                padding: '1rem 2rem',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                fontWeight: '600',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)'
              }}>
                Book Appointment Now
              </Link>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-3" style={{ gap: '2rem', maxWidth: '600px', margin: '0 auto' }}>
            <div>
              <h3 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>500+</h3>
              <p style={{ opacity: 0.9 }}>Verified Doctors</p>
            </div>
            <div>
              <h3 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>50+</h3>
              <p style={{ opacity: 0.9 }}>Specialties</p>
            </div>
            <div>
              <h3 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>10K+</h3>
              <p style={{ opacity: 0.9 }}>Happy Patients</p>
            </div>
          </div>
        </div>
      </div>

      {/* Medical Specialties Slider */}
      <div style={{ padding: '4rem 0', backgroundColor: '#f8fafc' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '1rem' }}>
              Find Specialists for Every Health Need
            </h2>
            <p style={{ fontSize: '1.2rem', color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>
              Our network of expert doctors covers all major medical specialties
            </p>
          </div>

          <div style={{ position: 'relative' }}>
            <button
              onClick={prevSpecialty}
              style={{
                position: 'absolute',
                left: '-20px',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10,
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
            >
              <ChevronLeft size={24} />
            </button>

            <div style={{ overflow: 'hidden' }}>
              <div style={{
                display: 'flex',
                transform: `translateX(-${currentSpecialty * 100}%)`,
                transition: 'transform 0.5s ease-in-out'
              }}>
                {Array.from({ length: Math.ceil(specialties.length / 4) }).map((_, slideIndex) => (
                  <div key={slideIndex} style={{ minWidth: '100%', display: 'flex', gap: '1.5rem' }}>
                    {specialties.slice(slideIndex * 4, (slideIndex + 1) * 4).map((specialty, index) => {
                      const Icon = specialty.icon
                      return (
                        <div key={index} className="card" style={{ 
                          flex: 1,
                          textAlign: 'center',
                          padding: '2rem',
                          cursor: 'pointer',
                          transition: 'transform 0.3s ease',
                          border: '2px solid transparent'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'translateY(-5px)'
                          e.target.style.borderColor = specialty.color
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0)'
                          e.target.style.borderColor = 'transparent'
                        }}>
                          <Icon size={60} style={{ color: specialty.color, margin: '0 auto 1rem' }} />
                          <h3 style={{ marginBottom: '0.5rem', color: '#1e293b', fontSize: '1.3rem' }}>
                            {specialty.name}
                          </h3>
                          <p style={{ color: '#64748b', marginBottom: '0.5rem' }}>
                            {specialty.description}
                          </p>
                          <p style={{ color: specialty.color, fontWeight: '600', fontSize: '0.9rem' }}>
                            {specialty.doctors}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={nextSpecialty}
              style={{
                position: 'absolute',
                right: '-20px',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10,
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Featured Doctors Slider */}
      <div style={{ padding: '4rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '1rem' }}>
              Meet Our Top-Rated Doctors
            </h2>
            <p style={{ fontSize: '1.2rem', color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>
              Experienced professionals with thousands of successful treatments
            </p>
          </div>

          <div style={{ position: 'relative' }}>
            <button
              onClick={prevDoctor}
              style={{
                position: 'absolute',
                left: '-20px',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10,
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
            >
              <ChevronLeft size={24} />
            </button>

            <div style={{ overflow: 'hidden' }}>
              <div style={{
                display: 'flex',
                transform: `translateX(-${currentDoctor * 100}%)`,
                transition: 'transform 0.5s ease-in-out'
              }}>
                {Array.from({ length: Math.ceil(featuredDoctors.length / 3) }).map((_, slideIndex) => (
                  <div key={slideIndex} style={{ minWidth: '100%', display: 'flex', gap: '2rem' }}>
                    {featuredDoctors.slice(slideIndex * 3, (slideIndex + 1) * 3).map((doctor, index) => (
                      <div key={index} className="card" style={{ 
                        flex: 1,
                        textAlign: 'center',
                        padding: '2rem',
                        cursor: 'pointer',
                        transition: 'transform 0.3s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.transform = 'translateY(-5px)'}
                      onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}>
                        <div style={{
                          width: '120px',
                          height: '120px',
                          borderRadius: '50%',
                          backgroundColor: '#e5e7eb',
                          margin: '0 auto 1rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '2rem',
                          fontWeight: 'bold',
                          color: '#64748b'
                        }}>
                          {doctor.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <h3 style={{ marginBottom: '0.5rem', color: '#1e293b', fontSize: '1.3rem' }}>
                          {doctor.name}
                        </h3>
                        <p style={{ color: '#3b82f6', fontWeight: '600', marginBottom: '0.5rem' }}>
                          {doctor.specialty}
                        </p>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>
                          {doctor.experience} experience • {doctor.hospital}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                          <Star size={16} style={{ color: '#fbbf24', fill: '#fbbf24' }} />
                          <span style={{ fontWeight: '600', color: '#1e293b' }}>{doctor.rating}</span>
                          <span style={{ color: '#64748b', fontSize: '0.9rem' }}>({doctor.reviews} reviews)</span>
                        </div>
                        <button className="btn btn-primary" style={{ width: '100%' }}>
                          Book Appointment
                        </button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={nextDoctor}
              style={{
                position: 'absolute',
                right: '-20px',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10,
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Why Choose Us */}
      <div style={{ padding: '4rem 0', backgroundColor: '#f8fafc' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '1rem' }}>
              Why 10,000+ Patients Trust MedLinq
            </h2>
          </div>

          <div className="grid grid-3" style={{ gap: '2rem' }}>
            <div className="card text-center" style={{ padding: '2rem' }}>
              <Building2 size={60} style={{ color: '#3b82f6', margin: '0 auto 1rem' }} />
              <h3 style={{ marginBottom: '1rem', color: '#1e293b' }}>50+ Partner Hospitals</h3>
              <p style={{ color: '#64748b' }}>
                Access to the largest network of hospitals and clinics in your area.
              </p>
            </div>
            
            <div className="card text-center" style={{ padding: '2rem' }}>
              <Clock size={60} style={{ color: '#10b981', margin: '0 auto 1rem' }} />
              <h3 style={{ marginBottom: '1rem', color: '#1e293b' }}>24/7 Availability</h3>
              <p style={{ color: '#64748b' }}>
                Book appointments anytime, anywhere. Emergency consultations available.
              </p>
            </div>
            
            <div className="card text-center" style={{ padding: '2rem' }}>
              <Star size={60} style={{ color: '#f59e0b', margin: '0 auto 1rem' }} />
              <h3 style={{ marginBottom: '1rem', color: '#1e293b' }}>4.8/5 Rating</h3>
              <p style={{ color: '#64748b' }}>
                Rated excellent by thousands of patients for quality care and service.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div style={{ padding: '4rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '1rem' }}>
              What Our Patients Say
            </h2>
          </div>

          <div className="grid grid-3" style={{ gap: '2rem' }}>
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', marginBottom: '1rem' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} style={{ color: '#fbbf24', fill: '#fbbf24' }} />
                ))}
              </div>
              <p style={{ color: '#64748b', marginBottom: '1rem', fontStyle: 'italic' }}>
                "MedLinq made it so easy to find and book with a cardiologist. The entire process was smooth and the doctor was excellent!"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#3b82f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold'
                }}>
                  R
                </div>
                <div>
                  <p style={{ fontWeight: '600', color: '#1e293b' }}>Rajesh Kumar</p>
                  <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Patient</p>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', marginBottom: '1rem' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} style={{ color: '#fbbf24', fill: '#fbbf24' }} />
                ))}
              </div>
              <p style={{ color: '#64748b', marginBottom: '1rem', fontStyle: 'italic' }}>
                "As a working mother, MedLinq's online booking saved me so much time. Great doctors and excellent service!"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#ec4899',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold'
                }}>
                  P
                </div>
                <div>
                  <p style={{ fontWeight: '600', color: '#1e293b' }}>Priya Sharma</p>
                  <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Patient</p>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', marginBottom: '1rem' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} style={{ color: '#fbbf24', fill: '#fbbf24' }} />
                ))}
              </div>
              <p style={{ color: '#64748b', marginBottom: '1rem', fontStyle: 'italic' }}>
                "The prescription tracking feature is amazing. I never miss my medications now. Highly recommended!"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold'
                }}>
                  A
                </div>
                <div>
                  <p style={{ fontWeight: '600', color: '#1e293b' }}>Amit Patel</p>
                  <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Patient</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Us Section */}
      <div style={{ padding: '4rem 0', backgroundColor: '#1e293b', color: 'white' }}>
        <div className="container">
          <div className="grid grid-2" style={{ gap: '4rem', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                Get in Touch
              </h2>
              <p style={{ fontSize: '1.2rem', marginBottom: '2rem', opacity: 0.9 }}>
                Have questions? Need help? Our support team is here for you 24/7.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <Phone size={24} style={{ color: '#10b981' }} />
                  <div>
                    <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Call Us</p>
                    <p style={{ opacity: 0.9 }}>+91 1800-123-4567</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <Mail size={24} style={{ color: '#10b981' }} />
                  <div>
                    <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Email Us</p>
                    <p style={{ opacity: 0.9 }}>support@medlinq.com</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <MapPin size={24} style={{ color: '#10b981' }} />
                  <div>
                    <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Visit Us</p>
                    <p style={{ opacity: 0.9 }}>123 Healthcare Street, Medical District, Mumbai 400001</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card" style={{ backgroundColor: 'white', color: '#1e293b' }}>
              <h3 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Send us a Message</h3>
              <form onSubmit={handleContactSubmit}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                    className="form-input"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                    className="form-input"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                    className="form-input"
                    placeholder="Enter your phone number"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea
                    value={contactForm.message}
                    onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                    className="form-input"
                    placeholder="How can we help you?"
                    rows="4"
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ 
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}>
                  <Send size={16} />
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div style={{ padding: '3rem 0', backgroundColor: '#10b981', color: 'white', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            Ready to Take Control of Your Health?
          </h2>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem', opacity: 0.9 }}>
            Join thousands of satisfied patients who trust MedLinq for their healthcare needs.
          </p>
          {!user && (
            <Link to="/signup" className="btn" style={{ 
              fontSize: '1.2rem',
              padding: '1rem 2rem',
              backgroundColor: 'white',
              color: '#10b981',
              border: 'none',
              borderRadius: '50px',
              fontWeight: '600'
            }}>
              Start Your Health Journey Today
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default Home