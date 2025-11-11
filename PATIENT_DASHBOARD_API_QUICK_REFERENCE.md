# Patient Dashboard API - Quick Reference Guide

## 🚀 Quick Start for Frontend Developers

### Base URL
```
http://127.0.0.1:8000/api/
```

### Authentication
All requests must include:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

---

## 📍 Most Common Endpoints

### Get Dashboard (Everything at Once)
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://127.0.0.1:8000/api/patient/dashboard/
```

### Get Health Analytics
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://127.0.0.1:8000/api/patient/analytics/
```

### List All Appointments
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://127.0.0.1:8000/api/patient/appointments/
```

### List Appointments (Completed Only)
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://127.0.0.1:8000/api/patient/appointments/?status=completed
```

### Get Specific Appointment
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://127.0.0.1:8000/api/patient/appointments/1/
```

### List Prescriptions
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://127.0.0.1:8000/api/patient/prescriptions/
```

### Search Active Prescriptions
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://127.0.0.1:8000/api/patient/prescriptions/?status=active
```

### List Medical Reports
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://127.0.0.1:8000/api/patient/medical-reports/
```

### Upload Medical Report
```bash
curl -X POST \
  -H "Authorization: Bearer TOKEN" \
  -F "report_type=Blood Test" \
  -F "description=CBC" \
  -F "report_file=@report.pdf" \
  http://127.0.0.1:8000/api/patient/medical-reports/
```

### Search Doctors
```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://127.0.0.1:8000/api/patient/booking/doctors/search/?specialization=Cardiology"
```

### Get Notifications
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://127.0.0.1:8000/api/patient/notifications/
```

### Mark Notification as Read
```bash
curl -X PATCH \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"is_read": true}' \
  http://127.0.0.1:8000/api/patient/notifications/1/
```

---

## 🔍 Query Parameters Cheat Sheet

### Appointments
```
?status=pending          # Filter by status
?status=confirmed
?status=completed
?status=cancelled

?type=consultation       # Filter by type
?type=follow_up
?type=procedure

?from_date=2025-11-01    # Date range
?to_date=2025-11-30

?ordering=-appointment_datetime  # Sort
?page=2                  # Pagination
```

### Prescriptions
```
?search=Aspirin          # Search medication
?status=active           # Active (last 30 days)
?status=expired          # Expired (older than 30 days)
?ordering=-created_at    # Sort by creation
?page=1                  # Pagination
```

### Notifications
```
?is_read=false           # Unread only
?is_read=true            # Read only
?ordering=-created_at    # Sort (newest first)
```

### Doctor Search
```
?search=Smith            # Search by name
?search=Cardiology       # Search by specialization

?specialization=Cardiology   # Exact specialization
?hospital=1              # Filter by hospital ID
?experience_min=5        # Minimum experience
?experience_max=20       # Maximum experience
```

---

## 📊 Response Examples

### Appointment Object
```json
{
  "id": 1,
  "custom_id": "APP-001",
  "status": "confirmed",
  "appointment_type": "consultation",
  "token_number": 5,
  "doctor": {
    "user": {
      "first_name": "Smith",
      "last_name": "Johnson"
    },
    "specialization": "Cardiology"
  },
  "hospital": {
    "name": "City Hospital"
  },
  "appointment_date": "2025-11-20",
  "appointment_time": "10:30:00",
  "created_at": "2025-11-15T09:00:00Z",
  "updated_at": "2025-11-15T09:00:00Z"
}
```

### Prescription Object
```json
{
  "id": 1,
  "medication": {
    "name": "Aspirin"
  },
  "dosage": "500mg",
  "frequency": "Twice daily",
  "duration": "7 days",
  "notes": "Take after meals",
  "prescription_date": "2025-11-15",
  "doctor": "Dr. Smith Johnson"
}
```

### Medical Report Object
```json
{
  "id": 1,
  "report_type": "Blood Test",
  "description": "Complete blood count",
  "report_file": "http://...medical_reports/file.pdf",
  "created_at": "2025-11-10T14:30:00Z"
}
```

### Notification Object
```json
{
  "id": 1,
  "message": "Your appointment is confirmed",
  "is_read": false,
  "created_at": "2025-11-15T10:30:00Z"
}
```

### Doctor Object
```json
{
  "user": {
    "first_name": "Smith",
    "last_name": "Johnson",
    "custom_id": "D-001",
    "gender": "M",
    "email": "doctor@email.com",
    "contact_no": "9876543210"
  },
  "specialization": "Cardiology",
  "qualification": "MBBS, MD",
  "experience_years": 10,
  "available_days": "Mon,Tue,Wed,Thu,Fri",
  "languages_spoken": "English,Hindi",
  "hospital": {
    "id": 1,
    "custom_id": "HOSP-001",
    "name": "City Hospital",
    "address": "123 Main St",
    "operating_hours": "9:00-18:00",
    "photo": "http://..."
  },
  "photo": "http://..."
}
```

### Analytics Object
```json
{
  "appointments": {
    "total": 15,
    "upcoming": 2,
    "completed": 12,
    "cancelled": 1,
    "this_month": 3,
    "doctors_visited": 5
  },
  "prescriptions": {
    "total": 20,
    "active": 3
  },
  "medical_reports": {
    "total": 8,
    "this_year": 5
  },
  "trends": {
    "appointments_last_3_months": [
      {"month": "September", "count": 3},
      {"month": "October", "count": 4},
      {"month": "November", "count": 5}
    ]
  },
  "profile": {
    "blood_group": "O+",
    "allergies": "Penicillin, Dust",
    "emergency_contact": "9876543210"
  }
}
```

---

## 🛠️ JavaScript/React Integration

### Using Axios
```javascript
import axios from 'axios'

