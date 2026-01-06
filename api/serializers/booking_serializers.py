from rest_framework import serializers
from api.models import Hospital, DoctorProfile, TimeSlot, Appointment, User


class HospitalSimpleSerializer(serializers.ModelSerializer):
    """Simple hospital listing for booking"""
    doctors_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Hospital
        fields = ['id', 'name', 'email', 'contact_no1', 'address', 'operating_hours', 'doctors_count']
    
    def get_doctors_count(self, obj):
        return obj.doctors.count()


class TimeSlotSerializer(serializers.ModelSerializer):
    """Time slot for doctor availability"""
    class Meta:
        model = TimeSlot
        fields = ['id', 'day', 'start_time', 'end_time', 'is_available']


class DoctorSlotSerializer(serializers.ModelSerializer):
    """Doctor with available time slots"""
    user = serializers.SerializerMethodField()
    hospital_name = serializers.CharField(source='hospital.name', read_only=True)
    time_slots = TimeSlotSerializer(many=True, read_only=True)
    doctor_id = serializers.SerializerMethodField()
    
    class Meta:
        model = DoctorProfile
        fields = ['doctor_id', 'user', 'specialization', 'qualification', 'experience_years', 'hospital_name', 'time_slots']
    
    def get_doctor_id(self, obj):
        return obj.user.id
    
    def get_user(self, obj):
        return {
            'first_name': obj.user.first_name,
            'last_name': obj.user.last_name,
            'email': obj.user.email,
        }


class AppointmentBookingSerializer(serializers.ModelSerializer):
    """Serializer for booking appointments"""
    doctor_id = serializers.IntegerField(write_only=True)
    hospital_id = serializers.IntegerField(write_only=True)
    appointment_date = serializers.DateField()
    appointment_time = serializers.TimeField()
    reason = serializers.CharField(required=True)
    
    class Meta:
        model = Appointment
        fields = ['doctor_id', 'hospital_id', 'appointment_date', 'appointment_time', 'appointment_type', 'reason']
    
    def create(self, validated_data):
        patient = self.context['request'].user.patientprofile
        doctor_id = validated_data.pop('doctor_id')
        hospital_id = validated_data.pop('hospital_id')
        
        # DoctorProfile uses user_id as primary key
        doctor = DoctorProfile.objects.get(user_id=doctor_id)
        hospital = Hospital.objects.get(id=hospital_id)
        
        appointment = Appointment.objects.create(
            patient=patient,
            doctor=doctor,
            hospital=hospital,
            **validated_data
        )
        return appointment


class AppointmentDetailSerializer(serializers.ModelSerializer):
    """Detailed appointment information"""
    doctor = serializers.SerializerMethodField()
    hospital = serializers.SerializerMethodField()
    
    class Meta:
        model = Appointment
        fields = ['id', 'custom_id', 'doctor', 'hospital', 'appointment_date', 'appointment_time', 
                  'appointment_type', 'reason', 'status', 'token_number', 'created_at']
    
    def get_doctor(self, obj):
        return {
            'id': obj.doctor.user.id,  # DoctorProfile uses user_id as PK
            'name': f"{obj.doctor.user.first_name} {obj.doctor.user.last_name}",
            'specialization': obj.doctor.specialization,
        }
    
    def get_hospital(self, obj):
        return {
            'id': obj.hospital.id,
            'name': obj.hospital.name,
            'contact': obj.hospital.contact_no1,
        }
