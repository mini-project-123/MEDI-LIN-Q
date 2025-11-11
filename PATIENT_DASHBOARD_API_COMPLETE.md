# Patient Dashboard API - Complete Implementation Guide

## 🎯 Overview

Complete REST API endpoints for patient dashboard functionality including profile management, medical records, appointments, prescriptions, notifications, and health analytics.

## 📚 API Endpoints Summary

### Base URL
```
http://127.0.0.1:8000/api/
```

### Authentication
All endpoints require `Authorization: Bearer <token>` header (JWT token from login)

### Role Requirement
Most endpoints require `IsPatientUser` permission (user.role = 'patient')

---

## 📋 Endpoint Reference

### 1. PROFILE MANAGEMENT

#### Create Patient Profile (Step 2 Registration)
```
POST /patient/profile/patient/
Content-Type: multipart/form-data

Parameters:
{
  "blood_group": "O+",
  "emergency_contact_no": "9876543210",
  "emergency_contact_relation": "Brother",
  "allergies": "Penicillin, Dust",
  "photo": <image_file>
}

Response (201):
{
  "blood_group": "O+",
  "emergency_contact_no": "9876543210",
  "emergency_contact_relation": "Brother",
  "allergies": "Penicillin, Dust",
  "photo": "http://...patient_photos/..."
}
```

#### Get/Update Patient Profile
```
GET /patient/profile/update/

Response (200):
{
  "blood_group": "O+",
  "emergency_contact_no": "9876543210",
  "emergency_contact_relation": "Brother",
  "allergies": "Penicillin, Dust",
  "photo": "http://...patient_photos/..."
}

---

PATCH /patient/profile/update/
Content-Type: multipart/form-data

Parameters:
{
  "blood_group": "AB+",
  "emergency_contact_no": "9876543210",
  "allergies": "Penicillin, Dust, Latex"
}

Response (200):
{
  "blood_group": "AB+",
  ...
}
```

---

### 2. DASHBOARD & ANALYTICS

#### Get Patient Dashboard (Main Data)
```
GET /patient/dashboard/

Response (200):
{
  "profile": {
    "user": {
      "first_name": "John",
      "last_name": "Doe",
      "custom_id": "P-A1B2C3D4",
      "gender": "M",
      "email": "patient@email.com",
      "contact_no": "9876543210"
    }
  },
  "upcoming_appointments": [
    {
      "id": 1,
      "custom_id": "APP-001",
      "status": "confirmed",
      "token_number": 5,
      "doctor": {
        "user": {
          "first_name": "Dr. Smith",
          "last_name": "Johnson"
        },
        "specialization": "Cardiology"
      },
      "hospital": {
        "name": "City Hospital"
      },
      "appointment_date": "2025-11-20",
      "appointment_time": "10:30:00"
    }
  ],
  "recent_appointments": [...],
  "prescriptions": [
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
  ],
  "notifications": [
    {
      "id": 1,
      "message": "Your appointment is confirmed",
      "is_read": false,
      "created_at": "2025-11-15T10:30:00Z"
    }
  ],
  "stats": {
    "total_appointments": 15,
    "upcoming_appointments": 2,
    "unread_notifications": 3
  }
}
```

#### Get Health Analytics
```
GET /patient/analytics/

Response (200):
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
      {
        "month": "September",
        "count": 3
      },
      {
        "month": "October",
        "count": 4
      },
      {
        "month": "November",
        "count": 5
      }
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

### 3. MEDICAL REPORTS

#### List Medical Reports
```
GET /patient/medical-reports/

Query Parameters:
- page: 1 (pagination)
- limit: 10 (per page)

Response (200):
[
  {
    "id": 1,
    "report_type": "Blood Test",
    "description": "Complete blood count",
    "report_file": "http://...medical_reports/...",
    "created_at": "2025-11-10T14:30:00Z"
  },
  {
    "id": 2,
    "report_type": "X-Ray",
    "description": "Chest X-Ray",
    "report_file": "http://...medical_reports/...",
    "created_at": "2025-11-05T10:15:00Z"
  }
]
```

#### Upload Medical Report
```
POST /patient/medical-reports/
Content-Type: multipart/form-data

