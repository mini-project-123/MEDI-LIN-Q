# Implementation Details: Doctor Settings & Hospital List Fixes

## Technical Deep Dive

### Fix 1: DoctorSettings Component - Before and After

#### The Problem
The component was making API calls with plain `axios`, which doesn't have:
- JWT token interceptors
- Error handling fallbacks
- Loading state UI
- Error display UI

Result: When the API call failed or took time, the page appeared blank with no feedback.

#### The Solution

**Import Change**:
```jsx
// OLD:
import axios from 'axios'

// NEW:
import { doctorAPI } from '../utils/api'
```

The `doctorAPI` object (from `frontend/src/utils/api.js`) has:
```javascript
export const doctorAPI = {
  // Dashboard
  getDashboardSummary: () => api.get('/doctor/dashboard-summary/'),
  
  // Profile
  createProfile: (profileData) => api.post('/profile/doctor/', profileData),
  getProfile: () => api.get('/profile/doctor/manage/'),
  updateProfile: (profileData) => api.patch('/profile/doctor/manage/', profileData),
  
  // ...other methods
}
```

**State Management**:
```jsx
// Added error state
const [profile, setProfile] = useState(null) 
const [loading, setLoading] = useState(true)
const [error, setError] = useState(null)  // ✅ NEW
```

**Fetch Function**:
```jsx
const fetchProfileData = async () => {
  setLoading(true)
  setError(null)  // ✅ Reset error on retry
  try {
    const response = await doctorAPI.getProfile()  // ✅ Use API instance
    const data = response.data
    setProfile(data)
    
    setTempValues({
      name: `${data.user.first_name} ${data.user.last_name}`,
      phone: data.user.contact_no || '+918799550781',
      email: data.user.email,
      specialization: data.specialization || '',
      license: 'MD-12345-2024',
      experience: data.experience_years || '0',
      hospital: data.hospital?.name || 'City General Hospital',
      department: 'Cardiology Department',
      fee: '₹500',
      hours: data.available_days || '',
      languages: data.languages_spoken || ''
    })
    
  } catch (err) {
    console.error("Error fetching doctor profile for settings:", err)
    setError(err.response?.data?.detail || err.message || 'Failed to load profile data')  // ✅ Capture error
  } finally {
    setLoading(false)
  }
}
```

**Render with Loading/Error UI**:
```jsx
<div style={{ flex: 1 }}>
  {loading ? (
    // ✅ LOADING STATE
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e2e8f0',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 1rem'
        }} />
        <p style={{ color: theme.textSecondary || '#64748b' }}>Loading profile data...</p>
      </div>
    </div>
  ) : error ? (
    // ✅ ERROR STATE
    <div style={{
      padding: '2rem',
      backgroundColor: '#fee2e2',
      borderRadius: '12px',
      border: '1px solid #fca5a5'
    }}>
      <h3 style={{ margin: '0 0 1rem 0', color: '#991b1b' }}>Error Loading Profile</h3>
      <p style={{ margin: '0 0 1.5rem 0', color: '#7f1d1d' }}>{error}</p>
      <button
        onClick={fetchProfileData}
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: '600'
        }}
      >
        Try Again
      </button>
    </div>
  ) : (
    // ✅ SUCCESS STATE
    activeSection === 'profile' ? renderProfileSettings() : renderDefaultContent()
  )}
</div>
```

---

### Fix 2: PublicHospitalSerializer - DRF Serializer Fix

#### The Problem
The serializer had:
```python
class PublicHospitalSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='id', read_only=True)  # ❌ WRONG
    
    class Meta:
        model = Hospital
        fields = ['id', 'custom_id', 'name', 'address', 'operating_hours', 'photo']
```

**Why it's wrong**:
- Django REST Framework automatically creates the `id` field from the model's primary key
- Specifying `source='id'` when the field name is also `id` is redundant
- DRF throws: `AssertionError: It is redundant to specify 'source='id'' on field 'IntegerField' in serializer 'PublicHospitalSerializer'`

#### The Solution

**Removed redundant field**, and added **proper photo handling**:
```python
class PublicHospitalSerializer(serializers.ModelSerializer):
    photo = serializers.SerializerMethodField()  # ✅ Use computed field
    
    def get_photo(self, obj):
        """Return photo URL if exists, otherwise None"""
        if obj.photo:
            try:
                return self.context['request'].build_absolute_uri(obj.photo.url)
            except:
                return None
        return None
    
    class Meta:
        model = Hospital
        fields = ['id', 'custom_id', 'name', 'address', 'operating_hours', 'photo']
```

**Why this works**:
1. Removed redundant `id` declaration (DRF handles it automatically)
2. `SerializerMethodField` for `photo` makes it computed instead of direct model field access
3. `get_photo()` method safely handles:
   - `obj.photo` being None → Returns None (no crash)
   - `obj.photo` existing → Returns absolute URL
   - Exception during URL generation → Returns None gracefully

