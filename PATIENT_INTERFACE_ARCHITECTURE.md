# Patient Interface - Visual Architecture & Workflow

## 🏗️ Component Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Patient Dashboard                      │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────────────┐    ┌──────────────────────┐   │
│  │ PatientReports      │    │ PatientAppointments  │   │
│  ├─────────────────────┤    ├──────────────────────┤   │
│  │ • Reports list      │    │ • Filter controls    │   │
│  │ • Search & filter   │    │ • Appointments list  │   │
│  │ • Generate Summary  │    │ • Book button ✨     │   │
│  │   └─→ Summary Modal │    │ • Modal integration  │   │
│  │                     │    │   └─→ Booking Modal  │   │
│  └─────────────────────┘    └──────────────────────┘   │
│                                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │  BookAppointmentModal (NEW)                     │   │
│  ├─────────────────────────────────────────────────┤   │
│  │  Step 1: Hospital Selection                     │   │
│  │  Step 2: Doctor Selection (by Hospital)         │   │
│  │  Step 3: Date Selection                         │   │
│  │  Step 4: Time Slot Selection                    │   │
│  │  Step 5: Details Form + Summary Preview         │   │
│  │  Step 6: Confirmation                           │   │
│  └─────────────────────────────────────────────────┘   │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow - Medical Reports

```
┌─────────────────────────────────────────────────────────────┐
│ PatientReports Component                                     │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │  Component Mounts     │
              │  useEffect triggered  │
              └───────────────────────┘
                          │
                          ▼
        ┌─────────────────────────────────┐
        │   GET /api/patient/           │
        │   medical-reports-api/        │
        └─────────────────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │  setReports(data)     │
              │  setLoading(false)    │
              └───────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │  Render Reports List  │
              └───────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │ User clicks:          │
              │ "Generate Summary"    │
              └───────────────────────┘
                          │
                          ▼
        ┌─────────────────────────────────────┐
        │   POST /api/patient/reports/       │
        │   {id}/ai-summary/                 │
        └─────────────────────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │  setSummary(text)     │
              │  showModal = true     │
              └───────────────────────┘
                          │
                          ▼
        ┌─────────────────────────────────┐
        │   Display Summary Modal with    │
        │   AI-generated summary text     │
        └─────────────────────────────────┘
```

---

## 📋 Data Flow - Appointment Booking

```
┌──────────────────────────────────────────────────────────────┐
│  User clicks "Book Appointment" button in PatientAppointments  │
└──────────────────────────────────────────────────────────────┘
                           │
                           ▼
        ┌────────────────────────────────┐
        │ BookAppointmentModal Opens     │
        │ currentStep = 1                │
        └────────────────────────────────┘
                           │
                ┌──────────┴──────────┐
                │                     │
                ▼                     ▼
        ┌──────────────┐      ┌──────────────┐
        │  STEP 1      │      │ API CALL     │
        │ Hospital     │◄─────│ Hospitals    │
        │ Selection    │      │ GET /        │
        └──────────────┘      └──────────────┘
                │
        User selects hospital
                │
                ▼
        ┌──────────────┐
        │  STEP 2      │
        │ Doctor       │ ◄─── API: GET /doctors/?hospital_id=X
        │ Selection    │
        │ (filtered)   │
        └──────────────┘
                │
        User selects doctor
                │
                ▼
        ┌──────────────┐
        │  STEP 3      │
        │ Date         │
        │ Selection    │
        │ (calendar)   │
        └──────────────┘
                │
        User selects date
                │
                ▼
        ┌──────────────┐      ┌──────────────┐
        │  STEP 4      │◄─────│ API CALL     │
        │ Time Slot    │      │ Schedule     │
        │ Selection    │      │ GET /        │
        └──────────────┘      └──────────────┘
                │
        User selects time
                │
                ▼
        ┌──────────────────────┐
        │  STEP 5              │
        │ Details + Summary    │
        │ • Reason (required)  │
        │ • Notes (optional)   │
        │ • Preview all data   │
        └──────────────────────┘
                │
        User confirms details
                │
                ▼
        ┌──────────────────────┐      ┌──────────────┐
        │ Booking in Progress  │◄─────│ API CALL     │
        │ POST /book/          │      │ Create appt. │
        └──────────────────────┘      └──────────────┘
                │
                ▼
        ┌──────────────────────┐
        │ Success! Modal closes│
        │ onSuccess callback   │
        │ • Refresh appts list │
        │ • Show confirmation  │
        └──────────────────────┘
```

---

## 🔌 API Integration Map

