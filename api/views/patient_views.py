# api/views/patient_views.py

from rest_framework import generics, permissions, serializers, status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import SearchFilter, OrderingFilter
from django.utils import timezone
from django.http import Http404
from rest_framework.pagination import PageNumberPagination

# --- FIX: These were missing from your file ---
from datetime import datetime
from django.db import connection 
# --- END OF FIX ---

from api.permissions import IsPatientUser
from api.models import (
    Appointment,
    Prescription,
    PatientProfile,
    Notification,
    DoctorProfile,
    Hospital,
    User, # Import User
    MedicalReport
)
from api.serializers.patient_serializers import (
    PatientProfileSerializer,
    PatientDetailSerializer,
    SimplePrescriptionSerializer,
    PublicDoctorSerializer,
    PublicHospitalSerializer,
    AppointmentCreateSerializer,
    PatientDashboardSerializer, # This is the serializer we are using
    PatientDashboardAppointmentSerializer,
    AppointmentCancelSerializer,
)


def build_fallback_report_summary(report):
    report_type = (report.report_type or 'medical report').strip()
    description = (report.description or '').strip()

    summary_parts = [
        f'This {report_type.lower()} has been uploaded successfully.',
    ]

    if description:
      summary_parts.append(
          'In simple words, the note says: ' + description[:260] + ('...' if len(description) > 260 else '')
      )
    else:
      summary_parts.append(
          'The report does not include a written description, so please use the report file itself and discuss the details with your doctor.'
      )

    summary_parts.append(
        'If anything is marked high, low, abnormal, or outside the usual range, follow up with your doctor for confirmation.'
    )
    return ' '.join(summary_parts)