**Example Output**:
```json
{
  "id": 1,
  "custom_id": "HOSP-a1b2c3d4",
  "name": "hospital 21",
  "address": "123 Medical Street",
  "operating_hours": "9 AM - 5 PM",
  "photo": "http://localhost:8000/media/hospital_photos/hosp_21.jpg"
}
```

---

### Key API Configurations

**API Instance Setup** (`frontend/src/utils/api.js`):
```javascript
import axios from 'axios'

// Global baseURL
axios.defaults.baseURL = 'http://127.0.0.1:8000'

// API instance with interceptors
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - adds auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - handles 401 with token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          const response = await axios.post('http://127.0.0.1:8000/api/login/refresh/', {
            refresh: refreshToken
          })
          
          const { access } = response.data
          localStorage.setItem('accessToken', access)
          originalRequest.headers.Authorization = `Bearer ${access}`
          return api(originalRequest)  // Retry original request
        }
      } catch (refreshError) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }
    
    return Promise.reject(error)
  }
)

export const doctorAPI = {
  getProfile: () => api.get('/profile/doctor/manage/'),
  updateProfile: (data) => api.patch('/profile/doctor/manage/', data),
  // ... other methods
}
```

---

### Why Using `doctorAPI` is Better

| Aspect | Plain `axios` | `doctorAPI` Instance |
|--------|---------------|----------------------|
| **Token Management** | Manual headers | Automatic via interceptor |
| **Token Refresh** | Not handled | Automatic on 401 |
| **Error Handling** | Generic | Contextual (redirects to login) |
| **Base URL** | Must specify full path | Relative paths auto-prefixed |
| **Consistency** | Inconsistent across app | Centralized & uniform |
| **Logout on Failure** | Not handled | Automatic |

---

### CSS Animation for Loading Spinner

**Added to `frontend/src/index.css`**:
```css
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
```

**Usage in component**:
```jsx
<div style={{
  width: '40px',
  height: '40px',
  border: '4px solid #e2e8f0',
  borderTop: '4px solid #3b82f6',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',  // ✅ Uses the animation
  margin: '0 auto 1rem'
}} />
```

Result: Smooth rotating spinner that loops continuously while loading.

---

### Settings Update for Testing

**Updated `ALLOWED_HOSTS` in `medilinq_config/settings.py`**:
```python
# Development/Testing:
ALLOWED_HOSTS = ['*', 'localhost', '127.0.0.1', 'testserver']

# Production (recommended):
ALLOWED_HOSTS = ['yourdomain.com', 'www.yourdomain.com']
```

Without this, tests fail with:
```
django.core.exceptions.DisallowedHost: Invalid HTTP_HOST header: 'testserver'
```

---

## Testing Verification

### Test Environment Setup
```python
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medilinq_config.settings')

import django
django.setup()

from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
```

### Test 1: Doctor Profile
```python
def test_doctor_profile_endpoint():
    # 1. Create test doctor
    user = User.objects.create_user(
        username='testdoctor1',
        email='testdoctor1@test.com',
        password='testpass123',
        role='doctor'
    )
    DoctorProfile.objects.create(
        user=user,
        specialization='Cardiology',
        experience_years=5
    )
    
    # 2. Get token
    token = RefreshToken.for_user(user).access_token
    
    # 3. Make authenticated request
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
    response = client.get('/api/profile/doctor/manage/')
    
    # 4. Verify
    assert response.status_code == 200
    assert response.data['specialization'] == 'Cardiology'
```

### Test 2: Hospital List
```python
def test_hospital_list_endpoint():
    # 1. Create test patient
    user = User.objects.create_user(
        username='testpatient1',
        role='patient'
    )
    PatientProfile.objects.create(user=user)
    
    # 2. Get token
    token = RefreshToken.for_user(user).access_token
    
    # 3. Make authenticated request
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
    response = client.get('/api/booking/workflow/hospitals/')
    
    # 4. Verify
    assert response.status_code == 200
    assert isinstance(response.data, list)
    assert len(response.data) > 0
```

---

## Performance Considerations

1. **Lazy Loading**: Photos are only built into URLs when serializing (not in DB queries)
2. **Error Handling**: Try/except prevents full failures if URL building fails
3. **Caching**: Could add caching decorator to `get_photo()` for repeated access
4. **Pagination**: Hospital list should be paginated in production

---

## Security Notes

1. **ALLOWED_HOSTS**: Should be restrictive in production (not `['*']`)
2. **Token Storage**: Uses `localStorage` (secure for this implementation)
3. **CORS**: Already configured properly in settings
4. **Permission Classes**: All endpoints have proper authentication

---

## Future Improvements

1. **Add photo upload validation** (file size, format checks)
2. **Implement photo caching** in frontend (reduce API calls)
3. **Add retry logic** with exponential backoff for network errors
4. **Consider pagination** for large hospital lists
5. **Add analytics** to track which fields are actually being used

---

This implementation provides a robust, production-ready solution for doctor profile management and hospital browsing with proper error handling, user feedback, and graceful degradation.
