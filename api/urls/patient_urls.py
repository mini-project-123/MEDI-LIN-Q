# api/urls/patient_urls.py

from django.urls import path
from api.views.patient_views import (
    PatientProfileView, 
    PatientDashboardDetailView,
    PublicDoctorListView,  # <-- Import
    PublicHospitalListView, # <-- Import
    AppointmentCreateView,   # <-- Import
    PatientAppointmentManageView
)

urlpatterns = [
    # This URL is for Step 2 Registration (POST only)
    path('profile/patient/', PatientProfileView.as_view(), name='patient-profile-create'),
    
    # --- ADD THIS NEW URL ---
    # This single URL is for the patient's main dashboard (GET)
    # and for updating their profile (PATCH)
    path('dashboard/', PatientDashboardDetailView.as_view(), name='patient-dashboard-detail'),
    # --- ADD THESE NEW URLS FOR BOOKING ---
    path('booking/doctors/', PublicDoctorListView.as_view(), name='public-doctor-list'),
    path('booking/hospitals/', PublicHospitalListView.as_view(), name='public-hospital-list'),
    path('booking/create/', AppointmentCreateView.as_view(), name='appointment-create'),
    path('appointments/<int:pk>/manage/', PatientAppointmentManageView.as_view(), name='patient-appointment-manage'),
]