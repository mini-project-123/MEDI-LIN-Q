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
        fields = ['user', 'specialization', 'photo'] # You can add 'photo' here too

class ArticleSerializer(serializers.ModelSerializer):
    """
    The main serializer for an Article.
    It lists articles (GET) and also handles creating new ones (POST).
    """
    author = ArticleAuthorSerializer(read_only=True) # Nests the author's details

    class Meta:
        model = Article
        fields = [
            'id', 
            'title', 
            'content', 
            'status', 
            'created_at', 
            'author'
        ]
        # We make 'content' write-only for the list view to keep it small,
        # but readable for a detail view (which we can add later).
        # Or, for simplicity, we can keep it readable. Let's keep it simple for now.
        
        # 'status' and 'author' should not be set by the user on creation,
        # so we make them read-only in the serializer.
        read_only_fields = ['status', 'author', 'created_at']