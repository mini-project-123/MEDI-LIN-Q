#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medilinq_config.settings')
django.setup()

from django.db import connection
from django.apps import apps

def get_table_schema(table_name):
    """Get actual database schema"""
    with connection.cursor() as cursor:
        cursor.execute(f"""
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_name = %s
            ORDER BY ordinal_position;
        """, [table_name])
        return {row[0] for row in cursor.fetchall()}

def get_model_fields(model):
    """Get Django model fields"""
    return {field.name for field in model._meta.fields}

# Get all models from the api app
print("\n" + "="*80)
print("SCHEMA VALIDATION REPORT")
print("="*80 + "\n")

from api.models import (
    User, PatientProfile, DoctorProfile, Hospital, 
    StaffProfile, Appointment, Prescription, 
    MedicalReport, Notification, Article, Medication, Bed, Ward
)

models_to_check = [
    (User, 'api_user'),
    (PatientProfile, 'api_patientprofile'),
    (DoctorProfile, 'api_doctorprofile'),
    (Hospital, 'api_hospital'),
    (StaffProfile, 'api_staffprofile'),
    (Appointment, 'api_appointment'),
    (Prescription, 'api_prescription'),
    (MedicalReport, 'api_medicalreport'),
    (Notification, 'api_notification'),
    (Article, 'api_article'),
    (Medication, 'api_medication'),
    (Bed, 'api_bed'),
    (Ward, 'api_ward'),
]

issues_found = []

for model, table_name in models_to_check:
    db_columns = get_table_schema(table_name)
    model_fields = get_model_fields(model)
    
    # Check for missing columns
    missing_in_db = model_fields - db_columns
    extra_in_db = db_columns - model_fields
    
    if missing_in_db or extra_in_db:
        print(f"❌ {model.__name__} ({table_name})")
        if missing_in_db:
            print(f"   Missing in DB: {missing_in_db}")
            issues_found.append((table_name, missing_in_db, 'missing'))
        if extra_in_db:
            print(f"   Extra in DB: {extra_in_db}")
    else:
        print(f"✅ {model.__name__} ({table_name})")

print("\n" + "="*80)
print("SUMMARY")
print("="*80)

if issues_found:
    print(f"\n⚠️  Found {len(issues_found)} tables with schema mismatches:\n")
    for table_name, fields, issue_type in issues_found:
        if issue_type == 'missing':
            for field in fields:
                print(f"   ALTER TABLE {table_name} ADD COLUMN {field} VARCHAR(255);")
else:
    print("\n✅ All tables match Django models!")
