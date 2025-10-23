from rest_framework import serializers
from api.models import Hospital

class HospitalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hospital
        fields = [
            'name', 
            'address', 
            'contact_no1', 
            'contact_no2', 
            'email', 
            'website',
            'license_no',
            'operating_hours',
            'num_departments',
            'photo'
        ]