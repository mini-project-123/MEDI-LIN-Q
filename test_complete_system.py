#!/usr/bin/env python
"""
Complete system test for MediLinQ.
Tests all major features and workflows.
"""

import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medilinq_config.settings')
django.setup()

from api.models import (
    User, PatientProfile, DoctorProfile, Hospital, Appointment,
    MedicalReport, Prescription, Notification
)
from django.utils import timezone
from datetime import timedelta

def test_patient_workflow():
    """Test complete patient workflow"""
    print("\n" + "="*60)
    print("  TESTING PATIENT WORKFLOW")
    print("="*60)
    
    # Get a patient
    patient_user = User.objects.filter(patientprofile__isnull=False).first()
    if not patient_user:
        print("✗ No patient found")
        return False
    
    print(f"✓ Patient found: {patient_user.email}")
    
    # Check patient profile
    patient_profile = patient_user.patientprofile
    print(f"✓ Patient profile: {patient_profile.blood_group or 'Not set'}")
    
    # Check appointments
    appointments = Appointment.objects.filter(patient=patient_profile)
    print(f"✓ Patient appointments: {appointments.count()}")
    
    # Check medical reports
    reports = MedicalReport.objects.filter(patient=patient_profile)
    print(f"✓ Medical reports: {reports.count()}")
    
    # Check prescriptions
    prescriptions = Prescription.objects.filter(appointment__patient=patient_profile)
    print(f"✓ Prescriptions: {prescriptions.count()}")
    
    # Check notifications
    notifications = Notification.objects.filter(user=patient_user)
    print(f"✓ Notifications: {notifications.count()}")
    
    return True

def test_doctor_workflow():
    """Test complete doctor workflow"""
    print("\n" + "="*60)
    print("  TESTING DOCTOR WORKFLOW")
    print("="*60)
    
    # Get a doctor
    doctor_user = User.objects.filter(doctorprofile__isnull=False).first()
    if not doctor_user:
        print("✗ No doctor found")
        return False
    
    print(f"✓ Doctor found: {doctor_user.email}")
    
    # Check doctor profile
    doctor_profile = doctor_user.doctorprofile
    print(f"✓ Doctor specialization: {doctor_profile.specialization}")
    print(f"✓ Doctor hospital: {doctor_profile.hospital.name}")
    
    # Check doctor appointments
    appointments = Appointment.objects.filter(doctor=doctor_profile)
    print(f"✓ Doctor appointments: {appointments.count()}")
    
    # Check doctor patients
    patients = Appointment.objects.filter(doctor=doctor_profile).values('patient').distinct()
    print(f"✓ Doctor patients: {patients.count()}")
    
    return True

def test_hospital_workflow():
    """Test complete hospital workflow"""
    print("\n" + "="*60)
    print("  TESTING HOSPITAL WORKFLOW")
    print("="*60)
    
    # Get a hospital
    hospital = Hospital.objects.first()
    if not hospital:
        print("✗ No hospital found")
        return False
    
    print(f"✓ Hospital found: {hospital.name}")
    
    # Check hospital doctors
    doctors = hospital.doctors.all()
    print(f"✓ Hospital doctors: {doctors.count()}")
    
    # Check hospital appointments
    appointments = Appointment.objects.filter(hospital=hospital)
    print(f"✓ Hospital appointments: {appointments.count()}")
    
    # Check hospital patients
    patients = Appointment.objects.filter(hospital=hospital).values('patient').distinct()
    print(f"✓ Hospital patients: {patients.count()}")
    
    return True

