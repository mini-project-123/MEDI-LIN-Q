# api/serializers/patient_serializers.py

from rest_framework import serializers
from api.models import (
    User, PatientProfile, Appointment, MedicalReport, 
    Prescription, Medication, DoctorProfile, Hospital # <-- Add DoctorProfile and Hospital
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
        fields = ['id', 'custom_id', 'appointment_datetime', 'status']
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

    # Your fix: include patient from appointment → patient → profile
    patient = SimplePatientProfileSerializer(source='appointment.patient', read_only=True)

    class Meta:
        model = Prescription
        fields = [
            'id', 'patient', 'medication', 'dosage', 'frequency',
            'duration', 'notes', 'prescription_date'
        ]
        read_only = True

    def get_prescription_date(self, obj):
        if obj.appointment:
            return obj.appointment.appointment_datetime.date()
        return None


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
            'dosage',
            'frequency',
            'duration',
            'notes',
<<<<<<< HEAD
            'dry_run' # Our special flag
        ]
class PublicHospitalSerializer(serializers.ModelSerializer):
    """
    Shows simple, public-safe info about a hospital.
    """
    class Meta:
        model = Hospital
        fields = ['id', 'custom_id', 'name', 'address', 'operating_hours', 'photo']


class PublicDoctorSerializer(serializers.ModelSerializer):
    """
    Shows public-safe info about a doctor for booking.
    """
    # Nest the user's name
    user = SimplePatientUserSerializer(read_only=True)
    # Nest the hospital's name
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
    """
    Serializer for a Patient to create a new appointment.
    """
    # The patient will provide the ID for the doctor and hospital
    doctor = serializers.PrimaryKeyRelatedField(queryset=DoctorProfile.objects.all())
    hospital = serializers.PrimaryKeyRelatedField(queryset=Hospital.objects.all())

    class Meta:
        model = Appointment
        fields = [
            'doctor', 
            'hospital', 
            'appointment_datetime',
        ]
        # Note: 'patient' and 'status' are set automatically in the view

    def validate(self, data):
        """
        Optional: Add validation to ensure the doctor works at the hospital.
        """
        doctor = data.get('doctor')
        hospital = data.get('hospital')
        
        if doctor and hospital and doctor.hospital != hospital:
            raise serializers.ValidationError("This doctor does not work at the selected hospital.")
            
        # You could also add validation to check if the slot is available
        
        return data
=======
            'dry_run'
        ]
>>>>>>> 614477cf38751a12c5c45ccaaa3f59893a3cbd70
