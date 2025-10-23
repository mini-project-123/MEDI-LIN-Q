
from django.urls import path
from api.views.doctor_views import DoctorProfileView

urlpatterns = [
    # Doctor Profile Creation (Step 2 of registration)
    path('profile/doctor/', DoctorProfileView.as_view(), name='doctor-profile-create'),
    
    # All future doctor dashboard URLs will go in this list
]