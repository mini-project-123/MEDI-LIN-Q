# api/urls/patient_urls.py

from django.urls import path
from api.views.patient_views import (
    PatientProfileView,
    PatientProfileUpdateView,
    PatientMedicalReportsView,
    PatientMedicalReportDetailView,
    PatientAppointmentDetailView,
    PatientAppointmentsHistoryView,
    PatientPrescriptionsView,
    PatientPrescriptionDetailView,
    PatientNotificationsView,
    PatientNotificationDetailView,
    PublicDoctorListView,
    PublicHospitalListView,
    PatientDoctorSearchView,
    AppointmentCreateView,
    PatientAppointmentManageView,
    PatientDashboardView,
    PatientHealthAnalyticsView,
    PatientReportAISummaryView,
    PatientAIChatbotView,
    PatientAppointmentVerifyView,
    # NEW BOOKING WORKFLOW
    PatientHospitalListView,
    PatientDoctorsByHospitalView,
    PatientDoctorScheduleView,
    PatientBookAppointmentView,
    # SETTINGS & PRIVACY
    PatientSettingsView,
    PatientPrivacyView,
    # MEDICAL REPORTS
    PatientMedicalReportsListView,
)

urlpatterns = [
    # --- PROFILE MANAGEMENT ---
    # POST: Create patient profile (Step 2 Registration)
    path('profile/patient/', PatientProfileView.as_view(), name='patient-profile-create'),
    
    # GET/PATCH: View/Update patient profile
    path('profile/update/', PatientProfileUpdateView.as_view(), name='patient-profile-update'),
    
    # --- DASHBOARD & ANALYTICS ---
    # GET: Patient dashboard (aggregated data)
    path('dashboard/', PatientDashboardView.as_view(), name='patient-dashboard'),
    
    # GET: Patient health analytics and statistics
    path('analytics/', PatientHealthAnalyticsView.as_view(), name='patient-analytics'),
    
    # --- MEDICAL REPORTS ---
    # GET/POST: List and upload medical reports
    path('medical-reports/', PatientMedicalReportsView.as_view(), name='medical-reports-list'),
    path('patients/medical-reports/', PatientMedicalReportsView.as_view(), name='medical-reports-list-alt'),
    
    # GET/DELETE: Medical report details
    path('medical-reports/<int:pk>/', PatientMedicalReportDetailView.as_view(), name='medical-report-detail'),
    
    # --- APPOINTMENTS ---
    # GET: All appointments with filtering and pagination
    path('appointments/', PatientAppointmentsHistoryView.as_view(), name='patient-appointments'),
    path('patients/appointments/', PatientAppointmentsHistoryView.as_view(), name='patient-appointments-alt'),
    
    # GET: Appointment details
    path('appointments/<int:pk>/', PatientAppointmentDetailView.as_view(), name='patient-appointment-detail'),
    
    # PATCH: Manage (cancel) appointment
    path('appointments/<int:pk>/manage/', PatientAppointmentManageView.as_view(), name='patient-appointment-manage'),
    
    # --- PRESCRIPTIONS ---
    # GET: All prescriptions with filtering
    path('prescriptions/', PatientPrescriptionsView.as_view(), name='patient-prescriptions'),
    
    # GET: Prescription details
    path('prescriptions/<int:pk>/', PatientPrescriptionDetailView.as_view(), name='patient-prescription-detail'),
    
    # --- NOTIFICATIONS ---
    # GET: All notifications
    path('notifications/', PatientNotificationsView.as_view(), name='patient-notifications'),
    
    # PATCH: Update notification (mark as read)
    path('notifications/<int:pk>/', PatientNotificationDetailView.as_view(), name='patient-notification-detail'),
    
    # --- BOOKING SYSTEM ---
    # GET: List public doctors
    path('booking/doctors/', PublicDoctorListView.as_view(), name='public-doctor-list'),
    
    # GET: Doctor search with advanced filters
    path('booking/doctors/search/', PatientDoctorSearchView.as_view(), name='doctor-search'),
    
    # GET: List public hospitals
    path('booking/hospitals/', PublicHospitalListView.as_view(), name='public-hospital-list'),
    
    # POST: Create appointment
    path('booking/create/', AppointmentCreateView.as_view(), name='appointment-create'),
    
    # --- AI & ADVANCED FEATURES ---
    # POST: Get AI summary for medical report
    path('reports/<int:report_id>/ai-summary/', PatientReportAISummaryView.as_view(), name='report-ai-summary'),
    
    # POST: AI Chatbot for health queries
    path('ai-chatbot/', PatientAIChatbotView.as_view(), name='ai-chatbot'),
    
    # POST: Verify appointment details before booking
    path('booking/verify/', PatientAppointmentVerifyView.as_view(), name='appointment-verify'),
    
    # --- NEW BOOKING WORKFLOW ---
    # Step 1: GET: List all hospitals
    path('booking/workflow/hospitals/', PatientHospitalListView.as_view(), name='booking-hospitals'),
    
    # Step 2: GET: List doctors by hospital (query_param: hospital_id)
    path('booking/workflow/doctors/', PatientDoctorsByHospitalView.as_view(), name='booking-doctors-by-hospital'),
    
    # Step 3: GET: Get doctor's available schedule (query_param: doctor_id, date)
    path('booking/workflow/schedule/', PatientDoctorScheduleView.as_view(), name='booking-doctor-schedule'),
    
    # Step 4: POST: Book appointment
    path('booking/workflow/book/', PatientBookAppointmentView.as_view(), name='booking-book-appointment'),
    
    # --- SETTINGS & PRIVACY ---
    # GET/PATCH: Patient settings and profile information
    path('settings/', PatientSettingsView.as_view(), name='patient-settings'),
    
    # GET/PATCH: Patient privacy preferences
    path('privacy/', PatientPrivacyView.as_view(), name='patient-privacy'),
    
    # --- MEDICAL REPORTS (Enhanced) ---
    # GET/POST: List all medical reports with better API
    path('medical-reports-api/', PatientMedicalReportsListView.as_view(), name='medical-reports-api'),
]