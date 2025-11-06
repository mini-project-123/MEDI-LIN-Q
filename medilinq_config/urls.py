# medilinq_config/urls.py (Your updated file)

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    # 1. Django Admin (Default)
    path("admin/", admin.site.urls),

    # 2. JWT Token Endpoints (For Login)
    # Your React app will send login requests here
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # 3. Your Application API
    # This tells Django to look in your 'api' app's urls.py file
    # for all other API endpoints (like patients, doctors, appointments)
    path("api/", include("api.urls")),
]

# 4. Media File Serving (For Development Only)
# This is necessary to see uploaded files (like profile pictures)
# when DEBUG = True in settings.py
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)