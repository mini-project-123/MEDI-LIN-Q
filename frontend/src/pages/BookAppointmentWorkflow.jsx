import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { Calendar, Clock, Building2, User, Search, MapPin, ArrowRight, Check, Loader2, X } from 'lucide-react'

const BookAppointmentWorkflow = () => {
  const { user } = useAuth()
  const { theme } = useTheme()
  const token = localStorage.getItem('accessToken')
  
  // Workflow state
  const [step, setStep] = useState(1)
  const [hospitals, setHospitals] = useState([])
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // Search and filter
  const [hospitalSearch, setHospitalSearch] = useState('')
  const [doctorSearch, setDoctorSearch] = useState('')
  
  // Dialog state
  const [showReasonDialog, setShowReasonDialog] = useState(false)
  const [appointmentReason, setAppointmentReason] = useState('')
  
  // Booking data
  const [bookingData, setBookingData] = useState({
    hospitalId: null,
    hospitalName: '',
    doctorId: null,
    doctorName: '',
    doctorSpecialization: '',
    appointmentDate: '',
    appointmentTime: '',
    appointmentType: 'consultation',
    reason: ''
  })

  // Fetch hospitals on mount
  useEffect(() => {
    fetchHospitals()
  }, [])

  // Fetch doctors when hospital is selected
  useEffect(() => {
    if (bookingData.hospitalId) {
      fetchDoctorsByHospital(bookingData.hospitalId)
    }
  }, [bookingData.hospitalId])

  // API: Fetch hospitals
  const fetchHospitals = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(
        'http://127.0.0.1:8000/api/booking/hospitals/',
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )
      if (!response.ok) throw new Error('Failed to fetch hospitals')
      const data = await response.json()
      setHospitals(data)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching hospitals:', err)
    } finally {
      setLoading(false)
    }
  }

  // API: Fetch doctors by hospital
  const fetchDoctorsByHospital = async (hospitalId) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/booking/hospitals/${hospitalId}/doctors/`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )
      if (!response.ok) throw new Error('Failed to fetch doctors')
      const data = await response.json()
      setDoctors(data)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching doctors:', err)
    } finally {
      setLoading(false)
    }
  }

  // Handle hospital selection
  const handleHospitalSelect = (hospital) => {
    setBookingData(prev => ({
      ...prev,
      hospitalId: hospital.id,
      hospitalName: hospital.name,
      doctorId: null,
      doctorName: '',
      appointmentDate: '',
      appointmentTime: ''
    }))
    setDoctors([])
    setStep(2)
  }

  // Handle doctor selection
  const handleDoctorSelect = (doctor) => {
    setBookingData(prev => ({
      ...prev,
      doctorId: doctor.doctor_id,
      doctorName: `${doctor.user?.first_name || ''} ${doctor.user?.last_name || ''}`,
      doctorSpecialization: doctor.specialization,
      appointmentTime: ''
    }))
    setStep(3)
  }

  // Handle slot selection (show reason dialog)
  const handleSlotSelect = (date, time) => {
    setBookingData(prev => ({
      ...prev,
      appointmentDate: date,
      appointmentTime: time
    }))
    setShowReasonDialog(true)
  }

  // Handle reason submission
  const handleReasonSubmit = () => {
    if (!appointmentReason.trim()) {
      setError('Please provide a reason for your appointment')
      return
    }
    setBookingData(prev => ({
      ...prev,
      reason: appointmentReason
    }))
    setShowReasonDialog(false)
    setStep(4)
  }

  // API: Book appointment
  const handleBookAppointment = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(
        'http://127.0.0.1:8000/api/booking/appointments/book/',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            doctor_id: bookingData.doctorId,
            hospital_id: bookingData.hospitalId,
            appointment_date: bookingData.appointmentDate,
            appointment_time: bookingData.appointmentTime,
            appointment_type: bookingData.appointmentType,
            reason: bookingData.reason
          })
        }
      )
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to book appointment')
      }
      
      const result = await response.json()
      setStep(5)
      setTimeout(() => {
        window.location.href = '/dashboard?tab=appointments'
      }, 3000)
    } catch (err) {
      setError(err.message)
      console.error('Error booking appointment:', err)
    } finally {
      setLoading(false)
    }
  }

  // Render time slots from doctor's schedule
  const renderTimeSlots = () => {
    if (!bookingData.doctorId || !doctors.length) return null
    
    const doctor = doctors.find(d => d.doctor_id === bookingData.doctorId)
    if (!doctor || !doctor.time_slots) return null
    
    // Group slots by day
    const slotsByDay = {}
    doctor.time_slots.forEach(slot => {
      if (!slotsByDay[slot.day]) slotsByDay[slot.day] = []
      slotsByDay[slot.day].push(slot)
    })
    
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    const sortedDays = Object.keys(slotsByDay).sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b))
    
    return (
      <div>
        <p style={{ marginBottom: '1rem', fontWeight: '600' }}>Available Time Slots for Dr. {doctor.user?.first_name}:</p>
        {sortedDays.map(day => (
          <div key={day} style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ marginBottom: '0.75rem', color: theme.textSecondary || '#6b7280' }}>{day}</h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: '0.75rem'
            }}>
              {slotsByDay[day].map(slot => {
                const isBooked = !slot.is_available
                return (
                  <button
                    key={`${slot.day}-${slot.start_time}`}
                    onClick={() => !isBooked && handleSlotSelect(bookingData.appointmentDate, slot.start_time)}
                    disabled={isBooked}
                    style={{
                      padding: '0.75rem',
                      border: isBooked ? `1px solid #fca5a5` : `1px solid ${theme.borderColor || '#e5e7eb'}`,
                      borderRadius: '6px',
                      backgroundColor: isBooked ? '#fee2e2' : (theme.background || '#f9fafb'),
                      cursor: isBooked ? 'not-allowed' : 'pointer',
                      fontWeight: '500',
                      transition: 'all 0.2s ease',
                      fontSize: '0.9rem',
                      color: isBooked ? '#991b1b' : (theme.textPrimary || '#111'),
                      opacity: isBooked ? 0.6 : 1
                    }}
                  >
                    <div style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                      {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                    </div>
                    <div style={{ fontSize: '0.75rem' }}>
                      {isBooked ? '❌ Booked' : '✓ Available'}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Filter functions
  const filteredHospitals = hospitals.filter(h =>
    h.name.toLowerCase().includes(hospitalSearch.toLowerCase()) ||
    (h.address && h.address.toLowerCase().includes(hospitalSearch.toLowerCase()))
  )

  const filteredDoctors = doctors.filter(d => {
    const name = `${d.user?.first_name || ''} ${d.user?.last_name || ''}`.toLowerCase()
    return (
      name.includes(doctorSearch.toLowerCase()) ||
      d.specialization.toLowerCase().includes(doctorSearch.toLowerCase())
    )
  })

  // Styles
  const styles = {
    container: {
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '2rem',
      backgroundColor: theme.background || '#f9fafb'
    },
    stepIndicator: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '3rem',
      alignItems: 'center',
      flexWrap: 'wrap'
    },
    stepItem: (isActive, isCompleted) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      borderRadius: '8px',
      backgroundColor: isActive ? theme.primary || '#3b82f6' : isCompleted ? '#d1fae5' : theme.cardBackground || '#fff',
      color: isActive ? '#fff' : isCompleted ? '#059669' : theme.textSecondary || '#6b7280',
      fontWeight: isActive || isCompleted ? '600' : '400',
      transition: 'all 0.3s ease',
      fontSize: '0.9rem'
    }),
    card: {
      backgroundColor: theme.cardBackground || '#fff',
      borderRadius: '12px',
      padding: '2rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      marginBottom: '2rem'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
      gap: '1rem',
      marginBottom: '1.5rem'
    },
    itemCard: (isSelected) => ({
      padding: '1rem',
      border: isSelected ? `2px solid ${theme.primary || '#3b82f6'}` : `1px solid ${theme.borderColor || '#e5e7eb'}`,
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      backgroundColor: isSelected ? (theme.primary || '#3b82f6') + '15' : theme.background || '#f9fafb',
      ':hover': {
        borderColor: theme.primary || '#3b82f6'
      }
    }),
    button: {
      primary: {
        backgroundColor: theme.primary || '#3b82f6',
        color: '#fff',
        padding: '0.75rem 1.5rem',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        fontWeight: '600',
        transition: 'all 0.3s ease'
      }
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      border: `1px solid ${theme.borderColor || '#e5e7eb'}`,
      borderRadius: '8px',
      fontSize: '1rem',
      marginBottom: '1rem',
      fontFamily: 'inherit'
    },
    modalBackdrop: {
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
    },
    modalContent: {
      backgroundColor: theme.cardBackground || '#fff',
      borderRadius: '12px',
      padding: '2rem',
      maxWidth: '500px',
      width: '90%',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
    }
  }

  return (
    <div style={styles.container}>
      <h1 style={{ marginBottom: '1.5rem', color: theme.textPrimary || '#111' }}>
        Book My Appointment
      </h1>

      {/* Step Indicator */}
      <div style={styles.stepIndicator}>
        {['Hospital', 'Doctor', 'Schedule', 'Confirm', 'Success'].map((title, index) => (
          <React.Fragment key={index}>
            <div style={styles.stepItem(step === index + 1, step > index + 1)}>
              {step > index + 1 ? (
                <Check size={18} />
              ) : (
                <span>{index + 1}</span>
              )}
              <span>{title}</span>
            </div>
            {index < 4 && (
              <ArrowRight
                size={16}
                color={step > index + 1 ? theme.primary || '#3b82f6' : theme.borderColor || '#e5e7eb'}
                style={{ margin: '0 0.5rem' }}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {error && (
        <div style={{
          backgroundColor: '#fee2e2',
          border: '1px solid #fca5a5',
          color: '#991b1b',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{error}</span>
          <button onClick={() => setError(null)} style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#991b1b'
          }}>
            <X size={20} />
          </button>
        </div>
      )}

      {/* Step 1: Select Hospital */}
      {step >= 1 && (
        <div style={styles.card}>
          <h2 style={{ marginBottom: '1rem' }}>Step 1: Select Hospital</h2>
          
          <input
            type="text"
            placeholder="Search hospitals..."
            value={hospitalSearch}
            onChange={(e) => setHospitalSearch(e.target.value)}
            style={styles.input}
          />

          {loading && step === 1 ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} />
            </div>
          ) : (
            <div style={styles.grid}>
              {filteredHospitals.map(hospital => (
                <div
                  key={hospital.id}
                  style={styles.itemCard(bookingData.hospitalId === hospital.id)}
                  onClick={() => handleHospitalSelect(hospital)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Building2 size={18} />
                    <strong>{hospital.name}</strong>
                  </div>
                  {hospital.contact_no1 && (
                    <div style={{ fontSize: '0.85rem', color: theme.textSecondary || '#6b7280' }}>
                      {hospital.contact_no1}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Select Doctor */}
      {step >= 2 && bookingData.hospitalId && (
        <div style={styles.card}>
          <h2 style={{ marginBottom: '1rem' }}>
            Step 2: Select Doctor from {bookingData.hospitalName}
          </h2>

          <input
            type="text"
            placeholder="Search doctors..."
            value={doctorSearch}
            onChange={(e) => setDoctorSearch(e.target.value)}
            style={styles.input}
          />

          {loading && step === 2 ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} />
            </div>
          ) : (
            <div style={styles.grid}>
              {filteredDoctors.map(doctor => (
                <div
                  key={doctor.doctor_id}
                  style={styles.itemCard(bookingData.doctorId === doctor.doctor_id)}
                  onClick={() => handleDoctorSelect(doctor)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <User size={18} />
                    <strong>Dr. {doctor.user?.first_name}</strong>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: theme.textSecondary || '#6b7280', marginBottom: '0.3rem' }}>
                    {doctor.specialization}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: theme.textSecondary || '#6b7280' }}>
                    {doctor.experience_years} yrs
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Select Date & Time Slot */}
      {step >= 3 && bookingData.doctorId && (
        <div style={styles.card}>
          <h2 style={{ marginBottom: '1.5rem' }}>
            Step 3: Select Time Slot
          </h2>
          {renderTimeSlots()}
        </div>
      )}

      {/* Step 4: Confirm Booking */}
      {step >= 4 && bookingData.appointmentTime && (
        <div style={styles.card}>
          <h2 style={{ marginBottom: '1.5rem' }}>Step 4: Confirm Your Appointment</h2>

          <div style={{
            backgroundColor: theme.background || '#f9fafb',
            padding: '1.5rem',
            borderRadius: '8px',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ fontWeight: '600', color: theme.textSecondary || '#6b7280' }}>Hospital:</label>
                <p style={{ marginTop: '0.25rem', marginBottom: 0 }}>{bookingData.hospitalName}</p>
              </div>
              <div>
                <label style={{ fontWeight: '600', color: theme.textSecondary || '#6b7280' }}>Doctor:</label>
                <p style={{ marginTop: '0.25rem', marginBottom: 0 }}>Dr. {bookingData.doctorName}</p>
                <p style={{ fontSize: '0.9rem', color: theme.textSecondary || '#6b7280', marginBottom: 0 }}>
                  {bookingData.doctorSpecialization}
                </p>
              </div>
              <div>
                <label style={{ fontWeight: '600', color: theme.textSecondary || '#6b7280' }}>Date & Time:</label>
                <p style={{ marginTop: '0.25rem', marginBottom: 0 }}>
                  {new Date(bookingData.appointmentDate).toLocaleDateString()} at {bookingData.appointmentTime}
                </p>
              </div>
              <div>
                <label style={{ fontWeight: '600', color: theme.textSecondary || '#6b7280' }}>Reason:</label>
                <p style={{ marginTop: '0.25rem', marginBottom: 0 }}>{bookingData.reason}</p>
              </div>
              <div>
                <label style={{ fontWeight: '600', color: theme.textSecondary || '#6b7280' }}>Appointment Type:</label>
                <select
                  value={bookingData.appointmentType}
                  onChange={(e) => setBookingData(prev => ({ ...prev, appointmentType: e.target.value }))}
                  style={styles.input}
                >
                  <option value="consultation">Consultation</option>
                  <option value="follow_up">Follow-up</option>
                  <option value="procedure">Procedure</option>
                </select>
              </div>
            </div>
          </div>

          <button
            onClick={handleBookAppointment}
            disabled={loading}
            style={{
              ...styles.button.primary,
              width: '100%',
              opacity: loading ? 0.5 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            {loading ? (
              <>
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                Booking...
              </>
            ) : (
              'Confirm Booking'
            )}
          </button>
        </div>
      )}

      {/* Step 5: Success */}
      {step === 5 && (
        <div style={{
          ...styles.card,
          backgroundColor: '#f0fdf4',
          border: `2px solid #22c55e`,
          textAlign: 'center'
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <Check size={48} style={{ color: '#22c55e', margin: '0 auto' }} />
          </div>
          <h2 style={{ color: '#22c55e', marginBottom: '0.5rem' }}>Appointment Booked Successfully!</h2>
          <p style={{ color: theme.textSecondary || '#6b7280', marginBottom: '0.5rem' }}>
            Your appointment with Dr. {bookingData.doctorName} is confirmed.
          </p>
          <p style={{ fontSize: '0.9rem', color: theme.textSecondary || '#6b7280' }}>
            A confirmation notification has been sent to you.
          </p>
          <p style={{ fontSize: '0.85rem', color: theme.textSecondary || '#6b7280', marginTop: '1rem' }}>
            Redirecting to appointments page...
          </p>
        </div>
      )}

      {/* Reason Dialog */}
      {showReasonDialog && (
        <div style={styles.modalBackdrop}>
          <div style={styles.modalContent}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>Reason for Appointment</h3>
              <button
                onClick={() => setShowReasonDialog(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ color: theme.textSecondary || '#6b7280', marginBottom: '1rem' }}>
              Please provide a reason for your appointment visit
            </p>

            <textarea
              value={appointmentReason}
              onChange={(e) => setAppointmentReason(e.target.value)}
              placeholder="E.g., Regular checkup, Follow-up for previous illness, etc."
              style={{
                ...styles.input,
                height: '100px',
                resize: 'none',
                fontFamily: 'inherit'
              }}
            />

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setShowReasonDialog(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: theme.borderColor || '#e5e7eb',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleReasonSubmit}
                style={{
                  flex: 1,
                  ...styles.button.primary
                }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BookAppointmentWorkflow

  
  // Workflow state
  const [step, setStep] = useState(1)
  const [hospitals, setHospitals] = useState([])
  const [doctors, setDoctors] = useState([])
  const [availableSlots, setAvailableSlots] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // Search and filter
  const [hospitalSearch, setHospitalSearch] = useState('')
  const [doctorSearch, setDoctorSearch] = useState('')
  
  // Booking data
  const [bookingData, setBookingData] = useState({
    hospitalId: null,
    hospitalName: '',
    doctorId: null,
    doctorName: '',
    doctorSpecialization: '',
    appointmentDate: new Date().toISOString().split('T')[0],
    appointmentTime: '',
    appointmentType: 'consultation'
  })

  // Fetch hospitals on mount
  useEffect(() => {
    fetchHospitals()
  }, [])

  // Fetch doctors when hospital is selected
  useEffect(() => {
    if (bookingData.hospitalId) {
      fetchDoctorsByHospital(bookingData.hospitalId)
    }
  }, [bookingData.hospitalId])

  // Fetch schedule when doctor and date are selected
  useEffect(() => {
    if (bookingData.doctorId && bookingData.appointmentDate) {
      fetchDoctorSchedule(bookingData.doctorId, bookingData.appointmentDate)
    }
  }, [bookingData.doctorId, bookingData.appointmentDate])

  // API: Fetch hospitals
  const fetchHospitals = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(
        'http://127.0.0.1:8000/api/patient/booking/workflow/hospitals/',
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )
      if (!response.ok) throw new Error('Failed to fetch hospitals')
      const data = await response.json()
      setHospitals(data)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching hospitals:', err)
    } finally {
      setLoading(false)
    }
  }

  // API: Fetch doctors by hospital
  const fetchDoctorsByHospital = async (hospitalId) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/patient/booking/workflow/doctors/?hospital_id=${hospitalId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )
      if (!response.ok) throw new Error('Failed to fetch doctors')
      const data = await response.json()
      setDoctors(data)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching doctors:', err)
    } finally {
      setLoading(false)
    }
  }

  // API: Fetch doctor schedule
  const fetchDoctorSchedule = async (doctorId, date) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/patient/booking/workflow/schedule/?doctor_id=${doctorId}&date=${date}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )
      if (!response.ok) throw new Error('Failed to fetch schedule')
      const data = await response.json()
      setAvailableSlots(data.available_slots || [])
    } catch (err) {
      setError(err.message)
      console.error('Error fetching schedule:', err)
    } finally {
      setLoading(false)
    }
  }

  // Handle hospital selection
  const handleHospitalSelect = (hospital) => {
    setBookingData(prev => ({
      ...prev,
      hospitalId: hospital.id,
      hospitalName: hospital.name,
      doctorId: null,
      doctorName: '',
      appointmentTime: ''
    }))
    setDoctors([])
    setAvailableSlots([])
    setStep(2)
  }

  // Handle doctor selection
  const handleDoctorSelect = (doctor) => {
    setBookingData(prev => ({
      ...prev,
      doctorId: doctor.id,
      doctorName: `${doctor.user?.first_name || ''} ${doctor.user?.last_name || ''}`,
      doctorSpecialization: doctor.specialization,
      appointmentTime: ''
    }))
    setAvailableSlots([])
    setStep(3)
  }

  // Handle date change
  const handleDateChange = (e) => {
    setBookingData(prev => ({
      ...prev,
      appointmentDate: e.target.value,
      appointmentTime: ''
    }))
  }

  // Handle time slot selection
  const handleTimeSelect = (time) => {
    setBookingData(prev => ({
      ...prev,
      appointmentTime: time
    }))
    setStep(4)
  }

  // API: Book appointment
  const handleBookAppointment = async () => {
    if (!bookingData.appointmentTime) {
      setError('Please select a time slot')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await fetch(
        'http://127.0.0.1:8000/api/patient/booking/workflow/book/',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            doctor_id: bookingData.doctorId,
            hospital_id: bookingData.hospitalId,
            appointment_date: bookingData.appointmentDate,
            appointment_time: bookingData.appointmentTime,
            appointment_type: bookingData.appointmentType
          })
        }
      )
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to book appointment')
      }
      
      const result = await response.json()
      
      // Success! Show confirmation
      setStep(5)
      setTimeout(() => {
        // Redirect to appointments page
        window.location.href = '/dashboard?tab=appointments'
      }, 2000)
    } catch (err) {
      setError(err.message)
      console.error('Error booking appointment:', err)
    } finally {
      setLoading(false)
    }
  }

  // Filter functions
  const filteredHospitals = hospitals.filter(h =>
    h.name.toLowerCase().includes(hospitalSearch.toLowerCase()) ||
    (h.address && h.address.toLowerCase().includes(hospitalSearch.toLowerCase()))
  )

  const filteredDoctors = doctors.filter(d => {
    const name = `${d.user?.first_name || ''} ${d.user?.last_name || ''}`.toLowerCase()
    return (
      name.includes(doctorSearch.toLowerCase()) ||
      d.specialization.toLowerCase().includes(doctorSearch.toLowerCase())
    )
  })

  // Styles
  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem',
      backgroundColor: theme.background || '#f9fafb'
    },
    stepIndicator: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '3rem',
      alignItems: 'center'
    },
    stepItem: (isActive, isCompleted) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      borderRadius: '8px',
      backgroundColor: isActive ? theme.primary || '#3b82f6' : isCompleted ? '#d1fae5' : theme.cardBackground || '#fff',
      color: isActive ? '#fff' : isCompleted ? '#059669' : theme.textSecondary || '#6b7280',
      fontWeight: isActive || isCompleted ? '600' : '400',
      transition: 'all 0.3s ease'
    }),
    card: {
      backgroundColor: theme.cardBackground || '#fff',
      borderRadius: '12px',
      padding: '2rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      marginBottom: '2rem'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
      gap: '1rem',
      marginBottom: '1.5rem'
    },
    itemCard: (isSelected) => ({
      padding: '1rem',
      border: isSelected ? `2px solid ${theme.primary || '#3b82f6'}` : `1px solid ${theme.borderColor || '#e5e7eb'}`,
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      backgroundColor: isSelected ? (theme.primary || '#3b82f6') + '15' : theme.background || '#f9fafb',
      '&:hover': {
        borderColor: theme.primary || '#3b82f6'
      }
    }),
    button: {
      primary: {
        backgroundColor: theme.primary || '#3b82f6',
        color: '#fff',
        padding: '0.75rem 1.5rem',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        fontWeight: '600',
        transition: 'all 0.3s ease',
        '&:hover': {
          opacity: 0.9
        },
        '&:disabled': {
          opacity: 0.5,
          cursor: 'not-allowed'
        }
      },
      secondary: {
        backgroundColor: 'transparent',
        color: theme.primary || '#3b82f6',
        padding: '0.75rem 1.5rem',
        borderRadius: '8px',
        border: `1px solid ${theme.primary || '#3b82f6'}`,
        cursor: 'pointer',
        fontWeight: '600',
        transition: 'all 0.3s ease'
      }
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      border: `1px solid ${theme.borderColor || '#e5e7eb'}`,
      borderRadius: '8px',
      fontSize: '1rem',
      marginBottom: '1rem',
      fontFamily: 'inherit'
    }
  }

  return (
    <div style={styles.container}>
      <h1 style={{ marginBottom: '1.5rem', color: theme.textPrimary || '#111' }}>
        Book an Appointment
      </h1>

      {/* Step Indicator */}
      <div style={styles.stepIndicator}>
        {['Hospital', 'Doctor', 'Schedule', 'Confirm', 'Success'].map((title, index) => (
          <React.Fragment key={index}>
            <div style={styles.stepItem(step === index + 1, step > index + 1)}>
              {step > index + 1 ? (
                <Check size={20} />
              ) : (
                <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{index + 1}</span>
              )}
              <span>{title}</span>
            </div>
            {index < 4 && (
              <ArrowRight
                size={20}
                color={step > index + 1 ? theme.primary || '#3b82f6' : theme.borderColor || '#e5e7eb'}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {error && (
        <div style={{
          backgroundColor: '#fee2e2',
          border: '1px solid #fca5a5',
          color: '#991b1b',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem'
        }}>
          {error}
        </div>
      )}

      {/* Step 1: Select Hospital */}
      {step >= 1 && (
        <div style={styles.card}>
          <h2 style={{ marginBottom: '1rem' }}>Step 1: Select Hospital</h2>
          
          <input
            type="text"
            placeholder="Search hospitals by name or location..."
            value={hospitalSearch}
            onChange={(e) => setHospitalSearch(e.target.value)}
            style={styles.input}
          />

          {loading && step === 1 ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          ) : (
            <div style={styles.grid}>
              {filteredHospitals.map(hospital => (
                <div
                  key={hospital.id}
                  style={styles.itemCard(bookingData.hospitalId === hospital.id)}
                  onClick={() => handleHospitalSelect(hospital)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Building2 size={18} />
                    <strong>{hospital.name}</strong>
                  </div>
                  {hospital.address && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.9rem', color: theme.textSecondary || '#6b7280' }}>
                      <MapPin size={16} style={{ marginTop: '0.2rem' }} />
                      <span>{hospital.address}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Select Doctor */}
      {step >= 2 && bookingData.hospitalId && (
        <div style={styles.card}>
          <h2 style={{ marginBottom: '1rem' }}>
            Step 2: Select Doctor from {bookingData.hospitalName}
          </h2>

          <input
            type="text"
            placeholder="Search doctors by name or specialization..."
            value={doctorSearch}
            onChange={(e) => setDoctorSearch(e.target.value)}
            style={styles.input}
          />

          {loading && step === 2 ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          ) : (
            <div style={styles.grid}>
              {filteredDoctors.map(doctor => (
                <div
                  key={doctor.id}
                  style={styles.itemCard(bookingData.doctorId === doctor.id)}
                  onClick={() => handleDoctorSelect(doctor)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <User size={18} />
                    <strong>Dr. {doctor.user?.first_name} {doctor.user?.last_name}</strong>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: theme.textSecondary || '#6b7280', marginBottom: '0.5rem' }}>
                    {doctor.specialization}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: theme.textSecondary || '#6b7280' }}>
                    {doctor.experience_years} years experience
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Select Date & Time */}
      {step >= 3 && bookingData.doctorId && (
        <div style={styles.card}>
          <h2 style={{ marginBottom: '1rem' }}>
            Step 3: Select Date & Time
          </h2>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Select Date:
            </label>
            <input
              type="date"
              value={bookingData.appointmentDate}
              onChange={handleDateChange}
              min={new Date().toISOString().split('T')[0]}
              style={styles.input}
            />
          </div>

          {loading && step === 3 ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          ) : availableSlots.length > 0 ? (
            <div>
              <p style={{ marginBottom: '1rem', fontWeight: '600' }}>Available Time Slots:</p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                gap: '0.5rem'
              }}>
                {availableSlots.map(slot => (
                  <button
                    key={slot}
                    onClick={() => handleTimeSelect(slot)}
                    style={{
                      padding: '0.75rem',
                      border: bookingData.appointmentTime === slot
                        ? `2px solid ${theme.primary || '#3b82f6'}`
                        : `1px solid ${theme.borderColor || '#e5e7eb'}`,
                      borderRadius: '6px',
                      backgroundColor: bookingData.appointmentTime === slot
                        ? (theme.primary || '#3b82f6') + '20'
                        : theme.background || '#f9fafb',
                      cursor: 'pointer',
                      fontWeight: bookingData.appointmentTime === slot ? '600' : '400',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p style={{ color: theme.textSecondary || '#6b7280' }}>No available slots for this date</p>
          )}
        </div>
      )}

      {/* Step 4: Confirm Booking */}
      {step >= 4 && bookingData.appointmentTime && (
        <div style={styles.card}>
          <h2 style={{ marginBottom: '1.5rem' }}>Step 4: Confirm Your Appointment</h2>

          <div style={{
            backgroundColor: theme.background || '#f9fafb',
            padding: '1.5rem',
            borderRadius: '8px',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ fontWeight: '600', color: theme.textSecondary || '#6b7280' }}>Hospital:</label>
                <p style={{ marginTop: '0.25rem' }}>{bookingData.hospitalName}</p>
              </div>
              <div>
                <label style={{ fontWeight: '600', color: theme.textSecondary || '#6b7280' }}>Doctor:</label>
                <p style={{ marginTop: '0.25rem' }}>Dr. {bookingData.doctorName}</p>
                <p style={{ fontSize: '0.9rem', color: theme.textSecondary || '#6b7280' }}>
                  {bookingData.doctorSpecialization}
                </p>
              </div>
              <div>
                <label style={{ fontWeight: '600', color: theme.textSecondary || '#6b7280' }}>Date:</label>
                <p style={{ marginTop: '0.25rem' }}>
                  {new Date(bookingData.appointmentDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label style={{ fontWeight: '600', color: theme.textSecondary || '#6b7280' }}>Time:</label>
                <p style={{ marginTop: '0.25rem' }}>{bookingData.appointmentTime}</p>
              </div>
              <div>
                <label style={{ fontWeight: '600', color: theme.textSecondary || '#6b7280' }}>Type:</label>
                <select
                  value={bookingData.appointmentType}
                  onChange={(e) => setBookingData(prev => ({ ...prev, appointmentType: e.target.value }))}
                  style={styles.input}
                >
                  <option value="consultation">Consultation</option>
                  <option value="follow_up">Follow-up</option>
                  <option value="check_up">Check-up</option>
                </select>
              </div>
            </div>
          </div>

          <button
            onClick={handleBookAppointment}
            disabled={loading}
            style={{
              ...styles.button.primary,
              width: '100%',
              opacity: loading ? 0.5 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            {loading ? (
              <>
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                Booking...
              </>
            ) : (
              'Confirm Booking'
            )}
          </button>
        </div>
      )}

      {/* Step 5: Success */}
      {step === 5 && (
        <div style={{
          ...styles.card,
          backgroundColor: '#f0fdf4',
          border: `2px solid #22c55e`,
          textAlign: 'center'
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <Check size={48} style={{ color: '#22c55e', margin: '0 auto' }} />
          </div>
          <h2 style={{ color: '#22c55e', marginBottom: '0.5rem' }}>Appointment Booked Successfully!</h2>
          <p style={{ color: theme.textSecondary || '#6b7280', marginBottom: '1rem' }}>
            Your appointment has been confirmed. You will be redirected to your appointments page shortly.
          </p>
          <p style={{ fontSize: '0.9rem', color: theme.textSecondary || '#6b7280' }}>
            A confirmation email has been sent to your registered email address.
          </p>
        </div>
      )}
    </div>
  )
}

export default BookAppointmentWorkflow