```
┌────────────────────────────────────────────────────────────┐
│                    BACKEND APIs                             │
├────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─ Medical Reports ────────────────────────────────────┐  │
│  │ ✅ GET /api/patient/medical-reports-api/            │  │
│  │    Returns: Array of medical report objects          │  │
│  │                                                       │  │
│  │ ✅ POST /api/patient/reports/{id}/ai-summary/       │  │
│  │    Input: {} (empty body)                            │  │
│  │    Returns: { "summary": "AI text" }                 │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─ Booking Workflow ──────────────────────────────────┐  │
│  │                                                       │  │
│  │ ✅ GET /api/patient/booking/workflow/hospitals/     │  │
│  │    Returns: Array of hospital objects                │  │
│  │    Used in: Step 1 (Hospital Selection)              │  │
│  │                                                       │  │
│  │ ✅ GET /api/patient/booking/workflow/doctors/       │  │
│  │    Params: hospital_id                               │  │
│  │    Returns: Array of doctor objects                  │  │
│  │    Used in: Step 2 (Doctor Selection)                │  │
│  │                                                       │  │
│  │ ✅ GET /api/patient/booking/workflow/schedule/      │  │
│  │    Params: doctor_id, date (YYYY-MM-DD)             │  │
│  │    Returns: { "available_slots": [...] }             │  │
│  │    Used in: Step 4 (Time Slot Selection)             │  │
│  │                                                       │  │
│  │ ✅ POST /api/patient/booking/workflow/book/         │  │
│  │    Body: {                                            │  │
│  │      hospital_id, doctor_id,                         │  │
│  │      appointment_date, appointment_time,             │  │
│  │      reason, additional_notes                        │  │
│  │    }                                                  │  │
│  │    Returns: Appointment confirmation                 │  │
│  │    Used in: Step 6 (Final Confirmation)              │  │
│  │                                                       │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
└────────────────────────────────────────────────────────────┘

Frontend              Backend
┌────────────┐        ┌────────────────┐
│PatientReports│──────▶│Medical Reports│
│             │        │    APIs        │
└────────────┘        └────────────────┘

┌────────────┐        ┌────────────────┐
│PatientAppt │        │Booking         │
│  Modal     │──────▶│Workflow APIs   │
│            │        │                │
└────────────┘        └────────────────┘
```

---

## 🎯 State Management Flow

```
┌─────────────────────────────────────────────────────────┐
│              BookAppointmentModal States                │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  currentStep: 1-5                                        │
│  ├─ controls which form step is shown                   │
│  └─ incremented/decremented by navigation buttons       │
│                                                           │
│  selectedHospital: Hospital object | null               │
│  ├─ selected by user in Step 1                          │
│  └─ used to fetch doctors in Step 2                     │
│                                                           │
│  selectedDoctor: Doctor object | null                   │
│  ├─ selected by user in Step 2                          │
│  └─ used to fetch time slots in Step 4                  │
│                                                           │
│  appointmentDate: "YYYY-MM-DD" | ""                    │
│  ├─ set by user in Step 3                              │
│  └─ used to fetch time slots in Step 4                  │
│                                                           │
│  selectedTimeSlot: "HH:MM" | null                      │
│  ├─ selected by user in Step 4                          │
│  └─ sent in booking payload                             │
│                                                           │
│  appointmentDetails: {                                  │
│    reason: string (required)                           │
│    additionalNotes: string (optional)                  │
│  }                                                       │
│  ├─ filled by user in Step 5                            │
│  └─ sent in booking payload                             │
│                                                           │
│  error: string | null                                   │
│  ├─ set when API calls fail                             │
│  └─ displayed in error banner                           │
│                                                           │
│  Loading states:                                         │
│  ├─ hospitalLoading: fetching hospitals                 │
│  ├─ doctorLoading: fetching doctors                     │
│  ├─ timeSlotLoading: fetching time slots                │
│  └─ isBooking: posting appointment                      │
│                                                           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              PatientReports States                       │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  reports: [] - array of report objects                 │
│  filteredReports: [] - filtered reports                │
│  loading: boolean - initial fetch state                 │
│  error: null | string - API error message               │
│  searchTerm: "" - search input value                    │
│  filterType: "all" - selected report type               │
│                                                           │
│  Summary Modal States:                                  │
│  ├─ showSummaryModal: boolean                           │
│  ├─ selectedReport: Report object | null                │
│  ├─ summary: string | null                              │
│  ├─ summaryLoading: boolean                             │
│  └─ summaryError: null | string                         │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 🎨 UI Component Hierarchy

```
PatientAppointments
│
├─ Header
│  ├─ Title & Description
│  └─ "Book Appointment" Button ◄─── Opens Modal
│
├─ Filters Card
│  ├─ Status Filter
│  └─ Time Period Filter
│
├─ Appointments List Card
│  └─ foreach appointment
│     ├─ Appointment Details
│     ├─ Status Badge
│     ├─ Doctor & Hospital Info
│     └─ Action Buttons (Cancel/View)
│
└─ BookAppointmentModal (conditional render)
   │
   ├─ Header
   │  ├─ Title & Step Indicator
   │  └─ Close Button
   │
   ├─ Progress Bar
   │
   ├─ Error Alert (conditional)
   │
   ├─ Content (Step-specific)
   │  ├─ Step 1: Hospital Selection
   │  ├─ Step 2: Doctor Selection
   │  ├─ Step 3: Date Picker
   │  ├─ Step 4: Time Slot Grid
   │  └─ Step 5: Details Form + Summary
   │
   └─ Navigation
      ├─ Previous Button
      ├─ Next/Book Button
      └─ Loading Indicator
