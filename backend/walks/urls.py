from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CustomWalkRequestViewSet as WalkRequestViewSet

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'walk-requests', WalkRequestViewSet)

urlpatterns = [
    path('', include(router.urls)),
]