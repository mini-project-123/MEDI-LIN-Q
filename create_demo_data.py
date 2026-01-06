"""
Create realistic demo data for the MediLinq healthcare system.
This script creates multiple hospitals, doctors, patients, appointments, and articles.

Run with: python create_demo_data.py
"""

import os
import django
import random
from datetime import datetime, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medilinq_config.settings')
django.setup()

from api.models import (
    User, Hospital, DoctorProfile, PatientProfile, 
    Appointment, Article, StaffProfile, MedicalReport
)
from django.utils import timezone

# ============================================================
# DEMO DATA CREDENTIALS - SAVE THIS!
# ============================================================

DEMO_CREDENTIALS = {
    "hospitals": [
        {
            "name": "City Hospital",
            "admin_email": "admin@cityhospital.com",
            "admin_password": "CityHosp@123",
            "admin_user_id": None,  # Will be populated
            "license": "HOSP-NYC-2024-001",
            "address": "123 Main Street, New York, NY",
            "phone": "555-0101"
        },
        {
            "name": "Apollo Medical Center",
            "admin_email": "admin@apollomedical.com",
            "admin_password": "Apollo@123",
            "admin_user_id": None,
            "license": "HOSP-APOLLO-2024-002",
            "address": "456 Health Avenue, Los Angeles, CA",
            "phone": "555-0202"
        },
        {
            "name": "St. Mary's Hospital",
            "admin_email": "admin@stmarys.com",
            "admin_password": "StMary@123",
            "admin_user_id": None,
            "license": "HOSP-STMARY-2024-003",
            "address": "789 Medical Plaza, Chicago, IL",
            "phone": "555-0303"
        }
    ],
    "doctors": [
        # City Hospital doctors
        {
            "hospital_name": "City Hospital",
            "first_name": "Dr. James",
            "last_name": "Wilson",
            "email": "james.wilson@cityhospital.com",
            "password": "DrWilson@123",
            "specialization": "Cardiology",
            "qualification": "MBBS, MD",
            "experience_years": 12,
            "phone": "555-1001"
        },
        {
            "hospital_name": "City Hospital",
            "first_name": "Dr. Sarah",
            "last_name": "Mitchell",
            "email": "sarah.mitchell@cityhospital.com",
            "password": "DrMitchell@123",
            "specialization": "Orthopedics",
            "qualification": "MBBS, MS",
            "experience_years": 8,
            "phone": "555-1002"
        },
        {
            "hospital_name": "City Hospital",
            "first_name": "Dr. Michael",
            "last_name": "Johnson",
            "email": "michael.johnson@cityhospital.com",
            "password": "DrJohnson@123",
            "specialization": "Neurology",
            "qualification": "MBBS, DM",
            "experience_years": 15,
            "phone": "555-1003"
        },
        # Apollo doctors
        {
            "hospital_name": "Apollo Medical Center",
            "first_name": "Dr. Emily",
            "last_name": "Chen",
            "email": "emily.chen@apollomedical.com",
            "password": "DrChen@123",
            "specialization": "Pediatrics",
            "qualification": "MBBS, DCH",
            "experience_years": 6,
            "phone": "555-2001"
        },
        {
            "hospital_name": "Apollo Medical Center",
            "first_name": "Dr. David",
            "last_name": "Kumar",
            "email": "david.kumar@apollomedical.com",
            "password": "DrKumar@123",
            "specialization": "Internal Medicine",
            "qualification": "MBBS, MD",
            "experience_years": 10,
            "phone": "555-2002"
        },
        # St. Mary's doctors
        {
            "hospital_name": "St. Mary's Hospital",
            "first_name": "Dr. Lisa",
            "last_name": "Anderson",
            "email": "lisa.anderson@stmarys.com",
            "password": "DrAnderson@123",
            "specialization": "Oncology",
            "qualification": "MBBS, MD",
            "experience_years": 14,
            "phone": "555-3001"
        },
        {
            "hospital_name": "St. Mary's Hospital",
            "first_name": "Dr. Robert",
            "last_name": "Thompson",
            "email": "robert.thompson@stmarys.com",
            "password": "DrThompson@123",
            "specialization": "Gastroenterology",
            "qualification": "MBBS, DM",
            "experience_years": 11,
            "phone": "555-3002"
        }
    ],
    "patients": [
        # City Hospital patients
        {
            "hospital_name": "City Hospital",
            "first_name": "John",
            "last_name": "Smith",
            "email": "john.smith@email.com",
            "password": "Patient@Smith1",
            "phone": "555-4001",
            "gender": "Male",
            "blood_group": "O+"
        },
        {
            "hospital_name": "City Hospital",
            "first_name": "Mary",
            "last_name": "Johnson",
            "email": "mary.johnson@email.com",
            "password": "Patient@Mary2",
            "phone": "555-4002",
            "gender": "Female",
            "blood_group": "A+"
        },
        {
            "hospital_name": "City Hospital",
            "first_name": "Robert",
            "last_name": "Brown",
            "email": "robert.brown@email.com",
            "password": "Patient@Brown3",
            "phone": "555-4003",
            "gender": "Male",
            "blood_group": "B+"
        },
        # Apollo patients
        {
            "hospital_name": "Apollo Medical Center",
            "first_name": "Patricia",
            "last_name": "Davis",
            "email": "patricia.davis@email.com",
            "password": "Patient@Patricia4",
            "phone": "555-5001",
            "gender": "Female",
            "blood_group": "O-"
        },
        {
            "hospital_name": "Apollo Medical Center",
            "first_name": "Michael",
            "last_name": "Wilson",
            "email": "michael.wilson@email.com",
            "password": "Patient@Mike5",
            "phone": "555-5002",
            "gender": "Male",
            "blood_group": "AB+"
        },
        # St. Mary's patients
        {
            "hospital_name": "St. Mary's Hospital",
            "first_name": "Jennifer",
            "last_name": "Garcia",
            "email": "jennifer.garcia@email.com",
            "password": "Patient@Jenny6",
            "phone": "555-6001",
            "gender": "Female",
            "blood_group": "A-"
        },
        {
            "hospital_name": "St. Mary's Hospital",
            "first_name": "William",
            "last_name": "Martinez",
            "email": "william.martinez@email.com",
            "password": "Patient@Will7",
            "phone": "555-6002",
            "gender": "Male",
            "blood_group": "B-"
        }
    ]
}

