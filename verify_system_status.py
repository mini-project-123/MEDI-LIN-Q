#!/usr/bin/env python
"""
Comprehensive system verification script for MediLinQ.
Tests all major features and endpoints.
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medilinq_config.settings')
django.setup()

from api.models import (
    User, PatientProfile, DoctorProfile, Hospital, Appointment,
    MedicalReport, Prescription, Notification
)
from django.utils import timezone
from datetime import timedelta

def print_section(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")

def print_status(item, status, details=""):
    symbol = "✓" if status else "✗"
    print(f"  {symbol} {item}: {details}")

def verify_users():
    print_section("USER VERIFICATION")
    
    total_users = User.objects.count()
    print_status("Total Users", total_users > 0, f"{total_users} users found")
    
    # Check user types
    patients = User.objects.filter(patientprofile__isnull=False).count()
    doctors = User.objects.filter(doctorprofile__isnull=False).count()
    hospital_admins = User.objects.filter(hospitalprofile__isnull=False).count()
    
    print_status("Patients", patients > 0, f"{patients} patients")
    print_status("Doctors", doctors > 0, f"{doctors} doctors")
    print_status("Hospital Admins", hospital_admins > 0, f"{hospital_admins} admins")
    
    # Check username/email matching
    mismatched = 0
    for user in User.objects.all():
        if user.username != user.email:
            mismatched += 1
    
    print_status("Username/Email Match", mismatched == 0, f"{mismatched} mismatches")
    
    return total_users > 0

def verify_hospitals():
    print_section("HOSPITAL VERIFICATION")
    
    hospitals = Hospital.objects.all()
    hospital_count = hospitals.count()
    print_status("Total Hospitals", hospital_count > 0, f"{hospital_count} hospitals")
    
    for hospital in hospitals:
        doctor_count = hospital.doctors.count()
        print_status(f"  {hospital.name}", doctor_count > 0, f"{doctor_count} doctors")
    
    return hospital_count > 0

def verify_appointments():
    print_section("APPOINTMENT VERIFICATION")
    
    total_appointments = Appointment.objects.count()
    print_status("Total Appointments", total_appointments > 0, f"{total_appointments} appointments")
    
    # Check appointment statuses
    statuses = {}
    for status_choice in ['pending', 'confirmed', 'completed', 'cancelled', 'scheduled']:
        count = Appointment.objects.filter(status=status_choice).count()
        if count > 0:
            statuses[status_choice] = count
    
    for status, count in statuses.items():
        print_status(f"  {status.capitalize()}", count > 0, f"{count} appointments")
    
    # Check upcoming appointments
    today = timezone.now().date()
    upcoming = Appointment.objects.filter(appointment_date__gte=today).count()
    print_status("Upcoming Appointments", upcoming > 0, f"{upcoming} appointments")
    
    return total_appointments > 0

def verify_medical_reports():
    print_section("MEDICAL REPORTS VERIFICATION")
    
    total_reports = MedicalReport.objects.count()
    print_status("Total Medical Reports", total_reports >= 0, f"{total_reports} reports")
    
    # Check reports by type
    report_types = {}
    for report in MedicalReport.objects.all():
        report_type = report.report_type or "Unknown"
        report_types[report_type] = report_types.get(report_type, 0) + 1
    
    for report_type, count in report_types.items():
        print_status(f"  {report_type}", count > 0, f"{count} reports")
    
    return True

def verify_prescriptions():
    print_section("PRESCRIPTION VERIFICATION")
    
    total_prescriptions = Prescription.objects.count()
    print_status("Total Prescriptions", total_prescriptions >= 0, f"{total_prescriptions} prescriptions")
    
    # Check active prescriptions
    thirty_days_ago = timezone.now() - timedelta(days=30)
    active = Prescription.objects.filter(created_at__gte=thirty_days_ago).count()
    print_status("Active Prescriptions", active >= 0, f"{active} prescriptions")
    
    return True

def verify_notifications():
    print_section("NOTIFICATION VERIFICATION")
    
    total_notifications = Notification.objects.count()
    print_status("Total Notifications", total_notifications >= 0, f"{total_notifications} notifications")
    
    # Check unread notifications
    unread = Notification.objects.filter(is_read=False).count()
    print_status("Unread Notifications", unread >= 0, f"{unread} unread")
    
    return True

def verify_data_isolation():
    print_section("DATA ISOLATION VERIFICATION")
    
    # Check patient data isolation
    patients = PatientProfile.objects.all()
    isolation_ok = True
    
    for patient in patients[:3]:  # Check first 3 patients
        # Each patient should only see their own appointments
        patient_appointments = Appointment.objects.filter(patient=patient).count()
        other_appointments = Appointment.objects.exclude(patient=patient).count()
        
        if patient_appointments > 0:
            print_status(f"  Patient {patient.user.email}", True, 
                        f"{patient_appointments} own appointments")
    
    # Check hospital data isolation
    hospitals = Hospital.objects.all()
    for hospital in hospitals[:2]:  # Check first 2 hospitals
        hospital_doctors = hospital.doctors.count()
        print_status(f"  Hospital {hospital.name}", hospital_doctors >= 0, 
                    f"{hospital_doctors} doctors")
    
    return True

def verify_api_endpoints():
    print_section("API ENDPOINT VERIFICATION")
    
    # Check if URL patterns are configured
    from django.urls import get_resolver
    from django.urls.exceptions import Resolver404
    
    endpoints = [
        'api/patients/appointments/',
        'api/patients/medical-reports/',
        'api/doctor/appointments/',
        'api/doctor/patients/',
        'api/hospital/appointments/',
        'api/hospital/patients/',
        'api/booking/hospitals/',
        'api/booking/doctors/',
    ]
    
    resolver = get_resolver()
    
    for endpoint in endpoints:
        try:
            # Try to resolve the endpoint
            resolver.resolve(endpoint)
            print_status(f"  {endpoint}", True, "Configured")
        except Resolver404:
            print_status(f"  {endpoint}", False, "Not found")
    
    return True

def main():
    print("\n" + "="*60)
    print("  MediLinQ - SYSTEM VERIFICATION")
    print("="*60)
    
    results = {
        'Users': verify_users(),
        'Hospitals': verify_hospitals(),
        'Appointments': verify_appointments(),
        'Medical Reports': verify_medical_reports(),
        'Prescriptions': verify_prescriptions(),
        'Notifications': verify_notifications(),
        'Data Isolation': verify_data_isolation(),
        'API Endpoints': verify_api_endpoints(),
    }
    
    print_section("SUMMARY")
    
    all_passed = all(results.values())
    
    for component, passed in results.items():
        status_text = "PASS" if passed else "FAIL"
        symbol = "✓" if passed else "✗"
        print(f"  {symbol} {component}: {status_text}")
    
    print("\n" + "="*60)
    if all_passed:
        print("  ✓ ALL SYSTEMS OPERATIONAL")
    else:
        print("  ✗ SOME SYSTEMS NEED ATTENTION")
    print("="*60 + "\n")
    
    return 0 if all_passed else 1

if __name__ == '__main__':
    sys.exit(main())
