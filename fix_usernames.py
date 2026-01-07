#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medilinq_config.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

print("Fixing usernames to match emails...\n")

updated_count = 0
for user in User.objects.all():
    if user.username != user.email:
        print(f"Updating: {user.username} → {user.email}")
        user.username = user.email
        user.save()
        updated_count += 1

print(f"\n✅ Updated {updated_count} usernames")
print("All usernames now match their email addresses!")
