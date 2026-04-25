from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, WalkerProfileViewSet, OwnerProfileViewSet

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'walker-profiles', WalkerProfileViewSet)
router.register(r'owner-profiles', OwnerProfileViewSet)

urlpatterns = [
    path('', include(router.urls)),
]