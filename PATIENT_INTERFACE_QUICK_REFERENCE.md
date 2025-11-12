# Patient Interface Quick Reference - AI Features

## 🚀 Quick Start

### Files Modified
1. ✅ `frontend/src/components/PatientReports.jsx` - API integration + AI summaries
2. ✅ `frontend/src/components/BookAppointmentModal.jsx` - NEW multi-step booking
3. ✅ `frontend/src/components/PatientAppointments.jsx` - Modal integration

### What Changed

#### PatientReports.jsx
```
BEFORE: Mock data hardcoded
AFTER:  Calls /api/patient/medical-reports-api/
        + Generate Summary button (calls /api/patient/reports/{id}/ai-summary/)
        + AI Summary modal with layman's language explanations
```

#### BookAppointmentModal.jsx (NEW)
```
7-Step workflow:
1. Hospital Selection → GET /api/patient/booking/workflow/hospitals/
2. Doctor Selection → GET /api/patient/booking/workflow/doctors/?hospital_id=X
3. Date Selection → Calendar picker
4. Time Slot Selection → GET /api/patient/booking/workflow/schedule/?doctor_id=X&date=YYYY-MM-DD
5. Appointment Details → Form with reason + notes
6. Summary Preview → Review all selections
7. Book → POST /api/patient/booking/workflow/book/
```

#### PatientAppointments.jsx
```
Added: Import BookAppointmentModal
Added: showBookingModal state
Added: "Book Appointment" button in header
Added: Modal component at end with success callback
```

---

## 🔌 API Endpoints

### Medical Reports
```
GET /api/patient/medical-reports-api/
Returns: Array of patient's medical reports

POST /api/patient/reports/{id}/ai-summary/
Body: {} (empty)
Returns: { "summary": "AI-generated summary text" }
```

### Appointment Booking Workflow
```
GET /api/patient/booking/workflow/hospitals/
Returns: Array of hospitals

GET /api/patient/booking/workflow/doctors/?hospital_id=1
Returns: Array of doctors for hospital

GET /api/patient/booking/workflow/schedule/?doctor_id=1&date=2024-02-20
Returns: { "available_slots": ["09:00", "09:30", ...] }

POST /api/patient/booking/workflow/book/
Body: {
  "hospital_id": 1,
  "doctor_id": 1,
  "appointment_date": "2024-02-20",
  "appointment_time": "10:30",
  "reason": "General checkup",
  "additional_notes": "Optional notes"
}
Returns: Appointment confirmation
```

---

## 🎨 Components Structure

```
PatientAppointments.jsx
├── Header with "Book Appointment" button
├── Filters (Status, Time Period)
├── Appointments List
├── BookAppointmentModal (conditional render)
│   ├── Step 1: Hospital Selection
│   ├── Step 2: Doctor Selection
│   ├── Step 3: Date Selection
│   ├── Step 4: Time Slot Selection
│   ├── Step 5: Details + Summary Preview
│   ├── Navigation Buttons
│   └── Progress Bar
└── Callback handling (refresh appointments on success)

PatientReports.jsx
├── Header
├── Error Alert (if any)
├── Search & Filter Bar
├── Reports List
│   └── For each report:
│       ├── Report info
│       ├── View & Download buttons
│       └── Generate Summary button (NEW)
└── AI Summary Modal (conditional render)
    ├── Summary loading state
    ├── Summary display
    └── Close button
```

---

## 🔐 Authentication

All API calls include JWT token:
```javascript
const token = localStorage.getItem('accessToken')
const response = await axios.get(url, {
  headers: { 'Authorization': `Bearer ${token}` }
})
```

---

## ⚙️ State Management

### PatientReports
```javascript
const [reports, setReports] = useState([])
const [filteredReports, setFilteredReports] = useState([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState(null)
const [searchTerm, setSearchTerm] = useState('')
const [filterType, setFilterType] = useState('all')

// Summary modal
const [showSummaryModal, setShowSummaryModal] = useState(false)
const [selectedReport, setSelectedReport] = useState(null)
const [summary, setSummary] = useState(null)
const [summaryLoading, setSummaryLoading] = useState(false)
const [summaryError, setSummaryError] = useState(null)
```

