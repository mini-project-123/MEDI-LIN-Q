# MediLinQ - Demo Credentials

## Login URL
**http://localhost:3000/login**

---

## Hospital Admins (3)

### City Hospital
- **Email:** `admin@cityhospital.com`
- **Password:** `CityHosp@123`
- **Role:** Hospital Admin
- **Hospital:** City Hospital

### Apollo Medical Center
- **Email:** `admin@apollomedical.com`
- **Password:** `Apollo@123`
- **Role:** Hospital Admin
- **Hospital:** Apollo Medical Center

### St. Mary's Hospital
- **Email:** `admin@stmarys.com`
- **Password:** `StMary@123`
- **Role:** Hospital Admin
- **Hospital:** St. Mary's Hospital

---

## Doctors (7)

### City Hospital

**Dr. James Wilson** - Cardiology
- **Email:** `james.wilson@cityhospital.com`
- **Password:** `DrWilson@123`
- **Experience:** 10 years

**Dr. Sarah Mitchell** - Orthopedics
- **Email:** `sarah.mitchell@cityhospital.com`
- **Password:** `DrMitchell@123`
- **Experience:** 8 years

**Dr. Michael Johnson** - Neurology
- **Email:** `michael.johnson@cityhospital.com`
- **Password:** `DrJohnson@123`
- **Experience:** 12 years

### Apollo Medical Center

**Dr. Emily Chen** - Pediatrics
- **Email:** `emily.chen@apollomedical.com`
- **Password:** `DrChen@123`
- **Experience:** 7 years

**Dr. David Kumar** - Internal Medicine
- **Email:** `david.kumar@apollomedical.com`
- **Password:** `DrKumar@123`
- **Experience:** 9 years

### St. Mary's Hospital

**Dr. Lisa Anderson** - Oncology
- **Email:** `lisa.anderson@stmarys.com`
- **Password:** `DrAnderson@123`
- **Experience:** 15 years

**Dr. Robert Thompson** - Gastroenterology
- **Email:** `robert.thompson@stmarys.com`
- **Password:** `DrThompson@123`
- **Experience:** 11 years

---

## Patients (7)

### City Hospital

**John Smith**
- **Email:** `john.smith@email.com`
- **Password:** `Patient@Smith1`
- **Blood Group:** O+

**Mary Johnson**
- **Email:** `mary.johnson@email.com`
- **Password:** `Patient@Mary2`
- **Blood Group:** A+

**Robert Brown**
- **Email:** `robert.brown@email.com`
- **Password:** `Patient@Brown3`
- **Blood Group:** B+

### Apollo Medical Center

**Patricia Davis**
- **Email:** `patricia.davis@email.com`
- **Password:** `Patient@Patricia4`
- **Blood Group:** O-

**Michael Wilson**
- **Email:** `michael.wilson@email.com`
- **Password:** `Patient@Mike5`
- **Blood Group:** AB+

### St. Mary's Hospital

**Jennifer Garcia**
- **Email:** `jennifer.garcia@email.com`
- **Password:** `Patient@Jenny6`
- **Blood Group:** O+

**William Martinez**
- **Email:** `william.martinez@email.com`
- **Password:** `Patient@Will7`
- **Blood Group:** A+

---

## Demo Data Summary

- **Total Users:** 17 (3 admins + 7 doctors + 7 patients)
- **Hospitals:** 3
- **Doctors:** 7 (distributed across 3 hospitals)
- **Patients:** 7 (distributed across 3 hospitals)
- **Appointments:** 21 (3 per patient with various statuses)
- **Articles:** 5 (written by doctors)

---

## Features to Test

### Hospital Admin Dashboard
- ✅ View and manage patients
- ✅ View and manage doctors
- ✅ View appointments
- ✅ Upload medical reports for patients
- ✅ View hospital analytics
- ✅ Write articles

### Doctor Dashboard
- ✅ View appointments
- ✅ View patients
- ✅ Filter patients by consultation type
- ✅ View patient history
- ✅ Write articles

### Patient Dashboard
- ✅ View appointments
- ✅ Book appointments
- ✅ View medical reports
- ✅ View AI summary of reports
- ✅ View prescriptions
- ✅ View health analytics
- ✅ Read articles

---

## Quick Start

1. **Start Backend:**
   ```bash
   python manage.py runserver
   ```

2. **Start Frontend:**
   ```bash
   npm start
   ```

3. **Login with any credential above**

4. **Test the features!**

---

## Notes

- All passwords are case-sensitive
- Each user has access to their respective hospital's data
- Patients can only see their own appointments and reports
- Doctors can see patients from their hospital
- Hospital admins can manage all data for their hospital