const API_BASE = 'http://127.0.0.1:8000/api'

// Get token from localStorage
const token = localStorage.getItem('access_token')

const headers = {
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json'
}

// Get Dashboard
axios.get(`${API_BASE}/patient/dashboard/`, { headers })
  .then(res => console.log(res.data))
  .catch(err => console.error(err))

// Get Appointments
axios.get(`${API_BASE}/patient/appointments/?status=confirmed`, { headers })
  .then(res => console.log(res.data.results))
  .catch(err => console.error(err))

// Cancel Appointment
axios.patch(`${API_BASE}/patient/appointments/1/manage/`, 
  { status: 'cancelled' }, 
  { headers }
)
  .then(res => console.log('Cancelled'))
  .catch(err => console.error(err))
```

### Using Fetch
```javascript
const token = localStorage.getItem('access_token')

// Get Prescriptions
fetch('http://127.0.0.1:8000/api/patient/prescriptions/?status=active', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
  .then(res => res.json())
  .then(data => console.log(data.results))
  .catch(err => console.error(err))

// Upload Medical Report
const formData = new FormData()
formData.append('report_type', 'Blood Test')
formData.append('description', 'CBC')
formData.append('report_file', fileInput.files[0])

fetch('http://127.0.0.1:8000/api/patient/medical-reports/', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
})
  .then(res => res.json())
  .then(data => console.log('Uploaded'))
  .catch(err => console.error(err))
```

---

## ⚠️ Common Errors

### 401 Unauthorized
**Problem**: Missing or invalid token
**Solution**: Include `Authorization: Bearer <token>` header

### 403 Forbidden
**Problem**: User is not a patient
**Solution**: Make sure user.role = 'patient'

### 404 Not Found
**Problem**: Resource doesn't exist
**Solution**: Check the ID is correct

### 400 Bad Request
**Problem**: Invalid data format
**Solution**: Check query parameters and request body format

### 500 Internal Server Error
**Problem**: Server error
**Solution**: Check Django logs for details

---

## 📋 Endpoint Summary Table

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|----------------|
| `/patient/profile/patient/` | POST | Create profile | ✓ |
| `/patient/profile/update/` | GET | Get profile | ✓ |
| `/patient/profile/update/` | PATCH | Update profile | ✓ |
| `/patient/dashboard/` | GET | Dashboard data | ✓ |
| `/patient/analytics/` | GET | Health analytics | ✓ |
| `/patient/appointments/` | GET | List appointments | ✓ |
| `/patient/appointments/<id>/` | GET | Appointment details | ✓ |
| `/patient/appointments/<id>/manage/` | PATCH | Cancel appointment | ✓ |
| `/patient/prescriptions/` | GET | List prescriptions | ✓ |
| `/patient/prescriptions/<id>/` | GET | Prescription details | ✓ |
| `/patient/medical-reports/` | GET | List reports | ✓ |
| `/patient/medical-reports/` | POST | Upload report | ✓ |
| `/patient/medical-reports/<id>/` | DELETE | Delete report | ✓ |
| `/patient/notifications/` | GET | List notifications | ✓ |
| `/patient/notifications/<id>/` | PATCH | Update notification | ✓ |
| `/patient/booking/doctors/` | GET | List doctors | ✓ |
| `/patient/booking/doctors/search/` | GET | Search doctors | ✓ |
| `/patient/booking/hospitals/` | GET | List hospitals | ✓ |
| `/patient/booking/create/` | POST | Create appointment | ✓ |

---

## 🎓 Tips for Frontend Integration

1. **Always include Authorization header**
   ```javascript
   const token = localStorage.getItem('access_token')
   const headers = { Authorization: `Bearer ${token}` }
   ```

2. **Handle pagination in list endpoints**
   ```javascript
   // First page
   /patient/appointments/?page=1
   
   // Check response for 'next' URL
   if (response.data.next) {
     // Load more
   }
   ```

3. **Use filters to reduce data transfer**
   ```javascript
   // Get only completed appointments instead of all
   /patient/appointments/?status=completed
   ```

4. **Combine multiple filters**
   ```javascript
   /patient/appointments/?status=completed&from_date=2025-01-01&to_date=2025-11-30
   ```

5. **Show loading states during API calls**
   ```javascript
   const [loading, setLoading] = useState(true)
   
   useEffect(() => {
     fetchData()
       .finally(() => setLoading(false))
   }, [])
   ```

6. **Handle errors gracefully**
   ```javascript
   try {
     const data = await fetchData()
   } catch (error) {
     if (error.response?.status === 401) {
       // Redirect to login
     } else if (error.response?.status === 404) {
       // Show not found message
     }
   }
   ```

---

## 🔗 Related Documentation

- `PATIENT_DASHBOARD_API_COMPLETE.md` - Full API documentation
- `PATIENT_DASHBOARD_API_ANALYSIS.md` - Analysis and requirements
- `PATIENT_DASHBOARD_API_IMPLEMENTATION_SUMMARY.md` - Implementation details

