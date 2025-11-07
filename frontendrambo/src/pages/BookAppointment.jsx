import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Calendar, Clock, Building2, User, Search, MapPin } from 'lucide-react'
import axios from 'axios'

const BookAppointment = () => {
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [hospitals, setHospitals] = useState([])
  const [doctors, setDoctors] = useState([])
  const [availableSlots, setAvailableSlots] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
  const [bookingData, setBookingData] = useState({
    hospitalId: '',
    doctorId: '',
    date: '',
    timeSlot: '',
    reason: '',
    notes: ''
  })

  useEffect(() => {
    fetchHospitals()
  }, [])

  const fetchHospitals = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/hospitals/')
      setHospitals(response.data)
    } catch (error) {
      console.error('Error fetching hospitals:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDoctors = async (hospitalId) => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/hospitals/${hospitalId}/doctors/`)
      setDoctors(response.data)
    } catch (error) {
      console.error('Error fetching doctors:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableSlots = async (doctorId, date) => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/doctors/${doctorId}/available-slots/?date=${date}`)
      setAvailableSlots(response.data)
    } catch (error) {
      console.error('Error fetching available slots:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleHospitalSelect = (hospitalId) => {
    setBookingData(prev => ({ ...prev, hospitalId, doctorId: '', date: '', timeSlot: '' }))
    fetchDoctors(hospitalId)
    setStep(2)
  }

  const handleDoctorSelect = (doctorId) => {
    setBookingData(prev => ({ ...prev, doctorId, date: '', timeSlot: '' }))
    setStep(3)
  }

  const handleDateSelect = (date) => {
    setBookingData(prev => ({ ...prev, date, timeSlot: '' }))
    fetchAvailableSlots(bookingData.doctorId, date)
    setStep(4)
  }

  const handleTimeSlotSelect = (timeSlot) => {
    setBookingData(prev => ({ ...prev, timeSlot }))
    setStep(5)
  }

  const handleBookingSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const response = await axios.post('/api/appointments/', bookingData)
      
      if (response.status === 201) {
        alert('Appointment booked successfully!')
        // Reset form
        setBookingData({
          hospitalId: '',
          doctorId: '',
          date: '',
          timeSlot: '',
          reason: '',
          notes: ''
        })
        setStep(1)
      }
    } catch (error) {
      console.error('Error booking appointment:', error)
      alert('Failed to book appointment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const filteredHospitals = hospitals.filter(hospital =>
    hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hospital.address.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const renderStepIndicator = () => (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      marginBottom: '2rem',
      gap: '1rem'
    }}>
      {[1, 2, 3, 4, 5].map((stepNum) => (
        <div
          key={stepNum}
          style={{
            width: '2rem',
            height: '2rem',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: step >= stepNum ? '#3b82f6' : '#e5e7eb',
            color: step >= stepNum ? 'white' : '#6b7280',
            fontWeight: '500'
          }}
        >
          {stepNum}
        </div>
      ))}
    </div>
  )

  const renderHospitalSelection = () => (
    <div className="card">
      <h3 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>
        <Building2 size={24} style={{ display: 'inline', marginRight: '0.5rem' }} />
        Select Hospital
      </h3>
      
      <div className="form-group">
        <div style={{ position: 'relative' }}>
          <Search size={20} style={{ 
            position: 'absolute', 
            left: '0.75rem', 
            top: '50%', 
            transform: 'translateY(-50%)',
            color: '#6b7280'
          }} />
          <input
            type="text"
            placeholder="Search hospitals by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>
      </div>

      <div className="grid grid-2" style={{ gap: '1rem' }}>
        {filteredHospitals.map((hospital) => (
          <div
            key={hospital.id}
            onClick={() => handleHospitalSelect(hospital.id)}
            style={{
              padding: '1.5rem',
              border: '2px solid #e5e7eb',
              borderRadius: '0.75rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              backgroundColor: 'white'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = '#3b82f6'
              e.target.style.backgroundColor = '#f8fafc'
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = '#e5e7eb'
              e.target.style.backgroundColor = 'white'
            }}
          >
            <h4 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>{hospital.name}</h4>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              <MapPin size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
              {hospital.address}
            </p>
            <p style={{ color: '#3b82f6', fontSize: '0.9rem', fontWeight: '500' }}>
              {hospital.doctorCount || 0} doctors available
            </p>
          </div>
        ))}
      </div>
    </div>
  )

  const renderDoctorSelection = () => (
    <div className="card">
      <h3 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>
        <User size={24} style={{ display: 'inline', marginRight: '0.5rem' }} />
        Select Doctor
      </h3>
      
      <div className="form-group">
        <div style={{ position: 'relative' }}>
          <Search size={20} style={{ 
            position: 'absolute', 
            left: '0.75rem', 
            top: '50%', 
            transform: 'translateY(-50%)',
            color: '#6b7280'
          }} />
          <input
            type="text"
            placeholder="Search doctors by name or specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>
      </div>

      <div className="grid grid-2" style={{ gap: '1rem' }}>
        {filteredDoctors.map((doctor) => (
          <div
            key={doctor.id}
            onClick={() => handleDoctorSelect(doctor.id)}
            style={{
              padding: '1.5rem',
              border: '2px solid #e5e7eb',
              borderRadius: '0.75rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              backgroundColor: 'white'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = '#3b82f6'
              e.target.style.backgroundColor = '#f8fafc'
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = '#e5e7eb'
              e.target.style.backgroundColor = 'white'
            }}
          >
            <h4 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>Dr. {doctor.name}</h4>
            <p style={{ color: '#3b82f6', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.5rem' }}>
              {doctor.specialization}
            </p>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              Experience: {doctor.experience || 'N/A'} years
            </p>
            <p style={{ color: '#10b981', fontSize: '0.9rem', fontWeight: '500' }}>
              Available today
            </p>
          </div>
        ))}
      </div>

      <button
        onClick={() => setStep(1)}
        className="btn btn-secondary mt-4"
      >
        Back to Hospitals
      </button>
    </div>
  )

  const renderDateSelection = () => {
    const today = new Date()
    const dates = []
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      dates.push(date)
    }

    return (
      <div className="card">
        <h3 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>
          <Calendar size={24} style={{ display: 'inline', marginRight: '0.5rem' }} />
          Select Date
        </h3>
        
        <div className="grid grid-3" style={{ gap: '1rem' }}>
          {dates.map((date) => (
            <div
              key={date.toISOString()}
              onClick={() => handleDateSelect(date.toISOString().split('T')[0])}
              style={{
                padding: '1rem',
                border: '2px solid #e5e7eb',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s',
                backgroundColor: 'white'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = '#3b82f6'
                e.target.style.backgroundColor = '#f8fafc'
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = '#e5e7eb'
                e.target.style.backgroundColor = 'white'
              }}
            >
              <p style={{ color: '#1e293b', fontWeight: '500' }}>
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </p>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            </div>
          ))}
        </div>

        <button
          onClick={() => setStep(2)}
          className="btn btn-secondary mt-4"
        >
          Back to Doctors
        </button>
      </div>
    )
  }

  const renderTimeSlotSelection = () => (
    <div className="card">
      <h3 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>
        <Clock size={24} style={{ display: 'inline', marginRight: '0.5rem' }} />
        Select Time Slot
      </h3>
      
      {availableSlots.length > 0 ? (
        <div className="grid grid-3" style={{ gap: '1rem' }}>
          {availableSlots.map((slot) => (
            <div
              key={slot.time}
              onClick={() => handleTimeSlotSelect(slot.time)}
              style={{
                padding: '1rem',
                border: '2px solid #e5e7eb',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s',
                backgroundColor: slot.available ? 'white' : '#f3f4f6',
                opacity: slot.available ? 1 : 0.5
              }}
              onMouseEnter={(e) => {
                if (slot.available) {
                  e.target.style.borderColor = '#3b82f6'
                  e.target.style.backgroundColor = '#f8fafc'
                }
              }}
              onMouseLeave={(e) => {
                if (slot.available) {
                  e.target.style.borderColor = '#e5e7eb'
                  e.target.style.backgroundColor = 'white'
                }
              }}
            >
              <p style={{ color: '#1e293b', fontWeight: '500' }}>
                {slot.time}
              </p>
              <p style={{ 
                color: slot.available ? '#10b981' : '#ef4444', 
                fontSize: '0.8rem' 
              }}>
                {slot.available ? 'Available' : 'Booked'}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>
          No available slots for this date. Please select another date.
        </p>
      )}

      <button
        onClick={() => setStep(3)}
        className="btn btn-secondary mt-4"
      >
        Back to Dates
      </button>
    </div>
  )

  const renderBookingConfirmation = () => (
    <div className="card">
      <h3 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>
        Confirm Appointment Details
      </h3>
      
      <form onSubmit={handleBookingSubmit}>
        <div className="form-group">
          <label className="form-label">Reason for Visit</label>
          <input
            type="text"
            value={bookingData.reason}
            onChange={(e) => setBookingData(prev => ({ ...prev, reason: e.target.value }))}
            className="form-input"
            placeholder="Brief description of your concern"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Additional Notes (Optional)</label>
          <textarea
            value={bookingData.notes}
            onChange={(e) => setBookingData(prev => ({ ...prev, notes: e.target.value }))}
            className="form-input"
            placeholder="Any additional information for the doctor"
            rows="3"
          />
        </div>

        <div style={{ 
          backgroundColor: '#f8fafc', 
          padding: '1.5rem', 
          borderRadius: '0.5rem',
          marginBottom: '1.5rem'
        }}>
          <h4 style={{ color: '#1e293b', marginBottom: '1rem' }}>Appointment Summary</h4>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            <p><strong>Date:</strong> {new Date(bookingData.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> {bookingData.timeSlot}</p>
            <p><strong>Doctor:</strong> Dr. {doctors.find(d => d.id === bookingData.doctorId)?.name}</p>
            <p><strong>Hospital:</strong> {hospitals.find(h => h.id === bookingData.hospitalId)?.name}</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            type="button"
            onClick={() => setStep(4)}
            className="btn btn-secondary"
          >
            Back to Time Slots
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-success"
            style={{ flex: 1 }}
          >
            {loading ? 'Booking...' : 'Confirm Appointment'}
          </button>
        </div>
      </form>
    </div>
  )

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>
          Book New Appointment
        </h1>
        <p style={{ color: '#64748b' }}>
          Follow the steps below to book your appointment with a doctor
        </p>
      </div>

      {renderStepIndicator()}

      {loading && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          padding: '2rem' 
        }}>
          <div>Loading...</div>
        </div>
      )}

      {!loading && step === 1 && renderHospitalSelection()}
      {!loading && step === 2 && renderDoctorSelection()}
      {!loading && step === 3 && renderDateSelection()}
      {!loading && step === 4 && renderTimeSlotSelection()}
      {!loading && step === 5 && renderBookingConfirmation()}
    </div>
  )
}

export default BookAppointment