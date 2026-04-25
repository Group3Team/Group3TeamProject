from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WalkViewSet

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'walks', WalkViewSet)

urlpatterns = [
    path('', include(router.urls)),
]