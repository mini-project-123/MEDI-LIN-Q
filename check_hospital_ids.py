import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medilinq_config.settings')
django.setup()

from api.models import Hospital, User

print("="*70)
print("AVAILABLE HOSPITALS & ADMIN USERS")
print("="*70)

hospitals = Hospital.objects.all()
print(f"\nTotal Hospitals: {hospitals.count()}\n")

for hospital in hospitals:
    print(f"Hospital Name: {hospital.name}")
    print(f"  License #: {hospital.license_no}")
    print(f"  Custom ID: {hospital.custom_id}")
    
    # Find admin for this hospital
    admins = hospital.admins.all()
    for admin in admins:
        print(f"  Admin User ID: {admin.id}")
        print(f"  Admin Username: {admin.username}")
        print(f"  Admin Email: {admin.email}")
    
    print()

print("="*70)
print("QUICK REFERENCE FOR DOCTOR SIGNUP")
print("="*70)
print("\nWhen signing up as a doctor:")
print("1. Select 'Doctor' as role")
print("2. Enter your hospital's NUMERIC USER ID (from Admin User ID above)")
print("3. Use the correct hospital ID to link your profile")
print("\nExample:")
hospital_admins = User.objects.filter(role='hospital_admin')
if hospital_admins.exists():
    admin = hospital_admins.first()
    hospital = admin.managed_hospitals.first()
    if hospital:
        print(f"  Hospital: {hospital.name}")
        print(f"  Admin ID to use: {admin.id}")
        print(f"  Hospital Object ID: {hospital.id}")
print("="*70)
