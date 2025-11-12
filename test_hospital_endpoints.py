#!/usr/bin/env python
"""Test hospital endpoints to identify 500 errors"""

import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medilinq_config.settings')
django.setup()

from django.test import Client
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from api.models import User, Hospital
import json

# Create a test admin user
def create_test_admin():
    # Delete if exists
    User.objects.filter(email='testadmin@test.com').delete()
    Hospital.objects.filter(name='Test Hospital').delete()
    
    # Create admin user
    user = User.objects.create_user(
        username='testadmin',
        email='testadmin@test.com',
        password='testpass123',
        first_name='Admin',
        last_name='User',
        role='hospital_admin'
    )
    
    # Create hospital
    hospital = Hospital.objects.create(
        name='Test Hospital',
        address='123 Test St',
        contact_no1='1234567890',
        email='hospital@test.com',
        license_no='LIC123456'
    )
    
    # Add user as admin to hospital
    hospital.admins.add(user)
    
    print(f"[OK] Created test admin: {user.email}")
    print(f"[OK] Created test hospital: {hospital.name}")
    print(f"[OK] Admin associated with hospital")
    
    return user, hospital

def get_jwt_token(user):
    """Get JWT token for user"""
    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)
    return access_token

def test_endpoints():
    """Test all hospital endpoints"""
    # Create test admin
    user, hospital = create_test_admin()
    token = get_jwt_token(user)
    
    # Initialize API client
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
    
    # List of endpoints to test
    endpoints = [
        ('/api/hospital/dashboard-summary/', 'GET', 'Dashboard Summary'),
        ('/api/hospital/patients/', 'GET', 'Patient List'),
        ('/api/hospital/doctors/', 'GET', 'Doctor List'),
        ('/api/hospital/wards/', 'GET', 'Ward List'),
        ('/api/hospital/staff/', 'GET', 'Staff List'),
        ('/api/hospital/appointments/', 'GET', 'Appointment List'),
        ('/api/hospital/analytics/', 'GET', 'Analytics'),
        ('/api/hospital/profile/manage/', 'GET', 'Hospital Profile'),
    ]
    
    print("\n" + "="*80)
    print("TESTING HOSPITAL ENDPOINTS")
    print("="*80 + "\n")
    
    for endpoint, method, description in endpoints:
        try:
            print(f"Testing: {description}")
            print(f"  Endpoint: {endpoint}")
            
            if method == 'GET':
                response = client.get(endpoint)
            
            print(f"  Status: {response.status_code}")
            
            if response.status_code >= 400:
                print(f"  [ERROR] {response.status_code}")
                if response.content:
                    try:
                        data = response.json()
                        print(f"  Response: {json.dumps(data, indent=2)}")
                    except:
                        print(f"  Response: {response.content}")
            else:
                print(f"  [OK] SUCCESS")
                try:
                    data = response.json()
                    if isinstance(data, dict):
                        print(f"  Keys: {list(data.keys())}")
                    elif isinstance(data, list):
                        print(f"  Count: {len(data)}")
                except:
                    pass
            
        except Exception as e:
            print(f"  [ERROR] EXCEPTION: {str(e)}")
        
        print()

if __name__ == '__main__':
    try:
        test_endpoints()
    except Exception as e:
        print(f"[ERROR] Error: {str(e)}")
        import traceback
        traceback.print_exc()
