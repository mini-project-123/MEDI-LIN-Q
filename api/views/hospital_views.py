# api/views/hospital_views.py

from rest_framework import generics, permissions, status
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


# --- Helper Function ---
def get_admin_hospital(request):
    user = request.user
    hospital = user.hospitals_administered.first()
    return hospital

# === HospitalCreationView ===
class HospitalCreationView(generics.CreateAPIView):
    serializer_class = HospitalSerializer
    permission_classes = [permissions.IsAuthenticated, IsHospitalAdminUser]
    def perform_create(self, serializer):
        hospital = serializer.save(); hospital.admins.add(self.request.user)

# === HospitalProfileManageView ===
class HospitalProfileManageView(generics.RetrieveUpdateAPIView):
    serializer_class = HospitalSerializer
    permission_classes = [permissions.IsAuthenticated, IsHospitalAdminUser]
    def get_object(self):
        return get_admin_hospital(self.request)

# === HospitalDashboardSummaryView ===
class HospitalDashboardSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsHospitalAdminUser]
    def get(self, request, *args, **kwargs):
        hospital = get_admin_hospital(request)
        if not hospital:
            return Response({"error": "No hospital associated with this admin."}, status=status.HTTP_404_NOT_FOUND)
        now = timezone.now(); today = now.date()
        total_patients = PatientProfile.objects.filter(appointments__hospital=hospital).distinct().count()
        total_doctors = DoctorProfile.objects.filter(hospital=hospital).count()
        total_staff = StaffProfile.objects.filter(hospital=hospital).count()
        total_beds = Bed.objects.filter(ward__hospital=hospital).count()
        occupied_beds = Bed.objects.filter(ward__hospital=hospital, is_occupied=True).count()
        bed_occupancy_rate = 0.0
        if total_beds > 0:
            bed_occupancy_rate = round((occupied_beds / total_beds) * 100, 1)
        todays_appointments = Appointment.objects.filter(
            hospital=hospital, appointment_datetime__date=today, status='confirmed'
        ).select_related('patient__user', 'doctor__user').order_by('appointment_datetime')
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

# === HospitalDoctorListView ===
class HospitalDoctorListView(generics.ListAPIView):
    serializer_class = HospitalDoctorListSerializer
    permission_classes = [permissions.IsAuthenticated, IsHospitalAdminUser]
    filter_backends = [SearchFilter, DjangoFilterBackend]
    search_fields = ['user__first_name', 'user__last_name', 'user__custom_id', 'specialization']
    filterset_fields = ['specialization', 'experience_years']
    def get_queryset(self):
        hospital = get_admin_hospital(self.request);
        if not hospital: return DoctorProfile.objects.none()
        return DoctorProfile.objects.filter(hospital=hospital).select_related('user')

# === HospitalStaffListView ===
class HospitalStaffListView(generics.ListAPIView):
    serializer_class = HospitalStaffListSerializer
    permission_classes = [permissions.IsAuthenticated, IsHospitalAdminUser]
    filter_backends = [SearchFilter, DjangoFilterBackend]
    search_fields = ['user__first_name', 'user__last_name', 'user__custom_id', 'job_title']
    filterset_fields = ['job_title']
    def get_queryset(self):
        hospital = get_admin_hospital(self.request);
        if not hospital: return StaffProfile.objects.none()
        return StaffProfile.objects.filter(hospital=hospital).select_related('user')

# === HospitalPatientListView ===
class HospitalPatientListView(generics.ListAPIView):
    serializer_class = PatientListSerializer
    permission_classes = [permissions.IsAuthenticated, IsHospitalAdminUser]
    filter_backends = [SearchFilter, DjangoFilterBackend]
    search_fields = ['user__first_name', 'user__last_name', 'user__custom_id']
    filterset_fields = { 'appointments__appointment_datetime': ['date'] }
    def get_queryset(self):
        hospital = get_admin_hospital(self.request);
        if not hospital: return PatientProfile.objects.none()
        return PatientProfile.objects.filter(appointments__hospital=hospital).select_related('user').distinct()

# === HospitalWardListView ===
class HospitalWardListView(generics.ListAPIView):
    serializer_class = HospitalWardSerializer
    permission_classes = [permissions.IsAuthenticated, IsHospitalAdminUser]
    filter_backends = [SearchFilter]
    search_fields = ['name']
    def get_queryset(self):
        hospital = get_admin_hospital(self.request)
        if not hospital: return Ward.objects.none()
        queryset = Ward.objects.filter(hospital=hospital).annotate(
            total_beds=Count('beds'),
            occupied_beds=Count('beds', filter=Q(beds__is_occupied=True)),
            available_beds=Count('beds', filter=Q(beds__is_occupied=False))
        )
        return queryset

