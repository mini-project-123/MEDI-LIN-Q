# Quick Reference Card

## 🚀 Quick Start

### Import API Service
```javascript
import { patientAPI, doctorAPI, hospitalAPI } from '../utils/api'
```

### Basic API Call Pattern
```javascript
const [data, setData] = useState([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState(null)

useEffect(() => {
  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await patientAPI.getDashboard()
      setData(response.data)
    } catch (err) {
      setError('Failed to load data')
      if (err.response?.status === 401) logout()
    } finally {
      setLoading(false)
    }
  }
  fetchData()
}, [])
```

## 📋 Common API Calls

### Patient
```javascript
// Dashboard
await patientAPI.getDashboard()

// Book appointment
await patientAPI.createAppointment({
  doctor: 1,
  hospital: 1,
  appointment_date: '2025-11-15',
  appointment_time: '10:00',
  appointment_type: 'consultation'
})

// Cancel appointment
await patientAPI.cancelAppointment(appointmentId)

// Get doctors
await patientAPI.getDoctors({ specialization: 'Cardiology' })
```

### Doctor
```javascript
// Dashboard
await doctorAPI.getDashboardSummary()

// Get patients
await doctorAPI.getPatients({ search: 'John', visited: 'today' })

// Get patient details
await doctorAPI.getPatientDetail(patientId)

// Get AI summary
await doctorAPI.getPatientSummary(patientId)

// Get appointments
await doctorAPI.getAppointments({ status: 'confirmed', date: '2025-11-10' })

// Create prescription
await doctorAPI.createPrescription({
  patient: 1,
  medication: 1,
  dosage: '500mg',
  frequency: 'Twice daily',
  duration: '7 days'
})
```

### Hospital
```javascript
// Dashboard
await hospitalAPI.getDashboardSummary()

// Get doctors
await hospitalAPI.getDoctors({ search: 'John' })

// Get appointments
await hospitalAPI.getAppointments({ status: 'confirmed', appointment_date: '2025-11-10' })

// Add staff
await hospitalAPI.createStaff({
  first_name: 'Jane',
  last_name: 'Doe',
  email: 'jane@example.com',
  contact_no: '+1234567890',
  job_title: 'Nurse',
  password: 'temp123'
})

// Get analytics
await hospitalAPI.getAnalytics()
```

## 🔍 Search with Debounce

```javascript
const [searchTerm, setSearchTerm] = useState('')

useEffect(() => {
  const timeout = setTimeout(() => {
    fetchData(searchTerm)
  }, 500)
  return () => clearTimeout(timeout)
}, [searchTerm])
```

## 🎨 Loading State

```javascript
if (loading) {
  return <div>Loading...</div>
}

if (error) {
  return <div style={{ color: 'red' }}>{error}</div>
}

return <div>{/* Your content */}</div>
```

## 📝 Form Submission

```javascript
const [formData, setFormData] = useState({ name: '', email: '' })
const [submitting, setSubmitting] = useState(false)
const [errors, setErrors] = useState({})

const handleSubmit = async (e) => {
  e.preventDefault()
  setSubmitting(true)
  setErrors({})
  
  try {
    await api.createData(formData)
    alert('Success!')
  } catch (err) {
    if (err.response?.data) {
      setErrors(err.response.data)
    }
  } finally {
    setSubmitting(false)
  }
}
```

## 🔐 Auth Handling

```javascript
// Check if user is authenticated
const token = localStorage.getItem('accessToken')
if (!token) {
  navigate('/login')
}

// Handle 401 errors (automatic in api.js)
// Just import and use logout from AuthContext
const { logout } = useAuth()
```

## 📊 Filter Parameters

### Appointments
```javascript
{
  status: 'confirmed',        // 'pending', 'confirmed', 'completed', 'cancelled'
  date: '2025-11-10',         // YYYY-MM-DD
  time_start: '09:00',        // HH:MM
  time_end: '17:00'           // HH:MM
}
```

### Patients
```javascript
{
  search: 'John',             // Name or ID
  visited: 'today'            // 'today', 'yesterday', 'this_month'
}
```

### Doctors/Staff
```javascript
{
  search: 'John'              // Name or specialty
}
```

## 🎯 Common Patterns

