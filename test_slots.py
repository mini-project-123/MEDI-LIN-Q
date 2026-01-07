#!/usr/bin/env python
import os
import django
import requests

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medilinq_config.settings')
django.setup()

from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

User = get_user_model()

# Get a patient user
patient_user = User.objects.filter(role='patient').first()
if patient_user:
    print(f"Testing with patient: {patient_user.email}\n")
    
    # Generate token
    refresh = RefreshToken.for_user(patient_user)
    access_token = str(refresh.access_token)
    
    # Get a doctor
    from api.models import DoctorProfile
    doctor = DoctorProfile.objects.first()
    
    if doctor:
        print(f"Testing doctor slots for: {doctor.user.first_name} {doctor.user.last_name}\n")
        
        # Test the slots endpoint
        headers = {'Authorization': f'Bearer {access_token}'}
        response = requests.get(
            f'http://127.0.0.1:8000/api/booking/doctors/{doctor.user.id}/slots/',
            headers=headers
        )
        
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Doctor: {data['doctor_name']}")
            print(f"Specialization: {data['specialization']}")
            print(f"Hospital: {data['hospital']}")
            print(f"Available Slots: {len(data['available_slots'])}")
            print(f"\nFirst 5 slots:")
            for slot in data['available_slots'][:5]:
                print(f"  - {slot['date']} at {slot['time']}")
        else:
            print(f"Error: {response.text}")
    else:
        print("No doctors found")
else:
    print("No patients found")
