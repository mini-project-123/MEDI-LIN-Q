#!/usr/bin/env python
"""
Fix: Create time slots for all doctors
"""

import os
import django
from datetime import time

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medilinq_config.settings')
django.setup()

from api.models import DoctorProfile, TimeSlot

print("=" * 60)
print("CREATING TIME SLOTS FOR ALL DOCTORS")
print("=" * 60)

doctors = DoctorProfile.objects.all()
print(f"\nFound {doctors.count()} doctors\n")

days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
start_time = time(9, 0)
end_time = time(17, 0)

created_count = 0
for doctor in doctors:
    for day in days:
        slot, created = TimeSlot.objects.get_or_create(
            doctor=doctor,
            day=day,
            start_time=start_time,
            defaults={'end_time': end_time, 'is_available': True}
        )
        if created:
            created_count += 1
            print(f"✓ Created: {doctor.user.first_name} - {day} ({start_time}-{end_time})")

print(f"\n✓ Total time slots created: {created_count}")
print("=" * 60)
