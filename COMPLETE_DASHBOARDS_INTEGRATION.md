# Complete Integration Guide: Patient, Doctor & Hospital Dashboards

## ⚠️ CRITICAL: Database Issue Must Be Fixed First

The database schema has serious issues:
- `api_appointment` table is missing required columns: `appointment_type`, `status`, etc.
- These columns exist in the Django model but not in the database
- This is preventing the dashboard from working

### To Fix (Database Administrator):
```sql
-- Check which columns exist
\d api_appointment

-- If missing columns, add them
ALTER TABLE api_appointment ADD COLUMN appointment_type VARCHAR(20) DEFAULT 'consultation';
ALTER TABLE api_appointment ADD COLUMN status VARCHAR(10) DEFAULT 'pending';

-- Or restore from a clean backup
pg_restore -U postgres -d medilinq_db /path/to/backup.sql
```

---

## Dashboard Implementation Status

### ✅ PATIENT DASHBOARD - COMPLETE (Code Only)
**Endpoint:** `GET /api/dashboard/`

**Files:**
- Views: `api/views/patient_views.py` - PatientDashboardView
- Serializers: `api/serializers/patient_serializers.py` - PatientDashboardSerializer
- URLs: `api/urls/patient_urls.py` - dashboard path

**Features:**
- Upcoming appointments (next 5)
- Recent appointments (last 5)
- Prescriptions (last 5)
- Notifications (last 10)
- Stats (total, upcoming, unread)
- Patient profile

**Status:** ✅ Code ready, awaiting database fix

---

### ⏳ DOCTOR DASHBOARD - NEEDS IMPLEMENTATION

**Planned Endpoint:** `GET /api/doctor/dashboard/`

**Views to Create:**
```python
# In api/views/doctor_views.py

class DoctorDashboardView(APIView):
    """Doctor's main dashboard with stats and recent data"""
    permission_classes = [IsAuthenticated, IsDoctorUser]
    
    def get(self, request):
        # Return:
        # - Profile info
        # - Today's appointments  
        # - Upcoming appointments (next 7 days)
        # - Recent patients
        # - Prescriptions issued (last 7 days)
        # - Stats: total patients, appointments, prescriptions this month
        # - Schedule for next 7 days

class DoctorAppointmentListView(generics.ListAPIView):
    """List all doctor's appointments with filtering"""
    queryset = Appointment.objects.all()
    serializer_class = DoctorAppointmentDetailSerializer
    permission_classes = [IsAuthenticated, IsDoctorUser]
    filter_backends = [SearchFilter, OrderingFilter, DjangoFilterBackend]
    search_fields = ['patient__user__first_name', 'patient__user__last_name']
    ordering = ['-appointment_date']
    
    def get_queryset(self):
        doctor = self.request.user.doctorprofile
        return Appointment.objects.filter(doctor=doctor)

class DoctorPatientListView(generics.ListAPIView):
    """List patients who have appointments with this doctor"""
    serializer_class = DoctorPatientListSerializer
    permission_classes = [IsAuthenticated, IsDoctorUser]
    
    def get_queryset(self):
        doctor = self.request.user.doctorprofile
        return PatientProfile.objects.filter(
            appointments__doctor=doctor
        ).distinct()

class DoctorPrescriptionListView(generics.ListCreateAPIView):
    """List and create prescriptions for patients"""
    serializer_class = DoctorPrescriptionSerializer
    permission_classes = [IsAuthenticated, IsDoctorUser]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['appointment__patient__user__first_name']
    ordering = ['-created_at']
    
    def get_queryset(self):
        doctor = self.request.user.doctorprofile
        return Prescription.objects.filter(
            appointment__doctor=doctor
        )
```

