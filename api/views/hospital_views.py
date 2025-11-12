# api/views/hospital_views.py

from rest_framework import generics, permissions, status, serializers
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Q, Count
from django.db.models.functions import TruncMonth
from datetime import datetime
from dateutil.relativedelta import relativedelta
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.parsers import MultiPartParser, FormParser

from api.serializers.hospital_serializers import (
    HospitalSerializer, 
    HospitalDoctorListSerializer,
    HospitalStaffListSerializer,
    HospitalWardSerializer,
    HospitalAppointmentListSerializer,
    StaffDetailSerializer,
    StaffCreateSerializer,
    HospitalPatientDetailSerializer,
    PatientCreateSerializer,
    HospitalMedicalReportSerializer
)

from api.serializers.patient_serializers import PatientListSerializer
from api.permissions import IsHospitalAdminUser
from api.models import (
    Hospital, Appointment, PatientProfile, 
    DoctorProfile, StaffProfile, Ward, Bed, User,
    MedicalReport
)


# Helper: Get Hospital for Logged-in Admin
def get_admin_hospital(request):
    user = request.user
    hospital = user.managed_hospitals.first()
    return hospital


# Create Hospital (Step 2 Registration)
class HospitalCreationView(generics.CreateAPIView):
    serializer_class = HospitalSerializer
    permission_classes = [permissions.IsAuthenticated, IsHospitalAdminUser]

    def perform_create(self, serializer):
        hospital = serializer.save()
        hospital.admins.add(self.request.user)


# View / Update Hospital Profile
class HospitalProfileManageView(generics.RetrieveUpdateAPIView):
    serializer_class = HospitalSerializer
    permission_classes = [permissions.IsAuthenticated, IsHospitalAdminUser]

    def get_object(self):
        return get_admin_hospital(self.request)


# Dashboard Summary
class HospitalDashboardSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsHospitalAdminUser]

    def get(self, request, *args, **kwargs):
        hospital = get_admin_hospital(request)
        if not hospital:
            return Response({"error": "No hospital associated with this admin."}, status=status.HTTP_404_NOT_FOUND)

        now = timezone.now()
        today = now.date()

        total_patients = PatientProfile.objects.filter(appointments__hospital=hospital).distinct().count()
        total_doctors = DoctorProfile.objects.filter(hospital=hospital).count()
        total_staff = StaffProfile.objects.filter(hospital=hospital).count()

        total_beds = Bed.objects.filter(ward__hospital=hospital).count()
        occupied_beds = Bed.objects.filter(ward__hospital=hospital, is_occupied=True).count()
        bed_occupancy_rate = round((occupied_beds / total_beds) * 100, 1) if total_beds > 0 else 0.0

        todays_appointments = Appointment.objects.filter(
            hospital=hospital,
            appointment_date=today,
            status='confirmed'
        ).select_related('patient__user', 'doctor__user').order_by('appointment_date')

        todays_appointments_data = HospitalAppointmentListSerializer(todays_appointments, many=True).data

        data = {
            'summary_cards': {
                'total_patients': total_patients,
                'total_doctors': total_doctors,
                'total_staff': total_staff,
                'bed_occupancy_rate': bed_occupancy_rate
            },
            'todays_appointments': todays_appointments_data
        }

        return Response(data)


# Doctor List
class HospitalDoctorListView(generics.ListAPIView):
    serializer_class = HospitalDoctorListSerializer
    permission_classes = [permissions.IsAuthenticated, IsHospitalAdminUser]
    filter_backends = [SearchFilter, DjangoFilterBackend]
    search_fields = ['user__first_name', 'user__last_name', 'user__custom_id', 'specialization']
    filterset_fields = ['specialization', 'experience_years']

    def get_queryset(self):
        hospital = get_admin_hospital(self.request)
        if not hospital:
            return DoctorProfile.objects.none()
        return DoctorProfile.objects.filter(hospital=hospital).select_related('user')


# Staff List
class HospitalStaffListView(generics.ListAPIView):
    serializer_class = HospitalStaffListSerializer
    permission_classes = [permissions.IsAuthenticated, IsHospitalAdminUser]
    filter_backends = [SearchFilter, DjangoFilterBackend]
    search_fields = ['user__first_name', 'user__last_name', 'user__custom_id', 'job_title']
    filterset_fields = ['job_title']

    def get_queryset(self):
        hospital = get_admin_hospital(self.request)
        if not hospital:
            return StaffProfile.objects.none()
        return StaffProfile.objects.filter(hospital=hospital).select_related('user')


# Patient List
class HospitalPatientListView(generics.ListAPIView):
    serializer_class = PatientListSerializer
    permission_classes = [permissions.IsAuthenticated, IsHospitalAdminUser]
    filter_backends = [SearchFilter, DjangoFilterBackend]
    search_fields = ['user__first_name', 'user__last_name', 'user__custom_id']

    def get_queryset(self):
        hospital = get_admin_hospital(self.request)
        if not hospital:
            return PatientProfile.objects.none()
        return PatientProfile.objects.filter(appointments__hospital=hospital).select_related('user').distinct()


