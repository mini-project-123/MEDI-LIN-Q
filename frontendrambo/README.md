# MedLinq - Healthcare Management Platform

A comprehensive healthcare management platform for booking doctor appointments, tracking prescriptions, and monitoring health analytics across multiple hospitals with role-based authentication for patients, doctors, and hospital administrators.

## Features

### Multi-Role Authentication

- **Patient**: Book appointments, view health analytics, manage prescriptions, track medical history
- **Doctor**: View schedule, manage appointments, access patient information with AI summaries
- **Hospital Admin**: Oversee operations, manage doctors, view analytics

### Core Functionality

- Hospital and doctor search
- Real-time appointment booking
- Date and time slot selection
- Emergency contact management
- Allergy tracking
- Responsive design

### Patient-Specific Features

- **Health Analytics Dashboard**: Comprehensive overview of health metrics and appointment history
- **Prescription Management**: Track active and expired prescriptions with detailed medication info
- **Appointment Tracking**: View, filter, and manage appointments with cancellation options
- **Medical History**: Access to all past consultations and medical reports
- **Allergy Alerts**: Important health alerts displayed prominently
- **Doctor Consultation History**: Track all doctors consulted and specializations

### Doctor-Specific Features

- **Comprehensive Dashboard**: Overview with patient statistics, gender/age distribution
- **Appointment Management**: Filter by status, date, time slots with detailed patient info
- **Patient Management**: Search, filter by visit history, detailed patient profiles
- **AI-Powered Summaries**: Automated medical history summaries using Google Gemini AI
- **Profile Management**: Complete professional profile with photo, qualifications, experience
- **Real-time Data**: Live appointment updates and patient information

## Tech Stack

- **Frontend**: React 18, Vite, React Router
- **Styling**: Custom CSS with modern design
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Backend Integration**: Ready for Django REST API

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd doctor-appointment-booking
```

2. Install dependencies

```bash
npm install
```

3. Start the development server

```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

## Backend Integration

This frontend is designed to work with a Django backend. The expected API endpoints are:

### Authentication

- `POST /api/auth/login/` - User login
- `POST /api/auth/signup/` - User registration
- `GET /api/auth/user/` - Get current user

### Patient-Specific Endpoints

- `GET /api/patient/health-analytics/` - Patient health analytics and statistics
- `GET /api/patient/appointments/` - Patient's appointments
- `PATCH /api/patient/appointments/{id}/` - Update appointment (cancel, reschedule)
- `GET /api/patient/prescriptions/` - Patient's prescriptions

### Doctor-Specific Endpoints

- `POST /api/profile/doctor/` - Create doctor profile (Step 2 registration)
- `GET /api/profile/doctor/manage/` - Get doctor profile
- `PATCH /api/profile/doctor/manage/` - Update doctor profile
- `GET /api/doctor/dashboard-summary/` - Doctor dashboard statistics
- `GET /api/doctor/appointments/` - Doctor's appointments with filtering
- `GET /api/doctor/patients/` - Doctor's patients with search/filter
- `GET /api/doctor/patients/{id}/` - Detailed patient information
- `GET /api/patients/{id}/summary/` - AI-generated patient summary

### Hospitals & General

- `GET /api/hospitals/` - List all hospitals
- `GET /api/hospitals/{id}/doctors/` - Get doctors by hospital
- `GET /api/doctors/{id}/available-slots/` - Get available time slots

### Appointments

- `GET /api/appointments/` - User's appointments
- `POST /api/appointments/` - Create new appointment
- `GET /api/dashboard/stats/` - Dashboard statistics

## User Registration Fields

### All Users

- Name
- Email
- Password
- Date of Birth
- Age (auto-calculated)
- Emergency Contact Name
- Emergency Contact Number
- Allergies (optional)

### Role-Specific Fields

#### Doctor

- Specialization
- Hospital ID

#### Hospital Admin

- Hospital Name
- Hospital Address

## Project Structure

```
src/
├── components/
│   ├── Navbar.jsx
│   ├── ProtectedRoute.jsx
│   ├── PatientDashboard.jsx
│   ├── PatientAppointments.jsx
│   ├── PatientPrescriptions.jsx
│   ├── DoctorDashboard.jsx
│   ├── DoctorAppointments.jsx
│   ├── DoctorPatients.jsx
│   └── DoctorProfile.jsx
├── contexts/
│   └── AuthContext.jsx
├── pages/
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── Signup.jsx
│   ├── Dashboard.jsx
│   └── BookAppointment.jsx
├── App.jsx
├── main.jsx
└── index.css
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Environment Setup

The Vite configuration includes a proxy for API calls to `http://localhost:8000`. Update `vite.config.js` if your backend runs on a different port.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
