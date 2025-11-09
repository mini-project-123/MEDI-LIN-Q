from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from api.models import User
from django.db import transaction

class UserCreationSerializer(serializers.ModelSerializer):
    """
    Handles creation of a User with first name, last name, email, password, and role.
    """
    password2 = serializers.CharField(style={'input_type': 'password'}, write_only=True)

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'role', 'password', 'password2']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate(self, data):
        password = data.get('password')
        password2 = data.get('password2')

        if password != password2:
            raise serializers.ValidationError({"password": "Passwords must match."})

        if User.objects.filter(email=data.get('email')).exists():
            raise serializers.ValidationError({"email": "A user with that email already exists."})

        return data

    def create(self, validated_data):
        first_name = validated_data.get('first_name')
        last_name = validated_data.get('last_name')
        email = validated_data.get('email')
        password = validated_data.get('password')
        role = validated_data.get('role')

        user = User.objects.create_user(
            username=email,       # Email is used as login username
            email=email,
            password=password,
            role=role,
            first_name=first_name,
            last_name=last_name
        )
        return user


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Adds 'profile_complete' and 'role' to JWT payload.
    """
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        profile_complete = False
        if user.role == 'patient':
            profile_complete = hasattr(user, 'patientprofile')
        elif user.role == 'doctor':
            profile_complete = hasattr(user, 'doctorprofile')
        elif user.role == 'hospital_admin':
            profile_complete = user.hospitals_administered.exists()

        token['profile_complete'] = profile_complete
        token['role'] = user.role

        return token
