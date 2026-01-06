# api/views/article_views.py

from rest_framework import generics, permissions
from api.models import Article, DoctorProfile
from api.serializers.article_serializers import ArticleSerializer
from api.permissions import IsDoctorOrHospitalAdmin # Import our updated permission

class ArticleListCreateView(generics.ListCreateAPIView):
    """
    A view that handles:
    - GET: Listing all 'published' articles (for any user).
    - POST: Creating a new article (for doctors and hospital admins).
    """
    serializer_class = ArticleSerializer

    def get_queryset(self):
        """
        This method controls the list (GET) functionality.
        It only returns articles with a status of 'published'.
        """
        return Article.objects.filter(is_published=True).order_by('-created_at')

    def get_permissions(self):
        """
        This method assigns different permissions based on the request.
        - GET requests (listing) are public (AllowAny).
        - POST requests (creating) are for doctors and hospital admins.
        """
        if self.request.method == 'POST':
            # Only authenticated doctors and hospital admins can create articles
            return [permissions.IsAuthenticated(), IsDoctorOrHospitalAdmin()]
        
        # Anyone can view the list of articles
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        """
        This method is called when a POST request is successful.
        It automatically sets the author based on the user's role.
        """
        user = self.request.user
        
        # If user is a doctor, use their DoctorProfile
        # If user is a hospital admin, create a temporary DoctorProfile or use None
        if user.role == 'doctor':
            doctor_profile = DoctorProfile.objects.get(user=user)
            serializer.save(author=doctor_profile, is_published=True)
        elif user.role == 'hospital_admin':
            # For hospital admins, we need to handle this specially
            # Option 1: Create an associated doctor profile (if doesn't exist)
            # Option 2: Allow NULL author (if Article model permits)
            # Let's try to get or create a doctor profile for the hospital admin
            doctor_profile, created = DoctorProfile.objects.get_or_create(
                user=user,
                defaults={
                    'hospital': user.hospital_admin.hospital if hasattr(user, 'hospital_admin') else None,
                    'specialization': 'Administration',
                    'qualification': 'Hospital Administrator',
                    'experience_years': 0
                }
            )
            serializer.save(author=doctor_profile, is_published=True)


class ArticleDeleteView(generics.DestroyAPIView):
    """
    A view that handles:
    - DELETE: Deleting an article (for the article's author only).
    """
    serializer_class = ArticleSerializer
    permission_classes = [permissions.IsAuthenticated, IsDoctorOrHospitalAdmin]

    def get_queryset(self):
        """
        Only allow deletion of articles authored by the logged-in user.
        """
        user = self.request.user
        
        if user.role == 'doctor':
            doctor_profile = DoctorProfile.objects.get(user=user)
            return Article.objects.filter(author=doctor_profile)
        elif user.role == 'hospital_admin':
            # Hospital admins can delete articles they created
            doctor_profile = DoctorProfile.objects.filter(user=user).first()
            if doctor_profile:
                return Article.objects.filter(author=doctor_profile)
            return Article.objects.none()
        
        return Article.objects.none()
