# Demo Credentials for MedLinq Platform

## 🔐 **Login Credentials**

Use these credentials to test different user roles in the platform:

### 👨‍⚕️ **Doctor Login**

- **Email**: `doctor@medlinq.com`
- **Password**: (any password - mock authentication)
- **Role**: Doctor
- **Access**: Doctor Dashboard with patients, appointments, prescriptions, articles, settings

### 👤 **Patient Login**

- **Email**: `patient@medlinq.com`
- **Password**: (any password - mock authentication)
- **Role**: Patient
- **Access**: Patient Dashboard with health analytics, appointments, prescriptions, reports, profile

### 🏥 **Hospital Admin Login**

- **Email**: `admin@medlinq.com`
- **Password**: (any password - mock authentication)
- **Role**: Admin
- **Access**: Hospital Admin Dashboard with overview, articles, profile

## 📝 **Signup Information**

### **For New Signups:**

#### **Patient Signup:**

- First Name
- Last Name
- Email
- Password
- Confirm Password

#### **Doctor Signup:**

- First Name
- Last Name
- Email
- Password
- Confirm Password
- Hospital ID

#### **Hospital Admin Signup:**

- Hospital Name
- Hospital Email
- Password (no confirmation required)

## 🎯 **Quick Test Guide**

### **1. Test Doctor Portal:**

```
1. Go to Login page
2. Select "Doctor" role
3. Enter: doctor@medlinq.com
4. Enter any password
5. Click Login
6. Access Doctor Dashboard
```

### **2. Test Patient Portal:**

```
1. Go to Login page
2. Select "Patient" role
3. Enter: patient@medlinq.com
4. Enter any password
5. Click Login
6. Access Patient Dashboard
```

### **3. Test Hospital Admin Portal:**

```
1. Go to Login page
2. Select "Hospital Admin" role
3. Enter: admin@medlinq.com
4. Enter any password
5. Click Login
6. Access Hospital Admin Dashboard
```

## 🔧 **Mock Authentication System**

### **How It Works:**

- All authentication is handled locally using localStorage
- No real backend validation
- Password can be anything (for demo purposes)
- User data stored in localStorage as 'mockUsers'
- Session maintained with 'currentUser' in localStorage

### **Demo Users Data:**

#### **Doctor:**

```javascript
{
  id: 1,
  name: 'Dr. Sarah Johnson',
  email: 'doctor@medlinq.com',
  role: 'doctor',
  specialization: 'Cardiology',
  hospitalId: 'H001'
}
```

#### **Patient:**

```javascript
{
  id: 2,
  name: 'John Patient',
  email: 'patient@medlinq.com',
  role: 'patient',
  dateOfBirth: '1990-01-01',
  age: 34
}
```

#### **Admin:**

```javascript
{
  id: 3,
  name: 'Admin User',
  email: 'admin@medlinq.com',
  role: 'admin',
  hospitalName: 'City General Hospital'
}
```

## 🚀 **Features by Role**

### **👨‍⚕️ Doctor Features:**

- Dashboard with analytics and charts
- View and manage patients
- Appointment scheduling
- Prescription management
- Medical articles
- Settings and profile

### **👤 Patient Features:**

- Health analytics dashboard
- Book appointments
- View prescriptions
- Upload and view medical reports
- Read health articles
- Profile management

### **🏥 Hospital Admin Features:**

- Hospital overview dashboard
- Summary cards (patients, doctors, staff, bed occupancy)
- Today's appointments
- Hospital statistics
- Articles management
- Profile settings

## 💡 **Tips**

### **Testing Different Roles:**

1. Logout from current session
2. Go to Login page
3. Select different role
4. Use corresponding email
5. Enter any password
6. Explore role-specific features

### **Creating New Users:**

1. Go to Signup page
2. Select role (Patient/Doctor/Admin)
3. Fill required fields
4. For Admin: Only password field (no confirmation)
5. For Patient/Doctor: Password + Confirm Password
6. Submit to create account

### **Resetting Demo Data:**

Open browser console and run:

```javascript
// Clear all demo data
localStorage.clear();

// Refresh page to reinitialize
location.reload();
```

## 🎨 **Theme Support**

All dashboards support dark/light mode:

- Toggle theme from dashboard
- Preference saved in localStorage
- Consistent across all pages

## 📱 **Responsive Design**

All features work on:

- Desktop computers
- Tablets
- Mobile phones
- Different screen sizes

## 🔄 **Data Persistence**

- User sessions persist across page refreshes
- Theme preferences saved
- Hospital data stored locally
- All changes saved to localStorage

**Enjoy testing the MedLinq Healthcare Platform!** 🏥