### BookAppointmentModal
```javascript
const [currentStep, setCurrentStep] = useState(1)

// Step data
const [hospitals, setHospitals] = useState([])
const [selectedHospital, setSelectedHospital] = useState(null)
const [doctors, setDoctors] = useState([])
const [selectedDoctor, setSelectedDoctor] = useState(null)
const [appointmentDate, setAppointmentDate] = useState('')
const [timeSlots, setTimeSlots] = useState([])
const [selectedTimeSlot, setSelectedTimeSlot] = useState(null)
const [appointmentDetails, setAppointmentDetails] = useState({
  reason: '',
  additionalNotes: ''
})

// UI states
const [error, setError] = useState(null)
const [isBooking, setIsBooking] = useState(false)
const [hospitalLoading, setHospitalLoading] = useState(false)
const [doctorLoading, setDoctorLoading] = useState(false)
const [timeSlotLoading, setTimeSlotLoading] = useState(false)
```

### PatientAppointments
```javascript
const [showBookingModal, setShowBookingModal] = useState(false)
```

---

## 🎯 Key Functions

### PatientReports

```javascript
// Fetch reports from API
const fetchReports = async () => { }

// Generate AI summary for a report
const handleGenerateSummary = async (report) => { }

// Close summary modal
const closeSummaryModal = () => { }

// Apply search and filter
const applyFilters = () => { }

// Get color for report type
const getReportTypeColor = (type) => { }

// Get display name for report type
const getReportTypeName = (type) => { }
```

### BookAppointmentModal

```javascript
// Fetch hospitals for step 1
const fetchHospitals = async () => { }

// Fetch doctors for step 2
const fetchDoctors = async () => { }

// Fetch time slots for step 4
const fetchTimeSlots = async () => { }

// Create appointment (step 5/6)
const handleBookAppointment = async () => { }

// Reset modal to initial state
const resetModal = () => { }

// Get minimum allowed date (tomorrow)
const getMinDate = () => { }

// Navigation
const goToNextStep = () => { }
const goToPreviousStep = () => { }
```

---

## 🔄 Data Flow

### Medical Reports Flow
```
Component Mount
    ↓
fetchReports() - GET /api/patient/medical-reports-api/
    ↓
setReports(data)
    ↓
applyFilters()
    ↓
Display reports list
    ↓
User clicks "Generate Summary"
    ↓
handleGenerateSummary(report)
    ↓
POST /api/patient/reports/{id}/ai-summary/
    ↓
setSummary(response)
    ↓
Display summary modal
```

### Appointment Booking Flow
```
User clicks "Book Appointment"
    ↓
setShowBookingModal(true)
    ↓
Step 1: Fetch hospitals
    ↓
User selects hospital
    ↓
Step 2: Fetch doctors for hospital
    ↓
User selects doctor
    ↓
Step 3: User selects date
    ↓
Step 4: Fetch time slots
    ↓
User selects time slot
    ↓
Step 5: User fills details + reviews summary
    ↓
User clicks "Book Appointment"
    ↓
handleBookAppointment()
    ↓
POST /api/patient/booking/workflow/book/
    ↓
onSuccess callback (refresh appointments)
    ↓
Reset modal and close
```

---

## 🧪 Testing

### Test PatientReports
```javascript
1. Mount component - should load reports
2. No reports - should show "No reports found"
3. Click Generate Summary - should open modal
4. Verify summary loads - should show AI text
5. Error scenarios - should display error messages
```

### Test BookAppointmentModal
```javascript
1. Click Book button - modal should open
2. Hospital selection - must select before Next
3. Doctor selection - must select before Next
4. Date selection - must select valid date before Next
5. Time slot - must select before Next
6. Details form - must fill reason before booking
7. Summary - must show all selections
8. Booking - should POST and call onSuccess
9. Error handling - should display errors
```

