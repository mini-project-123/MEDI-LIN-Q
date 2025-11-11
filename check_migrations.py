#!/usr/bin/env python
"""Check migration history"""

import os
import sys
import django

sys.path.insert(0, r"d:\Projects\Medi Lin Q")
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medilinq_config.settings')
django.setup()

from django.db import connection

with connection.cursor() as cursor:
    cursor.execute("SELECT app, name FROM django_migrations ORDER BY applied")
    migrations = cursor.fetchall()
    
    print("Applied migrations:")
    for app, name in migrations:
        print(f"  {app}: {name}")