# === HospitalAppointmentListView ===
class HospitalAppointmentListView(generics.ListAPIView):
    serializer_class = HospitalAppointmentListSerializer
    permission_classes = [permissions.IsAuthenticated, IsHospitalAdminUser]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = { 'status': ['exact'], 'appointment_datetime': ['date'] }
    search_fields = [
        'patient__user__first_name', 'patient__user__last_name', 'patient__user__custom_id',
        'doctor__user__first_name', 'doctor__user__last_name'
    ]
    def get_queryset(self):
        hospital = get_admin_hospital(self.request)
        if not hospital: return Appointment.objects.none()
        return Appointment.objects.filter(hospital=hospital).select_related(
            'patient__user', 'doctor__user'
        ).order_by('-appointment_datetime')

# === HospitalAnalyticsView ===
class HospitalAnalyticsView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsHospitalAdminUser]
    def get(self, request, *args, **kwargs):
        hospital = get_admin_hospital(request)
        if not hospital:
            return Response({"error": "No hospital associated with this admin."}, status=status.HTTP_404_NOT_FOUND)
        twelve_months_ago = timezone.now() - relativedelta(months=12)
        monthly_visits_data = Appointment.objects.filter(
            hospital=hospital, appointment_datetime__gte=twelve_months_ago
        ).annotate(month=TruncMonth('appointment_datetime')).values('month').annotate(visits=Count('id')).order_by('month')
        monthly_visits = { item['month'].strftime('%Y-%m-%d'): item['visits'] for item in monthly_visits_data }
        department_data = Appointment.objects.filter(hospital=hospital).values('doctor__specialization').annotate(appointment_count=Count('id')).order_by('-appointment_count')
        department_distribution = { item['doctor__specialization']: item['appointment_count'] for item in department_data if item['doctor__specialization'] }
        ward_data = Ward.objects.filter(hospital=hospital).annotate(
            total_beds=Count('beds'), occupied_beds=Count('beds', filter=Q(beds__is_occupied=True))
        )
        department_bed_occupancy = []
        for ward in ward_data:
            occupancy_rate = 0.0
            if ward.total_beds > 0:
                occupancy_rate = round((ward.occupied_beds / ward.total_beds) * 100, 1)
            department_bed_occupancy.append({
                "ward_name": ward.name, "total_beds": ward.total_beds,
                "occupied_beds": ward.occupied_beds, "occupancy_rate": occupancy_rate
            })
        data = {
            'monthly_visits': monthly_visits,
            'department_distribution': department_distribution,
            'department_bed_occupancy': department_bed_occupancy
        }
        return Response(data)

# === HospitalStaffCreateView ===
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
        output_serializer = StaffDetailSerializer(staff_profile)
        headers = self.get_success_headers(output_serializer.data)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED, headers=headers)

# === HospitalStaffManageView ===
class HospitalStaffManageView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = StaffDetailSerializer
    permission_classes = [permissions.IsAuthenticated, IsHospitalAdminUser]
    lookup_field = 'pk' 
    def get_queryset(self):
        hospital = get_admin_hospital(self.request)
        if not hospital:
            return StaffProfile.objects.none()
        return StaffProfile.objects.filter(hospital=hospital)

# === HospitalPatientCreateView ===
class HospitalPatientCreateView(generics.CreateAPIView):
    serializer_class = PatientCreateSerializer
    permission_classes = [permissions.IsAuthenticated, IsHospitalAdminUser]
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        patient_profile = serializer.save()
        output_serializer = HospitalPatientDetailSerializer(patient_profile)
        headers = self.get_success_headers(output_serializer.data)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED, headers=headers)

# === MODIFIED VIEW: MANAGE PATIENT (GET/PATCH/DELETE) ===
class HospitalPatientManageView(generics.RetrieveUpdateDestroyAPIView):
    """
    Handles GET (retrieve), PATCH (update), and DELETE (destroy)
    for a single patient. This is for the "patient specific card" view.
    """
    serializer_class = HospitalPatientDetailSerializer
    permission_classes = [permissions.IsAuthenticated, IsHospitalAdminUser]
    lookup_field = 'pk' # Expects the Patient's User ID in the URL

    def get_queryset(self):
        # Admin can manage *any* patient profile.
        # We pre-fetch the appointments and reports for efficiency.
        # --- THIS IS THE NEW CODE ---
        return PatientProfile.objects.all().prefetch_related(
            'appointments__doctor__user',  # Further optimization
            'medical_reports'
        )
        # --- END OF NEW CODE ---

# === HospitalPatientReportUploadView ===
class HospitalPatientReportUploadView(generics.CreateAPIView):
    """
    Creates a new MedicalReport for a specific patient.
    This view expects 'multipart/form-data'
    """
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