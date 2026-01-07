#!/usr/bin/env python
import os
import django
from django.contrib.auth import get_user_model
from datetime import datetime, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medilinq_config.settings')
django.setup()

from api.models import (
    Hospital, DoctorProfile, PatientProfile, Appointment, 
    Prescription, Article, Notification
)

User = get_user_model()

print("Creating comprehensive demo data...\n")

# Create Hospitals
print("Creating hospitals...")
hospitals = {
    'city': Hospital.objects.create(
        user=User.objects.create_user(
            username='hospital_city',
            email='admin@cityhospital.com',
            password='CityHosp@123',
            first_name='Admin',
            last_name='City',
            role='hospital_admin'
        ),
        name='City Hospital',
        address='123 Main Street, Downtown',
        contact_no1='555-0001',
        email='admin@cityhospital.com'
    ),
    'apollo': Hospital.objects.create(
        user=User.objects.create_user(
            username='hospital_apollo',
            email='admin@apollomedical.com',
            password='Apollo@123',
            first_name='Admin',
            last_name='Apollo',
            role='hospital_admin'
        ),
        name='Apollo Medical Center',
        address='456 Medical Plaza, Uptown',
        contact_no1='555-0002',
        email='admin@apollomedical.com'
    ),
    'stmarys': Hospital.objects.create(
        user=User.objects.create_user(
            username='hospital_stmarys',
            email='admin@stmarys.com',
            password='StMary@123',
            first_name='Admin',
            last_name='StMarys',
            role='hospital_admin'
        ),
        name="St. Mary's Hospital",
        address='789 Healthcare Ave, Midtown',
        contact_no1='555-0003',
        email='admin@stmarys.com'
    )
}

# Associate admins with hospitals
for key, hospital in hospitals.items():
    hospital.admins.add(hospital.user)

# Create Doctors
print("Creating doctors...")
doctors_data = [
    {
        'hospital': 'city',
        'username': 'james_wilson',
        'email': 'james.wilson@cityhospital.com',
        'password': 'DrWilson@123',
        'first_name': 'James',
        'last_name': 'Wilson',
        'specialization': 'Cardiology',
        'experience': 10
    },
    {
        'hospital': 'city',
        'username': 'sarah_mitchell',
        'email': 'sarah.mitchell@cityhospital.com',
        'password': 'DrMitchell@123',
        'first_name': 'Sarah',
        'last_name': 'Mitchell',
        'specialization': 'Orthopedics',
        'experience': 8
    },
    {
        'hospital': 'city',
        'username': 'michael_johnson',
        'email': 'michael.johnson@cityhospital.com',
        'password': 'DrJohnson@123',
        'first_name': 'Michael',
        'last_name': 'Johnson',
        'specialization': 'Neurology',
        'experience': 12
    },
    {
        'hospital': 'apollo',
        'username': 'emily_chen',
        'email': 'emily.chen@apollomedical.com',
        'password': 'DrChen@123',
        'first_name': 'Emily',
        'last_name': 'Chen',
        'specialization': 'Pediatrics',
        'experience': 7
    },
    {
        'hospital': 'apollo',
        'username': 'david_kumar',
        'email': 'david.kumar@apollomedical.com',
        'password': 'DrKumar@123',
        'first_name': 'David',
        'last_name': 'Kumar',
        'specialization': 'Internal Medicine',
        'experience': 9
    },
    {
        'hospital': 'stmarys',
        'username': 'lisa_anderson',
        'email': 'lisa.anderson@stmarys.com',
        'password': 'DrAnderson@123',
        'first_name': 'Lisa',
        'last_name': 'Anderson',
        'specialization': 'Oncology',
        'experience': 15
    },
    {
        'hospital': 'stmarys',
        'username': 'robert_thompson',
        'email': 'robert.thompson@stmarys.com',
        'password': 'DrThompson@123',
        'first_name': 'Robert',
        'last_name': 'Thompson',
        'specialization': 'Gastroenterology',
        'experience': 11
    }
]

doctors = {}
for doc_data in doctors_data:
    hospital_key = doc_data.pop('hospital')
    password = doc_data.pop('password')
    specialization = doc_data.pop('specialization')
    experience = doc_data.pop('experience')
    
    user = User.objects.create_user(
        password=password,
        role='doctor',
        **doc_data
    )
    
    doctor_profile = DoctorProfile.objects.create(
        user=user,
        hospital=hospitals[hospital_key],
        specialization=specialization,
        experience_years=experience
    )
    doctors[user.email] = doctor_profile

