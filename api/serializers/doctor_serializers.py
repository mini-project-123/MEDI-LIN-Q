from rest_framework import serializers
from api.models import DoctorProfile, User, PatientProfile, Appointment

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

class SimplePatientUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name']

class SimplePatientProfileSerializer(serializers.ModelSerializer):
    user = SimplePatientUserSerializer(read_only=True)
    class Meta:
        model = PatientProfile
        fields = ['user', 'custom_id']

# This serializer is for the "Next Appointment" card
class NextAppointmentSerializer(serializers.ModelSerializer):
    patient = SimplePatientProfileSerializer(read_only=True)

    class Meta:
        model = Appointment
        fields = ['id', 'patient', 'appointment_datetime']
        # We can add 'type_of_visit' if you add that to your Appointment model