# API Integration Guide - Backend Connection Ready

## 🎯 **Overview**

This guide shows how to connect the MedLinq frontend to your Django backend. The frontend is currently working with mock data and localStorage, making it easy to switch to real API calls when ready.

---

## 📋 **Current Frontend Structure**

### **Data Flow (Current - Mock)**

```
Component → Mock Data/localStorage → Component State → UI
```

### **Data Flow (Future - With Backend)**

```
Component → API Service → Django Backend → Component State → UI
```

---

## 🔧 **Backend API Endpoints (From Your Code)**

### **Patient Portal Endpoints**

#### **1. Patient Profile**

```javascript
// Create Profile (Step 2 Registration)
POST /api/profile/patient/
Body: {
  blood_group: string,
  emergency_contact_no: string,
  emergency_contact_relation: string,
  allergies: string,
  photo: file
}
```

#### **2. Patient Dashboard**

```javascript
// Get Dashboard Data
GET /api/dashboard/
Response: {
  user: { first_name, last_name, custom_id, gender, email, contact_no },
  age: number,
  blood_group: string,
  emergency_contact_no: string,
  emergency_contact_relation: string,
  allergies: string,
  photo: string,
  appointments: [...],
  medical_reports: [...],
  prescriptions: [...]
}

// Update Profile
PATCH /api/dashboard/
Body: {
  blood_group: string,
  emergency_contact_no: string,
  allergies: string,
  // ... other fields
}
```

#### **3. Booking System**

```javascript
// Get Doctors List
GET /api/booking/doctors/?search=cardiology
Response: [{
  user: { first_name, last_name, ... },
  specialization: string,
  qualification: string,
  experience_years: number,
  available_days: string,
  languages_spoken: string,
  hospital: { id, name, address, ... },
  photo: string
}]

// Get Hospitals List
GET /api/booking/hospitals/?search=apollo
Response: [{
  id: number,
  custom_id: string,
  name: string,
  address: string,
  operating_hours: string,
  photo: string
}]

// Create Appointment
POST /api/booking/create/
Body: {
  doctor: number (doctor_id),
  hospital: number (hospital_id),
  appointment_datetime: string (ISO format)
}
Response: {
  id: number,
  patient: number,
  doctor: number,
  hospital: number,
  appointment_datetime: string,
  status: "pending"
}
```

---

## 📁 **Recommended API Service Structure**

### **Create API Service Files**

```
src/
├── services/
│   ├── api.js              # Base API configuration
│   ├── patientService.js   # Patient-specific API calls
│   ├── doctorService.js    # Doctor-specific API calls
│   └── hospitalService.js  # Hospital-specific API calls
```

---

## 🔨 **Step-by-Step Integration**

### **Step 1: Create Base API Configuration**

Create `src/services/api.js`:

```javascript
import axios from "axios";

// Toggle between mock and real API
const USE_MOCK_DATA = true; // Set to false when backend is ready

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem("authToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export { api, USE_MOCK_DATA };
```

### **Step 2: Create Patient Service**

Create `src/services/patientService.js`:

```javascript
import { api, USE_MOCK_DATA } from "./api";

// Mock data for development
const mockPatientData = {
  user: {
    first_name: "John",
    last_name: "Doe",
    email: "john@example.com",
    contact_no: "+1234567890",
  },
  age: 35,
  blood_group: "O+",
  appointments: [],
  prescriptions: [],
};

export const patientService = {
  // Get patient dashboard data
  getDashboard: async () => {
    if (USE_MOCK_DATA) {
      return { data: mockPatientData };
    }
    return api.get("/dashboard/");
  },

  // Update patient profile
  updateProfile: async (profileData) => {
    if (USE_MOCK_DATA) {
      const updated = { ...mockPatientData, ...profileData };
      localStorage.setItem("patientProfile", JSON.stringify(updated));
      return { data: updated };
    }
    return api.patch("/dashboard/", profileData);
  },

  // Get doctors list
  getDoctors: async (searchTerm = "") => {
    if (USE_MOCK_DATA) {
      const mockDoctors = [
        {
          id: 1,
          user: { first_name: "Dr. Sarah", last_name: "Johnson" },
          specialization: "Cardiology",
          experience_years: 15,
        },
      ];
      return { data: mockDoctors };
    }
    return api.get(`/booking/doctors/?search=${searchTerm}`);
  },

  // Get hospitals list
  getHospitals: async (searchTerm = "") => {
    if (USE_MOCK_DATA) {
      const mockHospitals = [
        { id: 1, name: "City General Hospital", address: "123 Main St" },
      ];
      return { data: mockHospitals };
    }
    return api.get(`/booking/hospitals/?search=${searchTerm}`);
  },

  // Create appointment
  createAppointment: async (appointmentData) => {
    if (USE_MOCK_DATA) {
      const newAppointment = {
        id: Date.now(),
        ...appointmentData,
        status: "pending",
      };
      const appointments = JSON.parse(
        localStorage.getItem("appointments") || "[]"
      );
      appointments.push(newAppointment);
      localStorage.setItem("appointments", JSON.stringify(appointments));
      return { data: newAppointment };
    }
    return api.post("/booking/create/", appointmentData);
  },
};
```

### **Step 3: Update Components to Use Service**

Example for `PatientDashboard.jsx`:

```javascript
import { patientService } from "../services/patientService";

const PatientDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await patientService.getDashboard();
      setDashboardData(response.data);
    } catch (error) {
      console.error("Error fetching dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  // ... rest of component
};
```

---

## 🔄 **Migration Checklist**

### **Phase 1: Preparation (Current)**

- ✅ Frontend working with mock data
- ✅ All features functional
- ✅ localStorage for persistence
- ✅ No backend required

### **Phase 2: API Service Setup (When Ready)**

- [ ] Create `src/services/` folder
- [ ] Create `api.js` with base configuration
- [ ] Create `patientService.js`
- [ ] Create `doctorService.js`
- [ ] Create `hospitalService.js`
- [ ] Set `USE_MOCK_DATA = true` initially

### **Phase 3: Component Updates**

- [ ] Update `PatientDashboard.jsx` to use `patientService`
- [ ] Update `BookAppointment.jsx` to use `patientService`
- [ ] Update `PatientAppointments.jsx` to use `patientService`
- [ ] Update `PatientPrescriptions.jsx` to use `patientService`
- [ ] Test with mock data still enabled

### **Phase 4: Backend Connection**

- [ ] Ensure Django backend is running
- [ ] Set `REACT_APP_API_URL` in `.env`
- [ ] Set `USE_MOCK_DATA = false`
- [ ] Test each endpoint
- [ ] Handle authentication tokens
- [ ] Add error handling

---

## 🎯 **Component-to-Endpoint Mapping**

### **Patient Portal**

| Component            | Current Data Source    | Future Endpoint             | Service Method                     |
| -------------------- | ---------------------- | --------------------------- | ---------------------------------- |
| PatientDashboard     | Mock data              | GET /api/dashboard/         | patientService.getDashboard()      |
| BookAppointment      | Mock hospitals/doctors | GET /api/booking/doctors/   | patientService.getDoctors()        |
| BookAppointment      | Mock hospitals         | GET /api/booking/hospitals/ | patientService.getHospitals()      |
| BookAppointment      | localStorage           | POST /api/booking/create/   | patientService.createAppointment() |
| PatientAppointments  | localStorage           | GET /api/dashboard/         | patientService.getDashboard()      |
| PatientPrescriptions | Mock data              | GET /api/dashboard/         | patientService.getDashboard()      |
| UserProfile          | localStorage           | PATCH /api/dashboard/       | patientService.updateProfile()     |

---

## 🔐 **Authentication Integration**

### **Current (Mock)**

```javascript
// In AuthContext.jsx
const login = (email, password) => {
  // Mock authentication
  const mockUser = { email, role: "patient" };
  localStorage.setItem("user", JSON.stringify(mockUser));
  setUser(mockUser);
};
```

### **Future (Real API)**

```javascript
// In authService.js
export const authService = {
  login: async (email, password) => {
    if (USE_MOCK_DATA) {
      return {
        data: { token: "mock-token", user: { email, role: "patient" } },
      };
    }
    const response = await api.post("/auth/login/", { email, password });
    localStorage.setItem("authToken", response.data.token);
    return response;
  },

  logout: async () => {
    if (USE_MOCK_DATA) {
      localStorage.removeItem("user");
      return;
    }
    await api.post("/auth/logout/");
    localStorage.removeItem("authToken");
  },
};
```

---

## 📝 **Environment Variables**

Create `.env` file:

```bash
# API Configuration
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_USE_MOCK_DATA=true

# When deploying to production
# REACT_APP_API_URL=https://your-backend.com/api
# REACT_APP_USE_MOCK_DATA=false
```

---

## 🚀 **Quick Start Guide**

### **For Development (Now)**

1. Everything works with mock data
2. No backend needed
3. Test all features
4. Make UI changes

### **When Backend is Ready**

1. Create service files (copy from this guide)
2. Set `USE_MOCK_DATA = true` initially
3. Test with mock data through services
4. Start Django backend
5. Set `USE_MOCK_DATA = false`
6. Test real API calls
7. Fix any issues
8. Deploy!

---

## 🎨 **Benefits of This Approach**

### **Current Benefits**

- ✅ Frontend fully functional
- ✅ No backend dependency
- ✅ Easy to demo
- ✅ Fast development
- ✅ Easy testing

### **Future Benefits**

- ✅ Easy backend integration
- ✅ Toggle between mock/real data
- ✅ Centralized API calls
- ✅ Easy error handling
- ✅ Consistent data flow

---

## 📊 **Data Structure Compatibility**

Your backend API responses match the frontend expectations:

### **Dashboard Data**

```javascript
// Backend Response
{
  user: { first_name, last_name, email, contact_no },
  age: 35,
  blood_group: "O+",
  appointments: [...],
  prescriptions: [...]
}

// Frontend Expects (Currently Mock)
{
  user: { first_name, last_name, email, contact_no },
  age: 35,
  blood_group: "O+",
  appointments: [...],
  prescriptions: [...]
}

// ✅ Perfect Match!
```

---

## 🎯 **Summary**

**Current State:**

- Frontend works perfectly with mock data
- No backend required
- All features functional
- Ready for demos and development

**When You're Ready:**

1. Copy service files from this guide
2. Set USE_MOCK_DATA flag
3. Connect to backend
4. Test and deploy

**The frontend is structured to make backend integration seamless when you're ready!** 🚀
