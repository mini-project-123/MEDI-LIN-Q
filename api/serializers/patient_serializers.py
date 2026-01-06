# api/serializers/patient_serializers.py

from rest_framework import serializers
from api.models import (
    User, PatientProfile, Appointment, MedicalReport, 
    Prescription, Medication, DoctorProfile, Hospital,
    Notification
)

# --- Re-usable Serializer for User ---
class SimplePatientUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'custom_id', 'gender', 'email', 'contact_no']
        read_only_fields = ['first_name', 'last_name', 'custom_id', 'gender', 'email', 'contact_no'] # Mark all as read-only


# --- Serializer for Patient List View ---
class PatientListSerializer(serializers.ModelSerializer):
    user = SimplePatientUserSerializer(read_only=True)
    age = serializers.IntegerField(source='user.age', read_only=True)

    class Meta:
        model = PatientProfile
        fields = ['user', 'age']
        read_only_fields = ['user', 'age']


# --- Serializers for Detail View ---
# (This serializer was incorrect in your file, it is now unused
#  and replaced by PatientDashboardAppointmentSerializer below)
# class SimpleAppointmentSerializer(serializers.ModelSerializer):
#    ...


class SimpleMedicalReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalReport
        fields = ['id', 'report_type', 'description', 'report_file', 'created_at']
        read_only_fields = ['id', 'report_type', 'description', 'report_file', 'created_at']


# --- Serializers for Prescriptions ---
class SimpleMedicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medication
        fields = ['name']
        read_only_fields = ['name']


class SimplePatientProfileSerializer(serializers.ModelSerializer):
    user = SimplePatientUserSerializer(read_only=True)

    class Meta:
        model = PatientProfile
        fields = ['user']
        read_only_fields = ['user']


class SimplePrescriptionSerializer(serializers.ModelSerializer):
    medication = SimpleMedicationSerializer(read_only=True)
    prescription_date = serializers.SerializerMethodField()
    doctor = serializers.SerializerMethodField() 

    class Meta:
        model = Prescription
        fields = [
            'id', 'medication', 'dosage', 'frequency',
            'duration', 'notes', 'prescription_date', 'doctor'
        ]
        read_only_fields = fields

    def get_prescription_date(self, obj):
        if obj.appointment:
            # Use appointment_date from the related appointment
            return obj.appointment.appointment_date 
        return None

    def get_doctor(self, obj):
        if obj.appointment and obj.appointment.doctor and obj.appointment.doctor.user:
            user = obj.appointment.doctor.user
            return f"Dr. {user.first_name} {user.last_name}"
        return "N/A" # Return a default string if anything is missing


# --- Main Serializer for Patient Detail View ---
class PatientDetailSerializer(serializers.ModelSerializer):
    user = SimplePatientUserSerializer(read_only=True)
    age = serializers.IntegerField(source='user.age', read_only=True)
    
    # We will use the new dashboard-specific serializer for appointments
    appointments = serializers.SerializerMethodField() 
    
    medical_reports = SimpleMedicalReportSerializer(many=True, read_only=True)

    class Meta:
        model = PatientProfile
        fields = [
            'user',
            'age',
            'blood_group',
            'emergency_contact_no',
            'emergency_contact_relation',
            'allergies',
            'photo',
            'appointments',
            'medical_reports',
        ]
        read_only_fields = fields

    def get_appointments(self, obj):
        # This method is just an example, PatientDashboardView doesn't use this serializer
        # But if it did, we'd use the PatientDashboardAppointmentSerializer
        appointments = Appointment.objects.filter(patient=obj)[:10] # Get 10 as an example
        return PatientDashboardAppointmentSerializer(appointments, many=True).data


# --- Serializer for Step-2 Profile Completion ---
class PatientProfileSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    
    class Meta:
        model = PatientProfile
        fields = [
            'user',
            'blood_group',
            'emergency_contact_no',
            'emergency_contact_relation',
            'allergies',
            'photo'
        ]
    
    def get_user(self, obj):
        return {
            'username': obj.user.username,
            'first_name': obj.user.first_name,
            'last_name': obj.user.last_name,
            'email': obj.user.email,
            'contact_no': obj.user.contact_no
        }

    def create(self, validated_data):
        # 'user' is passed from the view's perform_create method
        user = self.context['request'].user 
        profile, created = PatientProfile.objects.update_or_create(
            user=user, defaults=validated_data
        )
        return profile


