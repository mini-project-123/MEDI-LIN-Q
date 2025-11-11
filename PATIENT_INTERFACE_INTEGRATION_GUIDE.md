# Patient Interface Implementation Guide

## Overview
Complete implementation of:
1. **AI Chatbot** in Health Analytics page
2. **Medical Reports API** integration
3. **Multi-step Appointment Booking Workflow**
4. **Settings & Privacy API** integration

---

## 1. AI Chatbot Integration

### API Endpoint
**POST** `/api/patient/ai-chatbot/`

### Implementation in Health Analytics

```javascript
// HealthAnalytics Component State
const [chatMessages, setChatMessages] = useState([])
const [chatInput, setChatInput] = useState('')
const [chatLoading, setChatLoading] = useState(false)

// Send message to AI Chatbot
const handleChatSubmit = async (message) => {
  try {
    setChatLoading(true)
    const response = await fetch('/api/patient/ai-chatbot/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: message,
        context: userMedicalContext // Optional medical history
      })
    })
    
    const data = await response.json()
    // data contains: response, confidence_score, suggested_actions, disclaimer
  } finally {
    setChatLoading(false)
  }
}
```

### Request Format
```json
{
  "message": "I have persistent headaches, what should I do?",
  "context": "History of migraines, takes aspirin occasionally"
}
```

### Response Format
```json
{
  "response": "Based on your symptoms, persistent headaches could be due to various causes...",
  "confidence_score": 0.87,
  "suggested_actions": [
    "Track your headaches in a diary",
    "Stay hydrated",
    "Avoid stress triggers",
    "Consider consulting a neurologist"
  ],
  "disclaimer": "This is AI-generated advice and not a substitute for professional medical diagnosis..."
}
```

---

## 2. Medical Reports Integration

### Current Issues to Fix
- Reports initially set to `null` in patient profile
- Fetch reports via API endpoint instead of embedding in profile

### API Endpoint
**GET** `/api/patient/medical-reports-api/`

### Implementation in Patient Dashboard/Reports Page

```javascript
// Fetch reports from API instead of profile
const fetchMedicalReports = async () => {
  try {
    setReportsLoading(true)
    const response = await fetch('/api/patient/medical-reports-api/', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    const reports = await response.json()
    setMedicalReports(reports.results || reports) // Handle pagination
  } finally {
    setReportsLoading(false)
  }
}

// Use in useEffect
useEffect(() => {
  fetchMedicalReports()
}, [token])
```

### Response Format
```json
[
  {
    "id": 1,
    "report_type": "Lab Report",
    "description": "Blood test report",
    "report_file": "http://example.com/report.pdf",
    "created_at": "2025-11-10T10:30:00Z"
  },
  {
    "id": 2,
    "report_type": "X-Ray",
    "description": "Chest X-Ray",
    "report_file": "http://example.com/xray.pdf",
    "created_at": "2025-11-05T14:15:00Z"
  }
]
```

---

## 3. Multi-Step Appointment Booking Workflow

### Step 1: Select Hospital
**API Endpoint:** `GET /api/patient/booking/workflow/hospitals/`

```javascript
const fetchHospitals = async () => {
  const response = await fetch('/api/patient/booking/workflow/hospitals/', {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  return response.json()
}
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Central Hospital",
    "address": "123 Medical Street",
    "city": "New York",
    "contact_no1": "+1-555-0123"
  }
]
```

---

### Step 2: Select Doctor (by Hospital)
**API Endpoint:** `GET /api/patient/booking/workflow/doctors/?hospital_id=1`

```javascript
const fetchDoctorsByHospital = async (hospitalId) => {
  const response = await fetch(
    `/api/patient/booking/workflow/doctors/?hospital_id=${hospitalId}`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  )
  return response.json()
}
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Dr. John Smith",
    "specialization": "Cardiology",
    "experience_years": 10,
    "hospital": "Central Hospital"
  }
]
```

---

### Step 3: View Doctor's Schedule
**API Endpoint:** `GET /api/patient/booking/workflow/schedule/?doctor_id=1&date=2025-11-20`

```javascript
const fetchDoctorSchedule = async (doctorId, date) => {
  const response = await fetch(
    `/api/patient/booking/workflow/schedule/?doctor_id=${doctorId}&date=${date}`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  )
  return response.json()
}
```

**Response:**
```json
{
  "doctor_id": 1,
  "doctor_name": "Dr. John Smith",
  "specialization": "Cardiology",
  "appointment_date": "2025-11-20",
  "available_slots": [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "14:00",
    "14:30",
    "15:00"
  ],
  "total_available": 8,
  "booked_count": 2
}
```

---

### Step 4: Book Appointment
**API Endpoint:** `POST /api/patient/booking/workflow/book/`

```javascript
const bookAppointment = async (bookingData) => {
  const response = await fetch('/api/patient/booking/workflow/book/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      doctor_id: bookingData.doctorId,
      hospital_id: bookingData.hospitalId,
      appointment_date: bookingData.date,
      appointment_time: bookingData.time,
      appointment_type: bookingData.type || 'consultation'
    })
  })
  return response.json()
}
```

**Request:**
```json
{
  "doctor_id": 1,
  "hospital_id": 1,
  "appointment_date": "2025-11-20",
  "appointment_time": "10:00",
  "appointment_type": "consultation"
}
```

**Response:**
```json
{
  "success": true,
  "appointment_id": 42,
  "custom_id": "APT-42-20251111",
  "confirmation_code": "APPT-42-20251111",
  "message": "Appointment booked successfully",
  "appointment": {
    "doctor": "Dr. John Smith",
    "hospital": "Central Hospital",
    "date": "2025-11-20",
    "time": "10:00",
    "type": "consultation"
  }
}
```

