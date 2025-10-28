# api/urls/prescription_urls.py

from django.urls import path
from api.views.prescription_views import DoctorPrescriptionListView, PrescriptionCreateView

urlpatterns = [
    # This URL handles GET (list)
    path('doctor/prescriptions/', DoctorPrescriptionListView.as_view(), name='doctor-prescription-list'),
    path('prescriptions/create/', PrescriptionCreateView.as_view(), name='prescription-create'),
]