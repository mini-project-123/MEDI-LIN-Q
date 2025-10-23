from rest_framework import generics, permissions
from api.serializers.doctor_serializers import DoctorProfileSerializer
from api.permissions import IsDoctorUser

class DoctorProfileView(generics.CreateAPIView):
    
    serializer_class = DoctorProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsDoctorUser]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# All future doctor dashboard views (like listing appointments) will go here.