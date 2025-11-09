# api/views/patient_views.py

from rest_framework import generics, permissions, views, response
from api.serializers.patient_serializers import PatientProfileSerializer, PatientDetailSerializer, SimplePrescriptionSerializer
from api.permissions import IsPatientUser
from api.models import Appointment, Prescription, PatientProfile # <-- Import these
from django.http import Http404 # <-- Import this

from api.serializers.patient_serializers import (
    PatientProfileSerializer, PatientDetailSerializer, SimplePrescriptionSerializer,
    PublicDoctorSerializer, PublicHospitalSerializer, AppointmentCreateSerializer # <-- Add these
)
from api.models import (
    Appointment, Prescription, PatientProfile, DoctorProfile, Hospital # <-- Add DoctorProfile, Hospital
)
from rest_framework.filters import SearchFilter

class PatientProfileView(generics.CreateAPIView):
    """
    This view (which you already have) is for Step 2 registration (POST).
    We leave it as-is.
    """
    serializer_class = PatientProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsPatientUser]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# --- ADD THIS NEW VIEW ---
class PatientDashboardDetailView(generics.RetrieveUpdateAPIView):
    """
    Handles GET and PATCH requests for the logged-in patient's dashboard.
    - GET: Retrieves all dashboard data (profile, appointments, prescriptions).
    - PATCH: Allows the patient to update their own profile (e.g., allergies, contact_no).
    """
    permission_classes = [permissions.IsAuthenticated, IsPatientUser]
    
    # We use PatientDetailSerializer because it's already set up
    # to show nested user info, appointments, and medical reports.
    serializer_class = PatientDetailSerializer 

    def get_object(self):
        """
        This is the key: it retrieves the profile linked to the
        logged-in user, not from a URL.
        """
        try:
            return self.request.user.patientprofile
        except PatientProfile.DoesNotExist:
            raise Http404("Patient profile not found for this user.")

    def retrieve(self, request, *args, **kwargs):
        """
        This method is overridden to add 'prescriptions' to the
        dashboard data, just like your teammate did for the doctor view.
        """
        # 1. Get the patient profile object (using get_object)
        instance = self.get_object() 

        # 2. Get the standard serialized data (profile, appointments, reports)
        serializer = self.get_serializer(instance)
        data = serializer.data

        # 3. Manually fetch all appointments for this specific patient
        patient_appointments = Appointment.objects.filter(patient=instance)

        # 4. Fetch all prescriptions linked to those appointments
        prescriptions = Prescription.objects.filter(
            appointment__in=patient_appointments
        ).select_related('medication', 'appointment__doctor__user').order_by('-appointment__appointment_datetime') #

        # 5. Serialize the prescriptions
        prescription_serializer = SimplePrescriptionSerializer(prescriptions, many=True)

        # 6. Add the prescription data to the main response
        data['prescriptions'] = prescription_serializer.data

        # 7. Return the combined data
        return response.Response(data)
class PublicDoctorListView(generics.ListAPIView):
    """
    Provides a public, searchable list of all doctors.
    A patient can use this to find a doctor to book.
    Supports search by specialization or name.
    e.g., /api/booking/doctors/?search=cardiology
    """
    queryset = DoctorProfile.objects.select_related('user', 'hospital').all()
    serializer_class = PublicDoctorSerializer
    permission_classes = [permissions.IsAuthenticated] # Any logged-in user can see doctors
    filter_backends = [SearchFilter]
    search_fields = ['specialization', 'user__first_name', 'user__last_name']


class PublicHospitalListView(generics.ListAPIView):
    """
    Provides a public, searchable list of all hospitals.
    A patient can use this to find lab tests, etc.
    e.g., /api/booking/hospitals/?search=apollo
    """
    queryset = Hospital.objects.all()
    serializer_class = PublicHospitalSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [SearchFilter]
    search_fields = ['name', 'address']

# --- View for Creating a Booking (Step 2B) ---

class AppointmentCreateView(generics.CreateAPIView):
    """
    Endpoint for a logged-in patient to create (POST) a new appointment.
    """
    serializer_class = AppointmentCreateSerializer
    permission_classes = [permissions.IsAuthenticated, IsPatientUser]

    def perform_create(self, serializer):
        """
        This method automatically sets the 'patient' to the logged-in user
        and sets the 'status' to 'pending'.
        """
        serializer.save(
            patient=self.request.user.patientprofile,
            status='pending' #
        )
        
        # You could also add logic here to create a notification
        # for the doctor using the create_notification util