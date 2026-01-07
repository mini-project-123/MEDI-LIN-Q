# api/serializers/hospital_serializers.py
from rest_framework import serializers
from api.models import (
    Hospital, DoctorProfile, StaffProfile, User, Ward, Appointment,
    PatientProfile, MedicalReport
)
from api.serializers.patient_serializers import SimplePatientProfileSerializer
from django.db import transaction


# ------------------------------ Reusable User Serializer ------------------------------
class SimpleUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'first_name', 'last_name', 'middle_name', 'custom_id', 'email',
            'contact_no', 'gender', 'date_of_birth', 'address'
        ]
        read_only_fields = ['custom_id']


# ------------------------------ Hospital Create/Update ------------------------------
class HospitalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hospital
        fields = [
            'name', 'address', 'contact_no1', 'contact_no2', 'email', 'website',
            'license_no', 'operating_hours', 'num_departments', 'photo'
        ]
    
    def create(self, validated_data):
        user = self.context['request'].user if self.context.get('request') else None
        if not user:
            raise serializers.ValidationError('User context is required for hospital creation.')
        hospital = Hospital.objects.create(user=user, **validated_data)
        return hospital


# ------------------------------ Hospital Doctor List ------------------------------
class HospitalDoctorListSerializer(serializers.ModelSerializer):
    user = SimpleUserSerializer(read_only=True)

    class Meta:
        model = DoctorProfile
        fields = [
            'user', 'specialization', 'qualification', 'experience_years',
            'available_days', 'photo'
        ]


# ------------------------------ Hospital Staff List ------------------------------
class HospitalStaffListSerializer(serializers.ModelSerializer):
    user = SimpleUserSerializer(read_only=True)

    class Meta:
        model = StaffProfile
        fields = ['user', 'job_title']


# ------------------------------ Hospital Ward Serializer ------------------------------
class HospitalWardSerializer(serializers.ModelSerializer):
    available_beds = serializers.SerializerMethodField()
    occupancy_rate = serializers.SerializerMethodField()

    class Meta:
        model = Ward
        fields = ['id', 'name', 'total_beds', 'occupied_beds', 'available_beds', 'occupancy_rate']
        read_only_fields = ['id', 'name', 'total_beds', 'occupied_beds', 'available_beds', 'occupancy_rate']

    def get_available_beds(self, obj):
        return obj.available_beds

    def get_occupancy_rate(self, obj):
        if obj.total_beds > 0:
            return round((obj.occupied_beds / obj.total_beds) * 100, 1)
        return 0.0


# ------------------------------ Small Doctor Serializer ------------------------------
class HospitalSimpleDoctorProfileSerializer(serializers.ModelSerializer):
    user = SimpleUserSerializer(read_only=True)

    class Meta:
        model = DoctorProfile
        fields = ['user', 'specialization']


# ------------------------------ Appointment List ------------------------------
class HospitalAppointmentListSerializer(serializers.ModelSerializer):
    patient = SimplePatientProfileSerializer(read_only=True)
    doctor = HospitalSimpleDoctorProfileSerializer(read_only=True)

    class Meta:
        model = Appointment
        fields = ['id', 'custom_id', 'patient', 'doctor', 'appointment_date', 'appointment_time', 'status', 'token_number']
        read_only_fields = fields


# ------------------------------ Medical Report Upload ------------------------------
class HospitalMedicalReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalReport
        fields = ['id', 'report_type', 'description', 'report_file', 'created_at']
    read_only_fields = ['id', 'created_at']


# ------------------------------ Staff Detail (GET/PATCH/DELETE) ------------------------------
class StaffDetailSerializer(serializers.ModelSerializer):
    user = SimpleUserSerializer()

    class Meta:
        model = StaffProfile
        fields = ['user', 'job_title']

    @transaction.atomic
    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        user_serializer = SimpleUserSerializer(instance.user, data=user_data, partial=True)
        user_serializer.is_valid(raise_exception=True)
        user_serializer.save()
        return super().update(instance, validated_data)


# ------------------------------ Staff Creation ------------------------------
class StaffCreateSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)
    contact_no = serializers.CharField(required=False)
    gender = serializers.CharField(required=False, default='Male')
    date_of_birth = serializers.DateField(required=False)
    job_title = serializers.CharField(required=True)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    @transaction.atomic
    def create(self, validated_data):
        hospital = self.context['hospital']
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            contact_no=validated_data.get('contact_no'),
            gender=validated_data.get('gender', 'Male'),
            date_of_birth=validated_data.get('date_of_birth'),
            role='staff'
        )
        staff_profile = StaffProfile.objects.create(
            user=user,
            hospital=hospital,
            job_title=validated_data['job_title']
        )
        return staff_profile


# ------------------------------ Patient Creation ------------------------------
class PatientCreateSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)
    contact_no = serializers.CharField(required=False, allow_blank=True)
    gender = serializers.CharField(required=False, default='Male')
    date_of_birth = serializers.DateField(required=False)
    blood_group = serializers.CharField(required=False, allow_blank=True)
    allergies = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_email(self, value):
        """Check if email already exists"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    @transaction.atomic
    def create(self, validated_data):
        try:
            user = User.objects.create_user(
                username=validated_data['email'],
                email=validated_data['email'],
                password=validated_data['password'],
                first_name=validated_data['first_name'],
                last_name=validated_data['last_name'],
                contact_no=validated_data.get('contact_no'),
                gender=validated_data.get('gender', 'Male'),
                date_of_birth=validated_data.get('date_of_birth'),
                role='patient'
            )

            patient_profile = PatientProfile.objects.create(
                user=user,
                blood_group=validated_data.get('blood_group'),
                allergies=validated_data.get('allergies')
            )
            return patient_profile
        except Exception as e:
            raise serializers.ValidationError(f"Error creating patient: {str(e)}")


# ------------------------------ Patient Detail (GET/PATCH/DELETE) ------------------------------
class HospitalPatientDetailSerializer(serializers.ModelSerializer):
    user = SimpleUserSerializer()
    appointments = HospitalAppointmentListSerializer(many=True, read_only=True)
    medical_reports = HospitalMedicalReportSerializer(many=True, read_only=True)

    class Meta:
        model = PatientProfile
        fields = [
            'user', 'blood_group', 'emergency_contact_no', 'emergency_contact_relation',
            'allergies', 'photo', 'appointments', 'medical_reports'
        ]

    @transaction.atomic
    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        user_serializer = SimpleUserSerializer(instance.user, data=user_data, partial=True)
        user_serializer.is_valid(raise_exception=True)
        user_serializer.save()
        return super().update(instance, validated_data)
