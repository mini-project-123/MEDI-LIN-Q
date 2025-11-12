# Debugging Guide - If Something Goes Wrong

## Issue: "Cannot read properties of undefined (reading 'toLowerCase')"

**What it means**: A value you're trying to call `.toLowerCase()` on is undefined

**Where it happens**: BookAppointment.jsx when filtering hospitals or doctors

**If still happening**:
1. Check line 158-166 in BookAppointment.jsx
2. Look for any filters that don't have null checks
3. Pattern should be: `(value || '')` before calling string methods
4. Example fix:
```javascript
// Wrong ❌
hospital.name.toLowerCase()

// Right ✅
(hospital.name || '').toLowerCase()
```

---

## Issue: Settings Page Shows Mock Data

**What it means**: PatientSettings displaying hardcoded values instead of fetching from API

**Checklist**:
- [ ] PatientSettings.jsx has `useEffect` hook?
- [ ] Component calls `fetchPatientProfile()` on mount?
- [ ] API endpoint is `/api/profile/` (NOT `/api/patient/profile/`)?
- [ ] Authorization header includes Bearer token?
- [ ] Response data is properly mapped to state?

**Debug steps**:
```javascript
// Add this to console in PatientSettings.jsx to check API response
useEffect(() => {
  console.log('Fetching patient profile...')
  fetchPatientProfile()
}, [])

const fetchPatientProfile = async () => {
  const token = localStorage.getItem('accessToken')
  console.log('Token:', token)
  
  const response = await fetch('http://127.0.0.1:8000/api/profile/', {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  
  const data = await response.json()
  console.log('API Response:', data)  // Check what backend returns
  console.log('Patient Info Updated:', patientInfo)  // Check if state updated
}
```

---

## Issue: Settings Changes Not Saving

**What it means**: Click Save but changes don't persist

**Checklist**:
- [ ] Endpoint is `/api/profile/update/` (NOT `/api/patient/profile/update/`)?
- [ ] Method is PUT or PATCH?
- [ ] Request includes `Content-Type: application/json` header?
- [ ] Backend response status is 200/201 (not 404)?
- [ ] Backend is actually saving the data?

**Debug response**:
```javascript
const handleSavePatientInfo = async () => {
  const token = localStorage.getItem('accessToken')
  const response = await fetch('http://127.0.0.1:8000/api/profile/update/', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      phone_number: patientInfo.phone,
      date_of_birth: patientInfo.dateOfBirth,
      blood_group: patientInfo.bloodGroup,
      emergency_contact_name: patientInfo.emergencyContact,
      emergency_contact_phone: patientInfo.emergencyPhone
    })
  })
  
  console.log('Response Status:', response.status)  // Should be 200
  console.log('Response OK:', response.ok)  // Should be true
  
  if (!response.ok) {
    const error = await response.json()
    console.error('Error Response:', error)  // See what backend says
  }
}
```

---

## Issue: Hospital Selection Still Crashes

**What it means**: Even with the fix, clicking hospital crashes

**Steps to verify fix was applied**:
1. Open `BookAppointment.jsx`
2. Go to lines 158-166
3. Look for this pattern:
```javascript
(hospital.name || '').toLowerCase()
```
If you don't see the `|| ''` pattern, the fix wasn't applied correctly.

**If fix is there but still crashing**:
- Check browser DevTools Console for exact error line
- The crash might be elsewhere in the code
- Search for other `.toLowerCase()` calls in BookAppointment.jsx
- Any string method on hospital/doctor data needs null check

---

## Issue: API Returns 404

**What it means**: Endpoint doesn't exist on backend

**Check these**:
1. Backend is running? `python manage.py runserver`
2. Endpoint exists in backend? Check `urls.py`
3. Endpoint path is correct? (no `/patient/` prefix)
4. URL format matches exactly:
   - ✅ `/api/profile/`
   - ✅ `/api/settings/`
   - ✅ `/api/privacy/`
   - ❌ `/api/patient/profile/`
   - ❌ `/api/patient/settings/`

---

## Issue: "Bearer token invalid" or 401 Unauthorized

**What it means**: Token expired or invalid authentication

**Steps to fix**:
1. Logout completely
2. Clear localStorage: 
   - Open DevTools → Application → LocalStorage → Clear all
3. Login again
4. Verify new token is stored: 
   - DevTools → Application → LocalStorage → accessToken
5. Try API call again

---

## Issue: CORS Error (No 'Access-Control-Allow-Origin' header)

**What it means**: Frontend and backend not configured to communicate

**Solutions**:
1. Check Django `CORS_ALLOWED_ORIGINS` settings
2. Should include `http://127.0.0.1:3000` or `http://localhost:3000`
3. Restart Django server after changing settings
4. If using `django-cors-headers`:
```python
# settings.py
INSTALLED_APPS = [
    ...
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Must be first
    ...
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
```

---

## Quick Browser Console Debug Commands

```javascript
// Check if token exists
console.log(localStorage.getItem('accessToken'))

// Check if user is stored
console.log(localStorage.getItem('user'))

// Check theme context
console.log('Theme:', JSON.parse(localStorage.getItem('theme')))

// Make test API call
fetch('http://127.0.0.1:8000/api/profile/', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
  }
})
.then(r => r.json())
.then(data => console.log('API Response:', data))
.catch(e => console.error('Error:', e))

// Check current route
console.log(window.location.pathname)
```

---

## File Location Reference

| Component | Path | Purpose |
|---|---|---|
| BookAppointment | `frontend/src/pages/BookAppointment.jsx` | Booking main page |
| BookAppointmentModal | `frontend/src/components/BookAppointmentModal.jsx` | Booking modal (if used) |
| PatientSettings | `frontend/src/components/PatientSettings.jsx` | Settings page |
| PatientSettingsAndPrivacy | `frontend/src/components/PatientSettingsAndPrivacy.jsx` | Combined settings/privacy |
| PatientReports | `frontend/src/components/PatientReports.jsx` | Medical reports |

---

## Common Fix Patterns

### Pattern 1: Add Null Check to String Method
```javascript
// Before ❌
hospital.name.toLowerCase()

// After ✅
(hospital.name || '').toLowerCase()
```

### Pattern 2: Handle Missing API Response
```javascript
// Before ❌
setData(response.data.user.name)

// After ✅
setData(response?.data?.user?.name || 'Default Value')
```

### Pattern 3: Verify API Response Before Using
```javascript
// Before ❌
const data = await response.json()
setFormData(data)

// After ✅
const data = await response.json()
if (response.ok && data) {
  setFormData(data)
} else {
  console.error('Invalid response')
}
```

### Pattern 4: Add Error Handling to API Calls
```javascript
// Before ❌
const data = await fetch(url).then(r => r.json())

// After ✅
try {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const data = await response.json()
  setData(data)
} catch (error) {
  console.error('Error:', error)
  setError(error.message)
}
```

---

## Testing Commands

```bash
# Terminal 1: Start Backend
cd backend
python manage.py runserver

# Terminal 2: Start Frontend  
cd frontend
npm run dev
```

Then visit: `http://127.0.0.1:3000`

---

## When All Else Fails

1. **Check DevTools Console** - Look for red error messages
2. **Check Network Tab** - Look for failed API calls (red indicators)
3. **Check Backend Logs** - Terminal where Django is running
4. **Verify Endpoints** - Visit `http://127.0.0.1:8000/api/profile/` directly in browser (should prompt for login)
5. **Clear Cache** - Do Ctrl+Shift+Delete → Clear all cache
6. **Restart Services** - Kill and restart both frontend and backend

---

**If you find new issues, add them to this guide for future reference!**