# Ward List
class HospitalWardListView(generics.ListAPIView):
    serializer_class = HospitalWardSerializer
    permission_classes = [permissions.IsAuthenticated, IsHospitalAdminUser]

    def get_queryset(self):
        hospital = get_admin_hospital(self.request)
        if not hospital:
            return Ward.objects.none()

        # Ward model already has total_beds and occupied_beds fields
        # just filter by hospital and return
        return Ward.objects.filter(hospital=hospital)


# Appointment List
class HospitalAppointmentListView(generics.ListAPIView):
    serializer_class = HospitalAppointmentListSerializer
    permission_classes = [permissions.IsAuthenticated, IsHospitalAdminUser]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = {'status': ['exact'], 'appointment_date': ['exact']}
    search_fields = [
        'patient__user__first_name', 'patient__user__last_name', 'patient__user__custom_id',
        'doctor__user__first_name', 'doctor__user__last_name'
    ]

    def get_queryset(self):
        hospital = get_admin_hospital(self.request)
        if not hospital:
            return Appointment.objects.none()
        return Appointment.objects.filter(hospital=hospital).select_related('patient__user', 'doctor__user').order_by('-appointment_date')


# Analytics Dashboard
class HospitalAnalyticsView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsHospitalAdminUser]

    def get(self, request, *args, **kwargs):
        hospital = get_admin_hospital(request)
        if not hospital:
            return Response({"error": "No hospital associated."}, status=status.HTTP_404_NOT_FOUND)

        twelve_months_ago = timezone.now() - relativedelta(months=12)

        monthly_visits_data = Appointment.objects.filter(
            hospital=hospital, appointment_date__gte=twelve_months_ago
        ).annotate(month=TruncMonth('appointment_date')).values('month').annotate(visits=Count('id')).order_by('month')

        monthly_visits = {item['month'].strftime('%Y-%m-%d'): item['visits'] for item in monthly_visits_data}

        department_data = Appointment.objects.filter(hospital=hospital).values('doctor__specialization').annotate(appointment_count=Count('id')).order_by('-appointment_count')
        department_distribution = {item['doctor__specialization']: item['appointment_count'] for item in department_data if item['doctor__specialization']}

        # Ward model already has total_beds and occupied_beds as fields
        ward_data = Ward.objects.filter(hospital=hospital)

        department_bed_occupancy = []
        for ward in ward_data:
            occupancy_rate = round((ward.occupied_beds / ward.total_beds) * 100, 1) if ward.total_beds > 0 else 0.0
            department_bed_occupancy.append({
                "ward_name": ward.name,
                "total_beds": ward.total_beds,
                "occupied_beds": ward.occupied_beds,
                "occupancy_rate": occupancy_rate
            })

        data = {
            'monthly_visits': monthly_visits,
            'department_distribution': department_distribution,
            'department_bed_occupancy': department_bed_occupancy
        }

        return Response(data)


# Staff Create
class HospitalStaffCreateView(generics.CreateAPIView):
    serializer_class = StaffCreateSerializer
    permission_classes = [permissions.IsAuthenticated, IsHospitalAdminUser]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['hospital'] = get_admin_hospital(self.request)
        return context

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        staff_profile = serializer.save()
        return Response(StaffDetailSerializer(staff_profile).data, status=status.HTTP_201_CREATED)


# Staff Manage
class HospitalStaffManageView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = StaffDetailSerializer
    permission_classes = [permissions.IsAuthenticated, IsHospitalAdminUser]
    lookup_field = 'pk'

    def get_queryset(self):
        hospital = get_admin_hospital(self.request)
        if not hospital:
            return StaffProfile.objects.none()
        return StaffProfile.objects.filter(hospital=hospital)


# Create Patient
class HospitalPatientCreateView(generics.CreateAPIView):
    serializer_class = PatientCreateSerializer
    permission_classes = [permissions.IsAuthenticated, IsHospitalAdminUser]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        patient_profile = serializer.save()
        return Response(HospitalPatientDetailSerializer(patient_profile).data, status=status.HTTP_201_CREATED)


# Manage Patient
class HospitalPatientManageView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = HospitalPatientDetailSerializer
    permission_classes = [permissions.IsAuthenticated, IsHospitalAdminUser]
    lookup_field = 'pk'

    def get_queryset(self):
        return PatientProfile.objects.all().prefetch_related('appointments__doctor__user', 'medical_reports')


# Upload Medical Report
class HospitalPatientReportUploadView(generics.CreateAPIView):
    serializer_class = HospitalMedicalReportSerializer
    permission_classes = [permissions.IsAuthenticated, IsHospitalAdminUser]
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        patient_user_id = self.kwargs.get('pk')
        try:
            patient_profile = PatientProfile.objects.get(user_id=patient_user_id)
        except PatientProfile.DoesNotExist:
            raise serializers.ValidationError("Patient not found.")
        serializer.save(patient=patient_profile)
