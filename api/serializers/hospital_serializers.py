# api/serializers/hospital_serializers.py
from rest_framework import serializers
# --- MODIFIED IMPORTS ---
from api.models import (
    Hospital, DoctorProfile, StaffProfile, User, Ward, Appointment,
    PatientProfile, MedicalReport
)
# ---
from api.serializers.patient_serializers import SimplePatientProfileSerializer
from django.db import transaction

# --- Re-usable User Serializer ---
class SimpleUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'middle_name', 'custom_id', 'email', 'contact_no', 'gender', 'date_of_birth', 'address']
        read_only_fields = ['custom_id'] 

# --- Hospital Creation Serializer ---
class HospitalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hospital
        fields = ['name', 'address', 'contact_no1', 'contact_no2', 'email', 'website', 'license_no', 'operating_hours', 'num_departments', 'photo']

# --- Serializer for Listing Doctors in Hospital ---
class HospitalDoctorListSerializer(serializers.ModelSerializer):
    user = SimpleUserSerializer(read_only=True)
    class Meta:
        model = DoctorProfile
        fields = ['user', 'specialization', 'qualification', 'experience_years', 'available_days', 'photo']

# --- Serializer for Listing Staff in Hospital ---
class HospitalStaffListSerializer(serializers.ModelSerializer):
    user = SimpleUserSerializer(read_only=True)
    class Meta:
        model = StaffProfile
        fields = ['user', 'job_title']

# --- Serializer for Ward List ---
class HospitalWardSerializer(serializers.ModelSerializer):
    total_beds = serializers.IntegerField(read_only=True); occupied_beds = serializers.IntegerField(read_only=True); available_beds = serializers.IntegerField(read_only=True); occupancy_rate = serializers.SerializerMethodField()
    class Meta:
        model = Ward
        fields = ['id', 'name', 'total_beds', 'occupied_beds', 'available_beds', 'occupancy_rate']
    def get_occupancy_rate(self, obj):
        if obj.total_beds > 0: return round((obj.occupied_beds / obj.total_beds) * 100, 1)
        return 0.0

# --- Serializer for Doctor on Appointment List ---
class HospitalSimpleDoctorProfileSerializer(serializers.ModelSerializer):
    user = SimpleUserSerializer(read_only=True)
    class Meta:
        model = DoctorProfile
        fields = ['user', 'specialization']

# --- Serializer for Main Appointment List ---
class HospitalAppointmentListSerializer(serializers.ModelSerializer):
    patient = SimplePatientProfileSerializer(read_only=True); doctor = HospitalSimpleDoctorProfileSerializer(read_only=True)
    class Meta:
        model = Appointment
        fields = ['id', 'custom_id', 'patient', 'doctor', 'appointment_datetime', 'status', 'token_number']
        read_only = True

# --- Serializer for Report Upload ---
class HospitalMedicalReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalReport
        fields = ['id', 'report_type', 'description', 'report_file', 'patient', 'created_at']
        read_only_fields = ['id', 'patient', 'created_at']

# --- Serializer for Managing Staff (GET/PATCH/DELETE) ---
class StaffDetailSerializer(serializers.ModelSerializer):
    user = SimpleUserSerializer()
    class Meta:
        model = StaffProfile
        fields = ['user', 'job_title']
    @transaction.atomic
    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {}); user_serializer = SimpleUserSerializer(instance.user, data=user_data, partial=True)
        if user_serializer.is_valid(raise_exception=True):
            user_serializer.save()
        return super().update(instance, validated_data)

# --- Serializer for Creating Staff ---
class StaffCreateSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True); password = serializers.CharField(write_only=True, required=True); first_name = serializers.CharField(required=True); last_name = serializers.CharField(required=True); contact_no = serializers.CharField(required=False); gender = serializers.CharField(required=False); date_of_birth = serializers.DateField(required=False); job_title = serializers.CharField(required=True)
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value
    @transaction.atomic
    def create(self, validated_data):
        hospital = self.context['hospital']
        user = User.objects.create_user(
            username=validated_data['email'], email=validated_data['email'], password=validated_data['password'],
            first_name=validated_data['first_name'], last_name=validated_data['last_name'],
            contact_no=validated_data.get('contact_no'), gender=validated_data.get('gender'),
            date_of_birth=validated_data.get('date_of_birth'), role='staff'
        )
        staff_profile = StaffProfile.objects.create(user=user, hospital=hospital, job_title=validated_data['job_title'])
        return staff_profile

# --- Serializer for Creating Patient ---
class PatientCreateSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True); password = serializers.CharField(write_only=True, required=True); first_name = serializers.CharField(required=True); last_name = serializers.CharField(required=True); contact_no = serializers.CharField(required=False); gender = serializers.CharField(required=False); date_of_birth = serializers.DateField(required=False); blood_group = serializers.CharField(required=False); allergies = serializers.CharField(required=False)
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value
    @transaction.atomic
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['email'], email=validated_data['email'], password=validated_data['password'],
            first_name=validated_data['first_name'], last_name=validated_data['last_name'],
            contact_no=validated_data.get('contact_no'), gender=validated_data.get('gender'),
            date_of_birth=validated_data.get('date_of_birth'), role='patient'
        )
        patient_profile = PatientProfile.objects.create(
            user=user,
            blood_group=validated_data.get('blood_group'),
            allergies=validated_data.get('allergies')
        )
        return patient_profile

# === MODIFIED SERIALIZER: FOR MANAGING (GET/PATCH/DELETE) A PATIENT ===
class HospitalPatientDetailSerializer(serializers.ModelSerializer):
    user = SimpleUserSerializer() # Nest the User serializer to see/update details
    
    # --- THIS IS THE NEW CODE ---
    # Show all appointments for this patient (from all hospitals)
    appointments = HospitalAppointmentListSerializer(many=True, read_only=True)
    # Show all medical reports for this patient
    medical_reports = HospitalMedicalReportSerializer(many=True, read_only=True)
    # --- END OF NEW CODE ---

    class Meta:
        model = PatientProfile
        fields = [
            'user', 
            'blood_group',
            'emergency_contact_no',
            'emergency_contact_relation',
            'allergies',
            'photo',
            'appointments',       # <-- Add this
            'medical_reports'     # <-- Add this
        ]

    @transaction.atomic
    def update(self, instance, validated_data):
        # This logic lets us update the nested User model
        user_data = validated_data.pop('user', {})
        user_serializer = SimpleUserSerializer(instance.user, data=user_data, partial=True)
        if user_serializer.is_valid(raise_exception=True):
            user_serializer.save()
        
        # Update the PatientProfile fields
        return super().update(instance, validated_data)