# Complete Dashboard API Integration Plan

## Current Status
✅ Patient Dashboard APIs: IMPLEMENTED & FIXED
✅ Doctor Dashboard APIs: PARTIALLY IMPLEMENTED  
✅ Hospital Dashboard APIs: PARTIALLY IMPLEMENTED

---

## Issue: Database Schema Mismatch
The database has an incomplete schema. The Appointment table is missing several required fields:
- appointment_type (should exist but missing from DB)
- token_number (should exist but missing from DB)
- other FK relationships

### Root Cause
The database was created with an old migration that didn't include all fields. The migration system can't auto-detect and fix this because the migration history is incomplete.

### Solution
We'll create a comprehensive SQL-based migration that will rebuild the Appointment table with all required fields using a data-safe approach.

---

## Implementation Plan for All 3 Dashboards

### 1. Patient Dashboard (DONE - needs database fix)
- PatientDashboardView ✅
- PatientHealthAnalyticsView ✅  
- PatientAppointmentsHistoryView ✅
- PatientPrescriptionsView ✅
- PatientNotificationsView ✅

### 2. Doctor Dashboard (TO DO)
**Views needed:**
- DoctorDashboardView - Main dashboard with stats
- DoctorAppointmentsView - List of appointments
- DoctorPatientsView - List of patients
- DoctorPrescriptionsView - Prescriptions issued
- DoctorScheduleView - Doctor's schedule

**Serializers needed:**
- DoctorDashboardSerializer
- DoctorAppointmentDetailSerializer  
- DoctorPatientListSerializer
- DoctorPrescriptionSerializer

### 3. Hospital Dashboard (TO DO)
**Views needed:**
- HospitalDashboardView - Main dashboard with stats
- HospitalStaffView - Staff management
- HospitalAppointmentsView - All hospital appointments
- HospitalBedsView - Bed management
- HospitalAnalyticsView - Hospital statistics
- HospitalDepartmentsView - Department management

**Serializers needed:**
- HospitalDashboardSerializer
- HospitalStaffSerializer
- HospitalBedsSerializer
- HospitalAppointmentDetailSerializer
- HospitalAnalyticsSerializer

---

## Quick Fix Strategy

Since the database schema is broken, the best approach is:

1. **Immediate**: Create a robust migration that rebuilds tables if needed
2. **Short-term**: Implement all 3 dashboards with proper serializers and views
3. **Integration**: Update frontend API calls to match backend endpoints
4. **Testing**: Verify all 3 dashboards work end-to-end

---

## Next Steps (Priority Order)

1. ✅ Fix patient dashboard database issue
2. ⏳ Create doctor dashboard endpoints
3. ⏳ Create hospital dashboard endpoints  
4. ⏳ Update frontend API integration
5. ⏳ Test all three dashboards together

