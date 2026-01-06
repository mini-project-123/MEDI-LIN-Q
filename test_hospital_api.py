#!/usr/bin/env python
"""Test hospital signup through actual API endpoint"""
import os
import django
import json
import requests
from datetime import timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medilinq_config.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

try:
    # Get the hospital user
    user = User.objects.get(email='hospital@110.com')
    print(f'Testing API with user: {user.email} (ID: {user.id})')
    
    # Generate token for testing
    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)
    print(f'Generated access token')
    
    # Test hospital creation through API
    hospital_data = {
        'name': 'City Medical Center',
        'address': '456 Medical Ave',
        'contact_no1': '555-2024',
        'email': 'admin@citymedical.com',
        'license_no': 'LIC-2024',
        'operating_hours': '24/7',
        'num_departments': 8
    }
    
    print('\nCalling API endpoint: /api/profile/hospital/')
    response = requests.post(
        'http://127.0.0.1:8000/api/profile/hospital/',
        headers={'Authorization': f'Bearer {access_token}'},
        json=hospital_data,
        timeout=10
    )
    
    print(f'Response Status: {response.status_code}')
    
    if response.status_code == 201:
        print('✓ Hospital created successfully via API!')
        
        # Verify in database
        from api.models import Hospital
        hospital = Hospital.objects.get(user=user)
        print(f'  Name: {hospital.name}')
        print(f'  User ID: {hospital.user_id}')
        print(f'  Email: {hospital.email}')
        print('\n✓ HOSPITAL SIGNUP API FIX VERIFIED!')
        
    elif response.status_code >= 400:
        print(f'✗ API Error {response.status_code}')
        try:
            print(f'Response: {response.text[:500]}')
        except:
            print(f'Response body (bytes): {response.content[:500]}')
    else:
        print(f'Unexpected status code')
        print(f'Response: {response.text}')
        
except Exception as e:
    print(f'✗ Error: {e}')
    import traceback
    traceback.print_exc()
