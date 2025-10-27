# api/views/prescription_views.py

from rest_framework import generics, permissions, status
from api.permissions import IsDoctorUser
from rest_framework.views import APIView # <-- Import APIView
from rest_framework.response import Response # <-- Import Response
from api.models import Prescription, DoctorProfile
from api.serializers.patient_serializers import SimplePrescriptionSerializer, PrescriptionCreateSerializer

class DoctorPrescriptionListView(generics.ListAPIView):
    """
    Provides a complete history of all prescriptions written
    by the currently logged-in doctor.
    """
    serializer_class = SimplePrescriptionSerializer
    permission_classes = [permissions.IsAuthenticated, IsDoctorUser]

    def get_queryset(self):
        """
        This method filters prescriptions based on the logged-in doctor.
        """
        try:
            doctor = self.request.user.doctorprofile
        except DoctorProfile.DoesNotExist:
            return Prescription.objects.none() # Return empty if no doctor profile

        # Find all prescriptions linked to appointments where this doctor was the provider
        queryset = Prescription.objects.filter(
            appointment__doctor=doctor
        ).select_related(
            'appointment__patient__user', # Optimizes for patient name
            'medication'                  # Optimizes for medication name
        ).order_by('-appointment__appointment_datetime') # Show newest first

        return queryset
    


class PrescriptionCreateView(APIView):
    """
    Creates a new prescription.
    Supports a 'dry_run' check for drug interactions and allergies.
    """
    permission_classes = [permissions.IsAuthenticated, IsDoctorUser]

    def _run_prescription_checks(self, patient, new_medication):
        """
        A helper method to check for warnings.
        Returns a warning message string if a problem is found, or None if safe.
        """
        # --- Check 1: Allergies ---
        # A simple check: does the medication name appear in the patient's allergy list?
        if patient.allergies and new_medication.name.lower() in patient.allergies.lower():
            return f"Warning: Patient is allergic to '{new_medication.name}'."

        # --- Check 2: Drug Interactions (Simple Example) ---
        # Get other medications the patient is currently prescribed
        # (This logic is simplified. A real app would check active prescription dates)
        
        # For our prototype, let's create a hard-coded danger rule:
        # e.g., "Aspirin" and "Warfarin" should not be taken together.
        
        # Let's assume new_medication is Warfarin
        if 'warfarin' in new_medication.name.lower():
            # Now check if the patient is already taking Aspirin
            other_prescriptions = Prescription.objects.filter(
                appointment__patient=patient
            ).select_related('medication')
            
            for pres in other_prescriptions:
                if 'aspirin' in pres.medication.name.lower():
                    return "CRITICAL Warning: This patient is already prescribed Aspirin. " \
                           "Combining with Warfarin can cause major bleeding."
        
        # If all checks pass
        return None

    def post(self, request, *args, **kwargs):
        # 1. Validate the incoming data
        serializer = PrescriptionCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # 2. Get the validated data
        validated_data = serializer.validated_data
        dry_run = validated_data.pop('dry_run', True) # Get the dry_run flag

        # 3. Get the patient and medication objects
        appointment = validated_data.get('appointment')
        new_medication = validated_data.get('medication')
        patient = appointment.patient # Get the patient from the appointment

        # 4. Check if this is a "Dry Run" (the check)
        if dry_run:
            warning = self._run_prescription_checks(patient, new_medication)
            if warning:
                # Send the warning back to the frontend
                return Response({"safe": False, "warning": warning}, status=status.HTTP_200_OK)
            
            # If no warning, tell the frontend it's safe
            return Response({"safe": True, "warning": None}, status=status.HTTP_200_OK)

        # 5. If this is NOT a dry run (the "Continue Anyway" or "Save")
        # We skip the check and just create the object
        prescription = Prescription.objects.create(**validated_data)
        
        # Return the newly created prescription data
        return_serializer = SimplePrescriptionSerializer(prescription)
        return Response(return_serializer.data, status=status.HTTP_201_CREATED)