from rest_framework import generics, permissions
from api.models import Notification
from api.serializers.notification_serializers import NotificationSerializer # We'll create this next

class NotificationListView(generics.ListAPIView):
    """
    Provides a list of unread notifications for the currently logged-in user.
    """
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        This method filters notifications for the logged-in user
        and only returns the unread ones.
        """
        user = self.request.user
        # We'll also add a 'read' query param to get read messages
        is_read = self.request.query_params.get('read', 'false').lower() == 'true'
        
        return Notification.objects.filter(user=user, is_read=is_read)