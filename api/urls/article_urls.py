from django.urls import path
from api.views.article_views import ArticleListCreateView, ArticleDeleteView

urlpatterns = [
  path('articles/', ArticleListCreateView.as_view(), name='article-list-create'),
  path('articles/<int:pk>/', ArticleDeleteView.as_view(), name='article-detail-delete'),
]