# api/urls/notification_urls.py
from django.urls import path
from api.views.notification_views import NotificationListView

urlpatterns = [
    path('notifications/', NotificationListView.as_view(), name='notification-list'),
]