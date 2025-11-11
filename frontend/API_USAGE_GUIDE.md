# API Usage Guide

## Quick Start

### Import the API service:
```javascript
import { patientAPI, doctorAPI, hospitalAPI } from '../utils/api'
```

## Patient APIs

### Get Dashboard Data
```javascript
const fetchDashboard = async () => {
  try {
    const response = await patientAPI.getDashboard()
    console.log(response.data) // { appointments: [], medical_reports: [], prescriptions: [] }
  } catch (error) {
    console.error('Error:', error)
  }
}
```

### Book Appointment
```javascript
const bookAppointment = async () => {
  try {
    const appointmentData = {
      doctor: 1,
      hospital: 1,
      appointment_date: '2025-11-15',
      appointment_time: '10:00',
      appointment_type: 'consultation'
    }
    const response = await patientAPI.createAppointment(appointmentData)
    console.log('Appointment created:', response.data)
  } catch (error) {
    console.error('Error:', error)
  }
}
```

### Cancel Appointment
```javascript
const cancelAppointment = async (appointmentId) => {
  try {
    await patientAPI.cancelAppointment(appointmentId)
    alert('Appointment cancelled')
  } catch (error) {
    console.error('Error:', error)
  }
}
```

### Get Available Doctors
```javascript
const getDoctors = async () => {
  try {
    const params = {
      specialization: 'Cardiology',
      hospital: 1
    }
    const response = await patientAPI.getDoctors(params)
    console.log(response.data) // Array of doctors
  } catch (error) {
    console.error('Error:', error)
  }
}
```

## Doctor APIs

### Get Dashboard Summary
```javascript
const fetchDashboard = async () => {
  try {
    const response = await doctorAPI.getDashboardSummary()
    console.log(response.data) // { stat_cards: {}, visualizations: {}, ... }
  } catch (error) {
    if (error.response?.status === 404) {
      // Profile not found, redirect to profile completion
      navigate('/complete-doctor-profile')
    }
  }
}
```

### Get Patients with Filters
```javascript
const fetchPatients = async () => {
  try {
    const params = {
      search: 'John',
      visited: 'today' // 'today', 'yesterday', 'this_month'
    }
    const response = await doctorAPI.getPatients(params)
    console.log(response.data) // Array of patients
  } catch (error) {
    console.error('Error:', error)
  }
}
```

### Get Patient Details
```javascript
const fetchPatientDetails = async (patientId) => {
  try {
    const response = await doctorAPI.getPatientDetail(patientId)
    console.log(response.data) // Full patient details with appointments, prescriptions
  } catch (error) {
    console.error('Error:', error)
  }
}
```

### Get AI Patient Summary
```javascript
const fetchPatientSummary = async (patientId) => {
  try {
    const response = await doctorAPI.getPatientSummary(patientId)
    console.log(response.data.summary) // AI-generated summary text
  } catch (error) {
    console.error('Error:', error)
  }
}
```

### Get Appointments with Filters
```javascript
const fetchAppointments = async () => {
  try {
    const params = {
      status: 'confirmed',
      date: '2025-11-10',
      time_start: '09:00',
      time_end: '17:00'
    }
    const response = await doctorAPI.getAppointments(params)
    console.log(response.data) // Filtered appointments
  } catch (error) {
    console.error('Error:', error)
  }
}
```

### Create Prescription
```javascript
const createPrescription = async () => {
  try {
    const prescriptionData = {
      patient: 1,
      medication: 1,
      dosage: '500mg',
      frequency: 'Twice daily',
      duration: '7 days',
      notes: 'Take after meals'
    }
    const response = await doctorAPI.createPrescription(prescriptionData)
    console.log('Prescription created:', response.data)
  } catch (error) {
    console.error('Error:', error)
  }
}
```

## Hospital APIs

### Get Dashboard Summary
```javascript
const fetchDashboard = async () => {
  try {
    const response = await hospitalAPI.getDashboardSummary()
    console.log(response.data) // { summary_cards: {}, todays_appointments: [] }
  } catch (error) {
    if (error.response?.status === 401) {
      logout()
    }
  }
}
```

### Get Doctors with Search
```javascript
const fetchDoctors = async (searchTerm) => {
  try {
    const params = { search: searchTerm }
    const response = await hospitalAPI.getDoctors(params)
    console.log(response.data) // Array of doctors
  } catch (error) {
    console.error('Error:', error)
  }
}
```

### Get Appointments with Filters
```javascript
const fetchAppointments = async () => {
  try {
    const params = {
      search: 'John',
      status: 'confirmed',
      appointment_date: '2025-11-10'
    }
    const response = await hospitalAPI.getAppointments(params)
    console.log(response.data) // Filtered appointments
  } catch (error) {
    console.error('Error:', error)
  }
}
```

