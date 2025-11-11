# Patient Interface Implementation - Complete Documentation

## Project Overview
Complete implementation of patient interface with:
1. ✅ Multi-step appointment booking workflow
2. ✅ AI-powered health chatbot in analytics
3. ✅ Medical reports management via API
4. ✅ Settings and privacy management
5. ✅ All required backend APIs

---

## 📋 Table of Contents
1. [Backend APIs](#backend-apis)
2. [Frontend Components](#frontend-components)
3. [Integration Guide](#integration-guide)
4. [API Endpoints Reference](#api-endpoints-reference)
5. [Testing Guide](#testing-guide)
6. [Deployment Checklist](#deployment-checklist)

---

## Backend APIs

### 1. Hospital Selection API
**Endpoint:** `GET /api/patient/booking/workflow/hospitals/`

**Purpose:** List all available hospitals for appointment booking

**Query Parameters:**
- `search` (optional): Search hospitals by name or location
- `ordering` (optional): Order results by `name` or `created_at`

**Response:**
```json
[
  {
    "id": 1,
    "name": "Central Hospital",
    "address": "123 Medical Street",
    "city": "New York",
    "contact_no1": "+1-555-0123",
    "email": "info@centralhospital.com"
  }
]
```

**Status Codes:**
- `200`: Success
- `401`: Unauthorized
- `403`: Forbidden (not a patient)

---

### 2. Doctor by Hospital API
**Endpoint:** `GET /api/patient/booking/workflow/doctors/?hospital_id=1`

**Purpose:** Get all doctors from a selected hospital

**Query Parameters:**
- `hospital_id` (required): Hospital ID
- `search` (optional): Search by doctor name or specialization
- `ordering` (optional): Order by specialization or experience_years

**Response:**
```json
[
  {
    "id": 1,
    "user": {
      "id": 5,
      "first_name": "John",
      "last_name": "Smith"
    },
    "specialization": "Cardiology",
    "experience_years": 10,
    "hospital": "Central Hospital",
    "is_active": true
  }
]
```

---

### 3. Doctor Schedule API
**Endpoint:** `GET /api/patient/booking/workflow/schedule/?doctor_id=1&date=2025-11-20`

**Purpose:** Get available appointment slots for a doctor

**Query Parameters:**
- `doctor_id` (required): Doctor ID
- `date` (optional): Appointment date (YYYY-MM-DD), defaults to today

**Response:**
```json
{
  "doctor_id": 1,
  "doctor_name": "Dr. John Smith",
  "specialization": "Cardiology",
  "appointment_date": "2025-11-20",
  "available_slots": ["09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30", "15:00"],
  "total_available": 8,
  "booked_count": 2
}
```

---

### 4. Book Appointment API
**Endpoint:** `POST /api/patient/booking/workflow/book/`

**Purpose:** Create a new appointment

**Request Body:**
```json
{
  "doctor_id": 1,
  "hospital_id": 1,
  "appointment_date": "2025-11-20",
  "appointment_time": "10:00",
  "appointment_type": "consultation"
}
```

**Response (Success):**
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

**Error Responses:**
- `400`: Slot already booked or invalid date/time
- `401`: Unauthorized
- `404`: Doctor/Hospital/Patient profile not found

---

### 5. Settings API
**Endpoint:** `GET/PATCH /api/patient/settings/`

**GET Response:**
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

**PATCH Request:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "contact_no": "+1-555-0101",
  "blood_group": "A+",
  "allergies": "Penicillin, Aspirin",
  "chronic_diseases": "Hypertension",
  "height": 180,
  "weight": 75
}
```

---

### 6. Privacy API
**Endpoint:** `GET/PATCH /api/patient/privacy/`

**GET Response:**
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

**PATCH Request:**
```json
{
  "profile_visibility": "doctors",
  "show_medical_history": true,
  "allow_doctor_contact": true,
  "allow_notifications": true,
  "data_sharing_consent": false,
  "marketing_emails": false
}
```

---

### 7. Medical Reports API
**Endpoint:** `GET/POST /api/patient/medical-reports-api/`

**GET Response:**
```json
[
  {
    "id": 1,
    "report_type": "Lab Report",
    "description": "Blood test report",
    "report_file": "http://example.com/report.pdf",
    "created_at": "2025-11-10T10:30:00Z"
  }
]
```

**POST Request (multipart/form-data):**
- `report_file`: File (required)
- `report_type`: String (required) - "Lab Report", "X-Ray", "CT Scan", etc.
- `description`: String (optional)

---

### 8. AI Chatbot API
**Endpoint:** `POST /api/patient/ai-chatbot/`

**Request:**
```json
{
  "message": "I have a headache, what should I do?",
  "context": "History of migraines"
}
```

**Response:**
```json
{
  "response": "Based on your symptoms, here are some suggestions...",
  "confidence_score": 0.87,
  "suggested_actions": [
    "Rest in a quiet environment",
    "Stay hydrated",
    "Apply a cold compress"
  ],
  "disclaimer": "This is AI-generated advice and not a substitute for professional medical advice..."
}
```

---

## Frontend Components

### 1. BookAppointmentWorkflow.jsx
**Location:** `/frontend/src/pages/BookAppointmentWorkflow.jsx`

**Features:**
- ✅ 5-step appointment booking workflow
- ✅ Hospital selection with search
- ✅ Doctor filtering by hospital
- ✅ Real-time schedule availability
- ✅ Appointment type selection
- ✅ Confirmation screen
- ✅ Success notification with redirect

**Props:** None (uses Auth and Theme contexts)

**Usage:**
```jsx
import BookAppointmentWorkflow from '../pages/BookAppointmentWorkflow'

<BookAppointmentWorkflow />
```

---

### 2. PatientHealthAnalytics.jsx
**Location:** `/frontend/src/components/PatientHealthAnalytics.jsx`

**Features:**
- ✅ Health metrics charts (weight, BP, HR)
- ✅ Weekly activity tracking
- ✅ AI-powered chatbot widget
- ✅ Message history with timestamps
- ✅ Confidence scores display
- ✅ Suggested actions from AI
- ✅ Auto-scrolling message feed

**Integrations:**
- Recharts for visualizations
- Lucide icons for UI
- Theme context for styling

**Usage:**
```jsx
import PatientHealthAnalytics from '../components/PatientHealthAnalytics'

<PatientHealthAnalytics />
```

---

### 3. PatientSettingsAndPrivacy.jsx
**Location:** `/frontend/src/components/PatientSettingsAndPrivacy.jsx`

**Features:**
- ✅ Profile information editing
- ✅ Medical history management
- ✅ Privacy preferences
- ✅ Data sharing controls
- ✅ Communication settings
- ✅ Tab-based navigation
- ✅ Form validation
- ✅ Success/error messages

**Tabs:**
1. Profile Settings - Personal info, blood group, height, weight
2. Privacy & Preferences - Data sharing, notifications, visibility

**Usage:**
```jsx
import PatientSettingsAndPrivacy from '../components/PatientSettingsAndPrivacy'

<PatientSettingsAndPrivacy />
```

---

### 4. PatientMedicalReportsAPI.jsx
**Location:** `/frontend/src/components/PatientMedicalReportsAPI.jsx`

**Features:**
- ✅ View all medical reports
- ✅ Upload new reports
- ✅ Multiple report types supported
- ✅ File drag-and-drop support
- ✅ Download reports
- ✅ Preview reports
- ✅ Delete reports
- ✅ File size display

**Supported Report Types:**
- Lab Report
- X-Ray
- CT Scan
- Ultrasound
- MRI
- ECG
- Blood Test
- Prescription
- Other

**Usage:**
```jsx
import PatientMedicalReportsAPI from '../components/PatientMedicalReportsAPI'

<PatientMedicalReportsAPI />
```

---

## Integration Guide

### Step 1: Update App Router
Add new routes in your main routing file:

```jsx
import BookAppointmentWorkflow from '../pages/BookAppointmentWorkflow'
import PatientHealthAnalytics from '../components/PatientHealthAnalytics'
import PatientSettingsAndPrivacy from '../components/PatientSettingsAndPrivacy'
import PatientMedicalReportsAPI from '../components/PatientMedicalReportsAPI'

// In your routes
<Route path="/book-appointment" element={<BookAppointmentWorkflow />} />
<Route path="/health-analytics" element={<PatientHealthAnalytics />} />
<Route path="/settings" element={<PatientSettingsAndPrivacy />} />
<Route path="/medical-reports" element={<PatientMedicalReportsAPI />} />
```

### Step 2: Update Navigation Links
Add links in your navigation component:

```jsx
<Link to="/book-appointment">Book Appointment</Link>
<Link to="/health-analytics">Health Analytics</Link>
<Link to="/medical-reports">Medical Reports</Link>
<Link to="/settings">Settings</Link>
```

### Step 3: Update Patient Dashboard
Replace or integrate with existing components:

```jsx
// In PatientDashboard.jsx
import PatientHealthAnalytics from './PatientHealthAnalytics'

// Add tab for analytics
<Tab name="Analytics">
  <PatientHealthAnalytics />
</Tab>
```

---

## API Endpoints Reference

| Feature | Method | Endpoint | Purpose |
|---------|--------|----------|---------|
| **Booking Workflow** | | | |
| List Hospitals | GET | `/api/patient/booking/workflow/hospitals/` | Get all hospitals |
| Get Doctors | GET | `/api/patient/booking/workflow/doctors/?hospital_id=X` | Filter doctors by hospital |
| Get Schedule | GET | `/api/patient/booking/workflow/schedule/?doctor_id=X&date=YYYY-MM-DD` | Get available slots |
| Book Appointment | POST | `/api/patient/booking/workflow/book/` | Create appointment |
| **User Management** | | | |
| Get Settings | GET | `/api/patient/settings/` | Retrieve user settings |
| Update Settings | PATCH | `/api/patient/settings/` | Update user info |
| Get Privacy | GET | `/api/patient/privacy/` | Retrieve privacy settings |
| Update Privacy | PATCH | `/api/patient/privacy/` | Update privacy settings |
| **Medical Data** | | | |
| List Reports | GET | `/api/patient/medical-reports-api/` | Get all reports |
| Upload Report | POST | `/api/patient/medical-reports-api/` | Upload new report |
| AI Chatbot | POST | `/api/patient/ai-chatbot/` | Get AI health advice |

---

## Testing Guide

### Manual Testing

#### 1. Test Hospital Selection
```bash
# Get list of hospitals
curl -X GET http://127.0.0.1:8000/api/patient/booking/workflow/hospitals/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 2. Test Doctor Filtering
```bash
# Get doctors from hospital
curl -X GET "http://127.0.0.1:8000/api/patient/booking/workflow/doctors/?hospital_id=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 3. Test Schedule Fetching
```bash
# Get available slots
curl -X GET "http://127.0.0.1:8000/api/patient/booking/workflow/schedule/?doctor_id=1&date=2025-11-20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 4. Test Appointment Booking
```bash
# Book an appointment
curl -X POST http://127.0.0.1:8000/api/patient/booking/workflow/book/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "doctor_id": 1,
    "hospital_id": 1,
    "appointment_date": "2025-11-20",
    "appointment_time": "10:00",
    "appointment_type": "consultation"
  }'
```

#### 5. Test Settings API
```bash
# Get settings
curl -X GET http://127.0.0.1:8000/api/patient/settings/ \
  -H "Authorization: Bearer YOUR_TOKEN"

# Update settings
curl -X PATCH http://127.0.0.1:8000/api/patient/settings/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "contact_no": "+1-555-0101"
  }'
```

#### 6. Test Medical Reports
```bash
# Get reports
curl -X GET http://127.0.0.1:8000/api/patient/medical-reports-api/ \
  -H "Authorization: Bearer YOUR_TOKEN"

# Upload report (multipart)
curl -X POST http://127.0.0.1:8000/api/patient/medical-reports-api/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "report_file=@/path/to/report.pdf" \
  -F "report_type=Lab Report" \
  -F "description=Blood test results"
```

#### 7. Test AI Chatbot
```bash
# Send message to chatbot
curl -X POST http://127.0.0.1:8000/api/patient/ai-chatbot/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I have a headache",
    "context": "History of migraines"
  }'
```

---

## Frontend Testing Checklist

### Appointment Booking Flow
- [ ] Can select hospital
- [ ] Doctor list updates after hospital selection
- [ ] Can search for doctors
- [ ] Can select date and see available slots
- [ ] Can select time slot
- [ ] Can confirm booking
- [ ] Receives success message and redirects

### Health Analytics
- [ ] Charts render correctly
- [ ] Can send message to chatbot
- [ ] Receives AI response
- [ ] Confidence score displays
- [ ] Suggested actions show
- [ ] Chat message history persists

### Medical Reports
- [ ] Can view list of reports
- [ ] Can upload new report
- [ ] File validation works
- [ ] Can preview reports
- [ ] Can download reports
- [ ] Can delete reports

### Settings & Privacy
- [ ] Can view all profile information
- [ ] Can edit profile information
- [ ] Changes save successfully
- [ ] Can toggle privacy settings
- [ ] Changes apply immediately

---

## Deployment Checklist

### Backend Deployment
- [ ] Run migrations: `python manage.py migrate`
- [ ] Collect static files: `python manage.py collectstatic`
- [ ] Test all API endpoints
- [ ] Verify authentication working
- [ ] Check CORS settings
- [ ] Enable HTTPS
- [ ] Set appropriate cache headers

### Frontend Deployment
- [ ] Build production bundle: `npm run build`
- [ ] Update API base URL for production
- [ ] Test all components with production API
- [ ] Verify error handling
- [ ] Check responsive design
- [ ] Test on different browsers
- [ ] Deploy to hosting service

### Post-Deployment
- [ ] Monitor error logs
- [ ] Check API response times
- [ ] Verify all endpoints accessible
- [ ] Test user workflows
- [ ] Collect user feedback
- [ ] Monitor database queries
- [ ] Set up automated backups

---

## Performance Optimization

### Backend Optimization
1. **Caching:**
   - Cache hospital list (24 hours)
   - Cache doctor list by hospital (1 hour)

2. **Pagination:**
   - Implement for large report lists
   - Limit initial results

3. **Query Optimization:**
   - Use `select_related()` for foreign keys
   - Use `prefetch_related()` for many-to-many

### Frontend Optimization
1. **Lazy Loading:**
   - Load components on demand
   - Defer non-critical data

2. **Memoization:**
   - Memoize expensive computations
   - Use React.memo for components

3. **Caching:**
   - Cache API responses locally
   - Implement service worker

---

## Troubleshooting

### Common Issues

**401 Unauthorized**
- Ensure token is valid
- Check token expiration
- Verify Authorization header format

**404 Not Found**
- Verify endpoint URL
- Check doctor/hospital IDs exist
- Ensure all URL parameters provided

**400 Bad Request**
- Validate request body format
- Check date/time format (YYYY-MM-DD, HH:MM)
- Ensure all required fields provided

**500 Internal Server Error**
- Check server logs
- Verify database connectivity
- Check for AI model initialization errors

---

## Support & Documentation

- **API Documentation**: Available at `/api/docs/`
- **Frontend Components**: See component files for prop documentation
- **Error Handling**: Check console logs and error messages

---

**Last Updated:** November 11, 2025
**Status:** ✅ Implementation Complete
**Version:** 1.0.0
