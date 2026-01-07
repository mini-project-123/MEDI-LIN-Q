#!/usr/bin/env python
"""
Debug the appointments list issue
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medilinq_config.settings')
django.setup()

from django.contrib.auth import get_user_model
from api.models import PatientProfile, Appointment, DoctorProfile

User = get_user_model()

# Get a patient with appointments
patients = PatientProfile.objects.filter(appointments__isnull=False).distinct()
print(f"Patients with appointments: {patients.count()}")

if patients.exists():
    patient = patients.first()
    print(f"\nPatient: {patient.user.username}")
    
    appointments = patient.appointments.all()
    print(f"Appointments: {appointments.count()}")
    
    for apt in appointments[:2]:
        print(f"\n  Appointment: {apt.custom_id}")
        print(f"    - Date: {apt.appointment_date}")
        print(f"    - Doctor: {apt.doctor}")
        print(f"    - Doctor user_id: {apt.doctor.user_id if apt.doctor else 'NONE'}")
        
        # Check doctor profile
        try:
            doctor = DoctorProfile.objects.get(user_id=apt.doctor.user_id)
            print(f"    - Doctor found: {doctor.user.first_name}")
        except Exception as e:
            print(f"    - Error getting doctor: {e}")
        
        # Check doctor user
        try:
            if apt.doctor:
                print(f"    - Doctor user: {apt.doctor.user.first_name} {apt.doctor.user.last_name}")
        except Exception as e:
            print(f"    - Error getting doctor user: {e}")
        
        # Check hospital
        try:
            if apt.hospital:
                print(f"    - Hospital: {apt.hospital.name}")
            else:
                print(f"    - Hospital: NONE")
        except Exception as e:
            print(f"    - Error getting hospital: {e}")
