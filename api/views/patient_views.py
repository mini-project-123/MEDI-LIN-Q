# api/views/patient_views.py

from rest_framework import generics, permissions, views, response
# --- 1. ADD THIS IMPORT ---
from rest_framework.parsers import MultiPartParser, FormParser 
from api.serializers.patient_serializers import PatientProfileSerializer, PatientDetailSerializer, SimplePrescriptionSerializer, AppointmentCancelSerializer
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
    """
    serializer_class = PatientProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsPatientUser]
    
    # --- 2. ADD THIS LINE ---
    # This tells the view how to handle FormData and file uploads
    parser_classes = [MultiPartParser, FormParser] 

    def perform_create(self, serializer):
        # We pass the user object from the request into the serializer
        serializer.save(user=self.request.user)


# --- This is the main Patient Dashboard View ---
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
    
    # --- 3. ADD PARSERS HERE TOO ---
    # This allows the "Settings" page to also update the profile photo
    parser_classes = [MultiPartParser, FormParser]

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
        dashboard data.
        """
        instance = self.get_object() 
        serializer = self.get_serializer(instance)
        data = serializer.data

        # Manually fetch all appointments for this specific patient
        patient_appointments = Appointment.objects.filter(patient=instance)

        # Fetch all prescriptions linked to those appointments
        prescriptions = Prescription.objects.filter(
            appointment__in=patient_appointments
        ).select_related('medication', 'appointment__doctor__user').order_by('-appointment__created_at') 

        # Serialize the prescriptions
        prescription_serializer = SimplePrescriptionSerializer(prescriptions, many=True)

        # Add the prescription data to the main response
        data['prescriptions'] = prescription_serializer.data

        return response.Response(data)


# --- Booking Views ---
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
            status='pending'
        )
        
class PatientAppointmentManageView(generics.UpdateAPIView):
    """
    Allow a patient to update (cancel) their own appointment.
    """
    serializer_class = AppointmentCancelSerializer
    permission_classes = [permissions.IsAuthenticated, IsPatientUser]

    def get_queryset(self):
        """
        A patient can only manage their own appointments.
        """
        return Appointment.objects.filter(patient=self.request.user.patientprofile)

    def perform_update(self, serializer):
        """
        When updating, only allow 'pending' or 'confirmed' appointments to be cancelled.
        """
        appointment = self.get_object()
        if appointment.status in ['completed']:
            # Use DRF's built-in validation error
            raise serializers.ValidationError("Cannot cancel a completed appointment.")
        serializer.save()