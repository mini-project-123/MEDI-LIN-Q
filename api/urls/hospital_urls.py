# api/urls/hospital_urls.py

from django.urls import path
from api.views.hospital_views import (
    HospitalCreationView, 
    HospitalProfileManageView,
    HospitalDashboardSummaryView,
    HospitalDoctorListView,
    HospitalStaffListView,
    HospitalPatientListView,
    HospitalWardListView,
    HospitalAppointmentListView,
    HospitalAnalyticsView,
    HospitalStaffCreateView,
    HospitalStaffManageView,
    HospitalPatientCreateView,
    HospitalPatientManageView,
    HospitalPatientReportUploadView
)

urlpatterns = [
    path('profile/hospital/', HospitalCreationView.as_view(), name='hospital-profile-create'),
    path('hospital/profile/manage/', HospitalProfileManageView.as_view(), name='hospital-profile-manage'),
    path('hospital/dashboard-summary/', HospitalDashboardSummaryView.as_view(), name='hospital-dashboard-summary'),
    path('hospital/doctors/', HospitalDoctorListView.as_view(), name='hospital-doctor-list'),
    
    path('hospital/staff/', HospitalStaffListView.as_view(), name='hospital-staff-list'),
    path('hospital/staff/add/', HospitalStaffCreateView.as_view(), name='hospital-staff-add'),
    path('hospital/staff/<int:pk>/manage/', HospitalStaffManageView.as_view(), name='hospital-staff-manage'),
    
    path('hospital/patients/', HospitalPatientListView.as_view(), name='hospital-patient-list'),
    path('hospital/patients/add/', HospitalPatientCreateView.as_view(), name='hospital-patient-add'),
    path('hospital/patients/<int:pk>/manage/', HospitalPatientManageView.as_view(), name='hospital-patient-manage'),
    path('hospital/patients/<int:pk>/upload-report/', HospitalPatientReportUploadView.as_view(), name='hospital-patient-upload-report'),
    
    path('hospital/wards/', HospitalWardListView.as_view(), name='hospital-ward-list'),
    path('hospital/appointments/', HospitalAppointmentListView.as_view(), name='hospital-appointment-list'),
    path('hospital/analytics/', HospitalAnalyticsView.as_view(), name='hospital-analytics'),
]