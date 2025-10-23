from django.urls import path
from api.views.patient_views import PatientProfileView

urlpatterns = [
    path('profile/patient/', PatientProfileView.as_view(), name='patient-profile-create'),
    
    # All future patient dashboard URLs will go in this list
]