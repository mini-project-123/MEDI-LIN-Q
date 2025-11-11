#!/usr/bin/env python
"""Test the patient dashboard endpoint directly"""

import os
import sys
import django
from django.test import RequestFactory

sys.path.insert(0, r"d:\Projects\Medi Lin Q")
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medilinq_config.settings')
django.setup()

from django.contrib.auth import get_user_model
from api.models import PatientProfile
from api.views.patient_views import PatientDashboardView
from rest_framework.test import APIRequestFactory
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

print("=" * 60)
print("Testing PatientDashboardView")
print("=" * 60)

try:
    # Create or get test user
    user, _ = User.objects.get_or_create(
        username='dashboardtest',
        defaults={'email': 'dashboardtest@example.com'}
    )
    
    # Create or get patient profile
    patient_profile, _ = PatientProfile.objects.get_or_create(
        user=user,
        defaults={'blood_group': 'O+'}
    )
    
    print(f"\n✓ Test user created: {user.username}")
    print(f"✓ Patient profile exists: {patient_profile.user.username}")
    
    # Create a fake request with authentication
    factory = APIRequestFactory()
    request = factory.get('/api/dashboard/')
    request.user = user
    
    # Add JWT token to simulate authenticated request
    token = RefreshToken.for_user(user)
    request.META['HTTP_AUTHORIZATION'] = f'Bearer {token.access_token}'
    
    # Call the view
    view = PatientDashboardView.as_view()
    response = view(request)
    
    print(f"\n✓ View executed successfully")
    print(f"  Status Code: {response.status_code}")
    
    if response.status_code == 200:
        print(f"  Response Data Keys: {list(response.data.keys())}")
        print(f"  Profile: {response.data.get('profile')}")
        print(f"  Upcoming: {len(response.data.get('upcoming_appointments', []))} appointments")
        print(f"  Recent: {len(response.data.get('recent_appointments', []))} appointments")
        print(f"  Stats: {response.data.get('stats')}")
        print("\n✅ DASHBOARD VIEW WORKS!")
    else:
        print(f"  Error: {response.data}")
        print("\n❌ VIEW RETURNED ERROR")
        
except Exception as e:
    import traceback
    print(f"\n❌ Exception: {e}")
    traceback.print_exc()