Parameters:
{
  "report_type": "Blood Test",
  "description": "Complete blood count",
  "report_file": <file>,
  "appointment": 1 (optional)
}

Response (201):
{
  "id": 1,
  "report_type": "Blood Test",
  "description": "Complete blood count",
  "report_file": "http://...medical_reports/...",
  "created_at": "2025-11-10T14:30:00Z"
}
```

#### Get Report Details
```
GET /patient/medical-reports/<id>/

Response (200):
{
  "id": 1,
  "report_type": "Blood Test",
  "description": "Complete blood count",
  "report_file": "http://...medical_reports/...",
  "created_at": "2025-11-10T14:30:00Z"
}
```

#### Delete Medical Report
```
DELETE /patient/medical-reports/<id>/

Response (204): No content
```

---

### 4. APPOINTMENTS

#### List All Appointments (with Filtering)
```
GET /patient/appointments/

Query Parameters:
- page: 1
- status: 'pending', 'confirmed', 'completed', 'cancelled' (optional)
- type: 'consultation', 'follow_up', 'procedure' (optional)
- from_date: '2025-11-01' (YYYY-MM-DD)
- to_date: '2025-11-30'
- ordering: '-appointment_datetime' or 'appointment_datetime'

Example:
GET /patient/appointments/?status=completed&from_date=2025-01-01&ordering=-appointment_datetime

Response (200):
{
  "count": 15,
  "next": "http://.../patient/appointments/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "custom_id": "APP-001",
      "status": "confirmed",
      "token_number": 5,
      "doctor": {
        "user": {
          "first_name": "Dr. Smith",
          "last_name": "Johnson"
        },
        "specialization": "Cardiology"
      },
      "hospital": {
        "name": "City Hospital"
      },
      "appointment_date": "2025-11-20",
      "appointment_time": "10:30:00"
    }
  ]
}
```

#### Get Appointment Details
```
GET /patient/appointments/<id>/

