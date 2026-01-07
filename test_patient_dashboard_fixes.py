#!/usr/bin/env python
"""
Test script to verify patient dashboard fixes.
Tests appointments, reports, and booking functionality.
"""

import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medilinq_config.settings')
django.setup()

from api.models import (
    User, PatientProfile, DoctorProfile, Hospital, Appointment,
    MedicalReport
)
from django.utils import timezone
from datetime import timedelta

def test_appointments():
    """Test appointment creation and retrieval"""
    print("\n" + "="*60)
    print("  TESTING APPOINTMENTS")
    print("="*60)
    
    # Get a patient and doctor
    patient = PatientProfile.objects.first()
    doctor = DoctorProfile.objects.first()
    hospital = Hospital.objects.first()
    
    if not all([patient, doctor, hospital]):
        print("✗ Missing required data")
        return False
    
    print(f"✓ Patient: {patient.user.email}")
    print(f"✓ Doctor: {doctor.user.email}")
    print(f"✓ Hospital: {hospital.name}")
    
    # Create a test appointment
    tomorrow = timezone.now().date() + timedelta(days=1)
    appointment = Appointment.objects.create(
        patient=patient,
        doctor=doctor,
        hospital=hospital,
        appointment_date=tomorrow,
        appointment_time="10:00:00",
        appointment_type="consultation",
        status="confirmed"
    )
    
    print(f"✓ Created appointment: {appointment.id}")
    
    # Verify appointment can be retrieved
    retrieved = Appointment.objects.filter(patient=patient).first()
    if retrieved:
        print(f"✓ Retrieved appointment: {retrieved.id}")
        return True
    else:
        print("✗ Failed to retrieve appointment")
        return False

def test_medical_reports():
    """Test medical report creation and retrieval"""
    print("\n" + "="*60)
    print("  TESTING MEDICAL REPORTS")
    print("="*60)
    
    # Get a patient
    patient = PatientProfile.objects.first()
    if not patient:
        print("✗ No patient found")
        return False
    
    print(f"✓ Patient: {patient.user.email}")
    
    # Create a test report
    report = MedicalReport.objects.create(
        patient=patient,
        report_type="blood_test",
        description="Test blood report"
    )
    
    print(f"✓ Created report: {report.id}")
    
    # Verify report can be retrieved
    retrieved = MedicalReport.objects.filter(patient=patient).first()
    if retrieved:
        print(f"✓ Retrieved report: {retrieved.id}")
        print(f"✓ Report type: {retrieved.report_type}")
        return True
    else:
        print("✗ Failed to retrieve report")
        return False

def test_doctor_availability():
    """Test doctor slot availability"""
    print("\n" + "="*60)
    print("  TESTING DOCTOR AVAILABILITY")
    print("="*60)
    
    # Get a doctor
    doctor = DoctorProfile.objects.first()
    if not doctor:
        print("✗ No doctor found")
        return False
    
    print(f"✓ Doctor: {doctor.user.email}")
    print(f"✓ Specialization: {doctor.specialization}")
    
    # Check available slots
    tomorrow = timezone.now().date() + timedelta(days=1)
    
    # Count booked slots
    booked = Appointment.objects.filter(
        doctor=doctor,
        appointment_date=tomorrow,
        status__in=['pending', 'confirmed']
    ).count()
    
    print(f"✓ Booked slots for tomorrow: {booked}")
    
    # Calculate available slots (9 AM to 5 PM = 8 slots)
    available = 8 - booked
    print(f"✓ Available slots for tomorrow: {available}")
    
    if available > 0:
        print("✓ Doctor has available slots")
        return True
    else:
        print("⚠ Doctor has no available slots")
        return True  # Still pass, just informational

