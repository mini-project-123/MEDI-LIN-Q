# api/models.py

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.conf import settings
import uuid

# Helper function for custom ID
def generate_custom_id(prefix):
    return f"{prefix}-{str(uuid.uuid4()).split('-')[0].upper()}"


# --- 1. CORE USER MODEL ---
class User(AbstractUser):
    # Base fields (username, password, email, first_name, last_name)
    # are inherited from AbstractUser.
    
    # --- FIX 1: Added 'staff' role to match your migration 0005 ---
    ROLE_CHOICES = (
        ('patient', 'Patient'),
        ('doctor', 'Doctor'),
        ('hospital_admin', 'Hospital Admin'),
        ('staff', 'Staff'), # <-- This was missing
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='patient')
    custom_id = models.CharField(max_length=20, unique=True, blank=True)
    gender = models.CharField(max_length=10, blank=True)
    contact_no = models.CharField(max_length=15, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    
    # --- FIX 2: Added missing fields from your migration 0001 ---
    middle_name = models.CharField(max_length=50, blank=True)
    address = models.TextField(blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # --- FIX 3: Removed this field. It's not in your database migrations ---
    # is_profile_complete = models.BooleanField(default=False) 
    # --- END OF FIX 3 ---

    def save(self, *args, **kwargs):
        if not self.custom_id:
            if self.role == 'patient':
                self.custom_id = generate_custom_id('P')
            elif self.role == 'doctor':
                self.custom_id = generate_custom_id('D')
            elif self.role == 'hospital_admin':
                self.custom_id = generate_custom_id('H')
            elif self.role == 'staff':
                self.custom_id = generate_custom_id('S')
            else:
                self.custom_id = generate_custom_id('U')
        super().save(*args, **kwargs)

    @property
    def age(self):
        if self.date_of_birth:
            today = timezone.now().date()
            return today.year - self.date_of_birth.year - ((today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day))
        return None


# --- 2. PROFILE MODELS ---
class PatientProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True, related_name='patientprofile')
    blood_group = models.CharField(max_length=5, blank=True)
    emergency_contact_no = models.CharField(max_length=15, blank=True)
    emergency_contact_relation = models.CharField(max_length=50, blank=True)
    allergies = models.TextField(blank=True)
    
    photo = models.ImageField(upload_to='patient_photos/', blank=True, null=True)


class Hospital(models.Model):
    # Keep default id primary key (do NOT set primary_key=True here)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='hospitalprofile'
    )
    name = models.CharField(max_length=255)
    custom_id = models.CharField(max_length=20, unique=True, blank=True)
    email = models.EmailField(unique=True)
    contact_no1 = models.CharField(max_length=15, blank=True)
    contact_no2 = models.CharField(max_length=15, blank=True)
    address = models.TextField(blank=True)
    license_no = models.CharField(max_length=100, unique=True, null=True, blank=True)
    website = models.URLField(blank=True)
    operating_hours = models.CharField(max_length=100, blank=True)
    photo = models.ImageField(upload_to='hospital_photos/', blank=True, null=True)

    # keep admins M2M (existing migration created api_hospital_admins)
    admins = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='managed_hospitals', blank=True)

    # match the DB column you have
    num_departments = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.custom_id:
            self.custom_id = generate_custom_id('HOSP')
        if not self.email and self.user:
            self.email = self.user.email
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class DoctorProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True, related_name='doctorprofile')
    specialization = models.CharField(max_length=100)
    qualification = models.CharField(max_length=255)
    experience_years = models.PositiveIntegerField()
    available_days = models.CharField(max_length=255, blank=True) # e.g., "Mon,Tue,Wed"
    languages_spoken = models.CharField(max_length=255, blank=True) # e.g., "English,Spanish"
    photo = models.ImageField(upload_to='doctor_photos/', blank=True, null=True)
    
    hospital = models.ForeignKey(Hospital, on_delete=models.SET_NULL, null=True, blank=True, related_name='doctors')


class StaffProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True, related_name='staffprofile')
    job_title = models.CharField(max_length=100) # e.g., Nurse, Technician
    department = models.CharField(max_length=100, blank=True)
    
    hospital = models.ForeignKey(Hospital, on_delete=models.SET_NULL, null=True, blank=True, related_name='staff')


# --- 3. MEDICAL RECORDS & APPOINTMENTS ---
class Appointment(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )
    APPOINTMENT_TYPES = (
        ('consultation', 'Consultation'),
        ('follow_up', 'Follow-up'),
        ('procedure', 'Procedure'),
    )

    id = models.AutoField(primary_key=True)
    custom_id = models.CharField(max_length=20, unique=True, blank=True)
    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE, related_name='appointments')
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE, related_name='appointments')
    hospital = models.ForeignKey(Hospital, on_delete=models.SET_NULL, null=True, related_name='appointments')
    
    appointment_date = models.DateField(null=True, blank=True)
    appointment_time = models.TimeField(null=True, blank=True)
    appointment_type = models.CharField(max_length=20, choices=APPOINTMENT_TYPES, default='consultation')
    
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    token_number = models.PositiveIntegerField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.custom_id:
            self.custom_id = generate_custom_id('APP')
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Appointment {self.custom_id} for {self.patient.user.username}"


class MedicalReport(models.Model):
    id = models.AutoField(primary_key=True)
    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE, related_name='medical_reports')
    appointment = models.ForeignKey(Appointment, on_delete=models.SET_NULL, null=True, blank=True, related_name='medical_reports')
    report_type = models.CharField(max_length=100) # e.g., "Blood Test", "X-Ray"
    description = models.TextField(blank=True)
    report_file = models.FileField(upload_to='medical_reports/')
    created_at = models.DateTimeField(auto_now_add=True)


class Medication(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    
    def __str__(self):
        return self.name


class Prescription(models.Model):
    id = models.AutoField(primary_key=True)
    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE, related_name='prescriptions')
    
    medication_name = models.CharField(max_length=100)
    dosage = models.CharField(max_length=100)
    frequency = models.CharField(max_length=100)
    
    duration = models.CharField(max_length=100, blank=True) # e.g., "7 days"
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    medication = models.ForeignKey(Medication, on_delete=models.SET_NULL, null=True, blank=True)


# --- 4. HOSPITAL MANAGEMENT ---
class Ward(models.Model):
    id = models.AutoField(primary_key=True)
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='wards')
    name = models.CharField(max_length=100) # e.g., "General", "ICU"
    total_beds = models.PositiveIntegerField(default=0)
    occupied_beds = models.PositiveIntegerField(default=0)
    
    @property
    def available_beds(self):
        return self.total_beds - self.occupied_beds
    
    @property
    def occupancy_rate(self):
        if self.total_beds == 0:
            return 0
        return round((self.occupied_beds / self.total_beds) * 100, 2)

    def __str__(self):
        return f"{self.name} ({self.hospital.name})"


class Bed(models.Model):
    id = models.AutoField(primary_key=True)
    ward = models.ForeignKey(Ward, on_delete=models.CASCADE, related_name='beds')
    bed_number = models.CharField(max_length=20)
    is_occupied = models.BooleanField(default=False)
    patient = models.OneToOneField(PatientProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_bed')

    def __str__(self):
        return f"{self.ward.name} - Bed {self.bed_number}"


# --- 5. NOTIFICATIONS ---
class Notification(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title


# --- 6. ARTICLES ---
class Article(models.Model):
    id = models.AutoField(primary_key=True)
    author = models.ForeignKey(DoctorProfile, on_delete=models.SET_NULL, null=True, related_name='articles')
    title = models.CharField(max_length=255)
    content = models.TextField()
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title