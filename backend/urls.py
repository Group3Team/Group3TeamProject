"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from users.views import UserViewSet, WalkerProfileViewSet, OwnerProfileViewSet
from walks.views import WalkRequestViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'walkers', WalkerProfileViewSet)
router.register(r'owners', OwnerProfileViewSet)
router.register(r'walks', WalkRequestViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]
