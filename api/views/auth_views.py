from rest_framework import generics, permissions
from rest_framework_simplejwt.views import TokenObtainPairView

from api.serializers.auth_serializers import (
    UserCreationSerializer, 
    MyTokenObtainPairSerializer
)

class UserCreationView(generics.CreateAPIView):
    """
    API view for the first step of user registration.
    Accepts role, email, and password to create a basic user account.
    """
    serializer_class = UserCreationSerializer
    permission_classes = [permissions.AllowAny]

class MyTokenObtainPairView(TokenObtainPairView):
    """
    Custom view for token creation that uses our custom serializer
    to add the 'profile_complete' and 'role' flags to the token.
    """
    serializer_class = MyTokenObtainPairSerializer