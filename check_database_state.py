#!/usr/bin/env python
"""
Simplified test to verify data consistency in the database
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medilinq_config.settings')
django.setup()

from api.models import Hospital, DoctorProfile, Appointment, TimeSlot, PatientProfile
from django.contrib.auth import get_user_model

User = get_user_model()

print("=" * 60)
print("DATABASE CONSISTENCY CHECK")
print("=" * 60)

# Check Hospitals
hospitals = Hospital.objects.all()
print(f"\n✓ Total Hospitals: {hospitals.count()}")
for hospital in hospitals[:3]:
    docs = hospital.doctors.count()
    print(f"  - {hospital.name}: {docs} doctors")
    for doctor in hospital.doctors.all()[:2]:
        slots = doctor.time_slots.count()
        print(f"    - Dr. {doctor.user.first_name}: {slots} time slots")

# Check Patients and Appointments
patients = PatientProfile.objects.all()
print(f"\n✓ Total Patients: {patients.count()}")
for patient in patients[:3]:
    apts = patient.appointments.count()
    print(f"  - {patient.user.first_name} {patient.user.last_name}: {apts} appointments")
    for apt in patient.appointments.all()[:2]:
        print(f"    - {apt.custom_id}: {apt.appointment_date} @ {apt.appointment_time} (Status: {apt.status})")

# Check upcoming vs past appointments
from datetime import date
upcoming = Appointment.objects.filter(appointment_date__gte=date.today()).count()
past = Appointment.objects.filter(appointment_date__lt=date.today()).count()
print(f"\n✓ Appointment Distribution:")
print(f"  - Upcoming (today and later): {upcoming}")
print(f"  - Past: {past}")
print(f"  - Total: {Appointment.objects.count()}")

print("\n" + "=" * 60)
print("DATABASE CHECK COMPLETE")
print("=" * 60)
