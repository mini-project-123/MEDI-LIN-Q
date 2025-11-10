# api/serializers/patient_serializers.py

from rest_framework import serializers
from api.models import (
    User, PatientProfile, Appointment, MedicalReport, 
    Prescription, Medication, DoctorProfile, Hospital
)


# --- Re-usable Serializer for User ---
class SimplePatientUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'custom_id', 'gender', 'email', 'contact_no']
        read_only = True


# --- Serializer for Patient List View ---
class PatientListSerializer(serializers.ModelSerializer):
    user = SimplePatientUserSerializer(read_only=True)
    age = serializers.IntegerField(source='user.age', read_only=True)

    class Meta:
        model = PatientProfile
        fields = ['user', 'age']
        read_only = True


# --- Serializers for Detail View ---
class SimpleAppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ['id', 'custom_id', 'appointment_date', 'appointment_time', 'status']
        read_only = True


class SimpleMedicalReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalReport
        fields = ['id', 'report_type', 'description', 'report_file', 'created_at']
        read_only = True


# --- Serializers for Prescriptions ---
class SimpleMedicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medication
        fields = ['name']
        read_only = True


class SimplePatientProfileSerializer(serializers.ModelSerializer):
    user = SimplePatientUserSerializer(read_only=True)

    class Meta:
        model = PatientProfile
        fields = ['user']
        read_only = True


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
        read_only = True

    def get_prescription_date(self, obj):
        if obj.appointment:
            return obj.appointment.appointment_date 
        return None

    def get_doctor(self, obj):
        # --- THIS IS THE FIX ---
        # We must safely check every step of the chain (appointment, doctor, user)
        # to prevent a crash if any part is None.
        if obj.appointment and obj.appointment.doctor and obj.appointment.doctor.user:
            user = obj.appointment.doctor.user
            return f"Dr. {user.first_name} {user.last_name}"
        return "N/A" # Return a default string if anything is missing
        # --- END OF FIX ---


# --- Main Serializer for Patient Detail View ---
class PatientDetailSerializer(serializers.ModelSerializer):
    user = SimplePatientUserSerializer(read_only=True)
    age = serializers.IntegerField(source='user.age', read_only=True)
    appointments = SimpleAppointmentSerializer(many=True, read_only=True)
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
        read_only = True


# --- Serializer for Step-2 Profile Completion ---
class PatientProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientProfile
        fields = [
            'blood_group',
            'emergency_contact_no',
            'emergency_contact_relation',
            'allergies',
            'photo'
        ]

    def create(self, validated_data):
        user = validated_data.pop('user', None)
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


class PublicHospitalSerializer(serializers.ModelSerializer):
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