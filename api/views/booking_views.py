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
def hospital_doctors(request, hospital_id):
    """Get all doctors in a specific hospital"""
    hospital = get_object_or_404(Hospital, id=hospital_id)
    doctors = hospital.doctors.all()
    serializer = DoctorSlotSerializer(doctors, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def doctor_slots(request, doctor_id):
    """Get available time slots for a doctor"""
    doctor = get_object_or_404(DoctorProfile, id=doctor_id)
    serializer = DoctorSlotSerializer(doctor)
    return Response(serializer.data)


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
    
    serializer = AppointmentBookingSerializer(data=request.data, context={'request': request})
    
    if serializer.is_valid():
        appointment = serializer.save()
        
        # Create notification for patient
        Notification.objects.create(
            user=request.user,
            title="Appointment Confirmed",
            message=f"Your appointment with Dr. {appointment.doctor.user.first_name} {appointment.doctor.user.last_name} "
                    f"on {appointment.appointment_date} at {appointment.appointment_time} is confirmed.",
        )
        
        # Create notification for doctor
        Notification.objects.create(
            user=appointment.doctor.user,
            title="New Appointment",
            message=f"You have a new appointment with {patient.user.first_name} {patient.user.last_name} "
                    f"on {appointment.appointment_date} at {appointment.appointment_time}.",
        )
        
        response_serializer = AppointmentDetailSerializer(appointment)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
