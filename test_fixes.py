#!/usr/bin/env python
"""
Quick test script to verify the fixes for:
1. DoctorSettings component (uses /api/profile/doctor/manage/)
2. Hospital list endpoint (uses /api/booking/workflow/hospitals/)
"""

import os
import sys

# Setup Django BEFORE importing models
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medilinq_config.settings')

import django
django.setup()

import requests
from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from api.models import DoctorProfile, Hospital, PatientProfile
from django.contrib.auth import get_user_model

User = get_user_model()

def get_doctor_tokens():
    """Create test doctor and get tokens"""
    try:
        user = User.objects.filter(username='testdoctor1').first()
        if not user:
            # Create doctor user
            user = User.objects.create_user(
                username='testdoctor1',
                email='testdoctor1@test.com',
                password='testpass123',
                first_name='Test',
                last_name='Doctor',
                role='doctor',
                contact_no='+919999999999'
            )
            # Create doctor profile
            DoctorProfile.objects.create(
                user=user,
                specialization='Cardiology',
                qualification='MD, Board Certified',
                experience_years=5,
                available_days='Mon,Tue,Wed,Thu,Fri',
                languages_spoken='English,Hindi'
            )
    except Exception as e:
        print(f"Error creating doctor: {e}")
        return None
    
    try:
        refresh = RefreshToken.for_user(user)
        return str(refresh.access_token)
    except Exception as e:
        print(f"Error getting tokens: {e}")
        return None

def test_doctor_profile_endpoint():
    """Test /api/profile/doctor/manage/ endpoint"""
    print("\n" + "="*60)
    print("TEST 1: Doctor Profile Endpoint (/api/profile/doctor/manage/)")
    print("="*60)
    
    token = get_doctor_tokens()
    if not token:
        print("❌ Failed to create test doctor and get tokens")
        return False
    
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
    
    try:
        response = client.get('/api/profile/doctor/manage/')
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ SUCCESS: Got doctor profile")
            try:
                first_name = data.get('user', {}).get('first_name') or data.get('first_name', 'Test')
                last_name = data.get('user', {}).get('last_name') or data.get('last_name', 'Doctor')
                print(f"   - Doctor Name: {first_name} {last_name}")
                print(f"   - Specialization: {data.get('specialization', 'N/A')}")
                print(f"   - Experience: {data.get('experience_years', 'N/A')} years")
            except Exception as parse_err:
                print(f"   - Response structure: {list(data.keys())[:5]}")
                print(f"   - Data successfully retrieved (parse warning ignored)")
            return True
        else:
            print(f"❌ FAILED: Status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False

def test_hospital_list_endpoint():
    """Test /api/booking/workflow/hospitals/ endpoint"""
    print("\n" + "="*60)
    print("TEST 2: Hospital List Endpoint (/api/booking/workflow/hospitals/)")
    print("="*60)
    
    # Create test patient
    try:
        user = User.objects.filter(username='testpatient1').first()
        if not user:
            user = User.objects.create_user(
                username='testpatient1',
                email='testpatient1@test.com',
                password='testpass123',
                first_name='Test',
                last_name='Patient',
                role='patient',
                contact_no='+918888888888'
            )
            PatientProfile.objects.create(
                user=user,
                blood_group='O+',
                allergies='None'
            )
        
        refresh = RefreshToken.for_user(user)
        token = str(refresh.access_token)
    except Exception as e:
        print(f"❌ Failed to create test patient: {e}")
        return False
    
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
    
    try:
        response = client.get('/api/booking/workflow/hospitals/')
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ SUCCESS: Got hospital list")
            
            # Check pagination or direct list
            if isinstance(data, dict) and 'results' in data:
                hospitals = data['results']
                print(f"   - Total hospitals (this page): {len(hospitals)}")
                if hospitals:
                    print(f"   - Sample hospital: {hospitals[0].get('name', 'N/A')}")
            elif isinstance(data, list):
                print(f"   - Total hospitals: {len(data)}")
                if data:
                    print(f"   - Sample hospital: {data[0].get('name', 'N/A')}")
            else:
                print(f"   - Response type: {type(data)}")
            
            return True
        else:
            print(f"❌ FAILED: Status {response.status_code}")
            print(f"   Response: {response.text[:500]}")
            return False
    except Exception as e:
        print(f"❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    print("\n🧪 Running Fix Verification Tests")
    print("================================\n")
    
    test1_result = test_doctor_profile_endpoint()
    test2_result = test_hospital_list_endpoint()
    
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    print(f"Test 1 (Doctor Profile): {'✅ PASSED' if test1_result else '❌ FAILED'}")
    print(f"Test 2 (Hospital List):  {'✅ PASSED' if test2_result else '❌ FAILED'}")
    print("\n")
    
    if test1_result and test2_result:
        print("✅ All fixes verified successfully!")
        return 0
    else:
        print("❌ Some tests failed. Check output above.")
        return 1

if __name__ == '__main__':
    sys.exit(main())
