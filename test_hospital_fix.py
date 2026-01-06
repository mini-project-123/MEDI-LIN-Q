#!/usr/bin/env python
"""Test hospital serializer fix"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medilinq_config.settings')
django.setup()

from api.models import User, Hospital
from api.serializers.hospital_serializers import HospitalSerializer

# Get the hospital user
try:
    user = User.objects.get(email='hospital@110.com')
    print(f'User: {user.email}, ID: {user.id}, Role: {user.role}')
    
    # Check if hospital already exists
    try:
        existing = Hospital.objects.get(user=user)
        print(f'Hospital already exists: {existing.name}')
        existing.delete()
        print('Deleted existing hospital for clean test')
    except Hospital.DoesNotExist:
        pass
    
    # Create a mock context with the user
    class MockRequest:
        def __init__(self, user):
            self.user = user
    
    context = {'request': MockRequest(user)}
    
    # Test the serializer
    hospital_data = {
        'name': 'City Medical Center',
        'address': '456 Medical Ave',
        'contact_no1': '555-2024',
        'email': 'admin@citymedical.com',
        'license_no': 'LIC-2024',
        'operating_hours': '24/7',
        'num_departments': 8
    }
    
    serializer = HospitalSerializer(data=hospital_data, context=context)
    
    if serializer.is_valid():
        print('✓ Serializer is valid')
        hospital = serializer.save()
        print(f'✓ Hospital created: {hospital.name}')
        print(f'  User ID linked: {hospital.user_id}')
        print(f'  Email: {hospital.email}')
        print('\n✓ HOSPITAL SIGNUP FIX SUCCESSFUL!')
    else:
        print(f'✗ Serializer errors: {serializer.errors}')
except Exception as e:
    print(f'✗ Error: {e}')
    import traceback
    traceback.print_exc()
