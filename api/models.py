from django.db import models
from django.contrib.auth.models import AbstractUser
from datetime import date
import random

# =====================================================================
# 1. CENTRAL USER MODEL
# =====================================================================
class User(AbstractUser):
    ROLE_CHOICES = (
        ('patient', 'Patient'),
        ('doctor', 'Doctor'),
        ('hospital_admin', 'Hospital Admin'),
        ('staff', 'Staff'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    custom_id = models.CharField(max_length=20, unique=True, blank=True, editable=False)
    middle_name = models.CharField(max_length=50, blank=True)

    GENDER_CHOICES = (('male', 'Male'), ('female', 'Female'), ('other', 'Other'))
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, blank=True, null=True)
    date_of_birth = models.DateField(null=True, blank=True)
    contact_no = models.CharField(max_length=15, blank=True, null=True)
    address = models.TextField(blank=True, null=True)

    updated_at = models.DateTimeField(auto_now=True)

    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        related_name="api_user_groups",
        related_query_name="user",
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        related_name="api_user_permissions",
        related_query_name="user",
    )

    @property
    def age(self):
        if self.date_of_birth:
            today = date.today()
            return today.year - self.date_of_birth.year - ((today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day))
        return None

    def save(self, *args, **kwargs):
        if not self.custom_id:
            if self.role == 'patient':
                prefix = 'PT'
            elif self.role == 'doctor':
                prefix = 'DC'
            elif self.role == 'hospital_admin':
                prefix = 'AD'
            elif self.role == 'staff':
                prefix = 'ST'
            else:
                prefix = ''

            if prefix:
                while True:
                    year = date.today().year
                    random_num = random.randint(1000, 9999)
                    new_id = f"{prefix}-{year}-{random_num}"
                    if not User.objects.filter(custom_id=new_id).exists():
                        self.custom_id = new_id
                        break

        super().save(*args, **kwargs)

# =====================================================================
# 2. HOSPITAL MODEL
# =====================================================================
class Hospital(models.Model):
    custom_id = models.CharField(max_length=20, unique=True, blank=True, editable=False)
    name = models.CharField(max_length=255)
    address = models.TextField()
    contact_no1 = models.CharField(max_length=15)
    contact_no2 = models.CharField(max_length=15, blank=True)
    email = models.EmailField(unique=True)
    website = models.URLField(blank=True)
    license_no = models.CharField(max_length=100, unique=True)
    operating_hours = models.CharField(max_length=100)
    num_departments = models.PositiveIntegerField(default=1)
    photo = models.ImageField(upload_to='hospital_photos/', null=True, blank=True)
    admins = models.ManyToManyField(User, related_name='hospitals_administered', limit_choices_to={'role': 'hospital_admin'})
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.custom_id})"

    def save(self, *args, **kwargs):
        if not self.custom_id:
            prefix = 'HP'
            while True:
                year = date.today().year
                random_num = random.randint(1000, 9999)
                new_id = f"{prefix}-{year}-{random_num}"
                if not Hospital.objects.filter(custom_id=new_id).exists():
                    self.custom_id = new_id
                    break
        super().save(*args, **kwargs)

# =====================================================================
# 3. PATIENT PROFILE
# =====================================================================
class PatientProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True, related_name='patientprofile', limit_choices_to={'role': 'patient'})
    blood_group = models.CharField(max_length=5, blank=True, null=True)
    emergency_contact_no = models.CharField(max_length=15, blank=True, null=True)
    emergency_contact_relation = models.CharField(max_length=50, blank=True, null=True)
    allergies = models.TextField(blank=True)
    photo = models.ImageField(upload_to='patient_photos/', null=True, blank=True)

    def __str__(self):
        return f"Patient: {self.user.first_name} {self.user.last_name} ({self.user.custom_id})"

# =====================================================================
# 4. DOCTOR PROFILE
# =====================================================================
class DoctorProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True, related_name='doctorprofile', limit_choices_to={'role': 'doctor'})
    specialization = models.CharField(max_length=100, blank=True, null=True)
    qualification = models.CharField(max_length=255, blank=True, null=True)
    experience_years = models.PositiveIntegerField(blank=True, null=True)
    available_days = models.CharField(max_length=100, blank=True, null=True)
    languages_spoken = models.CharField(max_length=255, blank=True, null=True)
    hospital = models.ForeignKey(Hospital, on_delete=models.SET_NULL, null=True, blank=True, related_name='doctors')
    photo = models.ImageField(upload_to='doctor_photos/', null=True, blank=True)

    def __str__(self):
        return f"Dr. {self.user.first_name} {self.user.last_name} ({self.user.custom_id})"