# ============================================================
# CREATION FUNCTIONS
# ============================================================

def create_hospital(name, admin_email, admin_password, license_no, address, phone):
    """Create a hospital with admin user"""
    print(f"Creating hospital: {name}...")
    
    # Check if hospital user already exists - use filter to handle duplicates
    hospital = Hospital.objects.filter(name=name).first()
    if hospital:
        print(f"  [OK] Hospital {name} already exists")
        admin_user = hospital.admins.first()
        if not admin_user:
            # Create admin user if hospital exists but has no admins
            admin_user, created = User.objects.get_or_create(
                username=admin_email,
                defaults={
                    'email': admin_email,
                    'first_name': "Admin",
                    'last_name': "Manager",
                    'contact_no': phone,
                    'role': 'hospital_admin'
                }
            )
            if created:
                admin_user.set_password(admin_password)
                admin_user.save()
            hospital.admins.add(admin_user)
            hospital.save()
            print(f"  [OK] Added admin to existing hospital")
        return hospital, admin_user
    
    # Create hospital user (for OneToOne relationship)
    try:
        hospital_user = User.objects.get(username=f"hospital_{name.lower().replace(' ', '_')}")
    except User.DoesNotExist:
        hospital_user = User.objects.create_user(
            username=f"hospital_{name.lower().replace(' ', '_')}",
            email=f"hospital_{name.lower().replace(' ', '_')}@system.local",
            password=admin_password,
            first_name="Hospital",
            last_name="Account",
            contact_no=phone,
            role='hospital_admin'
        )
    
    # Create hospital with user
    hospital = Hospital.objects.create(
        user=hospital_user,
        name=name,
        email=admin_email,
        address=address,
        contact_no1=phone,
        license_no=license_no
    )
    
    # Create/get admin user for managing hospital
    admin_user, created = User.objects.get_or_create(
        username=admin_email,
        defaults={
            'email': admin_email,
            'first_name': "Admin",
            'last_name': "Manager",
            'contact_no': phone,
            'role': 'hospital_admin'
        }
    )
    
    if created:
        admin_user.set_password(admin_password)
        admin_user.save()
    
    hospital.admins.add(admin_user)
    hospital.save()
    
    print(f"  [OK] Hospital created: {name}")
    print(f"  [OK] Admin User ID: {admin_user.id}")
    
    return hospital, admin_user


def create_doctor(hospital, first_name, last_name, email, password, specialization, qualification, experience_years, phone):
    """Create a doctor and link to hospital"""
    print(f"  Creating doctor: Dr. {first_name} {last_name}...")
    
    # Check if doctor already exists
    try:
        user = User.objects.get(email=email)
        doctor = DoctorProfile.objects.get(user=user)
        print(f"    [OK] Dr. {first_name} {last_name} already exists (skipping)")
        return doctor
    except (User.DoesNotExist, DoctorProfile.DoesNotExist):
        pass
    
    # Create user
    user = User.objects.create_user(
        username=email,
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name,
        contact_no=phone,
        role='doctor'
    )
    
    # Create doctor profile
    doctor = DoctorProfile.objects.create(
        user=user,
        hospital=hospital,
        specialization=specialization,
        qualification=qualification,
        experience_years=experience_years,
        available_days="Monday,Tuesday,Wednesday,Thursday,Friday",
        languages_spoken="English"
    )
    
    print(f"    [OK] Dr. {first_name} {last_name} created")
    
    return doctor