---

## 4. Settings & Privacy API

### Get User Settings
**API Endpoint:** `GET /api/patient/settings/`

```javascript
const fetchSettings = async () => {
  const response = await fetch('/api/patient/settings/', {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  return response.json()
}
```

**Response:**
```json
{
  "user_info": {
    "id": 1,
    "custom_id": "PAT-001",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "contact_no": "+1-555-0100",
    "gender": "Male",
    "date_of_birth": "1990-01-15",
    "age": 34
  },
  "profile_info": {
    "blood_group": "O+",
    "allergies": "Penicillin",
    "chronic_diseases": "None",
    "height": 180,
    "weight": 75,
    "photo": "http://example.com/photo.jpg"
  },
  "account_settings": {
    "created_at": "2025-01-01T10:00:00Z",
    "updated_at": "2025-11-10T15:30:00Z",
    "is_active": true
  }
}
```

---

### Update User Settings
**API Endpoint:** `PATCH /api/patient/settings/`

```javascript
const updateSettings = async (updates) => {
  const response = await fetch('/api/patient/settings/', {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updates)
  })
  return response.json()
}

// Example usage
updateSettings({
  first_name: 'John',
  last_name: 'Doe',
  contact_no: '+1-555-0101',
  blood_group: 'A+',
  allergies: 'Penicillin, Aspirin'
})
```

---

### Get Privacy Settings
**API Endpoint:** `GET /api/patient/privacy/`

```javascript
const fetchPrivacy = async () => {
  const response = await fetch('/api/patient/privacy/', {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  return response.json()
}
```

**Response:**
```json
{
  "profile_visibility": "private",
  "show_medical_history": false,
  "allow_doctor_contact": true,
  "allow_notifications": true,
  "data_sharing_consent": false,
  "marketing_emails": false
}
```

---

### Update Privacy Settings
**API Endpoint:** `PATCH /api/patient/privacy/`

```javascript
const updatePrivacy = async (privacySettings) => {
  const response = await fetch('/api/patient/privacy/', {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(privacySettings)
  })
  return response.json()
}
```

---

## Implementation Checklist

### Backend (API)
- ✅ `PatientHospitalListView` - List hospitals
- ✅ `PatientDoctorsByHospitalView` - Get doctors by hospital
- ✅ `PatientDoctorScheduleView` - Get available slots
- ✅ `PatientBookAppointmentView` - Create appointment
- ✅ `PatientSettingsView` - Get/Update settings
- ✅ `PatientPrivacyView` - Get/Update privacy
- ✅ `PatientMedicalReportsListView` - Get medical reports

### Frontend Integration
- [ ] Update `BookAppointment.jsx` with new API endpoints
- [ ] Create `HealthAnalytics.jsx` with AI chatbot
- [ ] Update `PatientReports.jsx` to fetch from API
- [ ] Create `PatientSettings.jsx` component
- [ ] Create `PatientPrivacy.jsx` component
- [ ] Add API utility functions for all endpoints

### Testing
- [ ] Test hospital listing
- [ ] Test doctor filtering by hospital
- [ ] Test schedule/slot fetching
- [ ] Test appointment booking flow
- [ ] Test settings retrieval and updates
- [ ] Test privacy settings
- [ ] Test AI chatbot integration

---

## API Summary Table

| Component | Method | Endpoint | Purpose |
|-----------|--------|----------|---------|
| Hospital Selection | GET | `/api/patient/booking/workflow/hospitals/` | List all hospitals |
| Doctor Selection | GET | `/api/patient/booking/workflow/doctors/?hospital_id=X` | Get doctors by hospital |
| Schedule View | GET | `/api/patient/booking/workflow/schedule/?doctor_id=X&date=YYYY-MM-DD` | Get available slots |
| Book Appointment | POST | `/api/patient/booking/workflow/book/` | Create appointment |
| Settings | GET/PATCH | `/api/patient/settings/` | Get/Update user settings |
| Privacy | GET/PATCH | `/api/patient/privacy/` | Get/Update privacy settings |
| Medical Reports | GET/POST | `/api/patient/medical-reports-api/` | Get/Upload reports |
| AI Chatbot | POST | `/api/patient/ai-chatbot/` | AI health consultation |

---

## Error Handling

### Common Errors and Solutions

**400 Bad Request - Missing hospital_id**
```json
{
  "error": "doctor_id is required"
}
```
Solution: Ensure query parameters are provided

**404 Not Found - Doctor not found**
```json
{
  "error": "Doctor not found"
}
```
Solution: Verify doctor_id exists in database

**400 Bad Request - Slot already booked**
```json
{
  "error": "This time slot is already booked"
}
```
Solution: Show user alternative slots

**401 Unauthorized**
Solution: Ensure valid authentication token is provided

---

## Performance Optimization

1. **Caching**
   - Cache hospital list (changes infrequently)
   - Cache doctor list for 1 hour
   - Cache schedule for same-day requests

2. **Pagination**
   - Implement pagination for doctors list
   - Show 10 doctors per page

3. **Lazy Loading**
   - Load schedule only when doctor selected
   - Load available slots on-demand

---

## Security Considerations

1. ✅ All endpoints require `IsAuthenticated` permission
2. ✅ Only patient can access own data (via `IsPatientUser` permission)
3. ✅ Medical data is sensitive - use HTTPS only
4. ✅ Token expiration should be enforced
5. ⚠️ TODO: Add rate limiting to prevent abuse

---

**Last Updated:** November 11, 2025
**Status:** Implementation Complete
