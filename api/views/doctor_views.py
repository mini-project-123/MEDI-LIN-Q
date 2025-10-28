
from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Q, Count
from datetime import datetime, timedelta
import pandas as pd
from django.conf import settings
import google.generativeai as genai
import joblib
from api.permissions import IsDoctorUser
from api.models import Appointment, PatientProfile, User, DoctorProfile, Prescription, Medication 
from api.serializers.doctor_serializers import DoctorProfileSerializer, NextAppointmentSerializer, DoctorAppointmentSerializer
from api.serializers.patient_serializers import (
    PatientListSerializer,
    PatientDetailSerializer,
    SimplePrescriptionSerializer 
)

# --- Profile Creation View (Step 2 Registration) ---
class DoctorProfileView(generics.CreateAPIView):
    """
    API view for a logged-in doctor to create their detailed profile.
    """
    serializer_class = DoctorProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsDoctorUser]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# --- Dashboard Summary View ---
class DoctorDashboardSummaryView(APIView):
    """
    Provides all the summary data needed for the doctor's main dashboard landing page.
    """
    permission_classes = [permissions.IsAuthenticated, IsDoctorUser]

    def get(self, request, *args, **kwargs):
        # ... (Keep existing dashboard summary logic) ...
        try:
            doctor = request.user.doctorprofile
        except DoctorProfile.DoesNotExist:
             return Response({"error": "Doctor profile not found."}, status=400)

        now = timezone.now()
        today = now.date()
        this_month = today.month
        this_year = today.year

        # Next Appointment
        next_appointment_obj = Appointment.objects.filter(
            doctor=doctor,
            appointment_datetime__gte=now,
            status='confirmed'
        ).order_by('appointment_datetime').first()
        next_appointment_data = NextAppointmentSerializer(next_appointment_obj).data if next_appointment_obj else None

        # Total Patients
        total_patients = PatientProfile.objects.filter(appointments__doctor=doctor).distinct().count()

        # This Month (New Patients)
        new_patients = PatientProfile.objects.filter(
            appointments__doctor=doctor,
            user__date_joined__month=this_month,
            user__date_joined__year=this_year
        ).distinct().count()

        # Today's Appointments
        todays_appointments = Appointment.objects.filter(
            doctor=doctor,
            appointment_datetime__date=today
        ).count()

        # Get all unique patients associated with this doctor
        all_patients_qs = PatientProfile.objects.filter(appointments__doctor=doctor).select_related('user').distinct()
        patient_data_list = [{'gender': p.user.gender, 'age': p.user.age} for p in all_patients_qs]

        if patient_data_list:
            df = pd.DataFrame(patient_data_list)
            gender_distribution = df['gender'].value_counts().to_dict()
            age_data = df['age'].dropna()
            age_bins = [0, 18, 35, 50, 65, 100]
            age_labels = ['0-18', '19-35', '36-50', '51-65', '65+']
            if not age_data.empty:
                 age_groups = pd.cut(age_data, bins=age_bins, labels=age_labels, right=True, include_lowest=True)
                 age_group_distribution = age_groups.value_counts().sort_index().to_dict()
            else:
                 age_group_distribution = {label: 0 for label in age_labels}
        else:
            gender_distribution = {}
            age_labels = ['0-18', '19-35', '36-50', '51-65', '65+']
            age_group_distribution = {label: 0 for label in age_labels}

        response_data = {
            'stat_cards': {
                'next_appointment': next_appointment_data,
                'total_patients': total_patients,
                'new_patients_this_month': new_patients,
                'todays_appointments_count': todays_appointments,
            },
            'visualizations': {
                'gender_distribution': gender_distribution,
                'age_group_distribution': age_group_distribution
            }
        }
        return Response(response_data)