**Serializers to Create:**
```python
# In api/serializers/doctor_serializers.py

class DoctorDashboardSerializer(serializers.Serializer):
    profile = DoctorProfileSerializer(read_only=True)
    todays_appointments = DoctorAppointmentDetailSerializer(many=True, read_only=True)
    upcoming_appointments = DoctorAppointmentDetailSerializer(many=True, read_only=True)
    recent_patients = DoctorPatientListSerializer(many=True, read_only=True)
    recent_prescriptions = DoctorPrescriptionSerializer(many=True, read_only=True)
    stats = serializers.DictField()

class DoctorAppointmentDetailSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    hospital_name = serializers.CharField(source='hospital.name', read_only=True)
    
    class Meta:
        model = Appointment
        fields = ['id', 'custom_id', 'patient_name', 'appointment_date', 
                  'appointment_time', 'status', 'appointment_type', 'hospital_name']
    
    def get_patient_name(self, obj):
        return f"{obj.patient.user.first_name} {obj.patient.user.last_name}"

class DoctorPatientListSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    contact = serializers.CharField(source='user.username', read_only=True)
    appointment_count = serializers.SerializerMethodField()
    
    class Meta:
        model = PatientProfile
        fields = ['id', 'name', 'contact', 'blood_group', 'appointment_count']
    
    def get_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"
    
    def get_appointment_count(self, obj):
        doctor = self.context['request'].user.doctorprofile
        return obj.appointments.filter(doctor=doctor).count()

class DoctorPrescriptionSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Prescription
        fields = ['id', 'patient_name', 'doctor_name', 'medication_name', 
                  'dosage', 'frequency', 'duration', 'notes', 'created_at']
    
    def get_patient_name(self, obj):
        return f"{obj.appointment.patient.user.first_name} {obj.appointment.patient.user.last_name}"
    
    def get_doctor_name(self, obj):
        return f"{obj.appointment.doctor.user.first_name} {obj.appointment.doctor.user.last_name}"
```

**URLs to Add:**
```python
# In api/urls/doctor_urls.py

path('doctor/dashboard/', DoctorDashboardView.as_view(), name='doctor-dashboard'),
path('doctor/appointments/', DoctorAppointmentListView.as_view(), name='doctor-appointments'),
path('doctor/patients/', DoctorPatientListView.as_view(), name='doctor-patients'),
path('doctor/prescriptions/', DoctorPrescriptionListView.as_view(), name='doctor-prescriptions'),
```

---

### ⏳ HOSPITAL DASHBOARD - NEEDS IMPLEMENTATION

**Planned Endpoint:** `GET /api/hospital/dashboard/`

**Views to Create:**
```python
# In api/views/hospital_views.py

class HospitalDashboardView(APIView):
    """Hospital's main dashboard with key metrics"""
    permission_classes = [IsAuthenticated, IsHospitalUser]
    
    def get(self, request):
        # Return:
        # - Hospital info
        # - Today's stats: appointments, admissions, discharges
        # - Staff count
        # - Bed occupancy
        # - Recent appointments
        # - Monthly stats

class HospitalAppointmentListView(generics.ListAPIView):
    """List all appointments in this hospital"""
    serializer_class = HospitalAppointmentDetailSerializer
    permission_classes = [IsAuthenticated, IsHospitalUser]
    filter_backends = [SearchFilter, OrderingFilter, DjangoFilterBackend]
    search_fields = ['patient__user__first_name', 'doctor__user__first_name']
    ordering = ['-appointment_date']
    filterset_fields = ['status', 'appointment_date']
    
    def get_queryset(self):
        hospital = self.request.user.hospitalprofile
        return Appointment.objects.filter(hospital=hospital)

class HospitalStaffListView(generics.ListCreateAPIView):
    """List and manage hospital staff"""
    serializer_class = HospitalStaffSerializer
    permission_classes = [IsAuthenticated, IsHospitalUser]
    
    def get_queryset(self):
        hospital = self.request.user.hospitalprofile
        return StaffProfile.objects.filter(hospital=hospital)

class HospitalBedManagementView(generics.ListAPIView):
    """Manage hospital beds and occupancy"""
    serializer_class = HospitalBedSerializer
    permission_classes = [IsAuthenticated, IsHospitalUser]
    
    def get_queryset(self):
        hospital = self.request.user.hospitalprofile
        return Bed.objects.filter(ward__hospital=hospital)

class HospitalAnalyticsView(APIView):
    """Hospital analytics and statistics"""
    permission_classes = [IsAuthenticated, IsHospitalUser]
    
    def get(self, request):
        hospital = request.user.hospitalprofile
        
        # Calculate stats
        stats = {
            'total_appointments': Appointment.objects.filter(hospital=hospital).count(),
            'appointments_today': Appointment.objects.filter(
                hospital=hospital,
                appointment_date=timezone.now().date()
            ).count(),
            'total_doctors': DoctorProfile.objects.filter(hospital=hospital).count(),
            'total_patients': PatientProfile.objects.filter(
                appointments__hospital=hospital
            ).distinct().count(),
            'bed_occupancy': calculate_bed_occupancy(hospital),
            'revenue_this_month': calculate_monthly_revenue(hospital),
        }
        
        return Response(stats)
```

