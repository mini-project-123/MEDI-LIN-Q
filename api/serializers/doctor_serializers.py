from rest_framework import serializers
from api.models import DoctorProfile, User, PatientProfile, Appointment

# --- 1. PROFILE CREATION SERIALIZER ---
# Used for the "Step 2" registration form
class DoctorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorProfile
        fields = [
            'specialization', 
            'qualification', 
            'experience_years', 
            'available_days', 
            'languages_spoken', 
            'hospital', 
            'photo'
        ]
        # 'user' is added automatically in the view

# --- 2. RE-USABLE NESTED SERIALIZERS ---
# These are used by other serializers to show patient info

class SimplePatientUserSerializer(serializers.ModelSerializer):
    """
    Formats basic User info (name, custom ID) for patient display.
    """
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'custom_id']
        read_only = True # Make fields read-only as they are nested

class SimplePatientProfileSerializer(serializers.ModelSerializer):
    """
    Formats the patient profile, nesting the user info.
    """
    user = SimplePatientUserSerializer(read_only=True) # Nests the serializer above
    class Meta:
        model = PatientProfile
        fields = ['user'] # We only care about the nested 'user' info here
        read_only = True

# --- 3. DASHBOARD SUMMARY SERIALIZER ---
# Used for the "Next Appointment" card on the main dashboard

class NextAppointmentSerializer(serializers.ModelSerializer):
    """
    Formats the "Next Appointment" card, including basic patient info.
    """
    patient = SimplePatientProfileSerializer(read_only=True) # Nests patient info
    class Meta:
        model = Appointment
        fields = ['id', 'patient', 'appointment_datetime']
        read_only = True

# --- 4. "MY APPOINTMENTS" PAGE SERIALIZER ---
# Used for the main list on the appointments page

class DoctorAppointmentSerializer(serializers.ModelSerializer):
    """
    Formats an appointment for the doctor's main appointment list.
    Includes key patient details.
    """
    patient = SimplePatientProfileSerializer(read_only=True) # Nests patient info

    class Meta:
        model = Appointment
        # Define the fields we want in the list for each appointment
        fields = [
            'id',
            'custom_id',
            'patient',
            'appointment_datetime',
            'status',
            'token_number'
        ]
        read_only = True





