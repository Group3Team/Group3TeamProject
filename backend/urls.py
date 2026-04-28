# backend/urls.py
from django.urls import path, include
from django.contrib import admin
from rest_framework.routers import DefaultRouter
from users.views import UserViewSet, WalkerProfileViewSet, OwnerProfileViewSet
from walks.views import DogViewSet, CustomWalkRequestViewSet
from messaging.views import MessageViewSet

# Create router and register viewsets
router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'walker-profiles', WalkerProfileViewSet)
router.register(r'owner-profiles', OwnerProfileViewSet)
router.register(r'walk-requests', CustomWalkRequestViewSet)  # Matches frontend
router.register(r'dogs', DogViewSet)                   # Matches frontend
router.register(r'messages', MessageViewSet)           # Messages at /api/messages/

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),                # All router endpoints under /api/
    path('api/weather-note/', include('weather.urls')), # Weather endpoint
    # REMOVED duplicate: path('api/messages/', include('messaging.urls')),
    # Messages are now served via the router above at /api/messages/
]