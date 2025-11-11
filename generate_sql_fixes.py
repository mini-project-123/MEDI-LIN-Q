#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medilinq_config.settings')
django.setup()

from django.db import connection
from django.db import models as django_models

def get_table_schema(table_name):
    """Get actual database schema"""
    with connection.cursor() as cursor:
        cursor.execute(f"""
            SELECT column_name, data_type, column_default, is_nullable
            FROM information_schema.columns
            WHERE table_name = %s
            ORDER BY ordinal_position;
        """, [table_name])
        return {row[0]: (row[1], row[2], row[3]) for row in cursor.fetchall()}

def get_django_field_info(field):
    """Get database column info from Django field"""
    # Map Django field types to SQL types
    type_map = {
        'AutoField': 'bigint',
        'CharField': 'character varying',
        'DateField': 'date',
        'DateTimeField': 'timestamp with time zone',
        'TimeField': 'time without time zone',
        'TextField': 'text',
        'IntegerField': 'integer',
        'PositiveIntegerField': 'integer',
        'BooleanField': 'boolean',
        'EmailField': 'character varying',
        'URLField': 'character varying',
        'ImageField': 'character varying',
        'FileField': 'character varying',
        'ForeignKey': 'bigint',
        'OneToOneField': 'bigint',
    }
    
    field_type = field.get_internal_type()
    return type_map.get(field_type, 'character varying')

# Get all models
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

print("\n" + "="*80)
print("GENERATING SQL FIXES")
print("="*80 + "\n")

sql_commands = []

for model, table_name in models_to_check:
    db_columns = get_table_schema(table_name)
    
    for field in model._meta.fields:
        if field.many_to_one or isinstance(field, django_models.OneToOneField):
            # This is a FK or O2O - should be field_name + _id
            col_name = field.attname  # This gives us the actual column name (e.g., 'user_id')
        else:
            col_name = field.name
        
        if col_name not in db_columns:
            sql_type = get_django_field_info(field)
            
            # Handle special cases
            if field.max_length:
                sql_type = f'character varying({field.max_length})'
            
            # Check if it's nullable
            nullable = 'NULL' if field.null else 'NOT NULL'
            
            # Generate default
            default = ''
            if field.has_default():
                if callable(field.default):
                    if field.default == django_models.NOT_PROVIDED:
                        default = ''
                    else:
                        default = ''
                else:
                    default = f"DEFAULT '{field.default}'"
            elif hasattr(field, 'auto_now') and (field.auto_now or field.auto_now_add):
                default = "DEFAULT CURRENT_TIMESTAMP"
            
            cmd = f"ALTER TABLE {table_name} ADD COLUMN {col_name} {sql_type} {nullable} {default};"
            cmd = ' '.join(cmd.split())  # Remove extra spaces
            sql_commands.append(cmd)
            print(f"✓ {table_name}.{col_name}")

print("\n" + "="*80)
print("SQL COMMANDS TO RUN")
print("="*80 + "\n")

for cmd in sql_commands:
    print(cmd)
