from django.contrib import admin
from .models import (
    User,
    PatientProfile,
    DoctorProfile,
    Hospital,
    Appointment,
    MedicalReport,
    Article,          
    Medication,      # <-- Commented out
    Prescription,    # <-- Commented out
    Ward,              # <-- Commented out
    Bed,               # <-- Commented out
    StaffProfile,    # <-- Commented out
    Notification     # <-- Commented out
)


admin.site.register(User)
admin.site.register(PatientProfile)
admin.site.register(DoctorProfile)
admin.site.register(Hospital)
admin.site.register(Appointment)
admin.site.register(MedicalReport)
admin.site.register(Article)       # <-- Commented out
admin.site.register(Medication)    # <-- Commented out
admin.site.register(Prescription)  # <-- Commented out
admin.site.register(Ward)          # <-- Commented out
admin.site.register(Bed)           # <-- Commented out
admin.site.register(StaffProfile)  # <-- Commented out
admin.site.register(Notification)  # <-- Commented out