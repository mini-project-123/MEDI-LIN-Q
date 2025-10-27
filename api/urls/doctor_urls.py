
from django.urls import path
from api.views.doctor_views import (
  DoctorProfileView, 
  DoctorDashboardSummaryView, 
  DoctorPatientListView, 
  PatientDetailForDoctorView, 
  PatientSummaryAIView,
  DoctorAppointmentListView)

urlpatterns = [
    # Doctor Profile Creation (Step 2 of registration)
    path('profile/doctor/', DoctorProfileView.as_view(), name='doctor-profile-create'),
    path('doctor/dashboard-summary/', DoctorDashboardSummaryView.as_view(), name='doctor-dashboard-summary'),
    path('doctor/patients/', DoctorPatientListView.as_view(), name='doctor-patient-list'),
    path('doctor/patients/<int:pk>/', PatientDetailForDoctorView.as_view(), name='doctor-patient-detail'),
    path('patients/<int:pk>/summary/', PatientSummaryAIView.as_view(), name='patient-summary-ai'),
    path('doctor/appointments/', DoctorAppointmentListView.as_view(), name='doctor-appointment-list'),
    # All future doctor dashboard URLs will go in this list
]