#!/usr/bin/env python
import os
import django
from django.contrib.auth import get_user_model

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medilinq_config.settings')
django.setup()

from api.models import Hospital, DoctorProfile, PatientProfile
from datetime import datetime, timedelta

User = get_user_model()

print("Creating demo credentials...\n")

# Create Hospital Admin
print("=" * 60)
print("HOSPITAL ADMIN")
print("=" * 60)
hospital_admin = User.objects.create_user(
    username='hospital_admin',
    email='admin@hospital.com',
    password='Admin@123',
    first_name='Hospital',
    last_name='Admin',
    role='hospital_admin'
)

hospital = Hospital.objects.create(
    user=hospital_admin,
    name='City Medical Center',
    email='admin@hospital.com',
    contact_no1='555-0001',
    address='123 Medical Street, Downtown'
)
hospital.admins.add(hospital_admin)

print(f"Email: admin@hospital.com")
print(f"Password: Admin@123")
print(f"Role: Hospital Admin\n")

# Create Doctor
print("=" * 60)
print("DOCTOR")
print("=" * 60)
doctor_user = User.objects.create_user(
    username='doctor_user',
    email='doctor@hospital.com',
    password='Doctor@123',
    first_name='John',
    last_name='Smith',
    role='doctor'
)

doctor_profile = DoctorProfile.objects.create(
    user=doctor_user,
    hospital=hospital,
    specialization='Cardiology',
    experience_years=10
)

print(f"Email: doctor@hospital.com")
print(f"Password: Doctor@123")
print(f"Role: Doctor")
print(f"Specialization: Cardiology\n")

# Create Patient
print("=" * 60)
print("PATIENT")
print("=" * 60)
patient_user = User.objects.create_user(
    username='patient_user',
    email='patient@email.com',
    password='Patient@123',
    first_name='Jane',
    last_name='Doe',
    role='patient'
)

patient_profile = PatientProfile.objects.create(
    user=patient_user,
    blood_group='O+',
    emergency_contact_no='555-9999'
)

print(f"Email: patient@email.com")
print(f"Password: Patient@123")
print(f"Role: Patient")
print(f"Blood Group: O+\n")

print("=" * 60)
print("✅ Demo credentials created successfully!")
print("=" * 60)
print("\nLogin URL: http://localhost:3000/login")
print("\nYou can now login with any of the above credentials.")