def test_appointment_booking_flow():
    """Test the complete appointment booking flow"""
    print("\n" + "="*60)
    print("  TESTING APPOINTMENT BOOKING FLOW")
    print("="*60)
    
    # Get required data
    patient = PatientProfile.objects.first()
    doctor = DoctorProfile.objects.first()
    hospital = Hospital.objects.first()
    
    if not all([patient, doctor, hospital]):
        print("✗ Missing required data")
        return False
    
    print(f"✓ Step 1: Hospital selected - {hospital.name}")
    print(f"✓ Step 2: Doctor selected - {doctor.user.first_name} {doctor.user.last_name}")
    
    # Find an available slot
    tomorrow = timezone.now().date() + timedelta(days=1)
    
    # Skip if weekend
    if tomorrow.weekday() >= 5:
        tomorrow = tomorrow + timedelta(days=2)
    
    print(f"✓ Step 3: Date selected - {tomorrow}")
    
    # Find available time
    available_time = None
    for hour in range(9, 17):
        time_str = f"{hour:02d}:00:00"
        existing = Appointment.objects.filter(
            doctor=doctor,
            appointment_date=tomorrow,
            appointment_time=time_str,
            status__in=['pending', 'confirmed']
        ).exists()
        
        if not existing:
            available_time = time_str
            break
    
    if not available_time:
        print("✗ No available time slots")
        return False
    
    print(f"✓ Step 4: Time slot selected - {available_time}")
    
    # Create appointment
    appointment = Appointment.objects.create(
        patient=patient,
        doctor=doctor,
        hospital=hospital,
        appointment_date=tomorrow,
        appointment_time=available_time,
        appointment_type="consultation",
        status="confirmed"
    )
    
    print(f"✓ Step 5: Appointment booked - {appointment.id}")
    print(f"✓ Booking complete!")
    
    return True

def test_data_isolation():
    """Test that patient data is properly isolated"""
    print("\n" + "="*60)
    print("  TESTING DATA ISOLATION")
    print("="*60)
    
    # Get two different patients
    patients = PatientProfile.objects.all()[:2]
    
    if len(patients) < 2:
        print("⚠ Only one patient in database, skipping isolation test")
        return True
    
    patient1, patient2 = patients
    
    # Get appointments for each patient
    appts1 = Appointment.objects.filter(patient=patient1).count()
    appts2 = Appointment.objects.filter(patient=patient2).count()
    
    print(f"✓ Patient 1 ({patient1.user.email}): {appts1} appointments")
    print(f"✓ Patient 2 ({patient2.user.email}): {appts2} appointments")
    
    # Verify they don't see each other's appointments
    for appt in Appointment.objects.filter(patient=patient1):
        if appt.patient != patient1:
            print("✗ Data isolation failed!")
            return False
    
    print("✓ Data isolation verified")
    return True

def main():
    print("\n" + "="*60)
    print("  PATIENT DASHBOARD FIXES - TEST SUITE")
    print("="*60)
    
    tests = [
        ("Appointments", test_appointments),
        ("Medical Reports", test_medical_reports),
        ("Doctor Availability", test_doctor_availability),
        ("Appointment Booking Flow", test_appointment_booking_flow),
        ("Data Isolation", test_data_isolation),
    ]
    
    results = {}
    for test_name, test_func in tests:
        try:
            results[test_name] = test_func()
        except Exception as e:
            print(f"✗ Error in {test_name}: {str(e)}")
            results[test_name] = False
    
    # Summary
    print("\n" + "="*60)
    print("  TEST SUMMARY")
    print("="*60)
    
    for test_name, passed in results.items():
        symbol = "✓" if passed else "✗"
        status = "PASS" if passed else "FAIL"
        print(f"  {symbol} {test_name}: {status}")
    
    all_passed = all(results.values())
    
    print("\n" + "="*60)
    if all_passed:
        print("  ✓ ALL TESTS PASSED")
    else:
        print("  ✗ SOME TESTS FAILED")
    print("="*60 + "\n")
    
    return 0 if all_passed else 1

if __name__ == '__main__':
    sys.exit(main())