def create_patient(hospital, first_name, last_name, email, password, phone, gender, blood_group):
    """Create a patient"""
    print(f"  Creating patient: {first_name} {last_name}...")
    
    # Check if patient already exists
    try:
        user = User.objects.get(email=email)
        patient = PatientProfile.objects.get(user=user)
        print(f"    [OK] Patient {first_name} {last_name} already exists (skipping)")
        return patient
    except (User.DoesNotExist, PatientProfile.DoesNotExist):
        pass
    
    # Create user
    user = User.objects.create_user(
        username=email,
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name,
        contact_no=phone,
        gender=gender,
        role='patient'
    )
    
    # Create patient profile
    patient = PatientProfile.objects.create(
        user=user,
        blood_group=blood_group
    )
    
    print(f"    [OK] Patient {first_name} {last_name} created")
    
    return patient


def create_appointments(hospital, doctors, patients):
    """Create appointments between doctors and patients"""
    print(f"Creating appointments for {hospital.name}...")
    
    appointment_types = ['consultation', 'follow_up', 'procedure']
    # Create more realistic appointment statuses
    appointment_statuses = ['confirmed', 'completed', 'pending']
    
    # Realistic appointment times (working hours)
    appointment_times = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '12:00', '12:30', '14:00', '14:30', '15:00', '15:30', '16:00'
    ]
    
    for patient in patients:
        # Each patient gets 3-5 appointments (more realistic)
        num_appointments = random.randint(3, 5)
        for i in range(num_appointments):
            doctor = random.choice(doctors)
            
            # Create mix of past and future appointments
            if i < 2:
                # Past appointments (completed)
                days_offset = random.randint(-60, -7)
                status = 'completed'
            else:
                # Future appointments
                days_offset = random.randint(1, 60)
                status = random.choice(['confirmed', 'pending'])
            
            appointment_date = (timezone.now() + timedelta(days=days_offset)).date()
            appointment_time = random.choice(appointment_times)
            
            Appointment.objects.create(
                patient=patient,
                doctor=doctor,
                hospital=hospital,
                appointment_date=appointment_date,
                appointment_time=appointment_time,
                appointment_type=random.choice(appointment_types),
                status=status,
                reason=random.choice([
                    "Routine checkup",
                    "Follow-up visit",
                    "Consultation",
                    "Health screening",
                    "Pre-surgery evaluation"
                ])
            )
    
    print(f"  [OK] Appointments created")


def create_articles(hospitals):
    """Create sample articles"""
    print("Creating articles...")
    
    article_data = [
        {
            "title": "Understanding Cardiovascular Health",
            "content": "Cardiovascular health is crucial for overall well-being. Regular exercise, a balanced diet, and stress management are key factors in maintaining a healthy heart. It's important to have regular check-ups and monitor your blood pressure and cholesterol levels."
        },
        {
            "title": "Tips for Managing Chronic Pain",
            "content": "Living with chronic pain can be challenging. However, there are several strategies that can help manage pain effectively. These include physical therapy, medication management, mindfulness practices, and lifestyle modifications. Consult with healthcare professionals for personalized advice."
        },
        {
            "title": "The Importance of Regular Health Screenings",
            "content": "Regular health screenings are essential for early detection of potential health issues. Depending on your age and health history, you may need various screenings. Discuss with your doctor which screenings are appropriate for you."
        },
        {
            "title": "Nutrition Tips for Better Health",
            "content": "A balanced diet rich in fruits, vegetables, whole grains, and lean proteins is fundamental for good health. Limit processed foods, sugary drinks, and excessive salt intake. Remember, healthy eating is not about restriction but about nourishing your body."
        },
        {
            "title": "Mental Health Awareness",
            "content": "Mental health is just as important as physical health. It's okay to seek help if you're struggling with anxiety, depression, or stress. Many resources are available, including therapy, counseling, and support groups. Remember, you're not alone."
        }
    ]
    
    # Get doctors to assign as article authors
    doctors = DoctorProfile.objects.all()[:5]
    
    if doctors.exists():
        for i, article in enumerate(article_data):
            author = doctors[i % len(doctors)]
            Article.objects.create(
                title=article['title'],
                content=article['content'],
                author=author,
                is_published=True
            )
        print(f"  [OK] {len(article_data)} articles created")
    else:
        print(f"  ⚠ No doctors found, skipping articles")