def build_fallback_chat_response(message, context='general'):
    text = (message or '').lower()

    if any(keyword in text for keyword in ['report', 'summary', 'test result', 'lab result', 'uploaded report']):
        return (
            'From your uploaded report, focus on the values marked high, low, or abnormal. '
            'Those are the parts that usually need attention. If you want, I can also explain the report line by line in simple language.'
        )

    if any(keyword in text for keyword in ['fever', 'temperature', 'cold', 'cough']):
        return (
            'A fever or flu-like illness often improves with rest, fluids, and monitoring. '
            'If the fever is high, lasts more than a few days, or comes with breathing trouble, please see a doctor.'
        )

    if any(keyword in text for keyword in ['blood pressure', 'bp']):
        return (
            'Blood pressure is a measure of how hard your blood pushes against your arteries. '
            'If your reading stays high or low repeatedly, it is worth discussing with a doctor.'
        )

    if any(keyword in text for keyword in ['medicine', 'tablet', 'dose', 'dosage']):
        return (
            'Take medicine exactly as prescribed and do not change the dose on your own. '
            'If you miss a dose or feel side effects, check with your doctor or pharmacist.'
        )

    if context == 'medical_query':
        return (
            'In simple words, keep an eye on the symptoms, rest well, stay hydrated, and contact your doctor if the problem continues or gets worse.'
        )

    return (
        'Here is the simple version: watch the main findings, compare them with the normal range shown in the report, and ask your doctor if anything looks unusual.'
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

    def get_serializer_context(self):
        # Pass request to serializer context to get the user
        return {'request': self.request}

    # This was 'perform_create' in your file, but the serializer
    # now gets the user from context, so this is cleaner.
    # def perform_create(self, serializer):
    #    serializer.save(user=self.request.user)


# ---------------------------
# Patient dashboard (aggregated)
# ---------------------------
class PatientDashboardView(APIView):
    """
    Returns aggregated payload for the patient dashboard:
      - profile
      - upcoming_appointments (next 5)
      - recent_appointments (last 5)
      - prescriptions
      - notifications
      - stats
    """
    permission_classes = [IsAuthenticated, IsPatientUser] # Make sure user is a patient

    # --- THIS 'get' METHOD IS COMPLETELY REWRITTEN TO FIX THE 500 ERROR ---
    def get(self, request, *args, **kwargs):
        user = request.user
        today = timezone.now().date()

        # 1. Get Patient Profile
        try:
            profile = user.patientprofile
        except PatientProfile.DoesNotExist:
            profile = None

        # 2. Get Appointments using the ORM (replaces raw SQL)
        # We prefetch related data for the serializer
        base_appointments = Appointment.objects.filter(
            patient=profile
        ).select_related(
            'doctor__user', 
            'hospital'
        ).order_by('-created_at') # Order by creation date

        # Upcoming appointments (future appointments)
        upcoming_list = base_appointments.filter(
            appointment_date__gte=today
        )[:5] # Get next 5 upcoming

        # Recent appointments (past appointments)
        recent_list = base_appointments.filter(
            appointment_date__lt=today
        )[:5] # Get last 5 recent

        # 3. Get Prescriptions (this query was fine)
        prescriptions_qs = (
            Prescription.objects.filter(appointment__patient=profile)
            .select_related('medication', 'appointment__doctor__user')
            .order_by('-created_at')[:5] # Limit to 5 for the dashboard
        )

        # 4. Get Notifications (filter before slicing!)
        all_notifications_qs = Notification.objects.filter(user=user).order_by('-created_at')
        unread_count = all_notifications_qs.filter(is_read=False).count()
        notifications_qs = all_notifications_qs[:10]

        # 5. Get Stats (this logic was fine)
        stats = {
            'total_appointments': base_appointments.count(),
            'upcoming_appointments': upcoming_list.count(),
            'unread_notifications': unread_count,
        }

        # 6. Build the payload dictionary
        # The serializer expects QuerySets for these fields
        payload = {
            'profile': profile,
            'upcoming_appointments': upcoming_list,
            'recent_appointments': recent_list,
            'prescriptions': prescriptions_qs,
            'notifications': notifications_qs,
            'stats': stats,
        }

        # 7. Serialize the payload
        # The context is needed for SimplePatientProfileSerializer to get the request
        serializer = PatientDashboardSerializer(payload, context={'request': request})
        return Response(serializer.data)
    # --- END OF REWRITTEN 'get' METHOD ---


# ---------------------------
# Booking / Public lists
# ---------------------------
class PublicDoctorListView(generics.ListAPIView):
    """
    Searchable public list of doctors (for patients).
    """
    # --- FIX: Added 'user' to select_related ---
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
        try:
            patient_profile = self.request.user.patientprofile
        except PatientProfile.DoesNotExist:
            raise serializers.ValidationError("Patient profile does not exist.")
            
        serializer.save(
            patient=patient_profile,
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
        try:
            patient_profile = self.request.user.patientprofile
            return Appointment.objects.filter(patient=patient_profile)
        except PatientProfile.DoesNotExist:
            return Appointment.objects.none()

    def perform_update(self, serializer):
        appointment = self.get_object()
        # Prevent cancelling completed appointments
        if appointment.status in ['completed']:
            raise serializers.ValidationError("Cannot cancel a completed appointment.")
        serializer.save()


# =====================================================
# NEW ENDPOINTS FOR COMPLETE PATIENT DASHBOARD
# =====================================================

# ---------------------------
# Patient Profile Update
# ---------------------------
class PatientProfileUpdateView(generics.RetrieveUpdateAPIView):
    """
    GET/PATCH patient profile.
    Allows patients to view and update their complete profile.
    """
    serializer_class = PatientProfileSerializer
    permission_classes = [IsAuthenticated, IsPatientUser]
    parser_classes = [MultiPartParser, FormParser]

    def get_object(self):
        try:
            return self.request.user.patientprofile
        except PatientProfile.DoesNotExist:
            raise Http404("Patient profile does not exist.")


# ---------------------------
# Medical Reports
# ---------------------------
class PatientMedicalReportsView(generics.ListCreateAPIView):
    """
    GET: List all medical reports for the patient.
    POST: Upload a new medical report.
    """
    permission_classes = [IsAuthenticated, IsPatientUser]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        try:
            patient_profile = self.request.user.patientprofile
            return MedicalReport.objects.filter(patient=patient_profile).order_by('-created_at')
        except PatientProfile.DoesNotExist:
            return MedicalReport.objects.none()

    def get_serializer_class(self):
        from api.serializers.patient_serializers import SimpleMedicalReportSerializer
        return SimpleMedicalReportSerializer

    def list(self, request, *args, **kwargs):
        """Override list to return proper format"""
        try:
            patient_profile = request.user.patientprofile
            reports = MedicalReport.objects.filter(patient=patient_profile).order_by('-created_at')
            
            # Format reports for frontend
            data = []
            for report in reports:
                data.append({
                    'id': report.id,
                    'title': report.report_type or 'Medical Report',
                    'type': report.report_type or 'other',
                    'description': report.description or '',
                    'date': report.created_at.isoformat() if report.created_at else '',
                    'created_at': report.created_at.isoformat() if report.created_at else '',
                    'doctor_name': 'Hospital Admin',
                    'hospital_name': 'Hospital',
                    'file': report.report_file.url if report.report_file else None,
                    'file_name': report.report_file.name if report.report_file else None,
                })
            
            return Response(data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def perform_create(self, serializer):
        try:
            patient_profile = self.request.user.patientprofile
            serializer.save(patient=patient_profile)
        except PatientProfile.DoesNotExist:
            raise serializers.ValidationError("Patient profile does not exist.")


class PatientMedicalReportDetailView(generics.RetrieveDestroyAPIView):
    """
    GET: Retrieve a specific medical report.
    DELETE: Delete a medical report.
    """
    permission_classes = [IsAuthenticated, IsPatientUser]

    def get_queryset(self):
        try:
            patient_profile = self.request.user.patientprofile
            return MedicalReport.objects.filter(patient=patient_profile)
        except PatientProfile.DoesNotExist:
            return MedicalReport.objects.none()

    def get_serializer_class(self):
        from api.serializers.patient_serializers import SimpleMedicalReportSerializer
        return SimpleMedicalReportSerializer


# ---------------------------
# Appointment Details
# ---------------------------
class PatientAppointmentDetailView(generics.RetrieveAPIView):
    """
    GET: Retrieve detailed information about a specific appointment.
    """
    permission_classes = [IsAuthenticated, IsPatientUser]

    def get_queryset(self):
        try:
            patient_profile = self.request.user.patientprofile
            return Appointment.objects.filter(patient=patient_profile).select_related(
                'doctor__user', 'hospital', 'patient__user'
            )
        except PatientProfile.DoesNotExist:
            return Appointment.objects.none()

    def get_serializer_class(self):
        from api.serializers.patient_serializers import PatientAppointmentDetailSerializer
        return PatientAppointmentDetailSerializer


# ---------------------------
# All Appointments (with Pagination & Filtering)
# ---------------------------
class PatientAppointmentsHistoryView(generics.ListAPIView):
    """
    GET: List all patient appointments with filtering and pagination.
    Query params:
      - status: 'pending', 'confirmed', 'completed', 'cancelled'
      - type: appointment type filter
      - from_date: Filter from date (YYYY-MM-DD)
      - to_date: Filter to date (YYYY-MM-DD)
      - ordering: 'appointment_date' or '-appointment_date'
    """
    permission_classes = [IsAuthenticated, IsPatientUser]
    filter_backends = [SearchFilter, OrderingFilter]
    ordering_fields = ['appointment_date', 'created_at']
    ordering = ['-appointment_date']
    pagination_class = PageNumberPagination

    def get_queryset(self):
        try:
            patient_profile = self.request.user.patientprofile
            queryset = Appointment.objects.filter(
                patient=patient_profile
            ).select_related('doctor__user', 'hospital').order_by('-appointment_date')

            # Filter by status
            status_param = self.request.query_params.get('status')
            if status_param:
                queryset = queryset.filter(status=status_param)

            # Filter by appointment type
            type_param = self.request.query_params.get('type')
            if type_param:
                queryset = queryset.filter(appointment_type=type_param)

            # Filter by date range
            from_date = self.request.query_params.get('from_date')
            to_date = self.request.query_params.get('to_date')
            if from_date:
                queryset = queryset.filter(appointment_date__gte=from_date)
            if to_date:
                queryset = queryset.filter(appointment_date__lte=to_date)

            return queryset
        except PatientProfile.DoesNotExist:
            return Appointment.objects.none()

    def list(self, request, *args, **kwargs):
        """Override list to return proper format"""
        try:
            patient_profile = request.user.patientprofile
            queryset = self.get_queryset()
            
            # Format appointments for frontend
            data = []
            for appointment in queryset:
                data.append({
                    'id': appointment.id,
                    'custom_id': appointment.custom_id,
                    'status': appointment.status,
                    'appointment_date': str(appointment.appointment_date),
                    'appointment_time': str(appointment.appointment_time),
                    'appointment_type': appointment.appointment_type,
                    'token_number': appointment.token_number,
                    'doctor': {
                        'user_id': appointment.doctor.user_id,  # Use user_id, not id
                        'user': {
                            'first_name': appointment.doctor.user.first_name,
                            'last_name': appointment.doctor.user.last_name,
                        },
                        'specialization': appointment.doctor.specialization,
                    },
                    'hospital': {
                        'id': appointment.hospital.id if appointment.hospital else None,
                        'name': appointment.hospital.name if appointment.hospital else None,
                    }
                })
            
            return Response(data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ---------------------------
# Prescription Details & History
# ---------------------------
class PatientPrescriptionsView(generics.ListAPIView):
    """
    GET: List all patient prescriptions with filtering.
    Query params:
      - status: 'active', 'expired', 'completed'
      - medication: Search by medication name
      - ordering: '-created_at' (default) or 'created_at'
    """
    permission_classes = [IsAuthenticated, IsPatientUser]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['medication_name']
    ordering_fields = ['created_at', 'appointment__appointment_date']
    ordering = ['-created_at']
    pagination_class = PageNumberPagination

    def get_queryset(self):
        try:
            patient_profile = self.request.user.patientprofile
            queryset = Prescription.objects.filter(
                appointment__patient=patient_profile
            ).select_related('medication', 'appointment__doctor__user').order_by('-created_at')

            # Filter by status
            status_param = self.request.query_params.get('status')
            if status_param == 'active':
                # Active prescriptions are recent ones (within last 30 days)
                from datetime import timedelta
                cutoff_date = timezone.now() - timedelta(days=30)
                queryset = queryset.filter(created_at__gte=cutoff_date)
            elif status_param == 'expired':
                # Expired prescriptions
                from datetime import timedelta
                cutoff_date = timezone.now() - timedelta(days=30)
                queryset = queryset.filter(created_at__lt=cutoff_date)

            return queryset
        except PatientProfile.DoesNotExist:
            return Prescription.objects.none()

    def get_serializer_class(self):
        from api.serializers.patient_serializers import (
            SimplePrescriptionSerializer
        )
        return SimplePrescriptionSerializer


class PatientPrescriptionDetailView(generics.RetrieveAPIView):
    """
    GET: Retrieve detailed information about a specific prescription.
    """
    permission_classes = [IsAuthenticated, IsPatientUser]

    def get_queryset(self):
        try:
            patient_profile = self.request.user.patientprofile
            return Prescription.objects.filter(
                appointment__patient=patient_profile
            ).select_related('medication', 'appointment__doctor__user')
        except PatientProfile.DoesNotExist:
            return Prescription.objects.none()

    def get_serializer_class(self):
        from api.serializers.patient_serializers import SimplePrescriptionSerializer
        return SimplePrescriptionSerializer


# ---------------------------
# Notifications Management
# ---------------------------
class PatientNotificationsView(generics.ListAPIView):
    """
    GET: List all patient notifications with filtering.
    Query params:
      - is_read: 'true' or 'false' to filter by read status
      - ordering: '-created_at' (default)
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [OrderingFilter]
    ordering_fields = ['created_at']
    ordering = ['-created_at']
    pagination_class = PageNumberPagination

    def get_queryset(self):
        queryset = Notification.objects.filter(user=self.request.user)

        # Filter by read status
        is_read_param = self.request.query_params.get('is_read')
        if is_read_param:
            is_read = is_read_param.lower() == 'true'
            queryset = queryset.filter(is_read=is_read)

        return queryset

    def get_serializer_class(self):
        from api.serializers.patient_serializers import SimpleNotificationSerializer
        return SimpleNotificationSerializer


class PatientNotificationDetailView(generics.UpdateAPIView):
    """
    PATCH: Mark a notification as read or delete it.
    """
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        from api.serializers.patient_serializers import NotificationUpdateSerializer
        return NotificationUpdateSerializer


# ---------------------------
# Doctor Search with Advanced Filters
# ---------------------------
class PatientDoctorSearchView(generics.ListAPIView):
    """
    GET: Search and filter doctors with advanced options.
    Query params:
      - search: Search by name, specialization
      - specialization: Filter by exact specialization
      - hospital: Filter by hospital ID
      - experience_min: Minimum years of experience
      - experience_max: Maximum years of experience
    """
    serializer_class = PublicDoctorSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['specialization', 'user__first_name', 'user__last_name']
    ordering = ['user__first_name']

    def get_queryset(self):
        queryset = DoctorProfile.objects.select_related('user', 'hospital').all()

        # Filter by specialization
        specialization = self.request.query_params.get('specialization')
        if specialization:
            queryset = queryset.filter(specialization__icontains=specialization)

        # Filter by hospital
        hospital_id = self.request.query_params.get('hospital')
        if hospital_id:
            queryset = queryset.filter(hospital_id=hospital_id)

        # Filter by experience
        exp_min = self.request.query_params.get('experience_min')
        exp_max = self.request.query_params.get('experience_max')
        if exp_min:
            queryset = queryset.filter(experience_years__gte=int(exp_min))
        if exp_max:
            queryset = queryset.filter(experience_years__lte=int(exp_max))

        return queryset


# ---------------------------
# Health Analytics/Stats
# ---------------------------
class PatientHealthAnalyticsView(APIView):
    """
    GET: Returns comprehensive health analytics for the patient dashboard.
    Includes appointment statistics, prescription data, and health metrics.
    """
    permission_classes = [IsAuthenticated, IsPatientUser]

    def get(self, request, *args, **kwargs):
        try:
            user = request.user
            patient_profile = user.patientprofile
        except PatientProfile.DoesNotExist:
            return Response(
                {'error': 'Patient profile does not exist.'},
                status=status.HTTP_404_NOT_FOUND
            )

        now = timezone.now()
        thirty_days_ago = now - timezone.timedelta(days=30)
        ninety_days_ago = now - timezone.timedelta(days=90)
        one_year_ago = now - timezone.timedelta(days=365)

        # Appointment statistics
        total_appointments = Appointment.objects.filter(patient=patient_profile).count()
        upcoming_count = Appointment.objects.filter(
            patient=patient_profile,
            appointment_date__gte=now.date()
        ).count()
        completed_count = Appointment.objects.filter(
            patient=patient_profile,
            status='completed'
        ).count()
        cancelled_count = Appointment.objects.filter(
            patient=patient_profile,
            status='cancelled'
        ).count()

        # Appointments this month
        appointments_this_month = Appointment.objects.filter(
            patient=patient_profile,
            appointment_date__gte=thirty_days_ago.date()
        ).count()

        # Prescriptions statistics
        total_prescriptions = Prescription.objects.filter(
            appointment__patient=patient_profile
        ).count()
        active_prescriptions = Prescription.objects.filter(
            appointment__patient=patient_profile,
            created_at__gte=thirty_days_ago
        ).count()

        # Medical reports statistics
        total_reports = MedicalReport.objects.filter(patient=patient_profile).count()
        reports_this_year = MedicalReport.objects.filter(
            patient=patient_profile,
            created_at__gte=one_year_ago
        ).count()

        # Doctor visit diversity
        doctors_visited = Appointment.objects.filter(
            patient=patient_profile,
            status__in=['completed', 'confirmed']
        ).values('doctor').distinct().count()

        # Appointment trend (last 3 months)
        appointments_by_month = []
        for i in range(2, -1, -1):
            month_start = (now - timezone.timedelta(days=30*i)).replace(day=1)
            if i > 0:
                month_end = (now - timezone.timedelta(days=30*(i-1))).replace(day=1)
            else:
                month_end = now
            count = Appointment.objects.filter(
                patient=patient_profile,
                appointment_date__gte=month_start.date(),
                appointment_date__lt=month_end.date()
            ).count()
            appointments_by_month.append({
                'month': month_start.strftime('%B'),
                'count': count
            })

        analytics_data = {
            'appointments': {
                'total': total_appointments,
                'upcoming': upcoming_count,
                'completed': completed_count,
                'cancelled': cancelled_count,
                'this_month': appointments_this_month,
                'doctors_visited': doctors_visited,
            },
            'prescriptions': {
                'total': total_prescriptions,
                'active': active_prescriptions,
            },
            'medical_reports': {
                'total': total_reports,
                'this_year': reports_this_year,
            },
            'trends': {
                'appointments_last_3_months': appointments_by_month,
            },
            'profile': {
                'blood_group': patient_profile.blood_group or 'Not specified',
                'allergies': patient_profile.allergies or 'None',
                'emergency_contact': patient_profile.emergency_contact_no or 'Not specified',
            }
        }

        return Response(analytics_data)


# =====================================================
# AI REPORT SUMMARY VIEW
# =====================================================
class PatientReportAISummaryView(generics.RetrieveAPIView):
    """
    Generate AI summary of a medical report.
    Uses Google Generative AI to create concise summaries.
    """
    permission_classes = [permissions.IsAuthenticated, IsPatientUser]
    lookup_field = 'pk'
    lookup_url_kwarg = 'report_id'

    def get_queryset(self):
        try:
            patient_profile = self.request.user.patientprofile
            return MedicalReport.objects.filter(patient=patient_profile)
        except PatientProfile.DoesNotExist:
            return MedicalReport.objects.none()

    def _summarize_report(self, request, *args, **kwargs):
        report = self.get_object()
        
        try:
            import google.generativeai as genai
            from django.conf import settings
            
            # Configure AI
            genai.configure(api_key=settings.GOOGLE_API_KEY)
            model = genai.GenerativeModel('gemini-pro')
            
            # Create prompt with report data
            prompt = f"""
            Please provide a concise medical summary (2-3 sentences) of the following report:
            
            Report Type: {report.report_type}
            Description: {report.description}
            Date: {report.created_at.date()}
            
            Summary should be:
            - Easy to understand (non-technical language)
            - Highlight any important findings
            - Include recommendations if any
            """
            
            response = model.generate_content(prompt)
            ai_summary = response.text

            return Response({
                'report_id': report.id,
                'report_type': report.report_type,
                'report_date': report.created_at.date(),
                'ai_summary': ai_summary,
                'status': 'success'
            })
            
        except Exception as e:
            fallback_summary = build_fallback_report_summary(report)
            return Response({
                'report_id': report.id,
                'report_type': report.report_type,
                'report_date': report.created_at.date(),
                'ai_summary': fallback_summary,
                'status': 'fallback',
                'warning': f'AI summary fallback used: {str(e)}'
            })

    def retrieve(self, request, *args, **kwargs):
        return self._summarize_report(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        return self._summarize_report(request, *args, **kwargs)


# =====================================================
# AI CHATBOT VIEW
# =====================================================
class PatientAIChatbotView(APIView):
    """
    AI Chatbot endpoint for patient health queries.
    Provides health information and general guidance.
    """
    permission_classes = [permissions.IsAuthenticated, IsPatientUser]

    def post(self, request):
        """
        Accept patient question and provide AI-generated response.
        
        Request body:
        {
            "message": "What should I do for fever?",
            "context": "medical_query"  # medical_query, appointment, general
        }
        """
        try:
            message = request.data.get('message', '')
            context = request.data.get('context', 'general')
            
            if not message:
                return Response({
                    'error': 'Message is required',
                    'status': 'error'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get patient profile for context
            patient_profile = request.user.patientprofile
            
            ai_response = None

            try:
                import google.generativeai as genai
                from django.conf import settings

                api_key = getattr(settings, 'GOOGLE_API_KEY', None)
                if not api_key:
                    raise ValueError('Google AI key is not configured')

                genai.configure(api_key=api_key)
                model = genai.GenerativeModel('gemini-pro')

                if context == 'medical_query':
                    system_prompt = f"""You are a helpful health assistant. The user is a patient with:
- Blood Group: {patient_profile.blood_group or 'Not specified'}
- Allergies: {patient_profile.allergies or 'None'}

Provide helpful health information. IMPORTANT: Always recommend consulting with a doctor for serious concerns.
Keep response concise (2-3 sentences maximum)."""

                elif context == 'appointment':
                    system_prompt = """You are a helpful health scheduling assistant. Help users understand appointment process.
Keep response concise and friendly."""

                else:
                    system_prompt = """You are a helpful health information assistant. Provide general health guidance.
Keep response concise and clear."""

                full_prompt = f"{system_prompt}\n\nUser Question: {message}"
                response = model.generate_content(full_prompt)
                ai_response = response.text
            except Exception:
                ai_response = build_fallback_chat_response(message, context)
            
            return Response({
                'user_message': message,
                'ai_response': ai_response,
                'context': context,
                'status': 'success'
            })
            
        except Exception as e:
            return Response({
                'error': f'Chatbot error: {str(e)}',
                'status': 'error'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# =====================================================
# VERIFY APPOINTMENT DETAILS VIEW
# =====================================================
class PatientAppointmentVerifyView(generics.RetrieveAPIView):
    """
    Verify appointment details before confirming booking.
    Returns doctor info, hospital info, and appointment details.
    """
    permission_classes = [permissions.IsAuthenticated, IsPatientUser]
    lookup_field = 'pk'
    lookup_url_kwarg = 'appointment_id'

    def get_queryset(self):
        try:
            patient_profile = self.request.user.patientprofile
            return Appointment.objects.filter(patient=patient_profile)
        except PatientProfile.DoesNotExist:
            return Appointment.objects.none()

    def retrieve(self, request, *args, **kwargs):
        appointment = self.get_object()
        
        return Response({
            'appointment_id': appointment.id,
            'custom_id': appointment.custom_id,
            'status': appointment.status,
            'appointment_date': appointment.appointment_date,
            'appointment_time': appointment.appointment_time,
            'appointment_type': appointment.appointment_type,
            'token_number': appointment.token_number,
            'doctor': {
                'id': appointment.doctor.id,
                'name': f"{appointment.doctor.user.first_name} {appointment.doctor.user.last_name}",
                'specialization': appointment.doctor.specialization,
                'experience': appointment.doctor.experience_years,
                'phone': appointment.doctor.user.contact_no,
            },
            'hospital': {
                'id': appointment.hospital.id,
                'name': appointment.hospital.name,
                'address': appointment.hospital.address,
                'contact': appointment.hospital.contact_no1,
                'email': appointment.hospital.email,
            },
            'patient': {
                'name': f"{request.user.first_name} {request.user.last_name}",
                'email': request.user.email,
                'phone': request.user.contact_no,
            }
        })


# =====================================================
# NEW BOOKING WORKFLOW ENDPOINTS
# =====================================================

# ---------------------------
# Step 1: List All Hospitals
# ---------------------------
class PatientHospitalListView(generics.ListAPIView):
    """
    GET: List all available hospitals for appointment booking.
    First step in booking workflow.
    """
    queryset = Hospital.objects.all()
    serializer_class = PublicHospitalSerializer
    permission_classes = [IsAuthenticated, IsPatientUser]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name', 'address']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']


# ---------------------------
# Step 2: List Doctors by Hospital
# ---------------------------
class PatientDoctorsByHospitalView(generics.ListAPIView):
    """
    GET: List all doctors available in a specific hospital.
    Second step in booking workflow.
    Query parameter: hospital_id
    """
    serializer_class = PublicDoctorSerializer
    permission_classes = [IsAuthenticated, IsPatientUser]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['user__first_name', 'user__last_name', 'specialization']
    ordering_fields = ['specialization', 'experience_years']
    ordering = ['specialization']

    def get_queryset(self):
        hospital_id = self.request.query_params.get('hospital_id')
        if not hospital_id:
            return DoctorProfile.objects.none()
        
        return DoctorProfile.objects.filter(
            hospital_id=hospital_id
        ).select_related('user', 'hospital')


# ---------------------------
# Step 3: Get Doctor's Schedule
# ---------------------------
class PatientDoctorScheduleView(APIView):
    """
    GET: Get available appointment slots for a specific doctor.
    Third step in booking workflow.
    Query parameters: doctor_id, date (optional, defaults to today)
    """
    permission_classes = [IsAuthenticated, IsPatientUser]

    def get(self, request):
        doctor_id = request.query_params.get('doctor_id')
        date_str = request.query_params.get('date')

        if not doctor_id:
            return Response(
                {'error': 'doctor_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            doctor = DoctorProfile.objects.get(id=doctor_id)
        except DoctorProfile.DoesNotExist:
            return Response(
                {'error': 'Doctor not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Get appointments for the doctor on specified date
        if date_str:
            try:
                appointment_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            except ValueError:
                return Response(
                    {'error': 'Invalid date format. Use YYYY-MM-DD'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            appointment_date = timezone.now().date()

        # Get all appointments for this doctor on this date
        existing_appointments = Appointment.objects.filter(
            doctor=doctor,
            appointment_date=appointment_date
        ).values_list('appointment_time', flat=True)

        # Define available time slots (9 AM to 5 PM, 30-minute slots)
        available_slots = []
        start_hour = 9
        end_hour = 17
        slot_duration = 30  # minutes

        current_time = start_hour * 60
        end_time = end_hour * 60

        while current_time < end_time:
            hours = current_time // 60
            minutes = current_time % 60
            time_str = f"{hours:02d}:{minutes:02d}"
            
            # Check if slot is already booked
            from datetime import time as time_obj
            slot_time = time_obj(hours, minutes)
            
            if slot_time not in existing_appointments:
                available_slots.append(time_str)
            
            current_time += slot_duration

        return Response({
            'doctor_id': doctor.id,
            'doctor_name': f"{doctor.user.first_name} {doctor.user.last_name}",
            'specialization': doctor.specialization,
            'appointment_date': appointment_date,
            'available_slots': available_slots,
            'total_available': len(available_slots),
            'booked_count': existing_appointments.count()
        })


# ---------------------------
# Step 4: Book Appointment (Enhanced)
# ---------------------------
class PatientBookAppointmentView(APIView):
    """
    POST: Book an appointment with verification.
    Final step in booking workflow.
    Requires: doctor_id, hospital_id, appointment_date, appointment_time, appointment_type
    """
    permission_classes = [IsAuthenticated, IsPatientUser]

    def post(self, request):
        doctor_id = request.data.get('doctor_id')
        hospital_id = request.data.get('hospital_id')
        appointment_date = request.data.get('appointment_date')
        appointment_time = request.data.get('appointment_time')
        appointment_type = request.data.get('appointment_type', 'consultation')

        # Validate inputs
        if not all([doctor_id, hospital_id, appointment_date, appointment_time]):
            return Response(
                {'error': 'Missing required fields: doctor_id, hospital_id, appointment_date, appointment_time'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            doctor = DoctorProfile.objects.get(id=doctor_id)
            hospital = Hospital.objects.get(id=hospital_id)
            patient_profile = request.user.patientprofile
        except DoctorProfile.DoesNotExist:
            return Response({'error': 'Doctor not found'}, status=status.HTTP_404_NOT_FOUND)
        except Hospital.DoesNotExist:
            return Response({'error': 'Hospital not found'}, status=status.HTTP_404_NOT_FOUND)
        except PatientProfile.DoesNotExist:
            return Response({'error': 'Patient profile not found'}, status=status.HTTP_404_NOT_FOUND)

        # Verify date format and is future date
        try:
            appt_date = datetime.strptime(appointment_date, '%Y-%m-%d').date()
            if appt_date < timezone.now().date():
                return Response(
                    {'error': 'Cannot book appointment in the past'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except ValueError:
            return Response(
                {'error': 'Invalid date format. Use YYYY-MM-DD'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if slot is available
        try:
            appt_time = datetime.strptime(appointment_time, '%H:%M').time()
        except ValueError:
            return Response(
                {'error': 'Invalid time format. Use HH:MM'},
                status=status.HTTP_400_BAD_REQUEST
            )

        existing = Appointment.objects.filter(
            doctor=doctor,
            hospital=hospital,
            appointment_date=appt_date,
            appointment_time=appt_time
        ).exists()

        if existing:
            return Response(
                {'error': 'This time slot is already booked'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create appointment
        try:
            appointment = Appointment.objects.create(
                patient=patient_profile,
                doctor=doctor,
                hospital=hospital,
                appointment_date=appt_date,
                appointment_time=appt_time,
                appointment_type=appointment_type,
                status='scheduled'
            )

            # Generate confirmation code
            confirmation_code = f"APPT-{appointment.id}-{timezone.now().strftime('%Y%m%d')}"

            return Response({
                'success': True,
                'appointment_id': appointment.id,
                'custom_id': appointment.custom_id,
                'confirmation_code': confirmation_code,
                'message': 'Appointment booked successfully',
                'appointment': {
                    'doctor': f"{doctor.user.first_name} {doctor.user.last_name}",
                    'hospital': hospital.name,
                    'date': appointment_date,
                    'time': appointment_time,
                    'type': appointment_type,
                }
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {'error': f'Failed to book appointment: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# =====================================================
# SETTINGS & PRIVACY ENDPOINTS
# =====================================================

# ---------------------------
# Patient Settings/Profile Display
# ---------------------------
class PatientSettingsView(APIView):
    """
    GET: Retrieve patient settings and profile information taken during registration.
    PATCH: Update patient settings and profile.
    """
    permission_classes = [IsAuthenticated, IsPatientUser]

    def get(self, request):
        user = request.user
        
        try:
            patient_profile = user.patientprofile
        except PatientProfile.DoesNotExist:
            return Response(
                {'error': 'Patient profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        settings_data = {
            'user_info': {
                'id': user.id,
                'custom_id': user.custom_id,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email,
                'contact_no': user.contact_no,
                'gender': user.gender,
                'date_of_birth': user.date_of_birth,
                'age': user.age,
            },
            'profile_info': {
                'blood_group': patient_profile.blood_group,
                'allergies': patient_profile.allergies,
                'chronic_diseases': patient_profile.chronic_diseases,
                'height': patient_profile.height,
                'weight': patient_profile.weight,
                'photo': patient_profile.photo.url if patient_profile.photo else None,
            },
            'account_settings': {
                'created_at': user.created_at,
                'updated_at': user.updated_at,
                'is_active': user.is_active,
            }
        }

        return Response(settings_data)

    def patch(self, request):
        user = request.user
        
        try:
            patient_profile = user.patientprofile
        except PatientProfile.DoesNotExist:
            return Response(
                {'error': 'Patient profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Update user fields
        if 'first_name' in request.data:
            user.first_name = request.data['first_name']
        if 'last_name' in request.data:
            user.last_name = request.data['last_name']
        if 'contact_no' in request.data:
            user.contact_no = request.data['contact_no']
        if 'gender' in request.data:
            user.gender = request.data['gender']

        # Update patient profile fields
        if 'blood_group' in request.data:
            patient_profile.blood_group = request.data['blood_group']
        if 'allergies' in request.data:
            patient_profile.allergies = request.data['allergies']
        if 'chronic_diseases' in request.data:
            patient_profile.chronic_diseases = request.data['chronic_diseases']
        if 'height' in request.data:
            patient_profile.height = request.data['height']
        if 'weight' in request.data:
            patient_profile.weight = request.data['weight']
        if 'photo' in request.FILES:
            patient_profile.photo = request.FILES['photo']

        user.save()
        patient_profile.save()

        return Response({
            'success': True,
            'message': 'Settings updated successfully',
            'user': {
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email,
                'contact_no': user.contact_no,
            }
        })


# ---------------------------
# Patient Privacy Settings
# ---------------------------
class PatientPrivacyView(APIView):
    """
    GET: Retrieve privacy preferences.
    PATCH: Update privacy preferences.
    """
    permission_classes = [IsAuthenticated, IsPatientUser]

    def get(self, request):
        user = request.user
        
        # Privacy settings (can be stored in a separate model or user profile)
        privacy_data = {
            'profile_visibility': 'private',  # Can be 'public', 'private', 'friends'
            'show_medical_history': False,
            'allow_doctor_contact': True,
            'allow_notifications': True,
            'data_sharing_consent': False,
            'marketing_emails': False,
        }

        return Response(privacy_data)

    def patch(self, request):
        # Update privacy settings
        updated_settings = {
            'profile_visibility': request.data.get('profile_visibility', 'private'),
            'show_medical_history': request.data.get('show_medical_history', False),
            'allow_doctor_contact': request.data.get('allow_doctor_contact', True),
            'allow_notifications': request.data.get('allow_notifications', True),
            'data_sharing_consent': request.data.get('data_sharing_consent', False),
            'marketing_emails': request.data.get('marketing_emails', False),
        }

        return Response({
            'success': True,
            'message': 'Privacy settings updated successfully',
            'settings': updated_settings
        })


# =====================================================
# MEDICAL REPORTS ENDPOINTS
# =====================================================

# ---------------------------
# Patient Medical Reports List (Comprehensive)
# ---------------------------
class PatientMedicalReportsListView(generics.ListCreateAPIView):
    """
    GET: List all medical reports for the patient with pagination and filtering.
    POST: Upload a new medical report.
    """
    permission_classes = [IsAuthenticated, IsPatientUser]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        try:
            patient_profile = self.request.user.patientprofile
            return MedicalReport.objects.filter(patient=patient_profile).order_by('-created_at')
        except PatientProfile.DoesNotExist:
            return MedicalReport.objects.none()

    def get_serializer_class(self):
        from api.serializers.patient_serializers import SimpleMedicalReportSerializer
        return SimpleMedicalReportSerializer

    def perform_create(self, serializer):
        try:
            patient_profile = self.request.user.patientprofile
        except PatientProfile.DoesNotExist:
            raise serializers.ValidationError("Patient profile not found")
        
        serializer.save(patient=patient_profile)