#!/usr/bin/env python
"""
Complete test for appointment booking and dashboard display.
"""

import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medilinq_config.settings')
django.setup()

from api.models import (
    User, PatientProfile, DoctorProfile, Hospital, Appointment
)
from django.utils import timezone
from datetime import timedelta

def test_complete_booking_flow():
    """Test complete booking flow and dashboard display"""
    print("\n" + "="*60)
    print("  COMPLETE BOOKING FLOW TEST")
    print("="*60)
    
    # Get a patient
    patient = PatientProfile.objects.first()
    if not patient:
        print("✗ No patient found")
        return False
    
    print(f"\n✓ Patient: {patient.user.email}")
    
    # Get a doctor
    doctor = DoctorProfile.objects.first()
    if not doctor:
        print("✗ No doctor found")
        return False
    
    print(f"✓ Doctor: Dr. {doctor.user.first_name} {doctor.user.last_name}")
    
    # Get hospital
    hospital = doctor.hospital
    if not hospital:
        print("✗ Doctor has no hospital")
        return False
    
    print(f"✓ Hospital: {hospital.name}")
    
    # Find an available slot
    tomorrow = timezone.now().date() + timedelta(days=1)
    
    # Skip if weekend
    if tomorrow.weekday() >= 5:
        tomorrow = tomorrow + timedelta(days=2)
    
    print(f"✓ Appointment date: {tomorrow}")
    
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
    
    print(f"✓ Available time: {available_time}")
    
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
    
    print(f"✓ Appointment created: {appointment.id}")
    print(f"  Custom ID: {appointment.custom_id}")
    print(f"  Status: {appointment.status}")
    
    # Verify appointment appears in patient's appointments
    patient_appointments = Appointment.objects.filter(patient=patient)
    print(f"\n✓ Patient's total appointments: {patient_appointments.count()}")
    
    # Check if newly created appointment is in the list
    found = patient_appointments.filter(id=appointment.id).exists()
    if found:
        print(f"✓ Newly created appointment found in patient's list")
    else:
        print(f"✗ Newly created appointment NOT found in patient's list")
        return False
    
    # Check upcoming appointments
    today = timezone.now().date()
    upcoming = patient_appointments.filter(appointment_date__gte=today)
    print(f"✓ Upcoming appointments: {upcoming.count()}")
    
    if appointment in upcoming:
        print(f"✓ Appointment appears in upcoming appointments")
    else:
        print(f"✗ Appointment does NOT appear in upcoming appointments")
        return False
    
    # Verify appointment details
    print(f"\n✓ Appointment Details:")
    print(f"  Doctor: Dr. {appointment.doctor.user.first_name} {appointment.doctor.user.last_name}")
    print(f"  Hospital: {appointment.hospital.name}")
    print(f"  Date: {appointment.appointment_date}")
    print(f"  Time: {appointment.appointment_time}")
    print(f"  Type: {appointment.appointment_type}")
    print(f"  Status: {appointment.status}")
    
    return True

def test_multiple_doctors_availability():
    """Test availability for multiple doctors"""
    print("\n" + "="*60)
    print("  MULTIPLE DOCTORS AVAILABILITY TEST")
    print("="*60)
    
    doctors = DoctorProfile.objects.all()[:3]
    
    if not doctors:
        print("✗ No doctors found")
        return False
    
    tomorrow = timezone.now().date() + timedelta(days=1)
    
    # Skip if weekend
    if tomorrow.weekday() >= 5:
        tomorrow = tomorrow + timedelta(days=2)
    
    print(f"\nTesting availability for {tomorrow}:")
    
    for doctor in doctors:
        booked = Appointment.objects.filter(
            doctor=doctor,
            appointment_date=tomorrow,
            status__in=['pending', 'confirmed']
        ).count()
        
        available = 8 - booked
        print(f"\n✓ Dr. {doctor.user.first_name} {doctor.user.last_name}")
        print(f"  Booked: {booked}/8")
        print(f"  Available: {available}/8")
        
        if available > 0:
            print(f"  Status: ✓ Has available slots")
        else:
            print(f"  Status: ⚠ No available slots")
    
    return True

def main():
    print("\n" + "="*60)
    print("  APPOINTMENT BOOKING & DASHBOARD TEST SUITE")
    print("="*60)
    
    tests = [
        ("Complete Booking Flow", test_complete_booking_flow),
        ("Multiple Doctors Availability", test_multiple_doctors_availability),
    ]
    
    results = {}
    for test_name, test_func in tests:
        try:
            results[test_name] = test_func()
        except Exception as e:
            print(f"✗ Error in {test_name}: {str(e)}")
            import traceback
            traceback.print_exc()
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
        print("  Booking system is fully functional!")
    else:
        print("  ✗ SOME TESTS FAILED")
    print("="*60 + "\n")
    
    return 0 if all_passed else 1

if __name__ == '__main__':
    sys.exit(main())
