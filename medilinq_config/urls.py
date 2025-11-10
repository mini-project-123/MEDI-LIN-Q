# medilinq_config/urls.py (Your updated file)

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

# 1. REMOVE these imports completely.
# We only want to use the auth views defined in your 'api' app.
#
# from rest_framework_simplejwt.views import (
#     TokenObtainPairView,
#     TokenRefreshView,
# )

urlpatterns = [
    # 1. Django Admin (Default)
    path("admin/", admin.site.urls),

    # 2. REMOVE BOTH default token paths.
    # Your 'api.urls' file already handles /api/login/ and /api/login/refresh/
    #
    # path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    # path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # 3. Your Application API
    # This single line correctly includes all your app's URLs,
    # including the correct authentication URLs.
    path("api/", include("api.urls")),
]

# 4. Media File Serving (For Development Only)
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)