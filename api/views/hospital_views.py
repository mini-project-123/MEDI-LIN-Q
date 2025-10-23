from rest_framework import generics, permissions
from api.serializers.hospital_serializers import HospitalSerializer
from api.permissions import IsHospitalAdminUser

class HospitalCreationView(generics.CreateAPIView):
    serializer_class = HospitalSerializer
    permission_classes = [permissions.IsAuthenticated, IsHospitalAdminUser]

    def perform_create(self, serializer):
        hospital = serializer.save()
        hospital.admins.add(self.request.user)

# All future hospital dashboard views (like managing appointments) will go here.