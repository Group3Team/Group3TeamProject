# walks/views.py - Allow unauthenticated users to GET and POST (search & create requests)
from rest_framework.decorators import api_view, csrf_exempt
from rest_framework import viewsets, permissions
from django.db.models import Q
from .models import Dog, WalkRequest
from .serializers import DogSerializer, WalkRequestSerializer

@csrf_exempt
class CustomWalkRequestViewSet(viewsets.ModelViewSet):
    """Allow unauthenticated users to GET (browse) and POST (create requests), auth required for updates"""
    
    permission_classes = [permissions.AllowAny]  # Allow all methods initially
    
    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            return WalkRequest.objects.filter(
                Q(owner=user) | Q(walker=user)
            )
        # Return all requests when anonymous (for browsing/searching)
        return WalkRequest.objects.all()

class DogViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Dog.objects.all()
    serializer_class = DogSerializer
    
    def get_queryset(self):
        return Dog.objects.filter(owner=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