# --- Patient List View (for Doctor) ---
class DoctorPatientListView(generics.ListAPIView):
    """
    Lists patients associated with the logged-in doctor.
    Supports searching by name or custom ID and filtering by visit date.
    """
    serializer_class = PatientListSerializer
    permission_classes = [permissions.IsAuthenticated, IsDoctorUser]

    def get_queryset(self):
        # ... (Keep existing queryset logic with search and filter) ...
        try:
            doctor = self.request.user.doctorprofile
        except DoctorProfile.DoesNotExist:
             return PatientProfile.objects.none()
        queryset = PatientProfile.objects.filter(appointments__doctor=doctor).distinct()
        search_query = self.request.query_params.get('search', None)
        if search_query:
            queryset = queryset.filter(
                Q(user__first_name__icontains=search_query) |
                Q(user__last_name__icontains=search_query) |
                Q(user__custom_id__icontains=search_query)
            ).distinct()
        visited_filter = self.request.query_params.get('visited', None)
        visit_date_str = self.request.query_params.get('visit_date', None)
        if visited_filter:
            today = timezone.now().date()
            if visited_filter == 'today':
                queryset = queryset.filter(appointments__appointment_datetime__date=today).distinct()
            elif visited_filter == 'yesterday':
                yesterday = today - timedelta(days=1)
                queryset = queryset.filter(appointments__appointment_datetime__date=yesterday).distinct()
            elif visited_filter == 'this_month':
                queryset = queryset.filter(
                    appointments__appointment_datetime__year=today.year,
                    appointments__appointment_datetime__month=today.month
                ).distinct()
        elif visit_date_str:
            try:
                specific_date = datetime.strptime(visit_date_str, '%Y-%m-%d').date()
                queryset = queryset.filter(appointments__appointment_datetime__date=specific_date).distinct()
            except ValueError:
                pass
        queryset = queryset.order_by('user__last_name', 'user__first_name')
        return queryset


# --- Patient Detail View (for Doctor) - UPDATED with Prescriptions ---
class PatientDetailForDoctorView(generics.RetrieveAPIView):
    """
    Retrieves the detailed profile and history for a specific patient,
    accessible only by doctors who have treated this patient.
    Includes manually fetched prescriptions.
    """
    serializer_class = PatientDetailSerializer
    permission_classes = [permissions.IsAuthenticated, IsDoctorUser]
    lookup_field = 'pk' # Expects patient's User ID (pk) in the URL

    def get_queryset(self):
        """
        Ensure the doctor can only view patients they are associated with.
        """
        try:
            doctor = self.request.user.doctorprofile
        except DoctorProfile.DoesNotExist:
            return PatientProfile.objects.none()

        # Ensure doctor is associated via appointments before allowing detail view
        return PatientProfile.objects.filter(appointments__doctor=doctor).distinct()

    # --- Override retrieve method to add prescriptions ---
    def retrieve(self, request, *args, **kwargs):
        # 1. Get the patient profile object
        instance = self.get_object() # Uses get_queryset() and the pk from URL

        # 2. Get the standard serialized data (details, appointments, reports)
        serializer = self.get_serializer(instance)
        data = serializer.data

        # 3. Manually fetch all appointments for this specific patient profile
        #    We use 'instance' which is the PatientProfile object
        patient_appointments = Appointment.objects.filter(patient=instance)

        # 4. Fetch all prescriptions linked to those specific appointments
        prescriptions = Prescription.objects.filter(
            appointment__in=patient_appointments
        ).select_related('medication').order_by('-appointment__appointment_datetime')
        # select_related('medication') helps optimize the query for medication names

        # 5. Serialize the prescriptions using the specific serializer
        prescription_serializer = SimplePrescriptionSerializer(prescriptions, many=True)

        # 6. Add the serialized prescription data to the main response dictionary
        data['prescriptions'] = prescription_serializer.data

        # 7. Return the combined data
        return Response(data)
    

