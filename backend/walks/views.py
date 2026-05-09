# walks/views.py
from rest_framework import viewsets, permissions
from django.db.models import Q
from .models import Dog, WalkRequest
from .serializers import DogSerializer, WalkRequestSerializer

class DogViewSet(viewsets.ModelViewSet):
    queryset = Dog.objects.all()
    serializer_class = DogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Dog.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class WalkRequestViewSet(viewsets.ModelViewSet):
    serializer_class = WalkRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = WalkRequest.objects.all()

    def get_queryset(self):
        # Allow users to see their own requests, requests they are walking, or any unassigned SEARCHING requests
        return WalkRequest.objects.filter(
            Q(owner=self.request.user) | Q(walker=self.request.user) | Q(status='SEARCHING')
        )

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def perform_update(self, serializer):
        # If transitioning to ACCEPTED, assign the current user as the walker
        if serializer.validated_data.get('status') == 'ACCEPTED' and not serializer.instance.walker:
            serializer.save(walker=self.request.user)
        else:
            serializer.save()
