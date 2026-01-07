#!/usr/bin/env python
"""
Comprehensive test script for the appointment booking flow.
Tests: hospital list, doctors list with slots, booking, and appointment visibility.
"""

import os
import django
import json
from datetime import date, timedelta, time

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medilinq_config.settings')
django.setup()

from django.contrib.auth import get_user_model
from api.models import Hospital, DoctorProfile, Appointment, TimeSlot, PatientProfile
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token

User = get_user_model()
client = APIClient()

def log(message, level="INFO"):
    """Pretty logging"""
    prefix = f"[{level}]"
    print(f"{prefix} {message}")

def test_flow():
    log("Starting appointment booking flow test...", "START")
    
    # === STEP 1: Create/Get test users ===
    log("\n--- STEP 1: Setup Test Users ---")
    
    # Patient user
    patient_user, _ = User.objects.get_or_create(
        username='testpatient123',
        defaults={
            'email': 'testpatient@test.com',
            'first_name': 'John',
            'last_name': 'Patient',
            'role': 'patient',
        }
    )
    patient_user.set_password('testpass123')
    patient_user.save()
    log(f"Patient user: {patient_user.username} (ID: {patient_user.id})")
    
    # Get or create patient profile
    patient_profile, _ = PatientProfile.objects.get_or_create(
        user=patient_user,
        defaults={'blood_group': 'O+'}
    )
    log(f"Patient profile created: {patient_profile}")
    
    # === STEP 2: Get token for patient ===
    log("\n--- STEP 2: Get Authentication Token ---")
    # Use the login endpoint to get token
    login_response = client.post('/api/auth/login/', {
        'username': 'testpatient123',
        'password': 'testpass123'
    })
    
    if login_response.status_code == 200:
        token = login_response.json().get('access')
        client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)
        log(f"Authentication token: {token[:20]}...")
    else:
        log(f"Login failed: {login_response.json()}", "ERROR")
        return
    
    # === STEP 3: Fetch hospitals ===
    log("\n--- STEP 3: Fetch Hospitals ---")
    response = client.get('/api/booking/hospitals/')
    log(f"Response status: {response.status_code}")
    
    if response.status_code == 200:
        hospitals = response.json()
        log(f"Found {len(hospitals)} hospitals")
        if hospitals:
            hospital_id = hospitals[0]['id']
            hospital_name = hospitals[0]['name']
            doctors_count = hospitals[0].get('doctors_count', 0)
            log(f"  - Hospital: {hospital_name} (ID: {hospital_id}, Doctors: {doctors_count})")
        else:
            log("No hospitals found. Creating test hospital...", "WARN")
            # Create a hospital for testing
            hospital_user, _ = User.objects.get_or_create(
                username='testhospital123',
                defaults={
                    'email': 'hospital@test.com',
                    'role': 'hospital_admin',
                }
            )
            hospital_user.set_password('testpass123')
            hospital_user.save()
            
            hospital, _ = Hospital.objects.get_or_create(
                user=hospital_user,
                defaults={
                    'name': 'Test Hospital',
                    'address': '123 Medical Street',
                    'email': 'hospital@test.com',
                }
            )
            hospital_id = hospital.id
            hospital_name = hospital.name
            log(f"Created hospital: {hospital_name}")
    else:
        log(f"Error fetching hospitals: {response.json()}", "ERROR")
        return
    
    # === STEP 4: Get doctors for hospital ===
    log(f"\n--- STEP 4: Fetch Doctors for Hospital {hospital_id} ---")
    response = client.get(f'/api/booking/hospitals/{hospital_id}/doctors/')
    log(f"Response status: {response.status_code}")
    
    if response.status_code == 200:
        doctors = response.json()
        log(f"Found {len(doctors)} doctors")
        
        if doctors:
            doctor = doctors[0]
            doctor_id = doctor.get('doctor_id', doctor.get('id'))
            doctor_name = f"{doctor['first_name']} {doctor['last_name']}"
            time_slots = doctor.get('time_slots', [])
            log(f"  - Doctor: Dr. {doctor_name} (ID: {doctor_id})")
            log(f"    Specialization: {doctor['specialization']}")
            log(f"    Available time slots: {len(time_slots)}")
            if time_slots:
                for slot in time_slots[:3]:
                    log(f"      - {slot['day']}: {slot['start_time']} to {slot['end_time']}")
        else:
            log("No doctors found. Creating test doctor...", "WARN")
            # Create a doctor for testing
            doctor_user, _ = User.objects.get_or_create(
                username='testdoctor123',
                defaults={
                    'email': 'doctor@test.com',
                    'first_name': 'Jane',
                    'last_name': 'Doctor',
                    'role': 'doctor',
                }
            )
            doctor_user.set_password('testpass123')
            doctor_user.save()
            
            hospital = Hospital.objects.get(id=hospital_id)
            doctor_profile, _ = DoctorProfile.objects.get_or_create(
                user=doctor_user,
                defaults={
                    'hospital': hospital,
                    'specialization': 'General Practice',
                    'qualification': 'MBBS',
                    'experience_years': 5,
                }
            )
            
            # Create time slots
            days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
            for day in days:
                TimeSlot.objects.get_or_create(
                    doctor=doctor_profile,
                    day=day,
                    start_time=time(9, 0),
                    defaults={'end_time': time(17, 0), 'is_available': True}
                )
            
            doctor_id = doctor_user.id
            log(f"Created doctor: Dr. {doctor_user.first_name} {doctor_user.last_name}")
            log(f"Created time slots for {len(days)} days")
    else:
        log(f"Error fetching doctors: {response.json()}", "ERROR")
        return
    
    # === STEP 5: Book an appointment ===
    log(f"\n--- STEP 5: Book Appointment ---")
    tomorrow = date.today() + timedelta(days=1)
    appointment_data = {
        'hospital_id': hospital_id,
        'doctor_id': doctor_id,
        'appointment_date': str(tomorrow),
        'appointment_time': '10:00:00',
        'appointment_type': 'consultation',
        'reason': 'Regular checkup'
    }
    log(f"Booking appointment with data:")
    for key, value in appointment_data.items():
        log(f"  - {key}: {value}")
    
    response = client.post('/api/booking/appointments/book/', appointment_data, format='json')
    log(f"Response status: {response.status_code}")
    
    if response.status_code == 201:
        appointment = response.json()
        appointment_id = appointment.get('id')
        custom_id = appointment.get('custom_id')
        status = appointment.get('status')
        log(f"✓ Appointment booked successfully!")
        log(f"  - ID: {appointment_id}")
        log(f"  - Custom ID: {custom_id}")
        log(f"  - Status: {status}")
    elif response.status_code == 400:
        log(f"Bad request: {response.json()}", "WARN")
        return
    else:
        log(f"Error booking appointment: {response.json()}", "ERROR")
        return
    
    # === STEP 6: Fetch patient appointments ===
    log(f"\n--- STEP 6: Fetch Patient Appointments ---")
    response = client.get('/api/patients/appointments/')
    log(f"Response status: {response.status_code}")
    
    if response.status_code == 200:
        appointments = response.json()
        log(f"Found {len(appointments)} appointment(s)")
        
        for apt in appointments:
            log(f"  - Appointment ID: {apt.get('id')}")
            log(f"    Custom ID: {apt.get('custom_id')}")
            log(f"    Status: {apt.get('status')}")
            log(f"    Date: {apt.get('appointment_date')}")
            log(f"    Time: {apt.get('appointment_time')}")
            log(f"    Doctor: Dr. {apt.get('doctor', {}).get('user', {}).get('first_name')} {apt.get('doctor', {}).get('user', {}).get('last_name')}")
    else:
        log(f"Error fetching appointments: {response.json()}", "ERROR")
    
    # === STEP 7: Fetch patient dashboard ===
    log(f"\n--- STEP 7: Fetch Patient Dashboard ---")
    response = client.get('/api/patients/dashboard/')
    log(f"Response status: {response.status_code}")
    
    if response.status_code == 200:
        dashboard = response.json()
        upcoming = dashboard.get('upcoming_appointments', [])
        recent = dashboard.get('recent_appointments', [])
        
        log(f"Dashboard Summary:")
        log(f"  - Upcoming appointments: {len(upcoming)}")
        if upcoming:
            for apt in upcoming:
                log(f"    - {apt.get('custom_id')}: {apt.get('appointment_date')} @ {apt.get('appointment_time')}")
        
        log(f"  - Recent appointments: {len(recent)}")
        
        stats = dashboard.get('stats', {})
        log(f"  - Stats:")
        log(f"    - Total: {stats.get('total_appointments')}")
        log(f"    - Upcoming: {stats.get('upcoming_appointments')}")
    else:
        log(f"Error fetching dashboard: {response.json()}", "ERROR")
    
    log("\n✓ Test completed successfully!", "SUCCESS")

if __name__ == '__main__':
    try:
        test_flow()
    except Exception as e:
        log(f"Test failed with error: {str(e)}", "ERROR")
        import traceback
        traceback.print_exc()
