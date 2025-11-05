# api/views/article_views.py

from rest_framework import generics, permissions
from api.models import Article
from api.serializers.article_serializers import ArticleSerializer
from api.permissions import IsDoctorUser # Import our existing permission

class ArticleListCreateView(generics.ListCreateAPIView):
    """
    A view that handles:
    - GET: Listing all 'published' articles (for any user).
    - POST: Creating a new 'draft' article (for doctors only).
    """
    serializer_class = ArticleSerializer

    def get_queryset(self):
        """
        This method controls the list (GET) functionality.
        It only returns articles with a status of 'published'.
        """
        return Article.objects.filter(status='published').order_by('-created_at')

    def get_permissions(self):
        """
        This method assigns different permissions based on the request.
        - GET requests (listing) are public (AllowAny).
        - POST requests (creating) are for doctors only (IsDoctorUser).
        """
        if self.request.method == 'POST':
            # Only authenticated doctors can create articles
            return [permissions.IsAuthenticated(), IsDoctorUser()]
        
        # Anyone can view the list of articles
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        """
        This method is called when a POST request is successful.
        It automatically sets the author to the logged-in doctor
        and the status to 'draft' (for review, or we can set to 'published').
        """
        # We'll set it to 'published' immediately for simplicity.
        serializer.save(
            author=self.request.user.doctorprofile,
            status='published' 
        )