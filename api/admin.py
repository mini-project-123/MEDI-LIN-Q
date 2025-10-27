from django.contrib import admin
from .models import (
    User,
    PatientProfile,
    DoctorProfile,
    Hospital,
    Appointment,
    MedicalReport,
    Article,
    Medication,
    Prescription,
    Ward,
    Bed,
    StaffProfile
)


admin.site.register(User)
admin.site.register(PatientProfile)
admin.site.register(DoctorProfile)
admin.site.register(Hospital)
admin.site.register(Appointment)
admin.site.register(MedicalReport)
admin.site.register(Article)
admin.site.register(Medication)
admin.site.register(Prescription)
admin.site.register(Ward)
admin.site.register(Bed)
admin.site.register(StaffProfile)