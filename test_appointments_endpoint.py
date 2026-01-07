#!/usr/bin/env python
"""
Test the appointments endpoint to see what's happening
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medilinq_config.settings')
django.setup()

import requests
from rest_framework.test import APIClient

from django.contrib.auth import get_user_model
from api.models import PatientProfile

User = get_user_model()

# Test 1: Check if patient exists
print("=" * 60)
print("Testing Appointments Endpoint")
print("=" * 60)

# Get first patient
patients = PatientProfile.objects.all()
print(f"\n✓ Total patients: {patients.count()}")

if patients.exists():
    patient = patients.first()
    user = patient.user
    print(f"\n✓ Test patient: {user.username} (ID: {user.id})")
    print(f"  - User role: {user.role}")
    print(f"  - Appointments: {patient.appointments.count()}")
    
    # Test direct query
    from api.models import Appointment
    apts = Appointment.objects.filter(patient=patient)
    print(f"\n✓ Direct query appointments: {apts.count()}")
    for apt in apts[:3]:
        print(f"  - {apt.custom_id}: {apt.appointment_date} @ {apt.appointment_time}")
else:
    print("✗ No patients found in database")

print("\n" + "=" * 60)
