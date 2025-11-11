# api/views/patient_views.py

from rest_framework import generics, permissions, serializers
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import SearchFilter
from django.utils import timezone
from django.http import Http404

from django.utils import timezone
from django.http import Http404
from django.db import connection
from api.permissions import IsPatientUser
from api.models import (
    Appointment,
    Prescription,
    PatientProfile,
    Notification,
    DoctorProfile,
    Hospital,
)
from api.serializers.patient_serializers import (
    PatientProfileSerializer,
    PatientDetailSerializer,
    SimplePrescriptionSerializer,
    PublicDoctorSerializer,
    PublicHospitalSerializer,
    AppointmentCreateSerializer,
    PatientDashboardSerializer,
    AppointmentCancelSerializer,
)


# ---------------------------
# Patient profile (create)
# ---------------------------
class PatientProfileView(generics.CreateAPIView):
    """
    Step-2 profile completion endpoint (POST).
    Accepts multipart/form-data (photo upload).
    """
    serializer_class = PatientProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsPatientUser]
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# ---------------------------
# Patient dashboard (aggregated)
# ---------------------------
class PatientDashboardView(APIView):
    """
    Returns aggregated payload for the patient dashboard:
      - profile (may be null)
      - upcoming_appointments (next 5)
      - recent_appointments (last 5)
      - prescriptions
      - notifications
      - stats
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        today = timezone.now().date()

        # Profile (may be None)
        try:
            profile = user.patientprofile
        except PatientProfile.DoesNotExist:
            profile = None

        # Helper to run a simple SQL query and return dict rows
        def dict_fetchall(sql, params):
            with connection.cursor() as cursor:
                cursor.execute(sql, params)
                cols = [c[0] for c in cursor.description]
                return [dict(zip(cols, row)) for row in cursor.fetchall()]

        # Upcoming appointments (use the real DB column appointment_datetime)
        upcoming_sql = """
            SELECT id, custom_id, appointment_datetime, status, token_number,
                   hospital_id, doctor_id
            FROM api_appointment
            WHERE appointment_datetime::date >= %s
            AND patient_id = %s
            ORDER BY appointment_datetime ASC
            LIMIT 5
        """
        upcoming_rows = dict_fetchall(upcoming_sql, [today, user.id])

        # Recent appointments (before today)
        recent_sql = """
            SELECT id, custom_id, appointment_datetime, status, token_number,
                   hospital_id, doctor_id
            FROM api_appointment
            WHERE appointment_datetime::date < %s
            AND patient_id = %s
            ORDER BY appointment_datetime DESC
            LIMIT 5
        """
        recent_rows = dict_fetchall(recent_sql, [today, user.id])

        # Convert appointment_datetime to ISO strings (or split date/time if frontend expects)
        def normalize_appointment_row(r):
            dt = r.get('appointment_datetime')
            if isinstance(dt, datetime.datetime):
                r['appointment_datetime'] = dt.isoformat()
                r['appointment_date'] = dt.date().isoformat()
                r['appointment_time'] = dt.time().isoformat()
            else:
                # fallback - keep as-is
                r['appointment_datetime'] = str(dt)
            # Optionally resolve doctor/hospital names (try to fetch minimally)
            try:
                hosp = Hospital.objects.filter(id=r.get('hospital_id')).values('id','name').first()
                r['hospital'] = hosp or None
            except Exception:
                r['hospital'] = None
            try:
                doc = DoctorProfile.objects.select_related('user').filter(user_id=r.get('doctor_id')).values('user__first_name','user__last_name','user_id').first()
                if doc:
                    r['doctor'] = {
                        'id': doc.get('user_id'),
                        'name': f"Dr. {doc.get('user__first_name') or ''} {doc.get('user__last_name') or ''}".strip()
                    }
                else:
                    r['doctor'] = None
            except Exception:
                r['doctor'] = None
            # Remove internal fk ids if you want
            r.pop('hospital_id', None)
            r.pop('doctor_id', None)
            return r

        upcoming_list = [normalize_appointment_row(r) for r in upcoming_rows]
        recent_list = [normalize_appointment_row(r) for r in recent_rows]

        # Prescriptions (using ORM/serializer as before)
        prescriptions_qs = (
            Prescription.objects.filter(appointment__patient__user=user)
            .select_related('medication', 'appointment__doctor__user')
            .order_by('-created_at')[:10]
        )

        # Notifications
        notifications_qs = Notification.objects.filter(user=user).order_by('-created_at')[:10]

        stats = {
            'total_appointments': Appointment.objects.filter(patient__user=user).count(),
            'upcoming_appointments': len(upcoming_list),
            'unread_notifications': Notification.objects.filter(user=user, is_read=False).count(),
        }

        payload = {
            'profile': profile,
            'upcoming_appointments': upcoming_list,
            'recent_appointments': recent_list,
            'prescriptions': prescriptions_qs,
            'notifications': notifications_qs,
            'stats': stats,
        }

        serializer = PatientDashboardSerializer(payload, context={'request': request})
        return Response(serializer.data)


# ---------------------------
# Booking / Public lists
# ---------------------------
class PublicDoctorListView(generics.ListAPIView):
    """
    Searchable public list of doctors (for patients).
    """
    queryset = DoctorProfile.objects.select_related('user', 'hospital').all()
    serializer_class = PublicDoctorSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [SearchFilter]
    search_fields = ['specialization', 'user__first_name', 'user__last_name']


class PublicHospitalListView(generics.ListAPIView):
    """
    Searchable public list of hospitals (for patients).
    """
    queryset = Hospital.objects.all()
    serializer_class = PublicHospitalSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [SearchFilter]
    search_fields = ['name', 'address']


# ---------------------------
# Create appointment (patient)
# ---------------------------
class AppointmentCreateView(generics.CreateAPIView):
    """
    Endpoint for a logged-in patient to create an appointment.
    """
    serializer_class = AppointmentCreateSerializer
    permission_classes = [permissions.IsAuthenticated, IsPatientUser]

    def perform_create(self, serializer):
        serializer.save(
            patient=self.request.user.patientprofile,
            status='pending'
        )


# ---------------------------
# Manage appointment (cancel)
# ---------------------------
class PatientAppointmentManageView(generics.UpdateAPIView):
    """
    Allow a patient to update/cancel their own appointment.
    """
    serializer_class = AppointmentCancelSerializer
    permission_classes = [permissions.IsAuthenticated, IsPatientUser]

    def get_queryset(self):
        return Appointment.objects.filter(patient=self.request.user.patientprofile)

    def perform_update(self, serializer):
        appointment = self.get_object()
        # Prevent cancelling completed appointments
        if appointment.status in ['completed']:
            raise serializers.ValidationError("Cannot cancel a completed appointment.")
        serializer.save()
