#!/usr/bin/env python
"""
Script to create test data for hospital111
Creates doctors, patients, and staff for testing all functionalities
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medilinq_config.settings')
django.setup()

from django.contrib.auth import get_user_model
from api.models import Hospital, DoctorProfile, PatientProfile, StaffProfile
from rest_framework_simplejwt.tokens import RefreshToken
import json

User = get_user_model()

def create_hospital_admin():
    """Create hospital admin account for hospital111"""
    try:
        user = User.objects.get(email='hospital@111.com')
        print(f"✓ Hospital admin already exists: {user.email}")
        return user
    except User.DoesNotExist:
        user = User.objects.create_user(
            username='hospital111',
            email='hospital@111.com',
            password='hospital111',
            first_name='Hospital',
            last_name='Admin111',
            role='hospital'
        )
        print(f"✓ Created hospital admin: {user.email}")
        return user

def create_hospital_profile(admin_user):
    """Create hospital profile"""
    try:
        # Try to find existing hospital for this admin
        hospital = Hospital.objects.get(user=admin_user)
        print(f"✓ Hospital profile already exists: {hospital.name}")
        return hospital
    except Hospital.DoesNotExist:
        hospital = Hospital.objects.create(
            user=admin_user,
            name='Test Hospital 111',
            address='123 Hospital Street, City',
            contact_no1='555-0111',
            contact_no2='555-0112',
            email='info@hospital111.com',
            website='www.hospital111.com',
            license_no='LIC-H111-2025',
            operating_hours='24/7',
            num_departments=5
        )
        hospital.admins.add(admin_user)
        print(f"✓ Created hospital: {hospital.name}")
        return hospital

def create_doctors(hospital):
    """Create test doctors for hospital111"""
    doctors_data = [
        {'first_name': 'Sarah', 'last_name': 'Johnson', 'specialization': 'Cardiology', 'experience': 8},
        {'first_name': 'Michael', 'last_name': 'Chen', 'specialization': 'Orthopedics', 'experience': 12},
        {'first_name': 'Emily', 'last_name': 'Williams', 'specialization': 'Pediatrics', 'experience': 6},
        {'first_name': 'James', 'last_name': 'Brown', 'specialization': 'Internal Medicine', 'experience': 10},
    ]

    created_doctors = []
    for doctor_data in doctors_data:
        email = f"doctor_{doctor_data['first_name'].lower()}_{doctor_data['last_name'].lower()}@hospital111.com"
        try:
            doctor_user = User.objects.get(email=email)
            print(f"  ✓ Doctor already exists: {doctor_user.get_full_name()}")
        except User.DoesNotExist:
            doctor_user = User.objects.create_user(
                username=email,
                email=email,
                password='doctor123',
                first_name=doctor_data['first_name'],
                last_name=doctor_data['last_name'],
                contact_no='555-' + str(1000 + len(created_doctors)),
                role='doctor',
                gender='Male' if doctor_data['first_name'] in ['Michael', 'James'] else 'Female'
            )
            DoctorProfile.objects.create(
                user=doctor_user,
                hospital=hospital,
                specialization=doctor_data['specialization'],
                qualification='MD',
                experience_years=doctor_data['experience'],
                available_days='Mon,Tue,Wed,Thu,Fri'
            )
            print(f"  ✓ Created doctor: {doctor_user.get_full_name()} ({doctor_data['specialization']})")
            created_doctors.append(doctor_user)

    return created_doctors

def create_staff(hospital):
    """Create test staff for hospital111"""
    staff_data = [
        {'first_name': 'Lisa', 'last_name': 'Martinez', 'job_title': 'Nurse'},
        {'first_name': 'Robert', 'last_name': 'Taylor', 'job_title': 'Lab Technician'},
        {'first_name': 'Jennifer', 'last_name': 'Davis', 'job_title': 'Receptionist'},
        {'first_name': 'David', 'last_name': 'Rodriguez', 'job_title': 'Nurse'},
    ]

    created_staff = []
    for staff in staff_data:
        email = f"staff_{staff['first_name'].lower()}_{staff['last_name'].lower()}@hospital111.com"
        try:
            staff_user = User.objects.get(email=email)
            print(f"  ✓ Staff already exists: {staff_user.get_full_name()}")
        except User.DoesNotExist:
            staff_user = User.objects.create_user(
                username=email,
                email=email,
                password='staff123',
                first_name=staff['first_name'],
                last_name=staff['last_name'],
                contact_no='555-' + str(2000 + len(created_staff)),
                role='staff',
                gender='Female' if staff['first_name'] in ['Lisa', 'Jennifer'] else 'Male'
            )
            StaffProfile.objects.create(
                user=staff_user,
                hospital=hospital,
                job_title=staff['job_title']
            )
            print(f"  ✓ Created staff: {staff_user.get_full_name()} ({staff['job_title']})")
            created_staff.append(staff_user)

    return created_staff

def create_patients(hospital):
    """Create test patients for hospital111"""
    patients_data = [
        {'first_name': 'John', 'last_name': 'Smith', 'age': 45, 'gender': 'Male'},
        {'first_name': 'Patricia', 'last_name': 'Anderson', 'age': 32, 'gender': 'Female'},
        {'first_name': 'Christopher', 'last_name': 'Thomas', 'age': 58, 'gender': 'Male'},
        {'first_name': 'Amanda', 'last_name': 'Jackson', 'age': 27, 'gender': 'Female'},
    ]

    created_patients = []
    for patient_data in patients_data:
        email = f"patient_{patient_data['first_name'].lower()}_{patient_data['last_name'].lower()}@hospital111.com"
        try:
            patient_user = User.objects.get(email=email)
            print(f"  ✓ Patient already exists: {patient_user.get_full_name()}")
        except User.DoesNotExist:
            patient_user = User.objects.create_user(
                username=email,
                email=email,
                password='patient123',
                first_name=patient_data['first_name'],
                last_name=patient_data['last_name'],
                contact_no='555-' + str(3000 + len(created_patients)),
                role='patient',
                gender=patient_data['gender'],
                date_of_birth='1980-01-01'
            )
            PatientProfile.objects.create(
                user=patient_user,
                blood_group='O+',
                allergies='None',
                emergency_contact_no='555-' + str(9000 + len(created_patients))
            )
            print(f"  ✓ Created patient: {patient_user.get_full_name()}")
            created_patients.append(patient_user)

    return created_patients

def main():
    print("\n" + "="*60)
    print("Creating Test Data for Hospital 111")
    print("="*60 + "\n")

    print("Step 1: Creating Hospital Admin Account")
    print("-" * 40)
    admin_user = create_hospital_admin()

    print("\nStep 2: Creating Hospital Profile")
    print("-" * 40)
    hospital = create_hospital_profile(admin_user)

    print("\nStep 3: Creating Doctors (4)")
    print("-" * 40)
    doctors = create_doctors(hospital)

    print("\nStep 4: Creating Staff (4)")
    print("-" * 40)
    staff = create_staff(hospital)

    print("\nStep 5: Creating Patients (4)")
    print("-" * 40)
    patients = create_patients(hospital)

    # Generate token for testing
    refresh = RefreshToken.for_user(admin_user)
    token = str(refresh.access_token)

    print("\n" + "="*60)
    print("Test Data Created Successfully!")
    print("="*60)
    print("\nLogin Credentials for Testing:")
    print(f"  Email: {admin_user.email}")
    print(f"  Password: hospital111")
    print(f"\nAccess Token (for API testing):")
    print(f"  {token}")
    print("\nTest User Accounts:")
    print("\nDoctors:")
    for doctor in doctors:
        print(f"  - {doctor.email}")
    print("\nStaff:")
    for s in staff:
        print(f"  - {s.email}")
    print("\nPatients:")
    for patient in patients:
        print(f"  - {patient.email}")
    print("\n" + "="*60 + "\n")

if __name__ == '__main__':
    main()
