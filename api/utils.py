from .models import Notification

def create_notification(user, message, link=None):
    """
    Helper function to create a new notification.
    """
    try:
        Notification.objects.create(
            user=user,
            message=message,
            link=link
        )
    except Exception as e:
        # Log the error, but don't crash the main request
        print(f"Error creating notification for user {user.id}: {e}")