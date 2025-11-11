# 🚀 QUICK START - API Deployment

## Start the Servers

### Terminal 1: Backend
```bash
cd d:\Projects\Medi Lin Q
.\venv\Scripts\python.exe manage.py runserver
```

Expected Output:
```
Starting development server at http://127.0.0.1:8000/
Django version 4.2.x
Quit the server with CTRL-BREAK.
```

### Terminal 2: Frontend
```bash
cd d:\Projects\Medi Lin Q\frontend
npm run dev
```

Expected Output:
```
VITE v4.x.x  ready in 234 ms
  ➜  Local:   http://localhost:5173/
```

---

## Test the APIs

### 1. Get JWT Token (for testing)
```bash
curl -X POST http://127.0.0.1:8000/api/token/ ^
  -H "Content-Type: application/json" ^
  -d "{\"username\": \"your_user\", \"password\": \"your_password\"}"
```

Response:
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### 2. Test Patient Dashboard
```bash
curl -X GET http://127.0.0.1:8000/api/dashboard/ ^
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Expected Response (200 OK):
```json
{
  "profile": {
    "user": {
      "first_name": "John",
      "last_name": "Doe",
      "custom_id": "P-123456",
      "email": "john@example.com"
    }
  },
  "upcoming_appointments": [],
  "recent_appointments": [],
  "prescriptions": [],
  "notifications": [],
  "stats": {
    "total_appointments": 0,
    "upcoming_appointments": 0,
    "unread_notifications": 0
  }
}
```

### 3. Test Doctor Dashboard
```bash
curl -X GET http://127.0.0.1:8000/api/doctor/dashboard/ ^
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. Test Hospital Dashboard
```bash
curl -X GET http://127.0.0.1:8000/api/hospital/dashboard/ ^
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## All Available Endpoints

### Patient Dashboard APIs
```
GET    /api/dashboard/                 - Dashboard summary
GET    /api/analytics/                 - Health analytics
GET    /api/appointments/              - List appointments
GET    /api/appointments/{id}/         - Appointment detail
POST   /api/appointments/create/       - Create appointment
PATCH  /api/appointments/{id}/manage/  - Update appointment
GET    /api/prescriptions/             - List prescriptions
GET    /api/prescriptions/{id}/        - Prescription detail
GET    /api/medical-reports/           - List reports
GET    /api/medical-reports/{id}/      - Report detail
POST   /api/medical-reports/           - Upload report
DELETE /api/medical-reports/{id}/      - Delete report
GET    /api/notifications/             - List notifications
GET    /api/doctors/                   - Search doctors
GET    /api/hospitals/                 - Search hospitals
```

### Doctor Dashboard APIs
```
GET    /api/doctor/dashboard/          - Dashboard summary
GET    /api/doctor/patients/           - Patient list
GET    /api/doctor/patients/{id}/      - Patient detail
GET    /api/doctor/patients/{id}/summary/ - AI patient summary
GET    /api/doctor/appointments/       - Appointment list
GET    /api/doctor/profile/            - Profile detail
POST   /api/doctor/profile/create/     - Create profile
PATCH  /api/doctor/profile/            - Update profile
```

### Hospital Dashboard APIs
```
GET    /api/hospital/dashboard/        - Dashboard summary
GET    /api/hospital/doctors/          - Doctor list
GET    /api/hospital/staff/            - Staff list
GET    /api/hospital/patients/         - Patient list
GET    /api/hospital/wards/            - Ward list
GET    /api/hospital/appointments/     - Appointment list
GET    /api/hospital/analytics/        - Analytics
POST   /api/hospital/staff/create/     - Create staff
PATCH  /api/hospital/staff/{id}/       - Update staff
DELETE /api/hospital/staff/{id}/       - Delete staff
POST   /api/hospital/patients/create/  - Create patient
GET    /api/hospital/patients/{id}/    - Patient detail
PATCH  /api/hospital/patients/{id}/    - Update patient
DELETE /api/hospital/patients/{id}/    - Delete patient
POST   /api/hospital/patients/{id}/reports/ - Upload report
```

---

## Database Status

### ✅ All Tables Present
- api_user
- api_patientprofile
- api_doctorprofile
- api_hospital
- api_staffprofile
- api_appointment
- api_prescription
- api_medicalreport
- api_notification
- api_article
- api_medication
- api_bed
- api_ward

### ✅ All Columns Present
- appointment_date (DateField)
- appointment_time (TimeField)
- appointment_type (CharField)
- status (CharField)
- updated_at (DateTimeField)
- And all other required columns

---

## File Locations

### Views
- Patient: `api/views/patient_views.py`
- Doctor: `api/views/doctor_views.py`
- Hospital: `api/views/hospital_views.py`

### Serializers
- Patient: `api/serializers/patient_serializers.py`
- Doctor: `api/serializers/doctor_serializers.py`
- Hospital: `api/serializers/hospital_serializers.py`

### URLs
- Patient: `api/urls/patient_urls.py`
- Doctor: `api/urls/doctor_urls.py`
- Hospital: `api/urls/hospital_urls.py`

### Frontend
- API Layer: `frontend/src/utils/api.js`
- Dashboard Component: `frontend/src/components/Dashboard/`

---

## Common Issues & Solutions

### Issue: 401 Unauthorized
**Solution:** Include valid JWT token in Authorization header
```bash
-H "Authorization: Bearer YOUR_TOKEN"
```

### Issue: 403 Forbidden
**Solution:** Verify user has correct role (patient/doctor/hospital_admin)

### Issue: 404 Not Found
**Solution:** Check endpoint URL spelling and method (GET/POST/PATCH/DELETE)

### Issue: Database errors
**Solution:** Run `python validate_all_schemas.py` to check schema

### Issue: Django won't start
**Solution:** Run `python manage.py check` to see errors

---

## Performance Tips

### Use Pagination
```bash
curl "http://127.0.0.1:8000/api/appointments/?page=1&page_size=20"
```

### Use Filtering
```bash
curl "http://127.0.0.1:8000/api/appointments/?status=confirmed&date=2025-11-11"
```

### Use Search
```bash
curl "http://127.0.0.1:8000/api/doctors/?search=cardiologist"
```

---

## Development Commands

### Check Django
```bash
python manage.py check
```

### Run Migrations
```bash
python manage.py migrate
```

### Create Superuser
```bash
python manage.py createsuperuser
```

### Run Tests
```bash
python test_dashboard_view.py
```

### Validate Schema
```bash
python validate_all_schemas.py
```

### Check Schema
```bash
python check_db_schema.py
```

---

## Documentation Files

| File | Purpose |
|------|---------|
| PRODUCTION_READY.md | Complete status report |
| FINAL_REPORT.md | Executive summary |
| DATABASE_FIX_COMPLETE.md | Database schema details |
| DASHBOARDS_CORRECTED.md | Bug fixes applied |
| BUG_FIX_SUMMARY.md | All fixes record |
| COMPLETE_DASHBOARDS_INTEGRATION.md | Implementation guide |

---

## Key Points to Remember

✅ All three dashboards are implemented  
✅ All database columns are present  
✅ All APIs are working  
✅ Django check passes  
✅ Tests are passing  

🚀 Ready to deploy!

---

**Last Updated:** November 11, 2025  
**Status:** PRODUCTION READY
