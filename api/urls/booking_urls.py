# api/urls/booking_urls.py

from django.urls import path
from api.views.booking_views import (
    hospital_list,
    hospital_doctors,
    doctor_slots,
    book_appointment,
    patient_appointments,
    doctor_appointments,
    cancel_appointment,
)

urlpatterns = [
    # Hospital and Doctor Discovery
    path('hospitals/', hospital_list, name='hospital-list'),
    path('hospitals/<int:hospital_id>/doctors/', hospital_doctors, name='hospital-doctors'),
    path('doctors/<int:doctor_id>/slots/', doctor_slots, name='doctor-slots'),
    
    # Workflow endpoints (for multi-step booking) - support query parameters
    path('workflow/hospitals/', hospital_list, name='workflow-hospitals'),
    path('workflow/doctors/', hospital_doctors, name='workflow-doctors'),  # Uses query param hospital_id
    path('workflow/schedule/', doctor_slots, name='workflow-schedule'),  # Uses query params doctor_id, date
    path('workflow/book/', book_appointment, name='workflow-book'),
    
    # Appointment Management
    path('appointments/book/', book_appointment, name='book-appointment'),
    path('appointments/my/', patient_appointments, name='patient-appointments'),
    path('appointments/doctor/', doctor_appointments, name='doctor-appointments'),
    path('appointments/<int:appointment_id>/cancel/', cancel_appointment, name='cancel-appointment'),
]
