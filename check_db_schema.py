#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medilinq_config.settings')
django.setup()

from django.db import connection

def get_table_schema(table_name):
    with connection.cursor() as cursor:
        cursor.execute(f"""
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = %s
            ORDER BY ordinal_position;
        """, [table_name])
        
        columns = cursor.fetchall()
        
        print(f"\n{'='*80}")
        print(f"Table: {table_name}")
        print(f"{'='*80}")
        print(f"{'Column':<30} {'Type':<20} {'Nullable':<10} {'Default':<20}")
        print(f"{'-'*80}")
        
        for col_name, data_type, is_nullable, default in columns:
            nullable = "YES" if is_nullable else "NO"
            default_val = default if default else ""
            print(f"{col_name:<30} {data_type:<20} {nullable:<10} {default_val:<20}")

# Check the appointment table
get_table_schema('api_appointment')

# Also show models to compare
print(f"\n{'='*80}")
print("Django Model Fields:")
print(f"{'='*80}")

from api.models import Appointment
for field in Appointment._meta.fields:
    print(f"{field.name:<30} {field.get_internal_type():<20}")
