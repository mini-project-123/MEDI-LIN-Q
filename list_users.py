#!/usr/bin/env python
"""List users in database"""
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medilinq_config.settings')
django.setup()

from api.models import User

print("Users in database:")
for user in User.objects.all()[:10]:
    print(f"  {user.id}. {user.email} (type: {user.user_type})")

print(f"\nTotal users: {User.objects.count()}")
