from rest_framework import serializers
# --- 1. IMPORT THE HOSPITAL MODEL ---
from api.models import DoctorProfile, User, PatientProfile, Appointment, Hospital

# --- 2. PROFILE CREATION SERIALIZER ---
# Used for the "Step 2" registration form
class DoctorProfileSerializer(serializers.ModelSerializer):
    
    # --- 3. THIS IS THE FIX ---
    # This field tells Django to accept a numeric Primary Key (like 40)
    # for the 'hospital' field.
    hospital = serializers.PrimaryKeyRelatedField(
        queryset=Hospital.objects.all()
    )
    
    class Meta:
        model = DoctorProfile
        # All fields from your drawing are included here
        fields = [
            'specialization', 
            'qualification', 
            'experience_years', 
            'available_days', 
            'languages_spoken', 
            'hospital', 
            'photo'
        ]


# --- 4. RE-USABLE NESTED SERIALIZERS ---
# (These are unchanged)

class SimplePatientUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'custom_id']
        read_only = True

class SimplePatientProfileSerializer(serializers.ModelSerializer):
    user = SimplePatientUserSerializer(read_only=True)
    class Meta:
        model = PatientProfile
        fields = ['user']
        read_only = True

# --- 5. DASHBOARD SUMMARY SERIALIZER ---
# (These are unchanged)

class NextAppointmentSerializer(serializers.ModelSerializer):
    patient = SimplePatientProfileSerializer(read_only=True)
    class Meta:
        model = Appointment
        fields = ['id', 'patient', 'appointment_datetime']
        read_only = True

# --- 6. "MY APPOINTMENTS" PAGE SERIALIZER ---
# (These are unchanged)

class DoctorAppointmentSerializer(serializers.ModelSerializer):
    patient = SimplePatientProfileSerializer(read_only=True)
    class Meta:
        model = Appointment
        fields = [
            'id',
            'custom_id',
            'patient',
            'appointment_datetime',
            'status',
            'token_number'
        ]
        read_only = True