# ============================================================
# MAIN EXECUTION
# ============================================================

def main():
    print("\n" + "="*60)
    print("CREATING REALISTIC DEMO DATA FOR MEDILINQ")
    print("="*60 + "\n")
    
    # Clear existing demo data (optional - commented out for safety)
    # User.objects.filter(email__contains='@email.com').delete()
    # Hospital.objects.all().delete()
    
    hospitals_data = []
    
    # Create hospitals
    print("STEP 1: Creating Hospitals and Admins\n")
    for hosp_info in DEMO_CREDENTIALS["hospitals"]:
        hospital, admin_user = create_hospital(
            name=hosp_info["name"],
            admin_email=hosp_info["admin_email"],
            admin_password=hosp_info["admin_password"],
            license_no=hosp_info["license"],
            address=hosp_info["address"],
            phone=hosp_info["phone"]
        )
        hosp_info["admin_user_id"] = admin_user.id
        hospitals_data.append({
            "hospital": hospital,
            "admin": admin_user,
            "info": hosp_info
        })
    
    # Create doctors
    print("\n\nSTEP 2: Creating Doctors\n")
    all_doctors = {}
    for doctor_info in DEMO_CREDENTIALS["doctors"]:
        hosp_name = doctor_info["hospital_name"]
        hosp_data = next(h for h in hospitals_data if h["hospital"].name == hosp_name)
        
        doctor = create_doctor(
            hospital=hosp_data["hospital"],
            first_name=doctor_info["first_name"],
            last_name=doctor_info["last_name"],
            email=doctor_info["email"],
            password=doctor_info["password"],
            specialization=doctor_info["specialization"],
            qualification=doctor_info["qualification"],
            experience_years=doctor_info["experience_years"],
            phone=doctor_info["phone"]
        )
        
        if hosp_name not in all_doctors:
            all_doctors[hosp_name] = []
        all_doctors[hosp_name].append(doctor)
    
    # Create patients
    print("\n\nSTEP 3: Creating Patients\n")
    all_patients = {}
    for patient_info in DEMO_CREDENTIALS["patients"]:
        hosp_name = patient_info["hospital_name"]
        hosp_data = next(h for h in hospitals_data if h["hospital"].name == hosp_name)
        
        patient = create_patient(
            hospital=hosp_data["hospital"],
            first_name=patient_info["first_name"],
            last_name=patient_info["last_name"],
            email=patient_info["email"],
            password=patient_info["password"],
            phone=patient_info["phone"],
            gender=patient_info["gender"],
            blood_group=patient_info["blood_group"]
        )
        
        if hosp_name not in all_patients:
            all_patients[hosp_name] = []
        all_patients[hosp_name].append(patient)
    
    # Create appointments
    print("\n\nSTEP 4: Creating Appointments\n")
    for hosp_data in hospitals_data:
        hosp_name = hosp_data["hospital"].name
        if hosp_name in all_doctors and hosp_name in all_patients:
            create_appointments(
                hospital=hosp_data["hospital"],
                doctors=all_doctors[hosp_name],
                patients=all_patients[hosp_name]
            )
    
    # Create articles
    print("\n\nSTEP 5: Creating Articles\n")
    hospitals = [h["hospital"] for h in hospitals_data]
    create_articles(hospitals)
    
    # Print credentials
    print("\n\n" + "="*60)
    print("DEMO DATA CREATION COMPLETE!")
    print("="*60 + "\n")
    
    print("[SUCCESS] SAVE THESE CREDENTIALS FOR TESTING:\n")
    for hosp_info in DEMO_CREDENTIALS["hospitals"]:
        print(f"\nHospital: {hosp_info['name']}")
        print(f"  Admin Email: {hosp_info['admin_email']}")
        print(f"  Admin Password: {hosp_info['admin_password']}")
        print(f"  Admin User ID (for doctors): {hosp_info['admin_user_id']}")
    
    print("\n\nDoctors created:")
    for doctor_info in DEMO_CREDENTIALS["doctors"]:
        print(f"  Dr. {doctor_info['first_name']} {doctor_info['last_name']} ({doctor_info['email']})")
        print(f"    Password: {doctor_info['password']}")
    
    print("\n\nPatients created:")
    for patient_info in DEMO_CREDENTIALS["patients"]:
        print(f"  {patient_info['first_name']} {patient_info['last_name']} ({patient_info['email']})")
        print(f"    Password: {patient_info['password']}")
    
    print("\n" + "="*60)
    print("All demo users can log in at http://localhost:3003/login")
    print("="*60 + "\n")


if __name__ == '__main__':
    main()
