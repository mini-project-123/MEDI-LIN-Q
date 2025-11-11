# 🚀 Quick Start Guide

## Prerequisites

- Python 3.8+ installed
- Node.js 16+ installed
- Django backend set up and running
- PostgreSQL/MySQL database configured

---

## Step 1: Start the Backend

```bash
# Navigate to backend directory
cd backend

# Activate virtual environment (if using one)
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Run migrations (if not done already)
python manage.py makemigrations
python manage.py migrate

# Create superuser (optional, for admin access)
python manage.py createsuperuser

# Start the Django development server
python manage.py runserver
```

✅ Backend should now be running on: `http://127.0.0.1:8000`

---

## Step 2: Start the Frontend

```bash
# Open a new terminal
# Navigate to frontend directory
cd frontend

# Install dependencies (first time only)
npm install

# Start the development server
npm run dev
```

✅ Frontend should now be running on: `http://localhost:5173`

---

## Step 3: Test the Application

### 1. Register a New Account

1. Open browser and go to: `http://localhost:5173`
2. Click "Sign Up"
3. Choose a role (Patient, Doctor, or Hospital)
4. Fill in the registration form
5. Click "Sign Up"

### 2. Complete Your Profile

After registration, you'll be redirected to complete your profile:

**Patient**:
- Blood group
- Emergency contact
- Allergies
- Photo (optional)

**Doctor**:
- Personal details (name, contact, DOB)
- Professional details (specialization, qualification)
- Hospital affiliation
- Photo (optional)

**Hospital**:
- Hospital name and address
- Contact numbers
- License number
- Operating hours
- Photo (optional)

### 3. Access Your Dashboard

After completing your profile, you'll be redirected to your role-specific dashboard:

**Patient Dashboard**:
- View upcoming appointments
- View medical reports
- View prescriptions
- Book new appointments

**Doctor Dashboard**:
- View patient list
- View appointments
- Manage prescriptions
- View analytics

**Hospital Dashboard**:
- View all patients
- View all doctors
- Manage staff
- View appointments
- View analytics

---

## Step 4: Book an Appointment (Patient)

1. From patient dashboard, click "Book Appointment"
2. Select a hospital
3. Select a doctor
4. Choose a date
5. Select a time slot
6. Add reason and notes (optional)
7. Click "Book Appointment"

✅ Appointment will be created and visible in all dashboards

---

## Common Commands

### Backend

```bash
# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start server
python manage.py runserver

# Run tests
python manage.py test

# Create new app
python manage.py startapp app_name
```

### Frontend

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Troubleshooting

### Backend Issues

**Issue**: `ModuleNotFoundError: No module named 'rest_framework'`
```bash
pip install djangorestframework
```

**Issue**: `django.db.utils.OperationalError: no such table`
```bash
python manage.py migrate
```

**Issue**: `CORS Error`
- Check `CORS_ALLOWED_ORIGINS` in `settings.py`
- Should include: `http://localhost:5173`

### Frontend Issues

**Issue**: `Cannot GET /api/...`
- Make sure backend is running on port 8000
- Check `.env` file has correct API URL

**Issue**: `401 Unauthorized`
- Clear localStorage and login again
- Check if token is expired

**Issue**: `Network Error`
- Make sure backend is running
- Check if firewall is blocking port 8000

---

## Environment Variables

### Backend (`backend/.env`)
```
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://user:password@localhost/dbname
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

### Frontend (`frontend/.env`)
```
VITE_API_BASE_URL=http://127.0.0.1:8000
```

---

## Default Ports

- **Backend**: `http://127.0.0.1:8000`
- **Frontend**: `http://localhost:5173`
- **Database**: `localhost:5432` (PostgreSQL) or `localhost:3306` (MySQL)

---

## Testing Credentials

After creating accounts through the UI, you can use them to test:

**Example Patient**:
- Email: `patient@example.com`
- Password: (whatever you set during registration)

**Example Doctor**:
- Email: `doctor@example.com`
- Password: (whatever you set during registration)

**Example Hospital**:
- Email: `hospital@example.com`
- Password: (whatever you set during registration)

---

## API Documentation

### Authentication Endpoints

```
POST /api/register/
POST /api/login/
POST /api/login/refresh/
```

### Patient Endpoints

```
GET  /api/dashboard/
POST /api/profile/patient/
POST /api/booking/create/
GET  /api/booking/doctors/
GET  /api/booking/hospitals/
```

### Doctor Endpoints

```
GET  /api/doctor/dashboard-summary/
POST /api/profile/doctor/
GET  /api/doctor/patients/
GET  /api/doctor/appointments/
GET  /api/doctor/prescriptions/
```

### Hospital Endpoints

```
GET  /api/hospital/dashboard-summary/
POST /api/profile/hospital/
GET  /api/hospital/doctors/
GET  /api/hospital/patients/
GET  /api/hospital/staff/
GET  /api/hospital/appointments/
```

---

## Next Steps

1. ✅ Test all user flows (registration, login, profile completion)
2. ✅ Test appointment booking
3. ✅ Test role-based dashboards
4. ✅ Test API endpoints with Postman/curl
5. ✅ Check browser console for errors
6. ✅ Check Django logs for backend errors

---

## Support

For issues or questions:
1. Check `REFACTORING_COMPLETE.md` for detailed documentation
2. Check `BACKEND_FRONTEND_INTEGRATION.md` for API details
3. Check browser console for frontend errors
4. Check Django terminal for backend errors
5. Check `TESTING_CHECKLIST.md` for comprehensive testing

---

## 🎉 You're All Set!

The application is now fully integrated and ready to use. Happy coding! 🚀