# =====================================================================
# 5. APPOINTMENT MODEL
# =====================================================================
class Appointment(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )
    custom_id = models.CharField(max_length=20, unique=True, blank=True, editable=False)
    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE, related_name='appointments')
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE, related_name='appointments')
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='appointments')
    appointment_datetime = models.DateTimeField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    token_number = models.CharField(max_length=20, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Appointment for {self.patient.user.username} with {self.doctor.user.username} on {self.appointment_datetime.date()}"

    def save(self, *args, **kwargs):
        if not self.custom_id:
            prefix = 'AP'
            while True:
                year = date.today().year
                random_num = random.randint(1000, 9999)
                new_id = f"{prefix}-{year}-{random_num}"
                if not Appointment.objects.filter(custom_id=new_id).exists():
                    self.custom_id = new_id
                    break
        super().save(*args, **kwargs)

# =====================================================================
# 6. MEDICAL REPORT MODEL
# =====================================================================
class MedicalReport(models.Model):
    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE, related_name='reports', null=True, blank=True)
    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE, related_name='medical_reports')
    report_type = models.CharField(max_length=100)
    description = models.TextField()
    report_file = models.FileField(upload_to='medical_reports/')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Report for {self.patient.user.username} from {self.created_at.date()}"

# =====================================================================
# 7. MEDICATION MODEL (RECONSTRUCTED)
# =====================================================================
class Medication(models.Model):
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True, help_text="Optional description or usage notes for the medication.")

    def __str__(self):
        return self.name

# =====================================================================
# 8. PRESCRIPTION MODEL (RECONSTRUCTED)
# =====================================================================
class Prescription(models.Model):
    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE, related_name='prescriptions')
    medication = models.ForeignKey(Medication, on_delete=models.PROTECT, related_name='prescriptions')
    dosage = models.CharField(max_length=100, help_text="e.g., '1 tablet', '5 ml'")
    frequency = models.CharField(max_length=100, help_text="e.g., 'Twice a day after meals'")
    duration = models.CharField(max_length=100, help_text="e.g., 'For 7 days'")
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"Prescription for {self.appointment.patient.user.username} - {self.medication.name}"

# =====================================================================
# 9. ARTICLE MODEL (RECONSTRUCTED)
# =====================================================================
class Article(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField()
    status = models.CharField(max_length=10, choices=[('draft', 'Draft'), ('published', 'Published')], default='draft')
    author = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE, related_name='articles')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

# =====================================================================
# 10. STAFF PROFILE MODEL (RECONSTRUCTED)
# =====================================================================
class StaffProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True, related_name='staffprofile', limit_choices_to={'role': 'staff'})
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='staff_members')
    job_title = models.CharField(max_length=100, help_text="e.g., Nurse, Receptionist, Lab Technician")

    def __str__(self):
        return f"Staff: {self.user.first_name} {self.user.last_name} ({self.job_title})"

# =====================================================================
# 11. WARD MODEL (RECONSTRUCTED)
# =====================================================================
class Ward(models.Model):
    name = models.CharField(max_length=100, help_text="e.g., General Ward, ICU, Maternity")
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='wards')

    def __str__(self):
        return f"{self.name} - {self.hospital.name}"

# =====================================================================
# 12. BED MODEL (RECONSTRUCTED)
# =====================================================================
class Bed(models.Model):
    bed_number = models.CharField(max_length=20)
    ward = models.ForeignKey(Ward, on_delete=models.CASCADE, related_name='beds')
    patient = models.OneToOneField(PatientProfile, on_delete=models.SET_NULL, null=True, blank=True)
    is_occupied = models.BooleanField(default=False)

    def __str__(self):
        return f"Bed {self.bed_number} - {self.ward.name}"

# =====================================================================
# 13. NOTIFICATION MODEL (RECONSTRUCTED)
# =====================================================================
class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    link = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification for {self.user.username}: {self.message[:20]}..."