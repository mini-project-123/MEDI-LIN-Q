import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medilinq_config.settings')
django.setup()

from api.models import User

# Create superuser with credentials
try:
    if not User.objects.filter(username='admin').exists():
        admin = User.objects.create_superuser(
            username='admin',
            email='admin@medilinq.com',
            password='Admin@12345',
            first_name='Admin',
            last_name='User',
            role='admin'
        )
        print(f"✓ Superuser created successfully!")
        print(f"  Username: admin")
        print(f"  Email: admin@medilinq.com")
        print(f"  Password: Admin@12345")
    else:
        print("✓ Superuser 'admin' already exists")
        admin = User.objects.get(username='admin')
        print(f"  Username: {admin.username}")
        print(f"  Email: {admin.email}")
except Exception as e:
    print(f"✗ Error creating superuser: {e}")
