#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medilinq_config.settings')
django.setup()

from django.contrib.auth import authenticate

test_credentials = [
    ('admin@cityhospital.com', 'CityHosp@123', 'Hospital Admin'),
    ('james.wilson@cityhospital.com', 'DrWilson@123', 'Doctor'),
    ('john.smith@email.com', 'Patient@Smith1', 'Patient'),
    ('admin@apollomedical.com', 'Apollo@123', 'Hospital Admin'),
    ('emily.chen@apollomedical.com', 'DrChen@123', 'Doctor'),
    ('patricia.davis@email.com', 'Patient@Patricia4', 'Patient'),
]

print("Testing all credentials...\n")
all_working = True
for email, password, role in test_credentials:
    user = authenticate(username=email, password=password)
    status = '✅ SUCCESS' if user else '❌ FAILED'
    print(f"{status} - {email} ({role})")
    if not user:
        all_working = False

if all_working:
    print("\n✅ All credentials are working!")
else:
    print("\n❌ Some credentials failed!")