# --- Prescription Create Serializer ---
class PrescriptionCreateSerializer(serializers.ModelSerializer):
    appointment = serializers.PrimaryKeyRelatedField(queryset=Appointment.objects.all())
    medication = serializers.PrimaryKeyRelatedField(queryset=Medication.objects.all())

    dry_run = serializers.BooleanField(write_only=True, required=False, default=False)

    class Meta:
        model = Prescription
        fields = [
            'appointment',
            'medication',
            'medication_name',
            'dosage',
            'frequency',
            'duration',
            'notes',
            'dry_run' 
        ]
    
    def validate(self, data):
        if 'medication' in data and 'medication_name' not in data:
            data['medication_name'] = data['medication'].name
        return data


# --- Public Serializers for Booking ---
class PublicHospitalSerializer(serializers.ModelSerializer):
    photo = serializers.SerializerMethodField()

    def get_photo(self, obj):
        """Return photo URL if exists, otherwise None"""
        if obj.photo:
            try:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(obj.photo.url)
                else:
                    return obj.photo.url
            except:
                return None
        return None

    class Meta:
        model = Hospital
        fields = ['id', 'custom_id', 'name', 'address', 'operating_hours', 'photo']


class PublicDoctorSerializer(serializers.ModelSerializer):
    user = SimplePatientUserSerializer(read_only=True)
    hospital = PublicHospitalSerializer(read_only=True)
    
    class Meta:
        model = DoctorProfile
        fields = [
            'user', 
            'specialization', 
            'qualification', 
            'experience_years', 
            'available_days',
            'languages_spoken',
            'hospital',
            'photo'
        ]


# --- Serializer for Creating a Booking (Step 2B) ---
class AppointmentCreateSerializer(serializers.ModelSerializer):
    doctor = serializers.PrimaryKeyRelatedField(queryset=DoctorProfile.objects.all())
    hospital = serializers.PrimaryKeyRelatedField(queryset=Hospital.objects.all())

    class Meta:
        model = Appointment
        fields = [
            'doctor', 
            'hospital', 
            'appointment_date',
            'appointment_time',
            'appointment_type',
        ]
    
    def validate(self, data):
        doctor = data.get('doctor')
        hospital = data.get('hospital')
        
        if doctor and hospital and doctor.hospital != hospital:
            raise serializers.ValidationError("This doctor does not work at the selected hospital.")
            
        return data
    


class AppointmentCancelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ['status']

    def validate_status(self, value):
        if value != 'cancelled':
            raise serializers.ValidationError("You can only update the status to 'cancelled'.")
        return value
    

class SimpleNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        # --- FIX: 'title' is not in your model, 'message' is ---
        fields = ['id', 'message', 'is_read', 'created_at']
        read_only_fields = fields


# --- NEW: Notification Update Serializer ---
class NotificationUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['is_read']

    def update(self, instance, validated_data):
        instance.is_read = validated_data.get('is_read', instance.is_read)
        instance.save()
        return instance


# --- NEW: Medical Report Create Serializer ---
class MedicalReportCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalReport
        fields = ['report_type', 'description', 'report_file', 'appointment']
        optional_fields = ['appointment', 'description']

    def create(self, validated_data):
        return MedicalReport.objects.create(**validated_data)


# --- BEGIN FIX FOR 500 ERROR ---

# --- NEW: Nested Serializers for Dashboard Appointments ---
class _PatientDashDoctorUserSerializer(serializers.ModelSerializer):
    """Minimal user data for the doctor"""
    class Meta:
        model = User
        fields = ['first_name', 'last_name']

class _PatientDashDoctorSerializer(serializers.ModelSerializer):
    """Minimal doctor data"""
    user = _PatientDashDoctorUserSerializer(read_only=True)
    class Meta:
        model = DoctorProfile
        fields = ['user', 'specialization']

class _PatientDashHospitalSerializer(serializers.ModelSerializer):
    """Minimal hospital data"""
    class Meta:
        model = Hospital
        fields = ['name']

