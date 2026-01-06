#!/usr/bin/env python
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medilinq_config.settings')
django.setup()

from api.models import User
import requests

# Quick test
try:
    print("Testing hospital admin login...")
    r = requests.post('http://127.0.0.1:8000/api/login/', 
        json={'username': 'hospital@111.com', 'password': 'hospital111'},
        timeout=5)
    print(f"Status: {r.status_code}")
    if r.status_code == 200:
        print("✓ Login works!")
    else:
        print(f"Error: {r.text[:200]}")
except Exception as e:
    print(f"Error: {e}")
    print("Server may not be running. Make sure to start: python manage.py runserver")