### Modal State
```javascript
const [showModal, setShowModal] = useState(false)
const [selectedItem, setSelectedItem] = useState(null)

const openModal = (item) => {
  setSelectedItem(item)
  setShowModal(true)
}

const closeModal = () => {
  setShowModal(false)
  setSelectedItem(null)
}
```

### List with Search
```javascript
const [items, setItems] = useState([])
const [searchTerm, setSearchTerm] = useState('')

useEffect(() => {
  const timeout = setTimeout(() => {
    fetchItems({ search: searchTerm })
  }, 500)
  return () => clearTimeout(timeout)
}, [searchTerm])
```

### CRUD Operations
```javascript
// Create
const create = async (data) => {
  await api.create(data)
  fetchList() // Refresh list
}

// Update
const update = async (id, data) => {
  await api.update(id, data)
  fetchList()
}

// Delete
const remove = async (id) => {
  if (confirm('Are you sure?')) {
    await api.delete(id)
    fetchList()
  }
}
```

## 🐛 Error Handling

```javascript
try {
  const response = await api.getData()
  setData(response.data)
} catch (error) {
  // 401 - Unauthorized (handled automatically)
  if (error.response?.status === 401) {
    logout()
  }
  // 404 - Not found
  else if (error.response?.status === 404) {
    navigate('/complete-profile')
  }
  // 400 - Validation errors
  else if (error.response?.status === 400) {
    setErrors(error.response.data)
  }
  // Other errors
  else {
    setError('Something went wrong')
  }
}
```

## 📱 Responsive Design

```javascript
// Grid layout
<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '1.5rem'
}}>
  {/* Cards */}
</div>
```

## 🎨 Theme Usage

```javascript
import { useTheme } from '../contexts/ThemeContext'

const { theme } = useTheme()

<div style={{
  color: theme.text,
  backgroundColor: theme.background,
  border: `1px solid ${theme.border}`
}}>
  {/* Content */}
</div>
```

## 📦 File Upload

```javascript
const handleFileUpload = async (file) => {
  const formData = new FormData()
  formData.append('report_file', file)
  formData.append('report_type', 'Blood Test')
  
  await hospitalAPI.uploadPatientReport(patientId, formData)
}
```

## 🔄 Refresh Data

```javascript
const [refreshKey, setRefreshKey] = useState(0)

useEffect(() => {
  fetchData()
}, [refreshKey])

// Trigger refresh
const refresh = () => setRefreshKey(prev => prev + 1)
```

## 📊 Date Formatting

```javascript
// Format date
const formatDate = (isoDate) => {
  return new Date(isoDate).toISOString().split('T')[0]
}

// Format time
const formatTime = (timeString) => {
  const [hours, minutes] = timeString.split(':')
  const hour = parseInt(hours, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const formattedHour = hour % 12 === 0 ? 12 : hour % 12
  return `${formattedHour}:${minutes} ${ampm}`
}
```

## 🎯 Status Colors

```javascript
const getStatusColor = (status) => {
  const colors = {
    pending: { bg: '#fffbeb', text: '#f59e0b' },
    confirmed: { bg: '#f0f9ff', text: '#3b82f6' },
    completed: { bg: '#f0fdf4', text: '#22c55e' },
    cancelled: { bg: '#fef2f2', text: '#ef4444' }
  }
  return colors[status] || colors.pending
}
```

## 🚨 Common Mistakes to Avoid

1. ❌ Don't forget try-catch blocks
2. ❌ Don't forget loading states
3. ❌ Don't forget to debounce search
4. ❌ Don't forget to handle 401 errors
5. ❌ Don't forget to validate input
6. ❌ Don't forget to refresh data after mutations
7. ❌ Don't forget to clear timeouts in useEffect cleanup
8. ❌ Don't forget to check response data before using it

## ✅ Best Practices

1. ✅ Always use the API service from `utils/api.js`
2. ✅ Always handle errors gracefully
3. ✅ Always show loading states
4. ✅ Always debounce search inputs
5. ✅ Always validate user input
6. ✅ Always refresh data after create/update/delete
7. ✅ Always use meaningful variable names
8. ✅ Always add comments for complex logic

## 📞 Need Help?

1. Check `API_USAGE_GUIDE.md` for detailed examples
2. Check `BACKEND_FRONTEND_INTEGRATION.md` for architecture
3. Check browser console for errors
4. Verify backend is running on port 8000
5. Verify frontend is running on port 5173

---

**Quick Reference v1.0** | Last updated: November 10, 2025
