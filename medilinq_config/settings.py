"""
Django settings for medilinq_config project.
"""

from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = "django-insecure-(!^&&_yfj)t5#z)0rozr6fe0umbd*6(ab*vg9k@u*u#g@r**vo"

DEBUG = True

ALLOWED_HOSTS = []


INSTALLED_APPS = [
    # Django apps
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Your app
    "api",

    # Third party
    "rest_framework",
    "rest_framework_simplejwt",
    "django_filters",
    "corsheaders",
]


MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",  # must be before CommonMiddleware
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]


ROOT_URLCONF = "medilinq_config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "medilinq_config.wsgi.application"


DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": "medilinq_db",
        "USER": "postgres",
<<<<<<< HEAD
        "PASSWORD": "Ashu@0609",
=======
        "PASSWORD": "shreyaF2006*",   # your correct DB password
>>>>>>> 614477cf38751a12c5c45ccaaa3f59893a3cbd70
        "HOST": "localhost",
        "PORT": "5432",
    }
}


AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",},
]


LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True


STATIC_URL = "/static/"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"


DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
}


AUTH_USER_MODEL = "api.User"


GOOGLE_API_KEY = "AIzaSyBinnnxNVU8AZ-m2lvlsf7B87RRWJjJItU"


# Allow all origins for development (React frontend etc.)
CORS_ALLOW_ALL_ORIGINS = True