```

---

## 🔐 Authentication Flow

```
All API Requests:

┌─────────────────────────────────────┐
│  Frontend Component                 │
└─────────────────────────────────────┘
            │
            ▼
┌──────────────────────────────────────┐
│  Get token from localStorage         │
│  const token = localStorage          │
│    .getItem('accessToken')           │
└──────────────────────────────────────┘
            │
            ▼
┌──────────────────────────────────────┐
│  Prepare Headers                     │
│  headers: {                          │
│    'Authorization': `Bearer ${token}`│
│  }                                   │
└──────────────────────────────────────┘
            │
            ▼
┌──────────────────────────────────────┐
│  Make API Call with Headers          │
│  axios.get/post(url, {...}, {        │
│    headers: {...}                    │
│  })                                  │
└──────────────────────────────────────┘
            │
        ┌───┴───┐
        │       │
        ▼       ▼
    ┌───┐   ┌────────┐
    │200│   │401/403 │ ◄─── Logout & Show Error
    └───┘   └────────┘
        │
        ▼
   Render Data
```

---

## 🚀 Deployment Checklist

```
Frontend:
  ✅ PatientReports.jsx updated
  ✅ BookAppointmentModal.jsx created
  ✅ PatientAppointments.jsx updated
  ✅ All imports correct
  ✅ No console errors
  ✅ Tested on mobile
  ✅ Theme integration working
  ✅ Error handling working

Backend:
  ✅ /api/patient/medical-reports-api/ endpoint
  ✅ /api/patient/reports/{id}/ai-summary/ endpoint
  ✅ /api/patient/booking/workflow/hospitals/ endpoint
  ✅ /api/patient/booking/workflow/doctors/ endpoint
  ✅ /api/patient/booking/workflow/schedule/ endpoint
  ✅ /api/patient/booking/workflow/book/ endpoint
  ✅ All endpoints return expected format
  ✅ Authentication working
  ✅ Error handling working

Testing:
  ✅ Reports load correctly
  ✅ Summary generates successfully
  ✅ Booking workflow completes
  ✅ Error scenarios handled
  ✅ Mobile responsive
  ✅ Theme switching works
```

---

## 📊 Response Time Expectations

```
API Call             Expected Time    User Feedback
─────────────────────────────────────────────────────
Hospital List        < 500ms          Loading spinner
Doctor List          < 500ms          Loading spinner
Schedule/Slots       < 1000ms         Loading spinner
Book Appointment     < 2000ms         "Booking..." text
Generate Summary     < 3000ms         Loading spinner
Medical Reports      < 1000ms         Loading spinner

Acceptable Total Booking Time: < 10-15 seconds
```

---

## 🎯 Success Criteria

```
Medical Reports Feature:
✅ Reports load from API (not mock data)
✅ "No reports found" shows when empty
✅ Generate Summary button visible on each report
✅ Summary modal opens on button click
✅ AI summary displays in layman's language
✅ Error messages shown when API fails
✅ Mobile responsive layout

Appointment Booking Feature:
✅ Modal opens on "Book Appointment" click
✅ All 5 workflow steps work correctly
✅ Data persists across steps
✅ Hospital → Doctor filtering works
✅ Date validation prevents past dates
✅ Time slots display correctly
✅ Summary preview shows all selections
✅ Booking completes successfully
✅ Success callback triggers
✅ Appointments list refreshes
✅ Error scenarios handled gracefully
✅ Mobile responsive layout
✅ Theme integration working
```

---

This visual architecture document provides a complete overview of how the patient interface components work together.
