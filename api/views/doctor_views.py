# api/views/doctor_views.py

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
from django.http import Http404 

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
    This view now updates the User model with fields from the Complete Profile form.
    """
    serializer_class = DoctorProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsDoctorUser]
    
    def perform_create(self, serializer):
        # Get the user object from the request
        user = self.request.user
        
        # Get the raw form data from the request
        data = self.request.data 

        # --- Update User model fields from the Complete Profile form ---
        user.first_name = data.get('first_name', user.first_name)
        user.last_name = data.get('last_name', user.last_name)
        
        # Update email/username only if provided
        if data.get('email'):
            user.email = data.get('email')
            user.username = data.get('email')
            
        user.gender = data.get('gender', user.gender)
        user.contact_no = data.get('contact_no', user.contact_no)
        user.date_of_birth = data.get('date_of_birth', user.date_of_birth)
        user.address = data.get('address', user.address)
        
        # Save the updated User model
        user.save()
        
        # Save the DoctorProfile model (specialization, qualification, hospital ID, etc.)
        serializer.save(user=user)


# --- Dashboard Summary View ---
class DoctorDashboardSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsDoctorUser]

    def get(self, request, *args, **kwargs):
        try:
            doctor = request.user.doctorprofile
        except DoctorProfile.DoesNotExist:
             return Response({"error": "Doctor profile not found."}, status=400)

        now = timezone.now()
        today = now.date()
        this_month = today.month
        this_year = today.year

        next_appointment_obj = Appointment.objects.filter(
            doctor=doctor,
            appointment_datetime__gte=now,
            status='confirmed'
        ).order_by('appointment_datetime').first()
        next_appointment_data = NextAppointmentSerializer(next_appointment_obj).data if next_appointment_obj else None
        total_patients = PatientProfile.objects.filter(appointments__doctor=doctor).distinct().count()
        new_patients = PatientProfile.objects.filter(
            appointments__doctor=doctor,
            user__date_joined__month=this_month,
            user__date_joined__year=this_year
        ).distinct().count()
        todays_appointments = Appointment.objects.filter(
            doctor=doctor,
            appointment_datetime__date=today
        ).count()
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
    serializer_class = PatientListSerializer
    permission_classes = [permissions.IsAuthenticated, IsDoctorUser]

    def get_queryset(self):
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


# --- Patient Detail View (for Doctor) ---
class PatientDetailForDoctorView(generics.RetrieveAPIView):
    serializer_class = PatientDetailSerializer
    permission_classes = [permissions.IsAuthenticated, IsDoctorUser]
    lookup_field = 'pk' 

    def get_queryset(self):
        try:
            doctor = self.request.user.doctorprofile
        except DoctorProfile.DoesNotExist:
            return PatientProfile.objects.none()
        return PatientProfile.objects.filter(appointments__doctor=doctor).distinct()

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object() 
        serializer = self.get_serializer(instance)
        data = serializer.data
        patient_appointments = Appointment.objects.filter(patient=instance)
        prescriptions = Prescription.objects.filter(
            appointment__in=patient_appointments
        ).select_related('medication').order_by('-appointment__appointment_datetime')
        prescription_serializer = SimplePrescriptionSerializer(prescriptions, many=True)
        data['prescriptions'] = prescription_serializer.data
        return Response(data)
    

# --- Patient AI Summary (for Doctor) ---
class PatientSummaryAIView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated, IsDoctorUser]
    queryset = PatientProfile.objects.all()
    lookup_field = 'pk' 

    try:
        genai.configure(api_key=settings.GOOGLE_API_KEY)
        model = genai.GenerativeModel('gemini-pro-latest')
    except Exception as e:
        print(f"Error configuring Google AI: {e}")
        model = None

    def retrieve(self, request, *args, **kwargs):
        if not self.model:
            return Response(
                {"error": "AI model is not configured. Check API key."}, 
                status=500
            )
        patient = self.get_object()
        history_texts = []
        history_texts.append(f"Patient Name: {patient.user.first_name} {patient.user.last_name}")
        history_texts.append(f"Age: {patient.user.age}")
        history_texts.append(f"Gender: {patient.user.gender}")
        if patient.allergies:
            history_texts.append(f"Known Allergies: {patient.allergies}")
        for report in patient.medical_reports.all():
            history_texts.append(
                f"Report from {report.created_at.date()}: "
                f"Type: {report.report_type}, Description: {report.description}"
            )
        patient_appointments = Appointment.objects.filter(patient=patient)
        prescriptions = Prescription.objects.filter(appointment__in=patient_appointments)
        for pres in prescriptions:
            history_texts.append(
                f"Prescription from {pres.appointment.appointment_datetime.date()}: "
                f"{pres.medication.name} ({pres.dosage}, {pres.frequency} for {pres.duration}). "
                f"Notes: {pres.notes}"
            )

        full_medical_history = "\n".join(history_texts)
        
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
        try:
            response = self.model.generate_content(prompt)
            summary_text = response.text
        except Exception as e:
            return Response({"error": f"AI generation failed: {str(e)}"}, status=500)
        return Response({"summary": summary_text})
    

class DoctorAppointmentListView(generics.ListAPIView):
    serializer_class = DoctorAppointmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsDoctorUser]

    def get_queryset(self):
        try:
            doctor = self.request.user.doctorprofile
        except DoctorProfile.DoesNotExist:
            return Appointment.objects.none() 
        queryset = Appointment.objects.filter(doctor=doctor)
        status = self.request.query_params.get('status', None)
        if status:
            queryset = queryset.filter(status=status)
        date_str = self.request.query_params.get('date', None)
        if date_str:
            try:
                filter_date = datetime.strptime(date_str, '%Y-%m-%d').date()
                queryset = queryset.filter(appointment_datetime__date=filter_date)
            except ValueError:
                pass 
        time_start_str = self.request.query_params.get('time_start', None)
        time_end_str = self.request.query_params.get('time_end', None)
        if time_start_str and time_end_str:
            try:
                start_time = datetime.strptime(time_start_str, '%H:%M').time()
                end_time = datetime.strptime(time_end_str, '%H:%M').time()
                queryset = queryset.filter(appointment_datetime__time__gte=start_time,
                                           appointment_datetime__time__lt=end_time)
            except ValueError:
                pass
        queryset = queryset.order_by('appointment_datetime')
        return queryset


class DoctorProfileManageView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = DoctorProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsDoctorUser]

    def get_object(self):
        try:
            return self.request.user.doctorprofile
        except DoctorProfile.DoesNotExist:
            raise Http404("Doctor profile has not been created yet.")