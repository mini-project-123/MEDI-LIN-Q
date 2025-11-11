#!/usr/bin/env python
"""Check appointment table schema in database"""

import os
import sys
import django

sys.path.insert(0, r"d:\Projects\Medi Lin Q")
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medilinq_config.settings')
django.setup()

from django.db import connection
from django.db.migrations.executor import MigrationExecutor
from django.db import DEFAULT_DB_ALIAS

# Check pending migrations
executor = MigrationExecutor(connection)
plan = executor.migration_plan(executor.loader.graph.leaf_nodes())

print("=" * 60)
print("DATABASE SCHEMA CHECK")
print("=" * 60)

print("\n✓ Pending migrations:", len(plan))

# Get table info
with connection.cursor() as cursor:
    # Get columns from appointment table
    cursor.execute("""
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name='api_appointment' 
        ORDER BY ordinal_position
    """)
    
    columns = cursor.fetchall()
    print(f"\n✓ api_appointment table columns ({len(columns)} total):")
    for col_name, col_type in columns:
        print(f"  - {col_name}: {col_type}")
    
    # Check if specific columns exist
    column_names = [col[0] for col in columns]
    
    print("\n✓ Column existence check:")
    print(f"  appointment_datetime: {'YES' if 'appointment_datetime' in column_names else 'NO'}")
    print(f"  appointment_date: {'YES' if 'appointment_date' in column_names else 'NO'}")
    print(f"  appointment_time: {'YES' if 'appointment_time' in column_names else 'NO'}")

print("\n" + "=" * 60)