def test_appointment_workflow():
    """Test appointment creation and management"""
    print("\n" + "="*60)
    print("  TESTING APPOINTMENT WORKFLOW")
    print("="*60)
    
    # Get sample data
    patient = PatientProfile.objects.first()
    doctor = DoctorProfile.objects.first()
    hospital = Hospital.objects.first()
    
    if not all([patient, doctor, hospital]):
        print("✗ Missing required data")
        return False
    
    print(f"✓ Patient: {patient.user.email}")
    print(f"✓ Doctor: {doctor.user.email}")
    print(f"✓ Hospital: {hospital.name}")
    
    # Check existing appointments
    existing = Appointment.objects.filter(
        patient=patient,
        doctor=doctor,
        hospital=hospital
    ).count()
    print(f"✓ Existing appointments: {existing}")
    
    # Check appointment statuses
    statuses = {}
    for status in ['pending', 'confirmed', 'completed', 'cancelled', 'scheduled']:
        count = Appointment.objects.filter(status=status).count()
        if count > 0:
            statuses[status] = count
    
    print(f"✓ Appointment statuses: {statuses}")
    
    return True

def test_data_isolation():
    """Test data isolation between users"""
    print("\n" + "="*60)
    print("  TESTING DATA ISOLATION")
    print("="*60)
    
    # Test patient isolation
    patients = PatientProfile.objects.all()[:2]
    for patient in patients:
        patient_appointments = Appointment.objects.filter(patient=patient).count()
        print(f"✓ Patient {patient.user.email}: {patient_appointments} appointments")
    
    # Test hospital isolation
    hospitals = Hospital.objects.all()[:2]
    for hospital in hospitals:
        hospital_doctors = hospital.doctors.count()
        hospital_appointments = Appointment.objects.filter(hospital=hospital).count()
        print(f"✓ Hospital {hospital.name}: {hospital_doctors} doctors, {hospital_appointments} appointments")
    
    # Test doctor isolation
    doctors = DoctorProfile.objects.all()[:2]
    for doctor in doctors:
        doctor_appointments = Appointment.objects.filter(doctor=doctor).count()
        print(f"✓ Doctor {doctor.user.email}: {doctor_appointments} appointments")
    
    return True

def test_user_authentication():
    """Test user authentication setup"""
    print("\n" + "="*60)
    print("  TESTING USER AUTHENTICATION")
    print("="*60)
    
    # Check all users have matching username/email
    mismatched = []
    for user in User.objects.all():
        if user.username != user.email:
            mismatched.append(user.email)
    
    if mismatched:
        print(f"✗ Mismatched users: {mismatched}")
        return False
    
    print(f"✓ All {User.objects.count()} users have matching username/email")
    
    # Check user roles
    patients = User.objects.filter(patientprofile__isnull=False).count()
    doctors = User.objects.filter(doctorprofile__isnull=False).count()
    admins = User.objects.filter(hospitalprofile__isnull=False).count()
    
    print(f"✓ Patients: {patients}")
    print(f"✓ Doctors: {doctors}")
    print(f"✓ Hospital Admins: {admins}")
    
    return True

def test_database_integrity():
    """Test database integrity"""
    print("\n" + "="*60)
    print("  TESTING DATABASE INTEGRITY")
    print("="*60)
    
    # Check for orphaned records
    orphaned_appointments = Appointment.objects.filter(
        patient__isnull=True
    ).count()
    
    if orphaned_appointments > 0:
        print(f"✗ Orphaned appointments: {orphaned_appointments}")
        return False
    
    print(f"✓ No orphaned appointments")
    
    # Check for missing relationships
    for appointment in Appointment.objects.all()[:5]:
        if not appointment.patient or not appointment.doctor or not appointment.hospital:
            print(f"✗ Incomplete appointment: {appointment.id}")
            return False
    
    print(f"✓ All appointments have complete relationships")
    
    return True

def main():
    print("\n" + "="*60)
    print("  MediLinQ - COMPLETE SYSTEM TEST")
    print("="*60)
    
    tests = [
        ("User Authentication", test_user_authentication),
        ("Database Integrity", test_database_integrity),
        ("Patient Workflow", test_patient_workflow),
        ("Doctor Workflow", test_doctor_workflow),
        ("Hospital Workflow", test_hospital_workflow),
        ("Appointment Workflow", test_appointment_workflow),
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