# --- NEW: Dashboard-Specific Appointment Serializer ---
class PatientDashboardAppointmentSerializer(serializers.ModelSerializer):
    """
    Serializes an Appointment object with the nested data
    the frontend dashboard components are expecting.
    """
    doctor = _PatientDashDoctorSerializer(read_only=True)
    hospital = _PatientDashHospitalSerializer(read_only=True)

    class Meta:
        model = Appointment
        fields = [
            'id', 
            'custom_id', 
            'status', 
            'token_number', 
            'doctor', 
            'hospital',
            'appointment_date',
            'appointment_time'
        ]
        read_only_fields = fields


# --- NEW: Detailed Appointment Serializer ---
class PatientAppointmentDetailSerializer(serializers.ModelSerializer):
    """
    Detailed appointment information for single appointment view.
    """
    doctor = _PatientDashDoctorSerializer(read_only=True)
    hospital = _PatientDashHospitalSerializer(read_only=True)
    prescriptions = SimplePrescriptionSerializer(many=True, read_only=True, source='prescriptions')

    class Meta:
        model = Appointment
        fields = [
            'id',
            'custom_id',
            'status',
            'appointment_type',
            'token_number',
            'doctor',
            'hospital',
            'appointment_date',
            'appointment_time',
            'created_at',
            'updated_at',
            'prescriptions'
        ]
        read_only_fields = fields

# --- MODIFIED: Main Dashboard Serializer ---
class PatientDashboardSerializer(serializers.Serializer):
    profile = SimplePatientProfileSerializer(allow_null=True)
    
    # --- FIX: Use the new serializer we just defined ---
    upcoming_appointments = PatientDashboardAppointmentSerializer(many=True, read_only=True)
    recent_appointments = PatientDashboardAppointmentSerializer(many=True, read_only=True)
    # --- END OF FIX ---

    prescriptions = SimplePrescriptionSerializer(many=True, read_only=True)
    notifications = SimpleNotificationSerializer(many=True, read_only=True)
    stats = serializers.DictField()

    def validate_stats(self, value):
        return {
            'total_appointments': int(value.get('total_appointments', 0)),
            'upcoming_appointments': int(value.get('upcoming_appointments', 0)),
            'unread_notifications': int(value.get('unread_notifications', 0)),
        }

# --- END FIX FOR 500 ERROR ---


# --- AI & ADVANCED FEATURES SERIALIZERS ---

class PatientReportAISummarySerializer(serializers.Serializer):
    """
    Serializer for AI-generated medical report summary request.
    """
    report_id = serializers.IntegerField(write_only=True)
    summary = serializers.CharField(read_only=True)
    key_findings = serializers.ListField(
        child=serializers.CharField(),
        read_only=True
    )
    recommendations = serializers.ListField(
        child=serializers.CharField(),
        read_only=True
    )
    generated_at = serializers.DateTimeField(read_only=True)


class PatientAIChatbotRequestSerializer(serializers.Serializer):
    """
    Serializer for AI chatbot query request.
    """
    message = serializers.CharField(
        max_length=1000,
        help_text="Health-related query or message for the AI chatbot"
    )
    context = serializers.CharField(
        max_length=2000,
        required=False,
        allow_blank=True,
        help_text="Optional medical history or context"
    )


class PatientAIChatbotResponseSerializer(serializers.Serializer):
    """
    Serializer for AI chatbot response.
    """
    response = serializers.CharField()
    confidence_score = serializers.FloatField()
    suggested_actions = serializers.ListField(
        child=serializers.CharField(),
        required=False
    )
    disclaimer = serializers.CharField(read_only=True)


class PatientAppointmentVerifySerializer(serializers.Serializer):
    """
    Serializer for appointment verification before booking.
    """
    doctor_id = serializers.IntegerField(write_only=True)
    hospital_id = serializers.IntegerField(write_only=True)
    appointment_date = serializers.DateField(write_only=True)
    appointment_time = serializers.TimeField(write_only=True)
    appointment_type = serializers.ChoiceField(
        choices=['consultation', 'follow_up', 'check_up'],
        write_only=True
    )
    
    # Response fields
    is_available = serializers.BooleanField(read_only=True)
    doctor_info = _PatientDashDoctorSerializer(read_only=True)
    hospital_info = _PatientDashHospitalSerializer(read_only=True)
    estimated_wait_time = serializers.IntegerField(read_only=True, help_text="in minutes")
    confirmation_code = serializers.CharField(read_only=True, max_length=20)
    verification_token = serializers.CharField(read_only=True)