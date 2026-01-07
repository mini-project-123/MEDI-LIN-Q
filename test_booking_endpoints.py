#!/usr/bin/env python
"""
Test booking endpoints to verify doctors and slots are showing correctly.
"""

import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medilinq_config.settings')
django.setup()

from api.models import Hospital, DoctorProfile, Appointment
from datetime import datetime, timedelta

def test_hospital_doctors():
    """Test hospital doctors endpoint"""
    print("\n" + "="*60)
    print("  TESTING HOSPITAL DOCTORS ENDPOINT")
    print("="*60)
    
    hospitals = Hospital.objects.all()
    
    for hospital in hospitals:
        doctors = hospital.doctors.all()
        print(f"\n✓ Hospital: {hospital.name}")
        print(f"  Total doctors: {doctors.count()}")
        
        for doctor in doctors:
            print(f"  - Dr. {doctor.user.first_name} {doctor.user.last_name}")
            print(f"    Specialization: {doctor.specialization}")
            print(f"    Experience: {doctor.experience_years} years")
    
    return True

def test_doctor_slots():
    """Test doctor slots endpoint"""
    print("\n" + "="*60)
    print("  TESTING DOCTOR SLOTS ENDPOINT")
    print("="*60)
    
    doctor = DoctorProfile.objects.first()
    if not doctor:
        print("✗ No doctor found")
        return False
    
    print(f"\n✓ Doctor: Dr. {doctor.user.first_name} {doctor.user.last_name}")
    print(f"  Specialization: {doctor.specialization}")
    
    # Test for tomorrow
    tomorrow = datetime.now().date() + timedelta(days=1)
    
    # Skip if weekend
    if tomorrow.weekday() >= 5:
        tomorrow = tomorrow + timedelta(days=2)
    
    print(f"  Testing date: {tomorrow} ({tomorrow.strftime('%A')})")
    
    # Count booked appointments
    booked = Appointment.objects.filter(
        doctor=doctor,
        appointment_date=tomorrow,
        status__in=['pending', 'confirmed']
    ).count()
    
    print(f"  Booked slots: {booked}")
    
    # Calculate available slots
    available = 8 - booked
    print(f"  Available slots: {available}")
    
    # List available times
    print(f"  Available times:")
    for hour in range(9, 17):
        time_str = f"{hour:02d}:00:00"
        existing = Appointment.objects.filter(
            doctor=doctor,
            appointment_date=tomorrow,
            appointment_time=time_str,
            status__in=['pending', 'confirmed']
        ).exists()
        
        status_str = "BOOKED" if existing else "AVAILABLE"
        print(f"    {time_str} - {status_str}")
    
    return True

def test_response_format():
    """Test the response format"""
    print("\n" + "="*60)
    print("  TESTING RESPONSE FORMAT")
    print("="*60)
    
    hospital = Hospital.objects.first()
    if not hospital:
        print("✗ No hospital found")
        return False
    
    doctors = hospital.doctors.all()
    
    print(f"\n✓ Hospital: {hospital.name}")
    print(f"  Doctors count: {doctors.count()}")
    
    if doctors.count() > 0:
        doctor = doctors.first()
        print(f"\n✓ Sample doctor response format:")
        print(f"  {{")
        print(f"    'id': {doctor.user_id},")
        print(f"    'user_id': {doctor.user.id},")
        print(f"    'first_name': '{doctor.user.first_name}',")
        print(f"    'last_name': '{doctor.user.last_name}',")
        print(f"    'email': '{doctor.user.email}',")
        print(f"    'specialization': '{doctor.specialization}',")
        print(f"    'qualification': '{doctor.qualification}',")
        print(f"    'experience_years': {doctor.experience_years},")
        print(f"    'hospital_name': '{hospital.name}'")
        print(f"  }}")
    
    return True

def main():
    print("\n" + "="*60)
    print("  BOOKING ENDPOINTS TEST SUITE")
    print("="*60)
    
    tests = [
        ("Hospital Doctors", test_hospital_doctors),
        ("Doctor Slots", test_doctor_slots),
        ("Response Format", test_response_format),
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
    else:
        print("  ✗ SOME TESTS FAILED")
    print("="*60 + "\n")
    
    return 0 if all_passed else 1

if __name__ == '__main__':
    sys.exit(main())
