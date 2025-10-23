from rest_framework import serializers
from api.models import PatientProfile

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