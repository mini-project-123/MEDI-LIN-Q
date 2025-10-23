from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from api.models import User
from django.db import transaction

class UserCreationSerializer(serializers.ModelSerializer):
    """
    Serializer for the first step of user registration.
    Handles creation of a User with just email, password, and role.
    """
    password2 = serializers.CharField(style={'input_type': 'password'}, write_only=True)

    class Meta:
        model = User
        fields = ['email', 'role', 'password', 'password2']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate(self, data):
        """
        This method is automatically called by DRF to perform custom validation.
        """
        password = data.get('password')
        password2 = data.get('password2')

        # Check if the two password fields match
        if password != password2:
            raise serializers.ValidationError({"password": "Passwords must match."})
        
        # Check if a user with this email already exists
        if User.objects.filter(email=data.get('email')).exists():
            raise serializers.ValidationError({"email": "A user with that email already exists."})

        return data

    def create(self, validated_data):
        """
        This method creates and returns a new user instance.
        """
        email = validated_data.get('email')
        password = validated_data.get('password')
        role = validated_data.get('role')

        # We set the 'username' to be the same as the 'email' for simplicity
        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            role=role
        )
        return user


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    This custom serializer adds 'profile_complete' and 'role' flags
    to the token payload.
    """
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims to the token
        profile_complete = False
        if user.role == 'patient':
            profile_complete = hasattr(user, 'patientprofile')
        elif user.role == 'doctor':
            profile_complete = hasattr(user, 'doctorprofile')
        elif user.role == 'hospital_admin':
            # Check if the admin is linked to any hospital
            profile_complete = user.hospitals_administered.exists()
            
        token['profile_complete'] = profile_complete
        token['role'] = user.role

        return token