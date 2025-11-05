

from django.urls import path
from api.views.hospital_views import HospitalCreationView

urlpatterns = [
    # Hospital Profile Creation (Step 2 of registration)
    path('profile/hospital/', HospitalCreationView.as_view(), name='hospital-profile-create'),
    
    # All future hospital dashboard URLs will go in this list
]