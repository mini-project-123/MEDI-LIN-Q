from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from api.permissions import IsDoctorUser
from api.models import Appointment, PatientProfile
from .serializers import NextAppointmentSerializer
from django.utils import timezone
from django.db.models import Count
from datetime import datetime
import pandas as pd

class DoctorProfileView(generics.CreateAPIView):
    
    serializer_class = DoctorProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsDoctorUser]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class DoctorDashboardSummaryView(APIView):
    """
    Provides all the summary data needed for the doctor's main dashboard.
    """
    permission_classes = [permissions.IsAuthenticated, IsDoctorUser]

    def get(self, request, *args, **kwargs):
        # 1. Get the logged-in doctor
        doctor = request.user.doctorprofile
        today = timezone.now().date()
        this_month = today.month
        this_year = today.year

        # --- 2. Calculate the Stat Cards ---

        # Next Appointment
        next_appointment_obj = Appointment.objects.filter(
            doctor=doctor, 
            appointment_datetime__gte=timezone.now(), 
            status='confirmed'
        ).order_by('appointment_datetime').first()
        next_appointment_data = NextAppointmentSerializer(next_appointment_obj).data if next_appointment_obj else None

        # Total Patients
        total_patients = PatientProfile.objects.filter(appointments__doctor=doctor).distinct().count()

        # This Month (New Patients)
        # Find patients whose *first ever* appointment with this doctor was this month
        new_patients = PatientProfile.objects.filter(
            appointments__doctor=doctor,
            user__date_joined__month=this_month,
            user__date_joined__year=this_year
        ).distinct().count() # This is a simple way; a more complex query could be more accurate

        # Today's Appointments
        todays_appointments = Appointment.objects.filter(
            doctor=doctor, 
            appointment_datetime__date=today
        ).count()

        # Active Cases
        active_cases = Appointment.objects.filter(
            doctor=doctor, 
            status='confirmed', 
            appointment_datetime__date__gte=today
        ).values('patient').distinct().count() # Counts patients with future confirmed appointments

        # --- 3. Calculate Data for Visualizations (using Pandas) ---

        # Get all unique patients for this doctor
        all_patients = PatientProfile.objects.filter(appointments__doctor=doctor).distinct()

        # Patient Gender Distribution
        gender_data = list(all_patients.values_list('user__gender', flat=True))
        gender_distribution = pd.Series(gender_data).value_counts().to_dict() # e.g., {'male': 45, 'female': 55}

        # Patients by Age Group
        age_data = [patient.user.age for patient in all_patients if patient.user.age is not None]
        age_bins = [0, 18, 35, 50, 65, 100]
        age_labels = ['0-18', '19-35', '36-50', '51-65', '65+']
        age_groups = pd.cut(age_data, bins=age_bins, labels=age_labels, right=True)
        age_group_distribution = age_groups.value_counts().sort_index().to_dict() # e.g., {'0-18': 10, ...}

        # --- 4. Assemble the Final JSON Response ---

        response_data = {
            'stat_cards': {
                'next_appointment': next_appointment_data,
                'total_patients': total_patients,
                'new_patients_this_month': new_patients,
                'todays_appointments_count': todays_appointments,
                'active_cases_count': active_cases
            },
            'visualizations': {
                'gender_distribution': gender_distribution,
                'age_group_distribution': age_group_distribution
            }
        }

        return Response(response_data)

# All future doctor dashboard views (like listing appointments) will go here.