Response (200):
{
  "id": 1,
  "custom_id": "APP-001",
  "status": "confirmed",
  "appointment_type": "consultation",
  "token_number": 5,
  "doctor": {
    "user": {
      "first_name": "Dr. Smith",
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
  "updated_at": "2025-11-15T09:00:00Z",
  "prescriptions": [
    {
      "id": 1,
      "medication": {"name": "Aspirin"},
      "dosage": "500mg",
      "frequency": "Twice daily",
      "duration": "7 days",
      "notes": "Take after meals",
      "prescription_date": "2025-11-20",
      "doctor": "Dr. Smith Johnson"
    }
  ]
}
```

#### Create Appointment
```
POST /patient/booking/create/

Parameters:
{
  "doctor": 1,
  "hospital": 1,
  "appointment_datetime": "2025-11-25T14:30:00Z",
  "appointment_type": "consultation"
}

Response (201):
{
  "id": 1,
  "custom_id": "APP-001",
  "status": "pending",
  ...
}
```

#### Cancel Appointment
```
PATCH /patient/appointments/<id>/manage/

Parameters:
{
  "status": "cancelled"
}

Response (200):
{
  "id": 1,
  "custom_id": "APP-001",
  "status": "cancelled",
  ...
}
```

---

### 5. PRESCRIPTIONS

#### List Prescriptions (with Filtering)
```
GET /patient/prescriptions/

Query Parameters:
- page: 1
- search: 'Aspirin' (search by medication name)
- status: 'active', 'expired', 'completed' (optional)
- ordering: '-created_at' (default) or 'created_at'

Example:
GET /patient/prescriptions/?status=active&search=Aspirin

Response (200):
{
  "count": 20,
  "results": [
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
  ]
}
```

#### Get Prescription Details
```
GET /patient/prescriptions/<id>/

Response (200):
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

---

### 6. NOTIFICATIONS

#### List Notifications
```
GET /patient/notifications/

Query Parameters:
- page: 1
- is_read: 'true' or 'false' (optional)
- ordering: '-created_at' (default)

Example:
GET /patient/notifications/?is_read=false

Response (200):
{
  "count": 5,
  "results": [
    {
      "id": 1,
      "message": "Your appointment is confirmed",
      "is_read": false,
      "created_at": "2025-11-15T10:30:00Z"
    }
  ]
}
```

#### Mark Notification as Read
```
PATCH /patient/notifications/<id>/

Parameters:
{
  "is_read": true
}

Response (200):
{
  "id": 1,
  "message": "Your appointment is confirmed",
  "is_read": true,
  "created_at": "2025-11-15T10:30:00Z"
}
```

---

### 7. DOCTOR SEARCH & BOOKING

#### List Public Doctors
```
GET /patient/booking/doctors/

Query Parameters:
- search: 'cardiology' or 'Smith' (searches name, specialization)
- page: 1

Response (200):
{
  "count": 25,
  "results": [
    {
      "user": {
        "first_name": "Dr. Smith",
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
  ]
}
```

#### Advanced Doctor Search
```
GET /patient/booking/doctors/search/

Query Parameters:
- search: 'Smith' (optional)
- specialization: 'Cardiology' (exact match)
- hospital: 1 (hospital ID)
- experience_min: 5
- experience_max: 20

Example:
GET /patient/booking/doctors/search/?specialization=Cardiology&experience_min=5&hospital=1

Response (200):
[
  {...doctor objects...}
]
```

#### List Public Hospitals
```
GET /patient/booking/hospitals/

Query Parameters:
- search: 'City' (searches name, address)
- page: 1

Response (200):
{
  "count": 10,
  "results": [
    {
      "id": 1,
      "custom_id": "HOSP-001",
      "name": "City Hospital",
      "address": "123 Main St, City",
      "operating_hours": "9:00-18:00",
      "photo": "http://..."
    }
  ]
}
```

---

## 🔐 Error Responses

### 400 Bad Request
```json
{
  "error": "Validation error message",
  "details": {
    "field_name": ["Error message"]
  }
}
```

### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 403 Forbidden
```json
{
  "detail": "You do not have permission to perform this action."
}
```

### 404 Not Found
```json
{
  "detail": "Not found."
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error message"
}
```

---

## 📱 Frontend Integration Examples

### Fetch Dashboard Data
```javascript
import { patientAPI } from '../utils/api'

const fetchDashboard = async () => {
  try {
    const response = await patientAPI.getDashboard()
    console.log(response.data)
    // Use response.data for UI
  } catch (error) {
    console.error('Dashboard fetch failed:', error)
  }
}
```

### Fetch All Appointments
```javascript
const fetchAppointments = async (status = null) => {
  try {
    let url = '/patient/appointments/'
    if (status) {
      url += `?status=${status}`
    }
    const response = await patientAPI.get(url)
    return response.data
  } catch (error) {
    console.error('Failed to fetch appointments:', error)
  }
}
```

### Upload Medical Report
```javascript
const uploadReport = async (formData) => {
  try {
    const response = await patientAPI.post('/patient/medical-reports/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  } catch (error) {
    console.error('Report upload failed:', error)
  }
}
```

---

## 🧪 Testing Checklist

- [ ] Create patient profile successfully
- [ ] Retrieve patient profile
- [ ] Update patient profile with new blood group
- [ ] Get dashboard data without errors
- [ ] Get health analytics
- [ ] List medical reports
- [ ] Upload new medical report
- [ ] Delete medical report
- [ ] List appointments with filters
- [ ] Get appointment details
- [ ] Cancel appointment
- [ ] List prescriptions with search
- [ ] Get prescription details
- [ ] List notifications
- [ ] Mark notification as read
- [ ] Search doctors with filters
- [ ] Search hospitals
- [ ] Create new appointment

---

## 📝 Notes

- All timestamps are in UTC (ISO 8601 format)
- Pagination uses page numbers (page=1, page=2, etc.)
- Default page size is 10 items
- Filtering is case-insensitive for search fields
- Dates should be in YYYY-MM-DD format
- DateTime values should be in ISO 8601 format (2025-11-15T14:30:00Z)

