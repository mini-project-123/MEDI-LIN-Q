from rest_framework import generics, permissions
from api.serializers.patient_serializers import PatientProfileSerializer
from api.permissions import IsPatientUser

class PatientProfileView(generics.CreateAPIView):

    serializer_class = PatientProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsPatientUser]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)