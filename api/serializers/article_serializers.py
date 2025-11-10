# api/serializers/article_serializers.py

from rest_framework import serializers
from api.models import Article, DoctorProfile, User

class ArticleAuthorUserSerializer(serializers.ModelSerializer):
    """
    Serializes the basic User info for the author.
    """
    class Meta:
        model = User
        fields = ['first_name', 'last_name']

class ArticleAuthorSerializer(serializers.ModelSerializer):
    """
    Serializes the Doctor's profile info for the article.
    """
    user = ArticleAuthorUserSerializer(read_only=True)
    
    class Meta:
        model = DoctorProfile
        fields = ['user', 'specialization', 'photo'] 

class ArticleSerializer(serializers.ModelSerializer):
    """
    The main serializer for an Article.
    It lists articles (GET) and also handles creating new ones (POST).
    """
    # --- FIX 1: Allow author to be null ---
    author = ArticleAuthorSerializer(read_only=True, allow_null=True) 

    class Meta:
        model = Article
        # --- FIX 2: Changed 'status' to 'is_published' to match models.py ---
        fields = [
            'id', 
            'title', 
            'content', 
            'is_published', # <-- This field must match the model
            'created_at', 
            'author'
        ]
        # --- FIX 3: Changed 'status' to 'is_published' ---
        read_only_fields = ['is_published', 'author', 'created_at']