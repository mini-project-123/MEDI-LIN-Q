#!/usr/bin/env python
"""
Test the updated DoctorProfileSerializer to verify it returns user data
"""

import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medilinq_config.settings')

import django
django.setup()

from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from api.models import DoctorProfile, User

def test_updated_doctor_profile():
    """Test that doctor profile endpoint returns user data"""
    print("\n" + "="*70)
    print("TEST: Updated Doctor Profile Endpoint")
    print("="*70)
    
    # Create test doctor
    try:
        user = User.objects.filter(username='testdoctor2').first()
        if not user:
            user = User.objects.create_user(
                username='testdoctor2',
                email='testdoctor2@test.com',
                password='testpass123',
                first_name='John',
                last_name='Smith',
                role='doctor',
                contact_no='+919999999999'
            )
            DoctorProfile.objects.create(
                user=user,
                specialization='Neurology',
                qualification='MD, FRCS',
                experience_years=8,
                available_days='Mon,Tue,Wed,Thu,Fri',
                languages_spoken='English,Hindi,Spanish'
            )
        
        refresh = RefreshToken.for_user(user)
        token = str(refresh.access_token)
    except Exception as e:
        print(f"❌ Failed to create test doctor: {e}")
        return False
    
    # Make API request
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
    
    try:
        response = client.get('/api/profile/doctor/manage/')
        print(f"\nStatus Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"\n✅ SUCCESS: Got doctor profile with updated structure")
            print(f"\nResponse Structure:")
            print(f"  - Keys: {list(data.keys())}")
            
            if 'user' in data:
                print(f"\n✅ User data included in response:")
                print(f"  - First Name: {data['user'].get('first_name')}")
                print(f"  - Last Name: {data['user'].get('last_name')}")
                print(f"  - Email: {data['user'].get('email')}")
                print(f"  - Contact: {data['user'].get('contact_no')}")
            else:
                print(f"\n❌ User data NOT in response")
                return False
            
            print(f"\n✅ Doctor Profile Data:")
            print(f"  - Specialization: {data.get('specialization')}")
            print(f"  - Experience: {data.get('experience_years')} years")
            print(f"  - Qualification: {data.get('qualification')}")
            print(f"  - Hospital Name: {data.get('hospital_name', 'N/A')}")
            print(f"  - Available Days: {data.get('available_days')}")
            print(f"  - Languages: {data.get('languages_spoken')}")
            
            print(f"\n✅ Full Response Data:")
            import json
            print(json.dumps(data, indent=2, default=str))
            
            return True
        else:
            print(f"❌ FAILED: Status {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    result = test_updated_doctor_profile()
    print("\n" + "="*70)
    if result:
        print("✅ TEST PASSED - Serializer returns correct structure")
    else:
        print("❌ TEST FAILED - Serializer needs fixing")
    print("="*70 + "\n")
