# backend/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from users.views import UserViewSet, WalkerProfileViewSet, OwnerProfileViewSet
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
]