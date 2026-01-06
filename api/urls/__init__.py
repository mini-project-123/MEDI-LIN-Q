from django.urls import path, include

urlpatterns = [
    path('', include('api.urls.auth_urls')),
    path('', include('api.urls.patient_urls')),
    path('', include('api.urls.doctor_urls')),
    path('', include('api.urls.hospital_urls')),
    path('', include('api.urls.article_urls')),
    path('', include('api.urls.prescription_urls')),
    path('', include('api.urls.notification_urls')),
    path('booking/', include('api.urls.booking_urls')),
]