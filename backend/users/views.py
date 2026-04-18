from rest_framework import viewsets
from .models import User, WalkerProfile, OwnerProfile
from .serializers import UserSerializer, WalkerProfileSerializer, OwnerProfileSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class WalkerProfileViewSet(viewsets.ModelViewSet):
    queryset = WalkerProfile.objects.all()
    serializer_class = WalkerProfileSerializer

class OwnerProfileViewSet(viewsets.ModelViewSet):
    queryset = OwnerProfile.objects.all()
    serializer_class = OwnerProfileSerializer
