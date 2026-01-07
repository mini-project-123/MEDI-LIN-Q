#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medilinq_config.settings')
django.setup()

from api.models import DoctorProfile
from datetime import datetime, timedelta

# Get a doctor
doctor = DoctorProfile.objects.first()

if doctor:
    print(f"Testing slots generation for: {doctor.user.first_name} {doctor.user.last_name}\n")
    
    # Generate available slots for the next 30 days
    available_slots = []
    current_date = datetime.now().date()
    
    for i in range(30):
        appointment_date = current_date + timedelta(days=i)
        
        # Skip weekends (Saturday=5, Sunday=6)
        if appointment_date.weekday() >= 5:
            continue
        
        # Generate time slots (9 AM to 5 PM, 1 hour each)
        for hour in range(9, 17):
            appointment_time = f"{hour:02d}:00:00"
            
            # Check if slot is already booked
            from api.models import Appointment
            existing_appointment = Appointment.objects.filter(
                doctor=doctor,
                appointment_date=appointment_date,
                appointment_time=appointment_time,
                status__in=['pending', 'confirmed']
            ).exists()
            
            if not existing_appointment:
                available_slots.append({
                    'date': appointment_date,
                    'time': appointment_time,
                    'available': True
                })
    
    print(f"Doctor: {doctor.user.first_name} {doctor.user.last_name}")
    print(f"Specialization: {doctor.specialization}")
    print(f"Hospital: {doctor.hospital.name}")
    print(f"Available Slots: {len(available_slots)}")
    print(f"\nFirst 10 slots:")
    for slot in available_slots[:10]:
        print(f"  - {slot['date']} at {slot['time']}")
else:
    print("No doctors found")