---

## 🐛 Common Issues & Solutions

### Issue: "No reports found" when reports exist
**Solution:** Check API endpoint returns correct format
```javascript
// Expected: Array of report objects
// Check: GET /api/patient/medical-reports-api/ response
```

### Issue: Summary modal not opening
**Solution:** Verify `showSummaryModal` state is toggling
```javascript
// Debug: Add console.log in handleGenerateSummary
console.log('Modal opening:', report)
```

### Issue: Time slots not appearing in Step 4
**Solution:** Check date is properly formatted
```javascript
// Format: YYYY-MM-DD (e.g., "2024-02-20")
const response = await axios.get('/api/.../schedule/', {
  params: { doctor_id: X, date: appointmentDate }
})
```

### Issue: Booking fails with 400 error
**Solution:** Verify all required fields in payload
```javascript
// Required fields:
{
  hospital_id: number (required),
  doctor_id: number (required),
  appointment_date: string YYYY-MM-DD (required),
  appointment_time: string HH:MM (required),
  reason: string (required),
  additional_notes: string (optional)
}
```

---

## 📱 Mobile Responsiveness

### Breakpoints
- PatientReports: Responsive at all sizes
- BookAppointmentModal: Max width 600px, scrollable
- Time slot grid: 3 columns on desktop, 2-3 on mobile

### Touch-Friendly
- Button sizes: min 44px (recommended for touch)
- Spacing: adequate gaps between clickable elements
- Modal: Full height scrolling on small screens

---

## 🎨 Styling

### Theme Integration
```javascript
import { useTheme } from '../contexts/ThemeContext'
const { theme } = useTheme()

// Available theme properties
theme.text              // Primary text
theme.textSecondary     // Secondary text
theme.background        // Background color
theme.cardBackground    // Card background
theme.border            // Border color
theme.isDarkMode        // Boolean for dark mode
```

### Colors Used
- Blue (#3b82f6): Primary action, selected states
- Purple (#8b5cf6): AI features, Generate Summary
- Green (#10b981): Success, Book button
- Red (#ef4444): Error, Cancel button
- Orange (#f59e0b): Warning states

---

## 📊 Performance Notes

### Optimization Done
- ✅ Lazy loading reports on component mount
- ✅ Conditional rendering of modal
- ✅ Filter operations on state change only
- ✅ API calls triggered by dependencies

### Recommendations
- Add pagination for 100+ reports
- Debounce search input (recommended)
- Limit time slot queries to 30 days
- Add caching for hospital/doctor lists

---

## 🔍 Debugging Tips

### Enable Verbose Logging
```javascript
// In any async function
console.log('API call:', {
  url: '/api/endpoint/',
  params: { ... },
  headers: { ... }
})

// Check response
console.log('API response:', response.data)

// Check errors
console.log('API error:', {
  status: err.response?.status,
  data: err.response?.data
})
```

### React DevTools
- Check state in Components tab
- Verify props being passed
- Track state changes over time
- Profile performance

### Network Inspector
- Check request/response headers
- Verify Authorization header
- Check response status codes
- Monitor API response times

---

## 📝 Notes for Developers

1. **Always include Bearer token** in authorization headers
2. **Validate dates** are in YYYY-MM-DD format
3. **Handle 401 responses** - trigger logout
4. **Show loading states** for all async operations
5. **Fallback for missing data** - use "N/A" strings
6. **Test error scenarios** - network failures, invalid data
7. **Mobile test** - use Chrome DevTools device emulation
8. **Accessibility** - use semantic HTML, proper contrast

---

## 📞 Support

For issues or questions about implementation:
1. Check the `PATIENT_INTERFACE_AI_FEATURES.md` documentation
2. Review API endpoint specifications
3. Verify backend responses match expected format
4. Check browser console for errors
5. Enable verbose logging for debugging

