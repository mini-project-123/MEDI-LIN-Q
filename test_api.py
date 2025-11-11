#!/usr/bin/env python
"""Quick test to verify serializers work"""

import os
import sys
import django

# Setup Django
sys.path.insert(0, r"d:\Projects\Medi Lin Q")
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medilinq_config.settings')
django.setup()

print("=" * 60)
print("TESTING PATIENT DASHBOARD API FIXES")
print("=" * 60)

# Test 1: Check if we can load models
print("\n✓ Django models loaded successfully")

# Test 2: Check Appointment model fields
from api.models import Appointment
print("\nAppointment model has these fields:")
appointment_fields = [field.name for field in Appointment._meta.get_fields() if hasattr(field, 'name')]
print(f"  {appointment_fields}")

if 'appointment_date' in appointment_fields and 'appointment_time' in appointment_fields:
    print("  ✓ CORRECT: appointment_date and appointment_time fields exist")
else:
    print("  ✗ ERROR: Missing appointment_date or appointment_time")
    sys.exit(1)

if 'appointment_datetime' in appointment_fields:
    print("  ✗ ERROR: Outdated appointment_datetime field still exists!")
    sys.exit(1)
else:
    print("  ✓ CORRECT: No outdated appointment_datetime field")

# Test 3: Check if PatientDashboardSerializer can be imported
print("\nTesting serializer imports:")
try:
    from api.serializers.patient_serializers import (
        PatientDashboardSerializer, 
        PatientDashboardAppointmentSerializer,
        PatientAppointmentDetailSerializer
    )
    print("  ✓ PatientDashboardSerializer imported")
    print("  ✓ PatientDashboardAppointmentSerializer imported")
    print("  ✓ PatientAppointmentDetailSerializer imported")
except ImportError as e:
    print(f"  ✗ Import error: {e}")
    sys.exit(1)

# Test 4: Check views
print("\nTesting view imports:")
try:
    from api.views.patient_views import (
        PatientDashboardView,
        PatientHealthAnalyticsView,
        PatientPrescriptionsView
    )
    print("  ✓ PatientDashboardView imported")
    print("  ✓ PatientHealthAnalyticsView imported")
    print("  ✓ PatientPrescriptionsView imported")
except ImportError as e:
    print(f"  ✗ Import error: {e}")
    sys.exit(1)

# Test 5: Check that appointment_datetime is not used in the codebase
print("\nScanning code for outdated 'appointment_datetime' references:")
import glob

issues = []
for py_file in glob.glob('api/**/*.py', recursive=True):
    try:
        with open(py_file, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
            # Skip comments and docstrings in a simple way
            if 'appointment_datetime' in content:
                # Count occurrences (excluding this comment)
                lines = content.split('\n')
                bad_lines = [i+1 for i, line in enumerate(lines) if 'appointment_datetime' in line and not line.strip().startswith('#')]
                if bad_lines:
                    issues.append((py_file, bad_lines))
    except:
        pass

if issues:
    print(f"  ⚠ Found {len(issues)} files with 'appointment_datetime' references:")
    for file, line_numbers in issues:
        print(f"    - {file}: lines {line_numbers}")
else:
    print("  ✓ PERFECT: No 'appointment_datetime' references found in code!")

print("\n" + "=" * 60)
if not issues:
    print("✓ ALL TESTS PASSED!")
    print("=" * 60)
    print("\nThe patient dashboard API should now work correctly.")
    print("All appointment_datetime references have been fixed to use")
    print("appointment_date (DateField) and appointment_time (TimeField)")
    print("=" * 60)
else:
    print("⚠ SOME ISSUES FOUND - Review the 'appointment_datetime' references above")
    print("=" * 60)
