from rest_framework import serializers
# --- 1. IMPORT THE HOSPITAL MODEL ---
from api.models import DoctorProfile, User, PatientProfile, Appointment, Hospital

# --- 2. PROFILE CREATION SERIALIZER ---
# Used for the "Step 2" registration form
class DoctorProfileSerializer(serializers.ModelSerializer):
    
    # --- 3. ADD USER INFORMATION ---
    user = serializers.SerializerMethodField()
    hospital_name = serializers.CharField(source='hospital.name', read_only=True)
    
    # --- 4. THIS IS THE FIX ---
    # This field tells Django to accept a numeric Primary Key (like 40)
    # for the 'hospital' field.
    hospital = serializers.PrimaryKeyRelatedField(
        queryset=Hospital.objects.all()
    )
    
    def get_user(self, obj):
        """Return user information"""
        return {
            'id': obj.user.id,
            'username': obj.user.username,
            'first_name': obj.user.first_name,
            'last_name': obj.user.last_name,
            'email': obj.user.email,
            'contact_no': obj.user.contact_no,
            'custom_id': obj.user.custom_id
        }
    
    class Meta:
        model = DoctorProfile
        # All fields from your drawing are included here
        fields = [
            'user',
            'specialization', 
            'qualification', 
            'experience_years', 
            'available_days', 
            'languages_spoken', 
            'hospital', 
            'hospital_name',
            'photo'
        ]


# --- 4. RE-USABLE NESTED SERIALIZERS ---
# (These are unchanged)

class SimplePatientUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'custom_id']
        read_only = True

class SimplePatientProfileSerializer(serializers.ModelSerializer):
    user = SimplePatientUserSerializer(read_only=True)
    class Meta:
        model = PatientProfile
        fields = ['user']
        read_only = True

# --- 5. DASHBOARD SUMMARY SERIALIZER ---
# (These are unchanged)

class NextAppointmentSerializer(serializers.ModelSerializer):
    patient = SimplePatientProfileSerializer(read_only=True)
    class Meta:
        model = Appointment
        fields = ['id', 'patient', 'appointment_date', 'appointment_time']
        read_only_fields = ['id', 'patient', 'appointment_date', 'appointment_time']

# --- 6. "MY APPOINTMENTS" PAGE SERIALIZER ---
# (These are unchanged)

class DoctorAppointmentSerializer(serializers.ModelSerializer):
    patient = SimplePatientProfileSerializer(read_only=True)
    class Meta:
        model = Appointment
        fields = [
            'id',
            'custom_id',
            'patient',
            'appointment_date',
            'appointment_time',
            'status',
            'token_number'
        ]
        read_only_fields = ['id', 'custom_id', 'patient', 'appointment_date', 'appointment_time', 'status', 'token_number']