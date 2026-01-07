#!/usr/bin/env python
"""
Test the fixed appointments endpoint
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medilinq_config.settings')
django.setup()

import json
from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory
from rest_framework_simplejwt.tokens import RefreshToken
from api.views.patient_views import PatientAppointmentsHistoryView

User = get_user_model()

# Get a patient
patient_user = User.objects.filter(role='patient', patientprofile__isnull=False).first()

if patient_user:
    print(f"Testing with patient: {patient_user.username}")
    
    # Create a request with authentication
    factory = APIRequestFactory()
    request = factory.get('/api/patients/appointments/')
    request.user = patient_user
    
    # Add authentication
    from rest_framework.test import force_authenticate
    force_authenticate(request, user=patient_user)
    
    # Call the view
    view = PatientAppointmentsHistoryView.as_view()
    response = view(request)
    
    print(f"\nResponse status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.data
        print(f"Appointments count: {len(data) if isinstance(data, list) else 'ERROR'}")
        
        if isinstance(data, list) and len(data) > 0:
            apt = data[0]
            print(f"\nFirst appointment:")
            print(f"  - ID: {apt.get('id')}")
            print(f"  - Custom ID: {apt.get('custom_id')}")
            print(f"  - Date: {apt.get('appointment_date')}")
            print(f"  - Time: {apt.get('appointment_time')}")
            print(f"  - Doctor: {apt.get('doctor', {}).get('user', {}).get('first_name')} {apt.get('doctor', {}).get('user', {}).get('last_name')}")
            print(f"  - Hospital: {apt.get('hospital', {}).get('name')}")
            print(f"  - Status: {apt.get('status')}")
            print("\n✅ SUCCESS: Appointments endpoint is working!")
        else:
            print(f"Data: {data}")
    else:
        print(f"Error: {response.data}")
else:
    print("No patient found")
