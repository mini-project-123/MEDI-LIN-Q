# api/serializers/patient_serializers.py

from rest_framework import serializers
from api.models import User, PatientProfile, Appointment, MedicalReport, Prescription, Medication

# --- Re-usable Serializer for User ---
class SimplePatientUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'custom_id', 'gender', 'email', 'contact_no']
        read_only = True

# --- Serializer for Patient List View ---
class PatientListSerializer(serializers.ModelSerializer):
    user = SimplePatientUserSerializer(read_only=True)
    age = serializers.IntegerField(source='user.age', read_only=True)

    class Meta:
        model = PatientProfile
        fields = ['user', 'age']
        read_only = True

# --- Serializers for Detail View ---
class SimpleAppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ['id', 'custom_id', 'appointment_datetime', 'status']
        read_only = True

class SimpleMedicalReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalReport
        fields = ['id', 'report_type', 'description', 'report_file', 'created_at']
        read_only = True

# --- Serializers for Prescriptions ---
class SimpleMedicationSerializer(serializers.ModelSerializer):
    """ Basic info about the medication """
    class Meta:
        model = Medication
        fields = ['name']
        read_only = True
        
class SimplePatientProfileSerializer(serializers.ModelSerializer):
    """
    Reusable serializer for basic Patient Profile, nests the User info.
    (This is needed for the prescription serializer below)
    """
    user = SimplePatientUserSerializer(read_only=True) # Nest the User serializer
    class Meta:
        model = PatientProfile
        fields = ['user'] # 'user' is the primary key link
        read_only = True

class SimplePrescriptionSerializer(serializers.ModelSerializer):
    """ Formats prescription details for the patient history """
    medication = SimpleMedicationSerializer(read_only=True) # Nest medication name
    prescription_date = serializers.SerializerMethodField()
    
    # --- THIS IS THE FIX ---
    # We add this line to include the patient's details on each prescription.
    # The 'source' tells the serializer to find the 'appointment' on the prescription,
    # and then find the 'patient' linked to that appointment.
    patient = SimplePatientProfileSerializer(source='appointment.patient', read_only=True)
    # --- END OF FIX ---
    
    class Meta:
        model = Prescription
        # Add 'patient' to the fields list
        fields = ['id', 'patient', 'medication', 'dosage', 'frequency', 'duration', 'notes', 'prescription_date']
        read_only = True

    def get_prescription_date(self, obj):
        # 'obj' is the Prescription instance
        if obj.appointment:
            # We can safely call the .date() method here
            return obj.appointment.appointment_datetime.date()
        return None


# --- Main Serializer for Patient Detail View ---
class PatientDetailSerializer(serializers.ModelSerializer):
    user = SimplePatientUserSerializer(read_only=True)
    age = serializers.IntegerField(source='user.age', read_only=True)
    appointments = SimpleAppointmentSerializer(many=True, read_only=True)
    medical_reports = SimpleMedicalReportSerializer(many=True, read_only=True)
    # Prescriptions will be added manually in the view

    class Meta:
        model = PatientProfile
        fields = [
            'user',
            'age',
            'blood_group',
            'emergency_contact_no',
            'emergency_contact_relation',
            'allergies',
            'photo',
            'appointments',
            'medical_reports',
        ]
        read_only = True


# --- Serializer for Patient Profile Creation/Update (Step 2 Reg) ---
class PatientProfileSerializer(serializers.ModelSerializer):
    """ Serializer used when a Patient *creates* their profile """
    class Meta:
        model = PatientProfile
        # Fields the patient submits when creating profile
        fields = [
            'blood_group',
            'emergency_contact_no',
            'emergency_contact_relation',
            'allergies',
            'photo'
        ]
        # 'user' field is handled automatically in the corresponding view


class PrescriptionCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for validating and creating a new prescription.
    """
    # We use PrimaryKeyRelatedField to accept the integer ID
    # for the appointment and medication from the frontend.
    appointment = serializers.PrimaryKeyRelatedField(queryset=Appointment.objects.all())
    medication = serializers.PrimaryKeyRelatedField(queryset=Medication.objects.all())

    # This is our special "check only" flag.
    # It's 'write_only' because we don't save it to the database.
    # 'required=False' means it can be left out (we'll default it to 'False').
    dry_run = serializers.BooleanField(write_only=True, required=False, default=False)

    class Meta:
        model = Prescription
        # These are the fields the frontend will send
        fields = [
            'appointment',
            'medication',
            'dosage',
            'frequency',
            'duration',
            'notes',
            'dry_run' # Our special flag
        ]