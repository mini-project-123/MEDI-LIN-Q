#!/usr/bin/env python
"""Test script to verify medical report upload endpoint"""

import os
import django
from django.test import Client
from io import BytesIO

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medilinq_config.settings')
django.setup()

from api.models import User, PatientProfile, Hospital
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

# Get or create test admin user
try:
    admin_user = User.objects.filter(role='hospital_admin').first()
    if not admin_user:
        print("❌ No hospital admin user found")
        exit()
except:
    print("❌ Error finding admin user")
    exit()

# Get hospital
hospital = Hospital.objects.first()
if not hospital:
    print("❌ No hospital found in database")
    exit()

print(f"✅ Using hospital: {hospital.name}")

# Get first patient from database
patient_user = User.objects.filter(role='patient').first()
if not patient_user:
    print("❌ No patient user found in database")
    exit()

try:
    patient = PatientProfile.objects.get(user=patient_user)
except PatientProfile.DoesNotExist:
    patient = PatientProfile.objects.create(user=patient_user)

print(f"✅ Setup complete:")
print(f"   Admin user: {admin_user.email} (ID: {admin_user.id})")
print(f"   Patient user: {patient_user.email} (ID: {patient_user.id})")

# Get token for admin
refresh = RefreshToken.for_user(admin_user)
token = str(refresh.access_token)

# Now test the upload endpoint
client = APIClient()
client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

# Create a test file
test_file = BytesIO(b"Test PDF content")
test_file.name = 'test_report.pdf'

# Test endpoint
endpoint = f'/api/hospital/patients/{patient_user.id}/upload-report/'
print(f"\n🔧 Testing endpoint: {endpoint}")
print(f"   Using token for: {admin_user.email}")

data = {
    'report_type': 'Blood Test',
    'description': 'Test report description',
    'report_file': test_file
}

response = client.post(endpoint, data, format='multipart')

print(f"\n📊 Response:")
print(f"   Status: {response.status_code}")
print(f"   Data: {response.json() if response.status_code < 500 else response.content}")

if response.status_code in [200, 201]:
    print("\n✅ Upload endpoint works!")
else:
    print(f"\n❌ Error uploading report")
    if hasattr(response, 'errors'):
        print(f"   Errors: {response.errors}")
