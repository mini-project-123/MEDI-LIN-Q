import React, { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { X, MapPin, User, Calendar, Clock, FileText, AlertCircle, ChevronRight, Loader2 } from 'lucide-react'
import axios from 'axios'

/**
 * BookAppointmentModal
 * 
 * Multi-step appointment booking modal:
 * Step 1: Select Hospital
 * Step 2: Select Doctor
 * Step 3: Select Date
 * Step 4: Select Time Slot
 * Step 5: Fill Details & Summary
 * Step 6: Confirm Booking
 */
const BookAppointmentModal = ({ isOpen, onClose, onSuccess }) => {
  const { theme } = useTheme()
  
  // Current step (1-6)
  const [currentStep, setCurrentStep] = useState(1)
  
  // Step 1: Hospital Selection
  const [hospitals, setHospitals] = useState([])
  const [selectedHospital, setSelectedHospital] = useState(null)
  const [hospitalLoading, setHospitalLoading] = useState(false)
  
  // Step 2: Doctor Selection
  const [doctors, setDoctors] = useState([])
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [doctorLoading, setDoctorLoading] = useState(false)
  
  // Step 3: Date Selection
  const [appointmentDate, setAppointmentDate] = useState('')
  const [dateError, setDateError] = useState('')
  
  // Step 4: Time Slot Selection
  const [timeSlots, setTimeSlots] = useState([])
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null)
  const [timeSlotLoading, setTimeSlotLoading] = useState(false)
  
  // Step 5: Details
  const [appointmentDetails, setAppointmentDetails] = useState({
    reason: '',
    additionalNotes: ''
  })
  
  // General states
  const [error, setError] = useState(null)
  const [isBooking, setIsBooking] = useState(false)

  // Fetch hospitals on modal open
  useEffect(() => {
    if (isOpen) {
      fetchHospitals()
    }
  }, [isOpen])

  // Fetch doctors when hospital is selected
  useEffect(() => {
    if (selectedHospital) {
      fetchDoctors()
    }
  }, [selectedHospital])

  // Fetch time slots when doctor and date are selected
  useEffect(() => {
    if (selectedDoctor && appointmentDate) {
      fetchTimeSlots()
    }
  }, [selectedDoctor, appointmentDate])

  const fetchHospitals = async () => {
    setHospitalLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('accessToken')
      const response = await axios.get('/api/booking/workflow/hospitals/', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setHospitals(response.data || [])
    } catch (err) {
      console.error('Error fetching hospitals:', err)
      setError('Failed to load hospitals')
    } finally {
      setHospitalLoading(false)
    }
  }

  const fetchDoctors = async () => {
    setDoctorLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('accessToken')
      const response = await axios.get('/api/booking/workflow/doctors/', {
        headers: { 'Authorization': `Bearer ${token}` },
        params: { hospital_id: selectedHospital.id }
      })
      setDoctors(response.data || [])
    } catch (err) {
      console.error('Error fetching doctors:', err)
      setError('Failed to load doctors')
    } finally {
      setDoctorLoading(false)
    }
  }

  const fetchTimeSlots = async () => {
    setTimeSlotLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('accessToken')
      const response = await axios.get('/api/booking/workflow/schedule/', {
        headers: { 'Authorization': `Bearer ${token}` },
        params: {
          doctor_id: selectedDoctor.id,
          date: appointmentDate
        }
      })
      
      // Extract time strings from slot objects
      const slots = response.data.available_slots || []
      const timeStrings = slots.map(slot => {
        // Handle both formats: {time: "10:00:00"} and "10:00"
        if (typeof slot === 'string') {
          return slot
        } else if (slot.time) {
          // Convert "10:00:00" to "10:00"
          return slot.time.substring(0, 5)
        }
        return slot
      })
      
      setTimeSlots(timeStrings)
    } catch (err) {
      console.error('Error fetching time slots:', err)
      setError('Failed to load available time slots')
      // Set mock time slots for demonstration
      setTimeSlots([
        '09:00', '10:00', '11:00', '12:00',
        '14:00', '15:00', '16:00'
      ])
    } finally {
      setTimeSlotLoading(false)
    }
  }

  const handleBookAppointment = async () => {
    if (!appointmentDetails.reason.trim()) {
      setError('Please provide a reason for appointment')
      return
    }

    setIsBooking(true)
    setError(null)
    try {
      const token = localStorage.getItem('accessToken')
      const bookingData = {
        hospital_id: selectedHospital.id,
        doctor_id: selectedDoctor.id,
        appointment_date: appointmentDate,
        appointment_time: selectedTimeSlot,
        reason: appointmentDetails.reason,
        additional_notes: appointmentDetails.additionalNotes
      }

      const response = await axios.post('/api/booking/appointments/book/', bookingData, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      // Success
      onSuccess && onSuccess(response.data)
      resetModal()
    } catch (err) {
      console.error('Error booking appointment:', err)
      setError(err.response?.data?.detail || 'Failed to book appointment')
    } finally {
      setIsBooking(false)
    }
  }

  const resetModal = () => {
    setCurrentStep(1)
    setSelectedHospital(null)
    setSelectedDoctor(null)
    setAppointmentDate('')
    setSelectedTimeSlot(null)
    setAppointmentDetails({ reason: '', additionalNotes: '' })
    setError(null)
    onClose()
  }

  const getMinDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  const goToNextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
      setError(null)
    }
  }

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setError(null)
    }
  }

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      padding: '1rem'
    }}>
      <div className="card" style={{
        width: '100%',
        maxWidth: '600px',
        maxHeight: '85vh',
        overflow: 'auto',
        padding: '2rem'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ color: theme.text, margin: '0 0 0.5rem 0' }}>Book Appointment</h2>
            <p style={{ color: theme.textSecondary, margin: 0, fontSize: '0.9rem' }}>
              Step {currentStep} of 5
            </p>
          </div>
          <button
            onClick={resetModal}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: theme.textSecondary,
              padding: 0,
              fontSize: '1.5rem'
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Progress Bar */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
          {[1, 2, 3, 4, 5].map(step => (
            <div
              key={step}
              style={{
                flex: 1,
                height: '4px',
                backgroundColor: step <= currentStep ? '#3b82f6' : theme.border,
                borderRadius: '2px',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            padding: '1rem',
            backgroundColor: '#fee2e2',
            borderColor: '#ef4444',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            display: 'flex',
            gap: '0.75rem'
          }}>
            <AlertCircle size={20} style={{ color: '#dc2626', flexShrink: 0 }} />
            <p style={{ color: '#991b1b', margin: 0, fontSize: '0.9rem' }}>{error}</p>
          </div>
        )}

        {/* Step 1: Hospital Selection */}
        {currentStep === 1 && (
          <div>
            <h3 style={{ color: theme.text, marginBottom: '1.5rem' }}>Select Hospital</h3>
            {hospitalLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: theme.textSecondary }}>
                <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} />
                <p>Loading hospitals...</p>
              </div>
            ) : hospitals.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {hospitals.map(hospital => (
                  <div
                    key={hospital.id}
                    onClick={() => setSelectedHospital(hospital)}
                    style={{
                      padding: '1.25rem',
                      border: selectedHospital?.id === hospital.id ? '2px solid #3b82f6' : `1px solid ${theme.border}`,
                      borderRadius: '8px',
                      backgroundColor: selectedHospital?.id === hospital.id ? '#dbeafe' : theme.background,
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedHospital?.id !== hospital.id) {
                        e.currentTarget.style.borderColor = '#3b82f6'
                        e.currentTarget.style.backgroundColor = theme.cardBackground
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedHospital?.id !== hospital.id) {
                        e.currentTarget.style.borderColor = theme.border
                        e.currentTarget.style.backgroundColor = theme.background
                      }
                    }}
                  >
                  <div>
                      <h4 style={{ color: theme.text, margin: '0 0 0.25rem 0' }}>
                        {hospital.name}
                      </h4>
                      <p style={{ color: theme.textSecondary, margin: '0 0 0.5rem 0', fontSize: '0.85rem' }}>
                        {hospital.address}
                      </p>
                      <p style={{ color: '#3b82f6', margin: 0, fontSize: '0.85rem', fontWeight: '500' }}>
                        {hospital.doctors_count} doctors available
                      </p>
                    </div>
                    <ChevronRight size={20} style={{ color: '#3b82f6', opacity: selectedHospital?.id === hospital.id ? 1 : 0 }} />
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: theme.textSecondary }}>
                <p>No hospitals available</p>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Doctor Selection */}
        {currentStep === 2 && (
          <div>
            <h3 style={{ color: theme.text, marginBottom: '1.5rem' }}>
              Select Doctor from {selectedHospital?.name}
            </h3>
            {doctorLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: theme.textSecondary }}>
                <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} />
                <p>Loading doctors...</p>
              </div>
            ) : doctors.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {doctors.map(doctor => (
                  <div
                    key={doctor.id}
                    onClick={() => setSelectedDoctor(doctor)}
                    style={{
                      padding: '1.25rem',
                      border: selectedDoctor?.id === doctor.id ? '2px solid #3b82f6' : `1px solid ${theme.border}`,
                      borderRadius: '8px',
                      backgroundColor: selectedDoctor?.id === doctor.id ? '#dbeafe' : theme.background,
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedDoctor?.id !== doctor.id) {
                        e.currentTarget.style.borderColor = '#3b82f6'
                        e.currentTarget.style.backgroundColor = theme.cardBackground
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedDoctor?.id !== doctor.id) {
                        e.currentTarget.style.borderColor = theme.border
                        e.currentTarget.style.backgroundColor = theme.background
                      }
                    }}
                  >
                    <div>
                      <h4 style={{ color: theme.text, margin: '0 0 0.25rem 0' }}>
                        Dr. {doctor.first_name} {doctor.last_name}
                      </h4>
                      <p style={{ color: theme.textSecondary, margin: '0 0 0.25rem 0', fontSize: '0.85rem' }}>
                        {doctor.specialization}
                      </p>
                      <p style={{ color: theme.textSecondary, margin: 0, fontSize: '0.85rem' }}>
                        Experience: {doctor.experience_years} years
                      </p>
                    </div>
                    <ChevronRight size={20} style={{ color: '#3b82f6', opacity: selectedDoctor?.id === doctor.id ? 1 : 0 }} />
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: theme.textSecondary }}>
                <p>No doctors available in this hospital</p>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Date Selection */}
        {currentStep === 3 && (
          <div>
            <h3 style={{ color: theme.text, marginBottom: '1.5rem' }}>
              Select Appointment Date
            </h3>
            <div className="form-group">
              <label style={{ display: 'block', color: theme.text, marginBottom: '0.5rem', fontWeight: '500' }}>
                Date
              </label>
              <input
                type="date"
                value={appointmentDate}
                onChange={(e) => {
                  setAppointmentDate(e.target.value)
                  setSelectedTimeSlot(null) // Reset time slot when date changes
                }}
                min={getMinDate()}
                className="form-input"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: `1px solid ${theme.border}`,
                  backgroundColor: theme.background,
                  color: theme.text,
                  fontSize: '1rem'
                }}
              />
              <p style={{ color: theme.textSecondary, margin: '0.5rem 0 0 0', fontSize: '0.85rem' }}>
                Select a date from tomorrow onwards
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Time Slot Selection */}
        {currentStep === 4 && (
          <div>
            <h3 style={{ color: theme.text, marginBottom: '1.5rem' }}>
              Select Time Slot for {new Date(appointmentDate).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
            </h3>
            {timeSlotLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: theme.textSecondary }}>
                <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} />
                <p>Loading available slots...</p>
              </div>
            ) : timeSlots.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                {timeSlots.map(slot => (
                  <button
                    key={slot}
                    onClick={() => setSelectedTimeSlot(slot)}
                    style={{
                      padding: '0.75rem',
                      border: selectedTimeSlot === slot ? '2px solid #3b82f6' : `1px solid ${theme.border}`,
                      borderRadius: '8px',
                      backgroundColor: selectedTimeSlot === slot ? '#3b82f6' : theme.background,
                      color: selectedTimeSlot === slot ? 'white' : theme.text,
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: selectedTimeSlot === slot ? '600' : '400',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedTimeSlot !== slot) {
                        e.currentTarget.style.borderColor = '#3b82f6'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedTimeSlot !== slot) {
                        e.currentTarget.style.borderColor = theme.border
                      }
                    }}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: theme.textSecondary }}>
                <p>No available slots for this date. Please select another date.</p>
              </div>
            )}
          </div>
        )}

        {/* Step 5: Details & Summary */}
        {currentStep === 5 && (
          <div>
            <h3 style={{ color: theme.text, marginBottom: '1.5rem' }}>Fill Appointment Details</h3>
            
            {/* Form Fields */}
            <div style={{ marginBottom: '2rem' }}>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', color: theme.text, marginBottom: '0.5rem', fontWeight: '500' }}>
                  Reason for Appointment *
                </label>
                <input
                  type="text"
                  placeholder="e.g., General checkup, follow-up visit, etc."
                  value={appointmentDetails.reason}
                  onChange={(e) => setAppointmentDetails({ ...appointmentDetails, reason: e.target.value })}
                  className="form-input"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: `1px solid ${theme.border}`,
                    backgroundColor: theme.background,
                    color: theme.text,
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'block', color: theme.text, marginBottom: '0.5rem', fontWeight: '500' }}>
                  Additional Notes (Optional)
                </label>
                <textarea
                  placeholder="Any additional information you'd like to share with the doctor..."
                  value={appointmentDetails.additionalNotes}
                  onChange={(e) => setAppointmentDetails({ ...appointmentDetails, additionalNotes: e.target.value })}
                  className="form-input"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: `1px solid ${theme.border}`,
                    backgroundColor: theme.background,
                    color: theme.text,
                    fontSize: '1rem',
                    resize: 'vertical',
                    minHeight: '100px'
                  }}
                />
              </div>
            </div>

            {/* Summary */}
            <div style={{
              padding: '1.5rem',
              backgroundColor: theme.cardBackground,
              borderRadius: '8px',
              borderLeft: '4px solid #3b82f6'
            }}>
              <h4 style={{ color: theme.text, margin: '0 0 1rem 0' }}>Appointment Summary</h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'start' }}>
                  <MapPin size={18} style={{ color: '#3b82f6', flexShrink: 0, marginTop: '0.2rem' }} />
                  <div>
                    <p style={{ color: theme.textSecondary, margin: 0, fontSize: '0.85rem' }}>Hospital</p>
                    <p style={{ color: theme.text, margin: 0, fontWeight: '500' }}>{selectedHospital?.name}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'start' }}>
                  <User size={18} style={{ color: '#3b82f6', flexShrink: 0, marginTop: '0.2rem' }} />
                  <div>
                    <p style={{ color: theme.textSecondary, margin: 0, fontSize: '0.85rem' }}>Doctor</p>
                    <p style={{ color: theme.text, margin: 0, fontWeight: '500' }}>
                      Dr. {selectedDoctor?.user?.first_name} {selectedDoctor?.user?.last_name}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'start' }}>
                  <Calendar size={18} style={{ color: '#3b82f6', flexShrink: 0, marginTop: '0.2rem' }} />
                  <div>
                    <p style={{ color: theme.textSecondary, margin: 0, fontSize: '0.85rem' }}>Date & Time</p>
                    <p style={{ color: theme.text, margin: 0, fontWeight: '500' }}>
                      {new Date(appointmentDate).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })} at {selectedTimeSlot}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'start' }}>
                  <FileText size={18} style={{ color: '#3b82f6', flexShrink: 0, marginTop: '0.2rem' }} />
                  <div>
                    <p style={{ color: theme.textSecondary, margin: 0, fontSize: '0.85rem' }}>Reason</p>
                    <p style={{ color: theme.text, margin: 0, fontWeight: '500' }}>{appointmentDetails.reason}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button
            onClick={goToPreviousStep}
            disabled={currentStep === 1}
            style={{
              flex: 1,
              padding: '0.75rem',
              backgroundColor: currentStep === 1 ? theme.border : theme.cardBackground,
              color: currentStep === 1 ? theme.textSecondary : theme.text,
              border: `1px solid ${theme.border}`,
              borderRadius: '8px',
              cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500',
              transition: 'all 0.2s',
              opacity: currentStep === 1 ? 0.5 : 1
            }}
          >
            Previous
          </button>

          {currentStep < 5 ? (
            <button
              onClick={goToNextStep}
              disabled={
                (currentStep === 1 && !selectedHospital) ||
                (currentStep === 2 && !selectedDoctor) ||
                (currentStep === 3 && !appointmentDate) ||
                (currentStep === 4 && !selectedTimeSlot)
              }
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500',
                transition: 'all 0.2s',
                opacity:
                  (currentStep === 1 && !selectedHospital) ||
                  (currentStep === 2 && !selectedDoctor) ||
                  (currentStep === 3 && !appointmentDate) ||
                  (currentStep === 4 && !selectedTimeSlot)
                    ? 0.5
                    : 1,
                cursor:
                  (currentStep === 1 && !selectedHospital) ||
                  (currentStep === 2 && !selectedDoctor) ||
                  (currentStep === 3 && !appointmentDate) ||
                  (currentStep === 4 && !selectedTimeSlot)
                    ? 'not-allowed'
                    : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (
                  !((currentStep === 1 && !selectedHospital) ||
                    (currentStep === 2 && !selectedDoctor) ||
                    (currentStep === 3 && !appointmentDate) ||
                    (currentStep === 4 && !selectedTimeSlot))
                ) {
                  e.currentTarget.style.backgroundColor = '#2563eb'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#3b82f6'
              }}
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleBookAppointment}
              disabled={isBooking || !appointmentDetails.reason.trim()}
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: isBooking ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500',
                transition: 'all 0.2s',
                opacity: isBooking || !appointmentDetails.reason.trim() ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                if (!isBooking && appointmentDetails.reason.trim()) {
                  e.currentTarget.style.backgroundColor = '#059669'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#10b981'
              }}
            >
              {isBooking && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
              {isBooking ? 'Booking...' : 'Book Appointment'}
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default BookAppointmentModal
