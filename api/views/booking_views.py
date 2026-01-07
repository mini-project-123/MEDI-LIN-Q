from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404
from api.models import Hospital, DoctorProfile, TimeSlot, Appointment, Notification
from api.serializers.booking_serializers import (
    HospitalSimpleSerializer,
    DoctorSlotSerializer,
    AppointmentBookingSerializer,
    AppointmentDetailSerializer,
)
from datetime import datetime, timedelta


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def hospital_list(request):
    """Get all hospitals for appointment booking"""
    hospitals = Hospital.objects.all()
    serializer = HospitalSimpleSerializer(hospitals, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def hospital_doctors(request, hospital_id=None):
    """Get all doctors in a specific hospital with their time slots"""
    # Support both URL parameter and query parameter
    if hospital_id is None:
        hospital_id = request.query_params.get('hospital_id')
    
    if not hospital_id:
        return Response({'error': 'hospital_id is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        hospital = Hospital.objects.get(id=hospital_id)
    except Hospital.DoesNotExist:
        return Response({'error': 'Hospital not found'}, status=status.HTTP_404_NOT_FOUND)
    
    doctors = hospital.doctors.all().prefetch_related('time_slots')
    
    # Format doctors response
    doctors_data = []
    for doctor in doctors:
        # Get time slots for this doctor
        time_slots_data = []
        for slot in doctor.time_slots.all():
            time_slots_data.append({
                'id': slot.id,
                'day': slot.day,
                'start_time': str(slot.start_time),
                'end_time': str(slot.end_time),
                'is_available': slot.is_available,
            })
        
        doctors_data.append({
            'doctor_id': doctor.user_id,  # Use user_id as the doctor ID
            'id': doctor.user_id,
            'user_id': doctor.user.id,
            'first_name': doctor.user.first_name,
            'last_name': doctor.user.last_name,
            'email': doctor.user.email,
            'specialization': doctor.specialization,
            'qualification': doctor.qualification,
            'experience_years': doctor.experience_years,
            'hospital_name': hospital.name,
            'time_slots': time_slots_data,
        })
    
    return Response(doctors_data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def doctor_slots(request, doctor_id=None):
    """Get available time slots for a doctor"""
    from django.utils import timezone
    
    # Support both URL parameter and query parameter
    if doctor_id is None:
        doctor_id = request.query_params.get('doctor_id')
    
    if not doctor_id:
        return Response({'error': 'doctor_id is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # doctor_id is actually user_id for DoctorProfile
        doctor = DoctorProfile.objects.get(user_id=doctor_id)
    except DoctorProfile.DoesNotExist:
        return Response({'error': 'Doctor not found'}, status=status.HTTP_404_NOT_FOUND)
    
    date_str = request.query_params.get('date')
    
    # Parse the date
    if date_str:
        try:
            appointment_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({'error': 'Invalid date format. Use YYYY-MM-DD'}, status=status.HTTP_400_BAD_REQUEST)
    else:
        appointment_date = datetime.now().date() + timedelta(days=1)  # Default to tomorrow
    
    # Skip weekends
    if appointment_date.weekday() >= 5:
        return Response({
            'doctor_id': doctor.user_id,
            'doctor_name': f"{doctor.user.first_name} {doctor.user.last_name}",
            'specialization': doctor.specialization,
            'hospital': doctor.hospital.name if doctor.hospital else 'N/A',
            'appointment_date': str(appointment_date),
            'available_slots': [],
            'message': 'No slots available on weekends'
        })
    
    # Generate available slots (9 AM to 5 PM, 1 hour each)
    available_slots = []
    for hour in range(9, 17):
        appointment_time = f"{hour:02d}:00:00"
        
        # Check if slot is already booked
        existing_appointment = Appointment.objects.filter(
            doctor=doctor,
            appointment_date=appointment_date,
            appointment_time=appointment_time,
            status__in=['pending', 'confirmed']
        ).exists()
        
        if not existing_appointment:
            available_slots.append({
                'date': str(appointment_date),
                'time': appointment_time,
                'available': True
            })
    
    return Response({
        'doctor_id': doctor.user_id,
        'doctor_name': f"{doctor.user.first_name} {doctor.user.last_name}",
        'specialization': doctor.specialization,
        'hospital': doctor.hospital.name if doctor.hospital else 'N/A',
        'appointment_date': str(appointment_date),
        'available_slots': available_slots,
        'total_slots': len(available_slots)
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def book_appointment(request):
    """Book an appointment"""
    try:
        # Check if user is a patient
        patient = request.user.patientprofile
    except:
        return Response(
            {"error": "Only patients can book appointments"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Get data from request
    hospital_id = request.data.get('hospital_id')
    doctor_id = request.data.get('doctor_id')
    appointment_date = request.data.get('appointment_date')
    appointment_time = request.data.get('appointment_time')
    appointment_type = request.data.get('appointment_type', 'consultation')
    
    # Validate required fields
    if not all([hospital_id, doctor_id, appointment_date, appointment_time]):
        return Response(
            {"error": "Missing required fields"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        hospital = Hospital.objects.get(id=hospital_id)
        # doctor_id is actually user_id for DoctorProfile
        doctor = DoctorProfile.objects.get(user_id=doctor_id)
    except:
        return Response(
            {"error": "Hospital or Doctor not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Check if slot is already booked
    existing = Appointment.objects.filter(
        doctor=doctor,
        hospital=hospital,
        appointment_date=appointment_date,
        appointment_time=appointment_time,
        status__in=['pending', 'confirmed']
    ).exists()
    
    if existing:
        return Response(
            {"error": "This time slot is already booked"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Create appointment
    try:
        appointment = Appointment.objects.create(
            patient=patient,
            doctor=doctor,
            hospital=hospital,
            appointment_date=appointment_date,
            appointment_time=appointment_time,
            appointment_type=appointment_type,
            status='confirmed'
        )
        
        # Create notification for patient
        Notification.objects.create(
            user=request.user,
            title="Appointment Confirmed",
            message=f"Your appointment with Dr. {doctor.user.first_name} {doctor.user.last_name} "
                    f"on {appointment_date} at {appointment_time} is confirmed.",
        )
        
        # Create notification for doctor
        Notification.objects.create(
            user=doctor.user,
            title="New Appointment",
            message=f"You have a new appointment with {patient.user.first_name} {patient.user.last_name} "
                    f"on {appointment_date} at {appointment_time}.",
        )
        
        response_serializer = AppointmentDetailSerializer(appointment)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        return Response(
            {"error": f"Failed to book appointment: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def patient_appointments(request):
    """Get appointments for patient"""
    try:
        patient = request.user.patientprofile
    except:
        return Response(
            {"error": "User is not a patient"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    appointments = Appointment.objects.filter(patient=patient).order_by('-appointment_date')
    serializer = AppointmentDetailSerializer(appointments, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def doctor_appointments(request):
    """Get appointments for doctor"""
    try:
        doctor = request.user.doctorprofile
    except:
        return Response(
            {"error": "User is not a doctor"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    appointments = Appointment.objects.filter(doctor=doctor).order_by('-appointment_date')
    serializer = AppointmentDetailSerializer(appointments, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_appointment(request, appointment_id):
    """Cancel an appointment"""
    appointment = get_object_or_404(Appointment, id=appointment_id)
    
    # Check if user is the patient or doctor
    try:
        patient = request.user.patientprofile
        if appointment.patient != patient:
            return Response(
                {"error": "You can only cancel your own appointments"},
                status=status.HTTP_403_FORBIDDEN
            )
    except:
        try:
            doctor = request.user.doctorprofile
            if appointment.doctor != doctor:
                return Response(
                    {"error": "You can only cancel your assigned appointments"},
                    status=status.HTTP_403_FORBIDDEN
                )
        except:
            return Response(
                {"error": "You don't have permission to cancel this appointment"},
                status=status.HTTP_403_FORBIDDEN
            )
    
    appointment.status = 'cancelled'
    appointment.save()
    
    # Create notification
    Notification.objects.create(
        user=appointment.patient.user,
        title="Appointment Cancelled",
        message=f"Your appointment on {appointment.appointment_date} has been cancelled.",
    )
    
    return Response({"message": "Appointment cancelled successfully"})