# --- Patient AI Summary (for Doctor) ---
class PatientSummaryAIView(generics.RetrieveAPIView):
    """
    Uses a generative AI to create a summary of a patient's medical history.
    """
    permission_classes = [permissions.IsAuthenticated, IsDoctorUser]
    queryset = PatientProfile.objects.all()
    lookup_field = 'pk' # The patient ID from the URL

    # Configure the Google AI client
    try:
        genai.configure(api_key=settings.GOOGLE_API_KEY)
        model = genai.GenerativeModel('gemini-pro-latest')
        print("Gemini AI model loaded successfully.")
    except Exception as e:
        print(f"Error configuring Google AI: {e}")
        model = None

    def retrieve(self, request, *args, **kwargs):
        if not self.model:
            return Response(
                {"error": "AI model is not configured. Check API key."}, 
                status=500
            )

        # 1. Get the patient object
        patient = self.get_object()

        # 2. Consolidate all text data for the patient
        history_texts = []
        history_texts.append(f"Patient Name: {patient.user.first_name} {patient.user.last_name}")
        history_texts.append(f"Age: {patient.user.age}")
        history_texts.append(f"Gender: {patient.user.gender}")
        if patient.allergies:
            history_texts.append(f"Known Allergies: {patient.allergies}")

        # Get all reports
        for report in patient.medical_reports.all():
            history_texts.append(
                f"Report from {report.created_at.date()}: "
                f"Type: {report.report_type}, Description: {report.description}"
            )
            
        # Get all prescriptions
        # Note: This is the same query from our last step!
        patient_appointments = Appointment.objects.filter(patient=patient)
        prescriptions = Prescription.objects.filter(appointment__in=patient_appointments)
        for pres in prescriptions:
            history_texts.append(
                f"Prescription from {pres.appointment.appointment_datetime.date()}: "
                f"{pres.medication.name} ({pres.dosage}, {pres.frequency} for {pres.duration}). "
                f"Notes: {pres.notes}"
            )

        # Combine all text into one block
        full_medical_history = "\n".join(history_texts)
        
        # 3. Create a prompt for the AI
        prompt = f"""
        You are a helpful medical assistant. Based on the following patient data,
        provide a concise, bulleted summary of the patient's key medical history.
        Focus on chronic conditions, major events, and active prescriptions.
        Use markdown for formatting.

        Patient Data:
        ---
        {full_medical_history}
        ---

        Summary:
        """

        # 4. Make the API call to the LLM
        try:
            response = self.model.generate_content(prompt)
            summary_text = response.text
        except Exception as e:
            return Response({"error": f"AI generation failed: {str(e)}"}, status=500)

        # 5. Return the summary to the frontend
        return Response({"summary": summary_text})
    

class DoctorAppointmentListView(generics.ListAPIView):
    """
    Provides a list of all appointments (past and future)
    for the currently logged-in doctor.
    
    Supports filtering via query parameters:
    - ?status=pending
    - ?date=YYYY-MM-DD
    - ?time_start=HH:MM&time_end=HH:MM (24-hour format)
    """
    serializer_class = DoctorAppointmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsDoctorUser]

    def get_queryset(self):
        """
        This method is the core of the feature.
        It filters the appointments based on the logged-in user
        AND any query parameters provided in the URL.
        """
        # 1. Get the logged-in doctor's profile
        try:
            doctor = self.request.user.doctorprofile
        except DoctorProfile.DoesNotExist:
            return Appointment.objects.none() # Return an empty list if no doctor profile

        # 2. Start with the base query: all appointments for this doctor
        queryset = Appointment.objects.filter(doctor=doctor)

        # 3. --- Apply Status Filter ---
        status = self.request.query_params.get('status', None)
        if status:
            # Filter the queryset based on the 'status' parameter
            queryset = queryset.filter(status=status)

        # 4. --- Apply Specific Date Filter ---
        date_str = self.request.query_params.get('date', None)
        if date_str:
            try:
                # Convert the date string (YYYY-MM-DD) into a date object
                filter_date = datetime.strptime(date_str, '%Y-%m-%d').date()
                # Filter appointments that fall on that specific date
                queryset = queryset.filter(appointment_datetime__date=filter_date)
            except ValueError:
                # If the date format is wrong, just ignore the filter
                pass 

        # 5. --- Apply Time Slot Filter ---
        time_start_str = self.request.query_params.get('time_start', None)
        time_end_str = self.request.query_params.get('time_end', None)
        if time_start_str and time_end_str:
            try:
                # Convert time strings (HH:MM) into time objects
                start_time = datetime.strptime(time_start_str, '%H:%M').time()
                end_time = datetime.strptime(time_end_str, '%H:%M').time()
                # Filter appointments where the time is between start and end
                queryset = queryset.filter(appointment_datetime__time__gte=start_time,
                                           appointment_datetime__time__lt=end_time)
            except ValueError:
                # If time format is wrong, ignore the filter
                pass

        # 6. Order the final, filtered list
        queryset = queryset.order_by('appointment_datetime')
        
        return queryset


class DoctorProfileManageView(generics.RetrieveUpdateDestroyAPIView):
    """
    Handles GET, PATCH, and DELETE requests for the logged-in doctor's
    own DoctorProfile.
    """
    serializer_class = DoctorProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsDoctorUser]

    def get_object(self):
        """
        This is the key. Instead of getting a PK from the URL,
        we return the profile linked to the logged-in user.
        """
        try:
            # Return the profile associated with the user making the request
            return self.request.user.doctorprofile
        except DoctorProfile.DoesNotExist:
            # This should ideally not happen if they completed step 2 reg
            return None