**Serializers to Create:**
```python
# In api/serializers/hospital_serializers.py

class HospitalDashboardSerializer(serializers.Serializer):
    profile = HospitalProfileSerializer(read_only=True)
    todays_appointments = HospitalAppointmentDetailSerializer(many=True, read_only=True)
    staff_count = serializers.IntegerField(read_only=True)
    total_beds = serializers.IntegerField(read_only=True)
    occupied_beds = serializers.IntegerField(read_only=True)
    stats = serializers.DictField()

class HospitalAppointmentDetailSerializer(serializers.ModelSerializer):
    doctor_name = serializers.SerializerMethodField()
    patient_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Appointment
        fields = ['id', 'custom_id', 'patient_name', 'doctor_name', 
                  'appointment_date', 'appointment_time', 'status', 'token_number']
    
    def get_doctor_name(self, obj):
        return f"{obj.doctor.user.first_name} {obj.doctor.user.last_name}"
    
    def get_patient_name(self, obj):
        return f"{obj.patient.user.first_name} {obj.patient.user.last_name}"

class HospitalStaffSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    
    class Meta:
        model = StaffProfile
        fields = ['id', 'name', 'designation', 'department', 'contact_no']
    
    def get_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"

class HospitalBedSerializer(serializers.ModelSerializer):
    ward_name = serializers.CharField(source='ward.name', read_only=True)
    is_occupied = serializers.SerializerMethodField()
    
    class Meta:
        model = Bed
        fields = ['id', 'bed_number', 'ward_name', 'is_occupied', 'status']
    
    def get_is_occupied(self, obj):
        return obj.status == 'occupied'
```

**URLs to Add:**
```python
# In api/urls/hospital_urls.py

path('hospital/dashboard/', HospitalDashboardView.as_view(), name='hospital-dashboard'),
path('hospital/appointments/', HospitalAppointmentListView.as_view(), name='hospital-appointments'),
path('hospital/staff/', HospitalStaffListView.as_view(), name='hospital-staff'),
path('hospital/beds/', HospitalBedManagementView.as_view(), name='hospital-beds'),
path('hospital/analytics/', HospitalAnalyticsView.as_view(), name='hospital-analytics'),
```

---

## Frontend API Integration

Update `frontend/src/utils/api.js`:

```javascript
// ==================== DOCTOR APIs ====================
export const doctorAPI = {
  getDashboard: () => api.get('/doctor/dashboard/'),
  getAppointments: (params) => api.get('/doctor/appointments/', { params }),
  getPatients: (params) => api.get('/doctor/patients/', { params }),
  getPrescriptions: (params) => api.get('/doctor/prescriptions/', { params }),
  createPrescription: (data) => api.post('/doctor/prescriptions/', data),
}

// ==================== HOSPITAL APIs ====================
export const hospitalAPI = {
  getDashboard: () => api.get('/hospital/dashboard/'),
  getAppointments: (params) => api.get('/hospital/appointments/', { params }),
  getStaff: (params) => api.get('/hospital/staff/', { params }),
  getBeds: (params) => api.get('/hospital/beds/', { params }),
  getAnalytics: () => api.get('/hospital/analytics/'),
}
```

---

## Implementation Order (After Database Fix)

1. ✅ Patient Dashboard (Already done)
2. ⏳ Create doctor dashboard views & serializers
3. ⏳ Create hospital dashboard views & serializers
4. ⏳ Update URL routing for all three
5. ⏳ Update frontend API integration
6. ⏳ Test all three dashboards end-to-end

---

## Key Dependencies

- `IsPatientUser`, `IsDoctorUser`, `IsHospitalUser` permissions (already exist)
- Models: `Appointment`, `Prescription`, `PatientProfile`, `DoctorProfile`, `Hospital`, `StaffProfile`, `Bed`
- Serializers: Base serializers for each model
- Filter backends: `SearchFilter`, `OrderingFilter`, `DjangoFilterBackend`

---

## Next Steps

1. **PRIORITY 1:** Fix the database schema (add missing columns or restore backup)
2. **PRIORITY 2:** Create doctor dashboard implementation
3. **PRIORITY 3:** Create hospital dashboard implementation
4. **PRIORITY 4:** Update frontend to call new endpoints
5. **PRIORITY 5:** Comprehensive testing of all three dashboards

