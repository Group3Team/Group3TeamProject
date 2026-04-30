# backend/urls.py
from django.urls import path, include
from django.contrib import admin
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from users.views import UserViewSet, WalkerProfileViewSet, OwnerProfileViewSet, register
from walks.views import DogViewSet, WalkRequestViewSet
from messaging.views import MessageViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'walker-profiles', WalkerProfileViewSet)
router.register(r'owner-profiles', OwnerProfileViewSet)
router.register(r'walk-requests', WalkRequestViewSet) # Matches frontend
router.register(r'dogs', DogViewSet)                  # Matches frontend
router.register(r'messages', MessageViewSet)          # Moved to root for simplicity, or keep under /messaging/ and update frontend

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/auth/register/', register),
    path('api/auth/token/', TokenObtainPairView.as_view()),
    path('api/auth/token/refresh/', TokenRefreshView.as_view()),
    path('api/weather-note/', include('weather.urls')),
    path('api/messages/', include('messaging.urls')),
]
