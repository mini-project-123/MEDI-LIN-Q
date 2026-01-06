# MEDI-LIN-Q Demo Credentials

## Hospital Admins

### City Hospital
- **Email**: admin@cityhospital.com
- **Password**: CityHosp@123
- **Role**: Hospital Admin
- **Features Available**:
  - Manage patients and doctors
  - View hospital analytics
  - Create articles
  - View appointments
  - Manage hospital settings

### Apollo Medical Center
- **Email**: admin@apollomedical.com
- **Password**: Apollo@123
- **Role**: Hospital Admin
- **Features Available**:
  - Manage patients and doctors
  - View hospital analytics
  - Create articles
  - View appointments
  - Manage hospital settings

### St. Mary's Hospital
- **Email**: admin@stmarys.com
- **Password**: StMary@123
- **Role**: Hospital Admin
- **Features Available**:
  - Manage patients and doctors
  - View hospital analytics
  - Create articles
  - View appointments
  - Manage hospital settings

---

## Doctors

### City Hospital

**Dr. James Wilson** (Cardiology)
- **Email**: james.wilson@cityhospital.com
- **Password**: DrWilson@123
- **Specialization**: Cardiology

**Dr. Sarah Mitchell** (Orthopedics)
- **Email**: sarah.mitchell@cityhospital.com
- **Password**: DrMitchell@123
- **Specialization**: Orthopedics

**Dr. Michael Johnson** (Neurology)
- **Email**: michael.johnson@cityhospital.com
- **Password**: DrJohnson@123
- **Specialization**: Neurology

### Apollo Medical Center

**Dr. Emily Chen** (Pediatrics)
- **Email**: emily.chen@apollomedical.com
- **Password**: DrChen@123
- **Specialization**: Pediatrics

**Dr. David Kumar** (Internal Medicine)
- **Email**: david.kumar@apollomedical.com
- **Password**: DrKumar@123
- **Specialization**: Internal Medicine

### St. Mary's Hospital

**Dr. Lisa Anderson** (Oncology)
- **Email**: lisa.anderson@stmarys.com
- **Password**: DrAnderson@123
- **Specialization**: Oncology

**Dr. Robert Thompson** (Gastroenterology)
- **Email**: robert.thompson@stmarys.com
- **Password**: DrThompson@123
- **Specialization**: Gastroenterology

---

## Patients

### City Hospital

**John Smith**
- **Email**: john.smith@email.com
- **Password**: Patient@Smith1
- **Blood Group**: O+

**Mary Johnson**
- **Email**: mary.johnson@email.com
- **Password**: Patient@Mary2
- **Blood Group**: A+

**Robert Brown**
- **Email**: robert.brown@email.com
- **Password**: Patient@Brown3
- **Blood Group**: B+

### Apollo Medical Center

**Patricia Davis**
- **Email**: patricia.davis@email.com
- **Password**: Patient@Patricia4
- **Blood Group**: O-

**Michael Wilson**
- **Email**: michael.wilson@email.com
- **Password**: Patient@Mike5
- **Blood Group**: AB+

### St. Mary's Hospital

**Jennifer Garcia**
- **Email**: jennifer.garcia@email.com
- **Password**: Patient@Jenny6
- **Blood Group**: O+

**William Martinez**
- **Email**: william.martinez@email.com
- **Password**: Patient@Will7
- **Blood Group**: A+

---

## Demo Data Overview

- **3 Hospitals**: City Hospital, Apollo Medical Center, St. Mary's Hospital
- **7 Doctors**: Distributed across 3 hospitals with various specializations
- **7 Patients**: Distributed across 3 hospitals
- **14-21 Appointments**: Realistic appointment data with past and future dates
- **5 Healthcare Articles**: Published articles by doctors

---

## Login URL

All users can login at: **http://localhost:3003/login**

## Dashboard Features to Test

### Hospital Admin Dashboard
- Patient Management (add, view, edit, delete patients)
- Doctor Management (add, view, edit, delete doctors)
- Appointments View
- Analytics Dashboard
- Write Articles
- Hospital Settings

### Doctor Dashboard
- View Appointments
- Patient History
- Write Articles
- Doctor Settings

### Patient Portal
- Book Appointments
- View Appointments
- View Medical History
- Read Articles
- Patient Settings

---

## Fixed Issues (This Session)

✅ **Patient List Pagination** - Fixed response handling for patient list after adding new patients
✅ **Doctor List Pagination** - Fixed response handling for doctor list after adding new doctors
✅ **Article Creation** - Enabled hospital admins to create articles (previously restricted to doctors only)
✅ **Demo Data Population** - Successfully created comprehensive database with interconnected data
