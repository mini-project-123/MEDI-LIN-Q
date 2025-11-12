#!/usr/bin/env python
"""
Comprehensive test for DoctorSettings component fix
Tests the complete flow from API to component rendering
"""

import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medilinq_config.settings')

import django
django.setup()

from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from api.models import DoctorProfile, User, Hospital
import json

def test_doctor_settings_complete_flow():
    """Test complete flow: Create doctor → Call API → Verify data structure"""
    print("\n" + "="*80)
    print("COMPREHENSIVE TEST: Doctor Settings Complete Flow")
    print("="*80)
    
    # Step 1: Create test hospital
    print("\n📍 Step 1: Creating test hospital...")
    try:
        hospital = Hospital.objects.filter(name='Test Hospital for Settings').first()
        if not hospital:
            hospital = Hospital.objects.create(
                name='Test Hospital for Settings',
                email='hospital-settings@test.com',
                contact_no1='+911234567890',
                address='123 Medical Avenue',
                operating_hours='9 AM - 9 PM',
                license_no='LIC-HOSP-2024-001'
            )
        print(f"✅ Hospital created/exists: {hospital.name} (ID: {hospital.id})")
    except Exception as e:
        print(f"❌ Failed to create hospital: {e}")
        return False
    
    # Step 2: Create test doctor
    print("\n📍 Step 2: Creating test doctor...")
    try:
        user = User.objects.filter(username='doctorsettings_test').first()
        if not user:
            user = User.objects.create_user(
                username='doctorsettings_test',
                email='doctorsettings@test.com',
                password='testpass123',
                first_name='Michael',
                last_name='Johnson',
                role='doctor',
                contact_no='+919876543210'
            )
            doctor_profile = DoctorProfile.objects.create(
                user=user,
                specialization='Cardiology',
                qualification='MD, FACC',
                experience_years=12,
                available_days='Monday,Tuesday,Wednesday,Thursday,Friday',
                languages_spoken='English,French,Spanish',
                hospital=hospital
            )
            print(f"✅ Doctor created: {user.first_name} {user.last_name}")
        else:
            doctor_profile = user.doctorprofile
            print(f"✅ Doctor exists: {user.first_name} {user.last_name}")
    except Exception as e:
        print(f"❌ Failed to create doctor: {e}")
        return False
    
    # Step 3: Authenticate
    print("\n📍 Step 3: Authenticating doctor...")
    try:
        refresh = RefreshToken.for_user(user)
        token = str(refresh.access_token)
        print(f"✅ Authentication successful")
    except Exception as e:
        print(f"❌ Authentication failed: {e}")
        return False
    
    # Step 4: Call API
    print("\n📍 Step 4: Calling /api/profile/doctor/manage/ endpoint...")
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
    
    try:
        response = client.get('/api/profile/doctor/manage/')
        if response.status_code != 200:
            print(f"❌ API returned {response.status_code}: {response.text}")
            return False
        
        data = response.json()
        print(f"✅ API call successful (Status: 200)")
    except Exception as e:
        print(f"❌ API call failed: {e}")
        return False
    
    # Step 5: Verify data structure
    print("\n📍 Step 5: Verifying data structure for component...")
    required_fields = {
        'user': ['first_name', 'last_name', 'email', 'contact_no'],
        'root': ['specialization', 'experience_years', 'available_days', 'languages_spoken']
    }
    
    all_good = True
    
    print(f"\n  ✓ Checking 'user' object:")
    if 'user' not in data:
        print(f"    ❌ Missing 'user' field")
        all_good = False
    else:
        for field in required_fields['user']:
            if field in data['user']:
                value = data['user'][field]
                print(f"    ✅ {field}: {value}")
            else:
                print(f"    ❌ Missing {field}")
                all_good = False
    
    print(f"\n  ✓ Checking root fields:")
    for field in required_fields['root']:
        if field in data:
            value = data[field]
            if isinstance(value, str) and len(value) > 50:
                value = value[:50] + "..."
            print(f"    ✅ {field}: {value}")
        else:
            print(f"    ❌ Missing {field}")
            all_good = False
    
    # Step 6: Simulate component rendering
    print("\n📍 Step 6: Simulating component rendering...")
    try:
        # Simulate component accessing data
        firstName = data['user']['first_name']
        lastName = data['user']['last_name']
        email = data['user']['email']
        phone = data['user']['contact_no']
        specialization = data['specialization']
        experience = data['experience_years']
        
        print(f"  ✅ Component can access all required fields:")
        print(f"     - Name: {firstName} {lastName}")
        print(f"     - Email: {email}")
        print(f"     - Phone: {phone}")
        print(f"     - Specialization: {specialization}")
        print(f"     - Experience: {experience} years")
        
    except Exception as e:
        print(f"  ❌ Component data access failed: {e}")
        all_good = False
    
    # Final result
    print("\n" + "="*80)
    if all_good:
        print("✅ ALL TESTS PASSED - Doctor Settings will work properly!")
        print("\nComponent will display:")
        print(f"  - Profile avatar with initial: {firstName[0]}")
        print(f"  - Name: {firstName} {lastName}")
        print(f"  - Contact: {phone}")
        print(f"  - Settings menu with profile section")
        print(f"  - All doctor information properly populated")
    else:
        print("❌ SOME TESTS FAILED - Component may have issues")
    print("="*80 + "\n")
    
    return all_good

if __name__ == '__main__':
    import sys
    success = test_doctor_settings_complete_flow()
    sys.exit(0 if success else 1)