### Manage Staff
```javascript
// Get staff list
const fetchStaff = async () => {
  try {
    const response = await hospitalAPI.getStaff()
    console.log(response.data)
  } catch (error) {
    console.error('Error:', error)
  }
}

// Add staff
const addStaff = async () => {
  try {
    const staffData = {
      first_name: 'Jane',
      last_name: 'Doe',
      email: 'jane@example.com',
      role: 'nurse',
      department: 'Emergency'
    }
    const response = await hospitalAPI.createStaff(staffData)
    console.log('Staff added:', response.data)
  } catch (error) {
    console.error('Error:', error)
  }
}

// Update staff
const updateStaff = async (staffId) => {
  try {
    const updates = { department: 'ICU' }
    const response = await hospitalAPI.updateStaff(staffId, updates)
    console.log('Staff updated:', response.data)
  } catch (error) {
    console.error('Error:', error)
  }
}

// Delete staff
const deleteStaff = async (staffId) => {
  try {
    await hospitalAPI.deleteStaff(staffId)
    console.log('Staff deleted')
  } catch (error) {
    console.error('Error:', error)
  }
}
```

### Manage Patients
```javascript
// Get patients
const fetchPatients = async () => {
  try {
    const params = { search: 'John' }
    const response = await hospitalAPI.getPatients(params)
    console.log(response.data)
  } catch (error) {
    console.error('Error:', error)
  }
}

// Add patient
const addPatient = async () => {
  try {
    const patientData = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      age: 35,
      gender: 'Male'
    }
    const response = await hospitalAPI.createPatient(patientData)
    console.log('Patient added:', response.data)
  } catch (error) {
    console.error('Error:', error)
  }
}

// Upload patient report
const uploadReport = async (patientId) => {
  try {
    const formData = new FormData()
    formData.append('report_file', fileInput.files[0])
    formData.append('report_type', 'Blood Test')
    
    const response = await hospitalAPI.uploadPatientReport(patientId, formData)
    console.log('Report uploaded:', response.data)
  } catch (error) {
    console.error('Error:', error)
  }
}
```

### Get Analytics
```javascript
const fetchAnalytics = async () => {
  try {
    const response = await hospitalAPI.getAnalytics()
    console.log(response.data) // Analytics data
  } catch (error) {
    console.error('Error:', error)
  }
}
```

## Common Patterns

### Debounced Search
```javascript
useEffect(() => {
  const searchTimeout = setTimeout(() => {
    fetchData()
  }, 500) // 500ms delay

  return () => clearTimeout(searchTimeout)
}, [searchTerm])
```

### Error Handling
```javascript
const fetchData = async () => {
  try {
    const response = await api.getData()
    setData(response.data)
  } catch (error) {
    if (error.response?.status === 401) {
      // Unauthorized - logout
      logout()
    } else if (error.response?.status === 404) {
      // Not found - redirect to profile completion
      navigate('/complete-profile')
    } else {
      // Other errors
      setError('Failed to load data')
    }
  }
}
```

### Loading States
```javascript
const [loading, setLoading] = useState(true)

const fetchData = async () => {
  setLoading(true)
  try {
    const response = await api.getData()
    setData(response.data)
  } catch (error) {
    console.error(error)
  } finally {
    setLoading(false)
  }
}

if (loading) {
  return <div>Loading...</div>
}
```

### Form Submission
```javascript
const handleSubmit = async (e) => {
  e.preventDefault()
  setSubmitting(true)
  
  try {
    const response = await api.createData(formData)
    alert('Success!')
    navigate('/dashboard')
  } catch (error) {
    if (error.response?.data) {
      // Display validation errors
      setErrors(error.response.data)
    } else {
      alert('Failed to submit')
    }
  } finally {
    setSubmitting(false)
  }
}
```

## Tips

1. **Always handle errors**: Use try-catch blocks for all API calls
2. **Use loading states**: Show loading indicators during API calls
3. **Debounce search**: Avoid excessive API calls on every keystroke
4. **Handle 401 errors**: Automatically logout and redirect to login
5. **Validate data**: Check response data before using it
6. **Use TypeScript**: Consider adding TypeScript for better type safety
7. **Cache data**: Use React Query or SWR for better data management
8. **Optimize re-renders**: Use useMemo and useCallback where appropriate

## Environment Variables

Create a `.env` file in the frontend directory:
```
VITE_API_BASE_URL=http://localhost:8000/api
```

Update `api.js`:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
```