# Create Patients
print("Creating patients...")
patients_data = [
    {
        'hospital': 'city',
        'username': 'john_smith',
        'email': 'john.smith@email.com',
        'password': 'Patient@Smith1',
        'first_name': 'John',
        'last_name': 'Smith',
        'blood_group': 'O+'
    },
    {
        'hospital': 'city',
        'username': 'mary_johnson',
        'email': 'mary.johnson@email.com',
        'password': 'Patient@Mary2',
        'first_name': 'Mary',
        'last_name': 'Johnson',
        'blood_group': 'A+'
    },
    {
        'hospital': 'city',
        'username': 'robert_brown',
        'email': 'robert.brown@email.com',
        'password': 'Patient@Brown3',
        'first_name': 'Robert',
        'last_name': 'Brown',
        'blood_group': 'B+'
    },
    {
        'hospital': 'apollo',
        'username': 'patricia_davis',
        'email': 'patricia.davis@email.com',
        'password': 'Patient@Patricia4',
        'first_name': 'Patricia',
        'last_name': 'Davis',
        'blood_group': 'O-'
    },
    {
        'hospital': 'apollo',
        'username': 'michael_wilson',
        'email': 'michael.wilson@email.com',
        'password': 'Patient@Mike5',
        'first_name': 'Michael',
        'last_name': 'Wilson',
        'blood_group': 'AB+'
    },
    {
        'hospital': 'stmarys',
        'username': 'jennifer_garcia',
        'email': 'jennifer.garcia@email.com',
        'password': 'Patient@Jenny6',
        'first_name': 'Jennifer',
        'last_name': 'Garcia',
        'blood_group': 'O+'
    },
    {
        'hospital': 'stmarys',
        'username': 'william_martinez',
        'email': 'william.martinez@email.com',
        'password': 'Patient@Will7',
        'first_name': 'William',
        'last_name': 'Martinez',
        'blood_group': 'A+'
    }
]

patients = {}
for pat_data in patients_data:
    hospital_key = pat_data.pop('hospital')
    password = pat_data.pop('password')
    blood_group = pat_data.pop('blood_group')
    
    user = User.objects.create_user(
        password=password,
        role='patient',
        **pat_data
    )
    
    patient_profile = PatientProfile.objects.create(
        user=user,
        blood_group=blood_group,
        emergency_contact_no='555-9999'
    )
    patients[user.email] = patient_profile

# Create Appointments
print("Creating appointments...")
appointment_types = ['consultation', 'follow_up', 'procedure']
statuses = ['pending', 'confirmed', 'completed', 'cancelled']

doctor_list = list(doctors.values())
patient_list = list(patients.values())

for i, patient in enumerate(patient_list):
    for j in range(3):
        doctor = doctor_list[(i + j) % len(doctor_list)]
        appointment_date = datetime.now() + timedelta(days=j*7)
        
        appointment = Appointment.objects.create(
            patient=patient,
            doctor=doctor,
            hospital=doctor.hospital,
            appointment_date=appointment_date.date(),
            appointment_time='10:00:00',
            appointment_type=appointment_types[j % len(appointment_types)],
            status=statuses[j % len(statuses)]
        )

# Create Articles
print("Creating articles...")
articles_data = [
    {
        'title': 'Heart Health: Prevention and Care',
        'content': 'Learn about maintaining a healthy heart and preventing cardiovascular diseases.',
        'author_email': 'james.wilson@cityhospital.com'
    },
    {
        'title': 'Orthopedic Care: Common Issues and Solutions',
        'content': 'Understanding common orthopedic problems and modern treatment approaches.',
        'author_email': 'sarah.mitchell@cityhospital.com'
    },
    {
        'title': 'Pediatric Health: Growing Strong',
        'content': 'Essential information for parents about child health and development.',
        'author_email': 'emily.chen@apollomedical.com'
    },
    {
        'title': 'Cancer Care: Latest Treatments',
        'content': 'Overview of modern cancer treatment options and support resources.',
        'author_email': 'lisa.anderson@stmarys.com'
    },
    {
        'title': 'Digestive Health: What You Need to Know',
        'content': 'Understanding digestive health and maintaining a healthy gut.',
        'author_email': 'robert.thompson@stmarys.com'
    }
]

for article_data in articles_data:
    author_email = article_data.pop('author_email')
    author_user = User.objects.get(email=author_email)
    author_doctor = DoctorProfile.objects.get(user=author_user)
    
    Article.objects.create(
        author=author_doctor,
        **article_data
    )

print("\n✅ Demo data created successfully!")
print(f"✅ Created {len(hospitals)} hospitals")
print(f"✅ Created {len(doctors)} doctors")
print(f"✅ Created {len(patients)} patients")
print(f"✅ Created {len(patient_list) * 3} appointments")
print(f"✅ Created {len(articles_data)} articles")
